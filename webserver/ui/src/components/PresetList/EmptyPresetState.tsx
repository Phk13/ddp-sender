import React from "react";
import { Music } from "lucide-react";

const EmptyPresetState: React.FC = () => {
  return (
    <div className="text-center py-8 text-secondary">
      <div className="mb-2">
        <Music size={32} className="mx-auto" />
      </div>
      <div className="text-sm">No presets yet</div>
      <div className="text-xs text-muted mt-1">
        Click "Add" to create your first preset
      </div>
    </div>
  );
};

export default EmptyPresetState;
