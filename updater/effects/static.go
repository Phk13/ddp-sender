package effects

import (
	"github.com/lucasb-eyer/go-colorful"
)

type Static struct {
	Range  []int
	Color  colorful.Color
	status bool
}

func (s *Static) GetRange() []int {
	return s.Range
}

func (s *Static) NextValues() []colorful.Color {
	values := make([]colorful.Color, len(s.Range))
	var color colorful.Color
	if s.status {
		color = s.Color
	} else {
		color = colorful.Color{}
	}
	for i := range s.Range {
		values[i] = color
	}
	return values
}

func (s *Static) IsDone() bool {
	return s.Color.AlmostEqualRgb(colorful.Color{})
}

func (s *Static) OffEvent() {
	s.status = false
}

func NewStatic(ledRange []int, color colorful.Color) *Static {
	return &Static{
		Range:  ledRange,
		Color:  color,
		status: true,
	}
}
