import React, { useState, useEffect } from "react";
import { Folder, Upload, FileText, Trash2, Eye, Play, Image } from "lucide-react";

interface FolderData {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  uploadDate: string;
}

interface FileData {
  filename: string;
  
  url: string;
}

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

interface DashboardProps {
  onGetStarted: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGetStarted }) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<FileData[]>([]);
  const [selectedFolderSnips, setSelectedFolderSnips] = useState<SnipData[]>([]);
  const [showFiles, setShowFiles] = useState(false);
  const [currentFolderName, setCurrentFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load folders on component mount
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadSnipsForFolder = async (folderName: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-snips?folder=${encodeURIComponent(folderName)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFolderSnips(data);
      }
    } catch (error) {
      console.error("Error loading snips:", error);
    }
  };

  const handleFolderUpload = async () => {
    console.log("Upload button clicked"); // Debug log
    
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      console.log("Files selected:", files?.length); // Debug log
      
      if (files && files.length > 0) {
        setIsUploading(true);
        console.log("Starting upload process..."); // Debug log

        try {
          const folderName = files[0].webkitRelativePath.split("/")[0];
          console.log("Folder name:", folderName); // Debug log
          
          const formData = new FormData();
          
          // Add all files to form data
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }
          formData.append("folderName", folderName);

          console.log("Sending request to backend..."); // Debug log
          const response = await fetch("http://127.0.0.1:5000/upload-folder", {
            method: "POST",
            body: formData,
          });

          console.log("Response status:", response.status); // Debug log

          if (response.ok) {
            const result = await response.json();
            console.log("Folder uploaded successfully:", result);
            alert(`✅ Folder "${folderName}" uploaded successfully with ${files.length} files!`);
            
            // Reload folders list
            await loadFolders();
          } else {
            const errorData = await response.json();
            console.error("Upload failed:", errorData);
            alert(`❌ Upload failed: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error("Error uploading folder:", error);
          alert(`❌ Error uploading folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsUploading(false);
        }
      } else {
        console.log("No files selected"); // Debug log
        alert("⚠️ Please select a folder with files to upload.");
      }
    };

    input.click();
  };

  const handleFolderDoubleClick = async (folderName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-pdfs?folder=${encodeURIComponent(folderName)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFolderFiles(data);
        setShowFiles(true);
        setCurrentFolderName(folderName);
        await loadSnipsForFolder(folderName);
      }
    } catch (error) {
      console.error("Error loading folder files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileData) => {
    window.open(file.url, '_blank');
  };

  const handleBackToFolders = () => {
    setShowFiles(false);
    setSelectedFolderFiles([]);
    setSelectedFolderSnips([]);
    setCurrentFolderName("");
  };

  const handleFolderDelete = async (folderId: string, folderName: string) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/delete-folder/${folderId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadFolders();
          if (showFiles && selectedFolderFiles.length > 0) {
            setShowFiles(false);
            setSelectedFolderFiles([]);
            setSelectedFolderSnips([]);
            setCurrentFolderName("");
          }
        }
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    }
  };

  const handleSnipClick = (snip: SnipData) => {
    window.open(snip.url, '_blank');
  };

  const handleSnipDelete = async (snipId: string, snipTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the snip "${snipTitle}"?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/delete-snip/${snipId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadSnipsForFolder(currentFolderName); // Reload snips for the current folder
        }
      } catch (error) {
        console.error("Error deleting snip:", error);
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Show files view
  if (showFiles) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <button
                onClick={handleBackToFolders}
                className="mr-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Folders
              </button>
              <Folder className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">{currentFolderName}</h1>
            </div>
            <p className="text-gray-600">
              {selectedFolderFiles.length} PDF files • {selectedFolderSnips.length} snips
            </p>
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading files and snips...</p>
            </div>
          ) : (selectedFolderFiles.length > 0 || selectedFolderSnips.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* PDF Files */}
              {selectedFolderFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <FileText className="w-8 h-8 text-blue-500 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{file.filename}</h3>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Click to open</span>
                  </div>
                </div>
              ))}
              
              {/* Snips */}
              {selectedFolderSnips.map((snip) => (
                <div
                  key={snip.id}
                  onClick={() => handleSnipClick(snip)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Image className="w-8 h-8 text-green-500 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{snip.title}</h3>
                      <p className="text-sm text-gray-500">Snip</p>
                    </div>
                  </div>
                  
                  {snip.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {snip.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Created: {formatTimestamp(snip.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Timestamp: {formatTimestamp(snip.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Image className="w-4 h-4 mr-2" />
                      <span>Click to view</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSnipDelete(snip.id, snip.title);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete snip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files or snips found</h3>
              <p className="text-gray-500">This folder doesn't contain any PDF files or snips</p>
            </div>
          )}

          {/* Snips Section */}
          {/* This section is removed as per the edit hint to remove references to the old snips state */}

          {/* Empty State */}
          {folders.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
              <p className="text-gray-500 mb-6">Upload your first folder to get started</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleFolderUpload}
                  disabled={isUploading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  {isUploading ? "Uploading..." : "Upload Folder"}
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show folders view
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                {folders.length} folders
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFolderUpload}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Folder"}
              </button>
              <button
                onClick={onGetStarted}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onDoubleClick={() => handleFolderDoubleClick(folder.name)}
              className="bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Folder className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                      <p className="text-sm text-gray-500">{folder.fileCount} files</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderDoubleClick(folder.name);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View folder"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderDelete(folder.id, folder.name);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Uploaded: {new Date(folder.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500 text-center">
                  Double-click to view files
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Snips Section */}
        {/* This section is removed as per the edit hint to remove references to the old snips state */}

        {/* Empty State */}
        {folders.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
            <p className="text-gray-500 mb-6">Upload your first folder to get started</p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleFolderUpload}
                disabled={isUploading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                {isUploading ? "Uploading..." : "Upload Folder"}
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
