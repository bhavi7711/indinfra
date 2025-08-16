import { Highlighter } from "lucide-react";

interface HighlightToolProps {
  onClick: () => void;
  isActive?: boolean;
}

const HighlightTool: React.FC<HighlightToolProps> = ({ onClick, isActive = false }) => {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center px-4 py-2 rounded-lg transition duration-200 ${
        isActive 
          ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
          : 'bg-yellow-200 text-black hover:bg-yellow-300'
      }`}
    >
      <Highlighter className="w-5 h-5 mr-2" />
      {isActive ? 'Highlight Mode ON' : 'Highlight Tool'}
    </button>
  );
};

export default HighlightTool;
