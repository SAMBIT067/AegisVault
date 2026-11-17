from pydantic import BaseModel

class VaultRecord(BaseModel):
    user_id: str
    ciphertext: str
    iv: str
    salt: str