const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        gstRate: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    subTotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    stateType: { type: String, enum: ["INTRA", "INTER"], required: true }, // INTRA = Same State (CGST+SGST), INTER = Different State (IGST)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);