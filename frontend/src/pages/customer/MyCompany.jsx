import { Check, Mail, MapPin, Pencil, Phone, RefreshCw, Save, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { customerPortalApi } from "../../api/customerPortalApi";
import { initials } from "../../utils/format";

const empty = { companyName: "", name: "", customerCode: "", taxCode: "", email: "", phone: "", address: "", type: "COMPANY", status: "" };

export default function MyCompany() {
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState(empty);
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState({ loading: true, saving: false, success: "", error: "" });
  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try { const data = await customerPortalApi.getCompany(); const next = { ...empty, ...data.customer }; setCompany(next); setForm(next); setStatus({ loading: false, saving: false, success: "", error: "" }); }
    catch (error) { setStatus({ loading: false, saving: false, success: "", error: error.response?.data?.message || "Unable to load company information." }); }
  };
  useEffect(() => { load(); }, []);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function save(e) {
    e.preventDefault(); setStatus((s) => ({ ...s, saving: true, success: "", error: "" }));
    try {
      const payload = { phone: form.phone, address: form.address, taxCode: form.taxCode };
      if (form.type === "COMPANY") payload.companyName = form.companyName;
      const data = await customerPortalApi.updateCompany(payload); const next = { ...empty, ...data.customer };
      setCompany(next); setForm(next); setEditing(false); setStatus({ loading: false, saving: false, success: data.message || "Company information updated successfully.", error: "" });
      setTimeout(() => setStatus((s) => ({ ...s, success: "" })), 3000);
    } catch (error) { setStatus((s) => ({ ...s, saving: false, error: error.response?.data?.message || "Unable to save company information." })); }
  }
  const displayName = form.companyName || form.name || "Company profile";
  if (status.loading) return <Loading text="Loading company information…" />;
  return <div className="customer-page">
    <section className="customer-page-heading"><div><span className="portal-eyebrow">ORGANIZATION</span><h1>My Company</h1><p>View and maintain the company information associated with your EventFlow account.</p></div>{!editing && <button className="portal-primary" onClick={() => setEditing(true)}><Pencil size={15} /> Edit information</button>}</section>
    {status.success && <div className="portal-success"><Check size={16} />{status.success}</div>}
    {status.error && <div className="portal-error"><span>{status.error}</span>{!editing && <button onClick={load}><RefreshCw size={14} /> Try again</button>}</div>}
    <div className="company-layout">
      <aside className="company-summary customer-panel"><div className="company-logo-large">{initials(displayName)}</div><h2>{displayName}</h2><span>{form.customerCode || "Customer account"}</span><div className="company-status"><i /> {form.status === "INACTIVE" ? "Inactive" : "Active customer"}</div><div className="company-manager"><small>ACCOUNT TYPE</small><strong>{form.type === "INDIVIDUAL" ? "Individual customer" : "Company customer"}</strong><span>Managed securely by EventFlow</span>{form.email && <a href={`mailto:${form.email}`}><Mail size={13} /> {form.email}</a>}</div></aside>
      <form className="company-details customer-panel" onSubmit={save}><header><div><span className="portal-eyebrow">COMPANY DETAILS</span><h2>Business information</h2></div>{editing && <div className="portal-form-actions"><button type="button" disabled={status.saving} onClick={() => { setForm(company); setEditing(false); }}><X size={15} /> Cancel</button><button className="portal-primary" disabled={status.saving}><Save size={15} /> {status.saving ? "Saving…" : "Save changes"}</button></div>}</header>
        <div className="portal-form-grid"><Field label={form.type === "INDIVIDUAL" ? "Customer name" : "Company name"} value={displayName} editing={editing && form.type === "COMPANY"} required onChange={(v) => update("companyName", v)} /><Field label="Customer code" value={form.customerCode || "—"} /><Field label="Tax code" value={form.taxCode} editing={editing} onChange={(v) => update("taxCode", v)} /><Field label="Company email" value={form.email || "—"} icon={Mail} /><Field label="Phone number" value={form.phone} editing={editing} icon={Phone} onChange={(v) => update("phone", v)} /><Field label="Office address" value={form.address} editing={editing} icon={MapPin} wide onChange={(v) => update("address", v)} /></div>
        <div className="company-security"><ShieldCheck size={19} /><div><strong>Verified company profile</strong><span>Customer code, account type and email are managed separately from editable business details.</span></div></div>
      </form>
    </div>
  </div>;
}
function Field({ label, value, editing = false, onChange, icon: Icon, wide, required }) { return <label className={wide ? "wide" : ""}><span>{label}</span>{editing ? <input value={value || ""} required={required} onChange={(e) => onChange(e.target.value)} /> : <div>{Icon && <Icon size={15} />}<strong>{value || "Not provided"}</strong></div>}</label>; }
function Loading({ text }) { return <div className="customer-page"><div className="portal-page-loading"><span className="portal-spinner" />{text}</div></div>; }
