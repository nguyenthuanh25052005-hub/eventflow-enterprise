import { useEffect, useMemo, useState } from "react";
import { eventSupplierApi } from "../api/eventSupplierApi";
import { eventSupplierWorkflowApi } from "../api/eventSupplierWorkflowApi";
import "./EventSupplierPanel.css";

const STATUSES = [
  "PROPOSED",
  "REQUESTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_LABELS = {
  PROPOSED: "Proposed",
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const EMPTY_FORM = {
  supplier: "",
  service: "",
  description: "",
  quotationValue: "",
  contractValue: "",
  startDate: "",
  endDate: "",
  status: "PROPOSED",
  contactPerson: "",
  notes: "",
};

function supplierId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function supplierName(item) {
  if (!item?.supplier) return "Unknown supplier";
  return (
    item.supplier.name ||
    item.supplier.supplierName ||
    item.supplier.companyName ||
    item.supplier.supplierCode ||
    "Supplier"
  );
}

function money(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function dateValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function StatusBadge({ status }) {
  return (
    <span className={`event-supplier-status status-${String(status).toLowerCase()}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function EventSupplierPanel({
  eventId,
  suppliers = [],
  initialItems = null,
  title = "Suppliers",
}) {
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    if (!eventId) return;

    try {
      setLoading(true);
      setError("");

      const response = await eventSupplierApi.list({
        event: eventId,
      });

      setItems(response?.data || response?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load event suppliers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialItems) load();
  }, [eventId]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      confirmed: items.filter((x) => x.status === "CONFIRMED").length,
      active: items.filter((x) =>
        ["CONFIRMED", "IN_PROGRESS"].includes(x.status),
      ).length,
      completed: items.filter((x) => x.status === "COMPLETED").length,
      committed: items.reduce(
        (sum, x) => sum + Number(x.contractValue || 0),
        0,
      ),
    };
  }, [items]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    setOpenForm(true);
  }

  function openEdit(item) {
    setEditingId(item._id);
    setForm({
      supplier: supplierId(item.supplier),
      service: item.service || "",
      description: item.description || "",
      quotationValue:
        item.quotationValue === 0 ? "" : String(item.quotationValue || ""),
      contractValue:
        item.contractValue === 0 ? "" : String(item.contractValue || ""),
      startDate: dateValue(item.startDate),
      endDate: dateValue(item.endDate),
      status: item.status || "PROPOSED",
      contactPerson: item.contactPerson || "",
      notes: item.notes || "",
    });
    setMessage("");
    setError("");
    setOpenForm(true);
  }

  function change(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!eventId) {
      setError("Event id is required.");
      return;
    }

    if (!form.supplier) {
      setError("Please select a supplier.");
      return;
    }

    if (!form.service.trim()) {
      setError("Service is required.");
      return;
    }

    if (
      form.contractValue !== "" &&
      Number(form.contractValue) < 0
    ) {
      setError("Contract value cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        event: eventId,
        supplier: form.supplier,
        service: form.service.trim(),
        description: form.description.trim(),
        quotationValue: Number(form.quotationValue || 0),
        contractValue: Number(form.contractValue || 0),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        contactPerson: form.contactPerson.trim(),
        notes: form.notes.trim(),
      };

      if (editingId) {
        await eventSupplierApi.update(editingId, payload);
        setMessage("Supplier assignment updated.");
      } else {
        await eventSupplierApi.create(payload);
        setMessage("Supplier assigned successfully.");
      }

      setOpenForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save supplier assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const confirmed = window.confirm(
      `Remove ${supplierName(item)} from this event?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await eventSupplierApi.remove(item._id);

      setItems((current) =>
        current.filter((x) => x._id !== item._id),
      );

      setMessage("Supplier assignment removed.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to remove supplier assignment.",
      );
    }
  }

  async function changeStatus(item, nextStatus) {
    if (nextStatus === item.status) return;

    try {
      setError("");
      setMessage("");

      const response =
        await eventSupplierWorkflowApi.updateStatus(
          item._id,
          nextStatus,
        );

      const updated = response?.data;

      if (updated) {
        setItems((current) =>
          current.map((x) =>
            x._id === item._id ? updated : x,
          ),
        );
      } else {
        await load();
      }

      setMessage(
        `${supplierName(item)} moved to ${STATUS_LABELS[nextStatus] || nextStatus}.`,
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Status transition failed.",
      );
    }
  }

  function allowedStatuses(current) {
    const transitions = {
      PROPOSED: ["REQUESTED", "CANCELLED"],
      REQUESTED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    return [current, ...(transitions[current] || [])];
  }

  return (
    <section className="event-supplier-panel">
      <div className="event-supplier-header">
        <div>
          <span className="event-supplier-eyebrow">
            EVENT WORKSPACE
          </span>
          <h2>{title}</h2>
          <p>
            Manage production partners, quotations, contracts and
            delivery status for this event.
          </p>
        </div>

        <button
          type="button"
          className="event-supplier-primary"
          onClick={openCreate}
        >
          + Assign Supplier
        </button>
      </div>

      {error && (
        <div className="event-supplier-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="event-supplier-alert success">
          {message}
        </div>
      )}

      <div className="event-supplier-summary">
        <div>
          <span>Total suppliers</span>
          <strong>{summary.total}</strong>
        </div>

        <div>
          <span>Confirmed</span>
          <strong>{summary.confirmed}</strong>
        </div>

        <div>
          <span>Active delivery</span>
          <strong>{summary.active}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </div>

        <div>
          <span>Committed value</span>
          <strong>{money(summary.committed)} ₫</strong>
        </div>
      </div>

      {loading ? (
        <div className="event-supplier-empty">
          Loading suppliers...
        </div>
      ) : items.length === 0 ? (
        <div className="event-supplier-empty">
          <div className="event-supplier-empty-icon">＋</div>
          <h3>No suppliers assigned</h3>
          <p>
            Start the event procurement workflow by assigning the
            first supplier.
          </p>
          <button
            type="button"
            className="event-supplier-primary"
            onClick={openCreate}
          >
            Assign Supplier
          </button>
        </div>
      ) : (
        <div className="event-supplier-table-wrap">
          <table className="event-supplier-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Service</th>
                <th>Quotation</th>
                <th>Contract</th>
                <th>Status</th>
                <th>Delivery</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="supplier-main">
                      <strong>{supplierName(item)}</strong>
                      <small>
                        {item.contactPerson ||
                          item.supplier?.phone ||
                          "No contact"}
                      </small>
                    </div>
                  </td>

                  <td>
                    <span className="service-name">
                      {item.service}
                    </span>
                  </td>

                  <td>{money(item.quotationValue)} ₫</td>

                  <td className="contract-value">
                    {money(item.contractValue)} ₫
                  </td>

                  <td>
                    <div className="status-control">
                      <StatusBadge status={item.status} />

                      <select
                        value={item.status}
                        disabled={
                          ["COMPLETED", "CANCELLED"].includes(
                            item.status,
                          )
                        }
                        onChange={(event) =>
                          changeStatus(
                            item,
                            event.target.value,
                          )
                        }
                      >
                        {allowedStatuses(item.status).map(
                          (status) => (
                            <option
                              value={status}
                              key={status}
                            >
                              {STATUS_LABELS[status] || status}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </td>

                  <td>
                    <div className="delivery-dates">
                      <span>
                        {dateValue(item.startDate) || "—"}
                      </span>
                      <span>
                        {dateValue(item.endDate) || "—"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="supplier-actions">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() => remove(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openForm && (
        <div className="event-supplier-modal-backdrop">
          <div className="event-supplier-modal">
            <div className="event-supplier-modal-header">
              <div>
                <span className="event-supplier-eyebrow">
                  {editingId
                    ? "SUPPLIER ASSIGNMENT"
                    : "NEW SUPPLIER ASSIGNMENT"}
                </span>

                <h3>
                  {editingId
                    ? "Edit supplier"
                    : "Assign supplier"}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setOpenForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="supplier-form-grid">
                <label>
                  Supplier
                  <select
                    value={form.supplier}
                    onChange={(event) =>
                      change(
                        "supplier",
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">
                      Select supplier
                    </option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier._id || supplier.id}
                        value={
                          supplier._id || supplier.id
                        }
                      >
                        {supplier.name ||
                          supplier.companyName ||
                          supplier.supplierName ||
                          supplier.supplierCode}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Service
                  <input
                    value={form.service}
                    onChange={(event) =>
                      change(
                        "service",
                        event.target.value,
                      )
                    }
                    placeholder="Lighting"
                    required
                  />
                </label>

                <label>
                  Quotation value
                  <input
                    type="number"
                    min="0"
                    value={form.quotationValue}
                    onChange={(event) =>
                      change(
                        "quotationValue",
                        event.target.value,
                      )
                    }
                    placeholder="120000000"
                  />
                </label>

                <label>
                  Contract value
                  <input
                    type="number"
                    min="0"
                    value={form.contractValue}
                    onChange={(event) =>
                      change(
                        "contractValue",
                        event.target.value,
                      )
                    }
                    placeholder="120000000"
                  />
                </label>

                <label>
                  Start date
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      change(
                        "startDate",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  End date
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      change(
                        "endDate",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Initial status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      change(
                        "status",
                        event.target.value,
                      )
                    }
                  >
                    {STATUSES.map((status) => (
                      <option
                        value={status}
                        key={status}
                      >
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Contact person
                  <input
                    value={form.contactPerson}
                    onChange={(event) =>
                      change(
                        "contactPerson",
                        event.target.value,
                      )
                    }
                    placeholder="Supplier contact"
                  />
                </label>

                <label className="full-width">
                  Description
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(event) =>
                      change(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Scope of supplier delivery..."
                  />
                </label>

                <label className="full-width">
                  Notes
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(event) =>
                      change(
                        "notes",
                        event.target.value,
                      )
                    }
                    placeholder="Internal procurement notes..."
                  />
                </label>
              </div>

              <div className="event-supplier-modal-footer">
                <button
                  type="button"
                  className="event-supplier-secondary"
                  onClick={() => setOpenForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="event-supplier-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Assign Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
