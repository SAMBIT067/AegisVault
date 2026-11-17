import sqlite3

DB_FILE = "vault.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute()
    conn.commit()
    cur.close()
    conn.close()