"""
Redis Cache Manager for Docu-Agent
Handles caching of eligibility checks, rules, and user data
"""

import redis
import json
import pickle
from functools import wraps
import os
from typing import Any, Callable, Optional
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis cache client wrapper"""
    
    def __init__(self, host: str = None, port: int = None, db: int = 0):
        self.host = host or os.getenv('REDIS_HOST', 'localhost')
        self.port = port or int(os.getenv('REDIS_PORT', 6379))
        self.db = db
        self.client = None
        self.connect()
    
    def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                decode_responses=False,
                socket_connect_timeout=5
            )
            # Test connection
            self.client.ping()
            logger.info(f"✓ Redis connected ({self.host}:{self.port})")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            self.client = None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.client:
            return None
        
        try:
            data = self.client.get(key)
            if data:
                return pickle.loads(data)
            return None
        except Exception as e:
            logger.error(f"Cache get failed: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (default 1 hour)"""
        if not self.client:
            return False
        
        try:
            data = pickle.dumps(value)
            self.client.setex(key, ttl, data)
            return True
        except Exception as e:
            logger.error(f"Cache set failed: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.client:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete failed: {e}")
            return False
    
    def clear(self) -> bool:
        """Clear all cache"""
        if not self.client:
            return False
        
        try:
            self.client.flushdb()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Cache clear failed: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.client:
            return False
        
        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache exists check failed: {e}")
            return False
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        if not self.client:
            return {"status": "disconnected"}
        
        try:
            info = self.client.info()
            return {
                "memory_used": info.get('used_memory_human', 'N/A'),
                "connected_clients": info.get('connected_clients', 0),
                "total_commands": info.get('total_commands_processed', 0),
                "status": "connected"
            }
        except Exception as e:
            logger.error(f"Stats retrieval failed: {e}")
            return {"status": "error", "error": str(e)}


# Global cache instance
_redis_cache = None

def get_redis_cache() -> RedisCache:
    """Get or create Redis cache instance"""
    global _redis_cache
    if _redis_cache is None:
        _redis_cache = RedisCache()
    return _redis_cache

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from args"""
    parts = []
    for arg in args:
        if isinstance(arg, (list, dict)):
            parts.append(json.dumps(arg, sort_keys=True))
        else:
            parts.append(str(arg))
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (list, dict)):
            parts.append(f"{k}:{json.dumps(v, sort_keys=True)}")
        else:
            parts.append(f"{k}:{v}")
    return ":".join(parts)

def cached(prefix: str = "app", ttl: int = 3600) -> Callable:
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            cache = get_redis_cache()
            
            # Generate cache key
            key = f"{prefix}:{cache_key(func.__name__, *args, **kwargs)}"
            
            # Try cache
            cached_value = cache.get(key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {key}")
                return cached_value
            
            # Call function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(key, result, ttl)
            return result
        
        return wrapper
    return decorator


# Specific cache managers
class EligibilityCache:
    """Eligibility result caching"""
    
    @staticmethod
    def get_user_eligibility(user_id: str):
        cache = get_redis_cache()
        return cache.get(f"eligibility:{user_id}")
    
    @staticmethod
    def set_user_eligibility(user_id: str, result: dict, ttl: int = 7200):
        cache = get_redis_cache()
        return cache.set(f"eligibility:{user_id}", result, ttl)
    
    @staticmethod
    def invalidate_user(user_id: str):
        cache = get_redis_cache()
        return cache.delete(f"eligibility:{user_id}")

class RuleCache:
    """Rule caching"""
    
    @staticmethod
    def get_rule(scheme_id: str):
        cache = get_redis_cache()
        return cache.get(f"rule:{scheme_id}")
    
    @staticmethod
    def set_rule(scheme_id: str, rule: dict):
        cache = get_redis_cache()
        return cache.set(f"rule:{scheme_id}", rule, ttl=86400)

class QueryCache:
    """Query result caching"""
    
    @staticmethod
    def get_query_result(query_hash: str):
        cache = get_redis_cache()
        return cache.get(f"query:{query_hash}")
    
    @staticmethod
    def set_query_result(query_hash: str, result: dict):
        cache = get_redis_cache()
        return cache.set(f"query:{query_hash}", result, ttl=14400)

if __name__ == "__main__":
    cache = get_redis_cache()
    print("Cache stats:", cache.get_stats())
