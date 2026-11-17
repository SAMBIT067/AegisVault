import React, { useState } from 'react';
import { deriveKey, encryptData, decryptData } from './utils/crypto';
import { exportLegalPDF } from './utils/legalexport';
import PanicButton from './components/PanicButton';

function App() {
  const [userId, setUserId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [sessionKey, setSessionKey] = useState(null);
  const [salt, setSalt] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [vaultContent, setVaultContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // 1. CREATE NEW VAULT WORKFLOW
  const handleCreateVault = async (e) => {
    e.preventDefault();
    if (!userId || !passphrase) return;

    try {
      setStatusMessage('Checking if user already exists...');
      const checkRes = await fetch(`http://localhost:8000/api/vault/${userId}`);
      if (checkRes.ok) {
        setStatusMessage('Error: User ID already exists! Please use "Unlock Existing Vault" or choose a different ID.');
        return;
      }

      setStatusMessage('Generating zero-knowledge keys and salt...');
      const { key, salt: newSalt } = await deriveKey(passphrase, null);
      const { ciphertext, iv } = await encryptData(key, 'Welcome to your new secure vault!');

      setStatusMessage('Saving vault initialization to server...');
      const res = await fetch('http://localhost:8000/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ciphertext, iv, salt: newSalt })
      });

      if (res.ok) {
        setSessionKey(key);
        setSalt(newSalt);
        setVaultContent('Welcome to your new secure vault!');
        setUnlocked(true);
        setStatusMessage('Vault successfully created and unlocked!');
      } else {
        setStatusMessage('Failed to initialize vault on server.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Creation failed.');
    }
  };

  // 2. UNLOCK EXISTING VAULT WORKFLOW
  const handleUnlockVault = async (e) => {
    e.preventDefault();
    if (!userId || !passphrase) return;

    try {
      setStatusMessage('Fetching vault record from server...');
      const res = await fetch(`http://localhost:8000/api/vault/${userId}`);
      
      if (res.status === 404) {
        setStatusMessage('Error: Vault ID not found. Please click "Create New Vault" instead.');
        return;
      }
      
      if (!res.ok) {
        setStatusMessage('Server error while fetching vault.');
        return;
      }

      const data = await res.json();

      setStatusMessage('Deriving cryptographic key and decrypting...');
      const { key } = await deriveKey(passphrase, data.salt);
      const decrypted = await decryptData(key, data.ciphertext, data.iv);
      
      setSessionKey(key);
      setSalt(data.salt);
      setVaultContent(decrypted);
      setUnlocked(true);
      setStatusMessage('Vault successfully unlocked!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Decryption failed: Incorrect passphrase or corrupted data.');
    }
  };

  const handleSave = async () => {
    if (!sessionKey) return;
    try {
      setStatusMessage('Encrypting client-side...');
      const { ciphertext, iv } = await encryptData(sessionKey, vaultContent);

      setStatusMessage('Syncing ciphertext to server...');
      const res = await fetch('http://localhost:8000/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ciphertext,
          iv,
          salt
        })
      });

      if (res.ok) {
        setStatusMessage('Encrypted vault saved securely to backend.');
      } else {
        setStatusMessage('Failed to save vault to server.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Encryption or save failed.');
    }
  };

  const handlePanic = () => {
    setSessionKey(null);
    setSalt(null);
    setUserId('');
    setPassphrase('');
    setVaultContent('');
    setUnlocked(false);
    setStatusMessage('🚨 PANIC TRIGGERED: Local session wiped completely.');
  };

  return (
    <div className="App" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#58a6ff' }}>🔒 Zero-Knowledge Encrypted Vault</h1>
        {unlocked && <PanicButton onPanic={handlePanic} />}
      </header>

      {!unlocked ? (
        <div className="glass-container">
          <h2>Access Your Secure Vault</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>User Pseudonym ID:</label>
            <input
              className="input-field"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. sam_vault"
              required
            />
            
            <label>Master Passphrase (Never sent to server):</label>
            <input
              className="input-field"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter strong passphrase"
              required
            />
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button className="btn-primary" onClick={handleCreateVault} style={{ background: '#238636' }}>
                ✨ Create New Vault
              </button>
              <button className="btn-primary" onClick={handleUnlockVault} style={{ background: '#1f6feb' }}>
                🔓 Unlock Existing Vault
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Vault Active — User: {userId}</h3>
            <button 
              className="btn-primary" 
              onClick={() => exportLegalPDF(vaultContent, userId)}
              style={{ background: '#8957e5' }}
            >
              Export Certified PDF
            </button>
          </div>

          <label>Encrypted Record Content (Plaintext in memory only):</label>
          <textarea
            className="input-field"
            rows="10"
            value={vaultContent}
            onChange={(e) => setVaultContent(e.target.value)}
            placeholder="Type sensitive notes or confidential records here..."
          />

          <button className="btn-primary" onClick={handleSave}>Save Encrypted Vault</button>
        </div>
      )}

      {statusMessage && (
        <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#6a6f75' }}>
          Status: {statusMessage}
        </p>
      )}
    </div>
  );
}

export default App;