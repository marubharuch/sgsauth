import React, { useState, useEffect } from 'react';

const LocalStorageViewer = () => {
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    const fetchData = () => {
      let data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      setStorageData(data);
    };
    
    fetchData();
  }, []);

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">Local Storage Data</h2>
      {Object.keys(storageData).length > 0 ? (
        <ul className="list-disc pl-4">
          {Object.entries(storageData).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found in localStorage.</p>
      )}
    </div>
  );
};

export default LocalStorageViewer;
