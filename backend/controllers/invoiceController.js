const Invoice = require("../models/Invoice");

// Create New Invoice
const createInvoice = async (req, res) => {
  try {
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

    const invoice = await Invoice.create({
      ...req.body,
      invoiceNumber,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("party");
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createInvoice, getInvoices };