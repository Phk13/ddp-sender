package effects

import "github.com/lucasb-eyer/go-colorful"

type Effect interface {
	GetRange() []int
	NextValues() []colorful.Color
	IsDone() bool
	OffEvent(velocity uint8)
	Retrigger(velocity uint8) bool // Retrigger receives a new trigger for the effect and returns if the effect is done or not.
}

type EffectOptions interface{}
