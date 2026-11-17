# AegisVault

A browser-based encrypted vault demo built with React and FastAPI. The frontend encrypts vault contents with the Web Crypto API before sending ciphertext to the backend.

## Requirements

- Python 3.9+
- Node.js and npm

## Run locally

Open two terminals from the project root.

### Backend

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r backend\req.txt
Set-Location backend
py -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Its SQLite database is created locally as `backend\vault.db` and is excluded from Git.

### Frontend

```powershell
Set-Location frontend
npm ci
npm start
```

The app expects the API at `http://localhost:8000`.

## Important

This is a local demo, not a production-ready password manager. The backend currently has no user authentication or access control. Do not deploy it publicly or use it to store real secrets.
