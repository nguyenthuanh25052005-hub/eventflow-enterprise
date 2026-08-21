import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("eventflow_token");
  const rawUser = localStorage.getItem("eventflow_user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "CUSTOMER" ? "/portal" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}
