"""
Chennai Localities GIS Coordinates Registry.
Maps Chennai neighborhood names to (latitude, longitude) coordinates.
"""
from typing import Dict, Tuple

# Comprehensive dictionary of Chennai localities and their coordinates (lat, lon)
CHENNAI_LOCALITIES: Dict[str, Tuple[float, float]] = {
    # Central & South-Central Chennai
    "T. Nagar": (13.0418, 80.2341),
    "T.Nagar": (13.0418, 80.2341),
    "Nungambakkam": (13.0604, 80.2496),
    "Kodambakkam": (13.0521, 80.2255),
    "Vadapalani": (13.0500, 80.2121),
    "Ashok Nagar": (13.0373, 80.2123),
    "West Mambalam": (13.0382, 80.2244),
    "Saidapet": (13.0213, 80.2231),
    "Guindy": (13.0067, 80.2206),
    "KK Nagar": (13.0410, 80.1994),
    "K.K. Nagar": (13.0410, 80.1994),

    # South Chennai & Coastal
    "Adyar": (13.0012, 80.2565),
    "Besant Nagar": (13.0003, 80.2667),
    "Mylapore": (13.0368, 80.2676),
    "Alwarpet": (13.0336, 80.2520),
    "RA Puram": (13.0285, 80.2564),
    "R.A. Puram": (13.0285, 80.2564),
    "Royapettah": (13.0537, 80.2647),
    "Thiruvanmiyur": (12.9830, 80.2594),
    "Kotturpuram": (13.0189, 80.2407),
    "ECR": (12.8986, 80.2458),
    "East Coast Road": (12.8986, 80.2458),
    "Palavakkam": (12.9602, 80.2542),
    "Neelankarai": (12.9472, 80.2554),
    "Injambakkam": (12.9247, 80.2523),
    "Akkarai": (12.9038, 80.2464),

    # IT Corridor / OMR
    "Velachery": (12.9750, 80.2207),
    "Perungudi": (12.9654, 80.2461),
    "Thuraipakkam": (12.9430, 80.2372),
    "Thoraipakkam": (12.9430, 80.2372),
    "OMR": (12.9200, 80.2300),
    "Karapakkam": (12.9150, 80.2280),
    "Sholinganallur": (12.9010, 80.2279),
    "Navallur": (12.8458, 80.2265),
    "Navalur": (12.8458, 80.2265),
    "Siruseri": (12.8276, 80.2173),
    "Padur": (12.7981, 80.2230),
    "Kelambakkam": (12.7871, 80.2215),
    "Semmancheri": (12.8732, 80.2223),
    "Madipakkam": (12.9623, 80.1986),
    "Medavakkam": (12.9174, 80.1924),
    "Keelkattalai": (12.9555, 80.1878),
    "Nanganallur": (12.9806, 80.1931),

    # West & South-West Chennai
    "Porur": (13.0382, 80.1565),
    "Ramapuram": (13.0315, 80.1817),
    "Valasaravakkam": (13.0435, 80.1742),
    "Iyyappanthangal": (13.0441, 80.1345),
    "Virugambakkam": (13.0531, 80.1923),
    "Mogappair": (13.0837, 80.1751),
    "Mogappair East": (13.0847, 80.1812),
    "Mogappair West": (13.0827, 80.1690),
    "Koyambedu": (13.0732, 80.1984),
    "Arumbakkam": (13.0664, 80.2078),
    "Ambattur": (13.1143, 80.1548),
    "Ambattur OT": (13.1180, 80.1490),
    "Avadi": (13.1147, 80.1098),
    "Poonamallee": (13.0499, 80.0886),

    # North & North-West Chennai
    "Anna Nagar": (13.0850, 80.2101),
    "Anna Nagar East": (13.0880, 80.2170),
    "Anna Nagar West": (13.0870, 80.2010),
    "Kilpauk": (13.0820, 80.2410),
    "Shenoy Nagar": (13.0784, 80.2263),
    "Aminjikarai": (13.0700, 80.2200),
    "Perambur": (13.1122, 80.2341),
    "Purasavakkam": (13.0906, 80.2541),
    "Kolathur": (13.1240, 80.2120),
    "Villivakkam": (13.1023, 80.2064),
    "Madhavaram": (13.1480, 80.2310),
    "Vyasarpadi": (13.1186, 80.2568),
    "Royapuram": (13.1096, 80.2936),
    "Washermanpet": (13.1082, 80.2831),
    "Sowcarpet": (13.0935, 80.2798),
    "George Town": (13.0891, 80.2877),
    "Tondiarpet": (13.1256, 80.2894),

    # Central & Heritage
    "Egmore": (13.0732, 80.2609),
    "Chetpet": (13.0716, 80.2415),
    "Triplicane": (13.0587, 80.2757),
    "Chintadripet": (13.0747, 80.2721),
    "Park Town": (13.0815, 80.2770),

    # Suburbs & Outer Regions
    "Tambaram": (12.9249, 80.1000),
    "Tambaram East": (12.9200, 80.1150),
    "Tambaram West": (12.9300, 80.0880),
    "Chromepet": (12.9516, 80.1462),
    "Pallavaram": (12.9675, 80.1491),
    "Selaiyur": (12.9100, 80.1340),
    "Chitlapakkam": (12.9365, 80.1402),
    "Sanatorium": (12.9410, 80.1370),
    "Meenambakkam": (12.9863, 80.1755),
    "GST Road": (12.9700, 80.1600),
    "Perungalathur": (12.9056, 80.0827),
    "Vandalur": (12.8906, 80.0813),
    "Guduvanchery": (12.8450, 80.0610),
    "Maraimalai Nagar": (12.7931, 80.0248),
    "Chengalpattu": (12.6919, 79.9769),
    "Kanchipuram": (12.8342, 79.7036),
    "Potheri": (12.8248, 80.0449),
}

# Default Chennai Center fallback (T. Nagar / Gemini Flyover area)
CHENNAI_CENTER: Tuple[float, float] = (13.0604, 80.2496)

def get_locality_coordinates(location_name: str) -> Tuple[float, float]:
    """
    Get (latitude, longitude) for a given location string in Chennai.
    Performs exact match, case-insensitive match, and substring search.
    """
    if not location_name:
        return CHENNAI_CENTER

    clean_loc = location_name.strip()
    
    # 1. Exact match
    if clean_loc in CHENNAI_LOCALITIES:
        return CHENNAI_LOCALITIES[clean_loc]

    # 2. Case insensitive match
    clean_lower = clean_loc.lower()
    for loc, coords in CHENNAI_LOCALITIES.items():
        if loc.lower() == clean_lower:
            return coords

    # 3. Substring match (e.g., "Phoenix Market City, Velachery" -> "Velachery")
    for loc, coords in CHENNAI_LOCALITIES.items():
        if loc.lower() in clean_lower or clean_lower in loc.lower():
            return coords

    # 4. Fallback default center
    return CHENNAI_CENTER

def find_nearest_locality(lat: float, lon: float) -> Tuple[str, float]:
    """Find the closest Chennai locality name and distance (km) for given GPS coordinates."""
    from app.ml.ranker import haversine_distance

    closest_name = "T. Nagar"
    min_dist = float("inf")

    for loc_name, (clat, clon) in CHENNAI_LOCALITIES.items():
        dist = haversine_distance(lat, lon, clat, clon)
        if dist < min_dist:
            min_dist = dist
            closest_name = loc_name

    return closest_name, round(min_dist, 2)


def get_all_localities() -> Dict[str, Tuple[float, float]]:
    """Returns dictionary of registered localities."""
    return CHENNAI_LOCALITIES
