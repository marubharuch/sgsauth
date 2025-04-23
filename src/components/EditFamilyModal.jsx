import { useState, useEffect } from "react";

const EditFamilyModal = ({ family, onSave, onClose }) => {
  const [formData, setFormData] = useState(family || {});
console.log("family",family)
  useEffect(() => {
    setFormData(family || {});
  }, [family]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.headOfFamily) return alert("Head of Family is required.");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Family</h2>
        
        <input
          type="text"
          name="headOfFamily"
          value={formData.headOfFamily || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-2"
          placeholder="Head of Family"
        />

        <input
          type="text"
          name="city"
          value={formData.city || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-2"
          placeholder="City"
        />

        <input
          type="text"
          name="native"
          value={formData.native || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-2"
          placeholder="Native"
        />

        <input
          type="text"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 mb-4"
          placeholder="Phone"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFamilyModal;
