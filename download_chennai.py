import urllib.request
import json
import os

url = "https://nominatim.openstreetmap.org/search.php?q=Chennai+city&polygon_geojson=1&format=jsonv2"
headers = {'User-Agent': 'Mozilla/5.0'}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

for item in data:
    if item.get('osm_type') == 'relation' and 'geojson' in item:
        geojson = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": {"name": item.get('display_name')},
                "geometry": item['geojson']
            }]
        }
        
        with open('Chennai_City_Boundary.geojson', 'w') as f:
            json.dump(geojson, f)
        print("Successfully created Chennai_City_Boundary.geojson")
        break
