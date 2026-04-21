"""MongoDB connection (Motor async client)."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings


class _DB:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


_state = _DB()


async def connect_to_mongo() -> None:
    _state.client = AsyncIOMotorClient(settings.MONGODB_URI)
    _state.db = _state.client[settings.MONGODB_DB]
    # Indexes
    await _state.db.users.create_index("email", unique=True)
    await _state.db.tasks.create_index("status")
    await _state.db.issues.create_index("status")


async def close_mongo() -> None:
    if _state.client is not None:
        _state.client.close()
        _state.client = None
        _state.db = None


def get_db() -> AsyncIOMotorDatabase:
    if _state.db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _state.db
