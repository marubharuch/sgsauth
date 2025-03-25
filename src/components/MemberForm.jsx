import { useState } from "react";
import { db } from "../firebase";
import { ref, push, update } from "firebase/database";

const MemberForm = ({ familyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    gender: "",
    relationWithHOF: "",
    maritalStatus: "",
    education: "",
    occupation: "",
    mobile: "",
    temporaryAddress: "",
  });

  const [age, setAge] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "birthday") {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      setAge(currentYear - birthYear);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthday || !formData.gender || !formData.relationWithHOF) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const membersRef = push(ref(db, `families/${familyId}/members`));
      await update(membersRef, { ...formData, modifiedBy: "currentUserId" });
      alert("Member added successfully!");
      setFormData({
        name: "",
        birthday: "",
        gender: "",
        relationWithHOF: "",
        maritalStatus: "",
        education: "",
        occupation: "",
        mobile: "",
        temporaryAddress: "",
      });
      setAge(null);
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Failed to save member.");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Add/Edit Family Member</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input w-full" required />
        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="input w-full" required />

        <select name="gender" value={formData.gender} onChange={handleChange} className="input w-full" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input name="relationWithHOF" value={formData.relationWithHOF} onChange={handleChange} placeholder="Relation with Head of Family" className="input w-full" required />

        {age !== null && age > 18 && (
          <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="input w-full">
            <option value="">Marital Status</option>
            <option value="Married">Married</option>
            <option value="Unmarried">Unmarried</option>
            <option value="Engaged">Engaged</option>
            <option value="Want to marry">Want to marry</option>
            <option value="Don't want to marry now">Don't want to marry now</option>
          </select>
        )}

        <input name="education" value={formData.education} onChange={handleChange} placeholder="Education" className="input w-full" />

        {age !== null && age > 18 && formData.gender !== "Female" && formData.relationWithHOF !== "Daughter" && formData.relationWithHOF !== "Granddaughter" && (
          <select name="occupation" value={formData.occupation} onChange={handleChange} className="input w-full">
            <option value="">Select Occupation</option>
            <option value="Student">Student</option>
            <option value="Service">Service</option>
            <option value="Business">Business</option>
            <option value="Housewife">Housewife</option>
          </select>
        )}

        <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="input w-full" />
        <input name="temporaryAddress" value={formData.temporaryAddress} onChange={handleChange} placeholder="Temporary Address" className="input w-full" />

        <button type="submit" className="btn w-full">Save</button>
      </form>
    </div>
  );
};

export default MemberForm;
