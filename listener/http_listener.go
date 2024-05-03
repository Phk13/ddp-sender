package listener

import (
	"encoding/json"
	"log"
	"net/http"
)

type HTTPMidiReceiver struct {
	SendChannel chan MidiMessage
}

func (r HTTPMidiReceiver) ReceiveMidi(w http.ResponseWriter, req *http.Request) {
	var message MidiMessage
	err := json.NewDecoder(req.Body).Decode(&message)
	if err != nil {
		log.Println(err)
	}
	// log.Printf("Received note %d velocity %d (%t)\n", message.Note, message.Velocity, message.On)
	r.SendChannel <- message
}

func (r HTTPMidiReceiver) RunListener() error {
	http.HandleFunc("/midi", r.ReceiveMidi)
	return http.ListenAndServe(":8090", nil)
}

func NewHTTPMidiReceiver() *HTTPMidiReceiver {
	return &HTTPMidiReceiver{
		SendChannel: make(chan MidiMessage, 255),
	}
}
