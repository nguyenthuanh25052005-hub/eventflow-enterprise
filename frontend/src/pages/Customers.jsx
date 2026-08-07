import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  UserRound,
  WalletCards,
  CalendarDays,
  ClipboardList,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { customerApi } from "../api/customerApi";
import { money, shortDate } from "../utils/format";
const empty = {
  type: "COMPANY",
  name: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  taxCode: "",
  source: "OTHER",
  notes: "",
  contactPerson: { name: "", position: "", phone: "", email: "" },
};
export default function Customers() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("ACTIVE"),
    [modal, setModal] = useState(false),
    [detail, setDetail] = useState(null),
    [form, setForm] = useState(empty),
    [error, setError] = useState("");
  async function load() {
    const r = await customerApi.list({ search, status, limit: 100 });
    setItems(r.items || []);
  }
  useEffect(() => {
    load();
  }, [status]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);
  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await customerApi.create(form);
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create customer");
    }
  }
  async function open(id) {
    setDetail(await customerApi.get(id));
  }
  const cp = (k, v) =>
    setForm({ ...form, contactPerson: { ...form.contactPerson, [k]: v } });
  return (
    <div className="page">
      <PageHeader
        eyebrow="CUSTOMER RELATIONSHIP MANAGEMENT"
        title="Customer accounts"
        description="A commercial account view that connects contacts, opportunities, quotations and delivered events."
        actions={
          <button className="primary-button" onClick={() => setModal(true)}>
            <Plus size={16} />
            New customer
          </button>
        }
      />
      <section className="crm-strip">
        <div>
          <Building2 size={18} />
          <span>Active accounts</span>
          <strong>{items.length}</strong>
        </div>
        <div>
          <UserRound size={18} />
          <span>Corporate customers</span>
          <strong>{items.filter((x) => x.type === "COMPANY").length}</strong>
        </div>
        <div>
          <ClipboardList size={18} />
          <span>Lead sources</span>
          <strong>{new Set(items.map((x) => x.source)).size}</strong>
        </div>
      </section>
      <div className="toolbar enterprise-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, email or phone..."
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </select>
      </div>
      <div className="table-card enterprise-table">
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Primary contact</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c._id}
                className="clickable-row"
                onClick={() => open(c._id)}
              >
                <td>
                  <div className="account-cell">
                    <div className="account-logo">
                      {(c.companyName || c.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{c.companyName || c.name}</strong>
                      <span>
                        {c.customerCode} · {c.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{c.contactPerson?.name || c.name}</strong>
                  <span className="cell-sub">
                    {c.contactPerson?.position || "Primary contact"}
                  </span>
                </td>
                <td>
                  <span className="contact-line">
                    <Mail size={13} />
                    {c.email || c.contactPerson?.email || "—"}
                  </span>
                  <span className="contact-line">
                    <Phone size={13} />
                    {c.phone || c.contactPerson?.phone || "—"}
                  </span>
                </td>
                <td>{c.source}</td>
                <td>
                  <StatusBadge value={c.status} />
                </td>
                <td>
                  <MoreHorizontal size={17} />
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan="6" className="table-empty">
                  No customer accounts match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="CRM ACCOUNT"
        title="Create customer"
        size="lg"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" form="customer-form">
              Create account
            </button>
          </>
        }
      >
        <form id="customer-form" className="form-grid" onSubmit={create}>
          <label>
            Account type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>COMPANY</option>
              <option>INDIVIDUAL</option>
            </select>
          </label>
          <label>
            Display name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Company name
            <input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </label>
          <label>
            Tax code
            <input
              value={form.taxCode}
              onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="span-2">
            Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <div className="section-label span-2">Primary contact</div>
          <label>
            Contact name
            <input
              value={form.contactPerson.name}
              onChange={(e) => cp("name", e.target.value)}
            />
          </label>
          <label>
            Position
            <input
              value={form.contactPerson.position}
              onChange={(e) => cp("position", e.target.value)}
            />
          </label>
          <label>
            Contact phone
            <input
              value={form.contactPerson.phone}
              onChange={(e) => cp("phone", e.target.value)}
            />
          </label>
          <label>
            Contact email
            <input
              type="email"
              value={form.contactPerson.email}
              onChange={(e) => cp("email", e.target.value)}
            />
          </label>
          {error && <div className="error-box span-2">{error}</div>}
        </form>
      </Modal>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        eyebrow={detail?.customerCode}
        title={detail?.companyName || detail?.name}
        size="xl"
      >
        {detail && (
          <div className="customer-360">
            <aside className="customer-profile">
              <div className="customer-profile-logo">
                {(detail.companyName || detail.name).slice(0, 2).toUpperCase()}
              </div>
              <StatusBadge value={detail.status} />
              <p>{detail.type} ACCOUNT</p>
              <div className="profile-contact">
                <span>
                  <UserRound size={14} />
                  {detail.contactPerson?.name || detail.name}
                </span>
                <span>
                  <Mail size={14} />
                  {detail.email || detail.contactPerson?.email || "—"}
                </span>
                <span>
                  <Phone size={14} />
                  {detail.phone || detail.contactPerson?.phone || "—"}
                </span>
                <span>
                  <MapPin size={14} />
                  {detail.address || "No address"}
                </span>
              </div>
            </aside>
            <div className="customer-timeline">
              <section className="customer-metrics">
                <div>
                  <ClipboardList size={17} />
                  <span>Requests</span>
                  <strong>{detail.metrics?.requests || 0}</strong>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>Events</span>
                  <strong>{detail.metrics?.events || 0}</strong>
                </div>
                <div>
                  <WalletCards size={17} />
                  <span>Approved revenue</span>
                  <strong>{money(detail.metrics?.approvedRevenue || 0)}</strong>
                </div>
              </section>
              <div className="detail-section">
                <div className="section-title-row">
                  <div>
                    <span className="panel-kicker">ACCOUNT ACTIVITY</span>
                    <h3>Recent event journey</h3>
                  </div>
                </div>
                {detail.requests?.map((r) => (
                  <div className="account-activity" key={r._id}>
                    <div className="activity-dot" />
                    <div>
                      <strong>{r.title}</strong>
                      <span>
                        {r.requestCode} · {shortDate(r.eventDate)} ·{" "}
                        {r.location || "TBD"}
                      </span>
                    </div>
                    <StatusBadge value={r.status} />
                    <ArrowRight size={14} />
                  </div>
                ))}
                {!detail.requests?.length && (
                  <div className="soft-empty compact">
                    No opportunities recorded for this account.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
