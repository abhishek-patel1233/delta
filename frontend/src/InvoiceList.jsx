import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Navbar from "./Navbar";

// ---- EDIT THIS: your company details ----
const COMPANY = {
  name: "My Company Name",
  addressLines: ["Shop No. 102, Your Building", "Your Road, Area", "City, State - PIN"],
  mobiles: "+91XXXXXXXXXX / +91XXXXXXXXXX",
  email: "info@example.com",
  gstin: "23AAAAA0000A1Z5",
  stateName: "Maharashtra",
  stateCode: "27",
  pan: "AAAAA0000A",
  bankName: "Your Bank Name",
  accountNo: "000000000000",
  ifsc: "XXXX0000000",
};

const TERMS = [
  "No Warranty in Cable/Battery",
  "Warranty From Service Center/Company",
  "No Return of Sold Goods",
  "No Warranty of Burnt/Broken/Damage",
  "No Warranty Remove Serial No /Sticker",
  "Advance Payment 100%",
  "Cheque Bounce Charges Rs.500 Per Cheque",
  "For Service Take 20 to 30 Days or more",
];

// ---- Color theme (edit these to change the whole invoice's colors) ----
const THEME = {
  primary: "#1a5276",     // header band, table headers
  primaryDark: "#123a54",
  accent: "#e67e22",      // grand total highlight
  lightBg: "#eaf2f8",     // section backgrounds
  border: "#1a5276",
};

// ---- Number to words (Indian numbering system) ----
function numberToWordsIndian(num) {
  if (num === null || num === undefined || isNaN(num)) return "";
  num = Math.round(num);
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };

  const threeDigits = (n) => {
    if (n >= 100) {
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
    }
    return twoDigits(n);
  };

  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += threeDigits(crore) + " Crore ";
  if (lakh) result += threeDigits(lakh) + " Lakh ";
  if (thousand) result += threeDigits(thousand) + " Thousand ";
  if (hundred) result += threeDigits(hundred);

  return result.trim();
}

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices");
        setInvoices(res.data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };
    fetchInvoices();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: 10,
      filename: `Invoice_${selectedInvoice?.invoiceNumber || "Slip"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const grandTotal = selectedInvoice?.grandTotal || 0;
  const amountInWords = `${numberToWordsIndian(grandTotal)} Rupees Only`;

  // GST rate shown in the tax summary — taken from the first item that has one
  const gstRate = selectedInvoice?.items?.find((it) => it.gstRate)?.gstRate || 0;
  const halfRate = gstRate / 2;

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <div className="no-print">
        <Navbar />
      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          .no-print { display: none !important; }
          body, html { background-color: #fff !important; margin: 0 !important; padding: 0 !important; }
          .main-wrapper { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .printable-area {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 800px !important;
            page-break-inside: avoid;
          }
        }
        .inv-table td, .inv-table th {
          border: 1px solid ${THEME.border};
          padding: 6px 8px;
          font-size: 13px;
        }
        .inv-box { border: 2px solid ${THEME.border}; }
        .inv-section-title {
          background-color: ${THEME.primary};
          color: #fff;
          font-weight: bold;
          padding: 5px 10px;
          font-size: 13px;
        }
      `}</style>

      <div className="main-wrapper" style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
        {!selectedInvoice ? (
          <>
            <h2 style={{ textAlign: "center", fontSize: "26px", fontWeight: "bold", color: "#2c3e50", margin: "10px 0 25px" }}>
              All Sales Invoices
            </h2>

            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: THEME.primary, color: "#fff" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Invoice No</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Customer / Party</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Date</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Type</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Grand Total</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "14px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => {
                    const isIntra = inv.stateType === "INTRA";
                    return (
                      <tr
                        key={inv._id}
                        style={{
                          borderBottom: "1px solid #eef1f4",
                          backgroundColor: idx % 2 ? "#fafbfc" : "#fff",
                        }}
                      >
                        <td style={{ padding: "14px 16px", fontWeight: "bold", color: THEME.primaryDark }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: "14px 16px", color: "#555" }}>{inv.party?.name || "N/A"}</td>
                        <td style={{ padding: "14px 16px", color: "#555" }}>{new Date(inv.createdAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: isIntra ? "#1e7e34" : "#8a4b00",
                              backgroundColor: isIntra ? "#e6f7ea" : "#fff2df",
                            }}
                          >
                            {isIntra ? "Intra-State (CGST+SGST)" : "Inter-State (IGST)"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: "bold" }}>₹{inv.grandTotal?.toFixed(2)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#3498db",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            View / Print Bill
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#999" }}>
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>
            <div className="no-print" style={{ marginBottom: "15px" }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ padding: "8px 15px", backgroundColor: "#7f8c8d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                ← Back to Invoice List
              </button>
              <button
                onClick={handleDownloadPDF}
                style={{ marginLeft: "10px", padding: "8px 15px", backgroundColor: "#27ae60", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                📥 Download Clean PDF
              </button>
              <button
                onClick={handlePrint}
                style={{ marginLeft: "10px", padding: "8px 15px", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                🖨️ Print
              </button>
            </div>

            {/* Target Area for Print & PDF */}
            <div
              ref={printRef}
              className="printable-area inv-box"
              style={{ backgroundColor: "#fff", fontFamily: "Arial, sans-serif", color: "#000" }}
            >
              {/* Colored top banner */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                  color: "#fff",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>{COMPANY.name}</div>
                  <div style={{ fontSize: "12px", opacity: 0.9 }}>
                    {COMPANY.addressLines.join(", ")}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.9 }}>
                    Mob: {COMPANY.mobiles} | Email: {COMPANY.email}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: THEME.accent,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "18px",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  TAX INVOICE
                </div>
              </div>

              {/* GST / State strip */}
              <div
                style={{
                  backgroundColor: THEME.lightBg,
                  borderBottom: `2px solid ${THEME.border}`,
                  padding: "6px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: THEME.primaryDark,
                }}
              >
                <span>GSTIN/UIN: {COMPANY.gstin}</span>
                <span>State: {COMPANY.stateName} (Code: {COMPANY.stateCode})</span>
              </div>

              {/* Buyer details + Invoice meta + Terms */}
              <div style={{ display: "flex", borderBottom: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1.4, borderRight: `1px solid ${THEME.border}` }}>
                  <div className="inv-section-title">Buyer Details (Bill To)</div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontWeight: "bold" }}>{selectedInvoice.party?.name}</div>
                    <div style={{ fontSize: "13px" }}>Phone: {selectedInvoice.party?.phone || "N/A"}</div>
                    <div style={{ fontSize: "13px" }}>
                      GSTIN: {selectedInvoice.party?.gstin || "URP (Unregistered)"}
                    </div>
                  </div>

                  <div className="inv-section-title">Terms & Conditions</div>
                  <ol style={{ margin: 0, padding: "8px 8px 8px 26px", fontSize: "12px" }}>
                    {TERMS.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ol>
                </div>

                <div style={{ flex: 1 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr style={{ backgroundColor: THEME.lightBg }}>
                        <td style={{ border: `1px solid ${THEME.border}`, padding: "6px", fontWeight: "bold" }}>Invoice No</td>
                        <td style={{ border: `1px solid ${THEME.border}`, padding: "6px", fontWeight: "bold" }}>Dated</td>
                      </tr>
                      <tr>
                        <td style={{ border: `1px solid ${THEME.border}`, padding: "6px" }}>{selectedInvoice.invoiceNumber}</td>
                        <td style={{ border: `1px solid ${THEME.border}`, padding: "6px" }}>
                          {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: THEME.lightBg }}>
                        <td colSpan="2" style={{ border: `1px solid ${THEME.border}`, padding: "6px", fontWeight: "bold" }}>
                          Tax Type
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" style={{ border: `1px solid ${THEME.border}`, padding: "6px" }}>
                          {selectedInvoice.stateType === "INTRA" ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Items Table */}
              <table className="inv-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: THEME.primary, color: "#fff" }}>
                    <th>S.N</th>
                    <th style={{ textAlign: "left" }}>Description of Goods/Services</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Discount</th>
                    <th>GST %</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 ? THEME.lightBg : "#fff" }}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td><strong>{item.name}</strong></td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>{item.price?.toFixed ? item.price.toFixed(2) : item.price}</td>
                      <td style={{ textAlign: "right" }}>{(item.discount || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "center" }}>{item.gstRate || 0}%</td>
                      <td style={{ textAlign: "right" }}>{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - (selectedInvoice.items?.length || 0)) }).map((_, i) => (
                    <tr key={`filler-${i}`}>
                      <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: THEME.lightBg, fontWeight: "bold" }}>
                    <td colSpan="6" style={{ textAlign: "right" }}>Subtotal</td>
                    <td style={{ textAlign: "right" }}>
                      {selectedInvoice.subTotal?.toFixed ? selectedInvoice.subTotal.toFixed(2) : ""}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* GST breakup summary table */}
              <div className="inv-section-title">GST Details</div>
              <table className="inv-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: THEME.lightBg, color: THEME.primaryDark }}>
                    <th>Taxable Value</th>
                    {selectedInvoice.stateType === "INTRA" ? (
                      <>
                        <th>CGST % / Amt</th>
                        <th>SGST % / Amt</th>
                      </>
                    ) : (
                      <th>IGST % / Amt</th>
                    )}
                    <th>Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "right" }}>₹{selectedInvoice.subTotal?.toFixed(2)}</td>
                    {selectedInvoice.stateType === "INTRA" ? (
                      <>
                        <td style={{ textAlign: "center" }}>{halfRate}% / ₹{selectedInvoice.cgst?.toFixed(2)}</td>
                        <td style={{ textAlign: "center" }}>{halfRate}% / ₹{selectedInvoice.sgst?.toFixed(2)}</td>
                      </>
                    ) : (
                      <td style={{ textAlign: "center" }}>{gstRate}% / ₹{selectedInvoice.igst?.toFixed(2)}</td>
                    )}
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      ₹{(selectedInvoice.stateType === "INTRA"
                        ? (selectedInvoice.cgst || 0) + (selectedInvoice.sgst || 0)
                        : (selectedInvoice.igst || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Grand total highlight */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  backgroundColor: THEME.accent,
                  color: "#fff",
                  padding: "10px 18px",
                }}
              >
                <h3 style={{ margin: 0 }}>Grand Total: ₹{grandTotal?.toFixed(2)}</h3>
              </div>

              {/* Amount in words */}
              <div style={{ backgroundColor: THEME.lightBg, borderBottom: `1px solid ${THEME.border}`, padding: "8px 18px" }}>
                <div style={{ fontSize: "12px", color: THEME.primaryDark }}>Amount Chargeable (In Words)</div>
                <div style={{ fontWeight: "bold" }}>{amountInWords}</div>
              </div>

              {/* Footer: PAN, bank details, signature */}
              <div style={{ display: "flex", borderTop: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1.4, borderRight: `1px solid ${THEME.border}`, padding: "8px 18px", fontSize: "13px" }}>
                  <div>Company's PAN: <strong>{COMPANY.pan}</strong></div>
                  <div style={{ marginTop: "6px", fontWeight: "bold", color: THEME.primaryDark }}>Company's Bank Details</div>
                  <div>Bank Name: <strong>{COMPANY.bankName}</strong></div>
                  <div>Account No: <strong>{COMPANY.accountNo}</strong></div>
                  <div>IFSC Code: <strong>{COMPANY.ifsc}</strong></div>
                </div>
                <div style={{ flex: 1, padding: "8px 18px", textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>for {COMPANY.name}</div>
                  <div style={{ height: "70px" }} />
                  <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: "4px", fontSize: "12px" }}>
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;