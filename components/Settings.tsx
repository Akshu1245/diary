import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Theme } from '../types';
import { Sun, Moon, Monitor, Save, Lock } from 'lucide-react';

const Settings: React.FC = () => {
    const { settings, updateSettings, setPin } = useAppContext();
    const [userName, setUserName] = useState(settings.userName);
    const [wallpaper, setWallpaper] = useState(settings.wallpaper || '');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinMessage, setPinMessage] = useState({ type: '', text: '' });

    const handleProfileSave = () => {
        updateSettings({ userName, wallpaper: wallpaper || null });
        alert("Settings Saved!");
    };
    
    const handleSetTheme = (theme: Theme) => {
        updateSettings({ theme });
    }

    const handlePinChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinMessage({ type: '', text: '' });
        
        // This is a simplified check. A real app should verify the current PIN.
        // For now, we'll just allow setting a new one.
        if (newPin.length < 4) {
             setPinMessage({ type: 'error', text: 'PIN must be at least 4 digits.' });
             return;
        }
        if (newPin !== confirmNewPin) {
             setPinMessage({ type: 'error', text: 'New PINs do not match.' });
             return;
        }
        await setPin(newPin);
        setPinMessage({ type: 'success', text: 'PIN updated successfully!' });
        setCurrentPin('');
        setNewPin('');
        setConfirmNewPin('');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold">Settings</h1>

            {/* Profile Settings */}
            <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-muted-foreground">Display Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your display name"
                            className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary/50 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-muted-foreground">Custom Wallpaper URL</label>
                        <input
                            type="text"
                            value={wallpaper}
                            onChange={(e) => setWallpaper(e.target.value)}
                            placeholder="https://picsum.photos/1920/1080"
                            className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary/50 focus:outline-none"
                        />
                    </div>
                </div>
                <button onClick={handleProfileSave} className="mt-6 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-md hover:opacity-90 transition-opacity">
                    <Save size={18} />
                    <span>Save Profile</span>
                </button>
            </div>
            
             {/* Theme Settings */}
            <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Theme</h2>
                <div className="flex space-x-2">
                    <button onClick={() => handleSetTheme('light')} className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${settings.theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                        <Sun size={18} /><span>Light</span>
                    </button>
                    <button onClick={() => handleSetTheme('dark')} className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${settings.theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                        <Moon size={18} /><span>Dark</span>
                    </button>
                </div>
                 <p className="text-xs text-muted-foreground mt-2">Note: Light theme is not fully supported in this demo. Dark theme is recommended.</p>
            </div>


            {/* Security Settings */}
            <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Security</h2>
                <form onSubmit={handlePinChange} className="space-y-4">
                     <div>
                        <label className="block mb-1 text-sm font-medium text-muted-foreground">New PIN</label>
                        <input
                            type="password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary/50 focus:outline-none"
                        />
                    </div>
                     <div>
                        <label className="block mb-1 text-sm font-medium text-muted-foreground">Confirm New PIN</label>
                        <input
                            type="password"
                            value={confirmNewPin}
                            onChange={(e) => setConfirmNewPin(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary/50 focus:outline-none"
                        />
                    </div>
                    {pinMessage.text && <p className={`text-sm ${pinMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{pinMessage.text}</p>}
                    <button type="submit" className="mt-2 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-md hover:opacity-90 transition-opacity">
                        <Lock size={18} />
                        <span>Update PIN</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
