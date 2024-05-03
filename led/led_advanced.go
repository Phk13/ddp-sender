package led

import (
	"ddp-sender/updater/effects"
	"log"
	"sync"
	"time"
)

type LEDArrayAdvanced struct {
	LEDs []*LED
}

func (a *LEDArrayAdvanced) GetArray() []byte {
	start := time.Now()
	result := make([]byte, 0, len(a.LEDs))
	for _, led := range a.LEDs {
		result = append(result, led.Get()...)
	}
	if time.Since(start) > 3*time.Millisecond {
		log.Printf("GetArray() -> %s\n", time.Since(start))
	}
	return result
}

// func (a *LEDArrayAdvanced) SetNextValueArray() {
// 	for _, led := range a.LEDs {
// 		led.SetNextEffectValue()
// 	}
// }

func (a *LEDArrayAdvanced) SetLED(ledNumber int, on bool, red, green, blue uint8) {
	// log.Printf("Set LED %d int %d %t", ledNumber, intensity, on)
	if on {
		a.LEDs[ledNumber].Set(red, green, blue)
	} else {
		a.LEDs[ledNumber].Set(0, 0, 0)
	}
}

func (a *LEDArrayAdvanced) SetLEDs(first, last int, on bool, red, green, blue uint8) {
	// start := time.Now()
	if on {
		for _, led := range a.LEDs[first:last] {
			led.Set(red, green, blue)
		}
	} else {
		for _, led := range a.LEDs[first:last] {
			led.Set(0, 0, 0)
		}
	}
	// log.Printf("[M]Set LEDs %d - %d %t (%s)", first, last, on, time.Since(start))
}

func (a *LEDArrayAdvanced) SetLEDsEffect(first, last int, red, green, blue uint8, effect effects.Effect) {
	// start := time.Now()
	for _, led := range a.LEDs[first:last] {
		led.SetEffect(red, green, blue, effect)
	}
	// log.Printf("[M]Set LEDs %d - %d effect (%s)", first, last, effect, time.Since(start))
}

func NewLEDArrayAdvanced(amount int) *LEDArrayAdvanced {
	array := make([]*LED, amount)
	for i := range array {
		array[i] = &LED{}
	}
	log.Printf("Initialized array with %d LEDs.\n", amount)
	return &LEDArrayAdvanced{
		LEDs: array,
	}
}

type LED struct {
	sync.RWMutex
	red    uint8
	green  uint8
	blue   uint8
	effect effects.Effect
}

func (l *LED) Get() []byte {
	l.RLock()
	defer l.RUnlock()
	r, g, b := colorCorrection(l.red, l.green, l.blue)
	return []byte{byte(r), byte(g), byte(b)}
}

func (l *LED) Set(red, green, blue uint8) {
	l.Lock()
	defer l.Unlock()
	if l.effect != nil {
		// If an effect is active this method should not be called.
		return
	}
	l.red, l.green, l.blue = red, green, blue
}

// func (l *LED) SetNextEffectValue() {
// 	if l.effect == nil {
// 		return
// 	}
// 	l.Lock()
// 	defer l.Unlock()
// 	var finished bool
// 	l.red, l.green, l.blue, finished = l.effect.NextValues(l.red, l.green, l.blue)
// 	if finished {
// 		// If the effect is done, remove it to avoid ticking through its logic.
// 		l.effect = nil
// 	}
// }

func (l *LED) SetEffect(red, green, blue uint8, effect effects.Effect) {
	l.Lock()
	defer l.Unlock()
	l.effect = effect
	l.red, l.green, l.blue = red, green, blue
}
