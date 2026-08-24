import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import { authApi } from "../api/authApi";

export default function Login() {
  const [searchParams] = useSearchParams();
  const isInternal = searchParams.get("mode") === "internal";
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
            <p>{isInternal ? "Enterprise Event Operations" : "Customer Event Portal"}</p>
          </div>
        </div>

        <div className="login-copy">
          <span className="eyebrow">{isInternal ? "EVENT MANAGEMENT PLATFORM" : "CUSTOMER PORTAL"}</span>

          <h2>{isInternal ? "Run every event from one workspace." : "Your events, always within reach."}</h2>

          <p>
            {isInternal
              ? "Manage customers, requests, quotations, teams, tasks, budgets and on-site operations in one connected system."
              : "Create event requests, review quotations and stay connected with your EventFlow team from one secure portal."}
          </p>
        </div>
      </div>

      <Link className="login-audience-switch" to={isInternal ? "/login" : "/login?mode=internal"}>
        {isInternal ? <UserRound size={16} /> : <Building2 size={16} />}
        <span><small>{isInternal ? "EVENT CUSTOMER" : "EVENTFLOW TEAM"}</small><strong>{isInternal ? "Customer sign in" : "Internal member sign in"}</strong></span>
        <ArrowRight size={15} />
      </Link>

      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">{isInternal ? "TEAM ACCESS" : "CUSTOMER ACCESS"}</span>

        <h2>{isInternal ? "Internal member sign in" : "Customer sign in"}</h2>

        <p className="muted">
          {isInternal
            ? "Use your EventFlow work account to access internal operations."
            : "Sign in to follow requests, quotations and upcoming events."}
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

        {!isInternal && <p className="muted login-register-prompt">
          New customer? <Link to="/register">Create customer account</Link>
        </p>}
      </form>
    </div>
  );
}
