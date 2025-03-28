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
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    console.log("Checking family data in local storage:", localStorage.getItem(`family_${user.familyID}`));

    if (!user) return;

    const storedUserData = localStorage.getItem(`user_${user.uid}`);
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setPhone(parsedData.phone || "");
    } else {
      setPhone(user.phone || "");
    }

    if (user.familyId) {
      const storedFamilyData = localStorage.getItem(`family_${user.familyId}`);
      if (storedFamilyData) {
        console.log("Setting family data from local storage:", storedFamilyData);
    
        setFamilyData(JSON.parse(storedFamilyData));
      } else {
        // Fetch from RTDB if not in local storage
        const familyRef = ref(db, `families/${user.familyId}`);
        get(familyRef).then((snapshot) => {
          if (snapshot.exists()) {
            const familyInfo = snapshot.val();
            setFamilyData(familyInfo);
            localStorage.setItem(`family_${user.familyId}`, JSON.stringify(familyInfo));
            setForceRender((prev) => !prev); // Force re-render
          }
        });
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    console.log("Updated Family Data:", familyData);
  }, [familyData]);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      <div className="flex flex-col items-center gap-4 bg-white p-6 shadow-md rounded-lg">
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full border border-gray-300"
        />

        <div className="w-60 text-center">
          <label className="text-gray-600 text-sm">User ID</label>
          <input
            type="text"
            value={user.uid}
            className="border p-2 rounded w-full bg-gray-100"
            readOnly
          />

          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        {/* Editable Phone Number */}
        {phone ? (
          isEditing ? (
            <>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 rounded w-60"
                placeholder="Enter Phone Number"
              />
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Update
              </button>
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <p><strong>Phone:</strong> {phone}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-3 rounded"
              >
                Edit
              </button>
            </div>
          )
        ) : (
          <>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded w-60"
              placeholder="Enter Phone Number"
            />
            <button
              onClick={handleUpdate}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Update
            </button>
          </>
        )}
      </div>

      {familyData && (
        <div className="mt-6 bg-white p-4 shadow-md rounded-lg w-80">
          <h3 className="text-lg font-bold">Family Details</h3>
          <p><strong>Address:</strong> {familyData.address}</p>
          <p><strong>Native:</strong> {familyData.native}</p>
          <p><strong>Head of Family:</strong> {familyData.headOfFamily}</p>
          <p><strong>Ancestors:</strong> {familyData.ancestors}</p>
          <p><strong>Phone:</strong> {familyData.phone}</p>
        </div>
      )}

      {user.role === "visitor" && (
        <div className="mt-6">
          <RoleRequestForm />
        </div>
      )}
    </div>
  );
};

export default Profile;
