package effects

import (
	"ddp-sender/util"

	"github.com/lucasb-eyer/go-colorful"
)

type Static struct {
	Range []int
	Color colorful.Color
	util.DoneState
}

func (s *Static) GetRange() []int {
	return s.Range
}

func (s *Static) NextValues() []colorful.Color {
	values := make([]colorful.Color, len(s.Range))
	var color colorful.Color
	if s.IsDone() {
		return values
	} else {
		color = s.Color
	}
	for i := range s.Range {
		values[i] = color
	}
	return values
}

func (s *Static) OffEvent(velocity uint8) {
	s.SetDone()
}

func (s *Static) Retrigger(velocity uint8) bool {
	return s.SetDone()
}

func NewStatic(ledRange []int, color colorful.Color, velocity uint8) *Static {
	return &Static{
		Range: ledRange,
		Color: adjustColorToVelocity(color, velocity),
	}
}
