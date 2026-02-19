"""
Fast API Setup for Docu-Agent
High-performance async eligibility checker and rule engine
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import aioredis
import os
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Docu-Agent FastAPI",
    description="High-performance eligibility and rule processing",
    version="0.1.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
redis_client = None

@app.on_event("startup")
async def startup_event():
    global redis_client
    try:
        redis_client = await aioredis.create_redis_pool(
            f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}",
            encoding="utf8"
        )
        logger.info("✓ Redis connected")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
        redis_client = None

@app.on_event("shutdown")
async def shutdown_event():
    global redis_client
    if redis_client:
        redis_client.close()
        await redis_client.wait_closed()

# Models
class UserProfile(BaseModel):
    user_id: str
    annual_income: Optional[int] = None
    caste_category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    academic_year: Optional[str] = None

class EligibilityQuery(BaseModel):
    user_id: str
    scheme_ids: Optional[List[str]] = None

class RuleQuery(BaseModel):
    query: str
    context: Optional[Dict] = None

# Health Check
@app.get("/health")
async def health_check():
    redis_status = "connected" if redis_client else "disconnected"
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "redis": redis_status,
        "service": "docu-agent-fastapi"
    }

# Eligibility Endpoints
@app.post("/v2/eligibility/check")
async def check_eligibility(query: EligibilityQuery):
    """Fast eligibility check with Redis caching"""
    try:
        cache_key = f"eligibility:{query.user_id}"
        
        # Check cache
        if redis_client:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for {query.user_id}")
                return JSONResponse(content=eval(cached))
        
        # Mock eligibility check (replace with real logic)
        result = {
            "user_id": query.user_id,
            "eligible_schemes": 5,
            "partial_schemes": 3,
            "ineligible_schemes": 2,
            "cached": False,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        # Cache result for 1 hour
        if redis_client:
            await redis_client.setex(cache_key, 3600, str(result))
        
        return result
    except Exception as e:
        logger.error(f"Eligibility check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v2/eligibility/batch")
async def batch_eligibility(users: List[UserProfile], background_tasks: BackgroundTasks):
    """Batch eligibility check for multiple users"""
    try:
        task_id = f"batch_{datetime.utcnow().timestamp()}"
        background_tasks.add_task(process_batch, users, task_id)
        
        return {
            "task_id": task_id,
            "status": "processing",
            "users_count": len(users),
            "check_url": f"/v2/eligibility/batch/{task_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_batch(users: List[UserProfile], task_id: str):
    """Background task for batch processing"""
    if not redis_client:
        return
    
    results = []
    for user in users:
        results.append({
            "user_id": user.user_id,
            "eligible": True,
            "score": 0.85
        })
    
    await redis_client.setex(f"batch:{task_id}", 86400, str(results))

# Rule Query Endpoints
@app.post("/v2/rules/query")
async def query_rules(query: RuleQuery):
    """Query rules using Gemini AI with caching"""
    try:
        # Generate cache key from query
        cache_key = f"rule:{hash(query.query)}"
        
        if redis_client:
            cached = await redis_client.get(cache_key)
            if cached:
                return JSONResponse(content=eval(cached))
        
        # Mock response (Gemini integration in separate module)
        result = {
            "query": query.query,
            "matches": 8,
            "ai_model": "google-gemini-pro",
            "relevance": 0.92
        }
        
        if redis_client:
            await redis_client.setex(cache_key, 7200, str(result))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Cache Management
@app.delete("/v2/cache/clear")
async def clear_cache():
    """Clear all Redis cache"""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis not available")
    
    await redis_client.flushdb()
    return {"status": "cache cleared", "timestamp": datetime.utcnow().isoformat()}

@app.get("/v2/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    if not redis_client:
        return {"status": "redis not available"}
    
    info = await redis_client.info()
    return {
        "used_memory": info.get("used_memory_human"),
        "connected_clients": info.get("connected_clients"),
        "total_commands": info.get("total_commands_processed")
    }

if __name__ == "__main__":
    port = int(os.getenv("FASTAPI_PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
