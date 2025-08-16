import React, { useState } from "react";
import { Scissors, Calendar } from "lucide-react";

interface SnippingToolProps {
  selectedFolder: string | null;
  onSnipSaved?: () => void;
}

const SnippingTool: React.FC<SnippingToolProps> = ({ selectedFolder, onSnipSaved }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [snipTitle, setSnipTitle] = useState("");
  const [snipDescription, setSnipDescription] = useState("");
  const [snipTimestamp, setSnipTimestamp] = useState("");
  const [snipBlob, setSnipBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSniping, setIsSniping] = useState(false);

  // Function to generate default timestamp
  const getDefaultTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const saveSnip = async () => {
    if (!snipBlob || !snipTitle.trim()) {
      alert("⚠️ Please enter a snip title before saving.");
      return;
    }

    if (!snipTimestamp.trim()) {
      alert("⚠️ Please enter a timestamp.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("snip", snipBlob, `${snipTitle}.png`);
      formData.append("folder", selectedFolder || "");
      formData.append("title", snipTitle);
      formData.append("description", snipDescription);
      formData.append("timestamp", snipTimestamp);

      const response = await fetch("http://127.0.0.1:5000/save-snip", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Snip saved successfully:", data);
        alert(`✅ Snip "${snipTitle}" saved successfully!`);
        
        // Reset form
        setDialogOpen(false);
        setSnipTitle("");
        setSnipDescription("");
        setSnipTimestamp("");
        setSnipBlob(null);
        setImagePreview(null);

        // Notify parent to refresh snips list
        if (onSnipSaved) {
          onSnipSaved();
        }
      } else {
        alert(`❌ Failed to save snip: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error saving snip:", error);
      alert("❌ Error saving snip. Check console for details.");
    }
  };

  const handleSnip = async () => {
    if (!selectedFolder) {
      alert("⚠️ Please select a folder first.");
      return;
    }

    setIsSniping(true);
    console.log("📂 Selected Folder:", selectedFolder);

    // Show instructions to user
    alert("✂️ Snipping tool activated!\n\n1. Press Shift+S to open Windows Snipping Tool\n2. Select the area you want to capture\n3. The snip will be automatically detected and saved");

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
        const snipResponse = await fetch(data.file_path);
        if (snipResponse.ok) {
          const snipBlob = await snipResponse.blob();
          setSnipBlob(snipBlob);

          // Convert Blob to Data URL for preview
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(snipBlob);

          // Set default timestamp
          setSnipTimestamp(getDefaultTimestamp());

          // Open the dialog box
          setDialogOpen(true);
        } else {
          alert("❌ Failed to load the captured snip.");
        }
      } else {
        alert(`❌ Failed to capture snip: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error capturing snip:", error);
      alert("❌ Error capturing snip. Check console for details.");
    } finally {
      setIsSniping(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSnip}
        disabled={isSniping}
        className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg w-full justify-center"
      >
        <Scissors className="w-5 h-4 mr-2" />
        {isSniping ? "Capturing..." : "Snip & Save"}
      </button>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-black mb-4">Save Snip</h2>

            {imagePreview && (
              <div className="mb-4">
                <img src={imagePreview} alt="Snip Preview" className="rounded-md w-full border border-gray-300" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Snip Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter snip title"
                  value={snipTitle}
                  onChange={(e) => setSnipTitle(e.target.value)}
                  className="w-full p-2 border border-gray-400 rounded text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Enter snip description"
                  value={snipDescription}
                  onChange={(e) => setSnipDescription(e.target.value)}
                  className="w-full p-2 border border-gray-400 rounded text-black"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timestamp *
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="datetime-local"
                    value={snipTimestamp.replace(' ', 'T')}
                    onChange={(e) => setSnipTimestamp(e.target.value.replace('T', ' '))}
                    className="flex-1 p-2 border border-gray-400 rounded text-black"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: YYYY-MM-DD HH:MM:SS
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => {
                  setDialogOpen(false);
                  setSnipTitle("");
                  setSnipDescription("");
                  setSnipTimestamp("");
                  setSnipBlob(null);
                  setImagePreview(null);
                }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSnip}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Save Snip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippingTool;
