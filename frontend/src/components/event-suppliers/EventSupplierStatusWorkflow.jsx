import { useState } from "react";
import {
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import { eventSupplierWorkflowApi } from "../eventSupplierWorkflowApi";

const STATUS_ORDER = [
  "PROPOSED",
  "REQUESTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

const STATUS_LABELS = {
  PROPOSED: "Proposed",
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_ICONS = {
  PROPOSED: Clock3,
  REQUESTED: Clock3,
  CONFIRMED: CircleCheck,
  IN_PROGRESS: LoaderCircle,
  COMPLETED: Check,
  CANCELLED: XCircle,
};

function getNextStatus(status) {
  const index = STATUS_ORDER.indexOf(status);

  if (index === -1 || index >= STATUS_ORDER.length - 1) {
    return null;
  }

  return STATUS_ORDER[index + 1];
}

function getStatusIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

export default function EventSupplierStatusWorkflow({
  item,
  onUpdated,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentStatus = item?.status || "PROPOSED";

  const currentIndex = getStatusIndex(currentStatus);

  const nextStatus = getNextStatus(currentStatus);

  async function moveToNext() {
    if (!nextStatus || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await eventSupplierWorkflowApi.updateStatus(
          item._id,
          nextStatus,
        );

      onUpdated?.(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update supplier status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelSupplier() {
    if (saving || currentStatus === "COMPLETED") {
      return;
    }

    const confirmed = window.confirm(
      "Cancel this supplier assignment?",
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await eventSupplierWorkflowApi.updateStatus(
          item._id,
          "CANCELLED",
        );

      onUpdated?.(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel supplier assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="event-supplier-workflow">
      <div className="event-supplier-workflow-track">
        {STATUS_ORDER.map((status, index) => {
          const Icon = STATUS_ICONS[status];

          const isCurrent = status === currentStatus;
          const isCompleted =
            currentIndex >= 0 &&
            index < currentIndex;

          return (
            <div
              key={status}
              className={`event-supplier-workflow-step ${
                isCurrent ? "current" : ""
              } ${isCompleted ? "completed" : ""}`}
            >
              <div className="event-supplier-workflow-icon">
                <Icon size={15} />
              </div>

              <span>
                {STATUS_LABELS[status]}
              </span>

              {index < STATUS_ORDER.length - 1 && (
                <ChevronRight
                  size={14}
                  className="event-supplier-workflow-arrow"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="event-supplier-workflow-footer">
        <div>
          <strong>
            {STATUS_LABELS[currentStatus]}
          </strong>

          <span>
            {currentStatus === "PROPOSED" &&
              "Supplier has been proposed for this event."}

            {currentStatus === "REQUESTED" &&
              "Quotation or confirmation has been requested."}

            {currentStatus === "CONFIRMED" &&
              "Supplier is confirmed for event delivery."}

            {currentStatus === "IN_PROGRESS" &&
              "Supplier is currently delivering the service."}

            {currentStatus === "COMPLETED" &&
              "Supplier delivery has been completed."}

            {currentStatus === "CANCELLED" &&
              "Supplier assignment has been cancelled."}
          </span>
        </div>

        <div className="event-supplier-workflow-actions">
          {currentStatus !== "COMPLETED" &&
            currentStatus !== "CANCELLED" && (
              <>
                <button
                  type="button"
                  className="event-supplier-workflow-cancel"
                  onClick={cancelSupplier}
                  disabled={saving}
                >
                  <XCircle size={15} />
                  Cancel
                </button>

                {nextStatus && (
                  <button
                    type="button"
                    className="event-supplier-primary"
                    onClick={moveToNext}
                    disabled={saving}
                  >
                    {saving ? (
                      "Updating..."
                    ) : (
                      <>
                        Move to{" "}
                        {STATUS_LABELS[nextStatus]}
                        <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
        </div>
      </div>

      {error && (
        <div className="event-supplier-workflow-error">
          {error}
        </div>
      )}
    </div>
  );
}
