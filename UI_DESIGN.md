# LED Mapping UI Design Document

## Overview

A web-based interface for designing, managing, and previewing LED light show mappings. The UI is served by the Go ddp-sender application and communicates via HTTP API endpoints for real-time LED control during live music performance.

## Architecture

### Technology Stack
- **Frontend**: React 19 + React Router + Tailwind CSS
- **Backend**: Go ddp-sender with embedded static files using `embed`
- **Build System**: Vite (frontend), pnpm (package manager), Go build (backend)
- **Icons**: Lucide React
- **Communication**: REST API + WebSocket for real-time features

### System Integration
```
REAPER + midisender.py → UDP → ddp-sender (Go) → DDP → WLED ESP32 → LED Strip
                                    ↓
                            Web UI (React + Tailwind)
```

## UI Structure & Current Status

### 1. Navigation & Layout ✅ COMPLETED
**Features Implemented**:
- ✅ **Sidebar Navigation**: Clean navigation with Lucide icons
  - Mappings (Folder icon)
  - Preview (Eye icon)
  - Config (Settings icon)
- ✅ **System Status Bar**: Live system monitoring
  - Connection status (green/red indicator)
  - LED count display
  - Current active mapping
- ✅ **Professional Design**: Dark theme, consistent spacing, hover effects

### 2. Mapping Manager ✅ COMPLETED
**Purpose**: Overview and management of all mapping files

**Features Implemented**:
- ✅ **Mapping Cards**: Grid layout with mapping information
  - Name, description, preset count, creation date
  - Clear "Active" indicators for current mapping
  - Professional card design with hover effects
- ✅ **Actions**: All essential operations
  - Activate mapping (Zap icon)
  - Edit mapping (Edit3 icon)
  - Duplicate mapping (Copy icon)
  - Delete mapping (Trash2 icon)
  - Create new mapping (Plus icon)
- ✅ **Search & Filter**: Real-time search functionality
- ✅ **Empty States**: Helpful empty state with guidance
- ✅ **Error Handling**: Proper error states and retry mechanisms

### 3. Mapping Editor ✅ COMPLETED
**Purpose**: Primary design tool for creating and editing mappings

**Layout & Features**:
- ✅ **Header Bar**:
  - Navigation breadcrumbs
  - Save status indicators
  - Save button with proper hover effects and icons
- ✅ **LED Strip Visualization** (Full-width interactive):
  - 150 individual LED elements with responsive sizing
  - Real-time color-coded mapping visualization
  - Click-and-drag range selection with live feedback
  - LED numbering markers every 10 positions
  - Quick selection tools (ranges, clear, all)
- ✅ **Two-Panel Layout**:
  - **Left Panel**: Compact preset list (optimized for scrolling)
  - **Right Panel**: Comprehensive preset editor

**Preset List** ✅ OPTIMIZED:
- ✅ **Compact Design**: Reduced vertical space for better navigation
- ✅ **Effect Type Display**: Clean text-based effect indicators
- ✅ **Action Buttons**: Consistent icon-based actions
- ✅ **Selection State**: Clear visual feedback for selected presets

**Preset Editor** ✅ ENHANCED:
- ✅ **Action Bar Location**: Moved to top for better accessibility
- ✅ **Save Changes Button**: Prominent with Save icon and proper hover effects
- ✅ **Effect Previews**: Live hardware testing capabilities
  - Preview button (Eye icon) for non-static effects
  - Hold-to-preview for static effects
  - Clear button (Eraser icon) for stopping effects
- ✅ **Effect Options**: Comprehensive parameter editors
  - Static: Simple on/off explanation
  - Decay: Coefficient slider with curve visualization
  - Sweep: Speed, bleed controls with live preview
  - SyncWalk: Amount control with walking pattern preview

### 4. Effect Preview System ✅ COMPLETED
**Purpose**: Test and validate effects before performance

**Features Implemented**:
- ✅ **Live LED Visualization**: Real-time effect display
- ✅ **Manual Trigger System**:
  - Individual preset triggering
  - Static effects: Mouse hold for on/off
  - Dynamic effects: Click to trigger
  - SyncWalk: Step advancement on each trigger
- ✅ **Effect Grouping**: Organized by effect type for easy navigation
- ✅ **Quick Actions**:
  - Clear all effects (Square icon)
  - Clear visual state (Eraser icon)
  - Refresh data (RefreshCw icon)
- ✅ **System Integration**: Real API calls to backend for hardware testing

### 5. Effect Options & Simulation ✅ ENHANCED
**Advanced Parameter Control**:

**SyncWalk Options**:
- ✅ **Live Animation**: Walking pattern simulation with accurate timing
- ✅ **Parameter Reset**: Animation restarts from 0 when amount changes
- ✅ **Amount Control**: Slider + presets + manual input
- ✅ **Visual Preview**: 20-LED simulation with step indicators

**Sweep Options**:
- ✅ **Accurate Simulation**: Matches backend implementation exactly
  - Same position calculation: `int(currentStep)`
  - Same bleed formula: `Math.pow(distance, 2.2) * bleed`
  - Same direction logic: before/after sweep position
  - Same minimum threshold: 0.0065
- ✅ **Parameter Reset**: Animation restarts when any parameter changes
- ✅ **Comprehensive Controls**: Speed, bleed amount, direction settings

**Decay Options**:
- ✅ **Curve Visualization**: Mathematical decay curve display
- ✅ **Preset Values**: Common decay coefficients
- ✅ **Real-time Preview**: Immediate visual feedback

## Core Features Status

### LED Range Calculation ✅ FIXED
**Problem Solved**: Incorrect LED counting in preset list
- ✅ **Exclusive Range Logic**: Matches backend `MakeRange` exactly
  - Positive step: `for i := first; i < last` (exclusive last)
  - Negative step: `for i := first; i > last` (exclusive last)
- ✅ **Negative Step Support**: Proper handling of reverse ranges
- ✅ **Zero LED Handling**: Correctly handles LED 0 in ranges

### Effect Parameter Accuracy ✅ ENHANCED
**Problem Solved**: Simulation didn't match hardware behavior
- ✅ **Animation Reset**: All effect previews restart from 0 when parameters change
- ✅ **Backend Parity**: Sweep simulation matches Go implementation exactly
- ✅ **Consistent Behavior**: Preview accurately represents hardware output

### Professional UI Design ✅ COMPLETED
**Comprehensive Icon Migration**:
- ✅ **Lucide React Integration**: Replaced all emojis with professional icons
- ✅ **Consistent Styling**: All buttons use same hover patterns and transitions
- ✅ **Accessible Design**: Proper contrast, sizing, and interaction feedback
- ✅ **Layout Optimization**: Compact preset list, accessible action buttons

## API Integration Status

### Implemented Endpoints ✅
- ✅ `GET /api/status` - System status and current mapping
- ✅ `POST /api/switchMapping` - Switch active mapping
- ✅ `GET /api/mappings/{name}` - Load mapping file
- ✅ `PUT /api/mappings/{name}` - Save mapping file
- ✅ `POST /api/effects/trigger` - Trigger effect preview
- ✅ `POST /api/effects/triggerOff` - Turn off effect
- ✅ `POST /api/effects/clearAll` - Clear all active effects

### Frontend API Layer ✅
- ✅ **Type Safety**: Complete TypeScript interfaces for all API responses
- ✅ **Error Handling**: Consistent error handling across all API calls
- ✅ **Loading States**: Proper loading indicators and error recovery
- ✅ **Real-time Updates**: Live system status monitoring

## User Workflow

### 1. Creating New Mapping ✅ STREAMLINED
1. **Navigate**: From sidebar or mapping manager
2. **Design**: Click-drag LED ranges on interactive strip
3. **Configure**: Use action bar at top for immediate access to save/preview
4. **Effects**: Configure parameters with live simulation
5. **Test**: Preview on hardware with manual trigger system
6. **Save**: One-click save with clear status feedback

### 2. Live Performance ✅ OPTIMIZED
1. **Quick Access**: Sidebar navigation always available
2. **Mapping Switch**: One-click activation from mapping manager
3. **Effect Testing**: Preview tab for real-time effect validation
4. **Status Monitoring**: Always-visible system status in sidebar

### 3. Effect Design Workflow ✅ ENHANCED
1. **Visual Design**: LED strip interaction for range selection
2. **Parameter Tuning**: Live simulation with hardware-accurate behavior
3. **Hardware Testing**: Direct LED hardware preview
4. **Validation**: Real-time conflict detection and error prevention

## Performance & Optimization

### Frontend Performance ✅
- ✅ **Bundle Optimization**: Tailwind purging, efficient imports
- ✅ **React Optimization**: Proper key props, memoization where needed
- ✅ **Responsive Rendering**: Efficient LED strip rendering with CSS transforms
- ✅ **Debounced Updates**: Form inputs debounced to prevent excessive updates

### Backend Integration ✅
- ✅ **Efficient API Design**: Minimal payload sizes, batched operations
- ✅ **File Operations**: Direct JSON file handling, no database overhead
- ✅ **Live Preview**: Direct hardware integration for effect testing

## Technical Stack Details

### Dependencies ✅ CURRENT
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.1",
  "lucide-react": "^0.539.0",
  "tailwindcss": "^3.4.0",
  "vite": "^7.1.2",
  "typescript": "^5.9.2"
}
```

### Build Process ✅
1. **Frontend**: `pnpm build` (outputs to `ui/dist/`)
2. **Backend**: `go build` (embeds `ui/dist/` files)
3. **Helper**: `./build.sh` (runs both steps)

## Future Enhancements (Planned)

### System Monitoring 🎯 NEXT PRIORITY
**Performance Monitoring Dashboard**:
- Real-time metrics (FPS, memory, effect count)
- MIDI activity monitoring
- System performance graphs
- Alert system for performance issues
- **Design Focus**: Ultra-low overhead (< 0.1ms per frame)

### Advanced Features (Future)
- **2D LED Layouts**: Matrix and custom shape support
- **Effect Chains**: Multiple effects on same LED range
- **MIDI Learn**: Click preset + hit MIDI key to assign
- **Timeline Editor**: Sequence effects over time
- **Effect Templates**: Reusable effect patterns

### Hardware Integration Enhancements
- **Connection Monitoring**: DDP packet success/failure tracking
- **Multi-Universe Support**: Multiple LED controllers

## Code Quality & Maintenance

### Standards ✅ IMPLEMENTED
- **TypeScript**: Full type safety across frontend
- **ESLint/Prettier**: Code formatting and quality
- **Component Structure**: Consistent file organization
- **Error Boundaries**: Graceful error handling

### Testing Strategy
- **Manual Testing**: Real hardware validation
- **Performance Testing**: Frame rate validation tools

---
