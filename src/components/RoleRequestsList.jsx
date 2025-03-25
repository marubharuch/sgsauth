import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const RoleRequestsList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== "president" && user.role !== "committee-member")) return;
    
    const roleRequestsRef = ref(db, "roleRequests");
    onValue(roleRequestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredRequests = Object.entries(data)
          .map(([id, request]) => ({ id, ...request }))
          .filter(request => request.status === "pending");
        setRequests(filteredRequests);
      }
    });
  }, [user]);

  const handleApprove = async (request) => {
    const userRef = ref(db, `users/${request.userId}`);
    const requestRef = ref(db, `roleRequests/${request.id}`);

    await update(userRef, { role: request.requestedRole });
    await update(requestRef, { status: "approved", approvedBy: user.uid });

    alert("Role updated successfully!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pending Role Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id} className="border p-3 mb-2">
              <p><strong>User:</strong> {req.userEmail}</p>
              <p><strong>Requested Role:</strong> {req.requestedRole}</p>
              <button
                onClick={() => handleApprove(req)}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoleRequestsList;
