import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function PartyManager() {
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "Customer", // <--- Added for Backend Schema Validation
    partyType: "Customer",
    gstin: "",
    phone: "",
    address: "",
    state: "Madhya Pradesh",
    openingBalance: 0,
  });

  const fetchParties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/parties");
      setParties(res.data);
    } catch (err) {
      console.error("Error fetching parties:", err);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    if (e.target.name === "partyType" || e.target.name === "type") {
      setFormData({ ...formData, partyType: value, type: value });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending both 'type' and 'partyType' to satisfy schema validation
      const payload = {
        ...formData,
        type: formData.partyType || formData.type,
      };

      await axios.post("http://localhost:5000/api/parties", payload);
      alert("Party Added Successfully!");
      setFormData({
        name: "",
        type: "Customer",
        partyType: "Customer",
        gstin: "",
        phone: "",
        address: "",
        state: "Madhya Pradesh",
        openingBalance: 0,
      });
      fetchParties();
    } catch (err) {
      alert("Error adding party: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>Customer & Vendor Master</h2>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Manage all clients, suppliers, GST numbers, and addresses.</p>
        </div>

        {/* Add Party Form */}
        <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>+ Add New Customer / Supplier</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px" }}>
              
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Party Name</label>
                <input type="text" name="name" placeholder="Business / Contact Name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Party Type</label>
                <select name="partyType" value={formData.partyType} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Phone Number</label>
                <input type="text" name="phone" placeholder="10-Digit Mobile" value={formData.phone} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>GSTIN (Optional)</label>
                <input type="text" name="gstin" placeholder="15-Digit GST Number" value={formData.gstin} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>State</label>
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Opening Balance (₹)</label>
                <input type="number" name="openingBalance" placeholder="0" value={formData.openingBalance} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Address</label>
              <input type="text" name="address" placeholder="Billing / Delivery Address" value={formData.address} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
            </div>

            <button type="submit" style={{ padding: "10px 24px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
              Save Party Details
            </button>
          </form>
        </div>

        {/* List Table */}
        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", fontSize: "18px" }}>Registered Parties</h3>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "14px", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Party Name</th>
                <th style={{ padding: "12px" }}>Type</th>
                <th style={{ padding: "12px" }}>Phone</th>
                <th style={{ padding: "12px" }}>GSTIN</th>
                <th style={{ padding: "12px" }}>State</th>
                <th style={{ padding: "12px" }}>Opening Bal</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party._id} style={{ borderBottom: "1px solid #e2e8f0", fontSize: "14px", color: "#334155" }}>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{party.name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: "12px", 
                      fontSize: "12px", 
                      fontWeight: "600",
                      backgroundColor: (party.type || party.partyType) === "Supplier" ? "#fef3c7" : "#dbeafe", 
                      color: (party.type || party.partyType) === "Supplier" ? "#d97706" : "#2563eb" 
                    }}>
                      {party.type || party.partyType || "Customer"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{party.phone}</td>
                  <td style={{ padding: "12px" }}>{party.gstin || "URP (Unregistered)"}</td>
                  <td style={{ padding: "12px" }}>{party.state}</td>
                  <td style={{ padding: "12px" }}>₹{party.openingBalance || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default PartyManager;