import React from "react";
import { Edit3 } from "lucide-react";

interface EmptyStateProps {
  onCreateNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <div className="text-center py-12 text-secondary">
      <div className="mb-3">
        <Edit3 size={48} className="mx-auto text-secondary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Preset Selected</h3>
      <p className="text-sm text-muted mb-4">
        Select a preset from the list or create a new one to start editing
      </p>
      <button
        onClick={onCreateNew}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        Create New Preset
      </button>
    </div>
  );
};

export default EmptyState;
