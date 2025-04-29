import { useState, useEffect } from "react";
import localforage from "localforage";

const FamiliesTable = () => {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [nativeFilter, setNativeFilter] = useState("");

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const storedData = await localforage.getItem("migratedData");
        console.log("Fetched from localForage:", storedData); // Debugging log

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

  // 🔍 Filter logic
  useEffect(() => {
    let filtered = families;

    if (search) {
      filtered = filtered.filter(
        (family) =>
          family.headOfFamily.toLowerCase().includes(search.toLowerCase()) ||
          family.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (nativeFilter) {
      filtered = filtered.filter((family) => family.native === nativeFilter);
    }

    setFilteredFamilies(filtered);
  }, [search, nativeFilter, families]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Families- Data</h2>

      {/* 🔍 Search Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Head of Family or City"
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 🔽 Native Filter Dropdown */}
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

        {/* 🔄 Show All Button */}
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
      </div>

      {/* 📊 Families Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Head of Family</th>
              <th className="border p-2">City</th>
              <th className="border p-2">Native</th>
              <th className="border p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredFamilies.length > 0 ? (
              filteredFamilies.map((family, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border p-2">{family.headOfFamily || "-"}</td>
                  <td className="border p-2">{family.city || "-"}</td>
                  <td className="border p-2">{family.native || "-"}</td>
                  <td className="border p-2">{family.phone || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FamiliesTable;
