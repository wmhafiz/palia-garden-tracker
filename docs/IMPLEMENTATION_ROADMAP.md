# Garden Tracker Enhancement Roadmap

## Executive Summary

Based on comprehensive analysis of the original **Palia Garden Planner** vs the current **Garden Tracker**, this roadmap outlines the critical path to achieve feature parity while maintaining the tracker's focus on garden management and watering.

## Critical Issues Identified

### 🔴 **IMMEDIATE FIXES REQUIRED**

1. **Save Code Compatibility Bug** - Tracker only supports v0.4, missing v0.1-v0.3 conversion
2. **Crop Name Mapping Error** - "Batterfly Bean" should be "Batterfly Beans"
3. **Incorrect Crop Data** - Multiple crops have wrong values (Corn, etc.)
4. **Missing Bonus System** - No adjacency calculation or bonus indicators

### 🟡 **HIGH PRIORITY GAPS**

1. **Incomplete Economic Data** - Missing seed/preserve values, processing times
2. **No Multi-Tile Crop Support** - Bushes (2x2) and trees (3x3) not handled properly
3. **Missing Fertilizer System** - No fertilizer parsing or bonus calculation
4. **Limited Grid Functionality** - No save code generation, incomplete parsing

## Implementation Plan

### 🚀 **Phase 1: Critical Bug Fixes** (Week 1)

**Goal**: Fix breaking issues that prevent basic functionality

#### 1.1 Save Code Compatibility

```typescript
// Priority: CRITICAL
// File: lib/services/plannerService.ts

// Add version detection and conversion chain
export function convertLegacySaveCode(saveCode: string): string {
  const version = detectSaveCodeVersion(saveCode);
  let currentCode = saveCode;

  // Convert through version chain: v0.1 → v0.2 → v0.3 → v0.4
  while (version !== "0.4") {
    switch (version) {
      case "0.1":
        currentCode = convertV01ToV02(currentCode);
        break;
      case "0.2":
        currentCode = convertV02ToV03(currentCode);
        break;
      case "0.3":
        currentCode = convertV03ToV04(currentCode);
        break;
    }
  }
  return currentCode;
}
```

#### 1.2 Crop Data Corrections

```typescript
// Priority: CRITICAL
// File: lib/services/plannerService.ts

const CROP_MAPPINGS = {
  // Fix crop name
  Bt: "Batterfly Beans", // Was: 'Batterfly Bean'
  // ... other mappings
};
```

```json
// Priority: CRITICAL
// File: public/crops.json

// Fix Corn data
{
  "name": "Corn",
  "garden_buff": "Harvest Boost", // Was: "Water Retain"
  "base_value": 40, // Was: 41
  "star_value": 60 // Was: 61
}
```

#### 1.3 Basic Bonus Detection

```typescript
// Priority: CRITICAL
// File: hooks/useUnifiedGardenStore.ts

interface BonusCalculation {
  calculateBasicBonuses(tiles: GridTile[][]): void;
  getAdjacentCrops(tile: GridTile, grid: GridTile[][]): string[];
  determineBonusType(cropType: string): Bonus;
}
```

**Week 1 Deliverables:**

- ✅ All save code versions import correctly
- ✅ Crop data matches original planner
- ✅ Basic bonus indicators show in grid
- ✅ No regression in existing functionality

---

### 🏗️ **Phase 2: Enhanced Data Layer** (Week 2)

**Goal**: Add comprehensive crop database and multi-tile support

#### 2.1 Complete Crop Database

```typescript
// Priority: HIGH
// File: public/crops.json

interface EnhancedCropData {
  // Basic info (existing)
  name: string;
  base_value: number;
  star_value: number;

  // NEW: Economic data
  seed_value: { base: number; star: number };
  preserve_value?: { base: number; star: number };

  // NEW: Processing info
  processing_times: {
    seed_minutes: number;
    preserve_minutes?: number;
  };

  // NEW: Conversion ratios
  conversion_ratios: {
    crops_per_seed: number;
    seeds_per_conversion: number;
    crops_per_preserve?: number;
  };

  // NEW: Growth mechanics
  growth_info: {
    growth_time: number;
    base_yield: number;
    is_reharvestable: boolean;
    reharvest_cooldown?: number;
    reharvest_limit?: number;
  };

  // NEW: Garden mechanics
  garden_mechanics: {
    bonus_type: Bonus;
    crop_size: "Single" | "Bush" | "Tree";
    tiles_required: 1 | 4 | 9;
  };
}
```

#### 2.2 Multi-Tile Crop System

```typescript
// Priority: HIGH
// File: types/layout.ts

interface MultiTileCropManager {
  // Crop placement
  validateCropPlacement(crop: Crop, position: Position): boolean;
  placeCrop(crop: Crop, position: Position): PlacementResult;

  // Crop management
  assignCropIds(tiles: GridTile[][]): void;
  getCropBounds(cropId: string): TileBounds;

  // Watering logic
  waterMultiTileCrop(cropId: string): void;
  getMultiTileWateringStatus(cropId: string): WateringStatus;
}
```

#### 2.3 Enhanced Grid Parsing

```typescript
// Priority: HIGH
// File: lib/services/plannerService.ts

export async function parseGridData(input: string): Promise<ParsedGardenData> {
  // ... existing parsing ...

  // NEW: Parse fertilizers
  if (fertiliserCode && FERTILIZER_MAPPINGS[fertiliserCode]) {
    tile.fertilizerType = FERTILIZER_MAPPINGS[fertiliserCode];
  }

  // NEW: Assign multi-tile crop IDs
  if (cropSize && cropSize.size !== "single") {
    tile.cropId = generateCropId(cropType, plotRow, plotCol);
  }

  // NEW: Calculate bonuses after parsing
  calculateGridBonuses(tiles);
}
```

**Week 2 Deliverables:**

- ✅ Complete crop database with all economic data
- ✅ Multi-tile crops (bushes/trees) display correctly
- ✅ Enhanced grid parsing with fertilizers
- ✅ Crop ID assignment for multi-tile crops

---

### 🧮 **Phase 3: Economic Engine** (Week 3)

**Goal**: Add harvest simulation and processing optimization

#### 3.1 Harvest Simulation Engine

```typescript
// Priority: HIGH
// File: lib/services/economicEngine.ts

interface HarvestSimulator {
  simulateHarvest(options: {
    crops: TrackedCrop[];
    days: number;
    playerLevel: number;
    useGrowthBoost: boolean;
    useStarSeeds: boolean;
  }): HarvestResult;

  calculateProfitability(crop: TrackedCrop): ProfitabilityAnalysis;
  calculateROI(crop: TrackedCrop, timeframe: number): ROIAnalysis;
}
```

#### 3.2 Processing Optimization

```typescript
// Priority: HIGH
// File: lib/services/processingOptimizer.ts

interface ProcessingOptimizer {
  calculateOptimalProcessing(harvest: HarvestResult): {
    preserveRecommendations: ProcessingRecommendation[];
    seedRecommendations: ProcessingRecommendation[];
    crafterRequirements: CrafterRequirements;
  };

  optimizeProcessingQueue(jobs: ProcessingJob[]): ProcessingQueue;
  calculateProcessingValue(
    crop: string,
    method: "crop" | "seed" | "preserve"
  ): number;
}
```

#### 3.3 Advanced Bonus System

```typescript
// Priority: MEDIUM
// File: lib/services/bonusCalculator.ts

interface AdvancedBonusSystem {
  calculateAdjacentBonuses(tile: GridTile, grid: GridTile[][]): Bonus[];
  aggregateMultiTileBonuses(cropId: string, tiles: GridTile[]): Bonus[];
  applyBonusThresholds(crop: Crop, bonuses: Bonus[]): Bonus[];

  // Visual enhancements
  renderBonusOverlay(tile: GridTile): React.ReactNode;
  getBonusIntensity(bonuses: Bonus[]): number;
}
```

**Week 3 Deliverables:**

- ✅ Harvest simulation with accurate yields
- ✅ Processing optimization recommendations
- ✅ Advanced bonus calculation system
- ✅ Economic analysis dashboard

---

### 📊 **Phase 4: Analytics & Polish** (Week 4)

**Goal**: Add analytics, export features, and UI enhancements

#### 4.1 Analytics Dashboard

```typescript
// Priority: MEDIUM
// File: components/AnalyticsDashboard.tsx

interface AnalyticsDashboard {
  // Garden efficiency metrics
  calculateGardenEfficiency(): {
    bonusCoverage: number;
    wateringEfficiency: number;
    spaceUtilization: number;
    profitabilityScore: number;
  };

  // Optimization insights
  identifyBottlenecks(): Bottleneck[];
  suggestImprovements(): Improvement[];
  generateEfficiencyReport(): EfficiencyReport;
}
```

#### 4.2 Export Functionality

```typescript
// Priority: MEDIUM
// File: lib/services/exportService.ts

interface ExportService {
  generateSaveCode(garden: Garden): string;
  exportToImage(garden: Garden): Promise<Blob>;
  exportToJSON(garden: Garden): GardenExport;

  shareLayout(garden: Garden, platform: SharingPlatform): void;
  generateShareableLink(garden: Garden): string;
}
```

#### 4.3 UI/UX Enhancements

```typescript
// Priority: MEDIUM
// File: components/enhanced-ui/

// Enhanced grid visualization
-BonusOverlayComponent -
  MultiTileCropIndicator -
  FertilizerIndicator -
  EfficiencyHeatmap -
  // Interactive features
  CropPlacementTool -
  BonusCalculatorWidget -
  ProcessingPlannerModal -
  OptimizationSuggestions;
```

**Week 4 Deliverables:**

- ✅ Comprehensive analytics dashboard
- ✅ Save code generation and export
- ✅ Enhanced UI with bonus indicators
- ✅ Optimization suggestions

---

## Technical Implementation Details

### Database Schema Updates

```typescript
// Enhanced crop metadata structure
interface CropMetadata {
  // Existing fields
  name: string;
  base_value: number;
  star_value: number;
  picture_url: string;

  // NEW: Complete economic data
  economic_data: {
    seed_value: { base: number; star: number };
    preserve_value?: { base: number; star: number };
    processing_times: { seed: number; preserve?: number };
    conversion_ratios: {
      crops_per_seed: number;
      seeds_per_conversion: number;
      crops_per_preserve?: number;
    };
  };

  // NEW: Garden mechanics
  garden_mechanics: {
    bonus_type: Bonus;
    crop_size: CropSize;
    tiles_required: number;
    growth_time: number;
    base_yield: number;
    reharvest_info?: { cooldown: number; limit: number };
  };
}
```

### Store Enhancements

```typescript
// Enhanced unified store with new capabilities
interface EnhancedUnifiedGardenStore extends UnifiedGardenStore {
  // NEW: Bonus system
  bonusCalculation: BonusCalculationEngine;

  // NEW: Economic analysis
  economicEngine: EconomicAnalysisEngine;

  // NEW: Processing management
  processingOptimizer: ProcessingOptimizer;

  // NEW: Multi-tile crop support
  multiTileCropManager: MultiTileCropManager;

  // NEW: Analytics
  analyticsEngine: AnalyticsEngine;
}
```

### Component Architecture

```typescript
// Enhanced component hierarchy
src/
├── components/
│   ├── enhanced-grid/
│   │   ├── EnhancedGridPreview.tsx
│   │   ├── MultiTileTileComponent.tsx
│   │   ├── BonusOverlay.tsx
│   │   └── FertilizerIndicator.tsx
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── EfficiencyMetrics.tsx
│   │   └── OptimizationSuggestions.tsx
│   ├── economic/
│   │   ├── HarvestSimulator.tsx
│   │   ├── ProcessingOptimizer.tsx
│   │   └── ProfitabilityAnalysis.tsx
│   └── export/
│       ├── ExportModal.tsx
│       ├── ShareLayout.tsx
│       └── TemplateManager.tsx
```

## Testing Strategy

### Phase 1 Testing

```typescript
// Critical bug fix validation
describe("Save Code Compatibility", () => {
  test("v0.1 codes convert to v0.4", () => {});
  test("v0.2 codes convert to v0.4", () => {});
  test("v0.3 codes convert to v0.4", () => {});
  test("crop mappings are correct", () => {});
});
```

### Phase 2 Testing

```typescript
// Enhanced data layer validation
describe("Multi-Tile Crop System", () => {
  test("bush crops occupy 2x2 tiles", () => {});
  test("tree crops occupy 3x3 tiles", () => {});
  test("crop IDs are assigned correctly", () => {});
});
```

### Phase 3 Testing

```typescript
// Economic engine validation
describe("Economic Calculations", () => {
  test("harvest simulation matches expected yields", () => {});
  test("processing optimization is accurate", () => {});
  test("bonus calculations are correct", () => {});
});
```

### Phase 4 Testing

```typescript
// Analytics and export validation
describe("Analytics & Export", () => {
  test("efficiency metrics are accurate", () => {});
  test("save code generation works", () => {});
  test("export functionality is complete", () => {});
});
```

## Success Metrics

### Functional Completeness

- ✅ **100% save code compatibility** (v0.1-v0.4)
- ✅ **Complete crop database** with all economic data
- ✅ **Multi-tile crop support** for bushes and trees
- ✅ **Bonus calculation system** with visual indicators
- ✅ **Economic analysis engine** with optimization

### Performance Targets

- ✅ **Grid rendering** < 100ms for 9x9 layouts
- ✅ **Bonus calculation** < 50ms for full garden
- ✅ **Save code parsing** < 200ms for complex layouts
- ✅ **Memory usage** < 50MB for typical usage

### User Experience Goals

- ✅ **Zero breaking changes** for existing users
- ✅ **Intuitive UI** for new features
- ✅ **Comprehensive help** and documentation
- ✅ **Mobile-friendly** responsive design

## Risk Mitigation

### Technical Risks

1. **Performance Impact**: Implement lazy loading and memoization
2. **Complexity Creep**: Maintain clear separation of concerns
3. **Breaking Changes**: Use feature flags and gradual rollout

### User Experience Risks

1. **Feature Overload**: Progressive disclosure of advanced features
2. **Learning Curve**: Interactive tutorials and contextual help
3. **Migration Issues**: Comprehensive data backup and validation

## Conclusion

This roadmap provides a clear path to transform the Garden Tracker into a comprehensive garden management tool while preserving its core tracking functionality. The phased approach ensures:

1. **Immediate Value**: Critical bugs fixed in Week 1
2. **Enhanced Capability**: Complete feature set by Week 4
3. **Maintained Quality**: Comprehensive testing throughout
4. **User Adoption**: Gradual feature introduction with proper support

The enhanced Garden Tracker will provide users with:

- ✅ **Reliable Compatibility**: Import any garden planner layout
- ✅ **Strategic Planning**: Bonus calculations and optimization
- ✅ **Economic Insights**: Profitability analysis and processing optimization
- ✅ **Enhanced Tracking**: Multi-tile crops and comprehensive data
- ✅ **Future Growth**: Extensible architecture for additional features

This implementation will position the Garden Tracker as the premier tool for Palia garden management, complementing the original planner while serving the unique needs of garden tracking and optimization.
