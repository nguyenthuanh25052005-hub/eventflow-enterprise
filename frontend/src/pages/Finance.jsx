import { useEffect, useState } from "react";
import {
  Plus,
  WalletCards,
  ReceiptText,
  Clock3,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { financeApi } from "../api/financeApi";
import { eventApi } from "../api/eventApi";
import { money, shortDate } from "../utils/format";
const init = {
  event: "",
  category: "PRODUCTION",
  description: "",
  vendor: "",
  amount: "",
  status: "DRAFT",
  expenseDate: new Date().toISOString().slice(0, 10),
};
export default function Finance() {
  const [data, setData] = useState(null),
    [expenses, setExpenses] = useState([]),
    [events, setEvents] = useState([]),
    [modal, setModal] = useState(false),
    [editingId, setEditingId] = useState(null),
    [form, setForm] = useState(init);
  async function load() {
    const [s, e] = await Promise.all([
      financeApi.summary(),
      financeApi.expenses(),
    ]);
    setData(s);
    setExpenses(e.items || []);
  }
  useEffect(() => {
    load();
    eventApi.list().then((r) => setEvents(r.items || []));
  }, []);
  function openRejectedExpense(x) {
    setEditingId(x._id);

    setForm({
      event: x.event?._id || x.event || "",
      category: x.category || "OTHER",
      description: x.description || "",
      vendor: x.vendor || "",
      amount: x.amount || "",
      status: "DRAFT",
      expenseDate: x.expenseDate
        ? new Date(x.expenseDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });

    setModal(true);
  }
  async function create(ev) {
    ev.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount || 0),
    };

    if (editingId) {
      await financeApi.updateExpense(editingId, {
        ...payload,

        // REJECTED -> DRAFT
        status: "DRAFT",
      });
    } else {
      await financeApi.createExpense(payload);
    }

    setModal(false);
    setEditingId(null);
    setForm(init);

    load();
  }
  async function approve(x) {
    await financeApi.updateExpense(x._id, { status: "APPROVED" });
    load();
  }
  async function rejectExpense(x) {
    await financeApi.updateExpense(x._id, {
      status: "REJECTED",
    });

    load();
  }
  async function submitExpense(x) {
    await financeApi.updateExpense(x._id, {
      status: "PENDING",
    });

    load();
  }
  const d = data || {
    revenue: 0,
    approvedExpense: 0,
    pendingExpense: 0,
    grossMargin: 0,
    events: [],
  };
  return (
    <div className="page">
      <PageHeader
        eyebrow="FINANCIAL CONTROL"
        title="Finance & profitability"
        description="Control event budgets, supplier expenses, approval status and gross margin from one operating ledger."
        actions={
          <button
            className="primary-button"
            onClick={() => {
              setEditingId(null);
              setForm(init);
              setModal(true);
            }}
          >
            <Plus size={16} />
            Record expense
          </button>
        }
      />
      <section className="finance-kpi-grid">
        <FinanceKpi
          icon={WalletCards}
          label="Approved revenue"
          value={money(d.revenue)}
          meta="Approved quotations"
        />
        <FinanceKpi
          icon={ReceiptText}
          label="Approved cost"
          value={money(d.approvedExpense)}
          meta="Committed delivery spend"
        />
        <FinanceKpi
          icon={Clock3}
          label="Pending approval"
          value={money(d.pendingExpense)}
          meta="Requires finance action"
          warning
        />
        <FinanceKpi
          icon={TrendingUp}
          label="Gross margin"
          value={money(d.grossMargin)}
          meta={`${d.revenue ? Math.round((d.grossMargin / d.revenue) * 100) : 0}% blended margin`}
        />
      </section>
      <section className="finance-layout">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">EVENT P&L</span>
              <h3>Budget portfolio</h3>
              <p>Planned delivery cost against commercial revenue.</p>
            </div>
          </div>
          <div className="portfolio-ledger">
            {(d.events || []).map((e) => {
              const plan = Number(e.budget?.planned || 0),
                actual = Number(e.budget?.actual || 0),
                rev = Number(e.budget?.revenue || 0);
              return (
                <div className="portfolio-ledger-row" key={e._id}>
                  <div>
                    <strong>
                      {e.eventCode} · {e.name}
                    </strong>
                    <span>
                      {shortDate(e.startDate)} ·{" "}
                      <StatusBadge value={e.status} />
                    </span>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <b>{money(rev)}</b>
                  </div>
                  <div>
                    <span>Plan</span>
                    <b>{money(plan)}</b>
                  </div>
                  <div>
                    <span>Actual</span>
                    <b>{money(actual)}</b>
                  </div>
                  <div className="budget-util">
                    <span>{plan ? Math.round((actual / plan) * 100) : 0}%</span>
                    <div className="progress-track">
                      <i
                        style={{
                          width: `${plan ? Math.min(100, (actual / plan) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {!(d.events || []).length && (
              <div className="soft-empty">
                Event P&L will appear after requests are converted.
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">APPROVAL QUEUE</span>
              <h3>Expenses</h3>
              <p>Operational spend waiting for control.</p>
            </div>
          </div>
          <div className="expense-list">
            {expenses.slice(0, 12).map((x) => (
              <div className="expense-row detailed" key={x._id}>
                <div>
                  <strong>{x.description}</strong>
                  <span>
                    {x.event?.eventCode} · {x.vendor || x.category}
                  </span>
                </div>
                <StatusBadge value={x.status} />

                <b>{money(x.amount)}</b>

                {x.status === "DRAFT" && (
                  <button
                    className="table-action"
                    onClick={() => submitExpense(x)}
                  >
                    Submit
                  </button>
                )}

                {x.status === "PENDING" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <button
                      className="table-action success"
                      onClick={() => approve(x)}
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>

                    <button
                      className="table-action"
                      onClick={() => rejectExpense(x)}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}
                {x.status === "REJECTED" && (
                  <button
                    className="table-action"
                    onClick={() => openRejectedExpense(x)}
                  >
                    <Pencil size={14} />
                    Revise
                  </button>
                )}
              </div>
            ))}
            {!expenses.length && (
              <div className="soft-empty">No expenses recorded.</div>
            )}
          </div>
        </div>
      </section>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="COST CONTROL"
        title={editingId ? "Revise rejected expense" : "Record event expense"}
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => {
                setModal(false);
                setEditingId(null);
                setForm(init);
              }}
            >
              Cancel
            </button>
            <button className="primary-button" form="expense-form">
              {editingId ? "Save revision" : "Save draft"}
            </button>
          </>
        }
      >
        <form id="expense-form" className="form-grid" onSubmit={create}>
          <label className="span-2">
            Event
            <select
              required
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
            >
              <option value="">Select event...</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.eventCode} · {e.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>VENUE</option>
              <option>PRODUCTION</option>
              <option>CATERING</option>
              <option>MEDIA</option>
              <option>STAFF</option>
              <option>TRANSPORT</option>
              <option>MARKETING</option>
              <option>OTHER</option>
            </select>
          </label>
          <label>
            Amount (VND)
            <input
              required
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label className="span-2">
            Description
            <input
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Vendor
            <input
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
          </label>
          <label>
            Expense date
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) =>
                setForm({ ...form, expenseDate: e.target.value })
              }
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
function FinanceKpi({ icon: Icon, label, value, meta, warning }) {
  return (
    <div className="finance-kpi">
      <div className={`finance-kpi-icon ${warning ? "warning" : ""}`}>
        <Icon size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}
