import React from "react";

interface PresetEditorHeaderProps {
  isEditing: boolean;
  hasChanges: boolean;
}

const PresetEditorHeader: React.FC<PresetEditorHeaderProps> = ({
  isEditing,
  hasChanges,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        {isEditing ? "Edit Preset" : "New Preset"}
      </h3>
      {hasChanges && (
        <div className="text-xs text-yellow-400">● Unsaved changes</div>
      )}
    </div>
  );
};

export default PresetEditorHeader;
