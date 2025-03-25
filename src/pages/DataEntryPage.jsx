// src/pages/DataEntryPage.jsx
import { useState } from "react";
import FamilyForm from "../components/FamilyForm";
import MemberForm from "../components/MemberForm";

const DataEntryPage = () => {
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Family & Member Management</h1>
      <FamilyForm onSelectFamily={setSelectedFamilyId} />
      {selectedFamilyId && <MemberForm familyId={selectedFamilyId} />}
    </div>
  );
};

export default DataEntryPage;
