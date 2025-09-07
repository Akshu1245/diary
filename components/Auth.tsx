import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Lock, Unlock, RefreshCw, Edit } from 'lucide-react';
import { ENCRYPTED_STORAGE_KEY } from '../constants';

// Wordlist for mnemonic generation (256 words for better security)
const wordlist = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'blend', 'bless', 'blind', 'blink', 'block', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake'
];

const Auth: React.FC = () => {
    const { isAuthenticated, isLocked, login, unlock, setPin, settings, logout } = useAppContext();
    const [mnemonic, setMnemonic] = useState('');
    const [pin, setPinValue] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const [generatedMnemonic, setGeneratedMnemonic] = useState('');
    const [hasSavedMnemonic, setHasSavedMnemonic] = useState(false);
    const [view, setView] = useState<'welcome' | 'login' | 'create'>('welcome');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(mnemonic.trim());
        if (!success) {
            const encryptedData = localStorage.getItem(ENCRYPTED_STORAGE_KEY);
            if (encryptedData) {
                setShowOverwriteConfirm(true);
            } else {
                setError('Invalid mnemonic phrase. Please check and try again.');
            }
        }
        setIsLoading(false);
    };
    
    const generateMnemonic = () => {
        const randomWords = [];
        for (let i = 0; i < 12; i++) {
            const randomIndex = Math.floor(Math.random() * wordlist.length);
            randomWords.push(wordlist[randomIndex]);
        }
        const mnemonicPhrase = randomWords.join(' ');
        setGeneratedMnemonic(mnemonicPhrase);
        setHasSavedMnemonic(false);
    };

    const handleCreateDiary = async () => {
        if (!hasSavedMnemonic || !generatedMnemonic) return;

        // Safeguard against accidental overwrite if UI state is inconsistent
        if (localStorage.getItem(ENCRYPTED_STORAGE_KEY)) {
             // Let user proceed but show overwrite warning if they try to login with this phrase
        }

        setIsLoading(true);
        setError('');
        const success = await login(generatedMnemonic);
        if (!success) {
            setError('An unexpected error occurred while creating the diary.');
        }
        setIsLoading(false);
    };

    const handleOverwriteConfirm = async () => {
        setShowOverwriteConfirm(false);
        setIsLoading(true);
        localStorage.removeItem(ENCRYPTED_STORAGE_KEY);
        const success = await login(mnemonic.trim());
        if (!success) {
            setError('An unexpected error occurred while creating the diary.');
        }
        setIsLoading(false);
    };

    const handleOverwriteCancel = () => {
        setShowOverwriteConfirm(false);
        setMnemonic('');
        setError('');
        setView('welcome');
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await unlock(pin);
        if (!success) {
            setError('Incorrect PIN.');
        }
        setIsLoading(false);
    };
    
    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length < 4) {
            setError("PIN must be at least 4 digits.");
            return;
        }
        if (newPin !== confirmNewPin) {
            setError("PINs do not match.");
            return;
        }
        setError('');
        setIsLoading(true);
        await setPin(newPin);
        await unlock(newPin);
        setIsLoading(false);
    };

    const handleForgotPin = () => {
        logout();
    };

    const renderWelcome = () => {
        const diaryExists = !!localStorage.getItem(ENCRYPTED_STORAGE_KEY);
        return (
            <div className="space-y-6 text-center">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    MyDiary
                </h2>
                <p className="text-muted-foreground">Your secure, private, offline journal.</p>
                
                <div className="pt-4 space-y-4">
                    <button
                        onClick={() => setView('login')}
                        disabled={!diaryExists}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 flex items-center justify-center space-x-2"
                    >
                        <Unlock className="w-5 h-5" />
                        <span>Unlock Existing Diary</span>
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className="w-full px-6 py-3 bg-secondary/50 border border-border text-white font-semibold rounded-md hover:bg-secondary transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                        <Edit className="w-5 h-5" />
                        <span>Create a New Diary</span>
                    </button>
                </div>
                {!diaryExists && (
                    <p className="text-sm text-green-400 pt-2">Welcome! Let's get you started by creating a new diary.</p>
                )}
                 {diaryExists && (
                    <p className="text-sm text-muted-foreground pt-2">A diary is detected on this device.</p>
                )}
            </div>
        );
    };

    const renderLoginForm = () => (
        <>
            <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Secure Login
                </h2>
                <p className="text-center text-muted-foreground">Enter your 12-word recovery phrase to decrypt your diary.</p>
                <div>
                    <textarea
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="Enter your 12-word mnemonic phrase..."
                        rows={3}
                        className="w-full p-3 bg-secondary/50 border border-border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading || mnemonic.trim().split(/\s+/).length !== 12}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 flex items-center justify-center space-x-2"
                >
                    <Unlock className="w-5 h-5" />
                    <span>{isLoading ? 'Decrypting...' : 'Unlock Diary'}</span>
                </button>
            </form>
            <div className="mt-6 text-center">
                <button onClick={() => setView('welcome')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Back
                </button>
            </div>
        </>
    );

    const renderCreateForm = () => (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    Create New Diary
                </h2>
                {!generatedMnemonic ? (
                    <>
                        <p className="text-center text-muted-foreground">
                            We'll generate a unique 12-word recovery phrase for you. This is the only way to access your diary.
                        </p>
                        <button
                            onClick={generateMnemonic}
                            className="w-full p-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5"/>
                            <span>Generate Recovery Phrase</span>
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-center text-muted-foreground">
                            Write this down and store it somewhere safe.
                        </p>
                        <div className="bg-secondary/50 border border-border rounded-md p-4 text-center font-mono tracking-wider text-lg text-green-300">
                            {generatedMnemonic}
                        </div>
                         <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm p-3 rounded-md">
                            <strong>Warning:</strong> Lose this phrase, and you lose access to your diary forever. We cannot recover it.
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="saved-mnemonic"
                                checked={hasSavedMnemonic}
                                onChange={(e) => setHasSavedMnemonic(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 bg-secondary/50 text-purple-500 focus:ring-purple-500"
                            />
                            <label htmlFor="saved-mnemonic" className="text-muted-foreground text-sm">
                                I have securely saved my recovery phrase.
                            </label>
                        </div>
                        <button
                            onClick={handleCreateDiary}
                            disabled={!hasSavedMnemonic || isLoading}
                            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 flex items-center justify-center space-x-2"
                        >
                            <Edit className="w-5 h-5" />
                            <span>{isLoading ? 'Creating Diary...' : 'Create My Diary & Login'}</span>
                        </button>
                    </>
                )}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
            <div className="mt-6 text-center">
                <button onClick={() => setView('welcome')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Back
                </button>
            </div>
        </>
    );
    
    const renderPinLock = () => (
        <>
            <form onSubmit={handleUnlock} className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                    Welcome Back!
                </h2>
                <p className="text-center text-muted-foreground">Enter your PIN to unlock.</p>
                <div>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPinValue(e.target.value)}
                        placeholder="Enter your PIN"
                        className="w-full p-3 text-center tracking-[0.5em] bg-secondary/50 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading || pin.length < 4}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 flex items-center justify-center space-x-2"
                >
                    <Lock className="w-5 h-5" />
                    <span>{isLoading ? 'Unlocking...' : 'Unlock'}</span>
                </button>
            </form>
            <div className="mt-6 text-center">
                <button onClick={handleForgotPin} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Forgot PIN? Use Recovery Phrase
                </button>
            </div>
        </>
    );

    const renderSetPinForm = () => (
        <form onSubmit={handleSetPin} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                Set a Quick-Access PIN
            </h2>
            <p className="text-center text-muted-foreground">Create a PIN for faster access. Your mnemonic will only be needed for recovery.</p>
            <div>
                 <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter a 4-6 digit PIN"
                    className="w-full p-3 mb-4 bg-secondary/50 border border-border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    disabled={isLoading}
                />
                 <input
                    type="password"
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Confirm your PIN"
                    className="w-full p-3 bg-secondary/50 border border-border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    disabled={isLoading}
                />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={isLoading || newPin.length < 4 || newPin !== confirmNewPin}
                className="w-full p-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
            >
                {isLoading ? 'Saving...' : 'Set PIN and Continue'}
            </button>
        </form>
    );

    const renderOverwriteConfirm = () => (
        <div className="space-y-6 text-center p-8">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                Warning!
            </h2>
            <p className="text-muted-foreground">The mnemonic phrase you entered does not match the diary data stored in this browser.</p>
            <p className="font-semibold text-white">Do you want to create a new diary with this phrase?</p>
            <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                <strong>This action is irreversible.</strong> All existing diary entries and settings will be permanently deleted.
            </p>
            <div className="flex justify-center gap-4 mt-6">
                 <button
                    onClick={handleOverwriteCancel}
                    className="w-full p-3 bg-secondary/80 text-white font-semibold rounded-md hover:bg-secondary transition-colors"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                 <button
                    onClick={handleOverwriteConfirm}
                    className="w-full p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating...' : 'Create New Diary'}
                </button>
            </div>
        </div>
    );

    const getRenderContent = () => {
        if (showOverwriteConfirm) return renderOverwriteConfirm();

        if (isAuthenticated && isLocked) {
            return settings.pin ? renderPinLock() : renderSetPinForm();
        }

        if (!isAuthenticated) {
            switch(view) {
                case 'login': return renderLoginForm();
                case 'create': return renderCreateForm();
                case 'welcome':
                default:
                    return renderWelcome();
            }
        }
        
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
             <div className="w-full max-w-md overflow-hidden bg-black/30 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-purple-500/10">
                <div className="p-8">
                    {getRenderContent()}
                </div>
            </div>
        </div>
    );
};

export default Auth;