// src/App.js

import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Dashboard from './Dashboard'; // Make sure this component exists
import { useState, useEffect } from "react";

// This is the correct way to get the backend API URL
const API_URL = process.env.REACT_APP_API_URL;

// HistoryPage Component (Frontend Logic)
const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch data from your backend's API endpoint
    fetch(`${API_URL}/api/inventory_history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory History</h1>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Stock ("Have")</th>
            <th className="border px-4 py-2">Produced ("Made")</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.history_id} className="border">
              <td className="border px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{entry.product_name}</td>
              <td className="border px-4 py-2">{entry.have}</td>
              <td className="border px-4 py-2">{entry.made}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main App Component (The Router)
const App = () => {
  return (
    <Router>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Bakery Dashboard</h1>
        <nav>
          <Link to="/" className="text-blue-500 underline mr-4">
            Dashboard
          </Link>
          <Link to="/history" className="text-blue-500 underline">
            Inventory History
          </Link>
        </nav>
      </div>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;