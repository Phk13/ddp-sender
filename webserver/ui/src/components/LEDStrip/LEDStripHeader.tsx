import React from "react";

interface LEDStripHeaderProps {
  ledCount: number;
  activeSegments: number;
}

const LEDStripHeader: React.FC<LEDStripHeaderProps> = ({
  ledCount,
  activeSegments,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        LED Strip ({ledCount} LEDs) - {activeSegments} Active Segments
      </h3>
      <div className="flex items-center gap-4 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-green-400"></div>
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
  );
};

export default LEDStripHeader;
