from abc import ABC, abstractmethod


class StorageProvider(ABC):
    @abstractmethod
    def save(self, key: str, file_bytes: bytes) -> str:
        """Stores the file, returns the key/path it was stored under."""
        ...

    @abstractmethod
    def read(self, key: str) -> bytes:
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        ...