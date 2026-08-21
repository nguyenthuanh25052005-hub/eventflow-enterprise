import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { customerPortalApi } from "../../api/customerPortalApi";

export default function CustomerEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await customerPortalApi.getEvent(id);

        if (active) {
          setEvent(data?.event || null);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load event",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="customer-workflow-page">
        <div className="panel">
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page">
        <div className="error-box">
          {error || "Event not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            {event.eventCode || "EVENT"}
          </span>

          <h1>{event.name}</h1>

          <p className="muted">
            Status: {event.status || "-"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/portal/events")
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

      <div className="panel">
        <h2>Event Detail</h2>

        <p>
          <strong>Type:</strong>{" "}
          {event.type?.replaceAll("_", " ") || "-"}
        </p>

        <p>
          <strong>Start date:</strong>{" "}
          {event.startDate
            ? new Date(event.startDate).toLocaleString()
            : "-"}
        </p>

        <p>
          <strong>End date:</strong>{" "}
          {event.endDate
            ? new Date(event.endDate).toLocaleString()
            : "-"}
        </p>

        <p>
          <strong>Venue:</strong>{" "}
          {event.venue || "-"}
        </p>

        <p>
          <strong>Expected attendees:</strong>{" "}
          {event.attendeesExpected ?? 0}
        </p>

        <p>
          <strong>Health:</strong>{" "}
          {event.health?.replaceAll("_", " ") || "-"}
        </p>

        <p>
          <strong>Progress:</strong>{" "}
          {event.progress ?? 0}%
        </p>

        {event.description && (
          <p>
            <strong>Description:</strong>{" "}
            {event.description}
          </p>
        )}
      </div>

      {event.eventRequest && (
        <div className="panel">
          <h2>Related Request</h2>

          <p>
            <strong>Code:</strong>{" "}
            {event.eventRequest.requestCode || "-"}
          </p>

          <p>
            <strong>Title:</strong>{" "}
            {event.eventRequest.title || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {event.eventRequest.status || "-"}
          </p>
        </div>
      )}

      {event.quotation && (
        <div className="panel">
          <h2>Related Quotation</h2>

          <p>
            <strong>Code:</strong>{" "}
            {event.quotation.quotationCode || "-"}
          </p>

          <p>
            <strong>Title:</strong>{" "}
            {event.quotation.title || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {event.quotation.status || "-"}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            {Number(
              event.quotation.total || 0,
            ).toLocaleString()}
          </p>

          {event.quotation._id && (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate(
                  `/portal/quotations/${event.quotation._id}`,
                )
              }
            >
              View Quotation
            </button>
          )}
        </div>
      )}
    </div>
  );
}


