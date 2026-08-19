import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
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

      if (data.user.role === "CUSTOMER") {
        navigate("/portal");
      } else {
        navigate("/dashboard");
      }
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
          <span className="eyebrow">EVENT MANAGEMENT PLATFORM</span>

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
          Sign in with your EventFlow account. Customers and internal team
          members use the same secure login.
        </p>

        <label>
          Email
          <input
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button
          type="submit"
          className="primary-button full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="muted">
          New customer? <Link to="/register">Create customer account</Link>
        </p>
      </form>
    </div>
  );
}
