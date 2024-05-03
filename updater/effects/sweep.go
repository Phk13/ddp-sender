package effects

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

type Sweep struct {
	Range []int
	Color colorful.Color
	SweepOptions
	currentStep float64
	done        bool
	rangeLength int
}

type SweepOptions struct {
	Speed       float64
	Bleed       float64
	BleedBefore bool
	BleedAfter  bool
}

func (s *Sweep) GetRange() []int {
	return s.Range
}

func (s *Sweep) NextValues() []colorful.Color {
	// Advance step
	s.currentStep += s.Speed
	// Truncate the current step to display on array.
	intStep := int(s.currentStep)

	values := make([]colorful.Color, s.rangeLength)
	h, sat, l := s.Color.HSLuv()
	for i := range s.Range {
		// Put currentStep
		if intStep == i {
			values[i] = s.Color
		} else if (s.BleedBefore && i > intStep) || (s.BleedAfter && i < intStep) {
			distance := math.Abs(float64(intStep - i))

			// Get brightness reduction based on distance (with exponential curve for perceived brightness) and bleed factor.
			brightness := math.Pow(distance, 2.2) * s.Bleed
			lightness := l / brightness
			// Determine minimum lightness to turn on LED  to avoid color unstability.
			if lightness < 0.0065 {
				// Determine if effect is finished if the last LED is off and currentStep is higher than that.
				if i == s.rangeLength-1 && intStep > s.rangeLength {
					s.done = true
				}
				lightness = 0
			} else if lightness > l {
				lightness = l
			}
			values[i] = colorful.HSLuv(h, sat, lightness)
		}
	}
	return values
}

func (s *Sweep) IsDone() bool {
	return s.done
}

func (s *Sweep) OffEvent() {}

func NewSweep(ledRange []int, color colorful.Color, opts SweepOptions) *Sweep {
	return &Sweep{
		Range:        ledRange,
		Color:        color,
		SweepOptions: opts,
		rangeLength:  len(ledRange), // Invariable slice optimization
	}
}
