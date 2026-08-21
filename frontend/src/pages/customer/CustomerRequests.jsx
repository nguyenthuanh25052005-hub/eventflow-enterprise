import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { customerPortalApi } from "../../api/customerPortalApi";

export default function CustomerRequests() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const data = await customerPortalApi.listRequests();

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
            "Unable to load requests",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="customer-workflow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            CUSTOMER PORTAL
          </span>

          <h1>My Requests</h1>

          <p className="muted">
            View and manage your event requests.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            navigate("/portal/requests/new")
          }
        >
          <Plus size={16} />
          Create Request
        </button>
      </div>

      {loading && (
        <div className="panel">
          Loading requests...
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
            <h3>No requests yet</h3>

            <p className="muted">
              Create your first event request.
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
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Budget</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          `/portal/requests/${item._id}`,
                        )
                      }
                    >
                      <td>{item.requestCode || "-"}</td>

                      <td>
                        <strong>{item.title}</strong>

                        <div className="muted">
                          {item.eventType?.replaceAll("_", " ") || "-"}
                        </div>
                      </td>

                      <td>
                        {item.eventDate
                          ? new Date(
                              item.eventDate,
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>{item.location || "-"}</td>
                      <td>{item.status || "-"}</td>

                      <td>
                        {Number(
                          item.expectedBudget || 0,
                        ).toLocaleString()}
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


