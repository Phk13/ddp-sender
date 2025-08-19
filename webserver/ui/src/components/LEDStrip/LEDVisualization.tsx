import React from "react";

interface LEDVisualizationProps {
  leds: number[];
  splitPoint: number;
  isSelecting: boolean;
  stripRef: React.RefObject<HTMLDivElement | null>;
  onMouseUp: () => void;
  onStripClick: (event: React.MouseEvent) => void;
  onMouseDown: (ledIndex: number, event: React.MouseEvent) => void;
  onMouseEnter: (ledIndex: number) => void;
  isLEDSelected: (ledIndex: number) => boolean;
  isLEDInSelectedPreset: (ledIndex: number) => boolean | undefined;
  isLEDInEditingRange: (ledIndex: number) => boolean;
  getLEDColor: (ledIndex: number) => string;
  getLEDOpacity: (ledIndex: number) => number;
}

const LEDVisualization: React.FC<LEDVisualizationProps> = ({
  leds,
  splitPoint,
  isSelecting,
  stripRef,
  onMouseUp,
  onStripClick,
  onMouseDown,
  onMouseEnter,
  isLEDSelected,
  isLEDInSelectedPreset,
  isLEDInEditingRange,
  getLEDColor,
  getLEDOpacity,
}) => {
  return (
    <div
      ref={stripRef}
      className="led-strip bg-gray-900 border border-default rounded-lg p-6 mb-4 cursor-crosshair select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onStripClick}
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
                onMouseDown={(e) => onMouseDown(ledIndex, e)}
                onMouseEnter={() => onMouseEnter(ledIndex)}
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
    </div>
  );
};

export default LEDVisualization;
