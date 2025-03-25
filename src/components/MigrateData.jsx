import { useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const MigrateData = () => {
    const [loading, setLoading] = useState(false);
    const dbRTDB = getDatabase();
    const dbFirestore = getFirestore();

    const copyDataToFirestore = async (dataPath, collectionName, docName) => {
        setLoading(true);
        try {
            const dataRef = ref(dbRTDB, dataPath);
            const dataSnap = await get(dataRef);

            if (!dataSnap.exists()) {
                alert(`No data found in ${dataPath}!`);
                setLoading(false);
                return;
            }

            const data = dataSnap.val();

            await setDoc(doc(dbFirestore, collectionName, docName), {
                [docName]: data,
                timestamp: new Date().toISOString(),
            });

            alert(`${docName} copied to Firestore successfully!`);
        } catch (error) {
            console.error(`Error copying ${docName}:`, error);
            alert(`Error copying ${docName}!`);
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Data Migration</h2>
            <button onClick={() => copyDataToFirestore("families", "migratedData", "families")} disabled={loading} style={buttonStyle}>
                {loading ? "Copying Families..." : "Copy Families to Firestore"}
            </button>
            <button onClick={() => copyDataToFirestore("users", "migratedData", "users")} disabled={loading} style={buttonStyle}>
                {loading ? "Copying Users..." : "Copy Users to Firestore"}
            </button>
            <button onClick={() => copyDataToFirestore("roleHistory", "migratedData", "roleHistory")} disabled={loading} style={buttonStyle}>
                {loading ? "Copying Role History..." : "Copy Role History to Firestore"}
            </button>
        </div>
    );
};

const buttonStyle = {
    margin: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
};

export default MigrateData;
