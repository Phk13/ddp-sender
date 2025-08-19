import { PresetListProps } from "../../types";
import PresetListHeader from "./PresetListHeader";
import QuickActions from "./QuickActions";
import EmptyPresetState from "./EmptyPresetState";
import PresetStats from "./PresetStats";
import PresetItem from "./PresetItem";

const PresetList = ({
  presets = [],
  selectedPreset = null,
  onPresetSelect = () => {},
  onPresetAdd = () => {},
  onPresetDuplicate = () => {},
  onPresetDelete = () => {},
  onPresetMirror = () => {},
  className = "",
}: PresetListProps) => {
  return (
    <div className={`preset-list ${className}`}>
      <PresetListHeader 
        presetCount={presets.length} 
        onPresetAdd={onPresetAdd} 
      />

      <QuickActions
        selectedPreset={selectedPreset}
        onPresetMirror={onPresetMirror}
        onPresetDuplicate={onPresetDuplicate}
      />

      {/* Preset List */}
      <div className="space-y-1 max-h-96 md:max-h-[35vh] lg:max-h-[45vh] xl:max-h-[52vh] overflow-y-auto">
        {presets.length === 0 ? (
          <EmptyPresetState />
        ) : (
          presets.map((preset, index) => (
            <PresetItem
              key={preset.id || index}
              preset={preset}
              index={index}
              isSelected={selectedPreset?.id === preset.id || selectedPreset === preset}
              onPresetSelect={onPresetSelect}
              onPresetDuplicate={onPresetDuplicate}
              onPresetDelete={onPresetDelete}
            />
          ))
        )}
      </div>

      <PresetStats presets={presets} />
    </div>
  );
};

export default PresetList;
