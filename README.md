# AegisVault

A local demo of a browser-based encrypted vault. The React frontend encrypts vault contents before sending them to a FastAPI backend, which stores the encrypted record in SQLite.

> **Not for real secrets or production use.** This project is a learning/demo app, not a production-ready password manager. The API has no authentication or access control, and the frontend is configured for a local backend. Do not deploy it publicly or enter sensitive information.

## Features

- Create a vault with a user ID and passphrase, or unlock an existing vault.
- Derive an encryption key in the browser using PBKDF2 with SHA-256.
- Encrypt vault text with AES-GCM before sending it to the API.
- Save and retrieve encrypted records in a local SQLite database.
- Export the unlocked vault contents to a PDF.
- Clear the current page's vault and passphrase state with the **Panic Wipe** button.

## How it works

1. The browser derives a key from the passphrase and a random salt.
2. The browser encrypts vault text using AES-GCM and a fresh IV.
3. The API stores the user ID, salt, IV, and ciphertext in SQLite.
4. To unlock, the browser fetches the record, derives the key again, and decrypts it locally.

The passphrase and derived key are not included in API requests. This does not make the current application safe for deployment: the backend does not authenticate users or enforce access permissions.

## Requirements

- Python 3.9 or newer
- Node.js and npm

## Run locally

Start the backend and frontend in separate PowerShell terminals from the project root.

### 1. Start the backend

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r backend\req.txt
Set-Location backend
py -m uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. FastAPI's interactive API documentation is available at `http://localhost:8000/docs`.

The SQLite database is created at `backend\vault.db` when the backend starts. It is local data and is intentionally excluded from Git.

### 2. Start the frontend

In a second terminal:

```powershell
Set-Location frontend
npm ci
npm start
```

The React development server opens the app in your browser. The frontend currently sends API requests to `http://localhost:8000`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/vault` | Create or update a vault record |
| `GET` | `/api/vault/{user_id}` | Retrieve a vault record |

The POST request accepts JSON with `user_id`, `ciphertext`, `iv`, and `salt`. The GET response returns the ciphertext, IV, salt, and update timestamp.

## Important limitations

- **No authentication or authorization:** anyone who can reach the API can read or overwrite records by user ID.
- **Local-only configuration:** the frontend API URL is hard-coded to `http://localhost:8000`.
- **Panic Wipe is not server-side deletion:** it clears the current UI state; it does not remove the saved database record or guarantee secure memory erasure.
- **PDF exports contain decrypted content:** handle exported files as sensitive.
- **No production security review:** do not rely on the app to protect personal, financial, legal, or other confidential data.

## Project structure

```text
backend/
  database.py       SQLite connection and schema setup
  main.py           FastAPI endpoints
  models.py         Request model
  req.txt           Python dependencies
frontend/
  public/           HTML entry point
  src/
    App.jsx         Vault interface and workflows
    components/     UI components
    utils/          Browser encryption and PDF export
```
