import {
  ShieldCheck,
  UsersRound,
  Building2,
  Bell,
  Plug,
  Palette,
  LockKeyhole,
  Check,
  Minus,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
const roles = [
  ["Super Admin", "Full platform control", ["✓", "✓", "✓", "✓", "✓", "✓"]],
  ["Administrator", "Workspace administration", ["✓", "✓", "✓", "✓", "✓", "—"]],
  ["Sales", "CRM and commercial pipeline", ["✓", "✓", "—", "—", "—", "—"]],
  ["Event Manager", "Delivery and operations", ["✓", "✓", "✓", "✓", "—", "—"]],
  ["Finance", "Budget and approvals", ["—", "✓", "—", "✓", "✓", "—"]],
  ["Staff", "Assigned operational work", ["—", "—", "✓", "—", "—", "—"]],
];
export default function Settings() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Workspace settings"
        description="Govern roles, security, company configuration, notifications and integrations for your event operation."
      />
      <div className="settings-layout">
        <aside className="settings-nav">
          <button className="active">
            <Building2 size={16} />
            Organization
          </button>
          <button>
            <ShieldCheck size={16} />
            Roles & permissions
          </button>
          <button>
            <UsersRound size={16} />
            Users & teams
          </button>
          <button>
            <Bell size={16} />
            Notifications
          </button>
          <button>
            <Plug size={16} />
            Integrations
          </button>
          <button>
            <Palette size={16} />
            Branding
          </button>
          <button>
            <LockKeyhole size={16} />
            Security & audit
          </button>
        </aside>
        <div className="settings-content">
          <section className="panel settings-section">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">ORGANIZATION</span>
                <h3>Acme Events workspace</h3>
                <p>
                  Company identity used across quotations, event documents and
                  internal workflows.
                </p>
              </div>
              <button className="secondary-button">Edit profile</button>
            </div>
            <div className="organization-card">
              <div className="organization-logo">AE</div>
              <div>
                <strong>Acme Events Company</strong>
                <span>Enterprise event operations</span>
              </div>
              <div className="org-fields">
                <div>
                  <span>Workspace ID</span>
                  <b>EF-ACME-001</b>
                </div>
                <div>
                  <span>Timezone</span>
                  <b>Asia/Ho_Chi_Minh</b>
                </div>
                <div>
                  <span>Currency</span>
                  <b>VND</b>
                </div>
                <div>
                  <span>Fiscal year</span>
                  <b>Jan – Dec</b>
                </div>
              </div>
            </div>
          </section>
          <section className="panel settings-section">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">ACCESS CONTROL</span>
                <h3>Role permission matrix</h3>
                <p>
                  Enterprise roles separate commercial, operational, financial
                  and administrative responsibilities.
                </p>
              </div>
            </div>
            <div className="permission-table">
              <div className="permission-row header">
                <span>Role</span>
                <span>CRM</span>
                <span>Sales</span>
                <span>Ops</span>
                <span>Finance</span>
                <span>Reports</span>
                <span>Admin</span>
              </div>
              {roles.map((r) => (
                <div className="permission-row" key={r[0]}>
                  <div>
                    <strong>{r[0]}</strong>
                    <small>{r[1]}</small>
                  </div>
                  {r[2].map((v, i) => (
                    <span key={i} className={v === "✓" ? "yes" : "no"}>
                      {v === "✓" ? <Check size={15} /> : <Minus size={15} />}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="settings-cards">
            <div className="setting-card">
              <Bell size={20} />
              <strong>Notification rules</strong>
              <p>
                Overdue tasks, quotation approvals, budget thresholds and
                event-day alerts.
              </p>
              <button>Configure</button>
            </div>
            <div className="setting-card">
              <Plug size={20} />
              <strong>Integrations</strong>
              <p>Email, calendar, payment, storage and messaging connectors.</p>
              <button>Manage</button>
            </div>
            <div className="setting-card">
              <LockKeyhole size={20} />
              <strong>Audit & security</strong>
              <p>
                Session controls, audit trail, access policy and sensitive
                actions.
              </p>
              <button>Review</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
