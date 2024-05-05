package updater

import (
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater/effects"
	"ddp-sender/updater/mappings"
	"ddp-sender/updater/mappings/custom"
	"ddp-sender/util"
	"log"
	"time"

	"github.com/lucasb-eyer/go-colorful"
)

type Updater struct {
	array       led.LEDArray
	sendChannel chan listener.MidiMessage
}

func (u *Updater) Ticker(refreshRate time.Duration) {
	for range time.Tick(20 * time.Millisecond) {
		u.array.SetNextEffectValues()
	}
}

func (u *Updater) Run() {
	log.Println("Launched LedUpdater")

	// u.array.SetLEDsEffect(60, 80, 255, 127, 0, &effects.Decay{DecayCoef: 2})
	color, _ := colorful.Hex("#dd7300")
	r, g, b := color.RGB255()
	log.Println(r, g, b)
	// u.array.SetLEDs(60, 65, true, r, g, b)
	// u.array.SetLEDs(70, 75, true, 255, 255, 255)
	// u.array.SetLEDs(80, 85, true, 15, 15, 15)
	// u.array.SetLEDsEffect(effects.NewStatic(util.MakeRange(1, 35, 1), color))
	// u.array.SetLEDsEffect(effects.NewStatic(util.MakeRange(70, 75, 1), colorful.Color{R: 255, G: 255, B: 255}))
	// u.array.SetLEDsEffect(effects.NewStatic(util.MakeRange(80, 85, 1), colorful.Color{R: 15, G: 15, B: 15}))
	color = colorful.HSLuv(200, 1, 0.4)
	r, g, b = color.RGB255()
	log.Println(r, g, b)
	u.array.SetLEDsEffect(
		effects.NewSweep(util.MakeRange(1, 100, 1),
			color,
			effects.SweepOptions{
				Speed:       0.5,
				Bleed:       2,
				BleedAfter:  true,
				BleedBefore: false,
			}),
	)
	u.array.SetLEDsEffect(&effects.Decay{
		Range: util.MakeRange(1, 15, 1),
		Color: colorful.FastWarmColor(),
		DecayOptions: effects.DecayOptions{
			DecayCoef: 0.1,
		},
	})

	// Setup custom mapper listener (to receive custom presets from REAPER)
	customMapper := custom.NewCustomMapper()
	go customMapper.RunListener()

	for message := range u.sendChannel {
		switch message.Channel {
		case 1:
			// Individual LED mapping
			u.array.SetLED(int(message.Note), message.On, message.Velocity, 0, 0)
		case 2:
			// Drums fixed mapping
			mappings.DrumsMapping(u.array, message)
		case 3:
			// Dynamic mapping from REAPER
			customMapper.MapMessage(u.array, message)
		}
	}
}

func NewUpdater(array led.LEDArray, sendChannel chan listener.MidiMessage) *Updater {
	return &Updater{
		array:       array,
		sendChannel: sendChannel,
	}
}
