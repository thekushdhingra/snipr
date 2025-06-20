import os
import requests as req
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
vyntr_api_key = os.getenv("VYNTR_API_KEY")

if supabase_key is None or supabase_url is None:
    raise ValueError("Supabase URL and Key must be set in environment variables.")
if not vyntr_api_key:
    raise ValueError("VYNTR_API_KEY must be set in environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)

def add_website(name: str, desc: str, url: str) -> bool:
    print(f"Checking if website exists in DB: {url}")
    existing = supabase.table("websites").select("id").eq("url", url).execute()
    if existing.data:
        print("Website already exists.")
        return False

    data = {
        "name": name,
        "desc": desc,
        "url": url
    }
    print(f"Inserting website into DB: {name} ({url})")
    response = supabase.table("websites").insert(data).execute()
    if response.data:
        print("Website added successfully.")
        return True
    else:
        print("Failed to add website.")
        return False


popular_searches = []


def process_search(search: str, headers):
    print(f"Requesting Vyntr API for search: {search}")
    try:
        resp = req.get(f"https://vyntr.com/api/v1/search?q={search}", headers=headers, timeout=10)
        resp.raise_for_status()
        data_collection = resp.json()
        print(f"Received response from Vyntr API for '{search}'.")
    except Exception as e:
        print(f"Error fetching search results for '{search}': {e}")
        return

    if "web" in data_collection and data_collection["web"]:
        print(f"Found {len(data_collection['web'])} web results for '{search}'.")
        for data in data_collection["web"]:
            print(f"Processing result: {data}")
            name = data.get("title", "")
            url = data.get("url", "")
            desc = data.get("preview", "")
            if not name or not url or not desc:
                print("Missing title or url, skipping result.")
                continue
            add_website(name, desc, url)
    else:
        print(f"No web results found for '{search}'.")

def main() -> None:
    headers = {"Authorization": f"Bearer {vyntr_api_key}"}
    print("Starting main crawling loop with threading...")
    max_workers = 5

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        for idx, search in enumerate(popular_searches):
            print(f"\n[{idx+1}/{len(popular_searches)}] Scheduling search: '{search}'")
            futures.append(executor.submit(process_search, search, headers))
        for future in as_completed(futures):
            future.result()

if __name__ == "__main__":
    main()
