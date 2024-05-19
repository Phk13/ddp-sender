package led

import (
	"ddp-sender/updater/effects"
	"log"
	"sync"
	"time"

	"github.com/lucasb-eyer/go-colorful"
)

type LEDArrayColor struct {
	leds         []*LEDColor
	effects      []effects.Effect
	effectsMutex sync.RWMutex
}

func (a *LEDArrayColor) GetArray() []byte {
	start := time.Now()
	result := make([]byte, 0, len(a.leds))
	for _, led := range a.leds {
		result = append(result, led.Get()...)
	}
	if time.Since(start) > 3*time.Millisecond {
		log.Printf("GetArray() -> %s\n", time.Since(start))
	}
	return result
}

func (a *LEDArrayColor) SetNextEffectValues() {
	var doneEffects []int

	a.effectsMutex.RLock()
	// Reset array
	colorArray := make([]colorful.Color, len(a.leds))
	for id, effect := range a.effects {
		// Get the next values for the effect range.
		nextValues := effect.NextValues()

		// Apply the next values to the LEDs.
		for i, ledNumber := range effect.GetRange() {
			next := nextValues[i]
			if !next.AlmostEqualRgb(colorful.Color{}) {
				// Only modify the color if it is not black.
				colorArray[ledNumber] = next
				// TODO: Priority based update (priority per effect)
			}
		}

		// Check if the effect is finished to delete it later.
		if effect.IsDone() {
			doneEffects = append(doneEffects, id)
		}
	}
	a.effectsMutex.RUnlock()

	for i := range a.leds {
		a.leds[i].Lock()
		a.leds[i].color = colorArray[i]
		a.leds[i].Unlock()
	}

	// Remove all the effects that have finished.
	if len(doneEffects) > 0 {
		a.effectsMutex.Lock()
		defer a.effectsMutex.Unlock()

		for i := len(doneEffects) - 1; i >= 0; i-- {
			id := doneEffects[i]
			a.effects = append(a.effects[:id], a.effects[id+1:]...)
		}
	}
}

func (a *LEDArrayColor) SetLED(ledNumber int, on bool, red, green, blue uint8) {
	// log.Printf("Set LED %d int %d %t", ledNumber, intensity, on)
	if on {
		a.leds[ledNumber].Set(colorful.Color{R: float64(red), G: float64(green), B: float64(blue)})
	} else {
		a.leds[ledNumber].Set(colorful.Color{})
	}
}

// Set an array of consecutive leds [first:last] to the given RGB values or off if on is false.
func (a *LEDArrayColor) SetLEDs(first, last int, on bool, red, green, blue uint8) {
	// start := time.Now()
	if on {
		for _, led := range a.leds[first:last] {

			// led.Set(colorful.LinearRgb(float64(red)/255, float64(green)/255, float64(blue)/255))
			led.Set(colorful.Color{R: float64(red) / 255, G: float64(green) / 255, B: float64(blue) / 255})
		}
	} else {
		for _, led := range a.leds[first:last] {
			led.Set(colorful.Color{})
		}
	}
	// log.Printf("[M]Set LEDs %d - %d %t (%s)", first, last, on, time.Since(start))
}

func (a *LEDArrayColor) SetLEDsEffect(effect effects.Effect) {
	a.effectsMutex.Lock()
	defer a.effectsMutex.Unlock()
	a.effects = append(a.effects, effect)
}

func NewLEDArrayColor(amount int) *LEDArrayColor {
	array := make([]*LEDColor, amount)
	for i := range array {
		array[i] = &LEDColor{}
	}
	log.Printf("Initialized array with %d LEDs.\n", amount)
	return &LEDArrayColor{
		leds:         array,
		effectsMutex: sync.RWMutex{},
	}
}

type LEDColor struct {
	sync.RWMutex // TODO: Maybe can remove
	color        colorful.Color
}

func (l *LEDColor) Get() []byte {
	l.RLock()
	defer l.RUnlock()

	r, g, b := colorCorrection(l.color.RGB255())

	return []byte{r, g, b}
}

func (l *LEDColor) Set(color colorful.Color) {
	l.Lock()
	defer l.Unlock()
	l.color = color
}
