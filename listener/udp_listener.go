package listener

import (
	"fmt"
	"log"
	"net"
)

type UDPMidiReceiver struct {
	SendChannel chan MidiMessage
	conn        *net.UDPConn
}

func (r UDPMidiReceiver) ReceiveMidi() error {
	// Buffer size is 4 bytes per message (Note, Velocity, On/Off, Channel)
	var buf [4]byte
	n, _, err := r.conn.ReadFromUDP(buf[0:])
	if err != nil {
		return err
	}
	if n != 4 {
		return fmt.Errorf("unexpected message size: %d bytes", n)
	}
	message := MidiMessage{
		Note:     buf[0],
		Velocity: buf[1],
		On:       buf[2] == 1,
		Channel:  buf[3],
	}
	r.SendChannel <- message
	return nil
}

func (r UDPMidiReceiver) RunListener() error {
	conn, err := net.ListenUDP("udp", &net.UDPAddr{
		IP:   net.IPv4zero,
		Port: 8090,
	})
	if err != nil {
		return err
	}
	r.conn = conn

	for {
		err := r.ReceiveMidi()
		if err != nil {
			log.Println(err)
		}
	}
}

func NewUDPMidiReceiver() *UDPMidiReceiver {
	return &UDPMidiReceiver{
		SendChannel: make(chan MidiMessage, 255),
	}
}
