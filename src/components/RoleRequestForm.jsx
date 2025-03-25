import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, get, serverTimestamp } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const RoleRequestForm = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("member");
  const [approverPhone, setApproverPhone] = useState("");
  const [approversList, setApproversList] = useState([]);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovers();
  }, []);

  const fetchApprovers = async () => {
    setLoading(true);
    const snapshot = await get(ref(db, "users"));
    setLoading(false);

    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const approvers = Object.values(usersData).filter(
        (user) => user.role === "president" || user.role === "committee-member"
      );

      setApproversList(approvers);
      if (approvers.length > 0) {
        setApproverPhone(approvers[0].phone); // Default to first approver
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return alert("User not found.");
    if (!approverPhone) return alert("No valid approver found. Please enter the approver's phone number.");

    // Check if a request already exists
    const requestsSnapshot = await get(ref(db, "roleRequests"));
    if (requestsSnapshot.exists()) {
      const existingRequests = Object.values(requestsSnapshot.val()).filter(
        (req) => req.userId === user.uid && req.status === "pending"
      );

      if (existingRequests.length > 0) {
        return alert("You already have a pending role request.");
      }
    }

    // Create new request
    const newRequestRef = push(ref(db, "roleRequests"));
    const requestId = newRequestRef.key;

    await push(newRequestRef, {
      userId: user.uid,
      userEmail: user.email,
      userPhone: user.phone || "Not Provided",
      requestedRole: selectedRole,
      requestedBy: user.name,
      approverPhone,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    // Generate WhatsApp link
    const approvalUrl = `https://your-app.com/approve-role/${requestId}`;
    const message = `Hello, I (${user.name}, Ph: ${user.phone || "Not Provided"}) have requested a role change to "${selectedRole}". Please review and approve it here: ${approvalUrl}`;
    
    const whatsappURL = `https://wa.me/${approverPhone}?text=${encodeURIComponent(message)}`;
    setWhatsappLink(whatsappURL);

    alert("Role change request sent successfully! You can now send it via WhatsApp.");
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-80">
      <h3 className="text-lg font-bold mb-3">Request Role Change</h3>

      <label className="block mb-2">Select Role:</label>
      <select 
        className="border p-2 w-full mb-3"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        <option value="member">Member</option>
      </select>

      <label className="block mb-2">Select Approver:</label>
      {loading ? (
        <p>Loading approvers...</p>
      ) : (
        approversList.length > 0 ? (
          <select
            className="border p-2 w-full mb-3"
            value={approverPhone}
            onChange={(e) => setApproverPhone(e.target.value)}
          >
            {approversList.map((approver, index) => (
              <option key={index} value={approver.phone}>
                {approver.name} ({approver.role}) - {approver.phone}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter President/Committee Member's Phone"
            className="border p-2 w-full mb-3"
            value={approverPhone}
            onChange={(e) => setApproverPhone(e.target.value)}
          />
        )
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Fetching Approvers..." : "Submit Request & Generate WhatsApp Link"}
      </button>

      {whatsappLink && (
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block mt-3 text-blue-600 font-bold text-center"
        >
          Send WhatsApp Message
        </a>
      )}
    </div>
  );
};

export default RoleRequestForm;
