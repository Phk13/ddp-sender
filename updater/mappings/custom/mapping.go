package custom

import (
	"ddp-sender/config"
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater/effects"
	"ddp-sender/util"
	"encoding/json"
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
}

type MappingFile struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Presets     []struct {
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
	if mapping, ok := c.Mappings[message.Note]; ok {
		if message.On {
			// If effect already exists for this preset, try to retrigger it.
			if currentEffect, ok := c.Effects[message.Note]; ok {
				if !currentEffect.Retrigger(message.Velocity) {
					// If retrigger returns false it is still ongoing and should not be replaced.
					return
				}
			}
			effect, err := mapping.getNewEffect(message.Velocity)
			if err != nil {
				log.Println(err)
				return
			}
			array.SetLEDsEffect(effect)
			c.Effects[message.Note] = effect
		} else {
			if effect, ok := c.Effects[message.Note]; ok {
				effect.OffEvent(message.Velocity)
			}
		}

	}
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
