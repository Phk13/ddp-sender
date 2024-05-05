package led

import (
	"ddp-sender/updater/effects"
)

type LEDArray interface {
	GetArray() []byte
	SetNextEffectValues()
	SetLED(ledNumber int, on bool, red, green, blue uint8)
	SetLEDs(first, last int, on bool, red, green, blue uint8)
	SetLEDsEffect(effect effects.Effect)
}

func colorCorrection(r, g, b uint8) (uint8, uint8, uint8) {
	var floatR, floatG, floatB float64
	floatR = float64(r)
	if g > 15 {
		floatG = float64(g) * 0.43
	} else if g > 5 {
		floatG = float64(g) * 0.6
	} else {
		floatG = float64(g) * 0.75
	}
	if b > 15 {
		floatB = float64(b) * 0.3
	} else if b > 5 {
		floatB = float64(b) * 0.45
	} else {
		floatB = float64(b) * 0.53
	}
	// r = uint8(gammaCorrection(floatR, 255))
	// g = uint8(gammaCorrection(floatG, 255))
	// b = uint8(gammaCorrection(floatB, 255))
	return uint8(floatR), uint8(floatG), uint8(floatB)
}

// func gammaCorrection(value float64, base float64) float64 {
// 	value /= base
// 	if value <= 0.0031308 {
// 		value *= 12.92
// 	} else {
// 		value = 1.055*math.Pow(value, 1/2.4) - 0.055
// 	}
// 	return value * base
// }
