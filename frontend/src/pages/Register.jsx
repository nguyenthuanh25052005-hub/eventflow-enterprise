import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerType: "COMPANY",
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;

      const data = await authApi.registerCustomer(payload);

      localStorage.setItem("eventflow_token", data.token);

      localStorage.setItem("eventflow_user", JSON.stringify(data.user));

      navigate("/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            <p>Customer Event Portal</p>
          </div>
        </div>

        <div className="login-copy">
          <span className="eyebrow">CUSTOMER PORTAL</span>

          <h2>Plan your next event with EventFlow.</h2>

          <p>
            Create event requests, follow quotations and stay connected with the
            operations team from one workspace.
          </p>
        </div>
      </div>

      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">CREATE ACCOUNT</span>

        <h2>Customer registration</h2>

        <p className="muted">Create your EventFlow customer account.</p>

        <label>
          Customer type
          <select
            value={form.customerType}
            onChange={(e) => update("customerType", e.target.value)}
          >
            <option value="COMPANY">Company</option>
            <option value="INDIVIDUAL">Individual</option>
          </select>
        </label>

        {form.customerType === "COMPANY" && (
          <label>
            Company name
            <input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              required
            />
          </label>
        )}

        <label>
          Full name
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>

        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label>
          Address
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-button full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
