from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from typing import List, Optional
import os
from square.client import Client
from square.http.auth.o_auth_2 import BearerAuthCredentials

# FastAPI app setup
app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./bakery.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Square API setup

# Initialize the client with the access token from an environment variable
client = Client(
    bearer_auth_credentials=BearerAuthCredentials(
        access_token='EAAAlhxlsK6GbN5nLdypRF835boEUpNye7F4GjQkXBQOiRI8bCff--wvsK0EYsYg'
    )
)

# Now you can use the client to make API calls
result = client.locations.list_locations()
if result.is_success():
    print(result.body)
else:
    print(result.errors)


orders_api = client.orders

# Models
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False)

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    low_stock_threshold = Column(Float, nullable=False)

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    amount_used = Column(Float, nullable=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    total_price = Column(Float, nullable=False)

# Initialize DB
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints for your local system
@app.get("/ingredients", response_model=List[dict])
def get_ingredients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Ingredient).offset(skip).limit(limit).all()

@app.post("/ingredients")
def create_ingredient(name: str, quantity: float, unit: str, low_stock_threshold: float, db: Session = Depends(get_db)):
    ingredient = Ingredient(name=name, quantity=quantity, unit=unit, low_stock_threshold=low_stock_threshold)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient

@app.put("/ingredients/{ingredient_id}")
def update_ingredient(ingredient_id: int, quantity: float, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    ingredient.quantity = quantity
    db.commit()
    db.refresh(ingredient)
    return ingredient

@app.delete("/ingredients/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(ingredient)
    db.commit()
    return {"message": "Ingredient deleted"}

@app.get("/products", response_model=List[dict])
def get_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Product).offset(skip).limit(limit).all()

@app.post("/products")
def create_product(name: str, price: float, db: Session = Depends(get_db)):
    product = Product(name=name, price=price)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.get("/recipes", response_model=List[dict])
def get_recipes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Recipe).offset(skip).limit(limit).all()

@app.get("/orders", response_model=List[dict])
def get_orders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()

@app.post("/orders")
def create_order(product_id: int, quantity: int, date: str, total_price: float, db: Session = Depends(get_db)):
    order = Order(product_id=product_id, quantity=quantity, date=date, total_price=total_price)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@app.get("/ingredients/search")
def search_ingredients(name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Ingredient)
    if name:
        query = query.filter(Ingredient.name.contains(name))
    return query.all()

@app.get("/products/search")
def search_products(name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Product)
    if name:
        query = query.filter(Product.name.contains(name))
    return query.all()

# Square API Integration
@app.get("/square/orders")
async def get_square_orders(db: Session = Depends(get_db)):
    try:
        # Replace with your actual Square location ID
        location_id = "YOUR_SQUARE_LOCATION_ID"
        result = orders_api.list_orders(location_id)
        
        if result.is_success():
            square_orders = result.body['orders']
            # Process the orders (e.g., sync with local database)
            for order in square_orders:
                order_id = order['id']
                total_price = order['total_money']['amount'] / 100  # Convert to dollars (Square returns in cents)
                date = order['created_at']
                
                db_order = Order(product_id=1, quantity=1, date=date, total_price=total_price)  # Example data
                db.add(db_order)
                db.commit()

            return {"message": "Orders fetched and processed successfully", "orders": square_orders}
        else:
            return {"error": "Failed to fetch orders from Square"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/process_square_order")
async def process_square_order(order_id: str, db: Session = Depends(get_db)):
    # Fetch the order from Square by its ID
    result = orders_api.retrieve_order(order_id)
    
    if result.is_success():
        order = result.body['order']
        
        # Extract the product(s) and quantity from the order
        for line_item in order['line_items']:
            product_id = line_item['catalog_object_id']
            quantity = line_item['quantity']
            
            # Get the corresponding recipe for the product
            recipe = db.query(Recipe).filter(Recipe.product_id == product_id).first()
            if recipe:
                for ingredient in recipe.ingredients:
                    # Update the ingredient quantity (decrease based on order quantity)
                    ingredient.quantity -= ingredient.amount_used * quantity
                    db.commit()  # Save changes to the database

        return {"message": "Order processed successfully"}
    else:
        return {"error": "Failed to retrieve order from Square"}

@app.post("/square/webhook")
async def square_webhook(payload: dict):
    event = payload.get('event', {})
    
    # Check for specific events, such as "ORDER_CREATED"
    if event['type'] == 'ORDER_CREATED':
        order_id = event['data']['object']['id']
        
        # Process the new order
        await process_square_order(order_id)
    
    return {"message": "Webhook received successfully"}
