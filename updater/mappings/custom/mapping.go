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
			effect, err := mapping.getEffect()
			if err != nil {
				log.Println(err)
				return
			}
			array.SetLEDsEffect(effect)
		} else {
			// Parse note off into existing effect
		}

	}
}

func (m *Mapping) getEffect() (effects.Effect, error) {
	switch m.Effect {
	case "static":
		return effects.NewStatic(m.Range, m.Color), nil
	case "decay":
		var options effects.DecayOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		log.Println(options.DecayCoef)
		return effects.NewDecay(m.Range, m.Color, options), nil
	case "sweep":
		var options effects.SweepOptions
		err := json.Unmarshal(m.Options, &options)
		if err != nil {
			return nil, err
		}
		return effects.NewSweep(m.Range, m.Color, options), nil
	default:
		return effects.NewDecay(m.Range, m.Color, effects.DecayOptions{DecayCoef: 0.005}), nil
	}
}
