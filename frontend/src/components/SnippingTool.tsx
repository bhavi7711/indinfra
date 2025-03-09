import React from "react";
import { Scissors } from "lucide-react";

interface SnippingToolProps {
  selectedFolder: string | null;
}

const SnippingTool: React.FC<SnippingToolProps> = ({ selectedFolder }) => {
  const handleSnip = async () => {
    if (!selectedFolder) {
      alert("⚠️ Please select a folder first.");
      return;
    }

    console.log("📂 Selected Folder:", selectedFolder); // Debugging

    alert("✂️ Snipping tool activated! Select an area, and it will be auto-saved.");
    
    const formData = new FormData();
    formData.append("folder", selectedFolder);

    try {
      const response = await fetch("http://127.0.0.1:5000/start-snip", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📸 Snip Response:", data); // Debugging

      if (response.ok) {
        alert(`✅ Snip saved successfully!\n📁 Location: ${data.file_path}`);
      } else {
        alert(`❌ Failed to save snip: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error saving snip:", error);
      alert("❌ Error saving snip. Check console for details.");
    }
  };

  return (
    <button
      onClick={handleSnip}
      className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
    >
      <Scissors className="w-5 h-4 mr-2" />
      Snip & Save
    </button>
  );
};

export default SnippingTool;