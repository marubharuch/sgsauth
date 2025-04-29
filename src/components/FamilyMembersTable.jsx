import { useState } from "react";
import { FaPen } from "react-icons/fa";

const FamilyMembersTable = ({ members, onViewChanges, onSave }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editedMembers, setEditedMembers] = useState({ ...members });

  if (!members || typeof members !== "object") return null;
console.log('a',members)
  const handleEditClick = (id) => {
    setEditRowId(id);
  };

  const handleChange = (id, field, value) => {
    setEditedMembers((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(editedMembers);
    setEditRowId(null);
  };

  return (
    <div>
      <table className="w-full border mt-2">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Relation</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Age</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editedMembers).map(([memberId, member]) => {
            const isEditing = memberId === editRowId;
            console.log("member",member)
            return (
              <tr key={memberId}>
                <td>{memberId}</td>
                <td className="border p-2">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={member.name || ""}
                      onChange={(e) => handleChange(memberId, "name", e.target.value)}
                    />
                  ) : (
                    member.name || "-"
                  )}
                </td>
                <td className="border p-2">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={member.relation || ""}
                      onChange={(e) => handleChange(memberId, "relation", e.target.value)}
                    />
                  ) : (
                    member.relation || "-"
                  )}
                </td>
                <td className="border p-2">
                  {isEditing ? (
                    <select
                      className="border p-1 rounded w-full"
                      value={member.gender || ""}
                      onChange={(e) => handleChange(memberId, "gender", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    member.gender || "-"
                  )}
                </td>
                <td className="border p-2">
                  {isEditing ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={member.age || ""}
                      onChange={(e) => handleChange(memberId, "age", e.target.value)}
                    />
                  ) : (
                    member.age || "-"
                  )}
                </td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => handleEditClick(memberId)}
                    className="text-blue-500 hover:underline"
                  >
                    <FaPen size={16} />
                  </button>
                 
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-3 text-right">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default FamilyMembersTable;
