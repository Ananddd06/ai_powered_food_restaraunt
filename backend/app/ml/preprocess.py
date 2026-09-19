"""
Data Preprocessing Script for Zomato Chennai Listing 2020 dataset.
Cleans raw restaurant data, parses ratings & prices, assigns GIS coordinates,
and generates structured text descriptions for embedding generation.
"""

import ast
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List

from app.ml.chennai_geocoding import get_locality_coordinates

DATASET_PATH = Path("/Users/anand/Desktop/ai_powered_restarant/Dataset/Zomato Chennai Listing 2020.csv")
OUTPUT_DIR = Path("/Users/anand/Desktop/ai_powered_restarant/backend/data")
OUTPUT_FILE = OUTPUT_DIR / "processed_chennai_restaurants.json"


def parse_list_field(val: str) -> List[str]:
    """Safely parse literal Python array representation in CSV (e.g. "['Biryani', ' North Indian']")."""
    if not val or val == "None" or val == "[]":
        return []
    val = val.strip()
    try:
        if val.startswith("[") and val.endswith("]"):
            parsed = ast.literal_eval(val)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if item]
    except Exception:
        pass
    # Fallback comma split
    clean = re.sub(r"[\[\]\'\"]", "", val)
    return [item.strip() for item in clean.split(",") if item.strip()]


def parse_float(val: Any, default: float = 0.0) -> float:
    """Safely convert string/number to float."""
    if val is None:
        return default
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ("none", "does not offer dining", "does not offer delivery", "-"):
        return default
    try:
        return float(val_str)
    except ValueError:
        # Extract first numeric sequence (e.g. "4.2")
        match = re.search(r"(\d+\.\d+|\d+)", val_str)
        if match:
            return float(match.group(1))
        return default


def parse_int(val: Any, default: int = 0) -> int:
    """Safely convert string/number to int."""
    if val is None:
        return default
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ("none", "does not offer dining", "does not offer delivery", "-"):
        return default
    try:
        return int(float(val_str))
    except ValueError:
        match = re.search(r"\d+", val_str)
        if match:
            return int(match.group(0))
        return default


def create_restaurant_description(row: Dict[str, Any]) -> str:
    """
    Format restaurant into a rich semantic string for dense vector embedding.
    Example:
    'Anjappar, Chettinad, South Indian cuisine. Price for two: ₹500. Rating: 4.3 (1500 reviews).
     Location: Anna Nagar, Chennai. Top Dishes: Mutton Biryani, Chicken 65. Features: Home Delivery, Indoor Seating.'
    """
    name = row["name"]
    location = row["location"]
    cuisines = ", ".join(row["cuisines"]) if row["cuisines"] else "Multi-cuisine"
    price = row["price_for_two"]
    rating = row["dining_rating"] if row["dining_rating"] > 0 else row["delivery_rating"]
    top_dishes = ", ".join(row["top_dishes"]) if row["top_dishes"] else "Popular specialties"
    features = ", ".join(row["features"]) if row["features"] else "Standard dining"
    address = row["address"]

    desc = (
        f"{name} is located in {location}, Chennai. "
        f"Cuisines offered: {cuisines}. "
        f"Average price for two: ₹{price:.0f}. "
        f"Rating: {rating:.1f} stars out of 5. "
        f"Famous top dishes: {top_dishes}. "
        f"Key features: {features}. "
        f"Address: {address}."
    )
    return desc


def preprocess_dataset() -> List[Dict[str, Any]]:
    """Reads raw CSV dataset, cleans rows, attaches GIS coordinates and builds JSON dataset."""
    import csv

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    cleaned_restaurants = []
    seen_keys = set()

    with open(DATASET_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            name = row.get("Name of Restaurant", "").strip()
            location = row.get("Location", "").strip()
            address = row.get("Address", "").strip()
            zomato_url = row.get("Zomato URL", "").strip()

            if not name:
                continue

            # Deduplication key
            dedup_key = (name.lower(), location.lower(), address.lower())
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            cuisines = parse_list_field(row.get("Cuisine", ""))
            top_dishes = parse_list_field(row.get("Top Dishes", ""))
            features = parse_list_field(row.get("Features", ""))

            price_for_two = parse_float(row.get("Price for 2"), default=400.0)
            dining_rating = parse_float(row.get("Dining Rating"), default=0.0)
            dining_rating_count = parse_int(row.get("Dining Rating Count"), default=0)
            delivery_rating = parse_float(row.get("Delivery Rating"), default=0.0)
            delivery_rating_count = parse_int(row.get("Delivery Rating Count"), default=0)

            # Overall rating & popularity calculation
            overall_rating = max(dining_rating, delivery_rating)
            if overall_rating == 0.0:
                overall_rating = 3.8  # Reasonable baseline

            total_rating_count = dining_rating_count + delivery_rating_count

            # GIS Lat / Long coordinates lookup
            lat, lon = get_locality_coordinates(location)

            item = {
                "id": idx + 1,
                "name": name,
                "zomato_url": zomato_url,
                "address": address,
                "location": location,
                "latitude": lat,
                "longitude": lon,
                "cuisines": cuisines,
                "top_dishes": top_dishes,
                "price_for_two": price_for_two,
                "dining_rating": dining_rating,
                "dining_rating_count": dining_rating_count,
                "delivery_rating": delivery_rating,
                "delivery_rating_count": delivery_rating_count,
                "overall_rating": overall_rating,
                "total_rating_count": total_rating_count,
                "features": features,
            }

            # Generate semantic textual description
            item["description"] = create_restaurant_description(item)
            cleaned_restaurants.append(item)

    print(f"Preprocessed {len(cleaned_restaurants)} unique restaurants out of original dataset.")

    # Save to JSON file
    with open(OUTPUT_FILE, mode="w", encoding="utf-8") as f:
        json.dump(cleaned_restaurants, f, indent=2, ensure_ascii=False)

    print(f"Saved cleaned dataset to {OUTPUT_FILE}")
    return cleaned_restaurants


if __name__ == "__main__":
    preprocess_dataset()
