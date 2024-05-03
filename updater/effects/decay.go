package effects

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

type Decay struct {
	Range []int
	Color colorful.Color
	DecayOptions
	status bool
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
	if !d.status {
		d.Color = colorful.Color{}
	}
	h, s, l := d.Color.HSLuv()
	if l <= 0 {
		d.Color = colorful.Color{}
	} else {
		l -= math.Pow(d.DecayCoef/255, 1/2.2)
		if l < 0 {
			l = 0
		}
		d.Color = colorful.HSLuv(h, s, l)
	}
}

func (d *Decay) IsDone() bool {
	return d.Color.AlmostEqualRgb(colorful.Color{})
}

func (d *Decay) OffEvent() {
	d.status = false
}

func NewDecay(ledRange []int, color colorful.Color, opts DecayOptions) *Decay {
	return &Decay{
		Range:        ledRange,
		Color:        color,
		DecayOptions: opts,
		status:       true,
	}
}
