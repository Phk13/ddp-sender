package config

import "time"

const LED_AMOUNT int = 150
const DDP_ENDPOINT string = "localhost:4048"
const MONITOR_TICKER_INTERVAL int = 1
const LED_REFRESH_RATE = 20 * time.Millisecond
const MAPPINGS_DIR = "./mappings"

var CURRENT_MAPPING = "uprising.json"
