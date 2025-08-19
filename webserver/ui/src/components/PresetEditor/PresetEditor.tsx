import { useState, useEffect } from "react";
import {
  Preset,
  PresetEditorProps,
  PresetFormData,
  ValidationErrors,
  EffectType,
} from "../../types";
import { api } from "../../api/client";
import PresetEditorHeader from "./PresetEditorHeader";
import EmptyState from "./EmptyState";
import PresetActions from "./PresetActions";
import PresetForm from "./PresetForm";
import EffectOptionsSection from "./EffectOptionsSection";

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

  if (!preset && !selectedRange) {
    return (
      <div className={`preset-editor ${className}`}>
        <EmptyState onCreateNew={onCreateNew} />
      </div>
    );
  }

  return (
    <div className={`preset-editor ${className}`}>
      <PresetEditorHeader isEditing={!!preset} hasChanges={hasChanges} />

      <PresetActions
        hasChanges={hasChanges}
        effect={formData.effect as EffectType}
        isPreviewingEffect={isPreviewingEffect}
        isStaticPreviewActive={isStaticPreviewActive}
        hasValidRange={!!formData.first && !!formData.last}
        previewError={previewError}
        isEditing={!!preset}
        onSave={handleSave}
        onPreviewEffect={handlePreviewEffect}
        onStaticPreviewMouseDown={handleStaticPreviewMouseDown}
        onStaticPreviewMouseUp={handleStaticPreviewMouseUp}
        onClearPreview={handleClearPreview}
        onCancel={handleCancel}
      />

      <PresetForm
        formData={formData}
        errors={errors}
        availableNotes={availableNotes}
        onFieldChange={handleChange}
      />

      <EffectOptionsSection
        effect={formData.effect as EffectType}
        options={formData.options}
        onOptionChange={handleOptionChange}
      />
    </div>
  );
};

export default PresetEditor;
