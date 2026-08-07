import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  ScanLine,
  Users,
  UserCheck,
  Search,
  Ticket,
  Clock3,
  QrCode,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { attendeeApi } from "../api/attendeeApi";
import { eventApi } from "../api/eventApi";
import { shortDate, dateTime } from "../utils/format";
const init = {
  event: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  ticketType: "GENERAL",
};
export default function Attendees() {
  const [items, setItems] = useState([]),
    [events, setEvents] = useState([]),
    [event, setEvent] = useState(""),
    [modal, setModal] = useState(false),
    [form, setForm] = useState(init),
    [scan, setScan] = useState(""),
    [result, setResult] = useState(null),
    [error, setError] = useState("");
  async function load() {
    const r = await attendeeApi.list(event ? { event } : {});
    setItems(r.items || []);
  }
  useEffect(() => {
    eventApi.list().then((r) => setEvents(r.items || []));
    load();
  }, []);
  useEffect(() => {
    load();
  }, [event]);
  async function create(e) {
    e.preventDefault();
    await attendeeApi.create(form);
    setForm({ ...init, event: form.event });
    setModal(false);
    load();
  }
  async function checkIn(e) {
    e.preventDefault();
    setResult(null);
    setError("");
    try {
      const r = await attendeeApi.checkIn(scan.trim());
      setResult(r);
      setScan("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  }
  const stats = useMemo(
    () => ({
      registered: items.filter((x) => x.status !== "CANCELLED").length,
      checked: items.filter((x) => x.status === "CHECKED_IN").length,
    }),
    [items],
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="GUEST EXPERIENCE"
        title="Attendees & live check-in"
        description="Control registration lists, QR identities and on-site arrivals with a real-time gate view."
        actions={
          <button className="primary-button" onClick={() => setModal(true)}>
            <Plus size={16} />
            Add attendee
          </button>
        }
      />
      <section className="guest-command">
        <div className="guest-stat">
          <Users size={19} />
          <div>
            <span>Registered</span>
            <strong>{stats.registered}</strong>
          </div>
        </div>
        <div className="guest-stat">
          <UserCheck size={19} />
          <div>
            <span>Checked in</span>
            <strong>{stats.checked}</strong>
          </div>
        </div>
        <div className="guest-stat">
          <Ticket size={19} />
          <div>
            <span>Arrival rate</span>
            <strong>
              {stats.registered
                ? Math.round((stats.checked / stats.registered) * 100)
                : 0}
              %
            </strong>
          </div>
        </div>
        <div className="event-selector">
          <span>Event view</span>
          <select value={event} onChange={(e) => setEvent(e.target.value)}>
            <option value="">All events</option>
            {events.map((e) => (
              <option value={e._id} key={e._id}>
                {e.eventCode} · {e.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="checkin-layout">
        <div className="checkin-console">
          <div className="scan-brand">
            <div>
              <QrCode size={26} />
            </div>
            <span>LIVE GATE CONSOLE</span>
          </div>
          <h2>Scan or enter guest QR code</h2>
          <p>
            Use this screen at registration desks, VIP gates or session
            entrances.
          </p>
          <form onSubmit={checkIn} className="scan-form">
            <ScanLine size={22} />
            <input
              autoFocus
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              placeholder="EF-XXXXXXXXXX"
            />
            <button>Check in</button>
          </form>
          {error && <div className="scan-result error">{error}</div>}
          {result && (
            <div className="scan-result success">
              <UserCheck size={21} />
              <div>
                <strong>{result.name}</strong>
                <span>
                  {result.company || result.email || "Guest"} · Checked in{" "}
                  {dateTime(result.checkInAt)}
                </span>
              </div>
              <StatusBadge value="CHECKED_IN" />
            </div>
          )}
          <div className="gate-hint">
            <Clock3 size={15} />
            Tip: keep the cursor in the QR field for USB/Bluetooth scanners.
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">ARRIVAL MONITOR</span>
              <h3>Latest guests</h3>
              <p>Live status across the selected event.</p>
            </div>
          </div>
          <div className="guest-list">
            {items.slice(0, 10).map((a) => (
              <div className="guest-row" key={a._id}>
                <div className="guest-avatar">{a.name?.[0]?.toUpperCase()}</div>
                <div>
                  <strong>{a.name}</strong>
                  <span>
                    {a.company || a.email || a.phone || "Guest"} ·{" "}
                    {a.ticketType}
                  </span>
                </div>
                <StatusBadge value={a.status} />
                <code>{a.qrCode}</code>
              </div>
            ))}
            {!items.length && (
              <div className="soft-empty">No attendees loaded yet.</div>
            )}
          </div>
        </div>
      </section>
      <div className="table-card enterprise-table guest-table">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Event</th>
              <th>Ticket</th>
              <th>QR identity</th>
              <th>Status</th>
              <th>Check-in</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id}>
                <td>
                  <strong>{a.name}</strong>
                  <span className="cell-sub">
                    {a.company || a.email || a.phone || "—"}
                  </span>
                </td>
                <td>
                  {a.event?.name || "—"}
                  <span className="cell-sub">{a.event?.eventCode}</span>
                </td>
                <td>{a.ticketType}</td>
                <td>
                  <code>{a.qrCode}</code>
                </td>
                <td>
                  <StatusBadge value={a.status} />
                </td>
                <td>{a.checkInAt ? dateTime(a.checkInAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="REGISTRATION"
        title="Add attendee"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" form="attendee-form">
              Register guest
            </button>
          </>
        }
      >
        <form id="attendee-form" className="form-grid" onSubmit={create}>
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
                  {e.eventCode} · {e.name} · {shortDate(e.startDate)}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Guest name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <label>
            Company
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </label>
          <label>
            Ticket type
            <select
              value={form.ticketType}
              onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
            >
              <option>GENERAL</option>
              <option>VIP</option>
              <option>VVIP</option>
              <option>SPEAKER</option>
              <option>STAFF</option>
              <option>MEDIA</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
