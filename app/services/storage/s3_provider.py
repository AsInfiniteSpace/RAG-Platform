import boto3
from app.core.config import settings
from app.services.storage.base import StorageProvider


class S3StorageProvider(StorageProvider):
    def __init__(self):
        if not settings.s3_access_key or not settings.s3_secret_key:
            raise ValueError("S3 storage provider selected, but S3 credentials are not configured.")

        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
        )
        self.bucket = settings.s3_bucket_name

    def save(self, key: str, file_bytes: bytes) -> str:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=file_bytes)
        return key

    def read(self, key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        return response["Body"].read()

    def delete(self, key: str) -> None:
        versions = self.client.list_object_versions(Bucket=self.bucket, Prefix=key)

        objects_to_delete = [
            {"Key": v["Key"], "VersionId": v["VersionId"]}
            for v in versions.get("Versions", [])
            if v["Key"] == key
        ]
        objects_to_delete += [
            {"Key": v["Key"], "VersionId": v["VersionId"]}
            for v in versions.get("DeleteMarkers", [])
            if v["Key"] == key
        ]

        if objects_to_delete:
            self.client.delete_objects(Bucket=self.bucket, Delete={"Objects": objects_to_delete})