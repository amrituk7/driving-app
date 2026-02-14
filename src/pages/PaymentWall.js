import React, { useEffect, useState } from "react";
import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getStudents
} from "../firebase";
import "./PaymentWall.css";

const PAYMENT_METHODS = ["cash", "bank transfer", "card"];
const PAYMENT_STATUSES = ["paid", "pending", "overdue"];
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

export default function PaymentWall() {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("income");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("all");

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    studentName: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
    status: "paid",
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

  // Filter by month
  const filteredPayments = filterMonth === "all"
    ? payments
    : payments.filter(p => getMonthKey(p.date) === filterMonth);

  const filteredExpenses = filterMonth === "all"
    ? expenses
    : expenses.filter(e => getMonthKey(e.date) === filterMonth);

  // Stats
  const totalIncome = filteredPayments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingAmount = filteredPayments
    .filter(p => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalExpenses = filteredExpenses
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netProfit = totalIncome - totalExpenses;

  // Months for filter dropdown
  const allMonths = new Set();
  payments.forEach(p => allMonths.add(getMonthKey(p.date)));
  expenses.forEach(e => allMonths.add(getMonthKey(e.date)));
  const monthOptions = Array.from(allMonths).sort().reverse();

  // Monthly breakdown data
  const monthlyData = {};
  payments.filter(p => p.status === "paid").forEach(p => {
    const key = getMonthKey(p.date);
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    monthlyData[key].income += Number(p.amount || 0);
  });
  expenses.forEach(e => {
    const key = getMonthKey(e.date);
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    monthlyData[key].expense += Number(e.amount || 0);
  });
  const monthlyKeys = Object.keys(monthlyData).sort().reverse().slice(0, 6);
  const maxMonthly = Math.max(
    ...monthlyKeys.map(k => Math.max(monthlyData[k].income, monthlyData[k].expense)),
    1
  );

  // ---- Payment CRUD ----
  function resetPaymentForm() {
    setPaymentForm({
      studentId: "", studentName: "", amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "cash", status: "paid", notes: ""
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
      notes: paymentForm.notes
    };

    try {
      if (editingId) {
        await updatePayment(editingId, data);
      } else {
        await addPayment(data);
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
      status: payment.status || "paid",
      notes: payment.notes || ""
    });
    setEditingId(payment.id);
    setShowForm(true);
  }

  async function handleDeletePayment(id) {
    if (!window.confirm("Delete this payment record?")) return;
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
        <h1>Payment Wall</h1>
        <p>Track income from students and business expenses.</p>
      </div>

      {/* Stats */}
      <div className="payment-stats">
        <div className="payment-stat-box">
          <div className="payment-stat-icon income">I</div>
          <div className="payment-stat-content">
            <h3>{"£"}{totalIncome.toFixed(2)}</h3>
            <p>Total Income</p>
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
            <p>Total Expenses</p>
          </div>
        </div>
        <div className="payment-stat-box">
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
                    {PAYMENT_STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
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
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .map(p => (
                    <tr key={p.id}>
                      <td>{p.studentName || "Unknown"}</td>
                      <td className="amount-income">{"£"}{Number(p.amount || 0).toFixed(2)}</td>
                      <td>{p.date || "-"}</td>
                      <td><span className="method-badge">{p.method || "-"}</span></td>
                      <td><span className={`status-badge ${p.status || "pending"}`}>{(p.status || "pending").charAt(0).toUpperCase() + (p.status || "pending").slice(1)}</span></td>
                      <td>{p.notes || "-"}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEditPayment(p)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeletePayment(p.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              const incW = (d.income / maxMonthly) * 100;
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
    </div>
  );
}
