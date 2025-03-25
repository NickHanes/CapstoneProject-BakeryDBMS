import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  const fetchHistory = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0]; 
      const response = await axios.get(`http://localhost:8000/history?date=${formattedDate}`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  return (
    <div>
      <h1>Product Stock History</h1>

      <label>Select Date: </label>
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock Had</th>
            <th>Stock Made</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.product_name}</td>
              <td>{entry.have}</td>
              <td>{entry.made}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
