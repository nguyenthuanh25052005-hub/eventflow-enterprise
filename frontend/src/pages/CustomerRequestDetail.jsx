import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { customerPortalApi } from "../api/customerPortalApi";

export default function CustomerRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequest() {
      try {
        setLoading(true);
        setError("");

        const result =
          await customerPortalApi.getRequest(id);

        if (!active) return;

        setData(result);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load request",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="panel">
          Loading request...
        </div>
      </div>
    );
  }

  const request = data?.request;

  if (!request) {
    return (
      <div className="page">
        <div className="error-box">
          {error || "Request not found"}
        </div>
      </div>
    );
  }

  const quotations =
    Array.isArray(data?.quotations)
      ? data.quotations
      : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            {request.requestCode}
          </span>

          <h1>{request.title}</h1>

          <p className="muted">
            Status: {request.status}
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

      <div className="panel">
        <h2>Request Detail</h2>

        <p>
          <strong>Event type:</strong>{" "}
          {request.eventType?.replaceAll("_", " ") || "-"}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {request.eventDate
            ? new Date(
                request.eventDate,
              ).toLocaleDateString()
            : "-"}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {request.location || "-"}
        </p>

        <p>
          <strong>Expected attendees:</strong>{" "}
          {request.expectedAttendees ?? 0}
        </p>

        <p>
          <strong>Expected budget:</strong>{" "}
          {Number(
            request.expectedBudget || 0,
          ).toLocaleString()}
        </p>

        {request.requirements?.length > 0 && (
          <>
            <h3>Requirements</h3>

            <ul>
              {request.requirements.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </>
        )}

        {request.notes && (
          <p>
            <strong>Notes:</strong>{" "}
            {request.notes}
          </p>
        )}
      </div>

      <div className="panel">
        <h2>Quotations</h2>

        {quotations.length === 0 ? (
          <p className="muted">
            No quotation has been sent yet.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {quotations.map((quotation) => (
                  <tr
                    key={quotation._id}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(
                        `/portal/quotations/${quotation._id}`,
                      )
                    }
                  >
                    <td>
                      {quotation.quotationCode}
                    </td>

                    <td>
                      {quotation.title}
                    </td>

                    <td>
                      {quotation.status}
                    </td>

                    <td>
                      {Number(
                        quotation.total || 0,
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.event && (
        <div className="panel">
          <h2>Event</h2>

          <p>
            <strong>
              {data.event.eventCode}
            </strong>{" "}
            — {data.event.name}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate(
                `/portal/events/${data.event._id}`,
              )
            }
          >
            View Event
          </button>
        </div>
      )}
    </div>
  );
}
