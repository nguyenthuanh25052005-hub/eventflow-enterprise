import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { customerPortalApi } from "../../api/customerPortalApi";

export default function CustomerQuotations() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuotations() {
      try {
        setLoading(true);
        setError("");

        const data = await customerPortalApi.listQuotations();

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
            "Unable to load quotations",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuotations();

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

          <h1>My Quotations</h1>

          <p className="muted">
            View quotations sent to your account.
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel">
          Loading quotations...
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
            <h3>No quotations</h3>

            <p className="muted">
              No quotations have been sent to you yet.
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
                    <th>Request</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Valid Until</th>
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
                          `/portal/quotations/${item._id}`,
                        )
                      }
                    >
                      <td>
                        {item.quotationCode || "-"}
                      </td>

                      <td>
                        {item.eventRequest?.requestCode ||
                          "-"}
                      </td>

                      <td>
                        {item.title || "-"}
                      </td>

                      <td>
                        {item.status || "-"}
                      </td>

                      <td>
                        {Number(
                          item.total || 0,
                        ).toLocaleString()}
                      </td>

                      <td>
                        {item.validUntil
                          ? new Date(
                              item.validUntil,
                            ).toLocaleDateString()
                          : "-"}
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


