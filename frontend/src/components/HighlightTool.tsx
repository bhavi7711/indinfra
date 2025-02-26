import { Highlighter } from "lucide-react";

interface HighlightToolProps {
  onClick: () => void;
}

const HighlightTool: React.FC<HighlightToolProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center bg-yellow-200 text-white px-4 py-2 rounded-lg hover:bg-yellow-300 transition duration-200"
    >
      <Highlighter className="w-5 h-5 mr-2 mt-2 " />
      Highlight Tool
    </button>
  );
};

export default HighlightTool;
