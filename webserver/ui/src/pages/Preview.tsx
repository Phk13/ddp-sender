import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Square, Eraser } from "lucide-react";
import LEDStrip from "../components/LEDStrip/LEDStrip";
import { Preset, MappingFile, LEDMapping, SystemStatus } from "../types";
import { api } from "../api/client";

const Preview = () => {
  // State
  const [currentMapping, setCurrentMapping] = useState<MappingFile | null>(
    null,
  );
  const [presets, setPresets] = useState<Preset[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [triggeredPresets, setTriggeredPresets] = useState<Set<number>>(
    new Set(),
  );
  const [activeStaticPresets, setActiveStaticPresets] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load system status and current mapping
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get system status
      const status = await api.system.getStatus();
      setSystemStatus(status);

      // Load current mapping if available
      if (status.currentMapping && status.currentMapping !== "") {
        const mappingData = await api.mappings.get(status.currentMapping);

        // Convert presets to include IDs if they don't have them
        const presetsWithIds = mappingData.presets.map((preset, index) => ({
          ...preset,
          id: preset.id || Date.now() + index,
        }));

        const mappingWithIds = {
          ...mappingData,
          presets: presetsWithIds,
        };

        setCurrentMapping(mappingWithIds);
        setPresets(presetsWithIds);
      } else {
        setCurrentMapping(null);
        setPresets([]);
      }
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to load preview data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Generate LED mappings for visualization
  const generateLEDMappings = useCallback((): LEDMapping[] => {
    return presets.map((preset) => {
      // Generate range array based on first, last, step
      const range = [];
      const start = Math.min(preset.first, preset.last);
      const end = Math.max(preset.first, preset.last);
      const step = Math.abs(preset.step) || 1;

      if (preset.first <= preset.last) {
        // Forward range [start, end)
        for (let i = start; i < end; i += step) {
          range.push(i);
        }
      } else {
        // Reverse range [first, last)
        for (let i = preset.first; i > preset.last; i -= step) {
          range.push(i);
        }
      }

      return {
        id: preset.id || 0,
        range,
        color: preset.color,
        preset,
      };
    });
  }, [presets]);

  // Trigger a preset effect
  const triggerPreset = async (preset: Preset) => {
    try {
      // Add to triggered presets for visual feedback
      setTriggeredPresets((prev) => new Set(prev).add(preset.note));

      // Call backend API to trigger the effect
      await api.effects.trigger(preset.note);

      // For non-static effects, remove from triggered presets after a delay
      if (preset.effect !== "static") {
        setTimeout(() => {
          setTriggeredPresets((prev) => {
            const newSet = new Set(prev);
            newSet.delete(preset.note);
            return newSet;
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to trigger preset:", err);
      setError(api.utils.getErrorMessage(err));
      // Remove from triggered presets on error
      setTriggeredPresets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(preset.note);
        return newSet;
      });
    }
  };

  // Turn off a preset effect
  const triggerPresetOff = async (preset: Preset) => {
    try {
      // Call backend API to turn off the effect
      await api.effects.triggerOff(preset.note);

      // Remove from visual feedback
      setTriggeredPresets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(preset.note);
        return newSet;
      });
      setActiveStaticPresets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(preset.note);
        return newSet;
      });
    } catch (err) {
      console.error("Failed to turn off preset:", err);
      setError(api.utils.getErrorMessage(err));
    }
  };

  // Handle mouse down for static effects
  const handleMouseDown = (preset: Preset) => {
    if (preset.effect === "static") {
      setActiveStaticPresets((prev) => new Set(prev).add(preset.note));
      triggerPreset(preset);
    } else {
      // For non-static effects, just trigger normally
      triggerPreset(preset);
    }
  };

  // Handle mouse up for static effects
  const handleMouseUp = (preset: Preset) => {
    if (preset.effect === "static") {
      triggerPresetOff(preset);
    }
  };

  // Clear all active effects
  const clearAllEffects = async () => {
    try {
      await api.effects.clearAll();

      // Clear all visual state
      setTriggeredPresets(new Set());
      setActiveStaticPresets(new Set());
    } catch (err) {
      console.error("Failed to clear all effects:", err);
      setError(api.utils.getErrorMessage(err));
    }
  };

  // Group presets by effect type
  const groupedPresets = presets.reduce(
    (groups, preset) => {
      const effect = preset.effect || "static";
      if (!groups[effect]) {
        groups[effect] = [];
      }
      groups[effect].push(preset);
      return groups;
    },
    {} as Record<string, Preset[]>,
  );

  if (loading) {
    return (
      <div className="p-8 h-screen overflow-auto">
        <div className="flex justify-center items-center h-96 text-secondary">
          Loading preview data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-screen overflow-auto">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Error loading preview</div>
          <div className="text-secondary mb-6">{error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentMapping) {
    return (
      <div className="p-8 h-screen overflow-auto">
        <div className="text-center py-12">
          <div className="text-secondary text-lg mb-4">No Active Mapping</div>
          <div className="text-muted mb-6">
            No mapping is currently loaded. Please select and activate a mapping
            first.
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-default bg-gray-850 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Effect Preview</h1>
            <p className="text-sm text-secondary">
              Current Mapping: {currentMapping.name} ({presets.length} presets)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary">
              LED Count: {systemStatus?.ledCount || 150}
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-gray-700 text-secondary rounded hover:bg-gray-600 hover:text-primary transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* LED Strip Visualization */}
        <div className="border-b border-default p-6 flex-shrink-0">
          <LEDStrip
            ledCount={systemStatus?.ledCount || 150}
            mappings={generateLEDMappings()}
            selectedRange={null}
            selectedPreset={null}
            editingRange={null}
            onRangeSelect={() => {}}
            onLEDClick={() => {}}
          />
        </div>

        {/* Trigger Controls */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Manual Triggers</h2>
            <p className="text-sm text-secondary">
              Click any preset to trigger its effect manually
            </p>
          </div>

          {Object.keys(groupedPresets).length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No presets available in current mapping</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPresets).map(
                ([effectType, effectPresets]) => (
                  <div key={effectType} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-md font-medium text-primary mb-3 capitalize">
                      {effectType} Effects ({effectPresets.length})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {effectPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={
                            preset.effect === "static"
                              ? undefined
                              : () => triggerPreset(preset)
                          }
                          onMouseDown={
                            preset.effect === "static"
                              ? () => handleMouseDown(preset)
                              : undefined
                          }
                          onMouseUp={
                            preset.effect === "static"
                              ? () => handleMouseUp(preset)
                              : undefined
                          }
                          onMouseLeave={
                            preset.effect === "static"
                              ? () => handleMouseUp(preset)
                              : undefined
                          }
                          className={`
                          relative p-3 rounded-md border transition-all duration-150 text-left select-none
                          ${
                            triggeredPresets.has(preset.note) ||
                            activeStaticPresets.has(preset.note)
                              ? "border-primary-400 bg-primary-600/20 shadow-lg scale-105"
                              : "border-default hover:border-primary-500 hover:bg-gray-700"
                          }
                        `}
                        >
                          {/* Color indicator */}
                          <div
                            className="absolute top-2 right-2 w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: preset.color }}
                          />

                          {/* Preset info */}
                          <div className="pr-6">
                            <div className="font-medium text-primary">
                              {preset.name || `Preset ${preset.note}`}
                            </div>
                            <div className="text-sm text-secondary">
                              MIDI Note: {preset.note}
                            </div>
                            <div className="text-xs text-muted">
                              Range: {Math.min(preset.first, preset.last)}-
                              {Math.max(preset.first, preset.last)}
                              {preset.step !== 1 && ` (step ${preset.step})`}
                              {preset.effect === "static" && (
                                <span className="text-blue-400">
                                  {" "}
                                  • Hold to activate
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-default">
            <h3 className="text-md font-medium text-primary mb-3">
              Quick Actions
            </h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={clearAllEffects}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Square size={16} />
                Clear All Effects
              </button>

              <button
                onClick={() => {
                  // Clear all visual feedback only
                  setTriggeredPresets(new Set());
                  setActiveStaticPresets(new Set());
                }}
                className="px-4 py-2 bg-gray-700 text-secondary rounded-md hover:bg-gray-600 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Eraser size={16} />
                Clear Visual State
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
