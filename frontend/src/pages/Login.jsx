import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function Login() {
  const [form, setForm] = useState({
    email: "admin@eventflow.local",
    password: "Admin@123456",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form);
      localStorage.setItem("eventflow_token", data.token);
      localStorage.setItem("eventflow_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="brand-mark large">EF</div>
          <div>
            <h1>EventFlow</h1>
            <p>Enterprise Event Operations</p>
          </div>
        </div>
        <div className="login-copy">
          <span className="eyebrow">OPERATIONS PLATFORM</span>
          <h2>Run every event from one workspace.</h2>
          <p>
            Manage customers, requests, quotations, teams, tasks, budgets and
            on-site operations in one connected system.
          </p>
        </div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Sign in to EventFlow</h2>
        <p className="muted">
          Use the seeded administrator account for first setup.
        </p>
        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
            required
          />
        </label>
        <label>
          Password
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            required
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
