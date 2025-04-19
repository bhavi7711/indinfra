import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PDFViewer from "./components/PDFViewer";
import Auth from "./components/Auth";

interface PdfFile {
  filename: string;
  url: string;
}

const App: React.FC = () => {
  const [pdfList, setPdfList] = useState<PdfFile[]>([]);
  const [folderPdfs, setFolderPdfs] = useState<PdfFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get-pdfs")
      .then((res) => res.json())
      .then((data) => setPdfList(data))
      .catch((error) => console.error("Error fetching PDFs:", error));
  }, []);

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath);

    fetch(`http://127.0.0.1:5000/get-pdfs?folder=${encodeURIComponent(folderPath)}`)
      .then((res) => res.json())
      .then((data) => setFolderPdfs(data))
      .catch((error) => console.error("Error fetching folder PDFs:", error));
  };

  return (
    <div className="w-screen h-screen flex flex-col text-black"> 
      {user ? (
        <div className="flex flex-1 w-full">
          <Sidebar onFolderSelect={handleFolderSelect} selectedFolder={selectedFolder} />
          <div className="flex flex-col flex-1 p-4 w-full">
            <PDFViewer pdfList={selectedFolder ? folderPdfs : pdfList} selectedFolder={selectedFolder} />
          </div>
        </div>
      ) : (
        <Auth setUser={setUser} />
      )}
    </div>
  );
};

export default App;
