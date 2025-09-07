export enum Mood {
  Happy = 'Happy',
  Energetic = 'Energetic',
  Calm = 'Calm',
  Sad = 'Sad',
  Neutral = 'Neutral'
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  gratitude: string[];
  goals: string[];
  emoji: string;
  image: string | null; // Base64 encoded image
  isDraft?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
    theme: Theme;
    userName: string;
    wallpaper: string | null;
    pin: string | null;
}

export interface AppState {
    isAuthenticated: boolean;
    isLocked: boolean;
    encryptionKey: CryptoKey | null;
    entries: DiaryEntry[];
    settings: AppSettings;
    activeDraft: DiaryEntry | null;
    isAnalyzing: boolean;
    analysisResult: string | null;
    analysisError: string | null;
    isSuggestingTags: boolean;
    tagSuggestionError: string | null;
}