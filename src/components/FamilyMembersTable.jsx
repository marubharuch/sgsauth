import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const FamilyMembersTable = ({ members, onSave, onClose }) => {
  const [editedMembers, setEditedMembers] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedMembers(members);
  }, [members]);

  const handleFieldChange = (memberId, field, value) => {
    setEditedMembers((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(editedMembers);
    setIsEditing(false);
  };

  return (
    <div className="relative overflow-x-auto border border-gray-300 rounded p-4 bg-white">
      {/* Close Icon */}
      <button
  onClick={onClose}
  className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
  title="Close"
>
  <FaTimes size={20} />
</button>


      <table className="w-full table-auto border-collapse mt-2">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Age</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Relation</th>
            <th className="border p-2">Occupation</th>
            <th className="border p-2">Education</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editedMembers).map(([memberId, member]) => (
            <tr key={memberId}>
              <td className="border p-2">{member.id}</td>
              {["name", "age", "gender", "relation", "occupation", "education"].map((field) => (
                <td className="border p-2" key={field}>
                  {isEditing ? (
                    <input
                      type={field === "age" ? "number" : "text"}
                      value={member[field] || ""}
                      onChange={(e) =>
                        handleFieldChange(memberId, field, e.target.value)
                      }
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    member[field] || "-"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right space-x-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Member Changes
          </button>
        ) : null}
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEditing ? "Cancel Edit" : "Edit Mode"}
        </button>
      </div>
    </div>
  );
};

export default FamilyMembersTable;
