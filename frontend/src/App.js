import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [productionNeeded, setProductionNeeded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all necessary data
    const fetchData = async () => {
      try {
        const productsRes = await axios.get("http://localhost:8000/products/");
        setProducts(productsRes.data);

        const inventoryRes = await axios.get("http://localhost:8000/inventory/");
        setInventory(inventoryRes.data);

        const recipesRes = await axios.get("http://localhost:8000/recipes/");
        setRecipes(
          recipesRes.data.map(recipe => ({
            ...recipe,
            ingredients: typeof recipe.ingredients === "string" 
              ? recipe.ingredients.split(", ") 
              : recipe.ingredients
          }))
        );

        const productionRes = await axios.get("http://localhost:8000/production_needed/");
        setProductionNeeded(productionRes.data);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bakery Dashboard</h1>

      {/* Products Section */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Full Inventory</th>
              <th className="border p-2">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.full_inventory}</td>
                <td className="border p-2">{product.current_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Inventory Section */}
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
              <tr key={item.ingredient_id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.stock}</td>
                <td className="border p-2">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recipes Section */}
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
              <tr key={recipe.recipe_id}>
                <td className="border p-2">{recipe.product_name}</td>
                <td className="border p-2">{recipe.ingredients.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Production Needed Section */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold">Production Needed</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Quantity to Produce</th>
            </tr>
          </thead>
          <tbody>
            {productionNeeded.map((item) => (
              <tr key={item.product_id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.to_produce}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
