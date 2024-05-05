package custom

import (
	"ddp-sender/util"
	"encoding/json"
	"log"
	"net/http"

	"github.com/lucasb-eyer/go-colorful"
)

type MappingMessage struct {
	Presets []struct {
		Note    uint8           `json:"note"`
		First   int             `json:"first"`
		Last    int             `json:"last"`
		Step    int             `json:"step"`
		Color   string          `json:"color"`
		Effect  string          `json:"effect"`
		Options json.RawMessage `json:"options"`
	} `json:"presets"`
}

type MessagePreset struct {
}

func (c *CustomMapper) ParseMapping(w http.ResponseWriter, req *http.Request) {
	var message MappingMessage
	err := json.NewDecoder(req.Body).Decode(&message)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		log.Println(err)
		return
	}

	c.Lock()
	defer c.Unlock()
	c.Mappings = make(map[uint8]Mapping)
	for _, preset := range message.Presets {
		ledRange := util.MakeRange(preset.First, preset.Last, preset.Step)
		color, err := colorful.Hex(preset.Color)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte(err.Error()))
			log.Println(err)
			return
		}
		log.Println(preset.Effect)
		c.Mappings[preset.Note] = Mapping{
			Range:   ledRange,
			Color:   color,
			Effect:  preset.Effect,
			Options: preset.Options,
		}
	}
	log.Printf("Received new custom mapping with %d presets.\n", len(c.Mappings))
	w.WriteHeader(200)
}

func (c *CustomMapper) RunListener() error {
	http.HandleFunc("/effectMapping", c.ParseMapping)
	return http.ListenAndServe(":8080", nil)
}
