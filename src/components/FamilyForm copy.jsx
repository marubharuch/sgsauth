import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, update, get } from "firebase/database";

const FamilyForm = ({ onSelectFamily }) => {
  const [searchData, setSearchData] = useState({ phone: "", headOfFamily: "", native: "", city: "" });
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [formData, setFormData] = useState({
    headOfFamily: "",
    address: "",
    phone: "",
    native: "",
    city: "",
    ancestors: "",
  });

  useEffect(() => {
    if (selectedFamilyId) {
      const familyRef = ref(db, `families/${selectedFamilyId}`);
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

  const handleSearch = () => {
    
    const familiesRef = ref(db, "families");
    get(familiesRef).then((snapshot) => {
      if (snapshot.exists()) {
       console.log('search',snapshot) 
        const families = snapshot.val();
        const allFamilies = Object.entries(families).map(([id, family]) => ({ id, ...family }));
        
        const hasSearchInput = Object.values(searchData).some(value => value.trim() !== "");
        
        const filtered = hasSearchInput
          ? allFamilies.filter(family =>
              Object.keys(searchData).every(key =>
                searchData[key].trim() === "" || 
                (family[key] && family[key].toLowerCase().includes(searchData[key].toLowerCase()))
              )
            )
          : allFamilies;
        
        setFilteredFamilies(filtered);
      } else {
        setFilteredFamilies([]);
      }
    });
  };

  const handleSelectFamily = (id) => {
    setSelectedFamilyId(id);
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
    try {
      if (selectedFamilyId) {
        await update(ref(db, `families/${selectedFamilyId}`), { ...formData, modifiedBy: "currentUserId" });
      } else {
        const newFamilyRef = push(ref(db, "families"));
        await update(newFamilyRef, { ...formData, modifiedBy: "currentUserId", id: newFamilyRef.key });
        setSelectedFamilyId(newFamilyRef.key);
        onSelectFamily(newFamilyRef.key);
      }
      alert("Family saved successfully!");
    } catch (error) {
      console.error("Error saving family:", error);
      alert("Failed to save family.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Search Family</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input name="phone" value={searchData.phone} onChange={handleSearchChange} placeholder="Phone" className="border p-2 rounded" />
        <input name="headOfFamily" value={searchData.headOfFamily} onChange={handleSearchChange} placeholder="Head of Family" className="border p-2 rounded" />
        <input name="native" value={searchData.native} onChange={handleSearchChange} placeholder="Native" className="border p-2 rounded" />
        <input name="city" value={searchData.city} onChange={handleSearchChange} placeholder="City" className="border p-2 rounded" />
      </div>
      <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      {filteredFamilies.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Select a Family</h3>
          <ul className="border rounded-lg p-2">
            {filteredFamilies.map((family) => (
              <li key={family.id} className="p-2 border-b flex justify-between">
                <span>{family.headOfFamily} - {family.phone}</span>
                <button onClick={() => handleSelectFamily(family.id)} className="bg-green-500 text-white px-3 py-1 rounded">Select</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h2 className="text-xl font-semibold mt-6">Family Details</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4">
        <input name="headOfFamily" value={formData.headOfFamily} onChange={handleChange} placeholder="Head of Family" className="border p-2 rounded" />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
        <input name="native" value={formData.native} onChange={handleChange} placeholder="Native" className="border p-2 rounded" />
        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-2 rounded" />
        <input name="ancestors" value={formData.ancestors} onChange={handleChange} placeholder="Ancestors" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
      <button onClick={() => setSelectedFamilyId(null)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Add New Family</button>
    </div>
  );
};

export default FamilyForm;
