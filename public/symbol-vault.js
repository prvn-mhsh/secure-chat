// Symbol Vault encryption functions
const symbolMap = "!@#$%^&*()-_=+[]{};:,.<>?/|~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const b64ToSymbols = str => str.split('').map(ch => symbolMap[b64chars.indexOf(ch) % symbolMap.length]).join('');
const symbolsToB64 = str => str.split('').map(s => { 
  const idx = symbolMap.indexOf(s); 
  return idx>=0 ? b64chars[idx % 64] : ''; 
}).join('');

async function getKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
}

async function encryptMessage(message, passphrase) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(message));
  const full = new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)]);
  const base64 = btoa(String.fromCharCode(...full));
  return b64ToSymbols(base64);
}

async function decryptMessage(symbolStr, passphrase) {
  try {
    const base64 = symbolsToB64(symbolStr);
    const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const salt = data.slice(0,16);
    const iv = data.slice(16,28);
    const ciphertext = data.slice(28);
    const key = await getKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error("Failed to decrypt. Check passphrase or symbol code.");
  }
}
