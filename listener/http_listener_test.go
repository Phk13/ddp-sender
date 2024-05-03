package listener_test

import (
	"bytes"
	"ddp-sender/listener"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHTTPMidiReceiver_RunListener(t *testing.T) {
	// Create a new HTTPMidiReceiver
	receiver := listener.NewHTTPMidiReceiver()

	// Start the HTTP server in a test server
	server := httptest.NewServer(http.HandlerFunc(receiver.ReceiveMidi))
	defer server.Close()

	// Prepare a MidiMessage to send
	message := listener.MidiMessage{
		Note:     50,
		Velocity: 127,
		On:       true,
		Channel:  1,
	}
	messageBytes, _ := json.Marshal(message)

	// Start the RunListener in a goroutine
	go func() {
		err := receiver.RunListener()
		if err != nil {
			t.Errorf("RunListener failed: %v", err)
		}
	}()

	// Wait for the server to start
	time.Sleep(100 * time.Millisecond) // Adjust the sleep duration as necessary

	// Create a new HTTP request
	req, err := http.NewRequest("POST", server.URL+"/midi", bytes.NewBuffer(messageBytes))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Check the response status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK, got %v", resp.StatusCode)
	}

	// Check if the message was received
	receivedMessage := <-receiver.SendChannel
	if receivedMessage != message {
		t.Fatalf("Received message is not correct: %v", receivedMessage)
	}
}
