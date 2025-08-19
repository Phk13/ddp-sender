import React from "react";
import { LEDRange } from "../../types";

interface QuickSelection {
  name: string;
  start: number;
  end: number;
  description: string;
}

interface QuickSelectionToolsProps {
  onRangeSelect: (range: LEDRange | null) => void;
}

const QuickSelectionTools: React.FC<QuickSelectionToolsProps> = ({
  onRangeSelect,
}) => {
  // Quick selection presets
  const quickSelections: QuickSelection[] = [
    {
      name: "Left Side",
      start: 0,
      end: 75,
      description: "First half of the strip"
    },
    {
      name: "Right Side",
      start: 75,
      end: 150,
      description: "Second half of the strip"
    },
    {
      name: "Center-Left",
      start: 25,
      end: 75,
      description: "Middle section of left side"
    },
    {
      name: "Center-Right",
      start: 75,
      end: 125,
      description: "Middle section of right side"
    },
    {
      name: "Edge-Left",
      start: 0,
      end: 25,
      description: "Far left edge section"
    },
    {
      name: "Edge-Right",
      start: 125,
      end: 150,
      description: "Far right edge section"
    },
    {
      name: "Select All",
      start: 0,
      end: 150,
      description: "Entire LED strip"
    }
  ];

  // Handle quick selection
  const handleQuickSelection = (start: number, end: number) => {
    const length = end - start;
    onRangeSelect({
      start,
      end,
      range: Array.from({ length }, (_, i) => i + start),
      step: 1,
    } as LEDRange);
  };

  return (
    <div className="flex gap-2 text-sm flex-wrap">
      {quickSelections.map((selection, index) => (
        <button
          key={index}
          className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
          onClick={() => handleQuickSelection(selection.start, selection.end)}
          title={selection.description}
        >
          {selection.name} [{selection.start}, {selection.end})
        </button>
      ))}
      <button
        className="px-3 py-1 bg-gray-800 text-secondary rounded hover:bg-gray-700 hover:text-primary transition-colors"
        onClick={() => onRangeSelect(null)}
        title="Clear current selection"
      >
        Clear
      </button>
    </div>
  );
};

export default QuickSelectionTools;
