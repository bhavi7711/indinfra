import React, { useState } from "react";
import { Scissors } from "lucide-react";

interface SnippingToolProps {
  selectedFolder: string | null;
}

const SnippingTool: React.FC<SnippingToolProps> = ({ selectedFolder }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [snipTitle, setSnipTitle] = useState("");
  const [snipDescription, setSnipDescription] = useState("");
  const [snipBlob, setSnipBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Function to generate timestamp
  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  };

  const saveSnip = async () => {
    if (!snipBlob || !snipTitle.trim()) {
      alert("⚠️ Please enter a snip title before saving.");
      return;
    }

    const arrayBuffer = await snipBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert Blob to Buffer

    const timestamp = getTimestamp(); // Get timestamp for the file
    const { ipcRenderer } = window.require("electron"); // Use Electron IPC
    const savedPath = await ipcRenderer.invoke("save-snip", buffer, selectedFolder, snipTitle, snipDescription, timestamp);

    if (savedPath) {
      console.log("✅ Snip saved at:", savedPath);
      alert(`✅ Snip saved successfully at: ${savedPath}`);
    } else {
      console.log("❌ Snip save canceled.");
    }

    setDialogOpen(false);
    setSnipTitle("");
    setSnipDescription("");
    setSnipBlob(null);
    setImagePreview(null);
  };

  const handleSnip = async () => {
    if (!selectedFolder) {
      alert("⚠️ Please select a folder first.");
      return;
    }

    console.log("📂 Selected Folder:", selectedFolder);

    alert("✂️ Snipping tool activated! Select an area, and it will be auto-saved.");
    
    const formData = new FormData();
    formData.append("folder", selectedFolder);

    try {
      const response = await fetch("http://127.0.0.1:5000/start-snip", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📸 Snip Response:", data);

      if (response.ok) {
        // Fetch the snip as Blob
        const snipBlob = await (await fetch(data.file_path)).blob();
        setSnipBlob(snipBlob);

        // Convert Blob to Data URL for preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(snipBlob);

        // Open the dialog box
        setDialogOpen(true);
      } else {
        alert(`❌ Failed to save snip: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error saving snip:", error);
      alert("❌ Error saving snip. Check console for details.");
    }
  };

  return (
    <div>
      <button
        onClick={handleSnip}
        className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        <Scissors className="w-5 h-4 mr-2" />
        Snip & Save
      </button>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-black">Save Snip</h2>

            {imagePreview && (
              <img src={imagePreview} alt="Snip Preview" className="mt-2 rounded-md w-full" />
            )}

            <input
              type="text"
              placeholder="Enter Snip Title"
              value={snipTitle}
              onChange={(e) => setSnipTitle(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded mt-2 text-black"
            />

            <textarea
              placeholder="Enter Snip Description (Optional)"
              value={snipDescription}
              onChange={(e) => setSnipDescription(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded mt-2 text-black"
            ></textarea>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDialogOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveSnip}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippingTool;
