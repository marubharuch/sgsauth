import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaTachometerAlt } from "react-icons/fa"; // Import icons

const Navbar = () => {
  const { user, logout } = useAuth(); // FIX: Correct function name
  const navigate = useNavigate();

  // Function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user || !user.role) return "/visitor-dashboard";
    switch (user.role) {
      case "president": return "/president";
      case "committee-member": return "/committee-member";
      case "member": return "/member";
      default: return "/visitor-dashboard";
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleDashboardClick = () => {
    navigate(getDashboardRoute());
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate("/signin"); // Ensure navigation after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">My Web App</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Dashboard Icon - Redirects to the respective dashboard */}
            {user && (user.role === "president" || user.role === "committee-member") && (
  <Link to="/role-approval" className="text-white hover:text-gray-300">
    Role Approvals
  </Link>
)}




            <FaTachometerAlt 
              className="text-2xl cursor-pointer hover:text-gray-300" 
              onClick={handleDashboardClick}
              title="Go to Dashboard"
            />

            {/* Profile Picture */}
            <img 
              src={user.photoURL || "/default-avatar.png"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white cursor-pointer"
              onClick={handleProfileClick} 
              title="Profile"
            />

            {/* Logout Button */}
            <button 
              onClick={handleLogoutClick} 
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/signin" className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
