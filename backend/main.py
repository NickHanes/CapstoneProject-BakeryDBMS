from fastapi import FastAPI
import psycopg2
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  # Allow your React frontend
    "http://127.0.0.1:3000", # Allow 127.0.0.1 too
]

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection function
def get_db_connection():
    return psycopg2.connect(
        dbname="bakery",
        user="nicholashanes",
        host="localhost",
        port="5432"
    )

# Pydantic models
class Product(BaseModel):
    name: str
    full_inventory: int
    current_stock: int

# Endpoint to add a new product
@app.post("/products/")
def add_product(product: Product):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO products (name, full_inventory, current_stock) VALUES (%s, %s, %s) RETURNING product_id;",
        (product.name, product.full_inventory, product.current_stock),
    )
    product_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"product_id": product_id}

# Endpoint to get products
@app.get("/products/")
async def get_products():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM products;")  # Or whatever table/fields you want
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Returning the data as a list of dictionaries
    return [{"product_id": row[0], "name": row[1], "full_inventory": row[2], "current_stock": row[3]} for row in rows]

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

    return [{"ingredient_id": row[0], "name": row[1], "stock": row[2], "unit": row[3]} for row in rows]

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

# Run the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
