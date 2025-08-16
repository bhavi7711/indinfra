import { useState, useEffect } from "react";
import { Folder, Upload, Trash2 } from "lucide-react";

interface FolderData {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  uploadDate: string;
}

interface SidebarProps {
  onFolderSelect: (folderPath: string) => void;
  selectedFolder: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onFolderSelect, selectedFolder }) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFolderUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setIsUploading(true);

        try {
          const folderName = files[0].webkitRelativePath.split("/")[0];
          const formData = new FormData();
          
          // Add all files to form data
          for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
          }
          formData.append("folderName", folderName);

          const response = await fetch("http://127.0.0.1:5000/upload-folder", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Folder uploaded successfully:", result);
            
            // Reload folders list
            await loadFolders();
            
            // Auto-select the uploaded folder
            onFolderSelect(folderName);
          } else {
            console.error("Upload failed");
          }
        } catch (error) {
          console.error("Error uploading folder:", error);
        } finally {
          setIsUploading(false);
        }
      }
    };

    input.click();
  };

  const handleFolderDelete = async (folderId: string, folderName: string) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/delete-folder/${folderId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadFolders();
          if (selectedFolder === folderName) {
            onFolderSelect("");
          }
        }
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 mt-8">
        <Folder className="w-5 h-5 text-blue-400" /> My Documents
      </h2>
      
      <button 
        onClick={handleFolderUpload} 
        disabled={isUploading}
        className="bg-blue-500 px-4 py-2 rounded mb-4 w-full flex items-center justify-center disabled:opacity-50"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Folder"}
      </button>
      
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Uploaded Folders</h3>
        <ul className="space-y-1">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className={`p-2 rounded cursor-pointer transition-colors ${
                folder.name === selectedFolder ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center flex-1 min-w-0"
                  onClick={() => onFolderSelect(folder.name)}
                >
                  <Folder className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-400">{folder.fileCount}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderDelete(folder.id, folder.name);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {folders.length === 0 && !isUploading && (
        <div className="text-center py-4 text-gray-400">
          <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No folders uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
