import {
  Preset,
  EffectType,
  EffectOptions,
  DecayOptions,
  SweepOptions,
  SyncWalkOptions,
} from "../types";

/**
 * Utility functions for working with presets
 * This file demonstrates TypeScript benefits for complex domain logic
 */

// Type-safe preset validation
export function validatePreset(preset: Preset): string[] {
  const errors: string[] = [];

  if (preset.note < 0 || preset.note > 127) {
    errors.push("MIDI note must be between 0 and 127");
  }

  if (preset.first < 1 || preset.first > 150) {
    errors.push("First LED must be between 1 and 150");
  }

  if (preset.last < 1 || preset.last > 150) {
    errors.push("Last LED must be between 1 and 150");
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(preset.color)) {
    errors.push("Color must be a valid hex format (#rrggbb)");
  }

  // Type-safe effect options validation
  if (preset.effect === "decay") {
    const options = preset.options as DecayOptions;
    if (options.decay_coef <= 0 || options.decay_coef > 1) {
      errors.push("Decay coefficient must be between 0.001 and 1.0");
    }
  }

  if (preset.effect === "sweep") {
    const options = preset.options as SweepOptions;
    if (options.speed <= 0 || options.speed > 10) {
      errors.push("Sweep speed must be between 0.1 and 10");
    }
    if (options.bleed < 0 || options.bleed > 5) {
      errors.push("Sweep bleed must be between 0 and 5");
    }
  }

  if (preset.effect === "syncWalk") {
    const options = preset.options as SyncWalkOptions;
    if (options.amount < 1 || options.amount > 20) {
      errors.push("SyncWalk amount must be between 1 and 20");
    }
  }

  return errors;
}

// Generate LED range from preset parameters
export function generateLEDRange(preset: Preset): number[] {
  const range: number[] = [];
  const start = Math.min(preset.first, preset.last);
  const end = Math.max(preset.first, preset.last);
  const step = Math.abs(preset.step) || 1;

  if (preset.first <= preset.last) {
    // Forward range
    for (let i = start; i <= end; i += step) {
      range.push(i);
    }
  } else {
    // Reverse range
    for (let i = preset.first; i >= preset.last; i -= step) {
      range.push(i);
    }
  }

  return range;
}

// Create mirrored preset around center point
export function mirrorPreset(preset: Preset, centerPoint: number = 75): Preset {
  const originalStart = Math.min(preset.first, preset.last);
  const originalEnd = Math.max(preset.first, preset.last);

  // Calculate mirrored positions
  const mirroredStart = centerPoint + (centerPoint - originalEnd);
  const mirroredEnd = centerPoint + (centerPoint - originalStart);

  return {
    ...preset,
    id: Date.now(), // New ID for mirrored preset
    name: `${preset.name || "Preset"} (Mirrored)`,
    first: mirroredStart,
    last: mirroredEnd,
    // Keep same step, color, effect, and options
  };
}

// Get default options for effect type
export function getDefaultEffectOptions(effectType: EffectType): EffectOptions {
  switch (effectType) {
    case "static":
      return {};
    case "decay":
      return { decay_coef: 0.01 };
    case "sweep":
      return {
        speed: 1.0,
        bleed: 0.5,
        bleed_before: false,
        bleed_after: true,
      };
    case "syncWalk":
      return { amount: 5 };
    default:
      return {};
  }
}

// Check if two presets have overlapping LED ranges
export function hasOverlappingRange(preset1: Preset, preset2: Preset): boolean {
  const range1 = generateLEDRange(preset1);
  const range2 = generateLEDRange(preset2);

  return range1.some((led) => range2.includes(led));
}

// Find conflicts between presets
export function findPresetConflicts(presets: Preset[]): Array<{
  preset1: Preset;
  preset2: Preset;
  type: "midi_note" | "led_range";
}> {
  const conflicts: Array<{
    preset1: Preset;
    preset2: Preset;
    type: "midi_note" | "led_range";
  }> = [];

  for (let i = 0; i < presets.length; i++) {
    for (let j = i + 1; j < presets.length; j++) {
      const preset1 = presets[i];
      const preset2 = presets[j];

      // Check MIDI note conflicts
      if (preset1.note === preset2.note) {
        conflicts.push({
          preset1,
          preset2,
          type: "midi_note",
        });
      }

      // Check LED range overlaps
      if (hasOverlappingRange(preset1, preset2)) {
        conflicts.push({
          preset1,
          preset2,
          type: "led_range",
        });
      }
    }
  }

  return conflicts;
}

// Get next available MIDI note
export function getNextAvailableMidiNote(
  usedNotes: number[],
  startFrom: number = 30,
): number {
  for (let note = startFrom; note <= 127; note++) {
    if (!usedNotes.includes(note)) {
      return note;
    }
  }
  return startFrom; // Fallback
}

// Convert preset to API format (snake_case)
export function presetToApiFormat(preset: Preset): Record<string, unknown> {
  return {
    name: preset.name,
    note: preset.note,
    first: preset.first,
    last: preset.last,
    step: preset.step,
    color: preset.color,
    effect: preset.effect,
    options: preset.options,
  };
}

// Convert API format to preset (camelCase)
export function presetFromApiFormat(data: Record<string, unknown>): Preset {
  return {
    id: data.id as number,
    name: data.name as string,
    note: data.note as number,
    first: data.first as number,
    last: data.last as number,
    step: data.step as number,
    color: data.color as string,
    effect: data.effect as EffectType,
    options: data.options as EffectOptions,
  };
}

// Calculate preset statistics
export interface PresetStats {
  totalLEDs: number;
  ledRange: string;
  effectType: EffectType;
  midiNote: number;
  hasConflicts: boolean;
}

export function calculatePresetStats(
  preset: Preset,
  allPresets: Preset[],
): PresetStats {
  const range = generateLEDRange(preset);
  const conflicts = findPresetConflicts([
    preset,
    ...allPresets.filter((p) => p.id !== preset.id),
  ]);

  return {
    totalLEDs: range.length,
    ledRange: `${Math.min(...range)}-${Math.max(...range)}`,
    effectType: preset.effect,
    midiNote: preset.note,
    hasConflicts: conflicts.length > 0,
  };
}
