import React, { useState } from "react";

interface UploadButtonProps {
  onUpload: (file: { filename: string; url: string }) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("✅ Selected file:", file.name);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("❌ No file selected.");
      console.error("❌ No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile); // Ensure this matches backend key

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ File uploaded successfully:", data);

      onUpload({ filename: selectedFile.name, url: data.url });

      setUploadStatus("✅ File uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      setUploadStatus("❌ Upload failed.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="p-2 border border-gray-600 rounded-lg"
      />
      <button
        onClick={handleFileUpload}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-bold transition"
      >
        Upload PDF
      </button>
      {uploadStatus && <p className="text-sm">{uploadStatus}</p>}
    </div>
  );
};

export default UploadButton;
