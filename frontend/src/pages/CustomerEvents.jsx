import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { customerPortalApi } from "../api/customerPortalApi";

export default function CustomerEvents() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await customerPortalApi.listEvents();

        if (!active) return;

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : [],
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load events",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            CUSTOMER PORTAL
          </span>

          <h1>My Events</h1>

          <p className="muted">
            View your events.
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel">
          Loading events...
        </div>
      )}

      {!loading && error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        items.length === 0 && (
          <div className="panel">
            <h3>No events</h3>

            <p className="muted">
              No events are available yet.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        items.length > 0 && (
          <div className="panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Event</th>
                    <th>Start Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(
                          `/portal/events/${item._id}`,
                        )
                      }
                    >
                      <td>
                        {item.eventCode || "-"}
                      </td>

                      <td>
                        <strong>
                          {item.name || "-"}
                        </strong>

                        {item.type && (
                          <div className="muted">
                            {item.type.replaceAll(
                              "_",
                              " ",
                            )}
                          </div>
                        )}
                      </td>

                      <td>
                        {item.startDate
                          ? new Date(
                              item.startDate,
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {item.venue || "-"}
                      </td>

                      <td>
                        {item.status || "-"}
                      </td>

                      <td>
                        {item.progress ?? 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
