from fastapi import FastAPI
import psycopg2
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from starlette.requests import Request
from pathlib import Path
import os

def get_db_connection():
    # Get the database URL from the environment variables.
    db_url = os.getenv("DATABASE_URL")

    # This check will now raise an error if the URL is missing or empty.
    if not db_url:
        raise ValueError("FATAL: DATABASE_URL environment variable is not set or is empty.")

    # Connect using the URL from the environment.
    conn = psycopg2.connect(db_url)
    return conn

app = FastAPI()

origins = [
    "http://localhost:3000",  # Allow your React frontend
    "http://127.0.0.1:3000", # Allow 127.0.0.1 too
    "https://bakerydbms-frontend.onrender.com",
    "https://bakerydbms.onrender.com"
]

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class Product(BaseModel):
    name: str
    current_stock: int
    full_inventory: int

class StockUpdate(BaseModel):
    current_stock: int
    update_date: date

# Endpoint to get products
@app.get("/products/")
async def get_products():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM products;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "product_id": int(row[0]),
            "name": row[1],
            "current_stock": int(row[2]),
            "full_inventory": row[3]
        }
        for row in rows
    ]

# Endpoint to get products that need to be made
@app.get("/production_needed/")
def get_production_needed():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            product_id, 
            name, 
            full_inventory - current_stock AS to_produce
        FROM products
        WHERE full_inventory > current_stock;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [{"product_id": row[0], "name": row[1], "to_produce": row[2]} for row in rows]

# Endpoint to get inventory
@app.get("/inventory/")
def get_inventory():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT ingredient_id, name, stock, unit FROM inventory;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [{"id": row[0], "name": row[1], "stock": row[2], "unit": row[3]} for row in rows]

# Endpoint to get recipes
@app.get("/recipes/")
def get_recipes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT recipe_id, product_id, ingredient_id, amount_needed, unit FROM recipes;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [{"recipe_id": row[0], "product_id": row[1], "ingredient_id": row[2], "amount_needed": row[3], "unit": row[4]} for row in rows]

# Endpoint to update product stock and log history
@app.put("/products/{product_id}/stock")
def update_product_stock(product_id: int, stock_update: StockUpdate):
    conn = get_db_connection()
    cur = conn.cursor()

    # Update the current_stock for the specified product
    cur.execute("""
        UPDATE products
        SET current_stock = %s
        WHERE product_id = %s;
    """, (stock_update.current_stock, product_id))
    
    # Insert the stock update into product history
    cur.execute("""
        INSERT INTO product_history (product_id, stock_date, current_stock)
        VALUES (%s, %s, %s)
        ON CONFLICT (product_id, stock_date) DO UPDATE 
        SET current_stock = EXCLUDED.current_stock;
    """, (product_id, stock_update.update_date, stock_update.current_stock))
    
    conn.commit()
    cur.close()
    conn.close()

    return {"message": f"Product {product_id} stock updated to {stock_update.current_stock} on {stock_update.update_date}."}

# Run the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
