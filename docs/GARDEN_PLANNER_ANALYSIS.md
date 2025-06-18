# Palia Garden Planner vs Tracker: Comprehensive Analysis

## Executive Summary

This document provides a detailed comparison between the original **Palia Garden Planner** and the current **Palia Garden Tracker** implementations, identifying discrepancies, missing features, and areas for improvement.

## Project Architecture Comparison

### Original Garden Planner (Nuxt.js/Vue)

- **Framework**: Nuxt.js 3 with Vue 3 Composition API
- **State Management**: Pinia stores with reactive refs
- **Architecture**: Class-based OOP design with comprehensive domain modeling
- **Focus**: Full garden planning, optimization, and economic analysis

### Current Garden Tracker (Next.js/React)

- **Framework**: Next.js 14 with React 19
- **State Management**: Zustand with TypeScript
- **Architecture**: Functional programming with service-oriented design
- **Focus**: Garden tracking and watering management

## Critical Discrepancies Found

### 1. Save Code Version Compatibility Issues

#### ❌ **CRITICAL BUG**: Incomplete Version Support

**Current Status**: Tracker only supports v0.4 format
**Required**: Full backward compatibility (v0.1 → v0.4)

**Missing Version Handlers**:

```typescript
// MISSING: v0.1 → v0.2 conversion
const v0_1CropCodes = {
  Na: "N", // None
  To: "T", // Tomato
  Po: "P", // Potato
  Ri: "R", // Rice
  Wh: "W", // Wheat
  Ca: "C", // Carrot
  On: "O", // Onion
  Co: "Co", // Cotton (unchanged)
  Bl: "B", // Blueberry
  Ap: "A", // Apple
  Co: "Cr", // Corn (conflict with Cotton!)
};

// MISSING: v0.2 → v0.3 conversion
// MISSING: v0.3 → v0.4 conversion with fertilizer code updates
```

#### ❌ **CRITICAL BUG**: Crop Code Mapping Error

**Issue**: Tracker has incorrect crop name for "Batterfly Bean"

```typescript
// Current (WRONG)
'Bt': 'Batterfly Bean'

// Should be (CORRECT)
'Bt': 'Batterfly Beans'  // Note: plural form
```

### 2. Missing Crop Database Information

#### ❌ **Missing Economic Data**

Current tracker lacks comprehensive crop economics:

```typescript
// MISSING: Complete crop metadata
interface MissingCropData {
  // Economic information
  seedValue: number; // Seed selling price
  preserveValue: number; // Preserve jar value
  seedProcessTime: number; // Minutes to process seeds
  preserveProcessTime: number; // Minutes to process preserves

  // Conversion ratios
  cropsPerSeed: number; // How many crops needed per seed
  seedsPerConversion: number; // How many seeds produced
  cropsPerPreserve: number; // How many crops per preserve

  // Growth mechanics
  isReharvestable: boolean; // Can be harvested multiple times
  reharvestCooldown: number; // Days between harvests
  reharvestLimit: number; // Max reharvests

  // Bonus mechanics
  gardenBonus: Bonus; // What bonus this crop provides
  cropSize: CropSize; // Single/Bush/Tree
  tilesRequired: number; // How many tiles crop occupies
}
```

#### ❌ **Missing Crop Data Examples**:

```json
// Current crops.json is missing:
{
  "name": "Corn",
  "garden_buff": "Water Retain", // WRONG! Should be "Harvest Boost"
  "base_value": 41, // WRONG! Should be 40
  "star_value": 61, // WRONG! Should be 60
  "seedValue": 15, // MISSING
  "preserveValue": 60, // MISSING
  "isReharvestable": false, // MISSING
  "cropSize": "Single", // MISSING
  "tilesRequired": 1 // MISSING
}
```

### 3. Missing Bonus Calculation System

#### ❌ **CRITICAL MISSING**: Garden Bonus Logic

The tracker completely lacks the sophisticated bonus calculation system:

```typescript
// MISSING: Bonus adjacency calculation
interface MissingBonusSystem {
  // Bonus types from original
  bonusTypes: {
    WaterRetain: "Water Retain";
    HarvestIncrease: "Harvest Increase";
    QualityIncrease: "Quality Increase";
    SpeedIncrease: "Speed Increase";
    WeedPrevention: "Weed Prevention";
  };

  // Multi-tile crop bonus requirements
  bushBonusThreshold: 2; // Need 2+ bonus tiles for bush crops
  treeBonusThreshold: 3; // Need 3+ bonus tiles for tree crops

  // Bonus calculation per crop
  calculateBonusesReceived(): Bonus[];
  calculateBonusesApplied(): Bonus[];
}
```

#### ❌ **Missing Bonus Mechanics**:

1. **Adjacency Detection**: No logic to detect neighboring crop bonuses
2. **Multi-tile Crops**: No special handling for bushes (2x2) and trees (3x3)
3. **Bonus Aggregation**: No system to accumulate and apply bonuses
4. **Visual Indicators**: No bonus visualization in grid

### 4. Layout Import/Export Bugs

#### ❌ **BUG**: Incomplete Grid Parsing

```typescript
// Current implementation missing:
- Fertilizer information parsing
- Multi-tile crop ID assignment
- Bonus calculation after import
- Grid validation for illegal layouts
```

#### ❌ **BUG**: Save Code Generation

```typescript
// Tracker cannot generate save codes
// Missing: saveLayout() functionality
// Missing: Settings encoding/decoding
```

## Missing Functionalities Analysis

### 1. Economic Calculation Engine

#### ❌ **MISSING**: Harvest Simulation

```typescript
// Original has sophisticated yield simulation
interface MissingHarvestEngine {
  simulateYield(options: {
    days: number;
    useGrowthBoost: boolean;
    includeReplant: boolean;
    includeReplantCost: boolean;
    level: number;
    useStarSeeds: boolean;
  }): {
    harvests: IHarvestInfo[];
    harvestTotal: IHarvestInfo;
  };

  calculateValue(
    options: CalculateValueOptions,
    harvestInfo: ISimulateYieldResult
  ): ICalculateValueResult;
}
```

#### ❌ **MISSING**: Processing Optimization

```typescript
// Original has preserve jar and seed maker optimization
interface MissingProcessingEngine {
  processorSettings: Map<string, ProcessorSetting>;
  calculateOptimalProcessing(): ProcessingRecommendation[];
  calculateCrafterRequirements(): CrafterRequirements;
}
```

### 2. Advanced Grid Features

#### ❌ **MISSING**: Plot Management

```typescript
// Original supports variable plot sizes and activation
interface MissingPlotSystem {
  activePlots: boolean[][]; // Which plots are active
  plotDimensions: { rows: number; cols: number };
  maxPlots: number; // Plot limit enforcement

  // Plot operations
  togglePlot(row: number, col: number): void;
  validatePlotCount(): boolean;
  calculateActivePlotCount(): number;
}
```

#### ❌ **MISSING**: Fertilizer System

```typescript
// Complete fertilizer system missing
interface MissingFertilizerSystem {
  fertilizers: {
    SpeedyGro: "S"; // Speed boost
    QualityUp: "Q"; // Quality increase
    WeedBlock: "W"; // Weed prevention
    HarvestBoost: "H"; // Harvest increase
    HydratePro: "Y"; // Water retention
  };

  applyFertilizer(tile: Tile, fertilizer: FertilizerType): void;
  calculateFertilizerBonuses(): Bonus[];
}
```

### 3. Settings and Configuration

#### ❌ **MISSING**: Harvester Settings

```typescript
interface MissingHarvesterSettings {
  days: number; // Simulation duration
  includeReplant: boolean; // Include replanting
  includeReplantCost: boolean; // Deduct replant costs
  level: number; // Player gardening level
  useGrowthBoost: boolean; // Apply speed bonuses
  useStarSeeds: boolean; // Use star quality seeds
}
```

#### ❌ **MISSING**: Processor Settings

```typescript
interface MissingProcessorSettings {
  cropSettings: Map<
    string,
    {
      processAs: "crop" | "seed" | "preserve";
      isStar: boolean;
      crafters: number;
      targetTime: number;
    }
  >;
  goldAverageSetting: "crafterTime" | "growthTick";
}
```

## Data Structure Improvements Needed

### 1. Enhanced Crop Metadata

```typescript
// Current simplified structure
interface CurrentCropMetadata {
  name: string;
  garden_buff: string;
  base_value: number;
  star_value: number;
  picture_url: string;
}

// Required comprehensive structure
interface RequiredCropMetadata {
  // Basic info
  name: string;
  type: CropType;
  size: CropSize;
  rarity: string;
  description: string;

  // Garden mechanics
  gardenBonus: Bonus;
  tilesRequired: number;

  // Growth info
  baseYield: number;
  growthTime: number;
  isReharvestable: boolean;
  reharvestCooldown?: number;
  reharvestLimit?: number;

  // Economic data
  cropValue: { base: number; star: number };
  seedValue: { base: number; star: number };
  preserveValue?: { base: number; star: number };

  // Processing info
  conversionRatios: {
    cropsPerSeed: number;
    seedsPerConversion: number;
    cropsPerPreserve: number;
  };

  processingTimes: {
    seedProcessMinutes: number;
    preserveProcessMinutes: number;
  };

  // Visual assets
  images: {
    crop: string;
    seed: string;
    preserve?: string;
  };

  // UI metadata
  tooltip: string;
  backgroundColor: string;
}
```

### 2. Enhanced Grid System

```typescript
// Current simplified tile
interface CurrentTile {
  row: number;
  col: number;
  cropType: string | null;
  needsWater: boolean;
}

// Required comprehensive tile
interface RequiredTile {
  // Position
  row: number;
  col: number;

  // Content
  crop: Crop | null;
  fertilizer: Fertilizer | null;

  // State
  needsWater: boolean;
  isActive: boolean;

  // Multi-tile crop support
  cropId?: string; // For bushes/trees
  isMainTile?: boolean; // Primary tile of multi-tile crop

  // Bonus system
  bonusesReceived: Bonus[]; // Bonuses from adjacent crops
  bonusesApplied: Bonus[]; // Final bonuses after calculation
}
```

## Implementation Priority Matrix

### 🔴 **CRITICAL (Fix Immediately)**

1. **Save Code Compatibility**: Implement v0.1-v0.3 → v0.4 conversion
2. **Crop Name Bug**: Fix "Batterfly Bean" → "Batterfly Beans"
3. **Crop Data Corrections**: Fix incorrect values in crops.json
4. **Basic Bonus System**: Implement crop bonus detection

### 🟡 **HIGH PRIORITY (Next Sprint)**

1. **Enhanced Crop Database**: Add missing economic data
2. **Fertilizer System**: Basic fertilizer parsing and storage
3. **Multi-tile Crop Support**: Proper bush/tree handling
4. **Grid Validation**: Prevent invalid layouts

### 🟢 **MEDIUM PRIORITY (Future Releases)**

1. **Harvest Simulation**: Economic calculation engine
2. **Processing Optimization**: Preserve jar calculations
3. **Advanced Bonus Logic**: Full adjacency system
4. **Settings Management**: Harvester/processor configuration

### 🔵 **LOW PRIORITY (Nice to Have)**

1. **Visual Enhancements**: Bonus indicators, animations
2. **Export Features**: Generate save codes from tracker
3. **Analytics**: Historical tracking, optimization suggestions
4. **Mobile Optimization**: Touch-friendly interactions

## Recommended Implementation Plan

### Phase 1: Critical Bug Fixes (Week 1)

```typescript
// 1. Fix save code compatibility
export function convertLegacySaveCode(saveCode: string): string {
  // Implement v0.1 → v0.2 → v0.3 → v0.4 conversion chain
}

// 2. Fix crop database
const CORRECTED_CROP_MAPPINGS = {
  Bt: "Batterfly Beans", // Fix plural
  // Add missing economic data
};

// 3. Add version detection
export function detectSaveCodeVersion(saveCode: string): string {
  const version = saveCode.split("_")[0].replace("v", "");
  return version;
}
```

### Phase 2: Enhanced Data Layer (Week 2)

```typescript
// 1. Comprehensive crop database
interface EnhancedCropDatabase {
  crops: Map<string, ComprehensiveCropData>;
  bonuses: Map<Bonus, BonusDefinition>;
  fertilizers: Map<string, FertilizerData>;
}

// 2. Multi-tile crop support
interface MultiTileCropManager {
  assignCropIds(tiles: Tile[][]): void;
  validateCropPlacement(crop: Crop, position: Position): boolean;
  calculateCropBounds(cropId: string): TileBounds;
}
```

### Phase 3: Bonus System (Week 3)

```typescript
// 1. Adjacency detection
interface BonusCalculationEngine {
  calculateAdjacentBonuses(tile: Tile, grid: Tile[][]): Bonus[];
  aggregateMultiTileBonuses(cropId: string, tiles: Tile[]): Bonus[];
  applyBonusThresholds(crop: Crop, bonuses: Bonus[]): Bonus[];
}

// 2. Visual bonus indicators
interface BonusVisualization {
  renderBonusOverlay(tile: Tile): React.ReactNode;
  calculateBonusIntensity(bonuses: Bonus[]): number;
  getBonusColor(bonus: Bonus): string;
}
```

### Phase 4: Economic Engine (Week 4)

```typescript
// 1. Harvest simulation
interface HarvestSimulator {
  simulateGrowthCycle(
    crops: TrackedCrop[],
    settings: HarvesterSettings
  ): HarvestResult[];

  calculateOptimalStrategy(
    garden: Garden,
    constraints: OptimizationConstraints
  ): OptimizationResult;
}

// 2. Processing optimization
interface ProcessingOptimizer {
  calculatePreserveJarNeeds(harvest: HarvestResult): ProcessingNeeds;
  optimizeCrafterAllocation(settings: ProcessorSettings): CrafterPlan;
}
```

## Testing Strategy

### 1. Save Code Compatibility Tests

```typescript
describe("Save Code Compatibility", () => {
  test("v0.1 codes convert correctly", () => {
    const v01Code = "v0.1_D-111-111-111_CROPS-ToToTo-PoPoPo-RiRiRi";
    const converted = convertLegacySaveCode(v01Code);
    expect(converted).toMatch(/^v0\.4_/);
  });

  test("all crop codes map correctly", () => {
    // Test each version's crop code mappings
  });
});
```

### 2. Bonus Calculation Tests

```typescript
describe("Bonus System", () => {
  test("single tile crops receive adjacent bonuses", () => {
    // Test basic adjacency
  });

  test("bush crops require 2+ bonus tiles", () => {
    // Test multi-tile bonus thresholds
  });

  test("tree crops require 3+ bonus tiles", () => {
    // Test apple tree bonus aggregation
  });
});
```

### 3. Economic Calculation Tests

```typescript
describe("Economic Engine", () => {
  test("harvest simulation matches expected yields", () => {
    // Compare with original planner results
  });

  test("processing optimization is accurate", () => {
    // Verify preserve jar calculations
  });
});
```

## Migration Path for Existing Users

### 1. Data Migration

```typescript
// Preserve existing user data during upgrades
interface DataMigrationPlan {
  backupCurrentData(): PersistedGardenData;
  migrateToEnhancedFormat(data: PersistedGardenData): EnhancedGardenData;
  validateMigration(original: any, migrated: any): boolean;
}
```

### 2. Feature Rollout

```typescript
// Gradual feature introduction with feature flags
interface FeatureFlags {
  enableBonusSystem: boolean;
  enableEconomicEngine: boolean;
  enableAdvancedGrid: boolean;
  enableProcessingOptimization: boolean;
}
```

## Conclusion

The current Garden Tracker has a solid foundation but lacks several critical features present in the original Garden Planner. The most urgent issues are:

1. **Save code compatibility bugs** that prevent proper import of older layouts
2. **Missing crop database information** that limits economic analysis
3. **Absence of bonus calculation system** that reduces strategic planning value
4. **Incomplete grid functionality** that doesn't support advanced features

Implementing the recommended fixes in the suggested phases will bring the Tracker to feature parity with the Planner while maintaining its focus on tracking and watering management.

The enhanced system will provide users with:

- ✅ **Reliable import/export** of all garden planner layouts
- ✅ **Accurate economic data** for optimization decisions
- ✅ **Visual bonus indicators** for strategic planning
- ✅ **Comprehensive crop information** for informed choices
- ✅ **Future-proof architecture** for additional features

This analysis provides the roadmap for evolving the Garden Tracker into a comprehensive tool that complements the Garden Planner while serving its unique tracking-focused use case.
