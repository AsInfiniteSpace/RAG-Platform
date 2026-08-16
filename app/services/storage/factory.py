from app.core.config import settings
from app.services.storage.local_provider import LocalStorageProvider
from app.services.storage.s3_provider import S3StorageProvider

_provider = None

def get_storage_provider():
    global _provider
    if _provider is None:
        if settings.storage_provider == "local":
            _provider = LocalStorageProvider()
        elif settings.storage_provider == "s3":
            _provider = S3StorageProvider()
        else:
            raise ValueError(f"Unknown storage provider: {settings.storage_provider}")
    return _provider