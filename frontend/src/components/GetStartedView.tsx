import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import PDFViewer from "./PDFViewer";

interface PdfFile {
  filename: string;
  url: string;
}

interface GetStartedViewProps {
  onBackToDashboard: () => void;
}

const GetStartedView: React.FC<GetStartedViewProps> = ({ onBackToDashboard }) => {
  const [pdfList, setPdfList] = useState<PdfFile[]>([]);
  const [folderPdfs, setFolderPdfs] = useState<PdfFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

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
    <div className="flex flex-1 w-full">
      <Sidebar onFolderSelect={handleFolderSelect} selectedFolder={selectedFolder} />
      <div className="flex flex-col flex-1 w-full">
        {/* Navigation Header */}
        <div className="bg-gray-900 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToDashboard}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedFolder || 'PDF Viewer'}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4">
          <PDFViewer pdfList={selectedFolder ? folderPdfs : pdfList} selectedFolder={selectedFolder} />
        </div>
      </div>
    </div>
  );
};

export default GetStartedView;
