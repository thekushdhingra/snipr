from supabase import create_client
from typing import List, Dict
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import httpx

CURRENCY_SIGNS = {
    "usd": "$", "inr": "₹", "eur": "€", "gbp": "£", "jpy": "¥",
    "aud": "A$", "cad": "C$", "chf": "CHF", "cny": "¥", "rub": "₽",
    "nzd": "NZ$", "krw": "₩", "brl": "R$", "zar": "R"
}

async def convert_currency(amount: float, from_currency: str, to_currency: str) -> str:
    url = f"https://moneymorph.dev/api/convert/{amount}/{from_currency.upper()}/{to_currency.upper()}"

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Currency API error: {str(e)}")


    from_sign = CURRENCY_SIGNS.get(from_currency.lower(), from_currency.upper())
    to_sign = CURRENCY_SIGNS.get(to_currency.lower(), to_currency.upper())
    result = float(data["response"])

    return f"{from_sign}{amount} = {to_sign}{result:.2f}"



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


@app.get("/api/currency")
async def currency_endpoint(
    amount: float = Query(..., description="Amount to convert"),
    from_currency: str = Query(..., alias="from", description="Source currency (e.g., USD)"),
    to_currency: str = Query(..., alias="to", description="Target currency (e.g., INR)")
):
    """Currency conversion using moneymorph.dev"""
    return {"conversion": await convert_currency(amount, from_currency, to_currency)}

@app.get("/api/meaning")
async def meaning_endpoint(word: str = Query(..., description="Word to define")):
    """Get a list of meanings for a word using the DictionaryAPI."""
    if not word:
        raise HTTPException(status_code=400, detail="Word parameter is required.")
    word = word.strip().lower()
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Dictionary API error: {str(e)}")
    if isinstance(data, list) and data:
        meanings = []
        for meaning in data[0].get("meanings", []):
            for definition in meaning.get("definitions", []):
                if "definition" in definition:
                    meanings.append(definition["definition"])
        if meanings:
            return meanings
        else:
            raise HTTPException(status_code=404, detail="No meanings found.")
    else:
        raise HTTPException(status_code=404, detail="Word not found or no meaning available.")
    
    
    
def get_autocomplete_suggestions(query: str, limit: int = 10) -> List[str]:
    response = supabase.rpc("autocomplete_suggestions", {
        "query": query,
        "count": limit
    }).execute()

    if not response.data:
        return []
    return [item['suggestion'] for item in response.data]



@app.get("/api/suggest", response_model=List[str])
def suggest(
    q: str = Query("", description="Search input for autocomplete"),
    limit: int = Query(10, gt=0, le=25, description="Max number of suggestions")
):
    if not q.strip():
        # Return fallback if empty input
        return [
            "USD to INR",
            "Define recursion",
            "Bitcoin to USD",
            "Explain HTTP",
            "Euro to INR"
        ]
    try:
        return get_autocomplete_suggestions(q, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
