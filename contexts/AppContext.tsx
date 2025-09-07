import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, DiaryEntry, AppSettings, Theme } from '../types';
import { deriveKeyFromMnemonic, encryptData, decryptData, hashPin } from '../services/cryptoService';
import { ENCRYPTED_STORAGE_KEY } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';

const defaultSettings: AppSettings = {
    theme: 'dark',
    userName: 'Explorer',
    wallpaper: null,
    pin: null,
};

const initialState: AppState = {
    isAuthenticated: false,
    isLocked: true,
    encryptionKey: null,
    entries: [],
    settings: defaultSettings,
    activeDraft: null,
    isAnalyzing: false,
    analysisResult: null,
    analysisError: null,
    isSuggestingTags: false,
    tagSuggestionError: null,
};

interface AppContextType extends AppState {
    login: (mnemonic: string) => Promise<boolean>;
    logout: () => void;
    lock: () => void;
    unlock: (pin: string) => Promise<boolean>;
    setPin: (pin: string) => Promise<void>;
    addEntry: (entry: DiaryEntry) => Promise<void>;
    updateEntry: (entry: DiaryEntry) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
    setTheme: (theme: Theme) => void;
    setActiveDraft: (draft: DiaryEntry | null) => void;
    analyzeEntry: (entry: DiaryEntry) => Promise<void>;
    clearAnalysis: () => void;
    suggestTags: (entry: Pick<DiaryEntry, 'title' | 'content'>) => Promise<string[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// A placeholder API key is used here. For a real application, this should be handled securely.
const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(initialState);
    
    useEffect(() => {
        const rehydrateAuth = async () => {
            const storedMnemonic = sessionStorage.getItem('diaryMnemonic');
            if (storedMnemonic) {
                // Silently log in to re-derive key and load data
                await login(storedMnemonic, true);
            }
        };
        rehydrateAuth();
    }, []);

    const saveData = useCallback(async (data: { entries: DiaryEntry[], settings: AppSettings }) => {
        if (!state.encryptionKey) {
             console.error("Save failed: Encryption key is missing.");
             return;
        };
        try {
            const encryptedData = await encryptData(data, state.encryptionKey);
            localStorage.setItem(ENCRYPTED_STORAGE_KEY, encryptedData);
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    }, [state.encryptionKey]);

    useEffect(() => {
        if (state.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.settings.theme]);

    const login = async (mnemonic: string, isRehydrating: boolean = false): Promise<boolean> => {
        try {
            const key = await deriveKeyFromMnemonic(mnemonic);
            const encryptedData = localStorage.getItem(ENCRYPTED_STORAGE_KEY);
            
            let loadedEntries: DiaryEntry[] = [];
            let loadedSettings: AppSettings = defaultSettings;

            if (encryptedData) {
                const decrypted = await decryptData<{ entries: DiaryEntry[], settings: AppSettings }>(encryptedData, key);
                if (decrypted) {
                    loadedEntries = decrypted.entries;
                    loadedSettings = { ...defaultSettings, ...decrypted.settings };
                } else {
                    return false; // Decryption failed, wrong mnemonic
                }
            } else {
                const initialData = { entries: [], settings: defaultSettings };
                const initialEncryptedData = await encryptData(initialData, key);
                localStorage.setItem(ENCRYPTED_STORAGE_KEY, initialEncryptedData);
            }
            
            setState({
                ...state,
                isAuthenticated: true,
                isLocked: isRehydrating ? !!loadedSettings.pin : !loadedSettings.pin,
                encryptionKey: key,
                entries: loadedEntries,
                settings: loadedSettings,
            });
            sessionStorage.setItem('diaryMnemonic', mnemonic);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };
    
    const unlock = async (pin: string): Promise<boolean> => {
        if (!state.settings.pin) return false;
        const hashedPin = await hashPin(pin);
        if (hashedPin === state.settings.pin) {
            setState(s => ({ ...s, isLocked: false }));
            return true;
        }
        return false;
    };
    
    const lock = () => {
        setState(s => ({ ...s, isLocked: true }));
    };

    const logout = () => {
        sessionStorage.removeItem('diaryMnemonic');
        setState(initialState);
    };

    const setPin = async (pin: string) => {
        const hashedPin = await hashPin(pin);
        const newSettings = { ...state.settings, pin: hashedPin };
        setState(s => ({ ...s, settings: newSettings }));
        await saveData({ entries: state.entries, settings: newSettings });
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        const updatedSettings = { ...state.settings, ...newSettings };
        setState(s => ({ ...s, settings: updatedSettings }));
        await saveData({ entries: state.entries, settings: updatedSettings });
    };

    const setTheme = (theme: Theme) => {
        updateSettings({ theme });
    };

    const addEntry = async (entry: DiaryEntry) => {
        const newEntries = [...state.entries, entry];
        setState(s => ({ ...s, entries: newEntries, activeDraft: null }));
        await saveData({ entries: newEntries, settings: state.settings });
    };

    const updateEntry = async (updatedEntry: DiaryEntry) => {
        const newEntries = state.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
        setState(s => ({ ...s, entries: newEntries, activeDraft: null }));
        await saveData({ entries: newEntries, settings: state.settings });
    };

    const deleteEntry = async (id: string) => {
        const newEntries = state.entries.filter(e => e.id !== id);
        setState(s => ({ ...s, entries: newEntries }));
        await saveData({ entries: newEntries, settings: state.settings });
    };
    
    const setActiveDraft = (draft: DiaryEntry | null) => {
        setState(s => ({...s, activeDraft: draft }));
    }
    
    const analyzeEntry = async (entry: DiaryEntry) => {
        if (!ai) {
            setState(s => ({ ...s, analysisError: 'AI service is not configured. Please add an API Key.' }));
            return;
        }
        setState(s => ({ ...s, isAnalyzing: true, analysisResult: null, analysisError: null }));
        try {
            const prompt = `Diary Entry Content:\n\nTitle: ${entry.title}\nMood: ${entry.mood}\nContent: ${entry.content}\n\nPlease provide a gentle, insightful, and brief reflection on this diary entry. Act as a friendly guide helping the user understand their thoughts and feelings. Focus on key themes, underlying emotions, and potential patterns. Frame your reflection in a positive and constructive way.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: "You are an insightful and empathetic journal assistant. Your goal is to help users reflect on their diary entries. Be concise, positive, and encouraging. Respond in Markdown format.",
                },
            });

            setState(s => ({ ...s, isAnalyzing: false, analysisResult: response.text }));

        } catch (error) {
            console.error("AI analysis failed:", error);
            setState(s => ({ ...s, isAnalyzing: false, analysisError: 'Failed to get insights from AI.' }));
        }
    };

    const clearAnalysis = () => {
        setState(s => ({ ...s, isAnalyzing: false, analysisResult: null, analysisError: null }));
    };

    const suggestTags = async (entry: Pick<DiaryEntry, 'title' | 'content'>): Promise<string[]> => {
        if (!ai) {
            setState(s => ({ ...s, tagSuggestionError: 'AI service is not configured.' }));
            return [];
        }
        setState(s => ({ ...s, isSuggestingTags: true, tagSuggestionError: null }));
        try {
            const prompt = `Analyze the following diary entry and suggest 3 to 5 relevant tags. Tags should be concise (1-2 words). Entry Title: "${entry.title}". Content: "${entry.content}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tags: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                    description: 'A relevant tag for the diary entry.'
                                }
                            }
                        }
                    }
                }
            });

            const jsonStr = response.text.trim();
            const result = JSON.parse(jsonStr);
            
            setState(s => ({ ...s, isSuggestingTags: false }));
            return result.tags || [];

        } catch (error) {
            console.error("AI tag suggestion failed:", error);
            setState(s => ({ ...s, isSuggestingTags: false, tagSuggestionError: 'Failed to get tag suggestions.' }));
            return [];
        }
    };

    return (
        <AppContext.Provider value={{
            ...state,
            login,
            logout,
            lock,
            unlock,
            setPin,
            addEntry,
            updateEntry,
            deleteEntry,
            updateSettings,
            setTheme,
            setActiveDraft,
            analyzeEntry,
            clearAnalysis,
            suggestTags,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};