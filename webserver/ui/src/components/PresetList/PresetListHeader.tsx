import React from "react";
import { Plus } from "lucide-react";

interface PresetListHeaderProps {
  presetCount: number;
  onPresetAdd: () => void;
}

const PresetListHeader: React.FC<PresetListHeaderProps> = ({
  presetCount,
  onPresetAdd,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Presets ({presetCount})</h3>
      <button
        onClick={onPresetAdd}
        className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors flex items-center gap-1"
      >
        <Plus size={16} />
        Add
      </button>
    </div>
  );
};

export default PresetListHeader;
