import React, { useState, useEffect } from "react";

const EditFamilyModal = ({ family, onSave, onClose }) => {
  const [formData, setFormData] = useState({ ...family });

  useEffect(() => {
    setFormData({ ...family });
  }, [family]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedData = {
      ...formData,
      head: formData.head?.trim(),
      address: formData.address?.trim(),
      native: formData.native?.trim(),
      createdBy: formData.createdBy?.trim(),
    };

    if (!trimmedData.head) {
      alert("Head of Family is required.");
      return;
    }

    try {
      onSave(trimmedData);
      onClose();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Error while saving changes.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Family</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            value={formData.id || ""}
            disabled
            className="w-full border rounded p-2 mb-2 bg-gray-100 text-gray-600"
            placeholder="ID"
          />

          <input
            type="text"
            name="head"
            value={formData.head || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-2"
            placeholder="Head of Family"
            required
          />

          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-2"
            placeholder="Address"
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
            name="createdBy"
            value={formData.createdBy || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-4"
            placeholder="Created By"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFamilyModal;
