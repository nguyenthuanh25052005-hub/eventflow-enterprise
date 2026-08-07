import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarDays,
  Download,
  Target,
  ArrowUpRight,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { dashboardApi } from "../api/dashboardApi";
import { financeApi } from "../api/financeApi";
import { money } from "../utils/format";

export default function Reports() {
  const [d, setD] = useState(null),
    [f, setF] = useState(null);
  useEffect(() => {
    dashboardApi.get().then(setD);
    financeApi.summary().then(setF);
  }, []);
  const max = Math.max(
    ...(d?.pipeline || []).map((x) => Number(x.value || 0)),
    1,
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="MANAGEMENT REPORTING"
        title="Business intelligence"
        description="Management-level reporting for pipeline, delivery, profitability and guest experience."
        actions={
          <button className="secondary-button">
            <Download size={16} />
            Export report
          </button>
        }
      />
      <section className="report-highlight-grid">
        <div className="report-highlight">
          <span>Commercial pipeline</span>
          <strong>
            {money(
              (d?.pipeline || []).reduce((s, x) => s + Number(x.value || 0), 0),
            )}
          </strong>
          <small>
            <TrendingUp size={13} />
            Total expected opportunity value
          </small>
        </div>
        <div className="report-highlight">
          <span>Approved revenue</span>
          <strong>{money(f?.revenue || 0)}</strong>
          <small>
            <ArrowUpRight size={13} />
            Commercially approved
          </small>
        </div>
        <div className="report-highlight">
          <span>Gross margin</span>
          <strong>{money(f?.grossMargin || 0)}</strong>
          <small>
            <Target size={13} />
            {f?.revenue ? Math.round((f.grossMargin / f.revenue) * 100) : 0}%
            blended margin
          </small>
        </div>
        <div className="report-highlight">
          <span>Guest arrival</span>
          <strong>{d?.checkInRate || 0}%</strong>
          <small>
            <Users size={13} />
            Overall checked-in rate
          </small>
        </div>
      </section>
      <section className="report-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">PIPELINE ANALYSIS</span>
              <h3>Opportunity value by stage</h3>
              <p>Identify where commercial value is concentrated.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          <div className="horizontal-chart">
            {(d?.pipeline || []).map((x) => (
              <div className="chart-row" key={x._id}>
                <span>{x._id.replaceAll("_", " ")}</span>
                <div className="chart-track">
                  <i
                    style={{
                      width: `${Math.max(4, (Number(x.value || 0) / max) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{money(x.value)}</strong>
              </div>
            ))}
            {!(d?.pipeline || []).length && (
              <div className="soft-empty">
                Pipeline data will appear as sales creates requests.
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">PORTFOLIO</span>
              <h3>Delivery indicators</h3>
              <p>Operational signals for leadership.</p>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="report-metrics">
            <div>
              <span>Active customers</span>
              <strong>{d?.activeCustomers || 0}</strong>
              <p>Accounts available to sales</p>
            </div>
            <div>
              <span>Open event requests</span>
              <strong>{d?.openRequests || 0}</strong>
              <p>Commercial work in progress</p>
            </div>
            <div>
              <span>Upcoming events</span>
              <strong>{d?.upcomingEvents || 0}</strong>
              <p>Deliveries within 30 days</p>
            </div>
            <div>
              <span>Overdue tasks</span>
              <strong>{d?.overdueTasks || 0}</strong>
              <p>Items needing escalation</p>
            </div>
          </div>
        </div>
      </section>
      <section className="panel report-library">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">REPORT LIBRARY</span>
            <h3>Operational reports</h3>
            <p>Prepared reporting views for different business owners.</p>
          </div>
        </div>
        <div className="report-library-grid">
          <Report
            icon={TrendingUp}
            title="Sales conversion report"
            desc="Request → quotation → approval → event conversion."
          />
          <Report
            icon={Target}
            title="Event profitability"
            desc="Revenue, planned budget, approved cost and margin by event."
          />
          <Report
            icon={CalendarDays}
            title="Delivery readiness"
            desc="Progress, overdue tasks and health across upcoming events."
          />
          <Report
            icon={Users}
            title="Guest attendance"
            desc="Registrations, check-in performance and ticket mix."
          />
        </div>
      </section>
    </div>
  );
}
function Report({ icon: Icon, title, desc }) {
  return (
    <button className="report-tile">
      <div>
        <Icon size={18} />
      </div>
      <strong>{title}</strong>
      <p>{desc}</p>
      <span>
        Open report <ArrowUpRight size={13} />
      </span>
    </button>
  );
}
