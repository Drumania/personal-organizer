import { Link, useLocation } from "react-router-dom";

export default function LinkBar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "active fw-bold" : "";

  const menuItems = [
    { path: "/", label: "Dashboard" },
    // { path: "/routines", label: "Routines" },
    { path: "/todos", label: "To-do" },
    { path: "/calendar", label: "Calendar" },
    { path: "/shopping", label: "Shopping" },
  ];

  return (
    <ul className="link-nav px-3 pb-3">
      {menuItems.map((item, index) => (
        <li className="nav-item" key={index}>
          <Link className={`nav-link ${isActive(item.path)}`} to={item.path}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
