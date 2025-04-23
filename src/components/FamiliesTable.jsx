import { useState, useEffect } from "react";
import localforage from "localforage";
import { ref, set,update, } from "firebase/database";
import { db } from "../firebase";
import EditFamilyModal from "./EditFamilyModal"; // Import your modal component

const FamiliesTable = () => {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [nativeFilter, setNativeFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedFamily, setSelectedFamily] = useState(null); // For modal data
  const [editedFamilyIds, setEditedFamilyIds] = useState([]); // Track edited families

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const storedData = await localforage.getItem("migratedData");
        console.log("Fetched from localForage:", storedData);

        if (storedData?.families?.families) {
          const familyArray = Object.values(storedData.families.families);
          setFamilies(familyArray);
          setFilteredFamilies(familyArray);
        }
      } catch (error) {
        console.error("Error fetching families from localForage:", error);
      }
    };

    fetchFamilies();
  }, []);

  useEffect(() => {
    let filtered = families;

    if (search) {
      filtered = filtered.filter(
        (family) =>
          family.headOfFamily?.toLowerCase().includes(search.toLowerCase()) ||
          family.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (nativeFilter) {
      filtered = filtered.filter((family) => family.native === nativeFilter);
    }

    setFilteredFamilies(filtered);
  }, [search, nativeFilter, families]);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSave = async (updatedFamily) => {
    const updatedFamilies = families.map((fam) =>
      fam.id === updatedFamily.id ? updatedFamily : fam
    );
    setFamilies(updatedFamilies);
    setFilteredFamilies(updatedFamilies);
    setSelectedFamily(null);
  
    try {
      const storedData = await localforage.getItem("migratedData");
      const editsLog = (await localforage.getItem("editedFamiliesLog")) || {};
  
      if (
        storedData &&
        storedData.families &&
        storedData.families.families &&
        updatedFamily.id
      ) {
        const oldFamily = storedData.families.families[updatedFamily.id];
        storedData.families.families[updatedFamily.id] = {
          ...oldFamily,
          ...updatedFamily,
        };
  
        await localforage.setItem("migratedData", storedData);
  
        editsLog[updatedFamily.id] = {
          before: oldFamily,
          after: updatedFamily,
        };
        await localforage.setItem("editedFamiliesLog", editsLog);
  
        if (!editedFamilyIds.includes(updatedFamily.id)) {
          setEditedFamilyIds([...editedFamilyIds, updatedFamily.id]);
        }
      }
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };
  
  const handleSyncToRTDB = async () => {
    try {
      const editsLog = await localforage.getItem("editedFamiliesLog");
      if (!editsLog || editedFamilyIds.length === 0) return;
  
      const summaryLines = [];
  
      // Collect changes for each edited family
      const changesPerFamily = {};
  
      for (const id of editedFamilyIds) {
        const { before, after } = editsLog[id];
        const changedFields = {};
  
        const compareFields = (obj1, obj2, path = "") => {
          for (const key in obj2) {
            const fullPath = path ? `${path}/${key}` : key;
            const val1 = obj1?.[key];
            const val2 = obj2?.[key];
  
            if (typeof val2 === "object" && val2 !== null && !Array.isArray(val2)) {
              compareFields(val1 || {}, val2, fullPath);
            } else {
              if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                changedFields[fullPath] = val2;
              }
            }
          }
        };
  
        compareFields(before, after);
  
        if (Object.keys(changedFields).length > 0) {
          changesPerFamily[id] = changedFields;
  
          summaryLines.push(`Family ID: ${id}`);
          for (const fieldPath in changedFields) {
            const oldValue = fieldPath.split("/").reduce((obj, k) => obj?.[k], before);
            const newValue = changedFields[fieldPath];
            summaryLines.push(`  ${fieldPath}: "${oldValue}" → "${newValue}"`);
          }
          summaryLines.push(""); // empty line between families
        }
      }
  
      if (summaryLines.length === 0) {
        alert("No actual changes to sync.");
        return;
      }
  
      const confirmText = `Are you sure you want to upload the following changes?\n\n${summaryLines.join("\n")}`;
      const confirmed = window.confirm(confirmText);
      if (!confirmed) return;
  
      // Push changes to RTDB using `update`
      for (const id in changesPerFamily) {
        const updates = {};
        for (const path in changesPerFamily[id]) {
          updates[`families/${id}/${path}`] = changesPerFamily[id][path];
        }
  
        await update(ref(db), updates);
        console.log(`Updated ${id} with changes:`, updates);
      }
  
      alert("Only changed fields synced to Firebase RTDB.");
      await localforage.removeItem("editedFamiliesLog");
      setEditedFamilyIds([]);
    } catch (error) {
      console.error("Error syncing to RTDB:", error);
      alert("Sync failed. See console for details.");
    }
  };
  
  
  
  

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Families Data</h2>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Head of Family or City"
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
          {Array.from(new Set(families.map((f) => f.native)))
            .filter(Boolean)
            .map((native) => (
              <option key={native} value={native}>
                {native}
              </option>
            ))}
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
          className="bg-green-600 text-white px-4 py-2 rounded ml-auto"
          onClick={handleSyncToRTDB}
          disabled={editedFamilyIds.length === 0}
        >
          Upload Changes to RTDB
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Expand</th>
              <th className="border p-2">Head of Family</th>
              <th className="border p-2">City</th>
              <th className="border p-2">Native</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredFamilies.length > 0 ? (
              filteredFamilies.map((family, index) => (
                <>
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => toggleRow(index)}
                        className="text-blue-600 font-bold"
                      >
                        {expandedRows[index] ? "−" : "+"}
                      </button>
                    </td>
                    <td className="border p-2">{family.headOfFamily || "-"}</td>
                    <td className="border p-2">{family.city || "-"}</td>
                    <td className="border p-2">{family.native || "-"}</td>
                    <td className="border p-2">{family.phone || "-"}</td>
                    <td className="border p-2">
                      <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => setSelectedFamily(family)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Member Table */}
                  {expandedRows[index] && family.members && (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <div className="p-4 bg-gray-50">
                          <h4 className="font-semibold mb-2">Members:</h4>
                          <table className="w-full text-sm border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Gender</th>
                                <th className="border p-2">Relation</th>
                                <th className="border p-2">Marital Status</th>
                                <th className="border p-2">Occupation</th>
                                <th className="border p-2">Birthday</th>
                                <th className="border p-2">Mobile</th>
                                <th className="border p-2">Temporary Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(family.members).map((member, i) => (
                                <tr key={i}>
                                  <td className="border p-2">{member.name || "-"}</td>
                                  <td className="border p-2">{member.gender || "-"}</td>
                                  <td className="border p-2">{member.relationWithHOF || "-"}</td>
                                  <td className="border p-2">{member.maritalStatus || "-"}</td>
                                  <td className="border p-2">{member.occupation || "-"}</td>
                                  <td className="border p-2">{member.birthday || "-"}</td>
                                  <td className="border p-2">{member.mobile || "-"}</td>
                                  <td className="border p-2">{member.temporaryAddress || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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

      {/* Modal */}
      {selectedFamily && (
        <EditFamilyModal
          family={selectedFamily}
          onSave={handleSave}
          onClose={() => setSelectedFamily(null)}
        />
      )}
    </div>
  );
};

export default FamiliesTable;