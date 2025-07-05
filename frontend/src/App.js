import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Dashboard from './Dashboard'; // Import Dashboard component
import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const cors = require('cors'); // Import the cors package

// --- Add this section ---
const corsOptions = {
  origin: 'https://bakerydbms-frontend.onrender.com', // Your frontend's URL
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// History Page
const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
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
              <td className="border px-4 py-2">{entry.date}</td>
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

const App = () => {
  return (
    <Router>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Bakery Dashboard</h1>
        <Link to="/" className="text-blue-500 underline mb-4 block">
          Go to Dashboard
        </Link>
        <Link to="/history" className="text-blue-500 underline mb-4 block">
          View Inventory History
        </Link>
      </div>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
