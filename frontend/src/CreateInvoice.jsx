import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function CreateInvoice() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  // Party Selection & Search States
  const [partySearch, setPartySearch] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const partyDropdownRef = useRef(null);

  const [stateType, setStateType] = useState("INTRA");
  const [invoiceItems, setInvoiceItems] = useState([
    { item: "", name: "", quantity: 1, price: 0, gstRate: 0, amount: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partyRes = await axios.get("http://localhost:5000/api/parties");
        const itemRes = await axios.get("http://localhost:5000/api/items");
        setParties(partyRes.data || []);
        setAvailableItems(itemRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        partyDropdownRef.current &&
        !partyDropdownRef.current.contains(event.target)
      ) {
        setIsPartyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Parties based on Search Input
  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setPartySearch(party.name);
    setIsPartyDropdownOpen(false);
  };

  const handleItemSelect = (index, itemId) => {
    const selectedObj = availableItems.find((i) => i._id === itemId);
    const updated = [...invoiceItems];
    if (selectedObj) {
      updated[index] = {
        item: selectedObj._id,
        name: selectedObj.name,
        quantity: 1,
        price: selectedObj.sellingPrice,
        gstRate: selectedObj.gstRate,
        amount: selectedObj.sellingPrice * 1
      };
    }
    setInvoiceItems(updated);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = Number(value);
    updated[index].amount = updated[index].quantity * updated[index].price;
    setInvoiceItems(updated);
  };

  const addRow = () => {
    setInvoiceItems([
      ...invoiceItems,
      { item: "", name: "", quantity: 1, price: 0, gstRate: 0, amount: 0 }
    ]);
  };

  const removeRow = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = invoiceItems.reduce((acc, row) => acc + row.amount, 0);
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  invoiceItems.forEach((row) => {
    const taxVal = (row.amount * row.gstRate) / 100;
    if (stateType === "INTRA") {
      totalCgst += taxVal / 2;
      totalSgst += taxVal / 2;
    } else {
      totalIgst += taxVal;
    }
  });

  const grandTotal = subTotal + totalCgst + totalSgst + totalIgst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParty) return alert("Please select a Customer / Party!");
    if (invoiceItems.some((i) => !i.item))
      return alert("Please select valid items!");

    try {
      const payload = {
        party: selectedParty._id,
        items: invoiceItems,
        subTotal,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        grandTotal,
        stateType
      };

      await axios.post("http://localhost:5000/api/invoices", payload);
      alert("Invoice Created Successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(
        "Error creating invoice: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <div style={{ padding: "30px 20px", maxWidth: "1150px", margin: "auto" }}>
        
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Create Tax / Sales Invoice</h2>
          <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
            New Invoice
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0" }}>
          
          {/* Party & Tax Type Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginBottom: "30px" }}>
            
            {/* Custom Searchable Customer Dropdown */}
            <div ref={partyDropdownRef} style={{ position: "relative" }}>
              <label style={{ fontWeight: "600", fontSize: "14px", color: "#334155", display: "block", marginBottom: "8px" }}>
                Customer / Party Name <span style={{ color: "#ef4444" }}>*</span>
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={partySearch}
                  onChange={(e) => {
                    setPartySearch(e.target.value);
                    setSelectedParty(null);
                    setIsPartyDropdownOpen(true);
                  }}
                  onFocus={() => setIsPartyDropdownOpen(true)}
                  placeholder="Type customer name to search..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                {selectedParty && (
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#16a34a", fontSize: "12px", fontWeight: "600" }}>
                    ✓ Selected
                  </span>
                )}
              </div>

              {/* Floating Dropdown Items */}
              {isPartyDropdownOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: "220px", overflowY: "auto", marginTop: "4px" }}>
                  {filteredParties.length > 0 ? (
                    filteredParties.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelectParty(p)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "14px"
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <span style={{ fontWeight: "500", color: "#0f172a" }}>{p.name}</span>
                        <span style={{ fontSize: "12px", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                          {p.partyType || "Customer"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
                      No matching customer found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GST Transaction Type Selection */}
            <div>
              <label style={{ fontWeight: "600", fontSize: "14px", color: "#334155", display: "block", marginBottom: "8px" }}>
                GST Transaction Type
              </label>
              <select
                value={stateType}
                onChange={(e) => setStateType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#fff" }}
              >
                <option value="INTRA">Intra-State (CGST + SGST)</option>
                <option value="INTER">Inter-State (IGST)</option>
              </select>
            </div>
          </div>

          {/* Items Table Section */}
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginBottom: "12px" }}>Items & Products</h3>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", marginBottom: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#475569", textAlign: "left", fontSize: "13px" }}>
                <th style={{ padding: "12px", width: "35%" }}>PRODUCT / SERVICE</th>
                <th style={{ padding: "12px", width: "12%" }}>QTY</th>
                <th style={{ padding: "12px", width: "18%" }}>RATE (₹)</th>
                <th style={{ padding: "12px", width: "12%" }}>GST %</th>
                <th style={{ padding: "12px", width: "18%" }}>AMOUNT (₹)</th>
                <th style={{ padding: "12px", width: "5%", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px" }}>
                    <select
                      value={row.item}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    >
                      <option value="">Select Item</option>
                      {availableItems.map((item) => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => handleRowChange(index, "price", e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </td>
                  <td style={{ padding: "10px", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                    {row.gstRate}%
                  </td>
                  <td style={{ padding: "10px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    ₹{row.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {invoiceItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        style={{ backgroundColor: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addRow}
            style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px dashed #2563eb", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
          >
            + Add Row
          </button>

          {/* Invoice Summary Card */}
          <div style={{ marginTop: "20px", float: "right", width: "320px", backgroundColor: "#f8fafc", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#475569" }}>
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            
            {stateType === "INTRA" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#64748b" }}>
                  <span>CGST</span>
                  <span>₹{totalCgst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#64748b" }}>
                  <span>SGST</span>
                  <span>₹{totalSgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#64748b" }}>
                <span>IGST</span>
                <span>₹{totalIgst.toFixed(2)}</span>
              </div>
            )}
            
            <hr style={{ border: "none", borderTop: "1px solid #cbd5e1", margin: "12px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
              <span>Total Amount</span>
              <span style={{ color: "#2563eb" }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ clear: "both", paddingTop: "24px" }}>
            <button
              type="submit"
              style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)" }}
            >
              Save & Print Invoice
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateInvoice;