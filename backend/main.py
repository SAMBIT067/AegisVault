from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db_connection
from models import VaultRecord

# Ensure this variable is named exactly 'app'
app = FastAPI(title="Zero-Knowledge Vault Backend (SQLite)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/api/vault")
def save_vault(record: VaultRecord):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO vaults (user_id, ciphertext, iv, salt, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) 
            DO UPDATE SET ciphertext = excluded.ciphertext, 
                        iv = excluded.iv, 
                        salt = excluded.salt, 
                        updated_at = CURRENT_TIMESTAMP;
            """,
            (record.user_id, record.ciphertext, record.iv, record.salt)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"status": "success", "message": "Encrypted state securely stored."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vault/{user_id}")
def get_vault(user_id: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT ciphertext, iv, salt, updated_at FROM vaults WHERE user_id = ?;", (user_id,))
        record = cur.fetchone()
        cur.close()
        conn.close()
        
        if not record:
            raise HTTPException(status_code=404, detail="No vault found for user ID.")
        
        return {
            "ciphertext": record["ciphertext"],
            "iv": record["iv"],
            "salt": record["salt"],
            "updated_at": record["updated_at"]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))