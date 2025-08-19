import React, { useState, useCallback, useRef } from "react";
import { LEDStripProps } from "../../types";
import LEDStripHeader from "./LEDStripHeader";
import LEDVisualization from "./LEDVisualization";
import SelectionInfo from "./SelectionInfo";
import QuickSelectionTools from "./QuickSelectionTools";

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
      <LEDStripHeader ledCount={ledCount} activeSegments={activeSegments} />

      <LEDVisualization
        leds={leds}
        splitPoint={splitPoint}
        isSelecting={isSelecting}
        stripRef={stripRef}
        onMouseUp={handleMouseUp}
        onStripClick={handleStripClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        isLEDSelected={isLEDSelected}
        isLEDInSelectedPreset={isLEDInSelectedPreset}
        isLEDInEditingRange={isLEDInEditingRange}
        getLEDColor={getLEDColor}
        getLEDOpacity={getLEDOpacity}
      />

      <SelectionInfo
        isSelecting={isSelecting}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        selectedRange={selectedRange}
      />

      <QuickSelectionTools onRangeSelect={onRangeSelect} />
    </div>
  );
};

export default LEDStrip;
