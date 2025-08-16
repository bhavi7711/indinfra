import React, { useState, useEffect } from "react";
import { Image, Trash2, Calendar, Eye } from "lucide-react";

interface SnipData {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  filename: string;
  folder: string;
  url: string;
  created_at: string;
}

interface SnipsViewerProps {
  selectedFolder: string | null;
}

const SnipsViewer: React.FC<SnipsViewerProps> = ({ selectedFolder }) => {
  const [snips, setSnips] = useState<SnipData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSnip, setSelectedSnip] = useState<SnipData | null>(null);

  useEffect(() => {
    if (selectedFolder) {
      loadSnips();
    } else {
      setSnips([]);
    }
  }, [selectedFolder]);

  const loadSnips = async () => {
    if (!selectedFolder) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-snips?folder=${encodeURIComponent(selectedFolder)}`);
      if (response.ok) {
        const data = await response.json();
        setSnips(data);
      }
    } catch (error) {
      console.error("Error loading snips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnip = async (snipId: string, snipTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the snip "${snipTitle}"?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/delete-snip/${snipId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadSnips();
          if (selectedSnip?.id === snipId) {
            setSelectedSnip(null);
          }
        }
      } catch (error) {
        console.error("Error deleting snip:", error);
      }
    }
  };

  const handleSnipClick = (snip: SnipData) => {
    setSelectedSnip(snip);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (!selectedFolder) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Select a folder to view snips</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Snips List */}
      <div className="w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Saved Snips ({snips.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading snips...</p>
          </div>
        ) : snips.length > 0 ? (
          <div className="space-y-3">
            {snips.map((snip) => (
              <div
                key={snip.id}
                onClick={() => handleSnipClick(snip)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSnip?.id === snip.id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{snip.title}</h4>
                    {snip.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{snip.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatTimestamp(snip.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnip(snip.id, snip.title);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete snip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No snips saved yet</p>
            <p className="text-sm">Use the Snip & Save tool to capture screenshots</p>
          </div>
        )}
      </div>

      {/* Snip Detail View */}
      <div className="w-1/2 p-4">
        {selectedSnip ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedSnip.title}</h3>
              <button
                onClick={() => setSelectedSnip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Snip Image */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedSnip.url}
                  alt={selectedSnip.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                {selectedSnip.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                      {selectedSnip.description}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                    {formatTimestamp(selectedSnip.timestamp)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Details
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border space-y-1">
                    <p><strong>Filename:</strong> {selectedSnip.filename}</p>
                    <p><strong>Created:</strong> {formatTimestamp(selectedSnip.created_at)}</p>
                    <p><strong>Folder:</strong> {selectedSnip.folder}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Select a snip to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnipsViewer;
