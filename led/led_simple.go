package led

import (
	"bytes"
	"sync"
)

type LEDArraySimple struct {
	sync.RWMutex
	ledStatus []byte
}

func (a *LEDArraySimple) GetArray() []byte {
	a.RLock()
	defer a.RUnlock()
	return a.ledStatus
}

func (a *LEDArraySimple) SetLED(ledNumber int, intensity uint8, on bool, red, green, blue uint8) {
	a.Lock()
	defer a.Unlock()
	// log.Printf("Set LED %d int %d %t", ledNumber, intensity, on)
	if on {
		a.ledStatus[3*ledNumber] = byte(red)
		a.ledStatus[3*ledNumber+1] = byte(green)
		a.ledStatus[3*ledNumber+2] = byte(blue)
		// copy(a.ledStatus[3*ledNumber:], []byte{byte(intensity), 0, 0})
	} else {
		a.ledStatus[3*ledNumber] = 0
		a.ledStatus[3*ledNumber+1] = 0
		a.ledStatus[3*ledNumber+2] = 0
	}
}

func (a *LEDArraySimple) SetLEDs(first, last int, intensity uint8, on bool, red, green, blue uint8) {
	a.Lock()
	defer a.Unlock()
	// log.Printf("[M]Set LEDs %d - %d %t", first, last, on)
	if on {
		for i := 3 * first; i < 3*last; i = i + 3 {
			a.ledStatus[i] = byte(red)
			a.ledStatus[i+1] = byte(green)
			a.ledStatus[i+2] = byte(blue)
		}
	} else {
		for i := 3 * first; i < 3*last; i = i + 3 {
			a.ledStatus[i] = 0
			a.ledStatus[i+1] = 0
			a.ledStatus[i+2] = 0
		}
	}
}

func NewLEDArray() *LEDArraySimple {
	ledArray := &LEDArraySimple{
		ledStatus: bytes.Repeat([]byte{0, 0, 0}, 150),
	}
	return ledArray
}
