import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  WalletCards,
  CheckSquare2,
  ReceiptText,
  ScanLine,
  Building2,
  Clock3,
  Plus,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { eventApi } from "../api/eventApi";
import { taskApi } from "../api/taskApi";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { money, number, shortDate } from "../utils/format";

const taskInit = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assignedTo: "",
  department: "Operations",
};
export default function EventDetail() {
  const { id } = useParams(),
    nav = useNavigate();
  const [e, setE] = useState(null),
    [tab, setTab] = useState("overview"),
    [taskModal, setTaskModal] = useState(false),
    [taskForm, setTaskForm] = useState(taskInit);
  async function load() {
    setE(await eventApi.get(id));
  }
  useEffect(() => {
    load();
  }, [id]);
  const completed = useMemo(
    () => e?.tasks?.filter((t) => t.status === "DONE").length || 0,
    [e],
  );
  async function createTask(ev) {
    ev.preventDefault();
    await taskApi.create({ ...taskForm, event: id });
    setTaskModal(false);
    setTaskForm(taskInit);
    load();
  }
  async function updateProgress(value) {
    await eventApi.update(id, { progress: Number(value) });
    load();
  }
  if (!e)
    return (
      <div className="page">
        <div className="page-loading">Loading event workspace...</div>
      </div>
    );
  const spent = (e.expenses || [])
    .filter((x) => ["APPROVED", "PAID"].includes(x.status))
    .reduce((s, x) => s + Number(x.amount || 0), 0);
  return (
    <div className="event-workspace">
      <div className="workspace-hero">
        <div className="page wide">
          <button className="back-link" onClick={() => nav("/events")}>
            <ArrowLeft size={15} />
            All events
          </button>
          <div className="workspace-title-row">
            <div>
              <div className="workspace-code">
                <span>{e.eventCode}</span>
                <StatusBadge value={e.status} />
                <StatusBadge value={e.health} />
              </div>
              <h1>{e.name}</h1>
              <p>
                {e.customer?.companyName || e.customer?.name} ·{" "}
                {e.venue || "Venue TBD"} · {shortDate(e.startDate)}
              </p>
            </div>
            <div className="workspace-actions">
              <button className="secondary-button">Share runbook</button>
              <button
                className="primary-button"
                onClick={() => setTaskModal(true)}
              >
                <Plus size={16} />
                Add task
              </button>
            </div>
          </div>
          <div className="workspace-nav">
            {["overview", "tasks", "budget", "attendees", "documents"].map(
              (x) => (
                <button
                  key={x}
                  className={tab === x ? "active" : ""}
                  onClick={() => setTab(x)}
                >
                  {x[0].toUpperCase() + x.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="page wide workspace-body">
        {tab === "overview" && (
          <>
            <section className="event-command-grid">
              <div className="command-card">
                <span>Readiness</span>
                <strong>{e.progress || 0}%</strong>
                <div className="progress-track large">
                  <i style={{ width: `${e.progress || 0}%` }} />
                </div>
                <input
                  className="range"
                  type="range"
                  min="0"
                  max="100"
                  value={e.progress || 0}
                  onChange={(x) => updateProgress(x.target.value)}
                />
              </div>
              <Info
                icon={CalendarDays}
                label="Event date"
                value={shortDate(e.startDate)}
              />
              <Info
                icon={Users}
                label="Expected guests"
                value={number(e.attendeesExpected)}
              />
              <Info
                icon={WalletCards}
                label="Planned budget"
                value={money(e.budget?.planned)}
              />
              <Info
                icon={CheckSquare2}
                label="Task completion"
                value={`${completed}/${e.tasks?.length || 0}`}
              />
              <Info
                icon={ScanLine}
                label="Checked in"
                value={`${e.attendeeStats?.checkedIn || 0}/${e.attendeeStats?.registered || 0}`}
              />
            </section>
            <section className="workspace-grid">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">RUN OF SHOW</span>
                    <h3>Operational readiness</h3>
                    <p>What the team needs to finish before doors open.</p>
                  </div>
                </div>
                <div className="readiness-list">
                  <Readiness label="Commercial handoff" done={!!e.quotation} />
                  <Readiness
                    label="Customer & venue confirmed"
                    done={!!e.customer && !!e.venue}
                  />
                  <Readiness
                    label="Task plan created"
                    done={(e.tasks?.length || 0) > 0}
                  />
                  <Readiness
                    label="Budget & expenses tracked"
                    done={(e.expenses?.length || 0) > 0}
                  />
                  <Readiness
                    label="Guest list loaded"
                    done={(e.attendeeStats?.registered || 0) > 0}
                  />
                </div>
              </div>
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">FINANCIAL CONTROL</span>
                    <h3>Budget health</h3>
                    <p>Approved delivery cost against plan.</p>
                  </div>
                </div>
                <div className="budget-donut">
                  <div className="donut-number">
                    <strong>
                      {e.budget?.planned
                        ? Math.min(
                            100,
                            Math.round((spent / e.budget.planned) * 100),
                          )
                        : 0}
                      %
                    </strong>
                    <span>spent</span>
                  </div>
                </div>
                <div className="budget-lines">
                  <div>
                    <span>Planned</span>
                    <strong>{money(e.budget?.planned)}</strong>
                  </div>
                  <div>
                    <span>Approved spend</span>
                    <strong>{money(spent)}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>
                      {money(Math.max(0, (e.budget?.planned || 0) - spent))}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">DELIVERY TASKS</span>
                  <h3>Next milestones</h3>
                </div>
                <button
                  className="ghost-button"
                  onClick={() => setTab("tasks")}
                >
                  View task board <ChevronRight size={15} />
                </button>
              </div>
              <div className="milestone-table">
                {e.tasks?.slice(0, 6).map((t) => (
                  <div className="milestone-row" key={t._id}>
                    <div
                      className={`priority-mark priority-${String(t.priority).toLowerCase()}`}
                    />
                    <div>
                      <strong>{t.title}</strong>
                      <span>
                        {t.department || "Operations"} ·{" "}
                        {t.assignedTo || "Unassigned"}
                      </span>
                    </div>
                    <StatusBadge value={t.status} />
                    <span>
                      <Clock3 size={13} />
                      {shortDate(t.dueDate)}
                    </span>
                  </div>
                ))}
                {!e.tasks?.length && (
                  <div className="soft-empty">
                    No tasks yet. Build the delivery plan with cross-team owners
                    and deadlines.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
        {tab === "tasks" && <TaskTab tasks={e.tasks || []} onRefresh={load} />}
        {tab === "budget" && <BudgetTab event={e} />}
        {tab === "attendees" && <AttendeeSummary stats={e.attendeeStats} />}
        {tab === "documents" && (
          <div className="panel document-placeholder">
            <Building2 size={24} />
            <h3>Event document hub</h3>
            <p>
              Contracts, quotations, scripts, floor plans, supplier files and
              post-event assets will live here.
            </p>
          </div>
        )}
      </div>
      <Modal
        open={taskModal}
        onClose={() => setTaskModal(false)}
        eyebrow="EVENT TASK"
        title="Add delivery task"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setTaskModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" form="task-create">
              Create task
            </button>
          </>
        }
      >
        <form id="task-create" className="form-grid" onSubmit={createTask}>
          <label className="span-2">
            Task title
            <input
              required
              value={taskForm.title}
              onChange={(x) =>
                setTaskForm({ ...taskForm, title: x.target.value })
              }
            />
          </label>
          <label>
            Priority
            <select
              value={taskForm.priority}
              onChange={(x) =>
                setTaskForm({ ...taskForm, priority: x.target.value })
              }
            >
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>URGENT</option>
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(x) =>
                setTaskForm({ ...taskForm, dueDate: x.target.value })
              }
            />
          </label>
          <label>
            Assigned to
            <input
              value={taskForm.assignedTo}
              onChange={(x) =>
                setTaskForm({ ...taskForm, assignedTo: x.target.value })
              }
              placeholder="Team member"
            />
          </label>
          <label>
            Department
            <input
              value={taskForm.department}
              onChange={(x) =>
                setTaskForm({ ...taskForm, department: x.target.value })
              }
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows="4"
              value={taskForm.description}
              onChange={(x) =>
                setTaskForm({ ...taskForm, description: x.target.value })
              }
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="command-info">
      <div className="command-info-icon">
        <Icon size={17} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function Readiness({ label, done }) {
  return (
    <div className="readiness-item">
      <div className={done ? "readiness-check done" : "readiness-check"}>
        {done ? "✓" : "!"}
      </div>
      <span>{label}</span>
      {done ? <StatusBadge value="DONE" /> : <StatusBadge value="PENDING" />}
    </div>
  );
}
function TaskTab({ tasks, onRefresh }) {
  async function move(t, status) {
    await taskApi.update(t._id, { status });
    onRefresh();
  }
  const cols = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  return (
    <div className="kanban task-kanban">
      {cols.map((s) => (
        <div className="kanban-column" key={s}>
          <div className="kanban-column-head">
            <StatusBadge value={s} />
            <span>{tasks.filter((t) => t.status === s).length}</span>
          </div>
          <div className="kanban-stack">
            {tasks
              .filter((t) => t.status === s)
              .map((t) => (
                <div className="task-card" key={t._id}>
                  <div>
                    <StatusBadge value={t.priority} />
                    <small>{t.taskCode}</small>
                  </div>
                  <strong>{t.title}</strong>
                  <span>
                    {t.assignedTo || "Unassigned"} · {shortDate(t.dueDate)}
                  </span>
                  <select
                    value={t.status}
                    onChange={(e) => move(t, e.target.value)}
                  >
                    <option>TODO</option>
                    <option>IN_PROGRESS</option>
                    <option>REVIEW</option>
                    <option>DONE</option>
                    <option>BLOCKED</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function BudgetTab({ event }) {
  return (
    <div className="workspace-grid">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">COST LEDGER</span>
            <h3>Event expenses</h3>
          </div>
        </div>
        <div className="expense-list">
          {event.expenses?.map((x) => (
            <div className="expense-row" key={x._id}>
              <div>
                <strong>{x.description}</strong>
                <span>
                  {x.category} · {x.vendor || "No vendor"}
                </span>
              </div>
              <StatusBadge value={x.status} />
              <b>{money(x.amount)}</b>
            </div>
          ))}
          {!event.expenses?.length && (
            <div className="soft-empty">
              No expenses recorded for this event.
            </div>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">COMMERCIAL</span>
            <h3>Revenue & margin</h3>
          </div>
        </div>
        <div className="budget-lines large">
          <div>
            <span>Planned budget</span>
            <strong>{money(event.budget?.planned)}</strong>
          </div>
          <div>
            <span>Contract revenue</span>
            <strong>{money(event.budget?.revenue)}</strong>
          </div>
          <div>
            <span>Committed</span>
            <strong>{money(event.budget?.committed)}</strong>
          </div>
          <div>
            <span>Actual</span>
            <strong>{money(event.budget?.actual)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
function AttendeeSummary({ stats = {} }) {
  return (
    <div className="workspace-grid">
      <div className="panel attendee-hero">
        <ScanLine size={30} />
        <h3>Guest operations</h3>
        <p>
          Registration and on-site check-in are managed from the central
          attendee module.
        </p>
        <div className="attendee-numbers">
          <div>
            <strong>{stats.registered || 0}</strong>
            <span>Registered</span>
          </div>
          <div>
            <strong>{stats.checkedIn || 0}</strong>
            <span>Checked in</span>
          </div>
          <div>
            <strong>
              {stats.registered
                ? Math.round(((stats.checkedIn || 0) / stats.registered) * 100)
                : 0}
              %
            </strong>
            <span>Arrival rate</span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">LIVE CONTROL</span>
            <h3>Gate readiness</h3>
          </div>
        </div>
        <div className="readiness-list">
          <Readiness
            label="Guest list imported"
            done={(stats.registered || 0) > 0}
          />
          <Readiness label="QR check-in active" done />
          <Readiness label="Live arrival dashboard" done />
        </div>
      </div>
    </div>
  );
}
