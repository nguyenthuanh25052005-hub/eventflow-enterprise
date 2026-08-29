import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Clock3,
  UsersRound,
  WalletCards,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { dashboardApi } from "../api/dashboardApi";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { money, shortDate } from "../utils/format";

const pipeOrder = [
  "NEW",
  "QUALIFYING",
  "QUOTATION",
  "NEGOTIATING",
  "APPROVED",
  "CONVERTED",
];
export default function Dashboard() {
  const [d, setD] = useState(null);
  const nav = useNavigate();

  const user = JSON.parse(localStorage.getItem("eventflow_user") || "{}");

  const role = user.role || "";

  const canViewFinance = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(role);

  const canCreateRequest = [
    "SUPER_ADMIN",
    "ADMIN",
    "SALES",
    "EVENT_MANAGER",
  ].includes(role);
  useEffect(() => {
    dashboardApi.get().then(setD).catch(console.error);
  }, []);
  const data = d || {
    activeCustomers: 0,
    openRequests: 0,
    upcomingEvents: 0,
    overdueTasks: 0,
    revenue: 0,
    cost: 0,
    grossMargin: 0,
    checkInRate: 0,
    events: [],
    tasks: [],
    pipeline: [],
  };
  const p = Object.fromEntries((data.pipeline || []).map((x) => [x._id, x]));
  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="COMMAND CENTER"
        title="Good evening, keep every event on track."
        description="Live operational view across sales, production, finance and guest experience."
        actions={
          <>
            <button className="secondary-button">
              <CalendarDays size={16} />
              Calendar
            </button>
            {canCreateRequest && (
              <button
                className="primary-button"
                onClick={() => nav("/event-requests")}
              >
                <Plus size={17} />
                New event request
              </button>
            )}
          </>
        }
      />
      <section className="executive-strip">
        <Kpi
          icon={UsersRound}
          label="Active customers"
          value={data.activeCustomers}
          meta="CRM accounts"
          trend="+12%"
        />
        <Kpi
          icon={ClipboardList}
          label="Open pipeline"
          value={data.openRequests}
          meta="Requests in progress"
          trend="Sales"
        />
        <Kpi
          icon={CalendarDays}
          label="Upcoming events"
          value={data.upcomingEvents}
          meta="Next 30 days"
          trend="Ops"
        />
        <Kpi
          icon={AlertTriangle}
          label="Overdue tasks"
          value={data.overdueTasks}
          meta="Need intervention"
          alert={data.overdueTasks > 0}
        />
        {canViewFinance && (
          <Kpi
            icon={WalletCards}
            label="Gross margin"
            value={money(data.grossMargin)}
            meta={`${money(data.revenue)} approved revenue`}
            wide
          />
        )}
      </section>

      <section
        className="dashboard-layout"
        style={!canViewFinance ? { gridTemplateColumns: "1fr" } : undefined}
      >
        <div className="panel panel-pipeline">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">SALES PIPELINE</span>
              <h3>Event request funnel</h3>
              <p>
                Track opportunity value from first inquiry to converted event.
              </p>
            </div>
            <button
              className="ghost-button"
              onClick={() => nav("/event-requests")}
            >
              View pipeline <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="pipeline-flow">
            {pipeOrder.map((s, i) => {
              const row = p[s] || { count: 0, value: 0 };
              return (
                <div className="pipeline-stage" key={s}>
                  <div className="pipeline-top">
                    <StatusBadge value={s} />
                    <strong>{row.count}</strong>
                  </div>
                  <span>{money(row.value)}</span>
                  {i < pipeOrder.length - 1 && (
                    <div className="pipeline-arrow">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {canViewFinance && (
          <div className="panel finance-snapshot">
            <div className="panel-heading compact">
              <div>
                <span className="panel-kicker">FINANCE</span>
                <h3>Business snapshot</h3>
              </div>

              <TrendingUp size={20} />
            </div>

            <div className="finance-big">
              <span>Approved revenue</span>
              <strong>{money(data.revenue)}</strong>
            </div>

            <div className="finance-pairs">
              <div>
                <span>Approved cost</span>
                <b>{money(data.cost)}</b>
              </div>

              <div>
                <span>Gross margin</span>
                <b>{money(data.grossMargin)}</b>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="dashboard-layout lower">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">DELIVERY</span>
              <h3>Upcoming & active events</h3>
              <p>Operational health, readiness and customer context.</p>
            </div>
            <button className="ghost-button" onClick={() => nav("/events")}>
              All events
            </button>
          </div>
          <div className="event-list">
            {data.events?.length ? (
              data.events.map((e) => (
                <div
                  className="event-row"
                  key={e._id}
                  onClick={() => nav(`/events/${e._id}`)}
                >
                  <div className="date-tile">
                    <strong>
                      {e.startDate ? new Date(e.startDate).getDate() : "—"}
                    </strong>
                    <span>
                      {e.startDate
                        ? new Date(e.startDate).toLocaleString("en", {
                            month: "short",
                          })
                        : "TBD"}
                    </span>
                  </div>
                  <div className="event-main">
                    <strong>{e.name}</strong>
                    <span>
                      {e.customer?.companyName ||
                        e.customer?.name ||
                        "Customer"}{" "}
                      · {e.venue || "Venue TBD"}
                    </span>
                  </div>
                  <div className="event-progress">
                    <div>
                      <span>Readiness</span>
                      <b>{e.progress || 0}%</b>
                    </div>
                    <div className="progress-track">
                      <i style={{ width: `${e.progress || 0}%` }} />
                    </div>
                  </div>
                  <StatusBadge value={e.health} />
                  <MoreHorizontal size={17} />
                </div>
              ))
            ) : (
              <div className="soft-empty">
                No active events yet. Convert an approved request to create the
                first event workspace.
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">ACTION CENTER</span>
              <h3>Tasks requiring attention</h3>
              <p>Prioritized by due date.</p>
            </div>
            <button className="ghost-button" onClick={() => nav("/tasks")}>
              Open board
            </button>
          </div>
          <div className="task-feed">
            {data.tasks?.length ? (
              data.tasks.map((t) => (
                <div className="task-feed-item" key={t._id}>
                  <div
                    className={`priority-mark priority-${String(t.priority || "MEDIUM").toLowerCase()}`}
                  />
                  <div>
                    <strong>{t.title}</strong>
                    <span>
                      {t.event?.name || "Event"} ·{" "}
                      {t.assignedTo || "Unassigned"}
                    </span>
                  </div>
                  <div className="task-feed-date">
                    <Clock3 size={13} />
                    {shortDate(t.dueDate)}
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-empty">No open tasks yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <div className="insight-icon">
            <Target size={19} />
          </div>
          <div>
            <span>Guest experience</span>
            <strong>{data.checkInRate}% check-in rate</strong>
            <p>Live once attendees start checking in.</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <span>Operating model</span>
            <strong>Cross-team workflow ready</strong>
            <p>Sales → Operations → Finance → Guest experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
function Kpi({ icon: Icon, label, value, meta, trend, alert, wide }) {
  return (
    <div className={`exec-kpi ${wide ? "wide" : ""}`}>
      <div className={`kpi-icon ${alert ? "alert" : ""}`}>
        <Icon size={18} />
      </div>
      <div className="kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
      {trend && <em>{trend}</em>}
    </div>
  );
}
