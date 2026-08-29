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
  KeyRound,
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

  contactPerson: {
    name: "",
    position: "",
    phone: "",
    email: "",
  },
};

const emptyPortalForm = {
  name: "",
  email: "",
  password: "",
};

export default function Customers() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("ACTIVE"),
    [modal, setModal] = useState(false),
    [detail, setDetail] = useState(null),
    [form, setForm] = useState(empty),
    [error, setError] = useState(""),
    [portalModal, setPortalModal] = useState(false),
    [portalCustomer, setPortalCustomer] = useState(null),
    [portalError, setPortalError] = useState(""),
    [portalForm, setPortalForm] = useState(emptyPortalForm);

  // =====================================
  // CURRENT USER
  // =====================================

  const user = JSON.parse(localStorage.getItem("eventflow_user") || "{}");

  const canManagePortal = ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  // =====================================
  // LOAD CUSTOMERS
  // =====================================

  async function load() {
    const r = await customerApi.list({
      search,
      status,
      limit: 100,
    });

    setItems(r.items || []);
  }

  useEffect(() => {
    load();
  }, [status]);

  useEffect(() => {
    const t = setTimeout(load, 250);

    return () => clearTimeout(t);
  }, [search]);

  // =====================================
  // CREATE CUSTOMER
  // =====================================

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

  // =====================================
  // OPEN CUSTOMER DETAIL
  // =====================================

  async function open(id) {
    setDetail(await customerApi.get(id));
  }

  // =====================================
  // CONTACT PERSON
  // =====================================

  const cp = (key, value) =>
    setForm({
      ...form,

      contactPerson: {
        ...form.contactPerson,

        [key]: value,
      },
    });

  // =====================================
  // OPEN PORTAL ACCOUNT FORM
  // =====================================

  function openPortalAccount(customer) {
    setPortalCustomer(customer);

    setPortalForm({
      name: customer.contactPerson?.name || customer.name || "",

      email: customer.contactPerson?.email || customer.email || "",

      password: "",
    });

    setPortalError("");

    // Đóng Customer Detail
    setDetail(null);

    // Mở Portal Account modal
    setPortalModal(true);
  }

  // =====================================
  // CLOSE PORTAL ACCOUNT FORM
  // =====================================

  function closePortalAccount() {
    setPortalModal(false);

    setPortalCustomer(null);

    setPortalError("");

    setPortalForm(emptyPortalForm);
  }

  // =====================================
  // CREATE PORTAL ACCOUNT
  // =====================================

  async function createPortalAccount(e) {
    e.preventDefault();

    setPortalError("");

    if (!portalCustomer?._id) {
      setPortalError("Customer information is unavailable");

      return;
    }

    try {
      await customerApi.createPortalAccount(portalCustomer._id, portalForm);

      closePortalAccount();

      alert("Customer portal account created successfully");

      load();
    } catch (err) {
      setPortalError(
        err.response?.data?.message || "Could not create portal account",
      );
    }
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="page">
      {/* =====================================
          HEADER
      ===================================== */}

      <PageHeader
        eyebrow="CUSTOMER RELATIONSHIP MANAGEMENT"
        title="Customer accounts"
        description="A commercial account view that connects contacts, opportunities, quotations and delivered events."
        actions={
          <button
            className="primary-button"
            onClick={() => {
              setForm(empty);
              setError("");
              setModal(true);
            }}
          >
            <Plus size={16} />
            New customer
          </button>
        }
      />

      {/* =====================================
          KPI
      ===================================== */}

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

      {/* =====================================
          SEARCH
      ===================================== */}

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

      {/* =====================================
          CUSTOMER TABLE
      ===================================== */}

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

      {/* =====================================
          CREATE CUSTOMER MODAL
      ===================================== */}

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);

          setError("");

          setForm(empty);
        }}
        eyebrow="CRM ACCOUNT"
        title="Create customer"
        size="lg"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => {
                setModal(false);

                setError("");

                setForm(empty);
              }}
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
              onChange={(e) =>
                setForm({
                  ...form,

                  type: e.target.value,
                })
              }
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
              onChange={(e) =>
                setForm({
                  ...form,

                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Company name
            <input
              value={form.companyName}
              onChange={(e) =>
                setForm({
                  ...form,

                  companyName: e.target.value,
                })
              }
            />
          </label>

          <label>
            Tax code
            <input
              value={form.taxCode}
              onChange={(e) =>
                setForm({
                  ...form,

                  taxCode: e.target.value,
                })
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,

                  email: e.target.value,
                })
              }
            />
          </label>

          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,

                  phone: e.target.value,
                })
              }
            />
          </label>

          <label className="span-2">
            Address
            <input
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,

                  address: e.target.value,
                })
              }
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

      {/* =====================================
          CUSTOMER DETAIL MODAL
      ===================================== */}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        eyebrow={detail?.customerCode}
        title={detail?.companyName || detail?.name}
        size="xl"
      >
        {detail && (
          <div className="customer-360">
            {/* ==============================
                CUSTOMER PROFILE
            ============================== */}

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

              {/* ==============================
                  CREATE PORTAL ACCOUNT
              ============================== */}

              {canManagePortal && detail.status === "ACTIVE" && (
                <button
                  className="secondary-button"
                  style={{
                    marginTop: "16px",

                    width: "100%",
                  }}
                  onClick={() => openPortalAccount(detail)}
                >
                  <KeyRound size={15} />
                  Create portal account
                </button>
              )}
            </aside>

            {/* ==============================
                CUSTOMER TIMELINE
            ============================== */}

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

      {/* =====================================
          CREATE CUSTOMER PORTAL ACCOUNT
      ===================================== */}

      <Modal
        open={portalModal}
        onClose={closePortalAccount}
        eyebrow="CUSTOMER PORTAL"
        title="Create portal account"
        size="lg"
        footer={
          <>
            <button className="secondary-button" onClick={closePortalAccount}>
              Cancel
            </button>

            <button className="primary-button" form="portal-account-form">
              Create account
            </button>
          </>
        }
      >
        <form
          id="portal-account-form"
          className="form-grid"
          onSubmit={createPortalAccount}
        >
          {/* CUSTOMER */}

          <label className="span-2">
            Customer
            <input
              value={portalCustomer?.companyName || portalCustomer?.name || ""}
              disabled
            />
          </label>

          {/* CONTACT NAME */}

          <label>
            Contact name
            <input
              required
              value={portalForm.name}
              onChange={(e) =>
                setPortalForm({
                  ...portalForm,

                  name: e.target.value,
                })
              }
            />
          </label>

          {/* LOGIN EMAIL */}

          <label>
            Login email
            <input
              required
              type="email"
              value={portalForm.email}
              onChange={(e) =>
                setPortalForm({
                  ...portalForm,

                  email: e.target.value,
                })
              }
            />
          </label>

          {/* PASSWORD */}

          <label className="span-2">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={portalForm.password}
              onChange={(e) =>
                setPortalForm({
                  ...portalForm,

                  password: e.target.value,
                })
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
            <small>
              Customer will use this email and password to sign in to the
              Customer Portal.
            </small>
          </label>

          {/* ERROR */}

          {portalError && <div className="error-box span-2">{portalError}</div>}
        </form>
      </Modal>
    </div>
  );
}
