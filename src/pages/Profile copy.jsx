import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, get, update } from "firebase/database";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);

    // Fetch user data from Firebase
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setName(data.name || "");
        setPhone(data.phone || "");
        setRole(data.role || "visitor");
      }
      setLoading(false);
    });
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    try {
      await update(userRef, { name, phone, role });

      setUser((prev) => ({ ...prev, name, phone, role })); // Update locally
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Firebase update error:", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      
      <div className="flex flex-col items-center gap-4 bg-white p-6 shadow-md rounded-lg w-80">
        <img 
          src={user.photoURL || "/default-avatar.png"} 
          alt="Profile" 
          className="w-20 h-20 rounded-full border border-gray-300"
        />

        <div className="w-full">
          <label className="text-gray-600 text-sm">User ID</label>
          <input type="text" value={user.uid} className="border p-2 rounded w-full bg-gray-100" readOnly />
        </div>

        <div className="w-full">
          <label className="text-gray-600 text-sm">Email</label>
          <input type="email" value={user.email} className="border p-2 rounded w-full bg-gray-100" readOnly />
        </div>

        <div className="w-full">
          <label className="text-gray-600 text-sm">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full" />
        </div>

        <div className="w-full">
          <label className="text-gray-600 text-sm">Phone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 rounded w-full" placeholder="Enter phone number" />
        </div>

        <div className="w-full">
          <label className="text-gray-600 text-sm">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded w-full">
            <option value="visitor">Visitor</option>
            <option value="member">Member</option>
            <option value="committee-member">Committee Member</option>
            <option value="president">President</option>
          </select>
        </div>

        <button onClick={handleUpdate} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4">
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
