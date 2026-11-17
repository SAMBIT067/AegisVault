import sqlite3

DB_FILE = "vault.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Enables column name access like dictionaries
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vaults (
            user_id TEXT PRIMARY KEY,
            ciphertext TEXT NOT NULL,
            iv TEXT NOT NULL,
            salt TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()