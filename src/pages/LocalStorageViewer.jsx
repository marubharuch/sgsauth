import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

const LocalStorageViewer = () => {
  const [localData, setLocalData] = useState({});
  const [forageData, setForageData] = useState({});

  // Load data from both sources
  useEffect(() => {
    const fetchData = async () => {
      const local = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        local[key] = localStorage.getItem(key);
      }
      setLocalData(local);

      const forage = {};
      await localforage.iterate((value, key) => {
        forage[key] = value;
      });
      setForageData(forage);
    };

    fetchData();
  }, []);

  // Delete from localStorage
  const deleteLocalItem = (key) => {
    localStorage.removeItem(key);
    setLocalData((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Delete from localForage
  const deleteForageItem = async (key) => {
    await localforage.removeItem(key);
    setForageData((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <div className="p-4 border rounded shadow-md max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">🔐 Storage Data Viewer</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LocalStorage Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">🧱 localStorage</h3>
          {Object.keys(localData).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(localData).map(([key, value]) => (
                <li key={key} className="border p-2 rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <strong>{key}:</strong>
                      <pre className="whitespace-pre-wrap text-sm">{value}</pre>
                    </div>
                    <button
                      onClick={() => deleteLocalItem(key)}
                      className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No data in localStorage.</p>
          )}
        </div>

        {/* LocalForage Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📦 localForage</h3>
          {Object.keys(forageData).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(forageData).map(([key, value]) => (
                <li key={key} className="border p-2 rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <strong>{key}:</strong>
                      <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(value, null, 2)}</pre>
                    </div>
                    <button
                      onClick={() => deleteForageItem(key)}
                      className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No data in localForage.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalStorageViewer;
