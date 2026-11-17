// Browser-based Web Crypto API helpers for Zero-Knowledge Encryption

export async function deriveKey(passphrase, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToUint8Array(saltHex) : window.crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return { key, salt: uint8ArrayToHex(salt) };
}

export async function encryptData(key, plaintext) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: uint8ArrayToHex(new Uint8Array(ciphertext)),
    iv: uint8ArrayToHex(iv)
  };
}

export async function decryptData(key, ciphertextHex, ivHex) {
  const dec = new TextDecoder();
  const ciphertext = hexToUint8Array(ciphertextHex);
  const iv = hexToUint8Array(ivHex);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return dec.decode(decrypted);
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hexString) {
  const matches = hexString.match(/.{1,2}/g);
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}