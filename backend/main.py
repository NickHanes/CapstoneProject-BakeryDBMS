from fastapi import FastAPI
import psycopg2
from pydantic import BaseModel

app = FastAPI()

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


@app.get("/products/")
async def get_products():
    return {"products": "your data here"}

@app.get("/inventory/")
async def get_inventory():
    return {"inventory": "your data here"}

@app.get("/recipes/")
async def get_recipes():
    return {"recipes": "your data here"}

# Run the FastAPI server (if running as a script)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
