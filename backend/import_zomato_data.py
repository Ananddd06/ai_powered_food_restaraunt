import csv
import json
import sys
import ast
import os

# Add backend directory to path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine, Base
from app.models.restaurant import Restaurant
from app.ml.chennai_geocoding import get_locality_coordinates

# Ensure database tables are created
Base.metadata.create_all(bind=engine)

def parse_list_string(s):
    if not s or s == "None":
        return []
    try:
        return ast.literal_eval(s)
    except:
        return [x.strip() for x in str(s).strip("[]").replace("'", "").split(",")]

def safe_float(val, default=0.0):
    try:
        return float(val)
    except:
        return default

def safe_int(val, default=0):
    try:
        return int(val)
    except:
        return default

def main():
    csv_file = "/Users/anand/Desktop/ai_powered_restarant/Zomato Chennai Listing 2020.csv"
    geojson_out = "/Users/anand/Desktop/ai_powered_restarant/Zomato_Chennai_Geocoded.geojson"
    csv_out = "/Users/anand/Desktop/ai_powered_restarant/Zomato_Chennai_Geocoded.csv"
    
    db = SessionLocal()
    features_list = []
    
    print("Starting Zomato dataset import...")
    
    with open(csv_file, 'r', encoding='utf-8') as f, \
         open(csv_out, 'w', encoding='utf-8', newline='') as fout:
        
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames + ['Latitude', 'Longitude']
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()
        
        count = 0
        added_count = 0
        for row in reader:
            location = row.get("Location", "")
            lat, lon = get_locality_coordinates(location)
            
            # Write to geocoded CSV
            out_row = dict(row)
            out_row['Latitude'] = lat
            out_row['Longitude'] = lon
            writer.writerow(out_row)
            
            # Build GeoJSON feature
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "Name": row.get("Name of Restaurant"),
                    "Address": row.get("Address"),
                    "Location": location,
                    "Cuisine": row.get("Cuisine"),
                    "Price for 2": row.get("Price for 2")
                }
            }
            features_list.append(feature)
            
            # Database Insertion
            name = row.get("Name of Restaurant", "")
            if not name:
                continue
                
            cuisines = parse_list_string(row.get("Cuisine", ""))
            features = parse_list_string(row.get("Features", ""))
            
            price_val = safe_float(row.get("Price for 2", 0))
            if price_val < 300:
                price_level = "$"
            elif price_val < 800:
                price_level = "$$"
            elif price_val < 1500:
                price_level = "$$$"
            else:
                price_level = "$$$$"
                
            rating = safe_float(row.get("Dining Rating", 4.5))
            review_count = safe_int(row.get("Dining Rating Count", 0))
            
            # Avoid duplicate inserts
            existing = db.query(Restaurant).filter(
                Restaurant.name == name,
                Restaurant.address == row.get("Address", "")
            ).first()
            
            if not existing:
                rest = Restaurant(
                    name=name,
                    address=row.get("Address", ""),
                    cuisines=cuisines,
                    features=features,
                    price_level=price_level,
                    rating=rating,
                    review_count=review_count,
                    latitude=lat,
                    longitude=lon,
                    website=row.get("Zomato URL", "")
                )
                db.add(rest)
                added_count += 1
                
            count += 1
            if count % 1000 == 0:
                print(f"Processed {count} rows...")
                db.commit()
                
        db.commit()
        
    geojson = {
        "type": "FeatureCollection",
        "features": features_list
    }
    with open(geojson_out, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)
        
    print(f"\nImport completed successfully!")
    print(f"Total processed: {count}")
    print(f"New restaurants added to DB: {added_count}")
    print(f"Geocoded CSV saved for QGIS: {csv_out}")
    print(f"GeoJSON saved for QGIS: {geojson_out}")

if __name__ == "__main__":
    main()
