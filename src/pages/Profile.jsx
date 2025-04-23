import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, update, get } from "firebase/database";
import RoleRequestForm from "../components/RoleRequestForm";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);
  
  useEffect(() => {
    if (!user) return;

    const storedUserData = localStorage.getItem(`user_${user.uid}`);
    if (storedUserData) {
      setPhone(JSON.parse(storedUserData).phone || "");
    } else {
      setPhone(user.phone || "");
    }

    if (user.familyId) {
      const storedFamilyData = localStorage.getItem(`family_${user.familyId}`);
      if (storedFamilyData) {
        setFamilyData(JSON.parse(storedFamilyData));
      } else {
        const familyRef = ref(db, `families/${user.familyId}`);
        get(familyRef).then((snapshot) => {
          if (snapshot.exists()) {
            const familyInfo = snapshot.val();
            setFamilyData(familyInfo);
            localStorage.setItem(`family_${user.familyId}`, JSON.stringify(familyInfo));
          }
        });
      }
    }

    setLoading(false);
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;

    const updatedUser = { ...user, phone };
    localStorage.setItem(`user_${user.uid}`, JSON.stringify(updatedUser));
    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, { phone });
    
    setUser(updatedUser);
    setIsEditing(false);
    alert("Phone number updated successfully!");
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-10">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600">Profile</h2>
        <div className="flex flex-col items-center mt-4">
          <img
            src={user.photoURL || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
          />
          <p className="mt-2 text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm bg-blue-100 px-3 py-1 rounded-full mt-1">{user.role}</p>
        </div>
        
        <div className="mt-6">
          <label className="text-gray-600 text-sm">Phone Number</label>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center border p-2 rounded bg-gray-100">
              <span>{phone || "Not provided"}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
      
      {familyData && (
        <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 md:p-8 mt-6">
          <h3 className="text-lg font-bold text-blue-600">Family Details</h3>
          <p><strong>Address:</strong> {familyData.address}</p>
          <p><strong>Native:</strong> {familyData.native}</p>
          <p><strong>Head of Family:</strong> {familyData.headOfFamily}</p>
          <p><strong>Ancestors:</strong> {familyData.ancestors}</p>
          <p><strong>Phone:</strong> {familyData.phone}</p>
        </div>
      )}

      {user.role === "visitor" && (
        <div className="w-full max-w-lg mt-6">
          <RoleRequestForm />
        </div>
      )}
    </div>
  );
};

export default Profile;
