package custom

import (
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater/effects"
	"encoding/json"
	"log"
	"sync"

	"github.com/lucasb-eyer/go-colorful"
)

type CustomMapper struct {
	sync.Mutex
	Mappings map[uint8]Mapping
	Effects  map[uint8]effects.Effect
}

type Mapping struct {
	Range   []int
	Color   colorful.Color
	Effect  string
	Options json.RawMessage
}

func (c *CustomMapper) MapMessage(array led.LEDArray, message listener.MidiMessage) {
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
		return effects.NewStatic(m.Range, m.Color), nil
	case "decay":
		var options effects.DecayOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		return effects.NewDecay(m.Range, m.Color, options), nil
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
		return effects.NewDecay(m.Range, m.Color, effects.DecayOptions{DecayCoef: 0.005}), nil
	}
}

func NewCustomMapper() *CustomMapper {
	return &CustomMapper{
		Effects: make(map[uint8]effects.Effect),
	}
}
