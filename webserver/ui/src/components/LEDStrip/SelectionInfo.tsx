import React from "react";

interface SelectionInfoProps {
  isSelecting: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectedRange: { range: number[] } | null;
}

const SelectionInfo: React.FC<SelectionInfoProps> = ({
  isSelecting,
  selectionStart,
  selectionEnd,
  selectedRange,
}) => {
  return (
    <div className="mt-4 text-sm text-secondary min-h-[1.25rem]">
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
      ) : (
        <span className="opacity-0">No selection</span>
      )}
    </div>
  );
};

export default SelectionInfo;
