import { useState, useEffect } from "react";
import { Edit3, Eye, Loader, Eraser, Play, Save, X } from "lucide-react";
import {
  Preset,
  PresetEditorProps,
  PresetFormData,
  ValidationErrors,
  EffectType,
  DecayOptions,
  SweepOptions,
  SyncWalkOptions,
} from "../../types";
import {
  DecayOptions as DecayOptionsComponent,
  SweepOptions as SweepOptionsComponent,
  SyncWalkOptions as SyncWalkOptionsComponent,
  StaticOptions as StaticOptionsComponent,
} from "../EffectOptions";
import { api } from "../../api/client";

const PresetEditor = ({
  preset = null,
  selectedRange = null,
  onPresetChange = () => {},
  onPresetSave = () => {},
  onPresetCancel = () => {},
  onCreateNew = () => {},
  availableNotes = [],
  className = "",
}: PresetEditorProps) => {
  const [formData, setFormData] = useState<PresetFormData>({
    name: "",
    note: "",
    first: "",
    last: "",
    step: 1,
    color: "#0066cc",
    effect: "static",
    options: {},
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isPreviewingEffect, setIsPreviewingEffect] = useState<boolean>(false);
  const [isStaticPreviewActive, setIsStaticPreviewActive] =
    useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Effect options templates
  const effectOptions: Record<string, Record<string, any>> = {
    static: {},
    decay: {
      decay_coef: 0.01,
    },
    sweep: {
      speed: 1.0,
      bleed: 0.5,
      bleed_after: true,
      bleed_before: false,
    },
    syncWalk: {
      amount: 5,
    },
  };

  // Update form when preset changes
  useEffect(() => {
    if (preset) {
      setFormData({
        name: preset.name || "",
        note: preset.note || "",
        first: preset.first || "",
        last: preset.last || "",
        step: preset.step || 1,
        color: preset.color || "#0066cc",
        effect: preset.effect || "static",
        options:
          preset.options || effectOptions[preset.effect || "static"] || {},
      });
      setHasChanges(false);
      setErrors({});
    } else {
      // Clear form for new preset
      setFormData({
        name: "",
        note: "",
        first: "",
        last: "",
        step: 1,
        color: "#0066cc",
        effect: "static",
        options: effectOptions.static,
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [preset]);

  // Update range when selectedRange changes
  useEffect(() => {
    if (selectedRange && selectedRange.start && selectedRange.end) {
      setFormData((prev) => ({
        ...prev,
        first: selectedRange.start,
        last: selectedRange.end,
        step: selectedRange.step || 1,
      }));
      setHasChanges(true);
    }
  }, [selectedRange]);

  // Handle form field changes
  const handleChange = (field: keyof PresetFormData, value: any): void => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If effect type changes, update options
      if (field === "effect") {
        newData.options = { ...(effectOptions[value] || {}) };
      }

      return newData;
    });
    setHasChanges(true);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Notify parent of changes - use updated values, not stale formData
    const updatedFormData = { ...formData, [field]: value };
    const numericFormData = {
      ...updatedFormData,
      note:
        typeof updatedFormData.note === "string"
          ? parseInt(updatedFormData.note) || 0
          : updatedFormData.note,
      first:
        typeof updatedFormData.first === "string"
          ? parseInt(updatedFormData.first) || 0
          : updatedFormData.first,
      last:
        typeof updatedFormData.last === "string"
          ? parseInt(updatedFormData.last) || 0
          : updatedFormData.last,
    };
    onPresetChange(numericFormData);
  };

  // Handle preview effect on LEDs
  const handlePreviewEffect = async (): Promise<void> => {
    setIsPreviewingEffect(true);
    setPreviewError(null);

    try {
      const first =
        typeof formData.first === "string"
          ? parseInt(formData.first) || 0
          : formData.first;
      const last =
        typeof formData.last === "string"
          ? parseInt(formData.last) || 0
          : formData.last;

      await api.effects.preview(
        first,
        last,
        formData.step,
        formData.color,
        formData.effect,
        formData.options,
      );

      // Enable button immediately after request completes
      setIsPreviewingEffect(false);
    } catch (err) {
      setPreviewError(api.utils.getErrorMessage(err));
      setIsPreviewingEffect(false);
    }
  };

  // Handle static preview mouse down (turn on)
  const handleStaticPreviewMouseDown = async (): Promise<void> => {
    if (formData.effect !== "static") return;

    setIsStaticPreviewActive(true);
    setPreviewError(null);

    try {
      const first =
        typeof formData.first === "string"
          ? parseInt(formData.first) || 0
          : formData.first;
      const last =
        typeof formData.last === "string"
          ? parseInt(formData.last) || 0
          : formData.last;

      await api.effects.preview(
        first,
        last,
        formData.step,
        formData.color,
        formData.effect,
        formData.options,
      );
    } catch (err) {
      setPreviewError(api.utils.getErrorMessage(err));
      setIsStaticPreviewActive(false);
    }
  };

  // Handle static preview mouse up (turn off)
  const handleStaticPreviewMouseUp = async (): Promise<void> => {
    if (formData.effect !== "static" || !isStaticPreviewActive) return;

    setIsStaticPreviewActive(false);

    try {
      const first =
        typeof formData.first === "string"
          ? parseInt(formData.first) || 0
          : formData.first;
      const last =
        typeof formData.last === "string"
          ? parseInt(formData.last) || 0
          : formData.last;

      // Send preview OFF for static effects
      await api.effects.previewOff(
        first,
        last,
        formData.step,
        formData.color,
        formData.effect,
        formData.options,
      );
    } catch (err) {
      setPreviewError(api.utils.getErrorMessage(err));
    }
  };

  // Clear any preview effects
  const handleClearPreview = async (): Promise<void> => {
    try {
      await api.effects.clearPreview();
      setIsPreviewingEffect(false);
      setIsStaticPreviewActive(false);
      setPreviewError(null);
    } catch (err) {
      setPreviewError(api.utils.getErrorMessage(err));
    }
  };

  // Handle options changes
  const handleOptionChange = (optionKey: string, value: any): void => {
    const newOptions = { ...formData.options, [optionKey]: value };
    setFormData((prev) => ({ ...prev, options: newOptions }));
    setHasChanges(true);
    const updatedFormData = { ...formData, options: newOptions };
    const numericFormData = {
      ...updatedFormData,
      note:
        typeof updatedFormData.note === "string"
          ? parseInt(updatedFormData.note) || 0
          : updatedFormData.note,
      first:
        typeof updatedFormData.first === "string"
          ? parseInt(updatedFormData.first) || 0
          : updatedFormData.first,
      last:
        typeof updatedFormData.last === "string"
          ? parseInt(updatedFormData.last) || 0
          : updatedFormData.last,
    };
    onPresetChange(numericFormData);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const noteNum =
      typeof formData.note === "string"
        ? parseInt(formData.note)
        : formData.note;
    const firstNum =
      typeof formData.first === "string"
        ? parseInt(formData.first)
        : formData.first;
    const lastNum =
      typeof formData.last === "string"
        ? parseInt(formData.last)
        : formData.last;

    if (!noteNum) {
      newErrors.note = "MIDI note is required";
    } else if (
      availableNotes.length > 0 &&
      availableNotes.includes(noteNum) &&
      (!preset || preset.note !== noteNum)
    ) {
      newErrors.note = "This MIDI note is already in use";
    }

    if (!firstNum) {
      newErrors.first = "First LED is required";
    } else if (firstNum < 1 || firstNum > 150) {
      newErrors.first = "First LED must be between 1 and 150";
    }

    if (!lastNum) {
      newErrors.last = "Last LED is required";
    } else if (lastNum < 1 || lastNum > 150) {
      newErrors.last = "Last LED must be between 1 and 150";
    }

    if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "Valid hex color is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = (): void => {
    if (validateForm()) {
      const numericFormData: Preset = {
        id: preset?.id || Date.now(),
        name: formData.name || "",
        note:
          typeof formData.note === "string"
            ? parseInt(formData.note) || 0
            : formData.note,
        first:
          typeof formData.first === "string"
            ? parseInt(formData.first) || 0
            : formData.first,
        last:
          typeof formData.last === "string"
            ? parseInt(formData.last) || 0
            : formData.last,
        step: formData.step,
        color: formData.color,
        effect: formData.effect as EffectType,
        options: formData.options,
      };
      onPresetSave(numericFormData);
      setHasChanges(false);
    }
  };

  // Handle cancel
  const handleCancel = (): void => {
    onPresetCancel();
    setHasChanges(false);
  };

  // Render effect-specific options
  const renderEffectOptions = () => {
    switch (formData.effect) {
      case "decay":
        return (
          <DecayOptionsComponent
            options={(formData.options as DecayOptions) || { decay_coef: 0.01 }}
            onChange={handleOptionChange}
          />
        );

      case "sweep":
        return (
          <SweepOptionsComponent
            options={
              (formData.options as SweepOptions) || {
                speed: 1.0,
                bleed: 0.5,
                bleed_before: false,
                bleed_after: true,
              }
            }
            onChange={handleOptionChange}
          />
        );

      case "syncWalk":
        return (
          <SyncWalkOptionsComponent
            options={(formData.options as SyncWalkOptions) || { amount: 5 }}
            onChange={handleOptionChange}
          />
        );

      default:
        return <StaticOptionsComponent />;
    }
  };

  if (!preset && !selectedRange) {
    return (
      <div className={`preset-editor ${className}`}>
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
      </div>
    );
  }

  return (
    <div className={`preset-editor ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {preset ? "Edit Preset" : "New Preset"}
        </h3>
        {hasChanges && (
          <div className="text-xs text-yellow-400">● Unsaved changes</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-primary-500 hover:border-primary-400 font-medium"
        >
          <Save size={16} />
          {preset ? "Save Changes" : "Create Preset"}
        </button>
        {formData.effect === "static" ? (
          <button
            onMouseDown={handleStaticPreviewMouseDown}
            onMouseUp={handleStaticPreviewMouseUp}
            onMouseLeave={handleStaticPreviewMouseUp}
            disabled={!formData.first || !formData.last}
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
            onClick={handlePreviewEffect}
            disabled={!formData.first || !formData.last || isPreviewingEffect}
            className="px-4 py-2 bg-gray-700 text-secondary rounded-md hover:bg-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPreviewingEffect ? (
              <>
                <Loader size={16} className="animate-spin" /> Previewing...
              </>
            ) : (
              <>
                {formData.effect === "syncWalk" ? (
                  <Play size={16} />
                ) : (
                  <Eye size={16} />
                )}{" "}
                {formData.effect === "syncWalk"
                  ? "Trigger Step"
                  : "Preview Effect"}
              </>
            )}
          </button>
        )}
        <button
          onClick={handleClearPreview}
          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
          title="Clear any active preview effects"
        >
          <Eraser size={16} />
          Clear
        </button>
        <button
          onClick={handleCancel}
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

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("name", e.target.value)
            }
            placeholder="e.g., Bass Drop Flash"
            className="w-full bg-gray-850 border border-default rounded-md px-3 py-2 text-sm text-primary"
          />
        </div>

        {/* MIDI Note */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            MIDI Note *
          </label>
          <input
            type="number"
            min="0"
            max="127"
            value={formData.note}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("note", parseInt(e.target.value))
            }
            className={`w-full bg-gray-850 border rounded-md px-3 py-2 text-sm text-primary ${
              errors.note ? "border-red-500" : "border-default"
            }`}
          />
          {errors.note && (
            <div className="text-xs text-red-400 mt-1">{errors.note}</div>
          )}
        </div>

        {/* LED Range */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              First LED *
            </label>
            <input
              type="number"
              min="1"
              max="150"
              value={formData.first}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("first", parseInt(e.target.value))
              }
              className={`w-full bg-gray-850 border rounded-md px-3 py-2 text-sm text-primary ${
                errors.first ? "border-red-500" : "border-default"
              }`}
            />
            {errors.first && (
              <div className="text-xs text-red-400 mt-1">{errors.first}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Last LED *
            </label>
            <input
              type="number"
              min="1"
              max="150"
              value={formData.last}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("last", parseInt(e.target.value))
              }
              className={`w-full bg-gray-850 border rounded-md px-3 py-2 text-sm text-primary ${
                errors.last ? "border-red-500" : "border-default"
              }`}
            />
            {errors.last && (
              <div className="text-xs text-red-400 mt-1">{errors.last}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Step
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.step}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("step", parseInt(e.target.value))
              }
              className="w-full bg-gray-850 border border-default rounded-md px-3 py-2 text-sm text-primary"
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Color *
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("color", e.target.value)
              }
              className="w-12 h-10 bg-gray-850 border border-default rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("color", e.target.value)
              }
              placeholder="#0066cc"
              className={`flex-1 bg-gray-850 border rounded-md px-3 py-2 text-sm text-primary font-mono ${
                errors.color ? "border-red-500" : "border-default"
              }`}
            />
          </div>
          {errors.color && (
            <div className="text-xs text-red-400 mt-1">{errors.color}</div>
          )}
        </div>

        {/* Effect Type */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Effect Type
          </label>
          <select
            value={formData.effect}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange("effect", e.target.value)
            }
            className="w-full bg-gray-850 border border-default rounded-md px-3 py-2 text-sm text-primary"
          >
            <option value="static">Static (On/Off)</option>
            <option value="decay">Decay (Fade Out)</option>
            <option value="sweep">Sweep (Moving Wave)</option>
            <option value="syncWalk">Sync Walk (Walking Pattern)</option>
          </select>
        </div>

        {/* Effect Options */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Effect Options
          </label>
          <div className="bg-gray-900 border border-default rounded-md p-4">
            {renderEffectOptions()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresetEditor;
