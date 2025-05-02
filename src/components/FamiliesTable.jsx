import { useState, useEffect } from "react";
import localforage from "localforage";
import EditFamilyModal from "./EditFamilyModal";
import FamilyMembersTable from "./FamilyMembersTable";
import EditedHistoryViewer from "./EditedHistoryViewer";

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
        console.log("Fetched data from localForage:", storedData);
        const familyObj = storedData?.families?.families || {};
        const familyArray = Object.values(familyObj);
        console.log("Converted family object to array:", familyArray);
        setFamilies(familyArray);
        setFilteredFamilies(familyArray);
      } catch (error) {
        console.error("Error loading families from localForage:", error);
      }
    };

    fetchFamilies();
  }, []);

  useEffect(() => {
    console.log("Search or nativeFilter changed:", { search, nativeFilter });
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
    console.log("Filtered families after search/native:", filtered);
    setFilteredFamilies(filtered);
  }, [search, nativeFilter, families]);

  const handleSave = async (updatedFamily) => {
    console.log("Saving family:", updatedFamily);
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
      console.log("Original family for comparison:", original);

      const diffs = {};
      Object.keys(updatedFamily).forEach((key) => {
        if (
          key !== "members" &&
          JSON.stringify(updatedFamily[key]) !== JSON.stringify(original?.[key])
        ) {
          diffs[key] = {
            old: original?.[key] ?? null,
            new: updatedFamily[key],
          };
        }
      });

      const memberDiffs = {};
      if (original?.members) {
        Object.entries(updatedFamily.members || {}).forEach(([memberId, member]) => {
          const originalMember = original.members?.[memberId];
          if (!originalMember) return;

          const singleMemberDiff = {};
          Object.keys(member).forEach((k) => {
            if (JSON.stringify(member[k]) !== JSON.stringify(originalMember[k])) {
              singleMemberDiff[k] = {
                old: originalMember[k] ?? null,
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

      console.log("Family diffs:", diffs);
      console.log("Member diffs:", memberDiffs);

      if (Object.keys(diffs).length > 0 || Object.keys(memberDiffs).length > 0) {
        const history = (await localforage.getItem("editedHistory")) || {};
        const existing = history[updatedFamily.id] || { id: updatedFamily.id };

        Object.entries(diffs).forEach(([key, value]) => {
          existing[key] = value;
        });

        if (Object.keys(memberDiffs).length > 0) {
          existing.members = existing.members || {};
          Object.entries(memberDiffs).forEach(([memberId, changes]) => {
            existing.members[memberId] = {
              ...(existing.members[memberId] || {}),
              ...changes,
            };
          });
        }

        history[updatedFamily.id] = existing;
        await localforage.setItem("editedHistory", history);
        console.log("Updated editedHistory:", history);
      }

      allFamilies[updatedFamily.id] = updatedFamily;
      const newData = {
        ...existingData,
        families: { families: allFamilies },
      };
      await localforage.setItem("migratedData", newData);
      console.log("Updated migratedData:", newData);
    } catch (err) {
      console.error("Error updating localForage:", err);
    }
  };

  const handleMemberSave = (familyId, updatedMembers) => {
    console.log("Saving members for family:", familyId, updatedMembers);
    const family = families.find((f) => f.id === familyId);
    if (!family) return;

    const updatedFamily = {
      ...family,
      members: {
        ...family.members,
        ...updatedMembers,
      },
    };

    handleSave(updatedFamily);
  };

  const handleDeleteSelected = async () => {
    if (selectedToDelete.size === 0) return;

    console.log("Deleting selected families:", selectedToDelete);

    const remainingFamilies = families.filter((f) => !selectedToDelete.has(f.id));
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
      console.log("Deleted families successfully. New data:", newData);
    } catch (err) {
      console.error("Error deleting families from localForage:", err);
    }
  };

  const toggleSelect = (id) => {
    console.log("Toggling select for ID:", id);
    setSelectedToDelete((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleExpandRow = (id) => {
    console.log("Toggling row expand for ID:", id);
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const getFamilyChanges = async (familyId) => {
    console.log("Fetching changes for family ID:", familyId);
    const fullHistory = await localforage.getItem("editedHistory");
    if (fullHistory && fullHistory[familyId]) {
      setDiffData(fullHistory[familyId]);
      console.log("Family change data:", fullHistory[familyId]);
    } else {
      alert("No changes found for this family");
    }
  };

  const handleViewAllChanges = async () => {
    console.log("Fetching all edited history");
    const fullHistory = await localforage.getItem("editedHistory");
    if (fullHistory && Object.keys(fullHistory).length > 0) {
      setDiffData(fullHistory);
      console.log("All family change history:", fullHistory);
    } else {
      alert("No changes found");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Families Data</h2>
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        onClick={handleViewAllChanges}
      >
        View All Changes
      </button>

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
          {[...new Set(families.map((f) => f.native).filter(Boolean))].map((native) => (
            <option key={native} value={native}>
              {native}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            console.log("Reset filters");
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
                        onClick={() => {
                          console.log("Editing family:", family);
                          setEditingFamily(family);
                        }}
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
                    </td>
                  </tr>
                  {expandedRows.has(family.id) && family.members && (
                    <tr>
                      <td colSpan="6" className="border p-2 bg-gray-50">
                        <FamilyMembersTable
                          familyId={family.id}
                          members={family.members}
                          onViewChanges={() => getFamilyChanges(family.id)}
                          onSave={(editedMembers) => {
                            console.log("Saving edited members:", editedMembers);
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
                <td colSpan="6" className="text-center p-4">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingFamily && (
        <EditFamilyModal
          family={editingFamily}
          onSave={handleSave}
          onClose={() => {
            console.log("Closing edit modal");
            setEditingFamily(null);
          }}
        />
      )}
      {diffData && (
        <EditedHistoryViewer
          history={diffData}
          onClose={() => {
            console.log("Closing diff viewer");
            setDiffData(null);
          }}
          onClearHistory={() => setDiffData(null)}

        />
      )}
    </div>
  );
};

export default FamiliesTable;
