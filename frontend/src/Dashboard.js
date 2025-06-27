import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [productionNeeded, setProductionNeeded] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await axios.get(`${API_URL}/api/products/`);
        setProducts(productsRes.data);

        const inventoryRes = await axios.get(`${API_URL}/api/inventory/`);
        setInventory(inventoryRes.data);

        const recipesRes = await axios.get(`${API_URL}/api/recipes/`);
        setRecipes(
          recipesRes.data.map(recipe => ({
            ...recipe,
            ingredients: typeof recipe.ingredients === "string" 
              ? recipe.ingredients.split(", ") 
              : recipe.ingredients
          }))
        );

        const productionRes = await axios.get(`${API_URL}/api/production_needed/`);
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

  const updateStock = async (productId, newStock) => {
    try {
      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }
      
      await axios.put(`${API_URL}/api/products/${productId}/stock`, {
        current_stock: newStock
      });

      // Add to product history with selected date
      await axios.post(`${API_URL}/api/product_history/`, {
        product_id: productId,
        date: selectedDate.toISOString().split("T")[0],
        have: newStock,
      });
  
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.product_id === productId
            ? { ...product, current_stock: newStock }
            : product
        )
      );
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Error updating stock. Try again.');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bakery Dashboard</h1>
      
      {/* Date Picker */}
      <div className="mt-4">
        <label className="font-semibold">Select Date: </label>
        <DatePicker selected={selectedDate} onChange={setSelectedDate} className="border p-2" />
      </div>

      {/* Products Section */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Current Stock</th>
              <th className="border p-2">Full Inventory</th>
              <th className="border p-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={product.current_stock}
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      setProducts((prevProducts) =>
                        prevProducts.map((p) =>
                          p.product_id === product.product_id
                            ? { ...p, current_stock: newStock }
                            : p
                        )
                      );
                    }}
                    className="w-16 p-1 border text-center"
                  />
                </td>
                <td className="border p-2">{product.full_inventory}</td>
                <td className="border p-2">
                  <button
                    onClick={() => updateStock(product.product_id, product.current_stock)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
