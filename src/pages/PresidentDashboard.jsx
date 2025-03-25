


import RoleManagement from "../components/RoleManagement";

const PresidentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">President Dashboard</h2>
        <p className="text-gray-700">
          Manage all family directories and member data with full control.
        </p>
      </div>
      <RoleManagement />
    </div>
  );
};

export default PresidentDashboard;
