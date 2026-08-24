import { Check, Mail, Phone, RefreshCw, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { customerPortalApi } from "../../api/customerPortalApi";
import { initials } from "../../utils/format";

export default function MyProfile() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [customer, setCustomer] = useState({});
  const [status, setStatus] = useState({ loading: true, saving: false, success: "", error: "" });
  const load = async () => {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try { const data = await customerPortalApi.me(); setForm({ name: data.user.name || "", email: data.user.email || "", phone: data.user.customer?.phone || data.user.customer?.contactPerson?.phone || "" }); setCustomer(data.user.customer || {}); setStatus({ loading: false, saving: false, success: "", error: "" }); }
    catch (error) { setStatus({ loading: false, saving: false, success: "", error: error.response?.data?.message || "Unable to load your profile." }); }
  };
  useEffect(() => { load(); }, []);
  async function save(e) {
    e.preventDefault(); setStatus((s) => ({ ...s, saving: true, success: "", error: "" }));
    try { const data = await customerPortalApi.updateProfile(form); localStorage.setItem("eventflow_user", JSON.stringify(data.user)); window.dispatchEvent(new Event("eventflow:user-updated")); setCustomer(data.user.customer || {}); setForm({ name: data.user.name || "", email: data.user.email || "", phone: data.user.customer?.phone || "" }); setStatus({ loading: false, saving: false, success: data.message || "Profile updated successfully.", error: "" }); setTimeout(() => setStatus((s) => ({ ...s, success: "" })), 3000); }
    catch (error) { setStatus((s) => ({ ...s, saving: false, error: error.response?.data?.message || "Unable to save your profile." })); }
  }
  if (status.loading) return <div className="customer-page"><div className="portal-page-loading"><span className="portal-spinner" />Loading your profile…</div></div>;
  const companyName = customer.companyName || customer.name || "EventFlow customer";
  return <div className="customer-page">
    <section className="customer-page-heading"><div><span className="portal-eyebrow">PERSONAL ACCOUNT</span><h1>My Profile</h1><p>Manage your contact details used across the customer portal.</p></div></section>
    {status.success && <div className="portal-success"><Check size={16} />{status.success}</div>}{status.error && <div className="portal-error"><span>{status.error}</span><button onClick={load}><RefreshCw size={14} /> Reload</button></div>}
    <div className="profile-layout"><aside className="profile-card customer-panel"><div className="profile-avatar-large">{initials(form.name || "Customer")}</div><h2>{form.name || "Customer user"}</h2><p>{form.email}</p><span>{companyName}</span><div className="profile-access"><ShieldCheck size={17} /><div><strong>Customer user</strong><span>Secure customer portal access</span></div></div></aside>
      <div className="profile-content"><form className="customer-panel profile-form" onSubmit={save}><header><div><span className="portal-eyebrow">PROFILE DETAILS</span><h2>Personal information</h2></div><button className="portal-primary" disabled={status.saving}><Save size={15} /> {status.saving ? "Saving…" : "Save changes"}</button></header><div className="portal-form-grid"><ProfileField icon={UserRound} label="Full name" value={form.name} required onChange={(v) => setForm({ ...form, name: v })} /><ProfileField icon={Mail} label="Login email" value={form.email} type="email" required onChange={(v) => setForm({ ...form, email: v })} /><ProfileField icon={Phone} label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div></form><section className="customer-panel security-row"><div className="security-icon"><ShieldCheck size={19} /></div><div><strong>Account security</strong><span>Your session is protected by EventFlow authentication.</span></div><span className="profile-role">CUSTOMER</span></section></div>
    </div>
  </div>;
}
function ProfileField({ icon: Icon, label, value, onChange, type = "text", required }) { return <label><span>{label}</span><div className="profile-input"><Icon size={15} /><input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} /></div></label>; }
