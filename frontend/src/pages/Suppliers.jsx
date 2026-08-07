import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Truck,
  Star,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { supplierApi } from "../api/supplierApi";
const init = {
  name: "",
  category: "OTHER",
  contactName: "",
  phone: "",
  email: "",
  rating: 0,
  notes: "",
};
export default function Suppliers() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(false),
    [form, setForm] = useState(init);
  async function load() {
    const r = await supplierApi.list({ search });
    setItems(r.items || []);
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);
  async function create(e) {
    e.preventDefault();
    await supplierApi.create({ ...form, rating: Number(form.rating || 0) });
    setModal(false);
    setForm(init);
    load();
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="VENDOR NETWORK"
        title="Suppliers & partners"
        description="Maintain a qualified supplier network for venues, production, catering, media, transport and staffing."
        actions={
          <button className="primary-button" onClick={() => setModal(true)}>
            <Plus size={16} />
            Add supplier
          </button>
        }
      />
      <section className="vendor-stats">
        <div>
          <Truck size={18} />
          <span>Active partners</span>
          <strong>{items.filter((x) => x.status === "ACTIVE").length}</strong>
        </div>
        <div>
          <Building2 size={18} />
          <span>Service categories</span>
          <strong>{new Set(items.map((x) => x.category)).size}</strong>
        </div>
        <div>
          <Star size={18} />
          <span>Avg. rating</span>
          <strong>
            {items.length
              ? (
                  items.reduce((s, x) => s + Number(x.rating || 0), 0) /
                  items.length
                ).toFixed(1)
              : "—"}
          </strong>
        </div>
      </section>
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier..."
          />
        </div>
        <select>
          <option>All categories</option>
        </select>
      </div>
      <div className="supplier-grid">
        {items.map((s) => (
          <article className="supplier-card" key={s._id}>
            <div className="supplier-card-head">
              <div className="supplier-logo">
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <StatusBadge value={s.status} />
            </div>
            <span className="supplier-code">
              {s.supplierCode} · {s.category}
            </span>
            <h3>{s.name}</h3>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  fill={
                    i <= Math.round(s.rating || 0) ? "currentColor" : "none"
                  }
                />
              ))}{" "}
              <span>{s.rating || 0}/5</span>
            </div>
            <div className="supplier-contact">
              <span>
                <Phone size={14} />
                {s.phone || "No phone"}
              </span>
              <span>
                <Mail size={14} />
                {s.email || "No email"}
              </span>
            </div>
            <footer>
              <span>Primary contact</span>
              <strong>{s.contactName || "Not assigned"}</strong>
            </footer>
          </article>
        ))}
        {!items.length && (
          <div className="soft-empty span-full">
            Build your approved vendor network before assigning suppliers to
            events.
          </div>
        )}
      </div>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="VENDOR ONBOARDING"
        title="Add supplier"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" form="supplier-form">
              Add supplier
            </button>
          </>
        }
      >
        <form id="supplier-form" className="form-grid" onSubmit={create}>
          <label className="span-2">
            Supplier name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>VENUE</option>
              <option>SOUND</option>
              <option>LIGHTING</option>
              <option>LED</option>
              <option>CATERING</option>
              <option>MEDIA</option>
              <option>DECORATION</option>
              <option>TRANSPORT</option>
              <option>STAFFING</option>
              <option>OTHER</option>
            </select>
          </label>
          <label>
            Rating
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </label>
          <label>
            Contact name
            <input
              value={form.contactName}
              onChange={(e) =>
                setForm({ ...form, contactName: e.target.value })
              }
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
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
