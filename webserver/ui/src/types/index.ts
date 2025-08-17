// LED Mapping System Type Definitions

// Core Effect Types
export type EffectType = "static" | "decay" | "sweep" | "syncWalk";

// Effect Options
export interface DecayOptions {
  decay_coef: number;
}

export interface SweepOptions {
  speed: number;
  bleed: number;
  bleed_before: boolean;
  bleed_after: boolean;
}

export interface SyncWalkOptions {
  amount: number;
}

export interface StaticOptions {
  // No options for static effect
}

export type EffectOptions =
  | DecayOptions
  | SweepOptions
  | SyncWalkOptions
  | StaticOptions;

// Preset Definition
export interface Preset {
  id?: number;
  name?: string;
  note: number;
  first: number;
  last: number;
  step: number;
  color: string;
  effect: EffectType;
  options: EffectOptions;
}

// Mapping File Structure
export interface MappingFile {
  name: string;
  description?: string;
  presets: Preset[];
}

// LED Range Selection
export interface LEDRange {
  start: number;
  end: number;
  range: number[];
  step: number;
}

// LED Mapping for Visualization
export interface LEDMapping {
  id: number | string;
  range: number[];
  color: string;
  preset: Preset;
}

// API Response Types
export interface SystemStatus {
  currentMapping: string;
  ledCount: number;
  status: "running" | "stopped" | "error";
}

export interface MappingListItem {
  name: string;
  title: string;
  description?: string;
  presetCount: number;
  lastModified: string;
  isActive: boolean;
}

// API Request Types
export interface SwitchMappingRequest {
  file: string;
}

// API Response Types for Go backend
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: string;
}

// Component Props Types
export interface LEDStripProps {
  ledCount?: number;
  mappings?: LEDMapping[];
  selectedRange?: LEDRange | null;
  selectedPreset?: Preset | null;
  editingRange?: LEDRange | null;
  onRangeSelect?: (range: LEDRange | null) => void;
  onLEDClick?: (ledIndex: number) => void;
  className?: string;
}

export interface PresetListProps {
  presets?: Preset[];
  selectedPreset?: Preset | null;
  onPresetSelect?: (preset: Preset) => void;
  onPresetAdd?: () => void;
  onPresetDuplicate?: (preset: Preset) => void;
  onPresetDelete?: (preset: Preset) => void;
  onPresetMirror?: () => void;
  className?: string;
}

export interface PresetEditorProps {
  preset?: Preset | null;
  selectedRange?: LEDRange | null;
  onPresetChange?: (preset: Partial<Preset>) => void;
  onPresetSave?: (preset: Preset) => void;
  onPresetCancel?: () => void;
  onCreateNew?: () => void;
  availableNotes?: number[];
  className?: string;
}

// Form Data Types
export interface PresetFormData {
  name: string;
  note: string | number;
  first: string | number;
  last: string | number;
  step: number;
  color: string;
  effect: EffectType;
  options: EffectOptions;
}

// Validation Error Types
export interface ValidationErrors {
  name?: string;
  note?: string;
  first?: string;
  last?: string;
  step?: string;
  color?: string;
  effect?: string;
  options?: string;
}

// Save Status Types
export type SaveStatus = "saving" | "saved" | "error" | null;

// MIDI Configuration
export interface MIDIConfig {
  minNote: number;
  maxNote: number;
  commonRange: {
    start: number;
    end: number;
  };
}

// LED Configuration
export interface LEDConfig {
  count: number;
  indexBase: 1; // Always 1-based indexing
  layout: "linear"; // Future: 'matrix' | 'custom'
}

// System Configuration
export interface SystemConfig {
  led: LEDConfig;
  midi: MIDIConfig;
  ports: {
    webUI: number;
    api: number;
    midiUDP: number;
    ddp: number;
  };
  refreshRate: number; // in milliseconds
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

// Route Parameters
export interface MappingEditorParams {
  name: string;
}

// Event Handler Types
export type PresetChangeHandler = (preset: Partial<Preset>) => void;
export type PresetSaveHandler = (preset: Preset) => void;
export type PresetDeleteHandler = (preset: Preset) => void;
export type PresetSelectHandler = (preset: Preset) => void;
export type RangeSelectHandler = (range: LEDRange | null) => void;
export type LEDClickHandler = (ledIndex: number) => void;

// Utility Types
export type PartialPreset = Partial<Preset>;
export type RequiredPreset = Required<Preset>;

// Constants
export const EFFECT_TYPES: readonly EffectType[] = [
  "static",
  "decay",
  "sweep",
  "syncWalk",
] as const;

export const DEFAULT_PRESET: Omit<Preset, "id"> = {
  name: "",
  note: 30,
  first: 1,
  last: 10,
  step: 1,
  color: "#0066cc",
  effect: "static",
  options: {},
};

export const LED_CONFIG: LEDConfig = {
  count: 150,
  indexBase: 1,
  layout: "linear",
};

export const MIDI_CONFIG: MIDIConfig = {
  minNote: 0,
  maxNote: 127,
  commonRange: {
    start: 30,
    end: 127,
  },
};
