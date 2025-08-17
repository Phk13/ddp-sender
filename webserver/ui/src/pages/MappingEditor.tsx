import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save } from "lucide-react";
import LEDStrip from "../components/LEDStrip/LEDStrip";
import PresetList from "../components/PresetList/PresetList";
import PresetEditor from "../components/PresetEditor/PresetEditor";
import {
  Preset,
  MappingFile,
  LEDMapping,
  LEDRange,
  SaveStatus,
  EffectType,
} from "../types";
import { api } from "../api/client";

const MappingEditor = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  // State
  const [mapping, setMapping] = useState<MappingFile | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [selectedRange, setSelectedRange] = useState<LEDRange | null>(null);
  const [editingRange, setEditingRange] = useState<LEDRange | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  // Debounce timeout ref for editing range updates
  const editingRangeTimeoutRef = useRef<number | null>(null);

  // Load mapping data from API
  const loadMapping = async () => {
    if (!name) return;

    try {
      setLoading(true);
      setError(null);

      const mappingData = await api.mappings.get(name);

      // Convert presets to include IDs if they don't have them
      const presetsWithIds = mappingData.presets.map((preset, index) => ({
        ...preset,
        id: preset.id || Date.now() + index,
      }));

      const mappingWithIds = {
        ...mappingData,
        presets: presetsWithIds,
      };

      setMapping(mappingWithIds);
      setPresets(presetsWithIds);
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to load mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load mapping data
  useEffect(() => {
    if (name) {
      loadMapping();
    } else {
      setLoading(false);
    }
  }, [name]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (editingRangeTimeoutRef.current) {
        clearTimeout(editingRangeTimeoutRef.current);
      }
    };
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

  // Calculate editing range from current preset being edited
  const calculateEditingRange = useCallback(
    (preset: Preset | null): LEDRange | null => {
      if (!preset || preset.first === undefined || preset.last === undefined) {
        return null;
      }

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
        start,
        end,
        range,
        step,
      };
    },
    [],
  );

  // Update editing range when editing preset changes (debounced)
  useEffect(() => {
    if (editingRangeTimeoutRef.current) {
      clearTimeout(editingRangeTimeoutRef.current);
    }

    if (editingPreset) {
      editingRangeTimeoutRef.current = window.setTimeout(() => {
        const newEditingRange = calculateEditingRange(editingPreset);
        setEditingRange(newEditingRange);
      }, 200); // 200ms debounce
    } else {
      setEditingRange(null);
    }
  }, [editingPreset, calculateEditingRange]);

  // Get available MIDI notes (already used)
  const getUsedMidiNotes = useCallback((): number[] => {
    return presets.map((p) => p.note).filter((note) => note !== undefined);
  }, [presets]);

  // Handle preset selection
  const handlePresetSelect = (preset: Preset): void => {
    if (hasUnsavedChanges) {
      if (
        !window.confirm(
          "You have unsaved changes. Do you want to discard them?",
        )
      ) {
        return;
      }
    }
    setSelectedPreset(preset);
    setSelectedRange(null);
    setEditingPreset(preset);
  };

  // Handle LED range selection
  const handleRangeSelect = (range: LEDRange | null): void => {
    setSelectedRange(range);
  };

  // Handle preset changes
  const handlePresetChange = (presetData: Partial<Preset>): void => {
    setHasUnsavedChanges(true);

    // Use presetData directly since it contains complete form state
    if (presetData) {
      setEditingPreset(presetData as Preset);
    }
  };

  // Handle preset save
  const handlePresetSave = (presetData: Preset): void => {
    setHasUnsavedChanges(false);

    if (selectedPreset) {
      // Update existing preset
      setPresets((prev) =>
        prev.map((p) =>
          p.id === selectedPreset.id ? { ...p, ...presetData } : p,
        ),
      );
      setSelectedPreset({ ...selectedPreset, ...presetData });
    } else {
      // Add new preset
      const newPreset: Preset = {
        ...presetData,
        id: presetData.id || Date.now(),
      };
      setPresets((prev) => [...prev, newPreset]);
      setSelectedPreset(newPreset);
    }

    // Mark as having changes that need to be saved to backend
    setHasUnsavedChanges(true);
  };

  // Handle preset cancel
  const handlePresetCancel = (): void => {
    setSelectedPreset(null);
    setSelectedRange(null);
    setEditingPreset(null);
    setHasUnsavedChanges(false);
  };

  // Handle preset add
  const handlePresetAdd = (): void => {
    if (hasUnsavedChanges) {
      if (
        !window.confirm(
          "You have unsaved changes. Do you want to discard them?",
        )
      ) {
        return;
      }
    }

    // Create a new preset template
    const newPreset: Preset = {
      id: Date.now(),
      name: "",
      note: getNextAvailableNote(),
      first: 0,
      last: 9,
      step: 1,
      color: "#0066cc",
      effect: "static" as EffectType,
      options: {},
    };

    setSelectedPreset(newPreset);
    setSelectedRange(null);
    setEditingPreset(newPreset);
    setHasUnsavedChanges(true); // Mark as having changes since we created a template
  };

  // Handle preset duplicate
  const handlePresetDuplicate = (preset: Preset): void => {
    const newPreset = {
      ...preset,
      id: Date.now(),
      name: `${preset.name} Copy`,
      note: getNextAvailableNote(),
    };
    setPresets((prev) => [...prev, newPreset]);
  };

  // Handle preset delete
  const handlePresetDelete = (preset: Preset): void => {
    if (
      window.confirm(
        `Are you sure you want to delete "${preset.name || `Preset ${preset.note}`}"?`,
      )
    ) {
      setPresets((prev) => prev.filter((p) => p.id !== preset.id));
      if (selectedPreset?.id === preset.id) {
        setSelectedPreset(null);
      }
    }
  };

  // Handle preset mirror
  const handlePresetMirror = (): void => {
    if (!selectedPreset) return;

    const centerPoint = 75; // Middle of 150 LEDs
    const originalStart = Math.min(selectedPreset.first, selectedPreset.last);
    const originalEnd = Math.max(selectedPreset.first, selectedPreset.last);

    // Calculate mirrored positions
    const mirroredStart = centerPoint + (centerPoint - originalEnd);
    const mirroredEnd = centerPoint + (centerPoint - originalStart);

    const mirroredPreset: Preset = {
      ...selectedPreset,
      id: Date.now(),
      name: `${selectedPreset.name || ""} (Mirrored)`,
      note: getNextAvailableNote(),
      first: mirroredStart,
      last: mirroredEnd,
    };

    setPresets((prev) => [...prev, mirroredPreset]);
  };

  // Get next available MIDI note
  const getNextAvailableNote = (): number => {
    const usedNotes = getUsedMidiNotes();
    for (let note = 30; note <= 127; note++) {
      if (!usedNotes.includes(note)) {
        return note;
      }
    }
    return 30;
  };

  // Handle save mapping
  const handleSaveMapping = async (): Promise<void> => {
    if (!mapping || !name) return;

    try {
      setSaveStatus("saving");
      setError(null);

      const updatedMapping: MappingFile = {
        ...mapping,
        presets: presets
          .map((preset) => ({
            ...preset,
            // Remove UI-specific fields when saving
            id: undefined,
          }))
          .filter((preset) => preset.note !== undefined),
      };

      await api.mappings.save(name, updatedMapping);

      setSaveStatus("saved");
      setHasUnsavedChanges(false);

      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      setSaveStatus(null);
      console.error("Failed to save mapping:", err);
    }
  };

  // Handle navigation away
  const handleBack = (): void => {
    if (hasUnsavedChanges) {
      if (
        !window.confirm(
          "You have unsaved changes. Do you want to discard them?",
        )
      ) {
        return;
      }
    }
    navigate("/mappings");
  };

  if (loading) {
    return (
      <div className="p-8 h-screen overflow-auto">
        <div className="flex justify-center items-center h-96 text-secondary">
          Loading mapping...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-screen overflow-auto">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Error loading mapping</div>
          <div className="text-secondary mb-6">{error}</div>
          <Link
            to="/mappings"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors no-underline"
          >
            Back to Mappings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-default bg-gray-850 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="px-3 py-1 bg-gray-700 text-secondary rounded hover:bg-gray-600 hover:text-primary transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-semibold">{mapping?.name || name}</h1>
              <p className="text-sm text-secondary">
                {mapping?.description || "No description available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <div
                className={`text-sm px-3 py-1 rounded ${
                  saveStatus === "saving"
                    ? "bg-yellow-600/20 text-yellow-400"
                    : "bg-green-600/20 text-green-400"
                }`}
              >
                {saveStatus === "saving" ? "Saving..." : "✓ Saved"}
              </div>
            )}

            <button
              onClick={handleSaveMapping}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Mapping
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* LED Strip Visualization */}
        <div className="border-b border-default p-6 flex-shrink-0">
          <LEDStrip
            ledCount={150}
            mappings={generateLEDMappings()}
            selectedRange={selectedRange}
            selectedPreset={selectedPreset}
            editingRange={editingRange}
            onRangeSelect={handleRangeSelect}
            onLEDClick={() => {}}
          />
        </div>

        {/* Editor Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Preset List */}
          <div className="w-80 border-r border-default p-6 overflow-y-auto">
            <PresetList
              presets={presets}
              selectedPreset={selectedPreset}
              onPresetSelect={handlePresetSelect}
              onPresetAdd={handlePresetAdd}
              onPresetDuplicate={handlePresetDuplicate}
              onPresetDelete={handlePresetDelete}
              onPresetMirror={handlePresetMirror}
            />
          </div>

          {/* Right Panel - Preset Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <PresetEditor
              preset={selectedPreset}
              selectedRange={selectedRange}
              onPresetChange={handlePresetChange}
              onPresetSave={handlePresetSave}
              onPresetCancel={handlePresetCancel}
              onCreateNew={handlePresetAdd}
              availableNotes={getUsedMidiNotes()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingEditor;
