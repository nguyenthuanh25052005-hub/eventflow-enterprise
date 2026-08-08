import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import PeopleNav from "../components/PeopleNav";
import StatusBadge from "../components/StatusBadge";
import { departmentApi } from "../api/departmentApi";
import { employeeApi } from "../api/employeeApi";
import { initials } from "../utils/format";
import { positionLabels } from "../constants/people";

const emptyDepartment = {
  name: "",
  description: "",
  manager: "",
  status: "ACTIVE",
};

export default function Departments() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyDepartment);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadDepartments() {
    const response = await departmentApi.list({
      search: search || undefined,
      status: status || undefined,
    });
    setItems(response.items || []);
  }

  async function loadEmployees() {
    const response = await employeeApi.list({ limit: 100, status: "" });
    setEmployees(response.items || []);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadDepartments, 220);
    return () => clearTimeout(timer);
  }, [search, status]);

  const counts = useMemo(() => {
    return employees.reduce((result, employee) => {
      const id = employee.department?._id || employee.department;
      if (id) result[id] = (result[id] || 0) + 1;
      return result;
    }, {});
  }, [employees]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyDepartment);
    setError("");
    setFormOpen(true);
  }

  function openEdit(department) {
    setEditingId(department._id);
    setForm({
      name: department.name || "",
      description: department.description || "",
      manager: department.manager?._id || "",
      status: department.status || "ACTIVE",
    });
    setSelected(null);
    setError("");
    setFormOpen(true);
  }

  async function openDetail(id) {
    setSelected(await departmentApi.get(id));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await departmentApi.update(editingId, {
          ...form,
          manager: form.manager || null,
        });
      } else {
        await departmentApi.create({
          name: form.name,
          description: form.description,
          status: form.status,
        });
      }
      setFormOpen(false);
      await loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save department");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(department) {
    await departmentApi.update(department._id, {
      status: department.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
    setSelected(null);
    await loadDepartments();
  }

  const managerCandidates = employees.filter(
    (employee) =>
      employee.status === "ACTIVE" &&
      (employee.department?._id || employee.department) === editingId,
  );
  const activeDepartments = items.filter((item) => item.status === "ACTIVE");
  const assignedManagers = items.filter((item) => item.manager).length;

  return (
    <div className="page people-page">
      <PeopleNav />
      <PageHeader
        eyebrow="ORGANIZATION DESIGN"
        title="Departments"
        description="Shape accountable teams, appoint department managers and understand workforce distribution at a glance."
        actions={
          <button className="primary-button" onClick={openCreate}>
            <Plus size={16} /> Create department
          </button>
        }
      />

      <section className="department-command-strip">
        <div>
          <span>Active departments</span>
          <strong>{activeDepartments.length}</strong>
          <small>Operating teams</small>
        </div>
        <div>
          <span>Employees mapped</span>
          <strong>{employees.length}</strong>
          <small>Across the organization</small>
        </div>
        <div>
          <span>Managers assigned</span>
          <strong>
            {assignedManagers}/{items.length}
          </strong>
          <small>Leadership coverage</small>
        </div>
        <div className="department-readiness">
          <CheckCircle2 size={20} />
          <div>
            <strong>
              {items.length
                ? Math.round((assignedManagers / items.length) * 100)
                : 0}
              %
            </strong>
            <span>Structure readiness</span>
          </div>
        </div>
      </section>

      <div className="toolbar enterprise-toolbar people-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department name or code..."
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="department-grid command-cards">
        {items.map((department) => (
          <article
            className="department-card"
            key={department._id}
            onClick={() => openDetail(department._id)}
          >
            <header>
              <div className="department-icon">
                <Building2 size={19} />
              </div>
              <div className="department-card-actions">
                <StatusBadge value={department.status} />
                <button
                  className="icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(department);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </header>
            <span>{department.departmentCode}</span>
            <h3>{department.name}</h3>
            <p>{department.description || "No description provided."}</p>
            <div className="department-capacity">
              <div>
                <span>Team size</span>
                <strong>{counts[department._id] || 0}</strong>
              </div>
              <div>
                <span>Leadership</span>
                <strong>{department.manager ? "Assigned" : "Open"}</strong>
              </div>
            </div>
            <footer>
              <ManagerIdentity manager={department.manager} />
              <UsersRound size={18} />
            </footer>
          </article>
        ))}
        {!items.length && (
          <div className="soft-empty span-full">No departments match this view.</div>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        eyebrow={editingId ? "ORGANIZATION RECORD" : "TEAM SETUP"}
        title={editingId ? "Edit department" : "Create department"}
        footer={
          <>
            <button className="secondary-button" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button className="primary-button" form="department-form" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create department"}
            </button>
          </>
        }
      >
        <form id="department-form" className="form-grid" onSubmit={save}>
          <label className="span-2">
            Department name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Production"
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Team mandate, scope and responsibilities..."
            />
          </label>
          {editingId && (
            <>
              <label>
                Department manager
                <select
                  value={form.manager}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                >
                  <option value="">Not assigned</option>
                  {managerCandidates.map((employee) => (
                    <option value={employee._id} key={employee._id}>
                      {employee.name} · {positionLabels[employee.position] || employee.position}
                    </option>
                  ))}
                </select>
                {!managerCandidates.length && (
                  <small>Create an active employee in this department first.</small>
                )}
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </>
          )}
          {!editingId && (
            <div className="workflow-note span-2">
              <strong>Next step</strong>
              <span>
                Create employees in this department, then return here to appoint a manager.
              </span>
            </div>
          )}
          {error && <div className="error-box span-2">{error}</div>}
        </form>
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={selected?.departmentCode}
        title={selected?.name || "Department"}
        size="lg"
        footer={
          selected && (
            <>
              <button className="secondary-button" onClick={() => toggleStatus(selected)}>
                {selected.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
              <button className="primary-button" onClick={() => openEdit(selected)}>
                <Pencil size={15} /> Edit department
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="department-profile">
            <div className="department-profile-hero">
              <div className="department-icon large">
                <Building2 size={24} />
              </div>
              <div>
                <StatusBadge value={selected.status} />
                <p>{selected.description || "No description provided."}</p>
              </div>
            </div>
            <div className="department-detail-grid">
              <div>
                <UsersRound size={17} />
                <span>Employees</span>
                <strong>{selected.employeeCount || 0}</strong>
              </div>
              <div>
                <UserRound size={17} />
                <span>Department manager</span>
                <strong>{selected.manager?.name || "Not assigned"}</strong>
              </div>
            </div>
            <div className="detail-section">
              <span className="section-label">Leadership</span>
              <div className="manager-profile-row">
                <ManagerIdentity manager={selected.manager} />
                {selected.manager && (
                  <span>{positionLabels[selected.manager.position] || selected.manager.position} · {selected.manager.email || "No email"}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ManagerIdentity({ manager }) {
  return (
    <div className="manager-identity">
      <div className="manager-avatar">
        {manager?.avatar ? (
          <img src={manager.avatar} alt="" />
        ) : manager ? (
          initials(manager.name)
        ) : (
          <UserRound size={14} />
        )}
      </div>
      <div>
        <span>Manager</span>
        <strong>{manager?.name || "Not assigned"}</strong>
      </div>
    </div>
  );
}
