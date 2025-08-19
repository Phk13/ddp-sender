import React from "react";
import { Preset } from "../../types";

interface PresetStatsProps {
  presets: Preset[];
}

const PresetStats: React.FC<PresetStatsProps> = ({ presets }) => {
  if (presets.length === 0) return null;

  const uniqueNotes = new Set(presets.map((p: Preset) => p.note)).size;

  return (
    <div className="mt-4 pt-3 border-t border-default text-xs text-secondary">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted">Total presets:</span> {presets.length}
        </div>
        <div>
          <span className="text-muted">MIDI notes used:</span> {uniqueNotes}
        </div>
      </div>
    </div>
  );
};

export default PresetStats;
