package effects

import (
	"ddp-sender/util"
	"math"
	"sync"

	"github.com/lucasb-eyer/go-colorful"
)

type SyncWalk struct {
	Range    []int
	Color    colorful.Color
	Velocity uint8
	SyncWalkOptions
	currentStep int
	stepLock    sync.RWMutex
	util.DoneState
}

type SyncWalkOptions struct {
	Amount int `json:"amount"`
}

func (s *SyncWalk) GetRange() []int {
	return s.Range
}

func (s *SyncWalk) NextValues() []colorful.Color {
	values := make([]colorful.Color, len(s.Range))
	if s.IsDone() || s.currentStep >= len(s.Range) {
		return values
	}
	h, sat, l := s.Color.HSLuv()
	s.stepLock.RLock()
	defer s.stepLock.RUnlock()
	// Brigthen/darken color according to velocity (with gamma correction 2.2 for perceived linearity)
	l = math.Pow(float64(s.Velocity)/127.0, 2.2) * l
	color := colorful.HSLuv(h, sat, l)
	for i := range s.Amount {
		values[s.currentStep+i] = color
	}
	return values
}

func (s *SyncWalk) OffEvent(velocity uint8) {
	// OffVelocity 1 is used to turn off effect.
	if velocity == 1 {
		s.SetDone()
	}
}

func (s *SyncWalk) Retrigger(velocity uint8) bool {
	s.stepLock.Lock()
	defer s.stepLock.Unlock()
	s.currentStep += s.Amount
	s.Velocity = velocity
	if s.currentStep >= len(s.Range) {
		s.SetDone()
	}
	return s.IsDone()
}

func NewSyncWalk(ledRange []int, color colorful.Color, velocity uint8, opts SyncWalkOptions) *SyncWalk {
	return &SyncWalk{
		Range:           ledRange,
		Color:           color,
		Velocity:        velocity,
		SyncWalkOptions: opts,
	}
}
