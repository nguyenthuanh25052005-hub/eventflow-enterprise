import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import PeopleNav from "../components/PeopleNav";
import { departmentApi } from "../api/departmentApi";
import { employeeApi } from "../api/employeeApi";
import { initials } from "../utils/format";
import { positionLabels, skillsByPosition } from "../constants/people";

const emptyEmployee = {
  name: "",
  email: "",
  phone: "",
  avatar: "",
  department: "",
  position: "STAFF",
  skills: [],
  employmentType: "FULL_TIME",
  status: "ACTIVE",
};

const employmentLabels = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  FREELANCE: "Freelance",
};

export default function Employees() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [profile, setProfile] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyEmployee);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    const response = await employeeApi.list({
      search: search || undefined,
      department: department || undefined,
      status: status || undefined,
      limit: 100,
    });
    setItems(response.items || []);
  }

  async function loadDepartments() {
    const response = await departmentApi.list({ status: "ACTIVE" });
    setDepartments(response.items || []);
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadEmployees, 250);
    return () => clearTimeout(timer);
  }, [search, department, status]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyEmployee);
    setError("");
    setFormOpen(true);
  }

  function openEdit(employee) {
    setEditingId(employee._id);
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      avatar: employee.avatar || "",
      department: employee.department?._id || employee.department || "",
      position: positionLabels[employee.position] ? employee.position : "STAFF",
      skills: employee.skills || [],
      employmentType: employee.employmentType || "FULL_TIME",
      status: employee.status || "ACTIVE",
    });
    setProfile(null);
    setError("");
    setFormOpen(true);
  }

  async function openProfile(id) {
    setProfile(await employeeApi.get(id));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
    };

    try {
      if (editingId) await employeeApi.update(editingId, payload);
      else await employeeApi.create(payload);
      setFormOpen(false);
      await loadEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save employee");
    } finally {
      setSaving(false);
    }
  }

  function toggleSkill(skill) {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  }

  function changePosition(position) {
    const available = skillsByPosition[position] || [];
    setForm((current) => ({
      ...current,
      position,
      skills: current.skills.filter((skill) => available.includes(skill)),
    }));
  }

  function selectAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      e.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Avatar must be 1 MB or smaller");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Could not read the selected image");
    reader.readAsDataURL(file);
  }

  const activeCount = items.filter((item) => item.status === "ACTIVE").length;
  const freelanceCount = items.filter(
    (item) => item.employmentType === "FREELANCE",
  ).length;

  return (
    <div className="page people-page">
      <PeopleNav />
      <PageHeader
        eyebrow="PEOPLE OPERATIONS"
        title="Employees"
        description="Maintain your internal and freelance workforce, capabilities, assignments and employment status."
        actions={
          <button className="primary-button" onClick={openCreate}>
            <Plus size={16} />
            Add employee
          </button>
        }
      />

      <section className="people-stats">
        <div>
          <UsersRound size={18} />
          <span>Employees in view</span>
          <strong>{items.length}</strong>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>Active workforce</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <Building2 size={18} />
          <span>Departments</span>
          <strong>{departments.length}</strong>
        </div>
        <div>
          <BriefcaseBusiness size={18} />
          <span>Freelancers in view</span>
          <strong>{freelanceCount}</strong>
        </div>
      </section>

      <div className="toolbar enterprise-toolbar people-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, email, phone, position or skill..."
          />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((item) => (
            <option value={item._id} key={item._id}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="table-card enterprise-table employee-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Position</th>
              <th>Employment</th>
              <th>Contact</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((employee) => (
              <tr
                key={employee._id}
                className="clickable-row"
                onClick={() => openProfile(employee._id)}
              >
                <td>
                  <EmployeeIdentity employee={employee} />
                </td>
                <td>
                  <strong>{employee.department?.name || "Unassigned"}</strong>
                  <span className="cell-sub">
                    {employee.department?.departmentCode || "—"}
                  </span>
                </td>
                <td>{positionLabels[employee.position] || employee.position}</td>
                <td>{employmentLabels[employee.employmentType]}</td>
                <td>
                  <span className="contact-line">
                    <Mail size={13} /> {employee.email || "—"}
                  </span>
                  <span className="contact-line">
                    <Phone size={13} /> {employee.phone || "—"}
                  </span>
                </td>
                <td>
                  <StatusBadge value={employee.status} />
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(employee);
                    }}
                    aria-label="Edit employee"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan="7" className="table-empty">
                  No employees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        eyebrow={editingId ? "EMPLOYEE RECORD" : "PEOPLE ONBOARDING"}
        title={editingId ? "Edit employee" : "Add employee"}
        size="lg"
        footer={
          <>
            <button className="secondary-button" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button className="primary-button" form="employee-form" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create employee"}
            </button>
          </>
        }
      >
        <form id="employee-form" className="form-grid" onSubmit={save}>
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Position
            <select
              required
              value={form.position}
              onChange={(e) => changePosition(e.target.value)}
            >
              {Object.entries(positionLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Department
            <select
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select department</option>
              {departments.map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Employment type
            <select
              value={form.employmentType}
              onChange={(e) =>
                setForm({ ...form, employmentType: e.target.value })
              }
            >
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <div className="avatar-upload-field span-2">
            <span>Profile photo</span>
            <div className="avatar-upload-control">
              <div className="employee-avatar upload-preview">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar preview" />
                ) : (
                  initials(form.name || "Employee")
                )}
              </div>
              <div className="avatar-upload-copy">
                <label className="secondary-button avatar-upload-button">
                  Upload image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={selectAvatar}
                  />
                </label>
                {form.avatar && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setForm({ ...form, avatar: "" })}
                  >
                    Remove
                  </button>
                )}
                <small>PNG, JPG, WebP or GIF. Maximum 1 MB.</small>
              </div>
            </div>
          </div>
          <div className="skill-picker-field span-2">
            <div className="skill-picker-heading">
              <span>Skills</span>
              <small>
                {form.skills.length} selected · Recommended for {positionLabels[form.position]}
              </small>
            </div>
            <div className="skill-picker">
              {(skillsByPosition[form.position] || []).map((skill) => {
                const selected = form.skills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    className={selected ? "skill-option selected" : "skill-option"}
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={selected}
                  >
                    {selected && <span>✓</span>}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
          {editingId && (
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
          )}
          {error && <div className="error-box span-2">{error}</div>}
        </form>
      </Modal>

      <Modal
        open={!!profile}
        onClose={() => setProfile(null)}
        eyebrow={profile?.employeeCode}
        title={profile?.name || "Employee profile"}
        size="lg"
      >
        {profile && <EmployeeProfile employee={profile} />}
      </Modal>
    </div>
  );
}

function EmployeeIdentity({ employee }) {
  return (
    <div className="employee-identity">
      <div className="employee-avatar">
        {employee.avatar ? (
          <img src={employee.avatar} alt="" />
        ) : (
          initials(employee.name || "Employee")
        )}
      </div>
      <div>
        <strong>{employee.name}</strong>
        <span>{employee.employeeCode}</span>
      </div>
    </div>
  );
}

function EmployeeProfile({ employee }) {
  return (
    <div className="employee-profile">
      <div className="employee-profile-hero">
        <div className="employee-avatar large">
          {employee.avatar ? (
            <img src={employee.avatar} alt="" />
          ) : (
            initials(employee.name || "Employee")
          )}
        </div>
        <div>
          <StatusBadge value={employee.status} />
          <h3>{positionLabels[employee.position] || employee.position}</h3>
          <p>
            {employee.department?.name || "No department"} ·{" "}
            {employmentLabels[employee.employmentType]}
          </p>
        </div>
      </div>
      <div className="employee-detail-grid">
        <ProfileField icon={Mail} label="Email" value={employee.email || "—"} />
        <ProfileField icon={Phone} label="Phone" value={employee.phone || "—"} />
        <ProfileField
          icon={Building2}
          label="Department"
          value={employee.department?.name || "—"}
        />
        <ProfileField
          icon={BriefcaseBusiness}
          label="Employment"
          value={employmentLabels[employee.employmentType]}
        />
      </div>
      <div className="detail-section">
        <span className="section-label">Skills & capabilities</span>
        <div className="skill-list">
          {(employee.skills || []).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
          {!employee.skills?.length && <p className="muted">No skills recorded.</p>}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="detail-field">
      <div className="detail-field-icon">
        <Icon size={15} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
