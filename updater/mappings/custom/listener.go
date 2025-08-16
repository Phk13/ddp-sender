package custom

import (
	"encoding/json"
	"log"
	"net/http"
)

type SwitchMappingRequest struct {
	File string `json:"file"`
}

func (c *CustomMapper) SwitchMappingHandler(w http.ResponseWriter, req *http.Request) {
	var request SwitchMappingRequest
	err := json.NewDecoder(req.Body).Decode(&request)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		log.Println("Switch mapping decode error:", err)
		return
	}

	err = c.SwitchMapping(request.File)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		log.Println("Switch mapping error:", err)
		return
	}

	log.Printf("Switched to mapping file: %s\n", request.File)
	w.WriteHeader(200)
}

func (c *CustomMapper) RunListener() error {
	http.HandleFunc("/switchMapping", c.SwitchMappingHandler)
	return http.ListenAndServe(":8080", nil)
}
