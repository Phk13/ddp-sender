package main

import (
	"fmt"
	"log"
	"sync/atomic"
	"time"

	"github.com/coral/ddp"

	"ddp-sender/config"
	"ddp-sender/led"
	"ddp-sender/listener"
	"ddp-sender/updater"
	"ddp-sender/webserver"
)

func main() {

	ddpClient := ddp.NewDDPController()

	ddpClient.ConnectUDP(config.DDP_ENDPOINT)

	midiReceiver := listener.NewUDPMidiReceiver()

	// ledArray := led.NewLEDArray()
	ledArray := led.NewLEDArrayColor(config.LED_AMOUNT)

	updater := updater.NewUpdater(ledArray, midiReceiver.SendChannel)
	// Run LED updater (MIDI-LED mapper)
	go updater.Run()

	// Run LED ticker (dynamic effects)
	go updater.Ticker(config.LED_REFRESH_RATE)

	// Start web server
	go func() {
		webServer := webserver.NewWebServer(updater.GetCustomMapper())
		err := webServer.Start()
		if err != nil {
			log.Printf("Web server error: %v", err)
		}
	}()

	// DDP Sender
	go func() {
		log.Println("Launched DDP Sender")
		var updateCount atomic.Int64

		// DDP writes/s monitoring
		go func(counter *atomic.Int64) {
			for range time.Tick(time.Duration(config.MONITOR_TICKER_INTERVAL) * time.Second) {
				count := counter.Swap(0)
				log.Printf("DDP - %d updates/s (avg %ds)\n", (count)/int64(config.MONITOR_TICKER_INTERVAL), config.MONITOR_TICKER_INTERVAL)
			}
		}(&updateCount)

		// Start sending DDP arrays.
		for {
			start := time.Now()
			_, err := ddpClient.Write(ledArray.GetArray())
			if err != nil {
				fmt.Println(err)
			}
			updateCount.Add(1)
			if time.Since(start) > 3*time.Millisecond {
				log.Printf("DDPSender.Write() -> %s\n", time.Since(start))
			}
			// fmt.Printf("%v\n", ledArray.LedStatus)
			// fmt.Println(written, err)
			time.Sleep(config.LED_REFRESH_RATE)
		}
	}()
	log.Println("Launched MidiListener")
	err := midiReceiver.RunListener()
	if err != nil {
		log.Println(err)
	}
}
