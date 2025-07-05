// server.js

const express = require('express');
const cors = require('cors');
// You'll need your database connection here as well
// const pg = require('pg'); 

const app = express();

// 1. Configure CORS
const corsOptions = {
  // This MUST be the URL of your deployed frontend
  origin: 'https://bakerydbms-frontend.onrender.com', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// This allows your server to read JSON from requests
app.use(express.json());

// 2. Define Your API Routes
// Example route from your HistoryPage component
app.get('/api/inventory_history', async (req, res) => {
  try {
    // TODO: Write the logic to get data from your PostgreSQL database
    // const result = await db.query('SELECT * FROM inventory_history ...');
    // res.json(result.rows);
    
    // For now, sending back dummy data:
    const dummyHistory = [
      { history_id: 1, date: '2025-07-04', product_name: 'Croissant', have: 50, made: 20 },
      { history_id: 2, date: '2025-07-04', product_name: 'Baguette', have: 30, made: 15 }
    ];
    res.json(dummyHistory);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add other routes for your dashboard here (e.g., /api/products)
app.get('/api/products', (req, res) => {
    // ... your logic to get products
})


// 3. Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});