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
  const [highlights, setHighlights] = useState<any[]>([]); // Store highlights
  const [isHighlighting, setIsHighlighting] = useState(false); // Toggle highlight mode
  const pdfViewerRef = useRef<any>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (pdfList.length > 0 && !selectedPdf) {
      setSelectedPdf(pdfList[0].url);
    }
  }, [pdfList]);

  useEffect(() => {
    if (selectedPdf) {
      fetch(`http://127.0.0.1:5000/get-highlights?pdf=${selectedPdf}`)
        .then((res) => res.json())
        .then((data) => setHighlights(data))
        .catch((error) => console.error("Error fetching highlights:", error));
    }
  }, [selectedPdf]);

  // Handle text selection and highlight
  const handleTextSelection = () => {
    if (isHighlighting) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect && rect.height > 0 && rect.width > 0) {
          // Create highlight data (including coordinates and PDF reference)
          const highlightData = {
            text: selection.toString(),
            start: { x: rect.left, y: rect.top + scrollPosition }, // Adjust Y with scroll
            end: { x: rect.right, y: rect.bottom + scrollPosition }, // Adjust Y with scroll
            pdf: selectedPdf,
          };

          setHighlights((prev) => [...prev, highlightData]);

          // Wrap selected text in a span with highlight
          const span = document.createElement("span");
          span.style.backgroundColor = "yellow";
          range.surroundContents(span);

          // Clear the selection after applying the highlight
          window.getSelection()?.removeAllRanges();
        }
      }
    }
  };

  // Handle scroll to track the PDF position
  const handleScroll = () => {
    const scrollTop = pdfViewerRef.current.scrollTop;
    setScrollPosition(scrollTop);
  };

  // Save highlights to the backend
  const saveHighlight = async () => {
    if (highlights.length > 0) {
      const response = await fetch("http://127.0.0.1:5000/save-highlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ highlights }),
      });

      if (response.ok) {
        console.log("Highlight saved successfully!");
      } else {
        console.error("Failed to save highlight");
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-400" /> My Documents
        </h2>
        <SnippingTool selectedFolder={selectedFolder} />
        <HighlightTool onClick={() => setIsHighlighting(true)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex flex-col items-center w-full">
          {/* File Upload Section */}
          <div className="w-full flex items-center justify-center mb-4 gap-4">
            <input
              type="file"
              className="border border-gray-600 rounded-lg bg-gray-800 text-white p-2 cursor-pointer"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Upload className="w-4 h-4" /> Upload PDF
            </button>
          </div>

          {/* PDF Selection */}
          {pdfList.length === 0 ? (
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
              {selectedPdf ? (
                <div
                  className="w-full flex-grow border border-gray-600 p-4 rounded-lg bg-gray-800 shadow-lg overflow-auto h-[80vh]"
                  ref={pdfViewerRef}
                  onScroll={handleScroll} // Track scroll position
                  onMouseUp={handleTextSelection} // Trigger highlight on text selection
                >
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={selectedPdf} />
                  </Worker>

                  {/* Render highlight overlays */}
                  {highlights.map((highlight, index) => (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        top: `${highlight.start.y}px`, // Adjust Y position based on scroll
                        left: `${highlight.start.x}px`,
                        width: `${highlight.end.x - highlight.start.x}px`,
                        height: `${highlight.end.y - highlight.start.y}px`,
                        backgroundColor: "rgba(255, 255, 0, 0.5)", // Lighter yellow color
                        pointerEvents: "none", // Ensure highlights don't block other interactions
                      }}
                    ></div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Select a PDF to display</p>
              )}
            </>
          )}

          {/* Save Highlight Button */}
          {highlights.length > 0 && (
            <button
              onClick={saveHighlight}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Save Highlight
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
