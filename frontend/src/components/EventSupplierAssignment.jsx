import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { eventSupplierApi } from "../api/eventSupplierApi";
import client from "../api/client";
import { money } from "../utils/format";

const initialForm = {
  supplier: "",
  service: "",
  description: "",
  quotationValue: 0,
  contractValue: 0,
  status: "",
  contactPerson: "",
  notes: "",
};

export default function EventSupplierAssignment({ eventId }) {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      const [
        supplierResponse,
        eventSupplierResponse,
        statusResponse,
      ] = await Promise.all([
        client.get("/suppliers"),
        eventSupplierApi.list(eventId),
        client.get("/event-suppliers/statuses"),
      ]);

      const supplierData =
        supplierResponse.data?.data ||
        supplierResponse.data?.suppliers ||
        supplierResponse.data ||
        [];

      const eventSupplierData =
        eventSupplierResponse.data?.data ||
        eventSupplierResponse.data ||
        [];

      const statusData =
        statusResponse.data?.data ||
        statusResponse.data ||
        [];

      const normalizedSuppliers = Array.isArray(supplierData)
        ? supplierData
        : [];

      const normalizedEventSuppliers = Array.isArray(
        eventSupplierData,
      )
        ? eventSupplierData
        : [];

      const normalizedStatuses = Array.isArray(statusData)
        ? statusData
        : [];

      setSuppliers(normalizedSuppliers);
      setItems(normalizedEventSuppliers);
      setStatuses(normalizedStatuses);

      setForm((current) => ({
        ...current,
        status:
          current.status ||
          normalizedStatuses[0] ||
          "",
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải thông tin supplier.",
      );
    }
  }

  useEffect(() => {
    if (eventId) {
      load();
    }
  }, [eventId]);

  async function submit(event) {
    event.preventDefault();

    if (!form.supplier || !form.service.trim()) {
      setError("Supplier và Service là bắt buộc.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await eventSupplierApi.create({
        event: eventId,
        supplier: form.supplier,
        service: form.service.trim(),
        description: form.description,
        quotationValue: Number(
          form.quotationValue || 0,
        ),
        contractValue: Number(
          form.contractValue || 0,
        ),
        status: form.status || undefined,
        contactPerson: form.contactPerson,
        notes: form.notes,
      });

      setForm({
        ...initialForm,
        status: statuses[0] || "",
      });

      setOpen(false);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể gán supplier cho event.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item, status) {
    try {
      setError("");

      await client.patch(
        `/event-supplier-workflow/${item._id}/status`,
        {
          status,
        },
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật supplier.",
      );
    }
  }

  async function remove(item) {
    if (
      !window.confirm(
        `Remove ${item.supplier?.name || "supplier"}?`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await eventSupplierApi.remove(item._id);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa supplier.",
      );
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">SUPPLIERS</span>
          <h3>Event suppliers</h3>
          <p>Suppliers assigned to this event.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setOpen((value) => !value);
            setError("");
          }}
        >
          <Plus size={16} />
          Assign Supplier
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {open && (
        <form
          className="form-grid"
          onSubmit={submit}
        >
          <label>
            Supplier
            <select
              required
              value={form.supplier}
              onChange={(e) =>
                setForm({
                  ...form,
                  supplier: e.target.value,
                })
              }
            >
              <option value="">
                Select supplier
              </option>

              {suppliers
                .filter(
                  (supplier) =>
                    supplier.status !== "INACTIVE",
                )
                .map((supplier) => (
                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Service
            <input
              required
              value={form.service}
              onChange={(e) =>
                setForm({
                  ...form,
                  service: e.target.value,
                })
              }
              placeholder="Lighting"
            />
          </label>

          <label>
            Quotation
            <input
              type="number"
              min="0"
              value={form.quotationValue}
              onChange={(e) =>
                setForm({
                  ...form,
                  quotationValue: e.target.value,
                })
              }
            />
          </label>

          <label>
            Contract
            <input
              type="number"
              min="0"
              value={form.contractValue}
              onChange={(e) =>
                setForm({
                  ...form,
                  contractValue: e.target.value,
                })
              }
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option value="">
                Select status
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Contact person
            <input
              value={form.contactPerson}
              onChange={(e) =>
                setForm({
                  ...form,
                  contactPerson: e.target.value,
                })
              }
            />
          </label>

          <label className="span-2">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <label className="span-2">
            Notes
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />
          </label>

          <div className="span-2">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving || !statuses.length}
            >
              {saving
                ? "Saving..."
                : "Assign Supplier"}
            </button>
          </div>
        </form>
      )}

      <div className="milestone-table">
        {items.map((item) => (
          <div
            className="milestone-row"
            key={item._id}
          >
            <div>
              <strong>
                {item.supplier?.name ||
                  "Unknown Supplier"}
              </strong>

              <span>
                {item.service} ·{" "}
                {money(
                  item.contractValue ||
                    item.quotationValue ||
                    0,
                )}
              </span>
            </div>

            <select
              value={item.status || ""}
              onChange={(e) =>
                updateStatus(
                  item,
                  e.target.value,
                )
              }
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="ghost-button"
              onClick={() => remove(item)}
              title="Remove supplier"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {!items.length && !open && (
          <div className="soft-empty">
            No suppliers assigned to this event yet.
          </div>
        )}
      </div>
    </section>
  );
}