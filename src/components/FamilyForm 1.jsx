import { useState, useEffect } from "react";
import { getDatabase, ref, get, update, push, set } from "firebase/database";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

const FamilyForm = ({ onSelectFamily }) => {
    const { user } = useAuth();
    const [userFamilyId, setUserFamilyId] = useState(null);
    const [searchData, setSearchData] = useState({ phone: "", headOfFamily: "", native: "", city: "" });
    const [filteredFamilies, setFilteredFamilies] = useState([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    const [formData, setFormData] = useState({ headOfFamily: "", address: "", phone: "", native: "", city: "", ancestors: "" });
    const [isEditing, setIsEditing] = useState(false);

    console.log("🔍 Family Form Component Rendered - FamilyForm Component mount ho gaya hai!");

    const dbRTDB = getDatabase();
    const dbFirestore = getFirestore();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;
            console.log("📡 Fetching user profile - User ka data le rahe hain Firebase se!");

            const userRef = ref(dbRTDB, `users/${user.uid}`);
            const userSnap = await get(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.val();
                console.log("✅ User profile found - Firebase se user ka familyId mila: ", userData.familyId);
                if (userData.familyId) {
                    setUserFamilyId(userData.familyId);
                    setSelectedFamilyId(userData.familyId);
                }
            }
        };

        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        const fetchFamilyData = async () => {
            if (!selectedFamilyId) return;

            console.log("🛠 Fetching Family Data - Family ka data dhoondh rahe hain...");
            const cachedData = await localforage.getItem(`family_${selectedFamilyId}`);

            if (cachedData) {
                console.log("📂 Cached Data Found - Localforage me family ka data mil gaya!");
                setFormData(cachedData);
            }

            const familyRef = ref(dbRTDB, `families/${selectedFamilyId}`);
            const snapshot = await get(familyRef);

            if (snapshot.exists()) {
                const firebaseData = snapshot.val();
                console.log("🔥 Firebase Data Found - Realtime DB se family ka data aa gaya!");

                if (JSON.stringify(firebaseData) !== JSON.stringify(cachedData)) {
                    console.log("🔄 Updating Cache - Firebase ka naya data localforage me store kar rahe hain!");
                    await localforage.setItem(`family_${selectedFamilyId}`, firebaseData);
                    setFormData(firebaseData);
                    alert("Family data has been updated from Firebase.");
                }
            }
        };

        fetchFamilyData();
    }, [selectedFamilyId]);

    const handleSearchChange = (e) => {
        console.log("🔍 Search Input Changed -", e.target.name, ":", e.target.value);
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
    };

    const handleSearch = async () => {
        console.log("🔍 Searching Families - Firebase Firestore me families dhoondh rahe hain!");
        try {
            const docRef = doc(dbFirestore, "migratedData", "families");
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return;

            const data = docSnap.data();
            if (!data.families) return;

            console.log("📜 Families Data Found - Firestore se pura data aa gaya!");
            const familiesArray = Object.keys(data.families).map(key => ({
                id: key,
                headOfFamily: data.families[key].headOfFamily || "Unknown",
                phone: data.families[key].phone || "N/A"
            }));

            const filtered = familiesArray.filter(family =>
                Object.keys(searchData).every(key =>
                    searchData[key].trim() === "" ||
                    (family[key] && family[key].toLowerCase().includes(searchData[key].toLowerCase()))
                )
            );

            console.log("🎯 Filtered Families - Jo criteria match hue vo yeh hain:", filtered);
            setFilteredFamilies(filtered);
        } catch (error) {
            console.error("❌ Error Fetching Families:", error);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Family Form</h2>
            <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Find Family</button>
        </div>
    );
};

export default FamilyForm;
