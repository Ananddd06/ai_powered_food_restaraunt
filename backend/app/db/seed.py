from sqlalchemy.orm import Session
from app.models.restaurant import Restaurant

MOCK_RESTAURANTS_DATA = [
  {
    "id": "rest-1",
    "name": "Osteria Del Sole",
    "tagline": "Authentic wood-fired Neapolitan pizza and handmade pasta.",
    "description": "Family-owned Italian trattoria serving rustic regional dishes, fresh seafood, and artisanal pizzas baked in a 900-degree stone kiln.",
    "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "review_count": 342,
    "price_level": "$$",
    "cuisines": ["Italian", "Pizza", "Pasta"],
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "452 Hayes St, San Francisco, CA 94102",
    "phone": "+1 (415) 555-0192",
    "website": "https://osteriadelsole.example.com",
    "is_open_now": True,
    "features": ["Outdoor Seating", "Wine Bar", "Takeout", "Reservations"],
    "opening_hours": {"Mon-Sun": "11:30 AM - 10:00 PM"}
  },
  {
    "id": "rest-2",
    "name": "Sakura Omakase & Sushi",
    "tagline": "Precision Japanese omakase & fresh wild-caught sashimi.",
    "description": "High-end intimate sushi counter presenting seasonal tasting menus, Edo-style nigiri, and rare Japanese sake pairings.",
    "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "review_count": 512,
    "price_level": "$$$$",
    "cuisines": ["Japanese", "Sushi", "Asian"],
    "latitude": 37.7833,
    "longitude": -122.4167,
    "address": "210 Geary St, San Francisco, CA 94108",
    "phone": "+1 (415) 555-0144",
    "website": "https://sakurasushi.example.com",
    "is_open_now": True,
    "features": ["Omakase Counter", "Sake Bar", "Chef Tasting", "Valet Parking"],
    "opening_hours": {"Tue-Sun": "5:00 PM - 11:00 PM"}
  },
  {
    "id": "rest-3",
    "name": "Taj Mahal Palace",
    "tagline": "Rich North & South Indian curries with hot tandoori breads.",
    "description": "Vibrant Indian kitchen crafting aromatic tikka masala, biryanis, dal makhani, and freshly flipped garlic naan.",
    "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "rating": 4.7,
    "review_count": 289,
    "price_level": "$$",
    "cuisines": ["Indian", "Curry", "Vegetarian Friendly"],
    "latitude": 37.7695,
    "longitude": -122.4269,
    "address": "580 Valencia St, San Francisco, CA 94110",
    "phone": "+1 (415) 555-0188",
    "website": "https://tajmahalpalace.example.com",
    "is_open_now": True,
    "features": ["Vegan Options", "Halal Certified", "Buffet Lunch", "Delivery"],
    "opening_hours": {"Mon-Sun": "11:00 AM - 10:30 PM"}
  },
  {
    "id": "rest-4",
    "name": "Taqueria El Corazon",
    "tagline": "Sizzling street tacos, fresh guacamole, and craft margaritas.",
    "description": "Lively Mexican eatery famous for slow-braised al pastor, birria tacos with consommé, and house-made salsa flights.",
    "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "rating": 4.6,
    "review_count": 420,
    "price_level": "$",
    "cuisines": ["Mexican", "Tacos", "Latin"],
    "latitude": 37.7599,
    "longitude": -122.4148,
    "address": "3105 24th St, San Francisco, CA 94110",
    "phone": "+1 (415) 555-0133",
    "website": "https://elcorazontacos.example.com",
    "is_open_now": True,
    "features": ["Patio", "Happy Hour", "Margarita Pitchers", "Late Night"],
    "opening_hours": {"Mon-Sun": "10:00 AM - 12:00 AM"}
  },
  {
    "id": "rest-5",
    "name": "Green Garden Bistro",
    "tagline": "Plant-based gourmet bowls, organic smoothies, and gluten-free wraps.",
    "description": "Modern eco-friendly cafe serving 100% plant-based nourish bowls, cold-pressed juices, and raw vegan desserts.",
    "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "review_count": 198,
    "price_level": "$$",
    "cuisines": ["Vegan", "Healthy", "Gluten Free"],
    "latitude": 37.7892,
    "longitude": -122.4012,
    "address": "120 Battery St, San Francisco, CA 94111",
    "phone": "+1 (415) 555-0166",
    "website": "https://greengardenbistro.example.com",
    "is_open_now": True,
    "features": ["100% Organic", "Gluten-Free Kitchen", "Smoothie Bar", "Eco Packaging"],
    "opening_hours": {"Mon-Sat": "8:00 AM - 8:00 PM"}
  }
]

def seed_restaurants_if_empty(db: Session):
    existing_count = db.query(Restaurant).count()
    if existing_count == 0:
        for item in MOCK_RESTAURANTS_DATA:
            r = Restaurant(**item)
            db.add(r)
        db.commit()
