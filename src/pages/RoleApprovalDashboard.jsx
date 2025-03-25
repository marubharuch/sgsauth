import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update, push, remove, serverTimestamp } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const RoleApprovalDashboard = () => {
  const { user } = useAuth();
  const [roleRequests, setRoleRequests] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== "president" && user.role !== "committee-member")) return;

    const requestsRef = ref(db, "roleRequests");
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setRoleRequests(requestsList.filter((req) => req.status === "pending"));
      } else {
        setRoleRequests([]);
      }
    });
  }, [user]);

  const handleApprove = async (request) => {
    if (!user) return;

    const userRef = ref(db, `users/${request.userId}`);
    const historyRef = ref(db, "roleApprovalHistory");

    await update(userRef, { role: request.requestedRole });
    await push(historyRef, {
      userId: request.userId,
      approvedBy: user.name,
      approvedByRole: user.role,
      approvedAt: serverTimestamp(),
      previousRole: "visitor",
      newRole: request.requestedRole,
    });

    await update(ref(db, `roleRequests/${request.id}`), { status: "approved" });
  };

  const handleReject = async (requestId) => {
    await update(ref(db, `roleRequests/${requestId}`), { status: "rejected" });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Role Approval Requests</h2>
      
      {roleRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">User</th>
              <th className="border p-2">Requested Role</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roleRequests.map((request) => (
              <tr key={request.id} className="border">
                <td className="border p-2">{request.requestedBy}</td>
                <td className="border p-2">{request.requestedRole}</td>
                <td className="border p-2">{request.userPhone}</td>
                <td className="border p-2">
                  <button 
                    onClick={() => handleApprove(request)} 
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(request.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoleApprovalDashboard;
