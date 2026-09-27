const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// 1. Middlewares PEHLE aane chahiye
app.use(cors());
app.use(express.json());

// 2. Routes Modules
const authRoutes = require("./routes/authRoutes");
const partyRoutes = require("./routes/partyRoutes");
const itemRoutes = require("./routes/itemRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

// 3. Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/invoices", invoiceRoutes);
// 4. Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/accounting";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(`Server running on http://localhost:5000`));
  })
  .catch((err) => console.log("DB Connection Error:", err));