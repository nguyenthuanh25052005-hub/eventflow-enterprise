import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Users,
  WalletCards,
  ArrowRight,
  FileText,
  Building2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { eventRequestApi } from "../api/eventRequestApi";
import { customerApi } from "../api/customerApi";
import { quotationApi } from "../api/quotationApi";
import { money, number, shortDate } from "../utils/format";

const stages = [
  "NEW",
  "QUALIFYING",
  "QUOTATION",
  "NEGOTIATING",
  "APPROVED",
  "CONVERTED",
];
const initial = {
  customer: "",
  title: "",
  eventType: "CORPORATE",
  eventDate: "",
  expectedAttendees: "",
  location: "",
  expectedBudget: "",
  priority: "MEDIUM",
  requirements: "",
  notes: "",
};
export default function EventRequests() {
  const [items, setItems] = useState([]),
    [customers, setCustomers] = useState([]),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(false),
    [detail, setDetail] = useState(null),
    [form, setForm] = useState(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function load() {
    setLoading(true);
    try {
      const r = await eventRequestApi.list({ search });
      setItems(r.items || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    customerApi
      .list({ status: "ACTIVE", limit: 100 })
      .then((r) => setCustomers(r.items || []));
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);
  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await eventRequestApi.create({
        ...form,
        expectedAttendees: Number(form.expectedAttendees || 0),
        expectedBudget: Number(form.expectedBudget || 0),
        requirements: form.requirements
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      });
      setModal(false);
      setForm(initial);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create request");
    }
  }
  async function openDetail(id) {
    setDetail(await eventRequestApi.get(id));
  }
  async function move(status) {
    await eventRequestApi.update(detail._id, { status });
    setDetail(await eventRequestApi.get(detail._id));
    load();
  }
  async function makeQuote() {
    const items = [
      {
        name: "Event production package",
        quantity: 1,
        unit: "package",
        unitPrice: Number(detail.expectedBudget || 0),
      },
    ];
    await quotationApi.create({
      eventRequest: detail._id,
      title: `Quotation - ${detail.title}`,
      items,
      vatPercent: 10,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    });
    setDetail(await eventRequestApi.get(detail._id));
    load();
  }
  async function updateQuote(q, status) {
    await quotationApi.update(q._id, { status });
    setDetail(await eventRequestApi.get(detail._id));
    load();
  }
  async function convert() {
    await eventRequestApi.convert(detail._id);
    setDetail(await eventRequestApi.get(detail._id));
    load();
  }
  const grouped = useMemo(
    () =>
      Object.fromEntries(
        stages.map((s) => [s, items.filter((x) => x.status === s)]),
      ),
    [items],
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="SALES PIPELINE"
        title="Event requests"
        description="Qualify opportunities, build quotations and hand approved work to operations without losing context."
        actions={
          <button className="primary-button" onClick={() => setModal(true)}>
            <Plus size={17} />
            New request
          </button>
        }
      />
      <div className="pipeline-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request, venue or code..."
          />
        </div>
        <button className="secondary-button">
          <SlidersHorizontal size={16} />
          Filters
        </button>
        <div className="pipeline-summary">
          <span>{items.length} opportunities</span>
          <strong>
            {money(
              items.reduce((s, x) => s + Number(x.expectedBudget || 0), 0),
            )}
          </strong>
        </div>
      </div>
      <div className="kanban enterprise-kanban">
        {stages.map((stage) => (
          <div className="kanban-column" key={stage}>
            <div className="kanban-column-head">
              <StatusBadge value={stage} />
              <span>{grouped[stage]?.length || 0}</span>
            </div>
            <div className="kanban-stack">
              {grouped[stage]?.map((r) => (
                <button
                  className="request-card"
                  key={r._id}
                  onClick={() => openDetail(r._id)}
                >
                  <div className="request-card-top">
                    <span className="request-code">{r.requestCode}</span>
                    <StatusBadge value={r.priority} />
                  </div>
                  <strong>{r.title}</strong>
                  <span className="request-customer">
                    <Building2 size={13} />
                    {r.customer?.companyName || r.customer?.name}
                  </span>
                  <div className="request-meta">
                    <span>
                      <CalendarDays size={13} />
                      {shortDate(r.eventDate)}
                    </span>
                    <span>
                      <Users size={13} />
                      {number(r.expectedAttendees)}
                    </span>
                  </div>
                  <div className="request-value">
                    <span>Expected budget</span>
                    <b>{money(r.expectedBudget)}</b>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="page-loading">Loading pipeline...</div>}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="NEW OPPORTUNITY"
        title="Create event request"
        size="lg"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" form="request-form">
              Create request
            </button>
          </>
        }
      >
        <form id="request-form" className="form-grid" onSubmit={create}>
          <label className="span-2">
            Customer
            <select
              required
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName || c.name} · {c.customerCode}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Event / opportunity name
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. ABC Year End Party 2026"
            />
          </label>
          <label>
            Event type
            <select
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            >
              <option>CORPORATE</option>
              <option>CONFERENCE</option>
              <option>GALA</option>
              <option>ACTIVATION</option>
              <option>EXHIBITION</option>
              <option>FESTIVAL</option>
              <option>TEAM_BUILDING</option>
              <option>OTHER</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>URGENT</option>
            </select>
          </label>
          <label>
            Expected date
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </label>
          <label>
            Expected attendees
            <input
              type="number"
              value={form.expectedAttendees}
              onChange={(e) =>
                setForm({ ...form, expectedAttendees: e.target.value })
              }
            />
          </label>
          <label className="span-2">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Venue / city / TBD"
            />
          </label>
          <label>
            Expected budget (VND)
            <input
              type="number"
              value={form.expectedBudget}
              onChange={(e) =>
                setForm({ ...form, expectedBudget: e.target.value })
              }
            />
          </label>
          <label>
            Requirements
            <input
              value={form.requirements}
              onChange={(e) =>
                setForm({ ...form, requirements: e.target.value })
              }
              placeholder="LED, catering, MC, livestream"
            />
          </label>
          <label className="span-2">
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="4"
            />
          </label>
          {error && <div className="error-box span-2">{error}</div>}
        </form>
      </Modal>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        eyebrow={detail?.requestCode}
        title={detail?.title}
        size="xl"
      >
        {detail && (
          <div className="request-detail-layout">
            <div className="detail-main">
              <div className="detail-summary-grid">
                <Detail
                  icon={Building2}
                  label="Customer"
                  value={detail.customer?.companyName || detail.customer?.name}
                />
                <Detail
                  icon={CalendarDays}
                  label="Event date"
                  value={shortDate(detail.eventDate)}
                />
                <Detail
                  icon={MapPin}
                  label="Location"
                  value={detail.location || "TBD"}
                />
                <Detail
                  icon={Users}
                  label="Expected guests"
                  value={number(detail.expectedAttendees)}
                />
                <Detail
                  icon={WalletCards}
                  label="Expected budget"
                  value={money(detail.expectedBudget)}
                />
                <Detail
                  icon={FileText}
                  label="Pipeline status"
                  value={<StatusBadge value={detail.status} />}
                />
              </div>
              <div className="detail-section">
                <div className="section-title-row">
                  <div>
                    <span className="panel-kicker">COMMERCIAL</span>
                    <h3>Quotations</h3>
                  </div>
                  {!detail.quotations?.length && (
                    <button className="secondary-button" onClick={makeQuote}>
                      <Plus size={15} />
                      Create quotation
                    </button>
                  )}
                </div>
                {detail.quotations?.length ? (
                  detail.quotations.map((q) => (
                    <div className="quote-line" key={q._id}>
                      <div>
                        <strong>
                          {q.quotationCode} · {q.title}
                        </strong>
                        <span>Valid until {shortDate(q.validUntil)}</span>
                      </div>
                      <div className="quote-total">{money(q.total)}</div>
                      <StatusBadge value={q.status} />
                      <div className="quote-actions">
                        {q.status === "DRAFT" && (
                          <button onClick={() => updateQuote(q, "SENT")}>
                            Send
                          </button>
                        )}
                        {q.status === "SENT" && (
                          <button onClick={() => updateQuote(q, "APPROVED")}>
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="soft-empty compact">
                    No quotation created yet.
                  </div>
                )}
              </div>
            </div>
            <aside className="detail-side">
              <div className="detail-side-card">
                <span className="panel-kicker">NEXT ACTION</span>
                <h3>Move opportunity</h3>
                <div className="stage-actions">
                  {stages
                    .filter((s) => s !== detail.status)
                    .slice(0, 5)
                    .map((s) => (
                      <button key={s} onClick={() => move(s)}>
                        <StatusBadge value={s} />
                        <ArrowRight size={14} />
                      </button>
                    ))}
                </div>
              </div>
              {detail.status === "APPROVED" && (
                <div className="handoff-card">
                  <strong>Commercial approval complete</strong>
                  <p>
                    Create the operational event workspace with customer, date,
                    budget and quotation linked automatically.
                  </p>
                  <button className="primary-button full" onClick={convert}>
                    Convert to event <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </Modal>
    </div>
  );
}
function Detail({ icon: Icon, label, value }) {
  return (
    <div className="detail-field">
      <div className="detail-field-icon">
        <Icon size={16} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
