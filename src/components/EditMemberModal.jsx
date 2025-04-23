const EditMemberModal = ({ member, onSave, onClose }) => {
    const [formData, setFormData] = useState({ ...member });
  
    const handleChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    return (
      <Modal isOpen={true} onClose={onClose}>
        <h2 className="text-lg font-bold mb-4">Edit Member</h2>
        <input name="name" value={formData.name || ''} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Name" />
        <input name="gender" value={formData.gender || ''} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Gender" />
        <input name="relationWithHOF" value={formData.relationWithHOF || ''} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Relation with HOF" />
        <input name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Marital Status" />
        <input name="mobile" value={formData.mobile || ''} onChange={handleChange} className="border p-2 w-full mb-4" placeholder="Mobile" />
        <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={() => onSave(formData)}>Save</button>
        <button className="border px-4 py-2 rounded" onClick={onClose}>Cancel</button>
      </Modal>
    );
  };
  