import React from "react";

interface StaticOptionsProps {
  className?: string;
}

const StaticOptions: React.FC<StaticOptionsProps> = ({
  className = "",
}) => {
  return (
    <div className={`static-options space-y-4 ${className}`}>
      {/* Static Effect Explanation */}
      <div className="bg-gray-800 border border-default rounded-lg p-4">
        <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          Static Effect
        </h4>

        <div className="space-y-3 text-sm text-secondary">
          <p>
            Static effects provide simple on/off LED control without any animations or transitions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-850 rounded-lg p-3">
              <h5 className="font-medium text-primary mb-2">MIDI ON (Note On)</h5>
              <ul className="text-xs space-y-1">
                <li>• LEDs turn on instantly</li>
                <li>• Color set to the preset color</li>
                <li>• Brightness based on MIDI velocity</li>
                <li>• Remains on until MIDI OFF</li>
              </ul>
            </div>

            <div className="bg-gray-850 rounded-lg p-3">
              <h5 className="font-medium text-primary mb-2">MIDI OFF (Note Off)</h5>
              <ul className="text-xs space-y-1">
                <li>• LEDs turn off instantly</li>
                <li>• No fade or transition</li>
                <li>• Immediate response</li>
                <li>• Perfect for switches/toggles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-850 border border-default rounded-lg p-3">
        <h4 className="text-sm font-medium text-primary mb-2">Best Use Cases</h4>
        <ul className="text-xs text-secondary space-y-1">
          <li>• Sustained notes or chords</li>
          <li>• Toggle switches for different song sections</li>
          <li>• Background lighting that needs to stay on</li>
          <li>• Simple on/off controls without effects</li>
          <li>• Testing LED ranges and colors</li>
        </ul>
      </div>

      {/* Preview Visual */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Static Effect Preview
        </label>
        <div className="bg-gray-850 border border-default rounded-lg p-4">
          <div className="flex justify-center gap-1 mb-3">
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-600"
                style={{
                  backgroundColor: index < 5 ? "#3b82f6" : "transparent",
                  boxShadow: index < 5 ? "0 0 6px rgba(59, 130, 246, 0.6)" : "none",
                }}
                title={`LED ${index}: ${index < 5 ? "ON" : "OFF"}`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-xs text-muted mb-2">
              ● = LEDs ON (MIDI Note On) | ○ = LEDs OFF (MIDI Note Off)
            </div>
            <div className="text-xs text-blue-400">
              Instant on/off response with no animation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticOptions;
