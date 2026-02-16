import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getStudents,
  addPaymentEvent
} from "../firebase";
import "./PaymentWall.css";

const PAYMENT_METHODS = ["cash", "bank transfer", "card", "online"];
const PAYMENT_STATUSES = ["pending", "paid", "partial", "refunded", "partial_refund", "overdue"];
const EXPENSE_CATEGORIES = ["fuel", "car maintenance", "insurance", "tax", "other"];

function getMonthKey(dateStr) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key) {
  if (key === "Unknown") return key;
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleString("default", { month: "short", year: "numeric" });
}

function statusLabel(s) {
  const map = {
    pending: "Pending",
    paid: "Paid",
    partial: "Partial",
    refunded: "Refunded",
    partial_refund: "Partial Refund",
    overdue: "Overdue"
  };
  return map[s] || s;
}

export default function PaymentWall() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("income");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("all");

  // Stripe
  const [stripeLoading, setStripeLoading] = useState(null); // paymentId being processed
  const [stripeMessage, setStripeMessage] = useState(null); // { type: "success"|"error"|"info", text: "" }

  // Modals
  const [receiveModal, setReceiveModal] = useState(null);
  const [refundModal, setRefundModal] = useState(null);

  // Receive payment form
  const [receiveForm, setReceiveForm] = useState({
    amountReceived: "",
    method: "cash",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  // Refund form
  const [refundForm, setRefundForm] = useState({
    refundAmount: "",
    reason: "",
    date: new Date().toISOString().split("T")[0]
  });

  // Payment form (for new records - now defaults to pending)
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    studentName: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
    status: "pending",
    notes: ""
  });

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: "fuel",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [paymentsData, expensesData, studentsData] = await Promise.all([
        getPayments(),
        getExpenses(),
        getStudents()
      ]);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Error loading payment data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Stripe redirect on mount
  const verifyStripeSession = useCallback(async (sessionId) => {
    try {
      setStripeMessage({ type: "info", text: "Verifying Stripe payment..." });
      const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await res.json();

      if (data.status === "paid" && data.paymentId) {
        // Find the payment and update it
        const payment = payments.find(p => p.id === data.paymentId);
        if (payment) {
          const newPaidAmount = Number(payment.paidAmount || 0) + data.amountPaid;
          const totalAmount = Number(payment.amount || 0);
          const newStatus = newPaidAmount >= totalAmount ? "paid" : "partial";

          await updatePayment(data.paymentId, {
            paidAmount: newPaidAmount,
            paidAt: data.paidAt || new Date().toISOString().split("T")[0],
            paymentMethod: "stripe",
            status: newStatus,
            stripeSessionId: sessionId
          });

          await addPaymentEvent(data.paymentId, {
            type: "received",
            amount: data.amountPaid,
            date: new Date().toISOString().split("T")[0],
            method: "stripe",
            note: `Stripe payment from ${data.customerEmail || data.studentName}`
          });

          await loadData();
          setStripeMessage({ type: "success", text: `Payment of £${data.amountPaid.toFixed(2)} received from ${data.studentName} via Stripe.` });
        } else {
          setStripeMessage({ type: "success", text: `Stripe payment confirmed (£${data.amountPaid.toFixed(2)}).` });
        }
      } else if (data.status === "unpaid") {
        setStripeMessage({ type: "info", text: "Payment is still processing. It will update automatically." });
      }
    } catch (err) {
      console.error("Error verifying Stripe session:", err);
      setStripeMessage({ type: "error", text: "Could not verify Stripe payment. Check your payment records." });
    }

    // Clear URL params
    setSearchParams({});
  }, [payments, setSearchParams]);

  useEffect(() => {
    const stripeStatus = searchParams.get("stripe");
    const sessionId = searchParams.get("session_id");

    if (stripeStatus === "success" && sessionId && payments.length > 0) {
      verifyStripeSession(sessionId);
    } else if (stripeStatus === "cancelled") {
      setStripeMessage({ type: "info", text: "Stripe checkout was cancelled. No payment was taken." });
      setSearchParams({});
    }
  }, [searchParams, payments.length, verifyStripeSession, setSearchParams]);

  // Send Stripe checkout link
  async function handleStripeCheckout(payment) {
    if (stripeLoading) return;
    setStripeLoading(payment.id);
    setStripeMessage(null);

    try {
      const student = students.find(s => s.id === payment.studentId);
      const remaining = Number(payment.amount || 0) - Number(payment.paidAmount || 0);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          studentName: payment.studentName || "Student",
          studentEmail: student?.email || "",
          amount: remaining,
          lessonDescription: payment.notes || "Driving lesson payment",
          instructorId: ""
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Copy link to clipboard and also open it
      if (data.url) {
        await navigator.clipboard.writeText(data.url).catch(() => {});
        setStripeMessage({
          type: "success",
          text: `Stripe link created and copied! Share it with ${payment.studentName}. Opening checkout...`
        });
        // Open in new tab after brief delay so user sees the message
        setTimeout(() => window.open(data.url, "_blank"), 800);
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setStripeMessage({ type: "error", text: `Stripe error: ${err.message}` });
    } finally {
      setStripeLoading(null);
    }
  }

  // Filter by month
  const filteredPayments = filterMonth === "all"
    ? payments
    : payments.filter(p => getMonthKey(p.date) === filterMonth);

  const filteredExpenses = filterMonth === "all"
    ? expenses
    : expenses.filter(e => getMonthKey(e.date) === filterMonth);

  // Upgraded Stats - using paidAmount and refundedAmount
  const grossIncome = filteredPayments
    .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);

  const totalRefunds = filteredPayments
    .reduce((sum, p) => sum + Number(p.refundedAmount || 0), 0);

  const totalExpenses = filteredExpenses
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netProfit = grossIncome - totalRefunds - totalExpenses;

  const pendingAmount = filteredPayments
    .filter(p => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + (Number(p.amount || 0) - Number(p.paidAmount || 0)), 0);

  // Months for filter dropdown
  const allMonths = new Set();
  payments.forEach(p => allMonths.add(getMonthKey(p.date)));
  expenses.forEach(e => allMonths.add(getMonthKey(e.date)));
  const monthOptions = Array.from(allMonths).sort().reverse();

  // Monthly breakdown data - using net income (paid - refunded)
  const monthlyData = {};
  payments.forEach(p => {
    const key = getMonthKey(p.date);
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    monthlyData[key].income += (Number(p.paidAmount || 0) - Number(p.refundedAmount || 0));
  });
  expenses.forEach(e => {
    const key = getMonthKey(e.date);
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    monthlyData[key].expense += Number(e.amount || 0);
  });
  const monthlyKeys = Object.keys(monthlyData).sort().reverse().slice(0, 6);
  const maxMonthly = Math.max(
    ...monthlyKeys.map(k => Math.max(Math.abs(monthlyData[k].income), monthlyData[k].expense)),
    1
  );

  // ---- Receive Payment ----
  function openReceiveModal(payment) {
    const remaining = Number(payment.amount || 0) - Number(payment.paidAmount || 0);
    setReceiveModal(payment);
    setReceiveForm({
      amountReceived: remaining > 0 ? remaining.toFixed(2) : "",
      method: payment.method || "cash",
      date: new Date().toISOString().split("T")[0],
      notes: ""
    });
  }

  async function handleReceivePayment(e) {
    e.preventDefault();
    if (!receiveModal || !receiveForm.amountReceived) return;

    const received = Number(receiveForm.amountReceived);
    const newPaidAmount = Number(receiveModal.paidAmount || 0) + received;
    const totalAmount = Number(receiveModal.amount || 0);

    let newStatus;
    if (newPaidAmount >= totalAmount) {
      newStatus = "paid";
    } else {
      newStatus = "partial";
    }

    try {
      await updatePayment(receiveModal.id, {
        paidAmount: newPaidAmount,
        paidAt: receiveForm.date,
        paymentMethod: receiveForm.method,
        status: newStatus
      });

      // Audit trail
      await addPaymentEvent(receiveModal.id, {
        type: "received",
        amount: received,
        date: receiveForm.date,
        method: receiveForm.method,
        note: receiveForm.notes
      });

      await loadData();
      setReceiveModal(null);
    } catch (err) {
      console.error("Error receiving payment:", err);
    }
  }

  // ---- Refund ----
  function openRefundModal(payment) {
    const refundable = Number(payment.paidAmount || 0) - Number(payment.refundedAmount || 0);
    setRefundModal(payment);
    setRefundForm({
      refundAmount: refundable > 0 ? refundable.toFixed(2) : "",
      reason: "",
      date: new Date().toISOString().split("T")[0]
    });
  }

  async function handleRefund(e) {
    e.preventDefault();
    if (!refundModal || !refundForm.refundAmount) return;

    const refundAmt = Number(refundForm.refundAmount);
    const newRefundedAmount = Number(refundModal.refundedAmount || 0) + refundAmt;
    const paidAmount = Number(refundModal.paidAmount || 0);

    let newStatus;
    if (newRefundedAmount >= paidAmount) {
      newStatus = "refunded";
    } else {
      newStatus = "partial_refund";
    }

    try {
      await updatePayment(refundModal.id, {
        refundedAmount: newRefundedAmount,
        refundedAt: refundForm.date,
        status: newStatus
      });

      // Audit trail
      await addPaymentEvent(refundModal.id, {
        type: "refund",
        amount: refundAmt,
        date: refundForm.date,
        note: refundForm.reason
      });

      await loadData();
      setRefundModal(null);
    } catch (err) {
      console.error("Error issuing refund:", err);
    }
  }

  // ---- Payment CRUD ----
  function resetPaymentForm() {
    setPaymentForm({
      studentId: "", studentName: "", amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "cash", status: "pending", notes: ""
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleStudentSelect(e) {
    const sid = e.target.value;
    const student = students.find(s => s.id === sid);
    setPaymentForm(prev => ({
      ...prev,
      studentId: sid,
      studentName: student ? student.name : ""
    }));
  }

  async function handleSavePayment(e) {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.date) return;

    const data = {
      studentId: paymentForm.studentId,
      studentName: paymentForm.studentName,
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      method: paymentForm.method,
      status: paymentForm.status,
      notes: paymentForm.notes,
      // New fields for money-flow
      paidAmount: paymentForm.status === "paid" ? Number(paymentForm.amount) : 0,
      refundedAmount: 0,
      paidAt: paymentForm.status === "paid" ? paymentForm.date : null,
      refundedAt: null,
      paymentMethod: paymentForm.method
    };

    try {
      if (editingId) {
        // When editing, only update basic fields, not money-flow fields
        await updatePayment(editingId, {
          studentId: data.studentId,
          studentName: data.studentName,
          amount: data.amount,
          date: data.date,
          method: data.method,
          notes: data.notes
        });
      } else {
        await addPayment(data);
        // Audit trail for creation
        // We'll get the ID after creation
      }
      await loadData();
      resetPaymentForm();
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  function handleEditPayment(payment) {
    setActiveTab("income");
    setPaymentForm({
      studentId: payment.studentId || "",
      studentName: payment.studentName || "",
      amount: payment.amount || "",
      date: payment.date || "",
      method: payment.method || "cash",
      status: payment.status || "pending",
      notes: payment.notes || ""
    });
    setEditingId(payment.id);
    setShowForm(true);
  }

  async function handleDeletePayment(id) {
    if (!window.confirm("Delete this payment record? This cannot be undone.")) return;
    try {
      await deletePayment(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting payment:", err);
    }
  }

  // ---- Expense CRUD ----
  function resetExpenseForm() {
    setExpenseForm({
      category: "fuel", amount: "",
      date: new Date().toISOString().split("T")[0],
      description: ""
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSaveExpense(e) {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.date) return;

    const data = {
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      description: expenseForm.description
    };

    try {
      if (editingId) {
        await updateExpense(editingId, data);
      } else {
        await addExpense(data);
      }
      await loadData();
      resetExpenseForm();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  }

  function handleEditExpense(expense) {
    setActiveTab("expenses");
    setExpenseForm({
      category: expense.category || "fuel",
      amount: expense.amount || "",
      date: expense.date || "",
      description: expense.description || ""
    });
    setEditingId(expense.id);
    setShowForm(true);
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await deleteExpense(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  }

  if (loading) {
    return (
      <div className="payment-container">
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="payment-header">
        <h1>Payments {"&"} Refunds</h1>
        <p>Track income from students, issue refunds, and manage expenses.</p>
      </div>

      {/* Stripe Message Banner */}
      {stripeMessage && (
        <div className={`stripe-banner ${stripeMessage.type}`}>
          <span>{stripeMessage.text}</span>
          <button onClick={() => setStripeMessage(null)} className="stripe-banner-close">x</button>
        </div>
      )}

      {/* Stats - upgraded with gross/refund/net */}
      <div className="payment-stats">
        <div className="payment-stat-box">
          <div className="payment-stat-icon income">G</div>
          <div className="payment-stat-content">
            <h3>{"£"}{grossIncome.toFixed(2)}</h3>
            <p>Gross Income</p>
          </div>
        </div>
        <div className="payment-stat-box">
          <div className="payment-stat-icon refund">R</div>
          <div className="payment-stat-content">
            <h3>{"£"}{totalRefunds.toFixed(2)}</h3>
            <p>Refunds Issued</p>
          </div>
        </div>
        <div className="payment-stat-box">
          <div className="payment-stat-icon pending">P</div>
          <div className="payment-stat-content">
            <h3>{"£"}{pendingAmount.toFixed(2)}</h3>
            <p>Pending / Overdue</p>
          </div>
        </div>
        <div className="payment-stat-box">
          <div className="payment-stat-icon expense">E</div>
          <div className="payment-stat-content">
            <h3>{"£"}{totalExpenses.toFixed(2)}</h3>
            <p>Expenses</p>
          </div>
        </div>
        <div className="payment-stat-box stat-wide">
          <div className="payment-stat-icon profit">N</div>
          <div className="payment-stat-content">
            <h3 style={{ color: netProfit >= 0 ? "#059669" : "#dc2626" }}>
              {"£"}{netProfit.toFixed(2)}
            </h3>
            <p>Net Profit</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="payment-filter-bar">
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Filter:</span>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="all">All Time</option>
          {monthOptions.map(m => (
            <option key={m} value={m}>{getMonthLabel(m)}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="payment-tabs">
        <button
          className={`payment-tab ${activeTab === "income" ? "active" : ""}`}
          onClick={() => { setActiveTab("income"); setShowForm(false); setEditingId(null); }}
        >
          Income ({filteredPayments.length})
        </button>
        <button
          className={`payment-tab ${activeTab === "expenses" ? "active" : ""}`}
          onClick={() => { setActiveTab("expenses"); setShowForm(false); setEditingId(null); }}
        >
          Expenses ({filteredExpenses.length})
        </button>
      </div>

      {/* Income Tab */}
      {activeTab === "income" && (
        <div className="payment-card">
          <div className="payment-card-header">
            <h2>Student Payments</h2>
            <button
              className="btn-add income"
              onClick={() => { setShowForm(!showForm); setEditingId(null); resetPaymentForm(); setShowForm(true); }}
            >
              + Add Payment
            </button>
          </div>

          {showForm && (
            <form className="payment-form" onSubmit={handleSavePayment}>
              <div className="payment-form-row">
                <label>
                  Student
                  <select value={paymentForm.studentId} onChange={handleStudentSelect}>
                    <option value="">Select student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name || "Unnamed"}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount (GBP)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={e => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="payment-form-row">
                <label>
                  Method
                  <select value={paymentForm.method} onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}>
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select value={paymentForm.status} onChange={e => setPaymentForm(prev => ({ ...prev, status: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid (received now)</option>
                  </select>
                </label>
                <label>
                  Notes
                  <input
                    type="text"
                    placeholder="Optional notes..."
                    value={paymentForm.notes}
                    onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </label>
              </div>
              <div className="payment-form-actions">
                <button type="button" className="btn-cancel" onClick={resetPaymentForm}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? "Update" : "Save"} Payment</button>
              </div>
            </form>
          )}

          {filteredPayments.length === 0 ? (
            <p className="payment-empty">No payment records yet. Add your first payment above.</p>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Refunded</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .map(p => {
                    const amount = Number(p.amount || 0);
                    const paid = Number(p.paidAmount || 0);
                    const refunded = Number(p.refundedAmount || 0);
                    const canReceive = ["pending", "partial", "overdue"].includes(p.status);
                    const canRefund = ["paid", "partial", "partial_refund"].includes(p.status) && (paid - refunded) > 0;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="student-cell">
                            <span className="student-name">{p.studentName || "Unknown"}</span>
                            {p.paymentMethod && <span className="method-badge">{p.paymentMethod}</span>}
                          </div>
                        </td>
                        <td className="amount-cell">{"£"}{amount.toFixed(2)}</td>
                        <td className="amount-income">{"£"}{paid.toFixed(2)}</td>
                        <td className={refunded > 0 ? "amount-refund" : ""}>
                          {refunded > 0 ? `£${refunded.toFixed(2)}` : "-"}
                        </td>
                        <td>{p.date || "-"}</td>
                        <td>
                          <span className={`status-badge ${p.status || "pending"}`}>
                            {statusLabel(p.status || "pending")}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            {canReceive && (
                              <button
                                className="btn-stripe"
                                onClick={() => handleStripeCheckout(p)}
                                disabled={stripeLoading === p.id}
                              >
                                {stripeLoading === p.id ? "Creating..." : "Stripe Pay"}
                              </button>
                            )}
                            {canReceive && (
                              <button className="btn-receive" onClick={() => openReceiveModal(p)}>
                                Receive
                              </button>
                            )}
                            {canRefund && (
                              <button className="btn-refund" onClick={() => openRefundModal(p)}>
                                Refund
                              </button>
                            )}
                            <button className="btn-edit" onClick={() => handleEditPayment(p)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDeletePayment(p.id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="payment-card">
          <div className="payment-card-header">
            <h2>Business Expenses</h2>
            <button
              className="btn-add expense"
              onClick={() => { setShowForm(!showForm); setEditingId(null); resetExpenseForm(); setShowForm(true); }}
            >
              + Add Expense
            </button>
          </div>

          {showForm && (
            <form className="payment-form" onSubmit={handleSaveExpense}>
              <div className="payment-form-row">
                <label>
                  Category
                  <select value={expenseForm.category} onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}>
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount (GBP)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="payment-form-row">
                <label style={{ gridColumn: "1 / -1" }}>
                  Description
                  <textarea
                    placeholder="What was this expense for..."
                    value={expenseForm.description}
                    onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </label>
              </div>
              <div className="payment-form-actions">
                <button type="button" className="btn-cancel" onClick={resetExpenseForm}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? "Update" : "Save"} Expense</button>
              </div>
            </form>
          )}

          {filteredExpenses.length === 0 ? (
            <p className="payment-empty">No expenses recorded yet. Add your first expense above.</p>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .map(e => (
                    <tr key={e.id}>
                      <td><span className="category-badge">{(e.category || "other").charAt(0).toUpperCase() + (e.category || "other").slice(1)}</span></td>
                      <td className="amount-expense">{"£"}{Number(e.amount || 0).toFixed(2)}</td>
                      <td>{e.date || "-"}</td>
                      <td>{e.description || "-"}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEditExpense(e)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteExpense(e.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Monthly Breakdown */}
      {monthlyKeys.length > 0 && (
        <div className="monthly-breakdown">
          <h2>Monthly Breakdown</h2>
          <div className="monthly-bars">
            {monthlyKeys.map(key => {
              const d = monthlyData[key];
              const incW = (Math.abs(d.income) / maxMonthly) * 100;
              const expW = (d.expense / maxMonthly) * 100;
              const net = d.income - d.expense;
              return (
                <div className="monthly-bar-row" key={key}>
                  <span className="monthly-label">{getMonthLabel(key)}</span>
                  <div className="monthly-bar-track">
                    {d.income > 0 && (
                      <div className="monthly-bar-income" style={{ width: `${Math.max(incW, 8)}%` }}>
                        {"£"}{d.income.toFixed(0)}
                      </div>
                    )}
                    {d.expense > 0 && (
                      <div className="monthly-bar-expense" style={{ width: `${Math.max(expW, 8)}%` }}>
                        {"£"}{d.expense.toFixed(0)}
                      </div>
                    )}
                  </div>
                  <span className={`monthly-net ${net >= 0 ? "positive" : "negative"}`}>
                    {net >= 0 ? "+" : ""}{"£"}{net.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {receiveModal && (
        <div className="modal-overlay" onClick={() => setReceiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header receive">
              <h3>Receive Payment</h3>
              <button className="modal-close" onClick={() => setReceiveModal(null)}>x</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <span>Student:</span>
                <strong>{receiveModal.studentName || "Unknown"}</strong>
              </div>
              <div className="modal-info">
                <span>Total Due:</span>
                <strong>{"£"}{Number(receiveModal.amount || 0).toFixed(2)}</strong>
              </div>
              <div className="modal-info">
                <span>Already Paid:</span>
                <strong>{"£"}{Number(receiveModal.paidAmount || 0).toFixed(2)}</strong>
              </div>
              <div className="modal-info highlight">
                <span>Remaining:</span>
                <strong>{"£"}{(Number(receiveModal.amount || 0) - Number(receiveModal.paidAmount || 0)).toFixed(2)}</strong>
              </div>
              <form onSubmit={handleReceivePayment} className="modal-form">
                <label>
                  Amount Received (GBP)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(receiveModal.amount || 0) - Number(receiveModal.paidAmount || 0)}
                    value={receiveForm.amountReceived}
                    onChange={e => setReceiveForm(prev => ({ ...prev, amountReceived: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Payment Method
                  <select value={receiveForm.method} onChange={e => setReceiveForm(prev => ({ ...prev, method: e.target.value }))}>
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={receiveForm.date}
                    onChange={e => setReceiveForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Notes (optional)
                  <input
                    type="text"
                    placeholder="e.g. Paid via bank app"
                    value={receiveForm.notes}
                    onChange={e => setReceiveForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setReceiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn-receive-confirm">Confirm Receipt</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="modal-overlay" onClick={() => setRefundModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header refund">
              <h3>Issue Refund</h3>
              <button className="modal-close" onClick={() => setRefundModal(null)}>x</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <span>Student:</span>
                <strong>{refundModal.studentName || "Unknown"}</strong>
              </div>
              <div className="modal-info">
                <span>Total Paid:</span>
                <strong>{"£"}{Number(refundModal.paidAmount || 0).toFixed(2)}</strong>
              </div>
              <div className="modal-info">
                <span>Already Refunded:</span>
                <strong>{"£"}{Number(refundModal.refundedAmount || 0).toFixed(2)}</strong>
              </div>
              <div className="modal-info highlight">
                <span>Refundable:</span>
                <strong>{"£"}{(Number(refundModal.paidAmount || 0) - Number(refundModal.refundedAmount || 0)).toFixed(2)}</strong>
              </div>
              <form onSubmit={handleRefund} className="modal-form">
                <label>
                  Refund Amount (GBP)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(refundModal.paidAmount || 0) - Number(refundModal.refundedAmount || 0)}
                    value={refundForm.refundAmount}
                    onChange={e => setRefundForm(prev => ({ ...prev, refundAmount: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Reason (optional)
                  <input
                    type="text"
                    placeholder="e.g. Lesson cancelled, student request"
                    value={refundForm.reason}
                    onChange={e => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={refundForm.date}
                    onChange={e => setRefundForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setRefundModal(null)}>Cancel</button>
                  <button type="submit" className="btn-refund-confirm">Confirm Refund</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
