import React, { useEffect, useState } from "react";
import { SyncWalkOptions as SyncWalkOptionsType } from "../../types";

interface SyncWalkOptionsProps {
  options: SyncWalkOptionsType;
  onChange: (key: string, value: any) => void;
  className?: string;
}

const SyncWalkOptions: React.FC<SyncWalkOptionsProps> = ({
  options,
  onChange,
  className = "",
}) => {
  const amount = options.amount || 5;

  // Animation state for preview
  const [walkStep, setWalkStep] = useState(0);

  // Animate the walking pattern
  useEffect(() => {
    // Reset to 0 when amount changes
    setWalkStep(0);

    const interval = setInterval(() => {
      setWalkStep((prev) => (prev + amount) % 20);
    }, 300);
    return () => clearInterval(interval);
  }, [amount]);

  // Generate walking pattern visualization
  const generateWalkPattern = () => {
    const leds = Array(20).fill(0); // 20 LEDs for preview
    const currentPosition = walkStep % leds.length;

    // Light up LEDs in the walking pattern
    for (let i = 0; i < amount && currentPosition + i < leds.length; i++) {
      leds[currentPosition + i] = 1 - (i / amount) * 0.6; // Fade from bright to dimmer
    }

    return leds;
  };

  const walkLEDs = generateWalkPattern();

  // Amount presets
  const amountPresets = [
    { name: "Single", value: 1, description: "One LED walks" },
    { name: "Small", value: 3, description: "3 LEDs walk together" },
    { name: "Medium", value: 5, description: "5 LEDs walk together" },
    { name: "Large", value: 8, description: "8 LEDs walk together" },
    { name: "Very Large", value: 12, description: "12 LEDs walk together" },
  ];

  return (
    <div className={`syncwalk-options space-y-4 ${className}`}>
      {/* Amount Control */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Walk Amount: {amount} LEDs
        </label>

        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={amount}
            onChange={(e) => onChange("amount", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((amount - 1) / 19) * 100}%, #374151 ${((amount - 1) / 19) * 100}%, #374151 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-muted">
            <span>1 LED</span>
            <span>20 LEDs</span>
          </div>
        </div>

        {/* Amount presets */}
        <div className="flex flex-wrap gap-2 mt-3">
          {amountPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange("amount", preset.value)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                amount === preset.value
                  ? "border-violet-500 bg-violet-600/20 text-violet-400"
                  : "border-default bg-gray-800 text-secondary hover:border-violet-500"
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Amount Input */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          Precise Amount
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={amount}
          onChange={(e) => onChange("amount", parseInt(e.target.value) || 5)}
          className="w-32 bg-gray-850 border border-default rounded-md px-3 py-1 text-sm text-primary"
          placeholder="5"
        />
        <div className="text-xs text-muted mt-1">
          Number of LEDs that walk together in the pattern
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Walking Pattern Preview
        </label>
        <div className="bg-gray-850 border border-default rounded-lg p-4">
          <div className="flex justify-center gap-1 mb-3">
            {walkLEDs.map((intensity, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-600 transition-all duration-300"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                  boxShadow:
                    intensity > 0.5
                      ? `0 0 8px rgba(139, 92, 246, ${intensity * 0.8})`
                      : "none",
                  transform: intensity > 0 ? "scale(1.1)" : "scale(1)",
                }}
                title={`LED ${index}: ${Math.round(intensity * 100)}%`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-xs text-muted mb-2">
              Walking group of {amount} LEDs | Current step:{" "}
              {Math.floor(walkStep / amount) + 1}
            </div>
            <div className="text-xs text-violet-400">
              ● = Active walking LEDs | Pattern advances on each MIDI trigger
            </div>
          </div>
        </div>
      </div>

      {/* Behavior Explanation */}
      <div className="bg-gray-800 border border-default rounded-lg p-3">
        <h4 className="text-sm font-medium text-primary mb-2">
          SyncWalk Behavior
        </h4>
        <ul className="text-xs text-secondary space-y-1">
          <li>
            • Each MIDI trigger advances the walking pattern by {amount}{" "}
            positions
          </li>
          <li>
            • {amount === 1 ? "The single LED" : `All ${amount} LEDs`} move
            together as a group
          </li>
          <li>• Pattern wraps around to the beginning when reaching the end</li>
          <li>• Use MIDI OFF with velocity 1 to clear/reset the pattern</li>
          <li>
            • Perfect for creating synchronized walking effects with the beat
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncWalkOptions;
