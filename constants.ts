
import { Mood } from './types';

export const SALT = 'my-super-secret-salt-for-diary';
export const ENCRYPTED_STORAGE_KEY = 'MyDiaryEncryptedData';

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.Happy]: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  [Mood.Energetic]: 'bg-orange-400/20 text-orange-300 border-orange-400/30',
  [Mood.Calm]: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  [Mood.Sad]: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30',
  [Mood.Neutral]: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
};

export const MOOD_BACKGROUNDS: Record<Mood, string> = {
    [Mood.Happy]: 'from-yellow-500/10 to-background',
    [Mood.Energetic]: 'from-orange-500/10 to-background',
    [Mood.Calm]: 'from-blue-500/10 to-background',
    [Mood.Sad]: 'from-indigo-500/10 to-background',
    [Mood.Neutral]: 'from-gray-500/10 to-background',
};

export const MOOD_EMOJIS: Record<Mood, string> = {
    [Mood.Happy]: '😄',
    [Mood.Energetic]: '⚡️',
    [Mood.Calm]: '😌',
    [Mood.Sad]: '😢',
    [Mood.Neutral]: '😐',
};
