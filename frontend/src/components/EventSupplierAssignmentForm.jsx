import { useEffect, useState } from "react";
import { eventSupplierApi } from "../api/eventSupplierApi";
import client from "../api/client";

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

const STATUS_OPTIONS = [
  "PROPOSED",
  "REQUESTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function EventSupplierAssignmentForm({
  eventId,
  initialData = null,
  onSaved,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(initialData || {}),
    supplier:
      typeof initialData?.supplier === "object"
        ? initialData.supplier?._id ||
          initialData.supplier?.id ||
          ""
        : initialData?.supplier || "",
    startDate: normalizeDate(initialData?.startDate),
    endDate: normalizeDate(initialData?.endDate),
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData?._id);

  useEffect(() => {
    let active = true;

    async function loadSuppliers() {
      try {
        setLoadingSuppliers(true);

        const response = await client.get("/suppliers");

        const data =
          response?.data?.data ||
          response?.data?.suppliers ||
          [];

        if (active) {
          setSuppliers(
            Array.isArray(data) ? data : [],
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load suppliers.",
          );
        }
      } finally {
        if (active) {
          setLoadingSuppliers(false);
        }
      }
    }

    loadSuppliers();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!eventId) {
      setError("Event is required.");
      return;
    }

    if (!form.supplier) {
      setError("Please select a supplier.");
      return;
    }

    if (!form.service.trim()) {
      setError("Please enter the service.");
      return;
    }

    const quotationValue = Number(
      form.quotationValue || 0,
    );

    const contractValue = Number(
      form.contractValue || 0,
    );

    if (
      !Number.isFinite(quotationValue) ||
      quotationValue < 0
    ) {
      setError("Quotation value must be 0 or greater.");
      return;
    }

    if (
      !Number.isFinite(contractValue) ||
      contractValue < 0
    ) {
      setError("Contract value must be 0 or greater.");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <
        new Date(form.startDate)
    ) {
      setError(
        "End date cannot be before start date.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        event: eventId,
        supplier: form.supplier,
        service: form.service.trim(),
        description: form.description.trim(),
        quotationValue,
        contractValue,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        contactPerson: form.contactPerson.trim(),
        notes: form.notes.trim(),
      };

      const response = isEdit
        ? await eventSupplierApi.update(
            initialData._id,
            payload,
          )
        : await eventSupplierApi.create(payload);

      if (onSaved) {
        await onSaved(response?.data || null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save supplier assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="event-supplier-assignment-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="event-supplier-manager__message error">
          {error}
        </div>
      )}

      <div className="event-supplier-manager__grid">
        <label>
          Supplier
          <select
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            disabled={loadingSuppliers || isEdit}
            required
          >
            <option value="">
              {loadingSuppliers
                ? "Loading suppliers..."
                : "Select supplier"}
            </option>

            {suppliers.map((supplier) => (
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
            name="service"
            value={form.service}
            onChange={handleChange}
            placeholder="Lighting"
            required
          />
        </label>

        <label>
          Quotation value
          <input
            type="number"
            name="quotationValue"
            min="0"
            step="1"
            value={form.quotationValue}
            onChange={handleChange}
          />
        </label>

        <label>
          Contract value
          <input
            type="number"
            name="contractValue"
            min="0"
            step="1"
            value={form.contractValue}
            onChange={handleChange}
          />
        </label>

        <label>
          Start date
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
          />
        </label>

        <label>
          End date
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />
        </label>

        <input
          type="hidden"
          name="status"
          value={form.status}
        />

        <label>
          Contact person
          <input
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
          />
        </label>

        <label className="full">
          Description
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label className="full">
          Notes
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="event-supplier-manager__form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Assign Supplier"}
        </button>
      </div>
    </form>
  );
}
