import { Link, useLocation } from "react-router-dom";

export default function LinkBar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "active fw-bold" : "";

  return (
    <ul className="link-nav px-3 pb-3">
      <li className="nav-item">
        <Link className={`nav-link ${isActive("/")}`} to="/">
          Dashboard
        </Link>
      </li>
      <li className="nav-item opacity-50">
        <div className="nav-link disabled text-secondary " title="Coming soon">
          <label>Routines</label>
        </div>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${isActive("/todos")}`} to="/todos">
          To-do
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${isActive("/calendar")}`} to="/calendar">
          Calendar
        </Link>
      </li>
      <li className="nav-item">
        <Link className={`nav-link ${isActive("/shopping")}`} to="/shopping">
          Shopping
        </Link>
      </li>
    </ul>
  );
}
