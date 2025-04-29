import React from "react";

const EditedHistoryViewer = ({ history, onClose }) => {
  if (!history) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
      <div className="bg-white p-6 rounded-xl max-w-4xl w-full">
        <h3 className="text-2xl font-bold text-purple-600 mb-6">
          Edited Families History
        </h3>

        {Object.values(history).map((family) => (
          <div key={family.id} className="mb-6 border-b pb-4">
            {/* Show head (with diff if available) */}
            <h4 className="text-lg font-semibold text-blue-700">
              {typeof family.head === "object"
                ? `${family.head.old || ""} → ${family.head.new || ""}`
                : family.head || "No Head"}{" "}
              ({family.id})
            </h4>

            {/* Show changed fields (excluding id/head/members) */}
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

            {/* Show member-level changes if present */}
            {!!family.members && Object.keys(family.members).length > 0 && (
  <>
    <h5 className="text-md font-bold mt-4">Member Changes:</h5>
    {Object.entries(family.members).map(([memberId, memberChanges]) => (
      <div
        key={memberId}
        className="border p-3 rounded mt-2 bg-gray-50"
      >
        <h6 className="font-semibold">
          Member ID: {memberId}
        </h6>
        <ul className="mt-1 space-y-1">
          {Object.entries(memberChanges).map(([field, changes]) => {
            if (field === "id") return null;

            // If it's a diff object (like { old, new })
            if (typeof changes === "object" && (changes.old !== undefined || changes.new !== undefined)) {
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

            // Else fallback (shouldn't happen but safe)
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

        <div className="flex justify-end mt-6">
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
