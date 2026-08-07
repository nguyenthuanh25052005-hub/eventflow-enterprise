import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  Clock3,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { eventApi } from "../api/eventApi";
import { money, shortDate } from "../utils/format";

export default function Events() {
  const [items, setItems] = useState([]),
    [filter, setFilter] = useState("");
  const nav = useNavigate();
  useEffect(() => {
    eventApi
      .list(filter ? { status: filter } : {})
      .then((r) => setItems(r.items || []));
  }, [filter]);
  return (
    <div className="page">
      <PageHeader
        eyebrow="OPERATIONS PORTFOLIO"
        title="Events"
        description="Every confirmed delivery workspace, with readiness, budget and execution health in one portfolio."
        actions={
          <div className="view-switch">
            <button className="active">
              <LayoutGrid size={16} />
            </button>
            <button>
              <List size={16} />
            </button>
          </div>
        }
      />
      <div className="portfolio-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search event, customer, venue..." />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>PLANNING</option>
          <option>CONFIRMED</option>
          <option>LIVE</option>
          <option>COMPLETED</option>
        </select>
        <div className="portfolio-count">
          <strong>{items.length}</strong>
          <span>events</span>
        </div>
      </div>
      <div className="event-card-grid">
        {items.length ? (
          items.map((e) => (
            <article
              className="event-card"
              key={e._id}
              onClick={() => nav(`/events/${e._id}`)}
            >
              <div className="event-card-cover">
                <div className="event-card-date">
                  <CalendarDays size={14} />
                  <span>{shortDate(e.startDate)}</span>
                </div>
                <StatusBadge value={e.status} />
              </div>
              <div className="event-card-body">
                <div className="event-card-head">
                  <div>
                    <span>{e.eventCode}</span>
                    <h3>{e.name}</h3>
                  </div>
                  <StatusBadge value={e.health} />
                </div>
                <p className="event-customer">
                  {e.customer?.companyName || e.customer?.name || "Customer"}
                </p>
                <div className="event-card-meta">
                  <span>
                    <MapPin size={14} />
                    {e.venue || "Venue TBD"}
                  </span>
                  <span>
                    <Users size={14} />
                    {e.attendeesExpected || 0} guests
                  </span>
                </div>
                <div className="readiness-block">
                  <div>
                    <span>Delivery readiness</span>
                    <b>{e.progress || 0}%</b>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${e.progress || 0}%` }} />
                  </div>
                </div>
                <div className="event-card-footer">
                  <div>
                    <span>Planned budget</span>
                    <strong>{money(e.budget?.planned)}</strong>
                  </div>
                  <button>
                    Open workspace <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="soft-empty span-full">
            <Clock3 size={20} />
            No events yet. Approve and convert an event request to open an
            operational workspace.
          </div>
        )}
      </div>
    </div>
  );
}
