// src/components/AllRoutes.js

import { Link } from "react-router-dom";

const routes = [
  { path: "/", label: "Visitor Dashboard" },
  { path: "/signin", label: "Sign In" },
  { path: "/profile", label: "Profile" },
  { path: "/president", label: "President Dashboard" },
  { path: "/committee-member", label: "Committee Member Dashboard" },
  { path: "/member", label: "Member Dashboard" },
  { path: "/visitor-dashboard", label: "Visitor Dashboard (Alt)" },
  { path: "/role-approval", label: "Role Approval Dashboard" },
  { path: "/role-management", label: "Role Management" },
  { path: "/data-entry", label: "Data Entry Page" },
  { path: "/migrate", label: "Migrate Data" },
  { path: "/family", label: "Family Form" },
  { path: "/families", label: "Families Table" },
  { path: "/local", label: "Local Storage Viewer" },
];

const AllRoutes = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Pages</h2>
      <div className="flex flex-wrap gap-4">
        {routes.map((route) => (
          <Link to={route.path} key={route.path}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              {route.label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllRoutes;
