import React, { useState, useRef, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Upload, FolderOpen, Image, FileText } from "lucide-react";
import SnippingTool from "./SnippingTool";
import SnipsViewer from "./SnipsViewer";

interface PDFViewerProps {
  pdfList: { filename: string; url: string }[];
  selectedFolder: string | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfList, selectedFolder }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [localPdf, setLocalPdf] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'snips'>('pdf');
  const [snipsRefreshKey, setSnipsRefreshKey] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pdfList.length > 0 && !selectedPdf && !localPdf) {
      setSelectedPdf(pdfList[0].url);
    }
  }, [pdfList, selectedPdf, localPdf]);

  useEffect(() => {
    // Enable/disable text selection based on highlight mode
    document.body.style.userSelect = 'auto';

    return () => {
      document.body.style.userSelect = 'auto';
    };
  }, []);

  const handleSnipSaved = () => {
    // Force refresh of snips list
    setSnipsRefreshKey(prev => prev + 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setLocalPdf(fileUrl);
      setSelectedPdf(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-800 text-white overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 h-full" style={{ margin: 0, padding: '1rem' }}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <FolderOpen className="w-5 h-5 text-blue-400" /> Tools
        </h2>
        <SnippingTool selectedFolder={selectedFolder} onSnipSaved={handleSnipSaved}/>
        <div className="my-4"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow bg-gray-800 h-full w-full" style={{ margin: 0, padding: 0 }}>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 bg-gray-800" style={{ margin: 0, padding: '1rem' }}>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'pdf' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF Viewer
          </button>
          <button
            onClick={() => setActiveTab('snips')}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'snips' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4 mr-2" />
            Saved Snips
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pdf' ? (
          <div className="flex flex-col h-full bg-gray-800" style={{ margin: 0, padding: '1rem' }}>
            <div className="flex items-center justify-center mb-4 gap-4">
              <input
                type="file"
                accept="application/pdf"
                className="border border-gray-600 rounded-lg bg-gray-700 text-white p-2 cursor-pointer"
                onChange={handleFileUpload}
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> Upload PDF
              </button>
            </div>

            {pdfList.length === 0 && !localPdf ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-gray-400">No PDFs available</p>
              </div>
            ) : (
              <>
                <select
                  className="w-full p-3 border border-gray-600 rounded-lg mb-4 bg-gray-700 text-white"
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
                    className="flex-1 border border-gray-600 rounded-lg shadow-lg overflow-auto bg-gray-700"
                    ref={pdfContainerRef}
                    style={{ 
                      margin: 0, 
                      padding: 0,
                      backgroundColor: '#374151' // gray-700
                    }}
                  >
                    
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer 
                        fileUrl={localPdf || selectedPdf!} 
                        theme={{
                          theme: 'dark'
                        }}
                      />
                    </Worker>
                    
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-700 border border-gray-600 rounded-lg">
                    <p className="text-gray-400">Select a PDF to display</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-gray-800 overflow-hidden" style={{ margin: 0, padding: 0 }}>
            <SnipsViewer key={snipsRefreshKey} selectedFolder={selectedFolder} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
