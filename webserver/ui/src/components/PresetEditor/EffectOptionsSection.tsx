import React from "react";
import {
  EffectType,
  DecayOptions,
  SweepOptions,
  SyncWalkOptions,
} from "../../types";
import {
  DecayOptions as DecayOptionsComponent,
  SweepOptions as SweepOptionsComponent,
  SyncWalkOptions as SyncWalkOptionsComponent,
  StaticOptions as StaticOptionsComponent,
} from "../EffectOptions";

interface EffectOptionsSectionProps {
  effect: EffectType;
  options: Record<string, any>;
  onOptionChange: (optionKey: string, value: any) => void;
}

const EffectOptionsSection: React.FC<EffectOptionsSectionProps> = ({
  effect,
  options,
  onOptionChange,
}) => {
  const renderEffectOptions = () => {
    switch (effect) {
      case "decay":
        return (
          <DecayOptionsComponent
            options={(options as DecayOptions) || { decay_coef: 0.01 }}
            onChange={onOptionChange}
          />
        );

      case "sweep":
        return (
          <SweepOptionsComponent
            options={
              (options as SweepOptions) || {
                speed: 1.0,
                bleed: 0.5,
                bleed_before: false,
                bleed_after: true,
              }
            }
            onChange={onOptionChange}
          />
        );

      case "syncWalk":
        return (
          <SyncWalkOptionsComponent
            options={(options as SyncWalkOptions) || { amount: 5 }}
            onChange={onOptionChange}
          />
        );

      default:
        return <StaticOptionsComponent />;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-secondary mb-3">
        Effect Options
      </label>
      <div className="bg-gray-900 border border-default rounded-md p-4">
        {renderEffectOptions()}
      </div>
    </div>
  );
};

export default EffectOptionsSection;
