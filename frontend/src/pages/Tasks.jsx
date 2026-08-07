import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Clock3,
  UserRound,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { taskApi } from "../api/taskApi";
import { eventApi } from "../api/eventApi";
import { shortDate } from "../utils/format";

const cols = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const init = {
  event: "",
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assignedTo: "",
  department: "Operations",
};
export default function Tasks() {
  const [tasks, setTasks] = useState([]),
    [events, setEvents] = useState([]),
    [modal, setModal] = useState(false),
    [form, setForm] = useState(init),
    [search, setSearch] = useState("");
  async function load() {
    const r = await taskApi.list();
    setTasks(r.items || []);
  }
  useEffect(() => {
    load();
    eventApi.list().then((r) => setEvents(r.items || []));
  }, []);
  const shown = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !search ||
          `${t.title} ${t.event?.name} ${t.assignedTo}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [tasks, search],
  );
  async function move(t, status) {
    await taskApi.update(t._id, { status });
    load();
  }
  async function create(e) {
    e.preventDefault();
    await taskApi.create(form);
    setForm(init);
    setModal(false);
    load();
  }
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE",
  ).length;
  return (
    <div className="page">
      <PageHeader
        eyebrow="CROSS-TEAM DELIVERY"
        title="Task command board"
        description="Coordinate production, creative, media, logistics and customer approvals across every live event."
        actions={
          <button className="primary-button" onClick={() => setModal(true)}>
            <Plus size={16} />
            New task
          </button>
        }
      />
      <section className="task-summary-strip">
        <div>
          <CheckCircle2 size={18} />
          <span>Completed</span>
          <strong>{tasks.filter((t) => t.status === "DONE").length}</strong>
        </div>
        <div>
          <Clock3 size={18} />
          <span>In progress</span>
          <strong>
            {tasks.filter((t) => t.status === "IN_PROGRESS").length}
          </strong>
        </div>
        <div className={overdue ? "danger" : ""}>
          <AlertTriangle size={18} />
          <span>Overdue</span>
          <strong>{overdue}</strong>
        </div>
        <div>
          <CalendarDays size={18} />
          <span>Total workload</span>
          <strong>{tasks.length}</strong>
        </div>
      </section>
      <div className="pipeline-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task, event or owner..."
          />
        </div>
        <button className="secondary-button">
          <Filter size={15} />
          Filter
        </button>
      </div>
      <div className="kanban task-kanban global-task-board">
        {cols.map((s) => (
          <div className="kanban-column" key={s}>
            <div className="kanban-column-head">
              <StatusBadge value={s} />
              <span>{shown.filter((t) => t.status === s).length}</span>
            </div>
            <div className="kanban-stack">
              {shown
                .filter((t) => t.status === s)
                .map((t) => (
                  <article className="task-card enterprise-task" key={t._id}>
                    <div className="task-card-line">
                      <StatusBadge value={t.priority} />
                      <small>{t.taskCode}</small>
                    </div>
                    <strong>{t.title}</strong>
                    <span className="task-event">
                      {t.event?.eventCode} · {t.event?.name || "Event"}
                    </span>
                    <div className="task-meta-grid">
                      <span>
                        <UserRound size={13} />
                        {t.assignedTo || "Unassigned"}
                      </span>
                      <span>
                        <Clock3 size={13} />
                        {shortDate(t.dueDate)}
                      </span>
                    </div>
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
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        eyebrow="WORK ITEM"
        title="Create task"
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button form="task-form" className="primary-button">
              Create task
            </button>
          </>
        }
      >
        <form id="task-form" className="form-grid" onSubmit={create}>
          <label className="span-2">
            Event
            <select
              required
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
            >
              <option value="">Select event...</option>
              {events.map((e) => (
                <option value={e._id} key={e._id}>
                  {e.eventCode} · {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Task title
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <label>
            Owner
            <input
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            />
          </label>
          <label>
            Department
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
