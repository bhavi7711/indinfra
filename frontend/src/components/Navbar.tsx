import React, { useState } from "react";

const Navbar = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File uploaded:", file.name); // ✅ Debugging check
    }
  };

  return (
    <nav className="w-full fixed top-0 left-0  p-4 shadow-md">
      <input id="file-input" type="file" onChange={handleFileUpload} className="hidden" />
      {selectedFile && <p className="text-blue-500 mt-2">Selected File: {selectedFile.name}</p>}
    </nav>
  );
};
export default Navbar;
