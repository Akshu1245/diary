import { SALT } from '../constants';

const IV_LENGTH = 12; // For AES-GCM
const KEY_ALGO = { name: 'PBKDF2' };
const ENCRYPT_ALGO = { name: 'AES-GCM', iv: new Uint8Array(IV_LENGTH) };

async function mnemonicToEntropy(mnemonic: string): Promise<Uint8Array> {
    const words = mnemonic.split(' ');
    // This is a simplified entropy derivation. In a real scenario, use bip39 library.
    // For this environment, we'll create a reproducible seed from the words.
    const joined = words.join('');
    const encoder = new TextEncoder();
    // FIX: Convert ArrayBuffer from digest to Uint8Array to match return type.
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(joined));
    return new Uint8Array(digest);
}

export async function deriveKeyFromMnemonic(mnemonic: string): Promise<CryptoKey> {
    const entropy = await mnemonicToEntropy(mnemonic);
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        entropy,
        KEY_ALGO,
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new TextEncoder().encode(SALT),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptData(data: object, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedContent = await crypto.subtle.encrypt(
        { ...ENCRYPT_ALGO, iv },
        key,
        encodedData
    );

    const encryptedBytes = new Uint8Array(encryptedContent);
    const result = new Uint8Array(iv.length + encryptedBytes.length);
    result.set(iv);
    result.set(encryptedBytes, iv.length);

    return btoa(String.fromCharCode.apply(null, Array.from(result)));
}

export async function decryptData<T>(encryptedString: string, key: CryptoKey): Promise<T | null> {
    try {
        const encryptedData = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
        const iv = encryptedData.slice(0, IV_LENGTH);
        const data = encryptedData.slice(IV_LENGTH);

        const decryptedContent = await crypto.subtle.decrypt(
            { ...ENCRYPT_ALGO, iv },
            key,
            data
        );

        const decodedData = new TextDecoder().decode(decryptedContent);
        return JSON.parse(decodedData) as T;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

export async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}