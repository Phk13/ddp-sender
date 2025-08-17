import { Music, Trash2, Plus, Copy } from "lucide-react";
import { Preset, PresetListProps } from "../../types";

const PresetList = ({
  presets = [],
  selectedPreset = null,
  onPresetSelect = () => {},
  onPresetAdd = () => {},
  onPresetDuplicate = () => {},
  onPresetDelete = () => {},
  onPresetMirror = () => {},
  className = "",
}: PresetListProps) => {
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
    <div className={`preset-list ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Presets ({presets.length})</h3>
        <button
          onClick={onPresetAdd}
          className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors flex items-center gap-1"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Tools */}
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

      {/* Preset List */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {presets.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <div className="mb-2">
              <Music size={32} className="mx-auto" />
            </div>
            <div className="text-sm">No presets yet</div>
            <div className="text-xs text-muted mt-1">
              Click "Add" to create your first preset
            </div>
          </div>
        ) : (
          presets.map((preset, index) => (
            <div
              key={preset.id || index}
              className={`
                preset-item p-2 border rounded-lg cursor-pointer transition-all duration-200
                ${
                  selectedPreset?.id === preset.id || selectedPreset === preset
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
              {(selectedPreset?.id === preset.id ||
                selectedPreset === preset) && (
                <div className="mt-1 text-xs text-primary-400">
                  ✓ Selected for editing
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {presets.length > 0 && (
        <div className="mt-4 pt-3 border-t border-default text-xs text-secondary">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted">Total presets:</span>{" "}
              {presets.length}
            </div>
            <div>
              <span className="text-muted">MIDI notes used:</span>{" "}
              {new Set(presets.map((p: Preset) => p.note)).size}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetList;
