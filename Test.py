from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
from bson import ObjectId
import uvicorn

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["bakery"]
products_collection = db["products"]
inventory_collection = db["inventory"]
recipes_collection = db["recipes"]

# FastAPI app instance
app = FastAPI()

# Pydantic models
class Product(BaseModel):
    name: str
    quantity: int
    price: float

class InventoryItem(BaseModel):
    name: str
    stock: int
    unit: str  # e.g., kg, lbs, units
    product_inventory: int  # New field for product inventory tracking

class Recipe(BaseModel):
    product_name: str
    ingredients: list  # List of ingredient names and amounts

# Product endpoints
@app.post("/products/")
def add_product(product: Product):
    product_dict = product.dict()
    result = products_collection.insert_one(product_dict)
    return {"id": str(result.inserted_id)}

@app.get("/products/")
def get_products():
    products = list(products_collection.find())
    for product in products:
        product["_id"] = str(product["_id"])
    return products

# Inventory endpoints
@app.post("/inventory/")
def add_inventory_item(item: InventoryItem):
    item_dict = item.dict()
    result = inventory_collection.insert_one(item_dict)
    return {"id": str(result.inserted_id)}

@app.get("/inventory/")
def get_inventory():
    inventory = list(inventory_collection.find())
    for item in inventory:
        item["_id"] = str(item["_id"])
    return inventory

# Recipe endpoints
@app.post("/recipes/")
def add_recipe(recipe: Recipe):
    recipe_dict = recipe.dict()
    result = recipes_collection.insert_one(recipe_dict)
    return {"id": str(result.inserted_id)}

@app.get("/recipes/")
def get_recipes():
    recipes = list(recipes_collection.find())
    for recipe in recipes:
        recipe["_id"] = str(recipe["_id"])
    return recipes

# Run the FastAPI server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
