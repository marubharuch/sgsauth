import { useState, useEffect } from "react";
import localforage from "localforage";
import EditFamilyModal from "./EditFamilyModal";
import FamilyMembersTable from "./FamilyMembersTable";

const FamiliesTable = () => {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [nativeFilter, setNativeFilter] = useState("");
  const [editingFamily, setEditingFamily] = useState(null);
  const [selectedToDelete, setSelectedToDelete] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [diffData, setDiffData] = useState(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const storedData = await localforage.getItem("migratedData");
        const familyObj = storedData?.families?.families || {};
        const familyArray = Object.values(familyObj);
        setFamilies(familyArray);
        setFilteredFamilies(familyArray);
      } catch (error) {
        console.error("Error loading families from localForage:", error);
      }
    };

    fetchFamilies();
  }, []);

  useEffect(() => {
    let filtered = families;
    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.head?.toLowerCase().includes(search.toLowerCase()) ||
          f.address?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (nativeFilter) {
      filtered = filtered.filter((f) => f.native === nativeFilter);
    }
    setFilteredFamilies(filtered);
  }, [search, nativeFilter, families]);

  const handleSave = async (updatedFamily) => {
    const updatedFamilies = families.map((fam) =>
      fam.id === updatedFamily.id ? updatedFamily : fam
    );
    setFamilies(updatedFamilies);
    setFilteredFamilies(updatedFamilies);
    setEditingFamily(null);

    try {
      const existingData = await localforage.getItem("migratedData");
      const allFamilies = existingData?.families?.families || {};
      const original = allFamilies[updatedFamily.id];

      const diffs = {};
      // Family fields comparison
      Object.keys(updatedFamily).forEach((key) => {
        if (key !== "members" && JSON.stringify(updatedFamily[key]) !== JSON.stringify(original?.[key])) {
          diffs[key] = {
            old: original?.[key],
            new: updatedFamily[key],
          };
        }
      });

      // Member fields comparison
      const memberDiffs = {};
      if (original?.members) {
        Object.entries(updatedFamily.members || {}).forEach(([memberId, member]) => {
          const originalMember = original.members?.[memberId];
          if (!originalMember) return;

          const singleMemberDiff = {};
          Object.keys(member).forEach((k) => {
            if (JSON.stringify(member[k]) !== JSON.stringify(originalMember[k])) {
              singleMemberDiff[k] = {
                old: originalMember[k],
                new: member[k],
              };
            }
          });

          if (Object.keys(singleMemberDiff).length > 0) {
            memberDiffs[memberId] = {
              id: memberId,
              name: member.name,
              ...singleMemberDiff,
            };
          }
        });
      }

      if (Object.keys(diffs).length > 0 || Object.keys(memberDiffs).length > 0) {
        const history = (await localforage.getItem("editedHistory")) || {};
        history[updatedFamily.id] = {
          id: updatedFamily.id,
          head: updatedFamily.head,
          ...(Object.keys(diffs).length > 0 ? diffs : {}),
          ...(Object.keys(memberDiffs).length > 0 ? { members: memberDiffs } : {}),
        };
        await localforage.setItem("editedHistory", history);
      }

      // Update the main migratedData
      allFamilies[updatedFamily.id] = updatedFamily;
      const newData = {
        ...existingData,
        families: { families: allFamilies },
      };
      await localforage.setItem("migratedData", newData);
    } catch (err) {
      console.error("Error updating localForage:", err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedToDelete.size === 0) return;

    const remainingFamilies = families.filter(f => !selectedToDelete.has(f.id));
    const remainingFamilyMap = remainingFamilies.reduce((acc, fam) => {
      acc[fam.id] = fam;
      return acc;
    }, {});

    try {
      const existingData = await localforage.getItem("migratedData");
      const newData = {
        ...existingData,
        families: { families: remainingFamilyMap },
      };
      await localforage.setItem("migratedData", newData);
      setFamilies(remainingFamilies);
      setFilteredFamilies(remainingFamilies);
      setSelectedToDelete(new Set());
    } catch (err) {
      console.error("Error deleting families from localForage:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedToDelete((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const getFamilyChanges = async (familyId) => {
    const fullHistory = await localforage.getItem("editedHistory");  // your API or localForage fetch
    if (fullHistory && fullHistory[familyId]) {
      setDiffData(fullHistory[familyId]); // only that family
    } else {
      alert("No changes found for this family");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Families Data</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Head or Address"
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded w-1/4"
          value={nativeFilter}
          onChange={(e) => setNativeFilter(e.target.value)}
        >
          <option value="">Filter by Native</option>
          {[...new Set(families.map((f) => f.native).filter(Boolean))].map(
            (native) => (
              <option key={native} value={native}>
                {native}
              </option>
            )
          )}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setSearch("");
            setNativeFilter("");
            setFilteredFamilies(families);
          }}
        >
          Show All
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Select</th>
              <th className="border p-2">Head of Family</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Native</th>
              <th className="border p-2">Created By</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFamilies.length > 0 ? (
              filteredFamilies.map((family) => (
                <>
                  <tr key={family.id} className="hover:bg-gray-100">
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedToDelete.has(family.id)}
                        onChange={() => toggleSelect(family.id)}
                      />
                    </td>
                    <td className="border p-2">{family.head || "-"}</td>
                    <td className="border p-2">{family.address || "-"}</td>
                    <td className="border p-2">{family.native || "-"}</td>
                    <td className="border p-2">{family.createdBy || "-"}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => setEditingFamily(family)}
                        className="text-blue-500 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleExpandRow(family.id)}
                        className="text-green-600 hover:underline mr-2"
                      >
                        {expandedRows.has(family.id) ? "-" : "+"}
                      </button>
                      <button
                        onClick={() => getFamilyChanges(family.id)}
                        className="text-purple-500 hover:underline"
                      >
                        View Changes
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(family.id) && family.members && (
                    <tr>
                      <td colSpan="6" className="border p-2 bg-gray-50">
                        <FamilyMembersTable
                          familyId={family.id}
                          members={family.members}
                          onViewChanges={(memberId) => getFamilyChanges(family.id)}
                          onSave={(editedMembers) => {
                            const updatedFamily = { ...family, members: editedMembers };
                            handleSave(updatedFamily);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingFamily && (
        <EditFamilyModal
          family={editingFamily}
          onSave={handleSave}
          onClose={() => setEditingFamily(null)}
        />
      )}
{diffData && (
  
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl max-w-lg w-full">
{console.log("diffData:", diffData)}
      <h3 className="text-xl font-bold text-purple-600 mb-4">
        Changes for: {diffData.head} ({diffData.id})
      </h3>

      <ul className="space-y-2">
  {Object.entries(diffData).map(([key, value]) => {
    if (key === "id" || key === "members") return null;
    if (typeof value === "object" && value.old !== undefined && value.new !== undefined) {
      return (
        <li key={key} className="border p-2 rounded">
          <strong>{key}:</strong><br />
          <span className="text-red-600">Old:</span> {String(value.old)} <br />
          <span className="text-green-600">New:</span> {String(value.new)}
        </li>
      );
    }
    return null;
  })}
</ul>


      {/* show member changes safely */}
      {!!diffData.members && Object.keys(diffData.members ?? {}).length > 0 && (
        <>
          <h4 className="text-lg font-bold mt-4">Member Changes:</h4>
          {Object.entries(diffData.members ?? {}).map(([memberId, memberChanges]) => (
            <div key={memberId} className="border p-3 rounded mt-2">
              <h5 className="font-semibold">
                Member ID: {memberId}
              </h5>
              <ul className="mt-1 space-y-1">
                {Object.entries(memberChanges ?? {}).map(([field, changes]) => {
                  if (field === "id") return null;
                  if (typeof changes === "object" && changes.old !== undefined && changes.new !== undefined) {
                    return (
                      <li key={field}>
                        <strong>{field}:</strong><br />
                        <span className="text-red-600">Old:</span> {String(changes.old)}<br />
                        <span className="text-green-600">New:</span> {String(changes.new)}
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          ))}
        </>
      )}

      <button
        onClick={() => setDiffData(null)}
        className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Close
      </button>

    </div>
  </div>
)}


   
    </div>
  );
};

export default FamiliesTable;
