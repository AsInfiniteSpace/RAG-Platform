import os
from app.core.config import settings
from app.services.storage.base import StorageProvider


class LocalStorageProvider(StorageProvider):
    def save(self, key: str, file_bytes: bytes) -> str:
        full_path = os.path.join(settings.storage_path, key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(file_bytes)
        return key

    def read(self, key: str) -> bytes:
        full_path = os.path.join(settings.storage_path, key)
        with open(full_path, "rb") as f:
            return f.read()

    def delete(self, key: str) -> None:
        full_path = os.path.join(settings.storage_path, key)
        if os.path.exists(full_path):
            os.remove(full_path)