import { useState } from "react";
import { Folder, FolderOpen } from "lucide-react";

interface SidebarProps {
  onFolderSelect: (folderPath: string) => void;
  selectedFolder: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onFolderSelect, selectedFolder }) => {
  const [folders, setFolders] = useState<string[]>([]);

  const handleOpenFolder = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const folderPath = files[0].webkitRelativePath.split("/")[0]; // Extract folder name
        setFolders((prev) => [...prev, folderPath]);
        onFolderSelect(folderPath);
      }
    };
    input.click();
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Folder className="w-5 h-5 text-blue-400" /> My Documents
      </h2>
      <button onClick={handleOpenFolder} className="bg-blue-500 px-4 py-2 rounded mb-4">
        <FolderOpen className="w-5 h-5 inline-block mr-2" /> Open Folder
      </button>
      <ul>
        {folders.map((folder, index) => (
          <li key={index} className={`p-2 ${folder === selectedFolder ? "bg-gray-700" : ""}`}>
            📁 {folder}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
