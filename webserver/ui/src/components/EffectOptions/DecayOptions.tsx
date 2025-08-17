import React from "react";
import { DecayOptions as DecayOptionsType } from "../../types";

interface DecayOptionsProps {
  options: DecayOptionsType;
  onChange: (key: string, value: any) => void;
  className?: string;
}

const DecayOptions: React.FC<DecayOptionsProps> = ({
  options,
  onChange,
  className = "",
}) => {
  const decayCoef = options.decay_coef || 0.01;

  // Generate decay curve data for visualization
  const generateDecayCurve = (coef: number) => {
    const points = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const time = i / steps;
      const intensity = Math.exp(-coef * time * 100); // Scale time for visibility
      points.push({ x: time * 100, y: intensity * 100 });
    }
    return points;
  };

  const curveData = generateDecayCurve(decayCoef);
  const pathData = curveData
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${100 - point.y}`)
    .join(" ");

  // Predefined presets for common decay values
  const presets = [
    { name: "Very Slow", value: 0.005, description: "Long fade" },
    { name: "Slow", value: 0.01, description: "Medium fade" },
    { name: "Medium", value: 0.02, description: "Standard fade" },
    { name: "Fast", value: 0.05, description: "Quick fade" },
    { name: "Very Fast", value: 0.1, description: "Instant fade" },
  ];

  return (
    <div className={`decay-options space-y-4 ${className}`}>
      {/* Decay Coefficient Slider */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Decay Coefficient: {decayCoef.toFixed(3)}
        </label>

        <div className="space-y-3">
          {/* Slider */}
          <input
            type="range"
            min="0.001"
            max="0.2"
            step="0.001"
            value={decayCoef}
            onChange={(e) => onChange("decay_coef", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(decayCoef / 0.2) * 100}%, #374151 ${(decayCoef / 0.2) * 100}%, #374151 100%)`,
            }}
          />

          {/* Value labels */}
          <div className="flex justify-between text-xs text-muted">
            <span>0.001 (Slowest)</span>
            <span>0.2 (Fastest)</span>
          </div>
        </div>

        {/* Numerical input for precise control */}
        <div className="mt-2">
          <input
            type="number"
            step="0.001"
            min="0.001"
            max="0.2"
            value={decayCoef}
            onChange={(e) => onChange("decay_coef", parseFloat(e.target.value) || 0.01)}
            className="w-32 bg-gray-850 border border-default rounded-md px-3 py-1 text-sm text-primary"
            placeholder="0.01"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange("decay_coef", preset.value)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                Math.abs(decayCoef - preset.value) < 0.001
                  ? "border-primary-500 bg-primary-600/20 text-primary-400"
                  : "border-default bg-gray-800 text-secondary hover:border-primary-500 hover:text-primary"
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Decay Curve Preview
        </label>
        <div className="bg-gray-850 border border-default rounded-lg p-4">
          <svg
            width="100%"
            height="120"
            viewBox="0 0 100 100"
            className="w-full"
            style={{ maxWidth: "400px" }}
          >
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Axes */}
            <line x1="0" y1="100" x2="100" y2="100" stroke="#6b7280" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="100" stroke="#6b7280" strokeWidth="1" />

            {/* Decay curve */}
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Labels */}
            <text x="50" y="115" textAnchor="middle" className="text-xs fill-gray-400">
              Time
            </text>
            <text
              x="-5"
              y="5"
              textAnchor="middle"
              className="text-xs fill-gray-400"
              transform="rotate(-90 -5 5)"
            >
              Intensity
            </text>
          </svg>

          <div className="text-xs text-muted mt-2 text-center">
            {decayCoef < 0.01
              ? "Very gradual fade - good for ambient effects"
              : decayCoef < 0.03
              ? "Moderate fade - good for musical beats"
              : decayCoef < 0.08
              ? "Quick fade - good for percussion"
              : "Very fast fade - good for staccato effects"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecayOptions;
