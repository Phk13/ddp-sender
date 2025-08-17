import React, { useState, useCallback, useRef } from "react";
import { LEDStripProps, LEDRange } from "../../types";

const LEDStrip: React.FC<LEDStripProps> = ({
  ledCount = 150,
  mappings = [],
  selectedRange = null,
  selectedPreset = null,
  editingRange = null,
  onRangeSelect = () => {},
  onLEDClick = () => {},
  className = "",
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Generate array of LED positions (0-based indexing)
  const leds = Array.from({ length: ledCount }, (_, i) => i);

  // LED strip configuration - split at 74/75
  const splitPoint = 74;

  // Get color for LED based on mappings
  const getLEDColor = useCallback(
    (ledIndex: number) => {
      // Check if this LED is part of the selected preset's range
      if (selectedPreset) {
        const presetMapping = mappings.find(
          (m) => m.preset.id === selectedPreset.id,
        );
        if (presetMapping && presetMapping.range.includes(ledIndex)) {
          return presetMapping.color;
        }
      }

      // Find any other mapping that includes this LED
      const mapping = mappings.find(
        (m) => m.range && m.range.includes(ledIndex),
      );

      if (mapping) {
        return mapping.color || "#0066cc";
      }

      return "#404040"; // Default color for unmapped LEDs
    },
    [mappings, selectedPreset],
  );

  // Check if LED is in selected range or preset range
  const isLEDSelected = useCallback(
    (ledIndex: number) => {
      if (selectedRange) {
        return selectedRange.range.includes(ledIndex);
      }

      if (isSelecting && selectionStart !== null && selectionEnd !== null) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        return ledIndex >= start && ledIndex <= end;
      }

      return false;
    },
    [selectedRange, isSelecting, selectionStart, selectionEnd],
  );

  // Check if LED is in editing range
  const isLEDInEditingRange = useCallback(
    (ledIndex: number) => {
      if (!editingRange) return false;
      return editingRange.range.includes(ledIndex);
    },
    [editingRange],
  );

  // Check if LED is part of the selected preset
  const isLEDInSelectedPreset = useCallback(
    (ledIndex: number) => {
      if (!selectedPreset) return false;
      const presetMapping = mappings.find(
        (m) => m.preset.id === selectedPreset.id,
      );
      return presetMapping && presetMapping.range.includes(ledIndex);
    },
    [selectedPreset, mappings],
  );

  // Get LED opacity based on mapping
  const getLEDOpacity = useCallback(
    (ledIndex: number) => {
      if (isLEDInSelectedPreset(ledIndex)) {
        return 1.0; // Selected preset LEDs are fully opaque
      }

      const mapping = mappings.find(
        (m) => m.range && m.range.includes(ledIndex),
      );

      if (mapping) {
        return 0.7; // Other mapped LEDs are semi-opaque
      }

      return 0.3; // Unmapped LEDs are more transparent
    },
    [mappings, isLEDInSelectedPreset],
  );

  // Handle mouse down on LED
  const handleMouseDown = (ledIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    setIsSelecting(true);
    setSelectionStart(ledIndex);
    setSelectionEnd(ledIndex);
    onLEDClick(ledIndex);
  };

  // Handle mouse enter on LED during selection
  const handleMouseEnter = (ledIndex: number) => {
    if (isSelecting && selectionStart !== null) {
      setSelectionEnd(ledIndex);
    }
  };

  // Handle mouse up - finish selection
  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      const range: number[] = [];

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      onRangeSelect({
        start,
        end,
        range,
        step: 1,
      });
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Handle click on strip background
  const handleStripClick = (event: React.MouseEvent) => {
    if (event.target === stripRef.current) {
      onRangeSelect(null); // Clear selection
    }
  };

  // Count active segments
  const activeSegments = mappings.filter(
    (m) => m.range && m.range.length > 0,
  ).length;

  return (
    <div className={`led-strip-container ${className}`}>
      {/* LED Strip Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          LED Strip ({ledCount} LEDs) - {activeSegments} Active Segments
        </h3>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-600 opacity-80"></div>
            <span>Mapped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-blue-400"></div>
            <span>Selected Preset</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400 ring-2 ring-orange-400"></div>
            <span>Editing Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400"></div>
            <span>User Selection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-red-400"></div>
            <span>Split Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600 opacity-30"></div>
            <span>Unmapped</span>
          </div>
        </div>
      </div>

      {/* LED Strip Visualization */}
      <div
        ref={stripRef}
        className="led-strip bg-gray-900 border border-default rounded-lg p-6 mb-4 cursor-crosshair select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleStripClick}
      >
        {/* Full Strip with better sizing */}
        <div className="w-full">
          <div className="text-sm text-muted mb-3">LED Strip Overview:</div>
          <div className="bg-gray-800 rounded-lg p-4 w-full">
            {/* LED grid - single line, auto-sized to fit */}
            <div className="flex w-full justify-start" style={{ gap: "1px" }}>
              {leds.map((ledIndex) => (
                <div
                  key={ledIndex}
                  className={`
                    led-element relative cursor-pointer transition-all duration-150
                    ${isLEDSelected(ledIndex) ? "ring-2 ring-yellow-400" : ""}
                    ${isLEDInSelectedPreset(ledIndex) ? "ring-2 ring-blue-400" : ""}
                    ${isLEDInEditingRange(ledIndex) ? "ring-2 ring-orange-400" : ""}
                    ${ledIndex === splitPoint || ledIndex === splitPoint + 1 ? "ring-2 ring-red-400" : ""}
                    ${isSelecting ? "cursor-crosshair" : "cursor-pointer"}
                  `}
                  style={{
                    flex: "1 1 0",
                    aspectRatio: "1",
                    maxWidth: "8px",
                    minWidth: "2px",
                    height: "auto",
                    borderRadius: "50%",
                    backgroundColor: isLEDSelected(ledIndex)
                      ? "#fbbf24"
                      : getLEDColor(ledIndex),
                    opacity: getLEDOpacity(ledIndex),
                    border: isLEDInSelectedPreset(ledIndex)
                      ? "2px solid #60a5fa"
                      : isLEDInEditingRange(ledIndex)
                        ? "2px solid #fb923c"
                        : ledIndex === splitPoint || ledIndex === splitPoint + 1
                          ? "2px solid #f87171"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  onMouseDown={(e) => handleMouseDown(ledIndex, e)}
                  onMouseEnter={() => handleMouseEnter(ledIndex)}
                  title={`LED ${ledIndex}${ledIndex === splitPoint || ledIndex === splitPoint + 1 ? " (Split Point)" : ""}${isLEDInSelectedPreset(ledIndex) ? " (Selected Preset)" : ""}${isLEDInEditingRange(ledIndex) ? " (Editing)" : ""}`}
                />
              ))}
            </div>

            {/* Range labels for easier navigation */}
            <div className="mt-3 flex justify-between text-xs text-muted">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>74 | 75</span>
              <span>100</span>
              <span>125</span>
              <span>149</span>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        {(isSelecting || selectedRange) && (
          <div className="mt-4 text-sm text-secondary">
            {isSelecting && selectionStart !== null && selectionEnd !== null ? (
              <span>
                Selecting: LED {Math.min(selectionStart, selectionEnd)} -{" "}
                {Math.max(selectionStart, selectionEnd)} (
                {Math.abs(selectionEnd - selectionStart) + 1} LEDs)
              </span>
            ) : selectedRange ? (
              <span>
                Selected: LED {Math.min(...selectedRange.range)} -{" "}
                {Math.max(...selectedRange.range)} ({selectedRange.range.length}{" "}
                LEDs)
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Quick Selection Tools */}
      <div className="flex gap-2 text-sm flex-wrap">
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() =>
            onRangeSelect({
              start: 0,
              end: 75,
              range: Array.from({ length: 75 }, (_, i) => i),
              step: 1,
            } as LEDRange)
          }
        >
          Left Side [0, 75)
        </button>
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() =>
            onRangeSelect({
              start: 75,
              end: 150,
              range: Array.from({ length: 75 }, (_, i) => i + 75),
              step: 1,
            } as LEDRange)
          }
        >
          Right Side [75, 150)
        </button>
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() =>
            onRangeSelect({
              start: 25,
              end: 75,
              range: Array.from({ length: 50 }, (_, i) => i + 25),
              step: 1,
            } as LEDRange)
          }
        >
          Center-Left [25, 75)
        </button>
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() =>
            onRangeSelect({
              start: 0,
              end: 26,
              range: Array.from({ length: 26 }, (_, i) => i),
              step: 1,
            } as LEDRange)
          }
        >
          Edge-Left [0, 26)
        </button>
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() =>
            onRangeSelect({
              start: 0,
              end: 150,
              range: Array.from({ length: 150 }, (_, i) => i),
              step: 1,
            } as LEDRange)
          }
        >
          Select All [0, 150)
        </button>
        <button
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() => onRangeSelect(null)}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default LEDStrip;
