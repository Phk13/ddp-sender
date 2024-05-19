package effects

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

type Effect interface {
	GetRange() []int
	NextValues() []colorful.Color
	IsDone() bool
	SetDone() bool
	OffEvent(velocity uint8)
	Retrigger(velocity uint8) bool // Retrigger receives a new trigger for the effect and returns if the effect is done or not.
}

type EffectOptions interface{}

func adjustColorToVelocity(color colorful.Color, velocity uint8) colorful.Color {
	h, sat, l := color.HSLuv()
	l = math.Pow(float64(velocity)/127.0, 2.2) * l
	return colorful.HSLuv(h, sat, l)
}
