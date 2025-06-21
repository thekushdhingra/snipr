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


popular_searches = [
    "Paneer Butter Masala", "Chole Bhature", "Rajma Chawal", "Palak Paneer", "Aloo Paratha",
    "Baingan Bharta", "Bhindi Masala", "Kadhi Pakora", "Dum Aloo", "Malai Kofta",
    "Aloo Gobi", "Matar Paneer", "Vegetable Biryani", "Jeera Aloo", "Tawa Pulao",
    "Kaju Curry", "Pav Bhaji", "Vada Pav", "Misal Pav", "Sabudana Khichdi",
    "Khichdi", "Sambar", "Rasam", "Upma", "Poha", "Medu Vada", "Idli", "Dosa",
    "Masala Dosa", "Onion Uttapam", "Bisi Bele Bath", "Ragi Mudde", "Avial",
    "Thepla", "Handvo", "Dhokla", "Khandvi", "Undhiyu", "Dal Dhokli", "Sev Tameta nu Shaak",
    "Sarson da Saag", "Makki di Roti", "Chana Masala", "Vegetable Korma", "Navratan Korma",
    "Hara Bhara Kabab", "Moong Dal Chilla", "Litti Chokha", "Thalipeeth", "Zunka Bhakri",
    "Gatte ki Sabzi", "Besan Chilla", "Lauki Kofta", "Pumpkin Curry", "Tinda Masala",
    "Veg Pulao", "Paneer Tikka", "Tamatar ki Sabzi", "Methi Thepla", "Karela Fry",
    "Paneer Bhurji", "Aloo Methi", "Kachori", "Moong Dal Khichdi", "Vegetable Cutlet",
    "Batata Vada", "Dal Fry", "Dal Tadka", "Methi Malai Matar", "Chana Sundal",
    "Arbi Masala", "Beetroot Poriyal", "Cabbage Thoran", "Beans Foogath", "Aloo Tamatar Curry",
    "Baingan Fry", "Tomato Chutney", "Coconut Chutney", "Peanut Chutney", "Mooli Paratha",
    "Hing Jeera Aloo", "Palak Rice", "Lemon Rice", "Curd Rice", "Tamarind Rice",
    "Rava Dosa", "Set Dosa", "Appam", "Neer Dosa", "Vegetable Ishtu",
    "Kozhambu", "Kootu", "Poriyal", "Bharwan Bhindi", "Bhutte ka Kees",
    "Suran Fry", "Raw Banana Sabzi", "Kadala Curry", "Adai", "Kuzhi Paniyaram",
    "Vegetable Stew", "Pesarattu", "Samosa", "Vegetable Momos", "Vegetable Maggi",
    "Roti", "Naan", "Phulka", "Tandoori Roti", "Missi Roti", "Jowar Roti", "Bajra Roti",
    "Poori", "Lucchi", "Chole Puri", "Aloo Puri", "Chana Dal", "Masoor Dal", "Toor Dal",
    "Gujarati Kadhi", "Punjabi Kadhi", "Kashmiri Dum Aloo", "Khar", "Lauki Chana Dal",
    "Patra", "Dabeli", "Veg Frankie", "Veg Sandwich", "Paneer Sandwich", "Tawa Sandwich",
    "Veg Roll", "Rajma Tikki", "Dahi Puri", "Bhel Puri", "Sev Puri", "Ragda Pattice",
    "Katori Chaat", "Papdi Chaat", "Aloo Chaat", "Sprouts Chaat", "Fruit Chaat",
    "Kharabath", "Veg Pongal", "Kara Kozhambu", "Vangi Bath", "Tomato Bath",
    "Masala Upma", "Vegetable Idiyappam", "Lapsi", "Kesari Bath", "Sweet Pongal",
    "Sooji Halwa", "Atta Halwa", "Besan Halwa", "Carrot Halwa", "Lauki Halwa",
    "Moong Dal Halwa", "Rava Kesari", "Badam Halwa", "Mysore Pak", "Kaju Katli",
    "Rasgulla", "Sandesh", "Cham Cham", "Boondi Ladoo", "Besan Ladoo", "Motichoor Ladoo",
    "Gulab Jamun", "Jalebi", "Imarti", "Balushahi", "Malpua", "Rabri", "Phirni",
    "Kheer", "Rice Kheer", "Sabudana Kheer", "Vermicelli Kheer", "Moong Dal Payasam","Margherita Pizza", "Veggie Burger", "Grilled Cheese Sandwich", "Vegetable Stir Fry", "Tofu Curry",
    "Falafel Wrap", "Hummus with Pita", "Veggie Tacos", "Caprese Salad", "Greek Salad",
    "Stuffed Bell Peppers", "Tomato Basil Pasta", "Spinach Lasagna", "Vegetable Fried Rice", "Vegetarian Sushi",
    "Tofu Scramble", "Eggplant Parmesan", "Minestrone Soup", "Butternut Squash Soup", "Zucchini Noodles",
    "Ratatouille", "Chickpea Stew", "Mushroom Risotto", "Sweet Potato Fries", "Veggie Quesadilla",
    "Avocado Toast", "Vegetable Spring Rolls", "Thai Green Curry", "Kimchi Fried Rice", "Baked Mac and Cheese",
    "Bruschetta", "Vegetarian Chili", "Cauliflower Wings", "Stuffed Mushrooms", "Corn on the Cob",
    "Quinoa Salad", "Black Bean Soup", "Zucchini Fritters", "Lentil Soup", "Roasted Veggie Bowl",
    "Tofu Banh Mi", "Miso Soup", "Edamame", "Tempura Veggies", "Crispy Cauliflower Tacos",
    "Vegan Ramen", "Egg Salad Sandwich", "Mozzarella Sticks", "Garlic Bread", "Broccoli Cheddar Soup",
    "Fettuccine Alfredo", "Cheese Enchiladas", "Bulgur Salad", "Veggie Pho", "Shakshuka",
    "Polenta with Mushrooms", "Vegan Shepherd’s Pie", "Stuffed Zucchini Boats", "Gnocchi with Pesto", "Cheese Fondue"
]


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
    max_workers = 10

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        for idx, search in enumerate(popular_searches):
            print(f"\n[{idx+1}/{len(popular_searches)}] Scheduling search: '{search}'")
            futures.append(executor.submit(process_search, search, headers))
        for future in as_completed(futures):
            future.result()

if __name__ == "__main__":
    main()
