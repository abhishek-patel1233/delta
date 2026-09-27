import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function ItemManager() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    hsnCode: "",
    unit: "Pcs",
    purchasePrice: "",
    sellingPrice: "",
    gstRate: 18,
    openingStock: 0,
  });

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/items", formData);
      alert("Item Added Successfully!");
      setFormData({
        name: "",
        hsnCode: "",
        unit: "Pcs",
        purchasePrice: "",
        sellingPrice: "",
        gstRate: 18,
        openingStock: 0,
      });
      fetchItems();
    } catch (err) {
      alert("Error adding item");
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto" }}>
        <h2>Item & Inventory Master</h2>

        {/* Add Item Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3>Add New Product / Service</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required style={{ padding: "8px" }} />
            <input type="text" name="hsnCode" placeholder="HSN/SAC Code" value={formData.hsnCode} onChange={handleChange} required style={{ padding: "8px" }} />
            
            <select name="unit" value={formData.unit} onChange={handleChange} style={{ padding: "8px" }}>
              <option value="Pcs">Pcs</option>
              <option value="Kg">Kg</option>
              <option value="Meter">Meter</option>
              <option value="Box">Box</option>
              <option value="Litre">Litre</option>
            </select>

            <select name="gstRate" value={formData.gstRate} onChange={handleChange} style={{ padding: "8px" }}>
              <option value="0">0% (Exempted)</option>
              <option value="5">5% GST</option>
              <option value="12">12% GST</option>
              <option value="18">18% GST</option>
              <option value="28">28% GST</option>
            </select>

            <input type="number" name="purchasePrice" placeholder="Purchase Price (₹)" value={formData.purchasePrice} onChange={handleChange} required style={{ padding: "8px" }} />
            <input type="number" name="sellingPrice" placeholder="Selling Price (₹)" value={formData.sellingPrice} onChange={handleChange} required style={{ padding: "8px" }} />
            <input type="number" name="openingStock" placeholder="Opening Stock Qty" value={formData.openingStock} onChange={handleChange} style={{ padding: "8px" }} />
          </div>
          <button type="submit" style={{ marginTop: "15px", padding: "10px 20px", backgroundColor: "#2ecc71", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Save Item</button>
        </form>

        {/* Items Table */}
        <h3>Product & Service List</h3>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
          <thead>
            <tr style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
              <th>Item Name</th>
              <th>HSN Code</th>
              <th>Unit</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>GST %</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.hsnCode}</td>
                <td>{item.unit}</td>
                <td>₹{item.purchasePrice}</td>
                <td>₹{item.sellingPrice}</td>
                <td>{item.gstRate}%</td>
                <td>{item.openingStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItemManager;