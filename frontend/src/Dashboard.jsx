import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Dashboard.css";

// =========================
// HELPERS
// =========================
const getInvoiceAmount = (invoice) =>
    Number(
        invoice?.grandTotal ||
        invoice?.totalAmount ||
        invoice?.total ||
        0
    );

const getPartyName = (invoice) => {
    if (invoice?.partyName) return invoice.partyName;
    if (invoice?.customerName) return invoice.customerName;

    if (invoice?.party) {
        if (typeof invoice.party === "string") return invoice.party;

        return (
            invoice.party.name ||
            invoice.party.companyName ||
            "Unknown Party"
        );
    }

    if (invoice?.customer) {
        if (typeof invoice.customer === "string") return invoice.customer;

        return (
            invoice.customer.name ||
            invoice.customer.companyName ||
            "Unknown Customer"
        );
    }

    return "Walk-in Customer";
};

const getInvoiceDate = (invoice) =>
    invoice?.invoiceDate ||
    invoice?.date ||
    invoice?.createdAt ||
    new Date().toISOString();

const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getInvoiceStatus = (invoice) => {
    const status = String(
        invoice?.status ||
        invoice?.paymentStatus ||
        ""
    ).toLowerCase();

    if (
        status.includes("paid") ||
        status.includes("complete") ||
        status.includes("received")
    ) {
        return "Paid";
    }

    if (
        status.includes("partial") ||
        status.includes("part")
    ) {
        return "Partial";
    }

    if (
        status.includes("pending") ||
        status.includes("unpaid") ||
        status.includes("due")
    ) {
        return "Pending";
    }

    return "Paid";
};

const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

// =========================
// SIDEBAR
// =========================
function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-logo">B</div>

                <div>
                    <div className="brand-title">BillingOS</div>
                    <div className="brand-subtitle">
                        BUSINESS MANAGEMENT
                    </div>
                </div>
            </div>

            <div className="menu-label">Overview</div>

            <Link to="/dashboard" className="nav-link active">
                <span className="nav-icon">⌂</span>
                Dashboard
            </Link>

            <div className="menu-label">Transactions</div>

            <Link to="/invoices" className="nav-link">
                <span className="nav-icon">▤</span>
                Invoices
            </Link>

            <Link to="/parties" className="nav-link">
                <span className="nav-icon">♙</span>
                Customers & Vendors
            </Link>

            <Link to="/inventory" className="nav-link">
                <span className="nav-icon">▦</span>
                Items / Inventory
            </Link>

            <div className="menu-label">Business</div>

            <div className="nav-link">
                <span className="nav-icon">₹</span>
                Sales
            </div>

            <div className="nav-link">
                <span className="nav-icon">↗</span>
                Purchase
            </div>

            <div className="nav-link">
                <span className="nav-icon">▥</span>
                Reports
            </div>

            <div className="nav-link">
                <span className="nav-icon">%</span>
                GST Reports
            </div>

            <div className="menu-label">System</div>

            <div className="nav-link">
                <span className="nav-icon">⚙</span>
                Settings
            </div>

            <div className="sidebar-bottom">
                <div className="business-box">
                    <div className="business-box-title">
                        CURRENT BUSINESS
                    </div>

                    <div className="business-box-name">
                        My Business
                    </div>
                </div>
            </div>
        </aside>
    );
}

// =========================
// TOP BAR
// =========================
function Topbar({ search, setSearch }) {
    return (
        <header className="topbar">
            <div>
                <div className="topbar-title">
                    Business Overview
                </div>

                <div className="topbar-subtitle">
                    Monitor your business performance
                </div>
            </div>

            <div className="top-actions">
                <input
                    className="search-box"
                    placeholder="Search invoice or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button className="icon-btn">♧</button>

                <div className="profile">
                    <div className="avatar">A</div>

                    <div>
                        <div className="profile-name">Admin</div>
                        <div className="profile-role">
                            Administrator
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// =========================
// KPI CARDS
// =========================
function KpiCards({ cards }) {
    return (
        <div className="kpi-grid">
            {cards.map((card) => (
                <div className="kpi-card" key={card.title}>
                    <div className="kpi-top">
                        <div className="kpi-title">
                            {card.title}
                        </div>

                        <div
                            className={`kpi-icon ${card.className}`}
                        >
                            {card.icon}
                        </div>
                    </div>

                    <div className="kpi-value">
                        {card.value}
                    </div>

                    <div className="kpi-subtitle">
                        {card.subtitle}
                    </div>
                </div>
            ))}
        </div>
    );
}

// =========================
// SALES CHART
// =========================
function SalesChart({
    monthlySales,
    maxMonthlySales,
    period,
    setPeriod,
}) {
    return (
        <section className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">
                        Sales Overview
                    </div>

                    <div className="panel-subtitle">
                        Monthly sales performance
                    </div>
                </div>

                <select
                    className="period-select"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <option value="all">All Data</option>
                    <option value="today">Today</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            <div className="panel-body">
                <div className="chart">
                    {monthlySales.map((item) => (
                        <div className="chart-item" key={item.month}>
                            <div className="bar-area">
                                <div
                                    className="bar"
                                    title={`${item.month}: ${money(
                                        item.value
                                    )}`}
                                    style={{
                                        height: `${Math.max(
                                            (item.value / maxMonthlySales) * 100,
                                            item.value ? 5 : 2
                                        )}%`,
                                    }}
                                />
                            </div>

                            <div className="month-label">
                                {item.month}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =========================
// PAYMENT SUMMARY
// =========================
function PaymentSummary({ dashboardData, totalParties }) {
    const rows = [
        {
            label: "Paid",
            value: dashboardData.paid,
            dotClass: "dot-green",
        },
        {
            label: "Pending",
            value: dashboardData.pending,
            dotClass: "dot-orange",
        },
        {
            label: "Partial",
            value: dashboardData.partial,
            dotClass: "dot-blue",
        },
        {
            label: "GST Collected",
            value: dashboardData.gst,
            dotClass: "dot-green",
        },
    ];

    return (
        <section className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">
                        Payment Summary
                    </div>

                    <div className="panel-subtitle">
                        Invoice payment status
                    </div>
                </div>
            </div>

            <div className="panel-body">
                {rows.map((row) => (
                    <div className="summary-row" key={row.label}>
                        <div className="summary-left">
                            <span
                                className={`status-dot ${row.dotClass}`}
                            />
                            <span className="summary-label">
                                {row.label}
                            </span>
                        </div>

                        <div className="summary-value">
                            {money(row.value)}
                        </div>
                    </div>
                ))}

                <div className="summary-row">
                    <div className="summary-left">
                        <span className="summary-label">
                            Total Parties
                        </span>
                    </div>

                    <div className="summary-value">
                        {totalParties}
                    </div>
                </div>
            </div>
        </section>
    );
}

// =========================
// RECENT TRANSACTIONS
// =========================
function RecentTransactions({ transactions }) {
    return (
        <section className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">
                        Recent Transactions
                    </div>

                    <div className="panel-subtitle">
                        Latest invoices and sales
                    </div>
                </div>

                <Link to="/invoices" className="btn small-btn">
                    View All
                </Link>
            </div>

            <div className="table-wrapper">
                {transactions.length === 0 ? (
                    <div className="empty">
                        No transactions found.
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Customer / Vendor</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((invoice, index) => {
                                const invoiceId =
                                    invoice?.invoiceNumber ||
                                    invoice?.invoiceNo ||
                                    invoice?.id ||
                                    invoice?._id ||
                                    `INV-${index + 1}`;

                                const status =
                                    getInvoiceStatus(invoice);

                                return (
                                    <tr
                                        key={
                                            invoice?._id ||
                                            invoice?.id ||
                                            index
                                        }
                                    >
                                        <td>
                                            <span className="invoice-number">
                                                #{invoiceId}
                                            </span>
                                        </td>

                                        <td>
                                            {getPartyName(invoice)}
                                        </td>

                                        <td>
                                            {formatDate(
                                                getInvoiceDate(invoice)
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`status ${
                                                    status === "Paid"
                                                        ? "status-paid"
                                                        : status ===
                                                          "Partial"
                                                        ? "status-partial"
                                                        : "status-pending"
                                                }`}
                                            >
                                                {status}
                                            </span>
                                        </td>

                                        <td className="amount">
                                            {money(
                                                getInvoiceAmount(
                                                    invoice
                                                )
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}

// =========================
// TOP CUSTOMERS
// =========================
function TopCustomers({ customers }) {
    return (
        <section className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">
                        Top Customers
                    </div>

                    <div className="panel-subtitle">
                        Customers by sales value
                    </div>
                </div>
            </div>

            <div className="panel-body">
                {customers.length === 0 ? (
                    <div className="empty">
                        No customer sales data available.
                    </div>
                ) : (
                    customers.map((customer) => (
                        <div
                            className="customer-row"
                            key={customer.name}
                        >
                            <div className="customer-avatar">
                                {customer.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="customer-info">
                                <div className="customer-name">
                                    {customer.name}
                                </div>

                                <div className="customer-invoices">
                                    {customer.invoices} invoice
                                    {customer.invoices > 1
                                        ? "s"
                                        : ""}
                                </div>
                            </div>

                            <div className="customer-amount">
                                {money(customer.amount)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

// =========================
// QUICK ACTIONS
// =========================
function QuickActions() {
    const actions = [
        {
            path: "/invoices",
            icon: "+",
            title: "New Invoice",
            subtitle: "Create sales invoice",
        },
        {
            path: "/parties",
            icon: "♙",
            title: "Add Party",
            subtitle: "Customer or vendor",
        },
        {
            path: "/inventory",
            icon: "▦",
            title: "Inventory",
            subtitle: "Manage products",
        },
    ];

    return (
        <section className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">
                        Quick Actions
                    </div>

                    <div className="panel-subtitle">
                        Frequently used business actions
                    </div>
                </div>
            </div>

            <div className="panel-body">
                <div className="quick-grid">
                    {actions.map((action) => (
                        <Link
                            to={action.path}
                            className="quick-action"
                            key={action.title}
                        >
                            <div className="quick-icon">
                                {action.icon}
                            </div>

                            <div className="quick-title">
                                {action.title}
                            </div>

                            <div className="quick-subtitle">
                                {action.subtitle}
                            </div>
                        </Link>
                    ))}

                    <div className="quick-action">
                        <div className="quick-icon">%</div>

                        <div className="quick-title">
                            GST Report
                        </div>

                        <div className="quick-subtitle">
                            View tax summary
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// =========================
// MAIN DASHBOARD
// =========================
function Dashboard() {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalParties: 0,
    });

    const [invoices, setInvoices] = useState([]);
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState("all");

    // =========================
    // 1. FETCH DATA
    // =========================
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [invoiceResponse, partyResponse] =
                    await Promise.all([
                        axios.get(
                            "http://localhost:5000/api/invoices"
                        ),
                        axios.get(
                            "http://localhost:5000/api/parties"
                        ),
                    ]);

                const invoiceData = Array.isArray(
                    invoiceResponse.data
                )
                    ? invoiceResponse.data
                    : invoiceResponse.data?.data || [];

                const partyData = Array.isArray(partyResponse.data)
                    ? partyResponse.data
                    : partyResponse.data?.data || [];

                setInvoices(invoiceData);
                setParties(partyData);

                setStats({
                    totalInvoices: invoiceData.length,
                    totalParties: partyData.length,
                });
            } catch (err) {
                console.error("Dashboard Error:", err);

                setError(
                    "Dashboard data load nahi ho pa raha. Backend check karein."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // =========================
    // 2. FILTER INVOICES
    // =========================
    const filteredInvoices = useMemo(() => {
        let data = [...invoices];

        // Filter by date
        if (period !== "all") {
            const now = new Date();

            data = data.filter((invoice) => {
                const date = new Date(
                    getInvoiceDate(invoice)
                );

                if (Number.isNaN(date.getTime())) return false;

                if (period === "today") {
                    return (
                        date.toDateString() ===
                        now.toDateString()
                    );
                }

                if (period === "month") {
                    return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() ===
                            now.getFullYear()
                    );
                }

                if (period === "year") {
                    return (
                        date.getFullYear() ===
                        now.getFullYear()
                    );
                }

                return true;
            });
        }

        // Search invoice/customer
        if (search.trim()) {
            const query = search.toLowerCase();

            data = data.filter((invoice) => {
                const invoiceId =
                    invoice?.invoiceNumber ||
                    invoice?.invoiceNo ||
                    invoice?.id ||
                    invoice?._id ||
                    "";

                const partyName = getPartyName(invoice);

                return (
                    String(invoiceId)
                        .toLowerCase()
                        .includes(query) ||
                    String(partyName)
                        .toLowerCase()
                        .includes(query)
                );
            });
        }

        return data;
    }, [invoices, search, period]);

    // =========================
    // 3. FINANCIAL CALCULATIONS
    // =========================
    const dashboardData = useMemo(() => {
        let sales = 0;
        let purchase = 0;
        let paid = 0;
        let pending = 0;
        let partial = 0;
        let gst = 0;

        filteredInvoices.forEach((invoice) => {
            const amount = getInvoiceAmount(invoice);

            const type = String(
                invoice?.type ||
                invoice?.invoiceType ||
                invoice?.transactionType ||
                "sale"
            ).toLowerCase();

            const status = getInvoiceStatus(invoice);

            if (type.includes("purchase")) {
                purchase += amount;
            } else {
                sales += amount;
            }

            if (status === "Paid") paid += amount;
            if (status === "Pending") pending += amount;
            if (status === "Partial") partial += amount;

            gst += Number(
                invoice?.gstAmount ||
                invoice?.totalGST ||
                invoice?.gst ||
                0
            );
        });

        return {
            sales,
            purchase,
            paid,
            pending,
            partial,
            gst,
        };
    }, [filteredInvoices]);

    // =========================
    // 4. MONTHLY SALES
    // =========================
    const monthlySales = useMemo(() => {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const result = months.map((month) => ({
            month,
            value: 0,
        }));

        const currentYear = new Date().getFullYear();

        invoices.forEach((invoice) => {
            const date = new Date(
                getInvoiceDate(invoice)
            );

            if (
                Number.isNaN(date.getTime()) ||
                date.getFullYear() !== currentYear
            ) {
                return;
            }

            const type = String(
                invoice?.type ||
                invoice?.invoiceType ||
                "sale"
            ).toLowerCase();

            if (type.includes("purchase")) return;

            result[date.getMonth()].value +=
                getInvoiceAmount(invoice);
        });

        return result;
    }, [invoices]);

    const maxMonthlySales = Math.max(
        ...monthlySales.map((item) => item.value),
        1
    );

    // =========================
    // 5. TOP CUSTOMERS
    // =========================
    const topCustomers = useMemo(() => {
        const customerMap = {};

        invoices.forEach((invoice) => {
            const type = String(
                invoice?.type ||
                invoice?.invoiceType ||
                "sale"
            ).toLowerCase();

            if (type.includes("purchase")) return;

            const name = getPartyName(invoice);
            const amount = getInvoiceAmount(invoice);

            if (!customerMap[name]) {
                customerMap[name] = {
                    name,
                    amount: 0,
                    invoices: 0,
                };
            }

            customerMap[name].amount += amount;
            customerMap[name].invoices += 1;
        });

        return Object.values(customerMap)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [invoices]);

    // =========================
    // 6. RECENT TRANSACTIONS
    // =========================
    const recentTransactions = useMemo(() => {
        return filteredInvoices
            .slice()
            .sort(
                (a, b) =>
                    new Date(getInvoiceDate(b)) -
                    new Date(getInvoiceDate(a))
            )
            .slice(0, 6);
    }, [filteredInvoices]);

    // =========================
    // 7. KPI CARDS
    // =========================
    const cards = [
        {
            title: "Total Sales",
            value: money(dashboardData.sales),
            subtitle: "Revenue generated",
            icon: "₹",
            className: "green",
        },
        {
            title: "Purchase",
            value: money(dashboardData.purchase),
            subtitle: "Total purchases",
            icon: "↗",
            className: "blue",
        },
        {
            title: "Receivables",
            value: money(dashboardData.pending),
            subtitle: "Amount to collect",
            icon: "◷",
            className: "orange",
        },
        {
            title: "Total Invoices",
            value: stats.totalInvoices,
            subtitle: "Invoices created",
            icon: "#",
            className: "purple",
        },
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-layout">
                <Sidebar />

                <main className="main-content">
                    <Topbar
                        search={search}
                        setSearch={setSearch}
                    />

                    <div className="content">
                        {/* PAGE HEADER */}
                        <div className="page-heading">
                            <div>
                                <h1>Dashboard</h1>
                                <p>
                                    Here's what's happening
                                    with your business today.
                                </p>
                            </div>

                            <div className="action-buttons">
                                <Link
                                    to="/parties"
                                    className="btn"
                                >
                                    + Add Party
                                </Link>

                                <Link
                                    to="/invoices"
                                    className="btn btn-primary"
                                >
                                    + Create Invoice
                                </Link>
                            </div>
                        </div>

                        {/* LOADING / ERROR / CONTENT */}
                        {loading ? (
                            <div className="loading-box">
                                Loading dashboard data...
                            </div>
                        ) : error ? (
                            <div className="error-box">
                                {error}
                            </div>
                        ) : (
                            <>
                                <KpiCards cards={cards} />

                                <div className="dashboard-grid">
                                    <SalesChart
                                        monthlySales={
                                            monthlySales
                                        }
                                        maxMonthlySales={
                                            maxMonthlySales
                                        }
                                        period={period}
                                        setPeriod={setPeriod}
                                    />

                                    <PaymentSummary
                                        dashboardData={
                                            dashboardData
                                        }
                                        totalParties={
                                            stats.totalParties
                                        }
                                    />
                                </div>

                                <RecentTransactions
                                    transactions={
                                        recentTransactions
                                    }
                                />

                                <div className="lower-grid">
                                    <TopCustomers
                                        customers={topCustomers}
                                    />

                                    <QuickActions />
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
