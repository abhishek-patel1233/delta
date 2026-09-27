import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <nav style={{
      backgroundColor: "#2c3e50",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "#fff"
    }}>
      <h2 style={{ margin: 0, fontSize: "20px" }}>Accounting Software</h2>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</Link>
        <Link to="/parties" style={{ color: "#fff", textDecoration: "none" }}>Parties</Link>
        <Link to="/items" style={{ color: "#fff", textDecoration: "none" }}>Items & Stock</Link>
        <Link to="/invoices" style={{ color: "#fff", textDecoration: "none" }}>All Invoices</Link>
        <Link to="/pricing-calculator" style={{ color: "#38bdf8", fontWeight: "bold" }}>
            Quotation Calculator
          </Link>
        <Link to="/create-invoice" style={{ color: "#f1c40f", fontWeight: "bold", textDecoration: "none" }}>+ Create Invoice</Link>
        <button 
          onClick={handleLogout} 
          style={{
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;