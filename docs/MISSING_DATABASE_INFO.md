# Missing Database Information Analysis

## Overview

This document details the comprehensive crop database information missing from the current Garden Tracker compared to the original Garden Planner, along with compatibility issues between different save code versions.

## Current vs Required Crop Database Structure

### Current Simplified Structure

```typescript
// Current crops.json structure
interface CurrentCropData {
  name: string;
  group: string;
  description: string;
  rarity: string;
  garden_buff: string;
  harvest_time: string;
  base_value: number;
  star_value: number;
  picture_url: string;
}
```

### Required Comprehensive Structure

```typescript
// Required structure based on original planner
interface ComprehensiveCropData {
  // Basic Information
  name: string;
  type: CropType;
  group: string;
  description: string;
  rarity: string;

  // Garden Mechanics
  gardenBonus: Bonus; // What bonus this crop provides
  cropSize: CropSize; // Single, Bush, Tree
  tilesRequired: number; // 1, 4, or 9 tiles

  // Growth Information
  baseYield: number; // Base harvest amount
  growthTime: number; // Days to first harvest
  isReharvestable: boolean; // Can harvest multiple times
  reharvestCooldown?: number; // Days between reharvests
  reharvestLimit?: number; // Maximum reharvests

  // Economic Data
  values: {
    crop: { base: number; star: number };
    seed: { base: number; star: number };
    preserve?: { base: number; star: number };
  };

  // Conversion Information
  conversionRatios: {
    cropsPerSeed: number; // Crops needed to make 1 seed
    seedsPerConversion: number; // Seeds produced per conversion
    cropsPerPreserve: number; // Crops needed for 1 preserve
  };

  // Processing Times
  processingTimes: {
    seedProcessMinutes: number; // Time to process seeds
    preserveProcessMinutes: number; // Time to process preserves
  };

  // Visual Assets
  images: {
    crop: string;
    seed: string;
    preserve?: string;
  };

  // UI Metadata
  tooltip: string;
  backgroundColor: string;
  cropCode: CropCode;
}
```

## Missing Economic Data by Crop

### 1. Tomato

```json
// Current (incomplete)
{
  "name": "Tomato",
  "base_value": 23,
  "star_value": 34
}

// Missing data
{
  "seedValue": { "base": 40, "star": 60 },
  "preserveValue": { "base": 34, "star": 51 },
  "conversionRatios": {
    "cropsPerSeed": 3,
    "seedsPerConversion": 2,
    "cropsPerPreserve": 1
  },
  "processingTimes": {
    "seedProcessMinutes": 30,
    "preserveProcessMinutes": 27
  },
  "reharvestInfo": {
    "isReharvestable": true,
    "reharvestCooldown": 2,
    "reharvestLimit": 3
  }
}
```

### 2. Apple (Tree Crop)

```json
// Current (incomplete)
{
  "name": "Apple",
  "base_value": 64,
  "star_value": 96
}

// Missing critical tree data
{
  "cropSize": "Tree",
  "tilesRequired": 9,
  "seedValue": { "base": 700, "star": 1050 },
  "preserveValue": { "base": 96, "star": 144 },
  "conversionRatios": {
    "cropsPerSeed": 10,
    "seedsPerConversion": 1,
    "cropsPerPreserve": 1
  },
  "processingTimes": {
    "seedProcessMinutes": 142,
    "preserveProcessMinutes": 76
  },
  "reharvestInfo": {
    "isReharvestable": true,
    "reharvestCooldown": 6,
    "reharvestLimit": 3
  },
  "bonusRequirement": {
    "threshold": 3,
    "description": "3x3, needs 3 of a bonus for the buff to activate"
  }
}
```

### 3. Blueberry (Bush Crop)

```json
// Current (incomplete)
{
  "name": "Blueberry",
  "base_value": 39,
  "star_value": 58
}

// Missing critical bush data
{
  "cropSize": "Bush",
  "tilesRequired": 4,
  "baseYield": 6,
  "seedValue": { "base": 112, "star": 168 },
  "preserveValue": { "base": 59, "star": 88 },
  "conversionRatios": {
    "cropsPerSeed": 4,
    "seedsPerConversion": 2,
    "cropsPerPreserve": 1
  },
  "processingTimes": {
    "seedProcessMinutes": 81,
    "preserveProcessMinutes": 47.25
  },
  "reharvestInfo": {
    "isReharvestable": true,
    "reharvestCooldown": 3,
    "reharvestLimit": 3
  },
  "bonusRequirement": {
    "threshold": 2,
    "description": "2x2, needs 2 of a bonus for the buff to activate"
  }
}
```

## Complete Missing Data Matrix

| Crop               | Seed Value | Preserve Value | Processing Times | Conversion Ratios | Reharvest Info |
| ------------------ | ---------- | -------------- | ---------------- | ----------------- | -------------- |
| Tomato             | 40/60      | 34/51          | 30min/27min      | 3:2:1             | ✅ 2d×3        |
| Potato             | 20/30      | 68/102         | 84min/54min      | 1:4:1             | ❌             |
| Rice               | 11/16      | ❌             | 42min/❌         | 1:4:0             | ✅ ∞           |
| Wheat              | 12/18      | ❌             | 42min/❌         | 1:4:0             | ❌             |
| Carrot             | 7/10       | 34/51          | 18min/27min      | 1:4:1             | ❌             |
| Onion              | 10/15      | 45/67          | 24min/36min      | 1:4:1             | ❌             |
| Cotton             | 20/30      | ❌             | 36min/❌         | 1:3:0             | ❌             |
| Blueberry          | 112/168    | 59/88          | 81min/47min      | 4:2:1             | ✅ 3d×3        |
| Apple              | 700/1050   | 96/144         | 142min/76min     | 10:1:1            | ✅ 6d×3        |
| Corn               | 15/22      | 60/90          | 48min/48min      | 1:4:1             | ❌             |
| Spicy Pepper       | 85/127     | 48/72          | 100min/38min     | 4:2:1             | ✅ 3d×3        |
| Napa Cabbage       | 10/15      | 60/90          | 48min/48min      | 1:6:1             | ❌             |
| Bok Choy           | 15/22      | 45/67          | 72min/36min      | 1:4:1             | ❌             |
| Rockhopper Pumpkin | 25/37      | 101/151        | 100min/31min     | 1:4:1             | ✅ 2d×3        |
| Batterfly Beans    | 90/135     | 41/61          | 120min/33min     | 1:1:1             | ✅ 2d×3        |

**Legend:**

- ✅ = Reharvestable
- ❌ = Single harvest
- ∞ = Infinite reharvests
- Format: `cooldown`d×`limit`

## Save Code Version Compatibility Issues

### Version Evolution Timeline

#### v0.1 (Original)

```
Format: v0.1_D-{plots}_CROPS-{crops}
Crop Codes: To, Po, Ri, Wh, Ca, On, Co, Bl, Ap, Co (Corn conflicts with Cotton!)
Fertilizers: Not supported
```

#### v0.2 (Fertilizer Introduction)

```
Format: v0.2_D-{plots}_CROPS-{crops}
Crop Codes: T, P, R, W, C, O, Co, B, A, Cr, Sp, Cb, Bk
Fertilizers: N, S, Q, W, H, Hp
```

#### v0.3 (Format Standardization)

```
Format: v0.3_D-{plots}_CR-{crops}_{settings}
Crop Codes: T, P, R, W, C, O, Co, B, A, Cr, S, Cb, Bk, Pm, Bb
Fertilizers: N, S, Q, W, H, Y
```

#### v0.4 (Current)

```
Format: v0.4_D-{plots}_CR-{crops}_{settings}
Crop Codes: T, P, R, W, C, O, Co, B, A, Cr, S, Cb, Bk, Pm, Bt
Fertilizers: N, S, Q, W, H, Y
```

### Critical Compatibility Issues

#### 1. v0.1 Crop Code Conflicts

```typescript
// v0.1 had conflicting codes
const v01Conflicts = {
  Co: ["Cotton", "Corn"], // Same code for different crops!
};

// Resolution: Context-based detection needed
function resolveV01CropConflict(code: string, position: number): string {
  // Logic to determine if 'Co' means Cotton or Corn based on context
}
```

#### 2. Fertilizer Code Evolution

```typescript
// Fertilizer codes changed between versions
const fertilizerEvolution = {
  v02: { Hp: "HydratePro" }, // v0.2 used 'Hp'
  v03: { Y: "HydratePro" }, // v0.3+ uses 'Y'
};
```

#### 3. Settings Format Changes

```typescript
// Settings encoding completely changed in v0.4
const settingsEvolution = {
  v03: "D7L0Gb", // Simple format
  v04: "D7L0GbCr0.T~P2-S.H3", // Complex crop-specific settings
};
```

## Required Database Enhancements

### 1. Complete Crop Database

```typescript
// Enhanced crops.json structure
interface EnhancedCropsDatabase {
  version: string;
  lastUpdated: string;
  crops: ComprehensiveCropData[];
  bonuses: BonusDefinition[];
  fertilizers: FertilizerDefinition[];
  cropSizes: CropSizeDefinition[];
}
```

### 2. Bonus System Database

```typescript
interface BonusDefinition {
  type: Bonus;
  name: string;
  description: string;
  color: string;
  icon: string;
  adjacencyRules: {
    singleTile: boolean; // Applies to single-tile crops
    bushThreshold: number; // Minimum for bush crops
    treeThreshold: number; // Minimum for tree crops
  };
}
```

### 3. Fertilizer Database

```typescript
interface FertilizerDefinition {
  code: FertilizerCode;
  name: string;
  description: string;
  bonus: Bonus;
  cost: number;
  duration: number;
  icon: string;
}
```

### 4. Processing Database

```typescript
interface ProcessingDefinition {
  type: "seed" | "preserve";
  name: string;
  description: string;
  baseTime: number; // Base processing time
  crafterMultiplier: number; // Time reduction per crafter
  maxCrafters: number; // Maximum crafters
}
```

## Implementation Priority

### Phase 1: Critical Data (Week 1)

1. **Fix incorrect crop values** (Corn, etc.)
2. **Add missing seed/preserve values** for all crops
3. **Add crop size information** (Single/Bush/Tree)
4. **Add basic conversion ratios**

### Phase 2: Economic Data (Week 2)

1. **Add processing times** for all crops
2. **Add reharvest information** for applicable crops
3. **Add bonus requirements** for multi-tile crops
4. **Create fertilizer database**

### Phase 3: Advanced Features (Week 3)

1. **Implement bonus calculation system**
2. **Add processing optimization data**
3. **Create settings database**
4. **Add visual enhancement data**

## Data Validation Requirements

### 1. Cross-Reference Validation

```typescript
// Validate against original planner data
interface DataValidation {
  validateCropValues(crop: CropData): ValidationResult;
  validateConversionRatios(crop: CropData): ValidationResult;
  validateProcessingTimes(crop: CropData): ValidationResult;
  validateBonusSystem(bonus: BonusData): ValidationResult;
}
```

### 2. Economic Consistency

```typescript
// Ensure economic calculations are consistent
interface EconomicValidation {
  validateProfitability(crop: CropData): boolean;
  validateProcessingEfficiency(crop: CropData): boolean;
  validateMarketBalance(crops: CropData[]): boolean;
}
```

### 3. Game Balance Verification

```typescript
// Verify game balance is maintained
interface BalanceValidation {
  validateCropTiers(crops: CropData[]): boolean;
  validateBonusBalance(bonuses: BonusData[]): boolean;
  validateProgressionCurve(crops: CropData[]): boolean;
}
```

## Migration Strategy

### 1. Backward Compatibility

```typescript
// Maintain compatibility with existing data
interface MigrationPlan {
  backupExistingData(): void;
  migrateToEnhancedFormat(): void;
  validateMigration(): boolean;
  rollbackIfNeeded(): void;
}
```

### 2. Gradual Enhancement

```typescript
// Introduce features gradually
interface FeatureRollout {
  enableBasicEconomics: boolean;
  enableBonusSystem: boolean;
  enableProcessingOptimization: boolean;
  enableAdvancedCalculations: boolean;
}
```

## Success Metrics

The database enhancement is complete when:

- ✅ All crop data matches original planner exactly
- ✅ Economic calculations produce identical results
- ✅ Bonus system works for all crop types
- ✅ Processing optimization is accurate
- ✅ Save code compatibility is 100%
- ✅ No performance regression
- ✅ All existing functionality preserved

## Testing Requirements

### 1. Data Accuracy Tests

- Compare every crop value with original planner
- Validate economic calculations
- Test bonus calculations for all scenarios

### 2. Compatibility Tests

- Test all save code versions (v0.1-v0.4)
- Verify fertilizer parsing
- Test multi-tile crop handling

### 3. Performance Tests

- Ensure database queries remain fast
- Test with large garden layouts
- Verify memory usage is acceptable

This comprehensive database enhancement will bring the Garden Tracker to full feature parity with the original Garden Planner while maintaining its focus on tracking and watering management.
