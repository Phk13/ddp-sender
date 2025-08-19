import React from "react";
import { Eye, Loader, Eraser, Play, Save, X } from "lucide-react";
import { EffectType } from "../../types";

interface PresetActionsProps {
  hasChanges: boolean;
  effect: EffectType;
  isPreviewingEffect: boolean;
  isStaticPreviewActive: boolean;
  hasValidRange: boolean;
  previewError: string | null;
  isEditing: boolean;
  onSave: () => void;
  onPreviewEffect: () => Promise<void>;
  onStaticPreviewMouseDown: () => Promise<void>;
  onStaticPreviewMouseUp: () => Promise<void>;
  onClearPreview: () => Promise<void>;
  onCancel: () => void;
}

const PresetActions: React.FC<PresetActionsProps> = ({
  hasChanges,
  effect,
  isPreviewingEffect,
  isStaticPreviewActive,
  hasValidRange,
  previewError,
  isEditing,
  onSave,
  onPreviewEffect,
  onStaticPreviewMouseDown,
  onStaticPreviewMouseUp,
  onClearPreview,
  onCancel,
}) => {
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={onSave}
        disabled={!hasChanges}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-primary-500 hover:border-primary-400 font-medium"
      >
        <Save size={16} />
        {isEditing ? "Save Changes" : "Create Preset"}
      </button>

      {effect === "static" ? (
        <button
          onMouseDown={onStaticPreviewMouseDown}
          onMouseUp={onStaticPreviewMouseUp}
          onMouseLeave={onStaticPreviewMouseUp}
          disabled={!hasValidRange}
          className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 select-none ${
            isStaticPreviewActive
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-secondary hover:bg-gray-600 hover:text-primary"
          }`}
        >
          {isStaticPreviewActive ? (
            <>
              <Eye size={16} /> Hold to Preview • ON
            </>
          ) : (
            <>
              <Eye size={16} /> Hold to Preview
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onPreviewEffect}
          disabled={!hasValidRange || isPreviewingEffect}
          className="px-4 py-2 bg-gray-700 text-secondary rounded-md hover:bg-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPreviewingEffect ? (
            <>
              <Loader size={16} className="animate-spin" /> Previewing...
            </>
          ) : (
            <>
              {effect === "syncWalk" ? <Play size={16} /> : <Eye size={16} />}{" "}
              {effect === "syncWalk" ? "Trigger Step" : "Preview Effect"}
            </>
          )}
        </button>
      )}

      <button
        onClick={onClearPreview}
        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
        title="Clear any active preview effects"
      >
        <Eraser size={16} />
        Clear
      </button>

      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-700 text-secondary rounded-md hover:bg-gray-600 hover:text-primary transition-colors flex items-center gap-2"
      >
        <X size={16} />
        Cancel
      </button>

      <div className="flex-1 flex flex-col justify-center ml-2">
        {hasChanges && (
          <div className="text-xs text-yellow-400 mb-1">
            Don't forget to save your changes
          </div>
        )}
        {previewError && (
          <div className="text-xs text-red-400">
            Preview failed: {previewError}
          </div>
        )}
        {(isPreviewingEffect || isStaticPreviewActive) && (
          <div className="text-xs text-green-400">
            {isStaticPreviewActive
              ? "Static preview active - release to turn off"
              : "Effect sent to LEDs! Check your hardware."}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetActions;
