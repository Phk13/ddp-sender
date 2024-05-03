package listener

import (
	"bytes"
	"encoding/json"
	"log"
	"net"
)

type UDPMidiReceiver struct {
	SendChannel chan MidiMessage
	conn        *net.UDPConn
}

func (r UDPMidiReceiver) ReceiveMidi() error {
	var buf [512]byte
	n, _, err := r.conn.ReadFromUDP(buf[0:])
	if err != nil {
		return err
	}
	var message MidiMessage
	err = json.NewDecoder(bytes.NewReader(buf[:n])).Decode(&message)
	if err != nil {
		return err
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
