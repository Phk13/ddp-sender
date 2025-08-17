import React, { useEffect, useState } from "react";
import { SweepOptions as SweepOptionsType } from "../../types";

interface SweepOptionsProps {
  options: SweepOptionsType;
  onChange: (key: string, value: any) => void;
  className?: string;
}

const SweepOptions: React.FC<SweepOptionsProps> = ({
  options,
  onChange,
  className = "",
}) => {
  const speed = options.speed || 1.0;
  const bleed = options.bleed || 0.5;
  const bleedBefore = options.bleed_before || false;
  const bleedAfter = options.bleed_after || true;

  // Animation state for preview
  const [animationTime, setAnimationTime] = useState(0);

  // Animate the preview
  useEffect(() => {
    // Reset to 0 when any parameter changes
    setAnimationTime(0);

    const interval = setInterval(() => {
      setAnimationTime((prev) => (prev + speed * 0.05) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [speed, bleed, bleedBefore, bleedAfter]);

  // Generate sweep visualization
  const generateSweepLEDs = () => {
    const leds = Array(20).fill(0); // 20 LEDs for preview
    const currentStep = animationTime * (leds.length - 1);
    const intStep = Math.floor(currentStep); // Backend uses int(currentStep)

    for (let i = 0; i < leds.length; i++) {
      let intensity = 0;

      // Main sweep position
      if (intStep === i) {
        intensity = 1.0; // Full brightness at sweep position
      } else if ((bleedBefore && i > intStep) || (bleedAfter && i < intStep)) {
        // Bleed calculation
        const distance = Math.abs(intStep - i);

        // Backend formula: brightness = math.Pow(distance, 2.2) * bleed
        const brightness = Math.pow(distance, 2.2) * bleed;

        // Backend formula: lightness = originalLightness / brightness
        // Using 1.0 as original lightness for simulation
        let lightness = 1.0 / brightness;

        // Backend minimum threshold check
        if (lightness < 0.0065) {
          lightness = 0;
        } else if (lightness > 1.0) {
          lightness = 1.0;
        }

        intensity = lightness;
      }

      leds[i] = intensity;
    }

    return leds;
  };

  const sweepLEDs = generateSweepLEDs();

  // Speed presets
  const speedPresets = [
    { name: "Very Slow", value: 0.2 },
    { name: "Slow", value: 0.5 },
    { name: "Medium", value: 1.0 },
    { name: "Fast", value: 2.0 },
    { name: "Very Fast", value: 4.0 },
  ];

  // Bleed presets
  const bleedPresets = [
    { name: "None", value: 0 },
    { name: "Subtle", value: 0.3 },
    { name: "Medium", value: 0.5 },
    { name: "Strong", value: 1.0 },
    { name: "Very Strong", value: 2.0 },
  ];

  return (
    <div className={`sweep-options space-y-4 ${className}`}>
      {/* Speed Control */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Speed: {speed.toFixed(1)}x
        </label>

        <div className="space-y-3">
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={speed}
            onChange={(e) => onChange("speed", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((speed - 0.1) / 4.9) * 100}%, #374151 ${((speed - 0.1) / 4.9) * 100}%, #374151 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-muted">
            <span>0.1x (Slowest)</span>
            <span>5.0x (Fastest)</span>
          </div>
        </div>

        {/* Speed presets */}
        <div className="flex flex-wrap gap-2 mt-2">
          {speedPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange("speed", preset.value)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                Math.abs(speed - preset.value) < 0.1
                  ? "border-green-500 bg-green-600/20 text-green-400"
                  : "border-default bg-gray-800 text-secondary hover:border-green-500"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bleed Control */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Bleed Amount: {bleed.toFixed(1)}
        </label>

        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={bleed}
            onChange={(e) => onChange("bleed", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(bleed / 3) * 100}%, #374151 ${(bleed / 3) * 100}%, #374151 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-muted">
            <span>0 (No Bleed)</span>
            <span>3 (Max Bleed)</span>
          </div>
        </div>

        {/* Bleed presets */}
        <div className="flex flex-wrap gap-2 mt-2">
          {bleedPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange("bleed", preset.value)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                Math.abs(bleed - preset.value) < 0.1
                  ? "border-amber-500 bg-amber-600/20 text-amber-400"
                  : "border-default bg-gray-800 text-secondary hover:border-amber-500"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bleed Direction Controls */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Bleed Direction
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={bleedBefore}
              onChange={(e) => onChange("bleed_before", e.target.checked)}
              className="rounded border-default accent-blue-500"
            />
            <span className="text-secondary">Bleed Before</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={bleedAfter}
              onChange={(e) => onChange("bleed_after", e.target.checked)}
              className="rounded border-default accent-blue-500"
            />
            <span className="text-secondary">Bleed After</span>
          </label>
        </div>
        <div className="text-xs text-muted mt-1">
          Control which direction the sweep effect bleeds to adjacent LEDs
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Sweep Animation Preview
        </label>
        <div className="bg-gray-850 border border-default rounded-lg p-4">
          <div className="flex justify-center gap-1 mb-3">
            {sweepLEDs.map((intensity, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-600 transition-all duration-75"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                  boxShadow:
                    intensity > 0.5
                      ? `0 0 8px rgba(16, 185, 129, ${intensity * 0.8})`
                      : "none",
                }}
                title={`LED ${index}: ${Math.round(intensity * 100)}%`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-xs text-muted mb-2">
              Speed: {speed}x | Bleed: {bleed} |
              {bleedBefore && bleedAfter
                ? " Both directions"
                : bleedBefore
                  ? " Before only"
                  : bleedAfter
                    ? " After only"
                    : " No bleed"}
            </div>
            <div className="text-xs text-green-400">
              ● = Main sweep position | ◐ = Bleed effect
            </div>
          </div>
        </div>
      </div>

      {/* Manual Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Speed (precise)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="5.0"
            value={speed}
            onChange={(e) =>
              onChange("speed", parseFloat(e.target.value) || 1.0)
            }
            className="w-full bg-gray-850 border border-default rounded-md px-3 py-1 text-sm text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Bleed (precise)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="3"
            value={bleed}
            onChange={(e) =>
              onChange("bleed", parseFloat(e.target.value) || 0.5)
            }
            className="w-full bg-gray-850 border border-default rounded-md px-3 py-1 text-sm text-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default SweepOptions;
