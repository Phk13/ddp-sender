package listener_test

import (
	"encoding/json"
	"net"
	"testing"
	"time"

	"ddp-sender/listener"
)

func TestUDPMidiReceiver_RunListener(t *testing.T) {
	addr, err := net.ResolveUDPAddr("udp", "localhost:0")
	if err != nil {
		t.Fatalf("Failed to resolve UDP address: %v", err)
	}
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		t.Fatalf("Failed to listen on UDP: %v", err)
	}
	defer conn.Close()

	receiver := listener.NewUDPMidiReceiver()

	go func() {
		err := receiver.RunListener()
		if err != nil {
			t.Errorf("RunListener failed: %v", err)
		}
	}()
	time.Sleep(100 * time.Millisecond) // Wait to ensure the listener is set up before sending data.

	message := listener.MidiMessage{
		Note:     50,
		Velocity: 127,
		On:       true,
		Channel:  1,
	}
	messageBytes, _ := json.Marshal(message)

	_, err = conn.WriteToUDP(messageBytes, &net.UDPAddr{
		IP:   net.IPv4(127, 0, 0, 1),
		Port: 8090,
	})
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}

	receivedMessage := <-receiver.SendChannel
	if receivedMessage != message {
		t.Fatalf("Received message is not correct: %v", receivedMessage)
	}
}
