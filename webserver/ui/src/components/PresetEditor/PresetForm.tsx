import React from "react";
import { PresetFormData, ValidationErrors } from "../../types";

interface PresetFormProps {
  formData: PresetFormData;
  errors: ValidationErrors;
  availableNotes: number[];
  onFieldChange: (field: keyof PresetFormData, value: any) => void;
}

const PresetForm: React.FC<PresetFormProps> = ({
  formData,
  errors,
  availableNotes,
  onFieldChange,
}) => {
  return (
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
            onFieldChange("name", e.target.value)
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
            onFieldChange("note", parseInt(e.target.value))
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
              onFieldChange("first", parseInt(e.target.value))
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
              onFieldChange("last", parseInt(e.target.value))
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
              onFieldChange("step", parseInt(e.target.value))
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
              onFieldChange("color", e.target.value)
            }
            className="w-12 h-10 bg-gray-850 border border-default rounded cursor-pointer"
          />
          <input
            type="text"
            value={formData.color}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange("color", e.target.value)
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
            onFieldChange("effect", e.target.value)
          }
          className="w-full bg-gray-850 border border-default rounded-md px-3 py-2 text-sm text-primary"
        >
          <option value="static">Static (On/Off)</option>
          <option value="decay">Decay (Fade Out)</option>
          <option value="sweep">Sweep (Moving Wave)</option>
          <option value="syncWalk">Sync Walk (Walking Pattern)</option>
        </select>
      </div>
    </div>
  );
};

export default PresetForm;
