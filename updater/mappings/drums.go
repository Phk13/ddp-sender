package mappings

import (
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater/effects"
	"ddp-sender/util"

	"github.com/lucasb-eyer/go-colorful"
)

// Reactive custom drums MIDI mapping.
func DrumsMapping(array led.LEDArray, message listener.MidiMessage) {
	switch message.Note {
	case 36:
		// Bass
		if !message.On || message.Velocity > 80 {
			color, _ := colorful.Hex("#f00")
			r, g, b := color.RGB255()
			array.SetLEDs(30, 45, message.On, r, g, b)
		}
	case 38, 40:
		// Snare
		if !message.On || message.Velocity > 80 {
			color := colorful.HSLuv(66, 1, 0.8)
			r, g, b := color.RGB255()
			array.SetLEDs(60, 75, message.On, r, g, b)
		}
	case 37:
		// Rimshot Snare
		if !message.On || message.Velocity > 80 {
			color := colorful.HSLuv(25, 1, 0.6)
			r, g, b := color.RGB255()
			array.SetLEDs(60, 65, message.On, r, g, b)
			array.SetLEDs(70, 75, message.On, r, g, b)
		}
	case 49, 55:
		// Main Crash
		if message.On && message.Velocity > 60 {
			array.SetLEDsEffect(&effects.Decay{
				Range: util.MakeRange(40, 60, 1),
				Color: colorful.HSLuv(0, 0, float64(message.Velocity)/255),
				DecayOptions: effects.DecayOptions{
					DecayCoef: 0.005,
				},
			})
		}
	case 39:
		// Trash Crash
		if message.On && message.Velocity > 60 {
			array.SetLEDsEffect(effects.NewSweep(
				util.MakeRange(65, 120, 1),
				colorful.Color{
					R: float64(message.Velocity) / 255,
					G: float64(message.Velocity) / (2 * 255),
					B: float64(message.Velocity) / (2 * 255),
				},
				effects.SweepOptions{
					Speed:      1,
					Bleed:      0.5,
					BleedAfter: true,
				}),
			)
			// u.array.SetLEDs(65, 120, message.On, message.Velocity/2, message.Velocity/2, message.Velocity)
		}
	case 52, 57:
		// Sec Crash
		if message.On && message.Velocity > 60 {
			array.SetLEDsEffect(effects.NewSweep(
				util.MakeRange(75, 90, 1),
				colorful.HSLuv(38, 1, 0.6),
				effects.SweepOptions{
					Speed:      1,
					Bleed:      0.5,
					BleedAfter: true,
				}),
			)
			// u.array.SetLEDs(75, 90, message.On, message.Velocity/4, message.Velocity/5, message.Velocity)
		}
	case 44:
		// Foot HiHat
		if !message.On || message.Velocity > 60 {
			array.SetLEDs(59, 61, message.On, message.Velocity, message.Velocity/5, 0)
		}
	case 43, 58:
		// Gong tom
		if !message.On || message.Velocity > 60 {
			array.SetLEDs(1, 30, message.On, message.Velocity, message.Velocity/5, 0)
		}
	case 41:
		if message.On || message.Velocity > 60 {
			array.SetLEDsEffect(effects.NewSweep(
				util.MakeRange(85, 120, 1),
				colorful.Color{
					R: float64(message.Velocity) / 255,
					G: float64(message.Velocity) / 255,
					B: float64(message.Velocity) / 255,
				},
				effects.SweepOptions{
					Speed:       3,
					Bleed:       0.02,
					BleedAfter:  true,
					BleedBefore: true,
				}),
			)
			// u.array.SetLEDs(85, 95, message.On, message.Velocity, message.Velocity/5, 0)
		}
	default:
		array.SetLED(int(message.Note), message.On, message.Velocity, message.Velocity/5, 0)
	}
}
