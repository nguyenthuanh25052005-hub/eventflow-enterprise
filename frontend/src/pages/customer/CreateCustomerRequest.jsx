import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { customerPortalApi } from "../../api/customerPortalApi";

const EVENT_TYPES = [
  "CONFERENCE",
  "CORPORATE",
  "ACTIVATION",
  "EXHIBITION",
  "FESTIVAL",
  "GALA",
  "TEAM_BUILDING",
  "OTHER",
];

export default function CreateCustomerRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    eventType: "CORPORATE",
    eventDate: "",
    expectedAttendees: "",
    location: "",
    expectedBudget: "",
    requirements: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Event title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        eventType: form.eventType,
        eventDate: form.eventDate || undefined,
        expectedAttendees: form.expectedAttendees,
        location: form.location.trim(),
        expectedBudget: form.expectedBudget,
        requirements: form.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: form.notes.trim(),
      };

      const data =
        await customerPortalApi.createRequest(payload);

      if (data?.item?._id) {
        navigate(
          `/portal/requests/${data.item._id}`,
        );
      } else {
        navigate("/portal/requests");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create request",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="customer-workflow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            CUSTOMER PORTAL
          </span>

          <h1>Create Request</h1>

          <p className="muted">
            Submit a new event request.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/portal/requests")
          }
        >
          Back
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <form
        className="panel"
        onSubmit={handleSubmit}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <label>
            Event title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Event type
            <select
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
            >
              {EVENT_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label>
            Event date
            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
            />
          </label>

          <label>
            Expected attendees
            <input
              type="number"
              min="0"
              name="expectedAttendees"
              value={form.expectedAttendees}
              onChange={handleChange}
            />
          </label>

          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </label>

          <label>
            Expected budget
            <input
              type="number"
              min="0"
              name="expectedBudget"
              value={form.expectedBudget}
              onChange={handleChange}
            />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 18 }}>
          Requirements
          <textarea
            name="requirements"
            rows="5"
            value={form.requirements}
            onChange={handleChange}
            placeholder="One requirement per line"
          />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          Notes
          <textarea
            name="notes"
            rows="4"
            value={form.notes}
            onChange={handleChange}
          />
        </label>

        <button
          type="submit"
          className="primary-button"
          disabled={saving}
          style={{ marginTop: 20 }}
        >
          {saving
            ? "Submitting..."
            : "Submit Request"}
        </button>
      </form>
    </div>
  );
}


