import { NavLink } from "react-router-dom";
import { Building2, UsersRound } from "lucide-react";

export default function PeopleNav() {
  return (
    <div className="people-nav" aria-label="People navigation">
      <NavLink to="/employees">
        <UsersRound size={15} />
        Employees
      </NavLink>
      <NavLink to="/departments">
        <Building2 size={15} />
        Departments
      </NavLink>
    </div>
  );
}
