package config

import "time"

const LED_AMOUNT int = 150
const DDP_ENDPOINT string = "192.168.0.30:4048"
const MONITOR_TICKER_INTERVAL int = 1
const LED_REFRESH_RATE = 20 * time.Millisecond
const MAPPINGS_DIR = "./mappings"

var CURRENT_MAPPING = "uprising.json"

const WEB_UI_PORT = 8081
const WEB_UI_DIR = "./webserver/ui/dist"
