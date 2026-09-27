import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import PartyManager from "./PartyManager";
import ItemManager from "./ItemManager";
import CreateInvoice from "./CreateInvoice";
import InvoiceList from "./InvoiceList";
import DynamicPricingCalculator from "./PricingCalculator";
function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/parties" element={<PartyManager />} />
      <Route path="/items" element={<ItemManager />} />
      <Route path="/create-invoice" element={<CreateInvoice />} />
      <Route path="/invoices" element={<InvoiceList />} />
      <Route path="/pricing-calculator" element={<DynamicPricingCalculator />} />
    </Routes>
  );
}

export default App;