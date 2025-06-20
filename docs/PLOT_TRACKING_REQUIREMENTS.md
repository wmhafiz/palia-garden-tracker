# Updated Product Requirements: Palia Garden Tracker - Individual Plot Scheduling

## Document Summary

This document updates the original plot tracking requirements based on analysis of the current implementation. It provides a more realistic scope and builds upon existing infrastructure while maintaining backward compatibility.

## Current Implementation Analysis

### ✅ **What We Already Have**

#### 1. **Robust Time Management System**

- Complete Palia time calculation (24x real-world speed)
- Real-time clock with day/cycle tracking
- Time-based state management with daily resets
- Existing cycle tracking and watering history

#### 2. **Grid-Based Garden System**

- `GridTile` interface with individual plot data
- `TileComponent` with click handlers and visual indicators
- `GridPreview` component for full garden visualization
- Support for fertilizer data per tile
- Multi-tile crop support (bushes/trees)

#### 3. **Comprehensive State Management**

- Zustand-based `UnifiedGardenStore` with persistence
- Individual plant instance tracking (`Plant` interface)
- Crop database with economic and growth data
- Save/load system with garden layout preservation

#### 4. **Working UI Components**

- Bulk watering controls with statistics
- Crop summary with breakdown by type
- Interactive garden grid with watering indicators
- Migration system for legacy data

### 🔄 **What Needs Enhancement**

#### 1. **Individual Plot State Management**

```typescript
// Current: Basic plant instances
plantInstances: Plant[]; // Has id, name, needsWater

// Needed: Enhanced with scheduling
interface ScheduledPlant extends Plant {
    position: { row: number; col: number };
    plantedAt?: Date;
    lastWatered?: Date;
    fertilizers: string[];
    nextWateringTime?: Date;
    nextHarvestTime?: Date;
    status: 'empty' | 'growing' | 'needsWater' | 'readyToHarvest';
}
```

#### 2. **Fertilizer Effects System**

```typescript
// Current: Basic fertilizer type
fertilizerType: string | null;

// Needed: Complete effects calculation
interface FertilizerEffects {
  waterRetain: boolean;
  growthSpeedBoost: number; // percentage
  harvestQuantityBoost: number;
  qualityBoost: number;
  weedPrevention: boolean;
}
```

#### 3. **Schedule Calculation Engine**

- Individual plot timing calculations
- Fertilizer effect modifiers
- Real-world time notifications
- Batch action optimization

## Revised Requirements

### **Core User Stories (Updated)**

#### **Primary Stories**

1. **As a player**, I want to click on individual plots to see their specific watering and harvest schedule
2. **As a busy player**, I want to see a prioritized list of which plots need immediate attention
3. **As an optimizer**, I want to understand how fertilizers affect my watering schedule
4. **As a tracker user**, I want to switch between bulk and individual tracking modes

#### **Secondary Stories**

1. **As a mobile user**, I want to quickly see upcoming garden tasks for the next few hours
2. **As a planner**, I want to batch similar actions together (e.g., "Water plots A1, B3, C2")
3. **As a data-driven player**, I want to see statistics about my garden efficiency

### **Functional Requirements (Prioritized)**

#### **Phase 1: Individual Plot Foundation (MVP)**

##### 1.1 Enhanced Plot Interaction

- **Click-to-View**: Click any plot to see detailed information
- **Plot Status Display**: Visual indicators for plot status (empty, growing, needs water, ready to harvest)
- **Basic Scheduling**: Show next watering time and harvest time for each plot
- **Fertilizer Awareness**: Display applied fertilizers and their effects

##### 1.2 Hybrid Tracking Mode

- **Mode Toggle**: Switch between "Bulk" and "Individual" tracking modes
- **Backward Compatibility**: Maintain existing bulk watering functionality
- **Data Migration**: Seamlessly convert existing tracked crops to individual plots

##### 1.3 Simple Schedule View

- **Next Actions**: Show top 5 most urgent actions needed
- **Time Remaining**: Display countdown timers for upcoming tasks
- **Quick Actions**: One-click completion of watering/harvesting tasks

#### **Phase 2: Enhanced Scheduling (Full Feature)**

##### 2.1 Advanced Schedule Engine

- **Fertilizer Calculations**: Accurate timing based on applied fertilizers
- **Multi-Harvest Support**: Track reharvest cycles for crops like tomatoes
- **Growth Stages**: Visual progression indicators for crop growth
- **Overripe Detection**: Warnings for crops that need immediate harvesting

##### 2.2 Timeline Interface

- **Schedule Timeline**: Horizontal timeline showing next 24 hours of garden tasks
- **Batch Operations**: Group similar actions for efficient execution
- **Priority System**: Color-coded urgency levels (green, yellow, red)

##### 2.3 Notification System

- **Browser Notifications**: Optional alerts for urgent garden tasks
- **Snooze Functionality**: Delay notifications for a set period
- **Customizable Alerts**: Choose which events trigger notifications

#### **Phase 3: Advanced Features (Enhancement)**

##### 3.1 Garden Analytics

- **Efficiency Metrics**: Track watering consistency and harvest timing
- **Optimization Suggestions**: Recommend fertilizer usage for better scheduling
- **Historical Data**: View past performance and trends

##### 3.2 Batch Management

- **Multi-Select Plots**: Select multiple plots for bulk operations
- **Smart Batching**: Automatically group plots with similar timing
- **Quick Templates**: Save and apply common plot configurations

### **Technical Implementation Strategy**

#### **Architecture: Hybrid Enhancement Approach**

**Rationale**: Build upon existing infrastructure while adding individual plot capabilities as an optional enhancement.

##### 1. **Data Structure Evolution**

```typescript
// Extend existing TrackedCrop to support individual plots
interface EnhancedTrackedCrop extends TrackedCrop {
  // Individual plot tracking
  individualPlots?: { [plotId: string]: IndividualPlot };

  // Scheduling data
  schedule?: PlotSchedule;

  // Mode selection
  trackingMode: "bulk" | "individual";
}

interface IndividualPlot {
  id: string; // "A1", "B2", etc.
  position: { row: number; col: number };
  cropType?: string;
  fertilizers: string[];
  plantedAt?: Date;
  lastWatered?: Date;
  harvestHistory: Date[];
  status: PlotStatus;
  nextWateringTime?: Date;
  nextHarvestTime?: Date;
}

type PlotStatus =
  | "empty"
  | "growing"
  | "needsWater"
  | "readyToHarvest"
  | "overripe";
```

##### 2. **State Management Integration**

```typescript
// Extend UnifiedGardenStore with individual plot actions
interface EnhancedGardenStoreActions extends UnifiedGardenStoreActions {
  // Individual plot management
  setTrackingMode: (cropType: string, mode: "bulk" | "individual") => void;
  updatePlot: (plotId: string, updates: Partial<IndividualPlot>) => void;
  waterPlot: (plotId: string) => void;
  harvestPlot: (plotId: string) => void;

  // Scheduling
  refreshSchedule: (cropType?: string) => void;
  getUpcomingActions: (hours?: number) => ActionItem[];
  completeAction: (actionId: string) => void;

  // Batch operations
  batchWaterPlots: (plotIds: string[]) => void;
  batchHarvestPlots: (plotIds: string[]) => void;
}
```

##### 3. **UI Component Enhancement**

```typescript
// Enhanced TileComponent with individual plot support
interface EnhancedTileProps extends TileComponentProps {
  trackingMode: "bulk" | "individual";
  plotData?: IndividualPlot;
  onPlotClick?: (plotId: string) => void;
  showScheduleOverlay?: boolean;
}

// New components for individual tracking
interface PlotDetailModalProps {
  plotId: string;
  onClose: () => void;
  onSave: (updates: Partial<IndividualPlot>) => void;
}

interface ScheduleViewProps {
  upcomingActions: ActionItem[];
  timeRange: number; // hours to show
  onActionComplete: (actionId: string) => void;
}
```

### **Performance Requirements (Realistic)**

#### **Scalability Targets**

- **Garden Size**: Support up to 81 plots (9x9 grid) without performance degradation
- **Schedule Calculation**: Complete refresh in < 200ms for full garden
- **UI Responsiveness**: Maintain 60fps during interactions
- **Memory Usage**: < 25MB additional for individual plot tracking

#### **Optimization Strategies**

- **Lazy Loading**: Load individual plot data only when needed
- **Memoization**: Cache expensive calculations (schedule, fertilizer effects)
- **Virtualization**: Render only visible plots for large gardens
- **Debounced Updates**: Batch state updates to prevent excessive re-renders

### **User Experience Design (Updated)**

#### **Information Architecture**

```
Current: Crop Type → Bulk Status → Aggregate Actions
Enhanced: Crop Type → Individual Plots → Specific Schedules → Targeted Actions
```

#### **Interaction Flow**

1. **Garden Overview**: Grid showing all plots with status indicators
2. **Mode Selection**: Toggle between bulk and individual tracking
3. **Plot Interaction**: Click plot to view details and schedule
4. **Action Execution**: Complete watering/harvesting with visual feedback
5. **Schedule Review**: View upcoming tasks and batch operations

#### **Visual Design Principles**

- **Progressive Enhancement**: Individual features enhance rather than replace bulk features
- **Status-Driven Colors**: Consistent color coding for plot status
- **Time-Based Urgency**: Visual hierarchy based on time sensitivity
- **Batch-Friendly**: Easy selection and operation on multiple plots

### **Implementation Phases (Realistic Timeline)**

#### **Phase 1: Foundation (Weeks 1-2)**

**Goal**: Add individual plot tracking as optional enhancement

**Deliverables**:

- Enhanced data structures with individual plot support
- Mode toggle between bulk and individual tracking
- Basic plot detail view with scheduling information
- Data migration from existing bulk system

#### **Phase 2: Scheduling (Weeks 3-4)**

**Goal**: Implement core scheduling functionality

**Deliverables**:

- Schedule calculation engine with fertilizer effects
- Next actions view with priority system
- Real-time plot status updates
- Basic batch operations

#### **Phase 3: Interface (Weeks 5-6)**

**Goal**: Build user interface for individual plot management

**Deliverables**:

- Enhanced grid with individual plot interactions
- Plot detail modal for editing
- Schedule timeline view
- Action queue with batch operations

#### **Phase 4: Polish (Weeks 7-8)**

**Goal**: Add advanced features and optimize performance

**Deliverables**:

- Browser notification system
- Garden analytics and statistics
- Performance optimization
- User onboarding and help system

### **Success Metrics (Measurable)**

#### **Adoption Metrics**

- **Feature Discovery**: 80% of users notice the individual tracking option
- **Feature Trial**: 50% of users try individual tracking mode
- **Feature Retention**: 30% of users prefer individual tracking after trial
- **Performance**: No increase in page load time or memory usage

#### **User Experience Metrics**

- **Task Completion**: 90% of users can successfully switch tracking modes
- **Schedule Accuracy**: 95% of calculated schedules match actual game timing
- **Error Rate**: < 2% of individual plot operations fail
- **User Satisfaction**: Maintain or improve current user satisfaction scores

### **Risk Mitigation (Updated)**

#### **Technical Risks**

- **Complexity Creep**: Maintain focus on core scheduling functionality
- **Performance Impact**: Implement lazy loading and optimization from start
- **Data Migration**: Thorough testing of bulk-to-individual conversion
- **Browser Compatibility**: Test notification system across browsers

#### **User Experience Risks**

- **Feature Confusion**: Clear mode indicators and onboarding
- **Overwhelming Interface**: Progressive disclosure of advanced features
- **Backward Compatibility**: Ensure existing workflows continue to work
- **Learning Curve**: Provide help documentation and tooltips

### **Scope Boundaries (Clear Limitations)**

#### **What's Included**

- Individual plot tracking with scheduling
- Fertilizer effect calculations
- Basic notification system
- Hybrid bulk/individual modes
- Data migration from existing system

#### **What's Excluded (Future Considerations)**

- Advanced garden optimization algorithms
- Social features (sharing, collaboration)
- Mobile app development
- Complex multi-garden management
- Advanced analytics and reporting
- Integration with external Palia tools

### **Dependencies and Prerequisites**

#### **Technical Dependencies**

- Existing crop database with growth times
- Current time management system
- Zustand state management
- localStorage persistence
- React component architecture

#### **Content Dependencies**

- Complete fertilizer effects data
- Accurate crop growth timing
- Multi-harvest crop specifications
- Garden layout format compatibility

### **Acceptance Criteria**

#### **Phase 1 Acceptance**

- [ ] Users can toggle between bulk and individual tracking modes
- [ ] Individual plots display current status and next action timing
- [ ] Existing bulk watering functionality remains unchanged
- [ ] Data migration preserves all existing tracked crops

#### **Phase 2 Acceptance**

- [ ] Schedule calculations account for fertilizer effects
- [ ] Next actions list shows prioritized tasks with time remaining
- [ ] Plot status updates automatically based on time progression
- [ ] Batch operations work for multiple selected plots

#### **Phase 3 Acceptance**

- [ ] Grid interface supports individual plot interactions
- [ ] Plot detail modal allows editing of crop and fertilizer data
- [ ] Schedule timeline shows upcoming 24 hours of garden tasks
- [ ] Action queue provides quick completion of urgent tasks

#### **Phase 4 Acceptance**

- [ ] Browser notifications work for urgent garden tasks
- [ ] Garden statistics show efficiency metrics
- [ ] Performance meets all specified targets
- [ ] User onboarding guides new users through features

## Conclusion

This updated requirements document provides a realistic and achievable path for implementing individual plot tracking in the Palia Garden Tracker. By building upon existing infrastructure and using a hybrid approach, we can deliver valuable new functionality while maintaining the simplicity and reliability that current users appreciate.

The phased implementation approach allows for iterative development, user feedback incorporation, and risk mitigation throughout the process. The focus on backward compatibility ensures that existing users can continue using their preferred workflow while new users can take advantage of enhanced individual plot tracking capabilities.
