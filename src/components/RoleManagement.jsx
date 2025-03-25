import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, get, update } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const RoleManagement = () => {
  const { user } = useAuth();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [roleHistory, setRoleHistory] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "president") return;
    fetchPendingRequests();
  }, [user]);

  useEffect(() => {
    if (selectedFilter === "history") {
      fetchRoleHistory();
    } else {
      fetchUsers();
    }
  }, [selectedFilter, searchName, searchPhone]);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await get(ref(db, "users"));
    setLoading(false);

    if (snapshot.exists()) {
      let userList = Object.entries(snapshot.val()).map(([uid, data]) => ({ uid, ...data }));

      // Apply Role & Search Filters
      if (selectedFilter && selectedFilter !== "history") {
        userList = userList.filter((u) => u.role === selectedFilter);
      }
      if (searchName) {
        userList = userList.filter((u) => u.name?.toLowerCase().includes(searchName.toLowerCase()));
      }
      if (searchPhone) {
        userList = userList.filter((u) => u.phone?.includes(searchPhone));
      }

      setUsers(userList);
    } else {
      setUsers([]);
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    const snapshot = await get(ref(db, "roleRequests"));
    setLoading(false);
    if (snapshot.exists()) {
      setPendingRequests(Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data })));
    }
  };

  const fetchRoleHistory = async () => {
    setLoading(true);
    const snapshot = await get(ref(db, "roleHistory"));
    setLoading(false);
    if (snapshot.exists()) {
      const historyList = Object.entries(snapshot.val()).flatMap(([uid, changes]) =>
        Object.entries(changes).map(([timestamp, change]) => ({
          uid,
          timestamp: new Date(parseInt(timestamp)).toLocaleString(), // Convert timestamp
          ...change,
        }))
      );
      setRoleHistory(historyList);
    } else {
      setRoleHistory([]);
    }
  };

  const updateRole = async (uid, newRole) => {
    setLoading(true);
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, { role: newRole });

    await update(ref(db, `roleHistory/${uid}/${Date.now()}`), {
      changedBy: user.name,
      changedByUid: user.uid,
      newRole,
      timestamp: Date.now(),
    });

    setLoading(false);
    alert("Role updated successfully!");
    fetchUsers();
    fetchPendingRequests();
  };

  return (
    <div className="p-4 relative">
      {/* ✅ Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="loader"></div>
        </div>
      )}

      {/* ✅ Search Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Search by Phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={() => fetchUsers()} className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </div>

      {/* ✅ Role Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setSelectedFilter("committee-member")} className="bg-green-500 text-white px-3 py-2 rounded">
          Committee Members
        </button>
        <button onClick={() => setSelectedFilter("member")} className="bg-yellow-500 text-white px-3 py-2 rounded">
          Members
        </button>
        <button onClick={() => setSelectedFilter("visitor")} className="bg-red-500 text-white px-3 py-2 rounded">
          Visitors
        </button>
        <button onClick={() => setSelectedFilter("history")} className="bg-gray-600 text-white px-3 py-2 rounded">
          View Role Change History
        </button>
      </div>

      {/* ✅ Display Users or Role History */}
      <div className="bg-white p-4 shadow-md rounded-md min-h-[200px]">
        {selectedFilter === "history" ? (
          roleHistory.length > 0 ? (
            <ul>
              {roleHistory.map((entry, index) => (
                <li key={index} className="p-2 border-b">
                  <span>
                    <strong>{entry.changedBy}</strong> changed role to <strong>{entry.newRole}</strong> on {entry.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No role changes recorded.</p>
          )
        ) : users.length > 0 ? (
          <ul>
            {users.map((u) => (
              <li key={u.uid} className="flex justify-between p-2 border-b">
                <span>
                  {u.name} ({u.phone}) - {u.role}
                </span>
                <div>
                  {u.role !== "committee-member" && (
                    <button onClick={() => updateRole(u.uid, "committee-member")} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
                      Make Committee Member
                    </button>
                  )}
                  {u.role !== "member" && (
                    <button onClick={() => updateRole(u.uid, "member")} className="bg-yellow-500 text-white px-3 py-1 rounded">
                      Make Member
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
