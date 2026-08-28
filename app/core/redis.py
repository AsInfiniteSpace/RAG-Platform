from arq import create_pool
import redis
from arq.connections import RedisSettings
from app.core.config import settings

redis_pool = None

redis_client = redis.from_url(settings.redis_url, decode_responses=True)

async def get_redis_pool():
    global redis_pool
    if redis_pool is None:
        redis_pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    return redis_pool