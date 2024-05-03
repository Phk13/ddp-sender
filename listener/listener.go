package listener

type MidiReceiver interface {
	RunListener() error
}

type MidiMessage struct {
	Note     uint8 `json:"note"`
	Velocity uint8 `json:"velocity"`
	On       bool  `json:"on"`
	Channel  uint8 `json:"channel"`
}
