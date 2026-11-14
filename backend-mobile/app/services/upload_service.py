from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import AppError

# Mobile Photos apps often send image/jpg, image/pjpeg, or omit MIME entirely.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
}
# Android/iOS multipart uploads sometimes fall back to these.
_FALLBACK_CONTENT_TYPES = {None, "", "application/octet-stream", "binary/octet-stream"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024

_MAGIC_EXTENSIONS = (
    (b"\xff\xd8\xff", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", ".png"),
    (b"GIF87a", ".gif"),
    (b"GIF89a", ".gif"),
    (b"RIFF", ".webp"),  # WebP also starts with RIFF....WEBP
)


def _extension_from_bytes(content: bytes, filename: str | None) -> str:
    for magic, ext in _MAGIC_EXTENSIONS:
        if content.startswith(magic):
            if ext == ".webp" and b"WEBP" not in content[:16]:
                continue
            return ext
    suffix = Path(filename or "").suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    return ".jpg"


def _is_allowed_image(content_type: str | None, content: bytes) -> bool:
    normalized = (content_type or "").split(";")[0].strip().lower() or None
    if normalized in ALLOWED_IMAGE_TYPES:
        return True
    if normalized in _FALLBACK_CONTENT_TYPES or (
        normalized is not None and normalized.startswith("image/")
    ):
        # Accept when payload looks like a real image (mobile gallery picks).
        return any(
            content.startswith(magic)
            for magic, _ in _MAGIC_EXTENSIONS
            if magic != b"RIFF" or b"WEBP" in content[:16]
        )
    return False


async def save_image(file: UploadFile, subfolder: str) -> str:
    content = await file.read()
    if not content:
        raise AppError("Empty image upload")
    if len(content) > MAX_IMAGE_BYTES:
        raise AppError("Image must be 5 MB or smaller")
    if not _is_allowed_image(file.content_type, content):
        raise AppError("Only JPEG, PNG, WebP, and GIF images are allowed")

    settings = get_settings()
    upload_root = Path(settings.upload_dir) / subfolder
    upload_root.mkdir(parents=True, exist_ok=True)

    extension = _extension_from_bytes(content, file.filename)
    filename = f"{uuid4().hex}{extension}"
    destination = upload_root / filename
    destination.write_bytes(content)

    return f"/uploads/{subfolder}/{filename}"
