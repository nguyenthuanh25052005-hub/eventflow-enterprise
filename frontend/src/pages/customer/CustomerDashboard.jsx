import { ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customerPortalApi";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: "", summary: null, user: null });
  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [summary, me] = await Promise.all([customerPortalApi.summary(), customerPortalApi.me()]);
      setState({ loading: false, error: "", summary, user: me.user });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || "Unable to load your dashboard." }));
    }
  };
  useEffect(() => { load(); }, []);
  const companyName = state.user?.customer?.companyName || state.user?.customer?.name || "your company";
  const firstName = state.user?.name?.trim().split(/\s+/).pop() || "there";
  const summary = state.summary || {};
  return <div className="customer-page">
    <section className="customer-welcome">
      <div><span className="portal-eyebrow">OVERVIEW</span><h1>Welcome back, {firstName}.</h1><p>Here’s what’s happening with {companyName}'s events.</p></div>
      <div className="customer-date"><CalendarDays size={17} /><span>{new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date())}</span></div>
    </section>
    {state.error && <div className="portal-error"><span>{state.error}</span><button onClick={load}><RefreshCw size={14} /> Try again</button></div>}
    <section className="customer-kpis">
      <PortalKpi icon={FileText} value={summary.activeRequests} label="Active Requests" meta="Requests currently in progress" tone="blue" loading={state.loading} />
      <PortalKpi icon={Clock3} value={summary.pendingQuotations} label="Pending Quotations" meta="Waiting for your decision" tone="amber" loading={state.loading} />
      <PortalKpi icon={CalendarDays} value={summary.upcomingEvents} label="Upcoming Events" meta="Scheduled from today" tone="purple" loading={state.loading} />
      <PortalKpi icon={CheckCircle2} value={summary.completedEvents} label="Completed Events" meta="Successfully delivered" tone="green" loading={state.loading} />
    </section>
    <section className="customer-panel customer-intro-panel"><div><span className="portal-eyebrow">EVENTFLOW CUSTOMER PORTAL</span><h2>Your event partnership, in one place.</h2><p>Track requests, quotations and delivery milestones while keeping your company details up to date.</p></div><button className="portal-primary" onClick={() => navigate("/portal/company")}>View company information <ArrowRight size={15} /></button></section>
  </div>;
}

function PortalKpi({ icon: Icon, value, label, meta, tone, loading }) {
  return <article className="customer-kpi"><div className={`customer-kpi-icon ${tone}`}><Icon size={20} /></div><div><span>{label}</span><strong className={loading ? "portal-skeleton" : ""}>{loading ? "" : value ?? 0}</strong><small>{meta}</small></div></article>;
}
