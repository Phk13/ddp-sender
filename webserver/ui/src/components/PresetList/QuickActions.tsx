import React from "react";
import { Copy } from "lucide-react";
import { Preset } from "../../types";

interface QuickActionsProps {
  selectedPreset: Preset | null;
  onPresetMirror: () => void;
  onPresetDuplicate: (preset: Preset) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  selectedPreset,
  onPresetMirror,
  onPresetDuplicate,
}) => {
  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
      <div className="text-sm text-secondary mb-2">Quick Actions:</div>
      <div className="flex gap-2">
        <button
          onClick={onPresetMirror}
          disabled={!selectedPreset}
          className="px-3 py-1 bg-gray-700 text-secondary rounded text-xs hover:bg-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🪞 Mirror Selected
        </button>
        <button
          onClick={() => selectedPreset && onPresetDuplicate(selectedPreset)}
          disabled={!selectedPreset}
          className="px-3 py-1 bg-gray-700 text-secondary rounded text-xs hover:bg-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Copy size={14} />
          Duplicate
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
