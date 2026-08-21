import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { customerPortalApi } from "../api/customerPortalApi";

export default function CustomerQuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuotation() {
      try {
        setLoading(true);
        setError("");

        const data =
          await customerPortalApi.getQuotation(id);

        if (!active) return;

        setQuotation(data?.quotation || null);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load quotation",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuotation();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleDecision(decision) {
    if (
      processing ||
      quotation?.status !== "SENT"
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const data =
        await customerPortalApi.decideQuotation(
          id,
          decision,
        );

      setQuotation(
        data?.quotation || quotation,
      );

      setMessage(
        data?.message ||
          "Quotation updated successfully",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update quotation",
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="panel">
          Loading quotation...
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="page">
        <div className="error-box">
          {error || "Quotation not found"}
        </div>
      </div>
    );
  }

  const expired =
    Boolean(quotation.validUntil) &&
    new Date(
      quotation.validUntil,
    ).getTime() < Date.now();

  const canDecide =
    quotation.status === "SENT" &&
    !expired;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            {quotation.quotationCode || "QUOTATION"}
          </span>

          <h1>
            {quotation.title || "Quotation Detail"}
          </h1>

          <p className="muted">
            Status: {quotation.status || "-"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/portal/quotations")
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

      {message && (
        <div className="panel">
          <strong>{message}</strong>
        </div>
      )}

      <div className="panel">
        <h2>Quotation Detail</h2>

        {quotation.eventRequest && (
          <>
            <p>
              <strong>Request code:</strong>{" "}
              {quotation.eventRequest.requestCode || "-"}
            </p>

            <p>
              <strong>Request title:</strong>{" "}
              {quotation.eventRequest.title || "-"}
            </p>

            <p>
              <strong>Event date:</strong>{" "}
              {quotation.eventRequest.eventDate
                ? new Date(
                    quotation.eventRequest.eventDate,
                  ).toLocaleDateString()
                : "-"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {quotation.eventRequest.location || "-"}
            </p>
          </>
        )}

        {quotation.items?.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name || "-"}</td>

                    <td>
                      {item.quantity ?? 0}
                    </td>

                    <td>
                      {item.unit || "-"}
                    </td>

                    <td>
                      {Number(
                        item.unitPrice || 0,
                      ).toLocaleString()}
                    </td>

                    <td>
                      {Number(
                        item.amount || 0,
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            No quotation items.
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          <p>
            <strong>Subtotal:</strong>{" "}
            {Number(
              quotation.subtotal || 0,
            ).toLocaleString()}
          </p>

          <p>
            <strong>Discount:</strong>{" "}
            {Number(
              quotation.discount || 0,
            ).toLocaleString()}
          </p>

          <p>
            <strong>VAT:</strong>{" "}
            {quotation.vatPercent ?? 0}% (
            {Number(
              quotation.vatAmount || 0,
            ).toLocaleString()}
            )
          </p>

          <p>
            <strong>Total:</strong>{" "}
            {Number(
              quotation.total || 0,
            ).toLocaleString()}
          </p>

          {quotation.validUntil && (
            <p>
              <strong>Valid until:</strong>{" "}
              {new Date(
                quotation.validUntil,
              ).toLocaleDateString()}
            </p>
          )}

          {quotation.note && (
            <p>
              <strong>Note:</strong>{" "}
              {quotation.note}
            </p>
          )}
        </div>

        {expired &&
          quotation.status === "SENT" && (
            <div className="error-box">
              This quotation has expired.
            </div>
          )}

        {canDecide && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
            }}
          >
            <button
              type="button"
              className="primary-button"
              disabled={processing}
              onClick={() =>
                handleDecision("APPROVE")
              }
            >
              {processing
                ? "Processing..."
                : "Approve"}
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleDecision("REJECT")
              }
            >
              Reject
            </button>
          </div>
        )}

        {quotation.status === "APPROVED" && (
          <p style={{ marginTop: 20 }}>
            <strong>
              Quotation approved.
            </strong>
          </p>
        )}

        {quotation.status === "REJECTED" && (
          <p style={{ marginTop: 20 }}>
            <strong>
              Quotation rejected.
            </strong>
          </p>
        )}

        {quotation.status === "EXPIRED" && (
          <p style={{ marginTop: 20 }}>
            <strong>
              Quotation expired.
            </strong>
          </p>
        )}
      </div>
    </div>
  );
}