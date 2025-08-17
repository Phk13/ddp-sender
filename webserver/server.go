package webserver

import (
	"ddp-sender/config"
	"ddp-sender/updater/mappings/custom"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

//go:embed all:ui/dist
var webUIFiles embed.FS

type WebServer struct {
	customMapper *custom.CustomMapper
}

func NewWebServer(customMapper *custom.CustomMapper) *WebServer {
	return &WebServer{
		customMapper: customMapper,
	}
}

func (ws *WebServer) setupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/status", ws.handleStatus)
	mux.HandleFunc("/api/switchMapping", ws.customMapper.SwitchMappingHandler)
	mux.HandleFunc("/api/mappings", ws.handleMappings)
	mux.HandleFunc("/api/mappings/", ws.handleMappingOperations)
	mux.HandleFunc("/api/trigger", ws.handleTriggerPreset)
	mux.HandleFunc("/api/trigger/clear", ws.handleTriggerPreset)
	mux.HandleFunc("/api/preview-effect", ws.handlePreviewEffect)
	mux.HandleFunc("/api/preview-effect/clear", ws.handleClearPreview)

	// Static file serving for React app
	webUIFS, err := fs.Sub(webUIFiles, "ui/dist")
	if err != nil {
		log.Printf("Warning: Could not setup embedded web UI files: %v", err)
		// Fallback to file system serving for development
		mux.Handle("/", http.FileServer(http.Dir(config.WEB_UI_DIR)))
	} else {
		// Serve static files
		mux.Handle("/static/", http.FileServer(http.FS(webUIFS)))

		// SPA fallback - serve index.html for all non-API routes
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			// If it's an API route, return 404
			if strings.HasPrefix(r.URL.Path, "/api/") {
				http.NotFound(w, r)
				return
			}

			// If it's a static file request and file doesn't exist, return 404
			if strings.HasPrefix(r.URL.Path, "/static/") {
				http.FileServer(http.FS(webUIFS)).ServeHTTP(w, r)
				return
			}

			// For all other routes, serve index.html (SPA fallback)
			indexFile, err := webUIFS.Open("index.html")
			if err != nil {
				log.Printf("Error serving index.html: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			defer indexFile.Close()

			w.Header().Set("Content-Type", "text/html")
			http.ServeContent(w, r, "index.html", time.Time{}, indexFile.(io.ReadSeeker))
		})
	}

	return mux
}

func (ws *WebServer) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	status := fmt.Sprintf(`{
		"currentMapping": "%s",
		"ledCount": %d,
		"status": "running"
	}`, config.CURRENT_MAPPING, config.LED_AMOUNT)

	w.Write([]byte(status))
}

type MappingListItem struct {
	Name         string `json:"name"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	PresetCount  int    `json:"presetCount"`
	LastModified string `json:"lastModified"`
	IsActive     bool   `json:"isActive"`
}

func (ws *WebServer) handleMappings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		ws.handleGetMappings(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (ws *WebServer) handleGetMappings(w http.ResponseWriter, _ *http.Request) {
	files, err := os.ReadDir(config.MAPPINGS_DIR)
	if err != nil {
		http.Error(w, "Failed to read mappings directory", http.StatusInternalServerError)
		return
	}

	var mappings []MappingListItem

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".json") {
			continue
		}

		// Read file to get metadata
		filePath := filepath.Join(config.MAPPINGS_DIR, file.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Error reading mapping file %s: %v", file.Name(), err)
			continue
		}

		var mappingFile custom.MappingFile
		err = json.Unmarshal(data, &mappingFile)
		if err != nil {
			log.Printf("Error parsing mapping file %s: %v", file.Name(), err)
			continue
		}

		info, err := file.Info()
		if err != nil {
			log.Printf("Error getting file info for %s: %v", file.Name(), err)
			continue
		}

		mappings = append(mappings, MappingListItem{
			Name:         file.Name(),
			Title:        mappingFile.Name,
			Description:  mappingFile.Description,
			PresetCount:  len(mappingFile.Presets),
			LastModified: info.ModTime().Format("2006-01-02"),
			IsActive:     file.Name() == config.CURRENT_MAPPING,
		})
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(mappings)
}

func (ws *WebServer) handleMappingOperations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract mapping name from URL path
	pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/mappings/"), "/")
	if len(pathParts) == 0 || pathParts[0] == "" {
		http.Error(w, "Missing mapping name", http.StatusBadRequest)
		return
	}

	mappingName := pathParts[0]
	if !strings.HasSuffix(mappingName, ".json") {
		mappingName += ".json"
	}

	switch r.Method {
	case http.MethodGet:
		ws.handleGetMapping(w, r, mappingName)
	case http.MethodPut:
		ws.handleSaveMapping(w, r, mappingName)
	case http.MethodDelete:
		ws.handleDeleteMapping(w, r, mappingName)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (ws *WebServer) handleGetMapping(w http.ResponseWriter, r *http.Request, mappingName string) {
	filePath := filepath.Join(config.MAPPINGS_DIR, mappingName)
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Mapping not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to read mapping", http.StatusInternalServerError)
		}
		return
	}

	var mappingFile custom.MappingFile
	err = json.Unmarshal(data, &mappingFile)
	if err != nil {
		http.Error(w, "Failed to parse mapping", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(mappingFile)
}

func (ws *WebServer) handleSaveMapping(w http.ResponseWriter, r *http.Request, mappingName string) {
	var mappingFile custom.MappingFile
	err := json.NewDecoder(r.Body).Decode(&mappingFile)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Validate mapping data
	if mappingFile.Name == "" {
		http.Error(w, "Mapping name is required", http.StatusBadRequest)
		return
	}

	// Save to file
	filePath := filepath.Join(config.MAPPINGS_DIR, mappingName)
	data, err := json.MarshalIndent(mappingFile, "", "  ")
	if err != nil {
		http.Error(w, "Failed to serialize mapping", http.StatusInternalServerError)
		return
	}

	data = append(data, '\n')
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		http.Error(w, "Failed to save mapping", http.StatusInternalServerError)
		return
	}

	// If this is the current mapping, reload it
	if mappingName == config.CURRENT_MAPPING {
		err = ws.customMapper.LoadMappingFromFile(mappingName)
		if err != nil {
			log.Printf("Warning: Failed to reload current mapping after save: %v", err)
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}

func (ws *WebServer) handleDeleteMapping(w http.ResponseWriter, r *http.Request, mappingName string) {
	// Prevent deleting the current mapping
	if mappingName == config.CURRENT_MAPPING {
		http.Error(w, "Cannot delete the currently active mapping", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(config.MAPPINGS_DIR, mappingName)
	err := os.Remove(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Mapping not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to delete mapping", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

type PreviewEffectRequest struct {
	First   int             `json:"first"`
	Last    int             `json:"last"`
	Step    int             `json:"step"`
	Color   string          `json:"color"`
	Effect  string          `json:"effect"`
	Options json.RawMessage `json:"options"`
	On      *bool           `json:"on,omitempty"`
}

type TriggerRequest struct {
	Note     int   `json:"note"`
	Velocity int   `json:"velocity,omitempty"`
	On       *bool `json:"on,omitempty"`
}

func (ws *WebServer) handleTriggerPreset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Check if this is a clear all request
	if r.URL.Path == "/api/trigger/clear" {
		err := ws.customMapper.ClearAllEffects()
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to clear effects: %v", err), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "cleared"})
		return
	}

	var request TriggerRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Default to ON if not specified
	isOn := true
	if request.On != nil {
		isOn = *request.On
	}

	// Validate note range
	const maxMidiNote = 127
	if request.Note < 0 || request.Note > maxMidiNote {
		http.Error(w, fmt.Sprintf("Note must be between 0 and %d", maxMidiNote), http.StatusBadRequest)
		return
	}

	// Set default velocity if not provided
	velocity := request.Velocity
	if isOn && velocity <= 0 {
		velocity = 127 // Default to max velocity for ON
	}
	if velocity > 127 {
		velocity = 127
	}

	// Trigger the preset through the custom mapper
	if isOn {
		err = ws.customMapper.TriggerPreset(uint8(request.Note), uint8(velocity))
	} else {
		err = ws.customMapper.TriggerPresetOff(uint8(request.Note), uint8(velocity))
	}
	if err != nil {
		action := "trigger"
		if !isOn {
			action = "turn off"
		}
		http.Error(w, fmt.Sprintf("Failed to %s preset: %v", action, err), http.StatusInternalServerError)
		return
	}

	status := "triggered"
	if !isOn {
		status = "turned off"
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": status,
		"note":   fmt.Sprintf("%d", request.Note),
	})
}

func (ws *WebServer) handlePreviewEffect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var request PreviewEffectRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Validate range
	maxLED := config.LED_AMOUNT - 1
	if request.First < 0 || request.First > maxLED || request.Last < 0 || request.Last > maxLED {
		http.Error(w, fmt.Sprintf("LED range must be between 0 and %d", maxLED), http.StatusBadRequest)
		return
	}

	// Default to ON if not specified
	isOn := true
	if request.On != nil {
		isOn = *request.On
	}

	// Trigger the preview effect through the custom mapper
	if isOn {
		err = ws.customMapper.TriggerPreviewEffect(request.First, request.Last, request.Step, request.Color, request.Effect, request.Options)
	} else {
		err = ws.customMapper.TriggerPreviewEffectOff()
	}
	if err != nil {
		action := "preview"
		if !isOn {
			action = "turn off preview"
		}
		http.Error(w, fmt.Sprintf("Failed to %s effect: %v", action, err), http.StatusInternalServerError)
		return
	}

	status := "preview triggered"
	if !isOn {
		status = "preview turned off"
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": status,
		"effect": request.Effect,
	})
}

func (ws *WebServer) handleClearPreview(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	err := ws.customMapper.ClearPreviewEffects()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to clear preview effects: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "preview cleared"})
}

func (ws *WebServer) Start() error {
	mux := ws.setupRoutes()

	addr := fmt.Sprintf(":%d", config.WEB_UI_PORT)
	log.Printf("Starting web server on http://localhost%s", addr)

	return http.ListenAndServe(addr, mux)
}
