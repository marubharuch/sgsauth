import { useState } from "react";

const WhatsAppLinkGenerator = ({ requestId }) => {
  const [whatsappLink, setWhatsappLink] = useState("");

  const generateLink = () => {
    const approvalUrl = `https://your-app.com/approve-role/${requestId}`;
    const message = `Hello, please approve my role change request here: ${approvalUrl}`;
    setWhatsappLink(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <div>
      <button onClick={generateLink} className="bg-blue-500 text-white p-2 rounded">
        Generate WhatsApp Link
      </button>

      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600">
          Send via WhatsApp
        </a>
      )}
    </div>
  );
};

export default WhatsAppLinkGenerator;
