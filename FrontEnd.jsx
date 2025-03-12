import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/products/").then((res) => setProducts(res.data));
    axios.get("http://localhost:8000/inventory/").then((res) => setInventory(res.data));
    axios.get("http://localhost:8000/recipes/").then((res) => setRecipes(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bakery Dashboard</h1>
      
      <section className="mt-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.quantity}</td>
                <td className="border p-2">${product.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.stock}</td>
                <td className="border p-2">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Ingredients</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe._id}>
                <td className="border p-2">{recipe.product_name}</td>
                <td className="border p-2">{recipe.ingredients.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
