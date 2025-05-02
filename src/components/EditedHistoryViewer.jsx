import React from "react";
import { db } from "../firebase";
import { ref, push, update } from "firebase/database";
import localforage from "localforage"


const EditedHistoryViewer = ({ history, onClose, onClearHistory, }) => {
  if (!history) return null;

  const handleAppendToServer = async () => {
    try {
      // 1. Push to edit history log
      const serverRef = ref(db, "editedHistoryLogs");
      await push(serverRef, {
        timestamp: Date.now(),
        data: history,
      });

      // 2. Prepare updates for families
      const updates = {};
      for (const [familyId, changes] of Object.entries(history)) {
        const familyPath = `families/${familyId}`;

        // Direct fields (like head, native)
        for (const [key, value] of Object.entries(changes)) {
          if (["id", "members"].includes(key)) continue;

          const newValue =
            typeof value === "object" && value.new !== undefined
              ? value.new
              : value;

          updates[`${familyPath}/${key}`] = newValue;
        }

        // Member updates
        if (changes.members) {
          for (const [memberId, memberChanges] of Object.entries(changes.members)) {
            const memberPath = `${familyPath}/members/${memberId}`;

            for (const [field, value] of Object.entries(memberChanges)) {
              if (field === "id") continue;

              const newValue =
                typeof value === "object" && value.new !== undefined
                  ? value.new
                  : value;

              updates[`${memberPath}/${field}`] = newValue;
            }
          }
        }
      }

      // 3. Apply updates to families node
      await update(ref(db), updates);

      alert("Changes successfully appended to server and families updated!");
      if (onClearHistory) onClearHistory();
      await localforage.removeItem("editedHistory");
      // ✅ Close modal
      onClose();
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to update Firebase.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
      <div className="bg-white p-6 rounded-xl max-w-4xl w-full">
        <h3 className="text-2xl font-bold text-purple-600 mb-6">
          Edited Families History
        </h3>

        {Object.values(history).map((family) => (
          <div key={family.id} className="mb-6 border-b pb-4">
            <h4 className="text-lg font-semibold text-blue-700">
              {typeof family.head === "object"
                ? `${family.head.old || ""} → ${family.head.new || ""}`
                : family.head || "No Head"}{" "}
              ({family.id})
            </h4>

            {Object.entries(family)
              .filter(([key]) => !["id", "head", "members"].includes(key))
              .length > 0 && (
              <ul className="space-y-2 mt-2">
                {Object.entries(family).map(([key, value]) => {
                  if (["id", "head", "members"].includes(key)) return null;

                  if (typeof value === "object") {
                    return (
                      <li key={key} className="border p-2 rounded">
                        <strong>{key}:</strong><br />
                        {value.old !== undefined && (
                          <>
                            <span className="text-red-600">Old:</span>{" "}
                            {String(value.old)}
                            <br />
                          </>
                        )}
                        {value.new !== undefined && (
                          <>
                            <span className="text-green-600">New:</span>{" "}
                            {String(value.new)}
                          </>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={key} className="border p-2 rounded">
                      <strong>{key}:</strong> {String(value)}
                    </li>
                  );
                })}
              </ul>
            )}

            {!!family.members && Object.keys(family.members).length > 0 && (
              <>
                <h5 className="text-md font-bold mt-4">Member Changes:</h5>
                {Object.entries(family.members).map(([memberId, memberChanges]) => (
                  <div key={memberId} className="border p-3 rounded mt-2 bg-gray-50">
                    <h6 className="font-semibold">Member ID: {memberId}</h6>
                    <ul className="mt-1 space-y-1">
                      {Object.entries(memberChanges).map(([field, changes]) => {
                        if (field === "id") return null;

                        if (
                          typeof changes === "object" &&
                          (changes.old !== undefined || changes.new !== undefined)
                        ) {
                          return (
                            <li key={field}>
                              <strong>{field}:</strong><br />
                              {changes.old !== undefined && (
                                <>
                                  <span className="text-red-600">Old:</span>{" "}
                                  {String(changes.old)}<br />
                                </>
                              )}
                              {changes.new !== undefined && (
                                <>
                                  <span className="text-green-600">New:</span>{" "}
                                  {String(changes.new)}
                                </>
                              )}
                            </li>
                          );
                        }

                        return (
                          <li key={field}>
                            <strong>{field}:</strong> {String(changes)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={handleAppendToServer}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Append to Server
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditedHistoryViewer;
