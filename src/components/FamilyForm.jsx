import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, update, get } from "firebase/database";

const FamilyForm = ({ selectedFamilyId = null, onSelectFamily }) => {
  const [families, setFamilies] = useState([]);
  const [formData, setFormData] = useState({
    headOfFamily: "",
    city: "",
    native: "",
    phone: "",
    address: "",
    ancestors: "",
    members: {},
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedMembers = { ...prev.members };
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, members: updatedMembers };
    });
  };

  const addMember = () => {
    const newKey = Date.now();
    setFormData((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [newKey]: {
          name: "",
          gender: "",
          relationWithHOF: "",
          maritalStatus: "",
          occupation: "",
          birthday: "",
          mobile: "",
          temporaryAddress: "",
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFamilyId) {
        await update(ref(db, `families/${selectedFamilyId}`), {
          ...formData,
          modifiedBy: "currentUserId",
        });
      } else {
        const newFamilyRef = push(ref(db, "families"));
        await update(newFamilyRef, {
          ...formData,
          modifiedBy: "currentUserId",
          id: newFamilyRef.key,
        });
        onSelectFamily(newFamilyRef.key);
      }
      alert("Family data saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving data.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add / Edit Family</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="headOfFamily" value={formData.headOfFamily} onChange={handleChange} placeholder="Head of Family" className="border p-2 rounded" />
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-2 rounded" />
          <input name="native" value={formData.native} onChange={handleChange} placeholder="Native" className="border p-2 rounded" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded col-span-2" />
          <input name="ancestors" value={formData.ancestors} onChange={handleChange} placeholder="Ancestors" className="border p-2 rounded col-span-2" />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Members</h3>
          <button type="button" onClick={addMember} className="mb-2 bg-green-600 text-white px-3 py-1 rounded">+ Add Member</button>
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Gender</th>
                <th className="border p-2">Relation</th>
                <th className="border p-2">Marital</th>
                <th className="border p-2">Occupation</th>
                <th className="border p-2">Birthday</th>
                <th className="border p-2">Mobile</th>
                <th className="border p-2">Temp. Address</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(formData.members).map(([key, member]) => (
                <tr key={key}>
                  <td className="border p-2"><input value={member.name} onChange={(e) => handleMemberChange(key, "name", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.gender} onChange={(e) => handleMemberChange(key, "gender", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.relationWithHOF} onChange={(e) => handleMemberChange(key, "relationWithHOF", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.maritalStatus} onChange={(e) => handleMemberChange(key, "maritalStatus", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.occupation} onChange={(e) => handleMemberChange(key, "occupation", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.birthday} onChange={(e) => handleMemberChange(key, "birthday", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.mobile} onChange={(e) => handleMemberChange(key, "mobile", e.target.value)} className="w-full" /></td>
                  <td className="border p-2"><input value={member.temporaryAddress} onChange={(e) => handleMemberChange(key, "temporaryAddress", e.target.value)} className="w-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Save Family</button>
      </form>
    </div>
  );
};

export default FamilyForm;
