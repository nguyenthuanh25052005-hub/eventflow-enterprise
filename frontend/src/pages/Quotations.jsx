import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Send,
  CheckCircle2,
  Clock3,
  WalletCards,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { quotationApi } from "../api/quotationApi";
import { money, shortDate } from "../utils/format";

export default function Quotations() {
  const [items, setItems] = useState([]),
    [filter, setFilter] = useState("");
  async function load() {
    const r = await quotationApi.list(filter ? { status: filter } : {});
    setItems(r.items || []);
  }
  useEffect(() => {
    load();
  }, [filter]);
  async function change(id, status) {
    await quotationApi.update(id, { status });
    load();
  }
  const approved = items
    .filter((x) => x.status === "APPROVED")
    .reduce((s, x) => s + Number(x.total || 0), 0);
  const pending = items
    .filter((x) => ["DRAFT", "SENT"].includes(x.status))
    .reduce((s, x) => s + Number(x.total || 0), 0);
  return (
    <div className="page">
      <PageHeader
        eyebrow="COMMERCIAL"
        title="Quotations"
        description="Manage commercial proposals, approvals and revenue handoff into event delivery."
      />
      <section className="mini-kpi-grid">
        <Mini icon={FileText} label="Total quotations" value={items.length} />
        <Mini
          icon={WalletCards}
          label="Approved value"
          value={money(approved)}
        />
        <Mini icon={Clock3} label="Pending value" value={money(pending)} />
        <Mini
          icon={CheckCircle2}
          label="Approval rate"
          value={`${items.length ? Math.round((items.filter((x) => x.status === "APPROVED").length / items.length) * 100) : 0}%`}
        />
      </section>
      <div className="toolbar enterprise-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search quotation code or customer..." />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>DRAFT</option>
          <option>SENT</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
        </select>
      </div>
      <div className="table-card enterprise-table">
        <table>
          <thead>
            <tr>
              <th>Quotation</th>
              <th>Customer / Request</th>
              <th>Valid until</th>
              <th>Status</th>
              <th className="right">Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((q) => (
                <tr key={q._id}>
                  <td>
                    <div className="doc-cell">
                      <div className="doc-icon">
                        <FileText size={17} />
                      </div>
                      <div>
                        <strong>{q.quotationCode}</strong>
                        <span>{q.title}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>
                      {q.customer?.companyName || q.customer?.name || "—"}
                    </strong>
                    <span className="cell-sub">
                      {q.eventRequest?.requestCode} · {q.eventRequest?.title}
                    </span>
                  </td>
                  <td>{shortDate(q.validUntil)}</td>
                  <td>
                    <StatusBadge value={q.status} />
                  </td>
                  <td className="right">
                    <strong>{money(q.total)}</strong>
                    <span className="cell-sub">VAT included</span>
                  </td>
                  <td>
                    {q.status === "DRAFT" ? (
                      <button
                        className="table-action"
                        onClick={() => change(q._id, "SENT")}
                      >
                        <Send size={14} />
                        Send
                      </button>
                    ) : q.status === "SENT" ? (
                      <button
                        className="table-action success"
                        onClick={() => change(q._id, "APPROVED")}
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-empty">
                  No quotations yet. Create one from an event request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Mini({ icon: Icon, label, value }) {
  return (
    <div className="mini-kpi">
      <div className="mini-icon">
        <Icon size={17} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
