# Critical Bugs in Garden Tracker

## 🔴 CRITICAL BUG #1: Save Code Version Compatibility

### Issue

The tracker only supports v0.4 save codes, but the original planner supports v0.1 through v0.4 with automatic conversion.

### Impact

- Users cannot import older garden layouts
- Breaks compatibility with existing planner saves
- Limits adoption from planner users

### Root Cause

Missing version conversion logic in [`plannerService.ts`](../lib/services/plannerService.ts)

### Current Implementation

```typescript
// Only handles v0.4 format
const sections = saveCode.split("_");
const version = sections[0]; // No version checking!
```

### Required Fix

```typescript
// Add version detection and conversion chain
export function convertLegacySaveCode(saveCode: string): string {
  let currentCode = saveCode;
  let version = detectVersion(currentCode);

  // Convert through version chain: v0.1 → v0.2 → v0.3 → v0.4
  while (version !== "0.4") {
    switch (version) {
      case "0.1":
        currentCode = convertV01ToV02(currentCode);
        version = "0.2";
        break;
      case "0.2":
        currentCode = convertV02ToV03(currentCode);
        version = "0.3";
        break;
      case "0.3":
        currentCode = convertV03ToV04(currentCode);
        version = "0.4";
        break;
      default:
        throw new Error(`Unsupported version: ${version}`);
    }
  }

  return currentCode;
}
```

### Test Cases Needed

```typescript
// v0.1 format example
const v01Code = "v0.1_D-111-111-111_CROPS-ToToTo-PoPoPo-RiRiRi";

// v0.2 format example
const v02Code = "v0.2_D-111-111-111_CROPS-TTT-PPP-RRR";

// v0.3 format example
const v03Code = "v0.3_D-111-111-111_CR-TTT-PPP-RRR";

// Expected v0.4 output
const v04Code = "v0.4_D-111-111-111_CR-TTT-PPP-RRR";
```

---

## 🔴 CRITICAL BUG #2: Incorrect Crop Name Mapping

### Issue

Crop code 'Bt' maps to "Batterfly Bean" but should be "Batterfly Beans" (plural)

### Impact

- Import failures for layouts containing Batterfly Beans
- Inconsistent crop naming with original planner
- Potential data corruption

### Root Cause

Typo in [`plannerService.ts`](../lib/services/plannerService.ts) line 29

### Current Implementation

```typescript
const CROP_MAPPINGS: { [key: string]: string } = {
  // ...
  Bt: "Batterfly Bean", // ❌ WRONG - missing 's'
};
```

### Required Fix

```typescript
const CROP_MAPPINGS: { [key: string]: string } = {
  // ...
  Bt: "Batterfly Beans", // ✅ CORRECT - plural form
};
```

### Verification

Check against original planner: [`cropList.ts`](../../../palia-garden-planner/assets/scripts/garden-planner/cropList.ts) line 494

---

## 🔴 CRITICAL BUG #3: Incorrect Crop Data in Database

### Issue

Multiple crops have wrong values in [`crops.json`](../public/crops.json)

### Impact

- Incorrect economic calculations
- Wrong garden buff information
- Misleading user decisions

### Specific Errors Found

#### Corn Data Errors

```json
// Current (WRONG)
{
  "name": "Corn",
  "garden_buff": "Water Retain",  // ❌ Should be "Harvest Boost"
  "base_value": 41,               // ❌ Should be 40
  "star_value": 61,               // ❌ Should be 60
}

// Correct values from original
{
  "name": "Corn",
  "garden_buff": "Harvest Boost", // ✅ Correct
  "base_value": 40,               // ✅ Correct
  "star_value": 60,               // ✅ Correct
}
```

#### Missing Economic Data

All crops missing:

- `seedValue` (base/star)
- `preserveValue` (base/star)
- `processingTimes` (seed/preserve)
- `conversionRatios`
- `reharvestInfo`

### Required Fix

Update [`crops.json`](../public/crops.json) with complete data from original [`cropList.ts`](../../../palia-garden-planner/assets/scripts/garden-planner/cropList.ts)

---

## 🔴 CRITICAL BUG #4: Missing Bonus Calculation System

### Issue

The tracker has no bonus calculation logic, which is core to garden optimization

### Impact

- No strategic planning capability
- Missing core game mechanic
- Reduced value vs original planner

### Root Cause

Complete absence of bonus system implementation

### Required Implementation

```typescript
// Add to unified store
interface BonusCalculationEngine {
  calculateBonuses(): void;
  getBonusesForTile(row: number, col: number): Bonus[];
  getAdjacentBonuses(tile: Tile, grid: Tile[][]): Bonus[];
  aggregateMultiTileBonuses(cropId: string): Bonus[];
}
```

### Bonus Types Missing

```typescript
enum Bonus {
  None = "None",
  WaterRetain = "Water Retain",
  HarvestIncrease = "Harvest Increase",
  QualityIncrease = "Quality Increase",
  SpeedIncrease = "Speed Increase",
  WeedPrevention = "Weed Prevention",
}
```

---

## 🔴 CRITICAL BUG #5: Incomplete Grid Parsing

### Issue

Grid parsing doesn't handle fertilizers, multi-tile crops, or bonus calculations

### Impact

- Incomplete layout imports
- Missing fertilizer information
- No multi-tile crop support

### Root Cause

Simplified parsing in [`parseGridData()`](../lib/services/plannerService.ts)

### Missing Features

1. **Fertilizer Parsing**: No fertilizer code extraction
2. **Multi-tile IDs**: No crop ID assignment for bushes/trees
3. **Bonus Calculation**: No post-import bonus calculation
4. **Grid Validation**: No validation of illegal layouts

### Required Fix

```typescript
// Enhanced parsing with full feature support
export async function parseGridData(input: string): Promise<ParsedGardenData> {
  // ... existing code ...

  // Add fertilizer parsing
  if (fertiliserCode && FERTILIZER_MAPPINGS[fertiliserCode]) {
    tile.fertilizerType = FERTILIZER_MAPPINGS[fertiliserCode];
  }

  // Add multi-tile crop ID assignment
  if (cropSize && cropSize.size !== "single") {
    tile.cropId = generateCropId(cropType, plotRow, plotCol);
  }

  // Add post-import bonus calculation
  calculateGridBonuses(tiles);

  // Add grid validation
  validateGridLayout(tiles, activePlots);
}
```

---

## 🟡 HIGH PRIORITY BUG #6: Missing Fertilizer System

### Issue

No fertilizer support in tracker despite being core planner feature

### Impact

- Cannot import layouts with fertilizers
- Missing optimization opportunities
- Incomplete feature parity

### Required Implementation

```typescript
// Add fertilizer types
enum FertilizerType {
  None = "N",
  SpeedyGro = "S", // Speed boost
  QualityUp = "Q", // Quality increase
  WeedBlock = "W", // Weed prevention
  HarvestBoost = "H", // Harvest increase
  HydratePro = "Y", // Water retention
}

// Add to tile interface
interface EnhancedTile {
  // ... existing fields ...
  fertilizerType: FertilizerType | null;
}
```

---

## 🟡 HIGH PRIORITY BUG #7: No Save Code Generation

### Issue

Tracker can import but cannot export save codes

### Impact

- One-way compatibility only
- Cannot share tracker layouts
- Missing core functionality

### Required Implementation

```typescript
// Add save code generation
export function generateSaveCode(
  tiles: GridTile[][],
  activePlots: boolean[][],
  settings?: string
): string {
  // Implement reverse of parseGridData()
  // Generate v0.4 format save code
}
```

---

## Bug Fix Priority Order

### Immediate (This Week)

1. **Save Code Compatibility** - Blocks user adoption
2. **Crop Name Mapping** - Causes import failures
3. **Crop Data Corrections** - Affects all calculations

### Next Sprint (Week 2)

4. **Basic Bonus System** - Core missing feature
5. **Enhanced Grid Parsing** - Improves import accuracy
6. **Fertilizer Support** - Completes import compatibility

### Future Releases

7. **Save Code Generation** - Enables export functionality
8. **Advanced Bonus Logic** - Full feature parity
9. **Economic Engine** - Optimization features

## Testing Requirements

Each bug fix must include:

- ✅ Unit tests for the specific functionality
- ✅ Integration tests with real save codes
- ✅ Regression tests to prevent re-introduction
- ✅ Cross-validation with original planner results

## Success Criteria

Bug fixes are complete when:

- ✅ All original planner save codes import correctly
- ✅ Crop data matches original planner exactly
- ✅ Basic bonus calculations work for single-tile crops
- ✅ Grid parsing handles fertilizers and multi-tile crops
- ✅ No regression in existing functionality
