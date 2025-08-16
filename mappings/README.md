# LED Mapping System

This directory contains mapping files that define how MIDI notes trigger LED effects.

## How It Works

1. **Mapping Files**: JSON files in this directory define which MIDI notes trigger which LED effects
2. **Active Mapping**: The system loads one mapping file at a time
3. **Switching**: Use the HTTP endpoint to switch between mapping files during performance

## File Format

Each mapping file is a JSON document with this structure:

```json
{
  "name": "My Light Show",
  "description": "Optional description of this mapping",
  "presets": [
    {
      "note": 36,
      "first": 1,
      "last": 50, 
      "step": 1,
      "color": "#ff0000",
      "effect": "decay",
      "options": {
        "decayCoef": 0.01
      }
    }
  ]
}
```

### Preset Fields

- **note**: MIDI note number (0-127) that triggers this effect
- **first**: First LED in the range (1-based)
- **last**: Last LED in the range (inclusive)
- **step**: Step size for LED selection (1 = every LED, 2 = every other LED, etc.)
- **color**: Hex color code (e.g., "#ff0000" for red)
- **effect**: Effect type ("static", "decay", "sweep", "syncWalk")
- **options**: Effect-specific parameters (see below)

### Effect Types & Options

#### Static
Simple on/off effect
```json
{
  "effect": "static",
  "options": {}
}
```

#### Decay
Fades out over time
```json
{
  "effect": "decay", 
  "options": {
    "decay_coef": 0.01
  }
}
```

#### Sweep
Moving wave effect
```json
{
  "effect": "sweep",
  "options": {
    "speed": 1.0,
    "bleed": 0.5,
    "bleed_after": true,
    "bleed_before": false
  }
}
```

#### SyncWalk
Walking light effect
```json
{
  "effect": "syncWalk",
  "options": {
    "amount": 2
  }
}
```

## Usage

### Creating New Mappings

1. Copy an existing mapping file as a starting point
2. Edit the presets to match your desired light show
3. Test using the switch endpoint

### Switching Mappings

Send a POST request to switch the active mapping:

```bash
curl -X POST http://localhost:8080/switchMapping \
  -H "Content-Type: application/json" \
  -d '{"file": "epic-song.json"}'
```

### REAPER Integration

Create a simple REAPER script to switch mappings:

```lua
function switch_mapping(filename)
  local url = "http://localhost:8080/switchMapping"
  local data = '{"file": "' .. filename .. '"}'
  
  reaper.HTTP_Post(url, data, "Content-Type: application/json")
end

-- Usage:
switch_mapping("epic-song.json")
```

## Example Files

- **default.json**: Basic example with common effects
- **epic-song.json**: High-energy mapping for intense tracks

## Tips

- Use descriptive filenames that match your song names
- Start with lower LED numbers for effects you want "in front"
- Test decay coefficients - smaller values = slower fade
- Sweep speed affects how fast the wave moves across LEDs
- Step values > 1 create interesting patterns (every 2nd, 3rd LED, etc.)