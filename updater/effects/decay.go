package effects

import (
	"ddp-sender/util"
	"log"
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

type Decay struct {
	Range []int
	Color colorful.Color
	DecayOptions
	util.DoneState
}

type DecayOptions struct {
	DecayCoef float64 `json:"decay_coef"`
}

func (d *Decay) GetRange() []int {
	return d.Range
}

func (d *Decay) NextValues() []colorful.Color {
	d.setNextColor()
	values := make([]colorful.Color, len(d.Range))
	for i := range d.Range {
		values[i] = d.Color
	}
	return values
}

func (d *Decay) setNextColor() {
	if d.IsDone() {
		d.Color = colorful.Color{}
		return
	}

	h, s, l := d.Color.HSLuv()
	if l <= 0 {
		d.Color = colorful.Color{}
		d.SetDone()
		return
	}
	l -= math.Pow(d.DecayCoef/255, 1/2.2)
	if l < 0 {
		l = 0
	}
	d.Color = colorful.HSLuv(h, s, l)
}

func (d *Decay) OffEvent(velocity uint8) {}

func (d *Decay) Retrigger(velocity uint8) bool {
	return d.SetDone()
}

func NewDecay(ledRange []int, color colorful.Color, velocity uint8, opts DecayOptions) *Decay {
	if opts.DecayCoef <= 0 {
		log.Printf("WARNING - Decay value is %f\n", opts.DecayCoef)
	}
	return &Decay{
		Range:        ledRange,
		Color:        adjustColorToVelocity(color, velocity),
		DecayOptions: opts,
	}
}
