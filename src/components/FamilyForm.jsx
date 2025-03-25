import { useState, useEffect } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { getFirestore, collection, getDocs,doc,getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import localforage from "localforage";

const FamilyForm = ({ onSelectFamily }) => {
    const { user } = useAuth();
    const [userFamilyId, setUserFamilyId] = useState(null);
    const [searchData, setSearchData] = useState({ phone: "", headOfFamily: "", native: "", city: "" });
    const [filteredFamilies, setFilteredFamilies] = useState([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    const [formData, setFormData] = useState({ headOfFamily: "", address: "", phone: "", native: "", city: "", ancestors: "" });
    const dbRTDB = getDatabase();
    const dbFirestore = getFirestore();

    useEffect(() => {
      const fetchUserProfile = async () => {
          if (!user) return;  // ✅ Ensure user exists before proceeding
  
          const userRef = ref(dbRTDB, `users/${user.uid}`);
          const userSnap = await get(userRef);
          
          if (userSnap.exists()) {
              const userData = userSnap.val();
              if (userData.familyId) {
                  setUserFamilyId(userData.familyId);
                  setSelectedFamilyId(userData.familyId);
              }
          }
      };
  
      fetchUserProfile();
  }, [user]);
  

    useEffect(() => {
        if (selectedFamilyId) {
            const familyRef = ref(dbRTDB, `families/${selectedFamilyId}`);
            get(familyRef).then((snapshot) => {
                if (snapshot.exists()) {
                    setFormData(snapshot.val());
                }
            });
        }
    }, [selectedFamilyId]);

    const handleSearchChange = (e) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
    };
//
const handleSearch = async () => {
    try {
        const docRef = doc(dbFirestore, "migratedData", "families"); // Reference to Firestore document
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log("⚠️ No families document found!");
            return;
        }

        const data = docSnap.data();
        console.log("📜 Raw Firestore Data:", data);

        if (!data.families) {
            console.log("⚠️ No 'families' field found in the document!");
            return;
        }

        // Extract `headOfFamily` and `phone` from each family
        const familiesArray = Object.keys(data.families).map(key => ({
            id: key, // Unique ID of each family
            headOfFamily: data.families[key].headOfFamily || "Unknown",
            phone: data.families[key].phone || "N/A"
        }));

        console.log("✅ Families Array:", familiesArray);

        // ✅ Apply filter based on user input
        const filtered = familiesArray.filter(family =>
            Object.keys(searchData).every(key =>
                searchData[key].trim() === "" || // Ignore empty fields
                (family[key] && family[key].toLowerCase().includes(searchData[key].toLowerCase()))
            )
        );

        // ✅ Update state to show results
        setFilteredFamilies(filtered);
    } catch (error) {
        console.error("❌ Error fetching families:", error);
    }
};

//
    const handleSelectFamily = async (id) => {
      console.log("handle select family")
        setSelectedFamilyId(id);
        await update(ref(dbRTDB, `users/${user.uid}`), { familyId: id });
        onSelectFamily(id);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.headOfFamily || !formData.address) {
            alert("Head of Family and Address are required.");
            return;
        }

        const userId = user?.uid || "unknown_user";
        await update(ref(dbRTDB, `users/${userId}`), { familyId: selectedFamilyId });
        alert("Family saved successfully!");
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-2xl mx-auto">
            {userFamilyId ? (
                <>
                    <h2 className="text-xl font-semibold mb-4">Your Family Details</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4">
                        <input name="headOfFamily" value={formData.headOfFamily} onChange={handleChange} placeholder="Head of Family" className="border p-2 rounded" />
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
                        <input name="native" value={formData.native} onChange={handleChange} placeholder="Native" className="border p-2 rounded" />
                        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-2 rounded" />
                        <input name="ancestors" value={formData.ancestors} onChange={handleChange} placeholder="Ancestors" className="border p-2 rounded" />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
                    </form>
                </>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-4">No Family Linked</h2>
                    <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Find Family</button>
                    <button onClick={() => setSelectedFamilyId(null)} className="bg-green-600 text-white px-4 py-2 rounded">Add New Family</button>
                    {filteredFamilies.length > 0 && (
    <div className="mt-4">
        <h3 className="text-lg font-semibold">Search Results</h3>
        <ul>
            {filteredFamilies.map(family => (
                <li 
                    key={family.id} 
                    className="p-2 border rounded mt-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectFamily(family.id)}
                >
                    {family.headOfFamily} - {family.phone}
                </li>
            ))}
        </ul>
    </div>
)}

                
                
                
                </>
            )}
        </div>
    );
};

export default FamilyForm;
