import React, { useState } from "react"; // ✅ Add useState import

type UploadPDFProps = {
  onUpload: (file: { name: string; folder: string }) => void;
};

const UploadPDF = ({ onUpload }: UploadPDFProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const folder = "uploaded-pdfs"; // Backend folder where files are stored
      onUpload({ name: file.name, folder });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Choose File:</label>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="p-2 border border-gray-300 rounded" />
      {selectedFile && <p className="text-blue-500 mt-2">Selected File: {selectedFile.name}</p>}
    </div>
  );
};

export default UploadPDF;
