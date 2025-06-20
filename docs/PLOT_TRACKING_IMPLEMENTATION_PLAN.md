# Individual Plot Tracking - Technical Implementation Plan

## Executive Summary

This document provides a detailed technical implementation plan for transforming the Palia Garden Tracker from crop-type aggregation to individual plot-level scheduling. Based on analysis of the current codebase, this plan builds upon existing infrastructure while introducing new capabilities for precise watering and harvest timing.

## Current State Analysis

### 🟢 **Existing Infrastructure (Ready to Build Upon)**

#### 1. Grid System Foundation

- **GridTile Interface**: Already supports individual plot data with `cropType`, `fertilizerType`, `needsWater`, and position tracking
- **TileComponent**: Interactive tile rendering with click handlers and visual indicators
- **GridPreview**: Full garden visualization with tile-level interaction support
- **ParsedGardenData**: Complete garden state management with tile-level granularity

#### 2. Time Management System

```typescript
// Current implementation in MainTracker.tsx
const timeData = useMemo((): TimeData => {
  // Palia time conversion (24x faster than real-world)
  const palianTimeOfDay = (realTimePST * 24) % (24 * 60 * 60);
  const hours = Math.floor(palianMinutes / 60);
  const dayText = `Day ${palianDayThisWeek + 1} Cycle ${cycleId}`;
  // ... complete time calculation system
}, [currentTime]);
```

#### 3. State Management Architecture

- **UnifiedGardenStore**: Zustand-based store with persistence
- **TrackedCrop Interface**: Foundation for crop tracking
- **Plant Interface**: Individual plant instance tracking
- **Persistence Utils**: localStorage-based data persistence

#### 4. UI Components Ready for Enhancement

- **WateringControls**: Bulk watering interface (can be extended)
- **CropSummaryComponent**: Aggregate display (can show individual plots)
- **MainTracker**: Main interface container

### 🟡 **Partial Implementation (Needs Extension)**

#### 1. Individual Plant Tracking

```typescript
// Current: Basic plant instances in TrackedCrop
plantInstances: Plant[]; // Has id, name, needsWater but no position/timing

// Needed: Enhanced with position and scheduling
interface EnhancedPlant extends Plant {
    position: { row: number; col: number };
    plantedAt?: Date;
    lastWatered?: Date;
    fertilizers: string[];
    harvestHistory: Date[];
    nextWateringTime?: Date;
    nextHarvestTime?: Date;
}
```

#### 2. Fertilizer System

```typescript
// Current: Basic fertilizer parsing in GridTile
fertilizerType: string | null;

// Needed: Complete fertilizer effects system
interface FertilizerEffect {
  waterRetain: boolean;
  growthBoost: number; // percentage
  harvestBoost: number;
  qualityIncrease: number;
  weedPrevention: boolean;
}
```

### 🔴 **Missing Components (Need Implementation)**

#### 1. Individual Plot State Management

- Plot-level scheduling calculations
- Individual watering/harvest timing
- Plot status tracking (empty, growing, needsWater, readyToHarvest)

#### 2. Schedule Calculation Engine

- Crop growth time calculations with fertilizer modifiers
- Watering requirement calculations
- Real-world time conversion for notifications

#### 3. Timeline/Schedule UI Components

- Schedule timeline view
- Action queue interface
- Plot detail modal for editing

## Implementation Strategy

### **Approach: Hybrid System with Gradual Migration**

**Rationale**: The current bulk watering system works well for users who prefer simplicity. Individual plot tracking should be an enhancement, not a replacement.

#### Phase 1: Foundation Enhancement (Week 1-2)

- Extend existing data structures
- Implement plot-level state management
- Add fertilizer effects system

#### Phase 2: Core Scheduling (Week 3-4)

- Implement scheduling calculation engine
- Add individual plot timing
- Create plot interaction system

#### Phase 3: UI Enhancement (Week 5-6)

- Build schedule timeline interface
- Add plot detail modals
- Implement action queue system

#### Phase 4: Advanced Features (Week 7-8)

- Add notification system
- Implement batch operations
- Performance optimization

## Detailed Technical Specifications

### 1. Enhanced Data Structures

#### 1.1 Individual Plot Interface

```typescript
interface IndividualPlot {
  id: string; // e.g., "A1", "B3" (row-col identifier)
  position: { row: number; col: number };

  // Crop Information
  cropType?: string;
  cropId?: string; // For multi-tile crops (bushes/trees)

  // Fertilizer System
  fertilizers: AppliedFertilizer[];

  // Timing Information
  plantedAt?: Date;
  lastWatered?: Date;
  harvestHistory: HarvestEvent[];

  // Calculated States
  status: PlotStatus;
  nextWateringTime?: Date;
  nextHarvestTime?: Date;

  // Multi-harvest tracking
  harvestCount: number;
  maxHarvests?: number;

  // Visual/UI state
  isActive: boolean;
  isSelected?: boolean;
}

type PlotStatus =
  | "empty"
  | "growing"
  | "needsWater"
  | "readyToHarvest"
  | "overripe";

interface AppliedFertilizer {
  type: string;
  appliedAt: Date;
  effects: FertilizerEffect;
}

interface HarvestEvent {
  timestamp: Date;
  quantity: number;
  quality: "base" | "star";
}
```

#### 1.2 Enhanced Crop Database

```typescript
interface EnhancedCropData extends ComprehensiveCropData {
  // Scheduling Information
  wateringFrequency: number; // Palia hours between watering
  harvestWindow: number; // Palia hours before overripe

  // Multi-harvest specifics
  reharvestInterval?: number; // Palia hours between harvests

  // Fertilizer compatibility
  compatibleFertilizers: string[];

  // Growth stages for visual feedback
  growthStages: GrowthStage[];
}

interface GrowthStage {
  name: string;
  durationHours: number; // Palia hours
  visualIndicator: string;
  canHarvest: boolean;
}
```

#### 1.3 Garden State Management

```typescript
interface IndividualGardenState {
  // Plot Management
  plots: { [plotId: string]: IndividualPlot };
  dimensions: { rows: number; columns: number };

  // Scheduling
  activeSchedule: ScheduledEvent[];
  upcomingActions: ActionItem[];

  // Settings
  trackingMode: "bulk" | "individual" | "hybrid";
  notificationsEnabled: boolean;
  timezone: string;

  // Statistics
  stats: GardenStatistics;
}

interface ScheduledEvent {
  id: string;
  plotId: string;
  type: "water" | "harvest" | "replant";
  scheduledTime: Date;
  realWorldTime: Date;
  priority: "low" | "medium" | "high" | "urgent";
  completed: boolean;
}

interface ActionItem {
  id: string;
  plotIds: string[];
  action: string;
  timeRemaining: number; // milliseconds
  canBatch: boolean;
}
```

### 2. Scheduling Calculation Engine

#### 2.1 Core Calculation Functions

```typescript
class PlotScheduler {
  /**
   * Calculate next watering time for a plot
   */
  calculateNextWatering(
    plot: IndividualPlot,
    cropData: EnhancedCropData
  ): Date | null {
    // Check if water retain fertilizer is applied
    const hasWaterRetain = plot.fertilizers.some((f) => f.effects.waterRetain);
    if (hasWaterRetain) return null;

    if (!plot.lastWatered || !plot.plantedAt) return new Date(); // Needs water now

    // Calculate based on crop watering frequency
    const wateringInterval = cropData.wateringFrequency * 60 * 60 * 1000; // Convert to ms
    const nextWatering = new Date(
      plot.lastWatered.getTime() + wateringInterval
    );

    return nextWatering;
  }

  /**
   * Calculate harvest time with fertilizer modifiers
   */
  calculateHarvestTime(
    plot: IndividualPlot,
    cropData: EnhancedCropData
  ): Date | null {
    if (!plot.plantedAt) return null;

    // Apply growth boost from fertilizers
    const growthBoost = plot.fertilizers.reduce(
      (boost, f) => boost + f.effects.growthBoost,
      0
    );

    const adjustedGrowthTime = cropData.growthTime * (1 - growthBoost / 100);
    const growthTimeMs = adjustedGrowthTime * 60 * 60 * 1000; // Convert Palia hours to ms

    // For reharvest crops, calculate next harvest after last harvest
    if (cropData.isReharvestable && plot.harvestHistory.length > 0) {
      const lastHarvest = plot.harvestHistory[plot.harvestHistory.length - 1];
      const reharvestInterval = cropData.reharvestInterval! * 60 * 60 * 1000;
      return new Date(lastHarvest.timestamp.getTime() + reharvestInterval);
    }

    return new Date(plot.plantedAt.getTime() + growthTimeMs);
  }

  /**
   * Convert Palia time to real-world time
   */
  paliaToRealWorld(paliaHours: number): number {
    return (paliaHours * 60 * 60 * 1000) / 24; // Palia runs 24x faster
  }

  /**
   * Generate schedule for all plots
   */
  generateSchedule(plots: { [id: string]: IndividualPlot }): ScheduledEvent[] {
    const events: ScheduledEvent[] = [];

    for (const [plotId, plot] of Object.entries(plots)) {
      if (!plot.cropType) continue;

      const cropData = getCropData(plot.cropType);

      // Add watering events
      const nextWatering = this.calculateNextWatering(plot, cropData);
      if (nextWatering) {
        events.push({
          id: `water-${plotId}-${nextWatering.getTime()}`,
          plotId,
          type: "water",
          scheduledTime: nextWatering,
          realWorldTime: nextWatering,
          priority: this.calculatePriority(nextWatering),
          completed: false,
        });
      }

      // Add harvest events
      const nextHarvest = this.calculateHarvestTime(plot, cropData);
      if (nextHarvest) {
        events.push({
          id: `harvest-${plotId}-${nextHarvest.getTime()}`,
          plotId,
          type: "harvest",
          scheduledTime: nextHarvest,
          realWorldTime: nextHarvest,
          priority: this.calculatePriority(nextHarvest),
          completed: false,
        });
      }
    }

    return events.sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );
  }

  private calculatePriority(
    scheduledTime: Date
  ): "low" | "medium" | "high" | "urgent" {
    const timeUntil = scheduledTime.getTime() - Date.now();
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 0) return "urgent"; // Overdue
    if (hoursUntil < 1) return "high"; // Within 1 hour
    if (hoursUntil < 6) return "medium"; // Within 6 hours
    return "low"; // More than 6 hours
  }
}
```

### 3. UI Component Specifications

#### 3.1 Enhanced Grid Preview

```typescript
interface EnhancedGridPreviewProps {
  gardenState: IndividualGardenState;
  trackingMode: "bulk" | "individual";
  onPlotClick: (plotId: string) => void;
  onPlotSelect: (plotIds: string[]) => void;
  showScheduleOverlay: boolean;
  selectedPlots: string[];
}

// Visual indicators for plot status
const getPlotStatusColor = (plot: IndividualPlot): string => {
  switch (plot.status) {
    case "empty":
      return "bg-amber-100 border-amber-300";
    case "growing":
      return "bg-green-100 border-green-300";
    case "needsWater":
      return "bg-red-100 border-red-400";
    case "readyToHarvest":
      return "bg-blue-100 border-blue-400";
    case "overripe":
      return "bg-orange-100 border-orange-400";
    default:
      return "bg-gray-100 border-gray-300";
  }
};
```

#### 3.2 Plot Detail Modal

```typescript
interface PlotDetailModalProps {
  plotId: string;
  plot: IndividualPlot;
  onSave: (updatedPlot: Partial<IndividualPlot>) => void;
  onClose: () => void;
}

// Modal sections:
// 1. Crop Selection & Information
// 2. Fertilizer Management
// 3. Timing Settings (planted time, manual overrides)
// 4. Harvest History
// 5. Schedule Preview
```

#### 3.3 Schedule Timeline Component

```typescript
interface ScheduleTimelineProps {
  schedule: ScheduledEvent[];
  timeRange: { start: Date; end: Date };
  onEventClick: (event: ScheduledEvent) => void;
  onBatchSelect: (events: ScheduledEvent[]) => void;
}

// Timeline features:
// - Horizontal timeline with time markers
// - Color-coded events by type and priority
// - Batch selection for similar actions
// - Real-time updates as time progresses
```

#### 3.4 Action Queue Component

```typescript
interface ActionQueueProps {
  upcomingActions: ActionItem[];
  onActionComplete: (actionId: string) => void;
  onBatchAction: (actionIds: string[]) => void;
  maxItems?: number;
}

// Queue features:
// - Prioritized list of immediate actions
// - Countdown timers for each action
// - Batch operation buttons
// - Quick completion checkboxes
```

### 4. State Management Integration

#### 4.1 Enhanced Store Actions

```typescript
interface IndividualPlotStoreActions {
  // Plot Management
  addPlot: (position: { row: number; col: number }) => void;
  removePlot: (plotId: string) => void;
  updatePlot: (plotId: string, updates: Partial<IndividualPlot>) => void;

  // Crop Management
  plantCrop: (plotId: string, cropType: string, plantedAt?: Date) => void;
  harvestPlot: (plotId: string) => void;
  clearPlot: (plotId: string) => void;

  // Fertilizer Management
  applyFertilizer: (plotId: string, fertilizerType: string) => void;
  removeFertilizer: (plotId: string, fertilizerType: string) => void;

  // Watering Actions
  waterPlot: (plotId: string) => void;
  waterPlots: (plotIds: string[]) => void;
  waterAllPlots: () => void;

  // Schedule Management
  refreshSchedule: () => void;
  completeScheduledEvent: (eventId: string) => void;
  snoozeEvent: (eventId: string, snoozeMinutes: number) => void;

  // Bulk Operations
  selectPlots: (plotIds: string[]) => void;
  batchOperation: (operation: string, plotIds: string[]) => void;

  // Mode Switching
  setTrackingMode: (mode: "bulk" | "individual" | "hybrid") => void;
  migrateToBulkMode: () => void;
  migrateToIndividualMode: () => void;
}
```

#### 4.2 Data Migration Strategy

```typescript
// Migration from current bulk system to individual plots
const migrateBulkToIndividual = (
  trackedCrops: TrackedCrop[],
  parsedGardenData?: ParsedGardenData
): { [plotId: string]: IndividualPlot } => {
  const plots: { [plotId: string]: IndividualPlot } = {};

  if (parsedGardenData) {
    // Use actual garden layout data
    parsedGardenData.tiles.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile.isActive) {
          const plotId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
          plots[plotId] = createIndividualPlot(tile, plotId);
        }
      });
    });
  } else {
    // Create virtual plots from tracked crops
    let plotIndex = 0;
    trackedCrops.forEach((crop) => {
      crop.plantInstances.forEach((plant) => {
        const row = Math.floor(plotIndex / 9);
        const col = plotIndex % 9;
        const plotId = `${String.fromCharCode(65 + row)}${col + 1}`;

        plots[plotId] = {
          id: plotId,
          position: { row, col },
          cropType: crop.cropType,
          fertilizers: [],
          plantedAt: crop.addedAt,
          lastWatered: crop.isWatered ? crop.lastWateredAt : undefined,
          harvestHistory: [],
          status: crop.isWatered ? "growing" : "needsWater",
          harvestCount: 0,
          isActive: true,
        };
        plotIndex++;
      });
    });
  }

  return plots;
};
```

### 5. Performance Considerations

#### 5.1 Optimization Strategies

```typescript
// Memoization for expensive calculations
const useScheduleCalculation = (plots: { [id: string]: IndividualPlot }) => {
  return useMemo(() => {
    return new PlotScheduler().generateSchedule(plots);
  }, [plots]); // Only recalculate when plots change
};

// Virtualization for large gardens
const useVirtualizedGrid = (
  plots: { [id: string]: IndividualPlot },
  viewportSize: { width: number; height: number }
) => {
  // Render only visible plots for gardens larger than 9x9
  return useMemo(() => {
    // Implementation for virtual scrolling/rendering
  }, [plots, viewportSize]);
};

// Debounced updates for real-time calculations
const useDebouncedScheduleUpdate = (plots: {
  [id: string]: IndividualPlot;
}) => {
  const [schedule, setSchedule] = useState<ScheduledEvent[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSchedule(new PlotScheduler().generateSchedule(plots));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [plots]);

  return schedule;
};
```

### 6. Implementation Phases Detail

#### Phase 1: Foundation Enhancement (Week 1-2)

**Goal**: Extend existing data structures and add core individual plot support

**Tasks**:

1. **Enhance Data Structures** (2 days)

   - Create `IndividualPlot` interface
   - Extend `EnhancedCropData` with scheduling info
   - Add fertilizer effects system

2. **Update State Management** (3 days)

   - Extend `UnifiedGardenStore` with individual plot actions
   - Implement data migration utilities
   - Add persistence for individual plot data

3. **Basic Plot Interaction** (2 days)
   - Enhance `TileComponent` with individual plot support
   - Add plot selection and editing capabilities
   - Implement basic plot status visualization

**Deliverables**:

- Enhanced data structures
- Extended state management
- Basic individual plot interaction

#### Phase 2: Core Scheduling (Week 3-4)

**Goal**: Implement scheduling calculation engine and timing system

**Tasks**:

1. **Scheduling Engine** (4 days)

   - Implement `PlotScheduler` class
   - Add watering and harvest time calculations
   - Create fertilizer effect modifiers

2. **Time Management** (2 days)

   - Enhance existing time system for individual plots
   - Add Palia to real-world time conversion
   - Implement schedule refresh system

3. **Plot Status Updates** (1 day)
   - Add real-time plot status calculation
   - Implement overripe detection
   - Add harvest completion tracking

**Deliverables**:

- Complete scheduling calculation engine
- Real-time plot status updates
- Time-based event system

#### Phase 3: UI Enhancement (Week 5-6)

**Goal**: Build user interface for individual plot management

**Tasks**:

1. **Schedule Timeline** (3 days)

   - Create `ScheduleTimeline` component
   - Add timeline visualization
   - Implement event interaction

2. **Plot Detail Modal** (2 days)

   - Build `PlotDetailModal` component
   - Add crop and fertilizer management
   - Implement timing controls

3. **Action Queue** (2 days)
   - Create `ActionQueue` component
   - Add prioritized action list
   - Implement batch operations

**Deliverables**:

- Complete schedule timeline interface
- Plot detail editing modal
- Action queue with batch operations

#### Phase 4: Advanced Features (Week 7-8)

**Goal**: Add notifications, optimization, and advanced features

**Tasks**:

1. **Notification System** (2 days)

   - Add browser notifications for scheduled events
   - Implement notification preferences
   - Add snooze and dismiss functionality

2. **Performance Optimization** (2 days)

   - Implement virtualization for large gardens
   - Add memoization for expensive calculations
   - Optimize rendering performance

3. **Advanced Features** (3 days)
   - Add garden analytics and statistics
   - Implement layout optimization suggestions
   - Add export/import for individual plot data

**Deliverables**:

- Browser notification system
- Performance-optimized rendering
- Advanced garden analytics

### 7. Migration and Compatibility

#### 7.1 Backward Compatibility

- Maintain existing bulk watering system
- Allow users to switch between modes
- Preserve existing saved layouts and data

#### 7.2 Data Migration Path

```typescript
// Automatic migration on first load
const migrateUserData = async () => {
  const existingData = loadPersistedData();
  if (existingData && !existingData.individualPlotsEnabled) {
    const individualPlots = migrateBulkToIndividual(
      existingData.trackedCrops,
      existingData.parsedGardenData
    );

    await savePersistedData({
      ...existingData,
      individualPlots,
      individualPlotsEnabled: true,
      trackingMode: "hybrid", // Start with hybrid mode
    });
  }
};
```

### 8. Testing Strategy

#### 8.1 Unit Tests

- Plot scheduling calculations
- Fertilizer effect calculations
- Time conversion functions
- Data migration utilities

#### 8.2 Integration Tests

- State management with individual plots
- UI component interactions
- Schedule updates and notifications

#### 8.3 Performance Tests

- Large garden rendering (81 plots)
- Schedule calculation performance
- Memory usage with individual plot tracking

### 9. Success Metrics

#### 9.1 Technical Metrics

- Schedule calculation time: < 100ms for 81 plots
- UI responsiveness: < 16ms frame time
- Memory usage: < 50MB additional for individual tracking
- Data persistence: < 1MB storage for full garden state

#### 9.2 User Experience Metrics

- Feature adoption rate: > 60% of users try individual mode
- User retention: No decrease in existing user retention
- Error rate: < 1% of plot operations fail
- Performance: No noticeable slowdown in existing features

### 10. Risk Mitigation

#### 10.1 Technical Risks

- **Performance degradation**: Implement virtualization and memoization
- **Data corruption**: Add comprehensive validation and backup systems
- **Complex state management**: Use TypeScript for type safety

#### 10.2 User Experience Risks

- **Feature complexity**: Provide clear onboarding and documentation
- **Migration issues**: Thorough testing of data migration paths
- **Backward compatibility**: Maintain existing functionality throughout

## Conclusion

This implementation plan provides a comprehensive roadmap for adding individual plot tracking to the Palia Garden Tracker while maintaining backward compatibility and building upon existing infrastructure. The phased approach allows for iterative development and user feedback integration throughout the process.

The hybrid system approach ensures that current users can continue using the bulk watering system they're familiar with, while new users can take advantage of the enhanced individual plot tracking capabilities.
