from supabase import create_client
from typing import List, Dict
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL and Key must be set in environment variables.")
supabase = create_client(supabase_url, supabase_key)

def search_websites(query: str, limit: int = 10) -> List[Dict]:
    """Search the websites table using full-text search."""
    response = supabase.rpc("search_websites", {
        "query": query,
        "count": limit
    }).execute()
    return response.data

app = FastAPI()

origins = [
    "http://localhost:5173",  # dev
    "https://snipr.kushs.dev",  # prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/search")
def search(q: str = Query(..., description="Search query"), limit: int = Query(10, gt=0, description="Limit results")):
    """Endpoint to search websites."""
    try:
        results = search_websites(q, limit)
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}