package effects

import "github.com/lucasb-eyer/go-colorful"

type Effect interface {
	GetRange() []int
	NextValues() []colorful.Color
	IsDone() bool
	OffEvent()
}

type EffectOptions interface{}
