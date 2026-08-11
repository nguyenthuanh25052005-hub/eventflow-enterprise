import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { eventSupplierApi } from "../api/eventSupplierApi";
import { supplierApi } from "../api/supplierApi";
import EventSupplierPanel from "../components/EventSupplierPanel";

export default function EventSuppliersPage() {
  const { id } = useParams();

  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [supplierResponse, assignmentResponse] =
          await Promise.all([
            supplierApi.list(),
            eventSupplierApi.list({ event: id }),
          ]);

        setSuppliers(
          supplierResponse?.data ||
            supplierResponse?.items ||
            [],
        );

        setItems(
          assignmentResponse?.data ||
            assignmentResponse?.items ||
            [],
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load supplier workspace.",
        );
      }
    }

    if (id) load();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <strong>Supplier workspace error</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <EventSupplierPanel
        eventId={id}
        suppliers={suppliers}
        initialItems={items}
      />
    </div>
  );
}
