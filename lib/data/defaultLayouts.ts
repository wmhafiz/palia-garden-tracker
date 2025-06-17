import { SavedLayout } from '../../types/layout';

/**
 * Default saved layouts to be loaded when user has no saved layouts
 */
export const DEFAULT_LAYOUTS: SavedLayout[] = [
  {
    "metadata": {
      "id": "ccd42c23-4121-480f-8700-c7feeac59b6e",
      "name": "Simple",
      "description": "9×9 garden with 9 active plots, 9 plants (Tomato, Rice)",
      "createdAt": new Date("2025-06-17T13:13:14.898Z"),
      "lastModified": new Date("2025-06-17T13:13:14.898Z"),
      "plotCount": 9,
      "plantCount": 9,
      "dominantCrops": [
        "Tomato",
        "Rice",
        "Potato"
      ],
      "dimensions": {
        "rows": 9,
        "columns": 9
      },
      "tags": []
    },
    "saveCode": "v0.4_D-111-111-111_CR-TRTPWPTRT-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN",
    "gardenData": {
      "dimensions": {
        "rows": 9,
        "columns": 9
      },
      "tiles": [
        [
          { "row": 0, "col": 0, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 1, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 2, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 1, "col": 0, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 1, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 2, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 2, "col": 0, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 1, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 2, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 3, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 4, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 5, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 6, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 7, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 8, "col": 0, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 1, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 2, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 3, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 4, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 5, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 6, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 7, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 8, "cropType": null, "fertilizerType": null, "needsWater": false, "isActive": true }
        ]
      ],
      "activePlots": [
        [true, true, true],
        [true, true, true],
        [true, true, true]
      ],
      "cropSummary": {
        "totalPlants": 9,
        "plantsNeedingWater": 0,
        "cropBreakdown": {
          "Tomato": { "total": 4, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Rice": { "total": 2, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Potato": { "total": 2, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Wheat": { "total": 1, "needingWater": 0, "size": "single", "tilesPerPlant": 1 }
        },
        "wateringPercentage": 0
      },
      "saveCode": "v0.4_D-111-111-111_CR-TRTPWPTRT-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN",
      "version": "v0.4"
    },
    "isFavorite": false
  },
  {
    "metadata": {
      "id": "e4e2e64e-fdb7-416d-811b-63b3e102e390",
      "name": "9x9 For Beginners",
      "description": "9×9 garden with 9 active plots, 81 plants (Potato, Wheat)",
      "createdAt": new Date("2025-06-17T13:37:18.783Z"),
      "lastModified": new Date("2025-06-17T13:37:18.783Z"),
      "plotCount": 9,
      "plantCount": 81,
      "dominantCrops": ["Potato", "Wheat", "Tomato"],
      "dimensions": { "rows": 9, "columns": 9 },
      "tags": []
    },
    "saveCode": "v0.4_D-111-111-111_CR-COCoPTPWRC-PTWWRCOTP-CoPTOWRTCO-CoCPPOWWWCo-TPWRCOPTW-RCoPPCTTOCo-COWRTPWPR-CORCoWPWPT-PWRCoPTCOW",
    "gardenData": {
      "dimensions": { "rows": 9, "columns": 9 },
      "tiles": [
        [
          { "row": 0, "col": 0, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 1, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 2, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 3, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 4, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 5, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 6, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 7, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 0, "col": 8, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 1, "col": 0, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 1, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 2, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 3, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 4, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 5, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 6, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 7, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 1, "col": 8, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 2, "col": 0, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 1, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 2, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 3, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 4, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 5, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 6, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 7, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 2, "col": 8, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 3, "col": 0, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 1, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 2, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 3, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 4, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 5, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 6, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 7, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 3, "col": 8, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 4, "col": 0, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 1, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 2, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 3, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 4, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 5, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 6, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 7, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 4, "col": 8, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 5, "col": 0, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 1, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 2, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 3, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 4, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 5, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 6, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 7, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 5, "col": 8, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 6, "col": 0, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 1, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 2, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 3, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 4, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 5, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 6, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 7, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 6, "col": 8, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 7, "col": 0, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 1, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 2, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 3, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 4, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 5, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 6, "cropType": "Cotton", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 7, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 7, "col": 8, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true }
        ],
        [
          { "row": 8, "col": 0, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 1, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 2, "cropType": "Rice", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 3, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 4, "cropType": "Potato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 5, "cropType": "Tomato", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 6, "cropType": "Carrot", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 7, "cropType": "Onion", "fertilizerType": null, "needsWater": false, "isActive": true },
          { "row": 8, "col": 8, "cropType": "Wheat", "fertilizerType": null, "needsWater": false, "isActive": true }
        ]
      ],
      "activePlots": [
        [true, true, true],
        [true, true, true],
        [true, true, true]
      ],
      "cropSummary": {
        "totalPlants": 81,
        "plantsNeedingWater": 0,
        "cropBreakdown": {
          "Carrot": { "total": 10, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Onion": { "total": 10, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Cotton": { "total": 8, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Potato": { "total": 17, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Tomato": { "total": 12, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Wheat": { "total": 15, "needingWater": 0, "size": "single", "tilesPerPlant": 1 },
          "Rice": { "total": 9, "needingWater": 0, "size": "single", "tilesPerPlant": 1 }
        },
        "wateringPercentage": 0
      },
      "saveCode": "v0.4_D-111-111-111_CR-COCoPTPWRC-PTWWRCOTP-CoPTOWRTCO-CoCPPOWWWCo-TPWRCOPTW-RCoPPCTTOCo-COWRTPWPR-CORCoWPWPT-PWRCoPTCOW",
      "version": "v0.4"
    },
    "notes": "The 9x9 Early Game Layout is for players who have yet to unlock Apple and Blueberry at Gardening Level 10. This simple beginner layout needs 13 tomatoes, 17 potatoes, nine rice, 14 wheat, ten carrots, ten onions, and eight cotton.\n\nWith careful placement, the whole farm benefits from near-total water retention, 79 percent weed prevention, 81 percent harvest increase, and 35 percent quality boost. After initial watering, crops practically care for themselves. For an economic gain for this layout, remember the rhyme: swap tomatoes for extra potatoes to sell more Pickled Potatoes. You are free to modify the layout to suit your needs and style.",
    "isFavorite": false
  }
];