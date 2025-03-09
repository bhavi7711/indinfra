import React, { useState, useRef, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Upload, FolderOpen } from "lucide-react";
import SnippingTool from "./SnippingTool";
import HighlightTool from "./HighlightTool";

interface PDFViewerProps {
  pdfList: { filename: string; url: string }[];
  selectedFolder: string | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfList, selectedFolder }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const pdfViewerRef = useRef<any>(null);
  const [localPdf, setLocalPdf] = useState<string | null>(null);

  useEffect(() => {
    if (pdfList.length > 0 && !selectedPdf && !localPdf) {
      setSelectedPdf(pdfList[0].url);
    }
  }, [pdfList, selectedPdf, localPdf]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setLocalPdf(fileUrl);
      setSelectedPdf(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r border-blue-500">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-400" /> Tools
        </h2>
        <SnippingTool selectedFolder={selectedFolder} />
        <div className="my-4"></div>
        <HighlightTool onClick={() => console.log("Highlighting activated")} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex flex-col items-center w-full">
          <div className="w-full flex items-center justify-center mb-4 gap-4">
            <input
              type="file"
              accept="application/pdf"
              className="border border-gray-600 rounded-lg bg-gray-800 text-white p-2 cursor-pointer"
              onChange={handleFileUpload}
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Upload className="w-4 h-4" /> Upload PDF
            </button>
          </div>

          {pdfList.length === 0 && !localPdf ? (
            <p className="text-center text-gray-400">No PDFs available</p>
          ) : (
            <>
              <select
                className="w-full p-3 border border-gray-600 rounded-lg mb-4 bg-gray-800 text-white"
                onChange={(e) => setSelectedPdf(e.target.value)}
                value={selectedPdf || ""}
              >
                <option value="" disabled>Select a PDF</option>
                {pdfList.map((pdf, index) => (
                  <option key={index} value={pdf.url}>
                    {pdf.filename}
                  </option>
                ))}
              </select>

              {/* PDF Viewer */}
              {selectedPdf || localPdf ? (
                <div
                  className="w-full flex-grow border border-gray-600 p-4 rounded-lg bg-gray-800 shadow-lg overflow-auto h-[80vh]"
                  ref={pdfViewerRef}
                >
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={localPdf || selectedPdf!} />
                  </Worker>
                </div>
              ) : (
                <p className="text-gray-400">Select a PDF to display</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
