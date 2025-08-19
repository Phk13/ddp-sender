import React from "react";
import { Copy, Trash2 } from "lucide-react";
import { Preset } from "../../types";

interface PresetItemProps {
  preset: Preset;
  index: number;
  isSelected: boolean;
  onPresetSelect: (preset: Preset) => void;
  onPresetDuplicate: (preset: Preset) => void;
  onPresetDelete: (preset: Preset) => void;
}

const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  index,
  isSelected,
  onPresetSelect,
  onPresetDuplicate,
  onPresetDelete,
}) => {
  // Format LED range for display
  const formatRange = (preset: Preset): string => {
    if (!preset.first || !preset.last) return "No range";

    if (preset.step && preset.step !== 1) {
      return `${preset.first}-${preset.last} (step ${preset.step})`;
    }

    return `${preset.first}-${preset.last}`;
  };

  // Get range length
  const getRangeLength = (preset: Preset): number => {
    if (!preset.first && preset.first !== 0) return 0;
    if (!preset.last && preset.last !== 0) return 0;

    const first = preset.first;
    const last = preset.last;
    const step = preset.step || 1;

    // Match backend MakeRange logic exactly
    let count = 0;
    if (step > 0) {
      for (let i = first; i < last; i += step) {
        count++;
      }
    } else if (step < 0) {
      for (let i = first; i > last; i += step) {
        count++;
      }
    }

    return count;
  };

  return (
    <div
      className={`
        preset-item p-2 border rounded-lg cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "border-primary-600 bg-primary-600/10"
            : "border-default bg-gray-850 hover:border-light hover:bg-gray-800"
        }
      `}
      onClick={() => onPresetSelect(preset)}
    >
      {/* Preset Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-sm">
            {preset.name || `Preset ${index + 1}`}
          </div>
          <div className="text-xs text-secondary">
            Note {preset.note} • {preset.effect}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onPresetDuplicate(preset);
            }}
            className="p-1 text-secondary hover:text-primary transition-colors"
            title="Duplicate preset"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onPresetDelete(preset);
            }}
            className="p-1 text-secondary hover:text-red-400 transition-colors"
            title="Delete preset"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Preset Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted">Range:</div>
          <div className="font-mono">{formatRange(preset)}</div>
        </div>
        <div>
          <div className="text-muted">LEDs:</div>
          <div>{getRangeLength(preset)}</div>
        </div>
        <div>
          <div className="text-muted">Effect:</div>
          <div className="capitalize">{preset.effect || "static"}</div>
        </div>
        <div>
          <div className="text-muted">Color:</div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded border border-gray-600"
              style={{ backgroundColor: preset.color || "#ffffff" }}
            ></div>
            <span className="font-mono text-xs">
              {preset.color || "#ffffff"}
            </span>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-1 text-xs text-primary-400">
          ✓ Selected for editing
        </div>
      )}
    </div>
  );
};

export default PresetItem;
