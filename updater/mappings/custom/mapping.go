package custom

import (
	"ddp-sender/config"
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater/effects"
	"ddp-sender/util"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/lucasb-eyer/go-colorful"
)

type CustomMapper struct {
	sync.RWMutex
	Mappings map[uint8]Mapping
	Effects  map[uint8]effects.Effect
	ledArray led.LEDArray
}

type MappingFile struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Presets     []struct {
		Name    string          `json:"name"`
		Note    uint8           `json:"note"`
		First   int             `json:"first"`
		Last    int             `json:"last"`
		Step    int             `json:"step"`
		Color   string          `json:"color"`
		Effect  string          `json:"effect"`
		Options json.RawMessage `json:"options"`
	} `json:"presets"`
}

type Mapping struct {
	Range   []int
	Color   colorful.Color
	Effect  string
	Options json.RawMessage
}

func (c *CustomMapper) MapMessage(array led.LEDArray, message listener.MidiMessage) {
	c.RLock()
	defer c.RUnlock()
	if _, ok := c.Mappings[message.Note]; ok {
		if message.On {
			c.triggerEffectForNote(array, message.Note, message.Velocity)
		} else {
			if effect, ok := c.Effects[message.Note]; ok {
				effect.OffEvent(message.Velocity)
			}
		}

	}
}

// TriggerPreset manually triggers a preset effect by MIDI note
func (c *CustomMapper) TriggerPreset(note uint8, velocity uint8) error {
	c.RLock()
	defer c.RUnlock()

	if _, ok := c.Mappings[note]; !ok {
		return fmt.Errorf("no mapping found for note %d", note)
	}

	c.triggerEffectForNote(c.ledArray, note, velocity)
	return nil
}

// TriggerPresetOff manually turns off a preset effect by MIDI note
func (c *CustomMapper) TriggerPresetOff(note uint8, velocity uint8) error {
	c.RLock()
	defer c.RUnlock()

	if _, ok := c.Mappings[note]; !ok {
		return fmt.Errorf("no mapping found for note %d", note)
	}

	// Turn off the effect if it exists
	if effect, ok := c.Effects[note]; ok {
		effect.OffEvent(velocity)
	}

	return nil
}

// ClearAllEffects clears all currently active effects
func (c *CustomMapper) ClearAllEffects() error {
	c.Lock()
	defer c.Unlock()

	// Turn off all effects
	for note, effect := range c.Effects {
		effect.SetDone()
		delete(c.Effects, note)
	}

	log.Printf("Cleared all active effects (%d effects stopped)", len(c.Effects))
	return nil
}

// TriggerPreviewEffect triggers a temporary effect for preview without needing a saved mapping
func (c *CustomMapper) TriggerPreviewEffect(first, last, step int, colorHex, effectType string, optionsJson json.RawMessage) error {
	c.Lock()
	defer c.Unlock()

	// Create LED range
	ledRange := util.MakeRange(first, last, step)

	// Parse color
	color, err := colorful.Hex(colorHex)
	if err != nil {
		return fmt.Errorf("invalid color format: %v", err)
	}

	// Create temporary mapping
	tempMapping := Mapping{
		Range:   ledRange,
		Color:   color,
		Effect:  effectType,
		Options: optionsJson,
	}

	// Use special preview note (255 = preview)
	const previewNote = 255

	// If effect already exists for preview, try to retrigger it
	if currentEffect, ok := c.Effects[previewNote]; ok {
		if !currentEffect.Retrigger(127) {
			// If retrigger returns false, effect is still ongoing and should not be replaced
			log.Printf("Preview effect retriggered successfully")
			return nil
		}
	}

	// Create and trigger the effect with max velocity
	effect, err := tempMapping.getNewEffect(127)
	if err != nil {
		return fmt.Errorf("failed to create effect: %v", err)
	}

	// Apply to LED array if available
	if c.ledArray != nil {
		c.ledArray.SetLEDsEffect(effect)
	}

	// Store the new effect
	c.Effects[previewNote] = effect

	log.Printf("Preview effect triggered: %s on range %d-%d with step %d", effectType, first, last, step)
	return nil
}

// TriggerPreviewEffectOff turns off the current preview effect
func (c *CustomMapper) TriggerPreviewEffectOff() error {
	c.Lock()
	defer c.Unlock()

	// Turn off the preview effect if it exists
	const previewNote = 255
	if effect, ok := c.Effects[previewNote]; ok {
		effect.OffEvent(0)
	}

	log.Printf("Preview effect turned off")
	return nil
}

// ClearPreviewEffects clears all preview effects
func (c *CustomMapper) ClearPreviewEffects() error {
	c.Lock()
	defer c.Unlock()

	// Clear preview effect (note 255)
	const previewNote = 255
	if effect, ok := c.Effects[previewNote]; ok {
		effect.SetDone()
		delete(c.Effects, previewNote)
		log.Printf("Preview effect cleared and removed")
	} else {
		log.Printf("No preview effect to clear")
	}

	return nil
}

// triggerEffectForNote is a helper method to trigger an effect for a specific note
func (c *CustomMapper) triggerEffectForNote(array led.LEDArray, note uint8, velocity uint8) {
	mapping := c.Mappings[note]

	// If effect already exists for this preset, try to retrigger it.
	if currentEffect, ok := c.Effects[note]; ok {
		if !currentEffect.Retrigger(velocity) {
			// If retrigger returns false it is still ongoing and should not be replaced.
			return
		}
	}
	effect, err := mapping.getNewEffect(velocity)
	if err != nil {
		log.Println(err)
		return
	}
	if array != nil {
		array.SetLEDsEffect(effect)
	}
	c.Effects[note] = effect
}

func (m *Mapping) getNewEffect(velocity uint8) (effects.Effect, error) {
	switch m.Effect {
	case "static":
		return effects.NewStatic(m.Range, m.Color, velocity), nil
	case "decay":
		var options effects.DecayOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		return effects.NewDecay(m.Range, m.Color, velocity, options), nil
	case "sweep":
		var options effects.SweepOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		return effects.NewSweep(m.Range, m.Color, options), nil
	case "syncWalk":
		var options effects.SyncWalkOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		return effects.NewSyncWalk(m.Range, m.Color, velocity, options), nil
	default:
		return effects.NewDecay(m.Range, m.Color, velocity, effects.DecayOptions{DecayCoef: 0.005}), nil
	}
}

func (c *CustomMapper) LoadMappingFromFile(filename string) error {
	filepath := filepath.Join(config.MAPPINGS_DIR, filename)
	data, err := os.ReadFile(filepath)
	if err != nil {
		return err
	}

	var mappingFile MappingFile
	err = json.Unmarshal(data, &mappingFile)
	if err != nil {
		return err
	}

	c.Lock()
	defer c.Unlock()

	// Finish all effects from previous mapping
	for key, effect := range c.Effects {
		effect.SetDone()
		delete(c.Effects, key)
	}

	// Parse new mapping presets
	c.Mappings = make(map[uint8]Mapping)
	for _, preset := range mappingFile.Presets {
		ledRange := util.MakeRange(preset.First, preset.Last, preset.Step)
		color, err := colorful.Hex(preset.Color)
		if err != nil {
			return err
		}
		c.Mappings[preset.Note] = Mapping{
			Range:   ledRange,
			Color:   color,
			Effect:  preset.Effect,
			Options: preset.Options,
		}
	}

	log.Printf("Loaded mapping '%s' with %d presets from %s\n", mappingFile.Name, len(c.Mappings), filename)
	return nil
}

func (c *CustomMapper) SwitchMapping(filename string) error {
	err := c.LoadMappingFromFile(filename)
	if err != nil {
		return err
	}
	config.CURRENT_MAPPING = filename
	return nil
}

func NewCustomMapper() *CustomMapper {
	mapper := &CustomMapper{
		Effects: make(map[uint8]effects.Effect),
	}

	// Load default mapping on startup
	err := mapper.LoadMappingFromFile(config.CURRENT_MAPPING)
	if err != nil {
		log.Printf("Warning: Could not load default mapping '%s': %v\n", config.CURRENT_MAPPING, err)
	}

	return mapper
}

// SetLEDArray sets the LED array reference for manual triggering
func (c *CustomMapper) SetLEDArray(array led.LEDArray) {
	c.Lock()
	defer c.Unlock()
	c.ledArray = array
}
