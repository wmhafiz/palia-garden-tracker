import cropsData from '../../public/crops.json' assert { type: 'json' }
import type { ComprehensiveCropData } from '../../types/crop'

// Convert raw JSON (which may not yet include all fields) into ComprehensiveCropData with sensible defaults.
function normaliseCrop(raw: any): ComprehensiveCropData {
  // Basic safe defaults so the rest of the app does not crash while we are transitioning to full data
  return {
    // Required
    name: (raw.name ?? 'None') as ComprehensiveCropData['name'],
    gardenBonus: raw.garden_bonus || raw.gardenBonus || 'None',
    cropSize: raw.cropSize || 'Single',
    tilesRequired: raw.tilesRequired || 1,

    // Growth defaults
    baseYield: raw.baseYield || 1,
    growthTime: raw.growthTime || 0,
    isReharvestable: raw.isReharvestable || false,

    // Economic defaults
    values: raw.values || {
      crop: { base: raw.base_value ?? 0, star: raw.star_value ?? 0 },
      seed: { base: 0, star: 0 },
    },

    conversionRatios: raw.conversionRatios || {
      cropsPerSeed: 0,
      seedsPerConversion: 0,
      cropsPerPreserve: 0,
    },
    processingTimes: raw.processingTimes || {
      seedProcessMinutes: 0,
      preserveProcessMinutes: 0,
    },

    images: raw.images || {
      crop: raw.picture_url ?? '',
    },

    // Optional extras
    tooltip: raw.tooltip,
    backgroundColor: raw.backgroundColor,
    cropCode: raw.cropCode,
  }
}

const crops: ComprehensiveCropData[] = (cropsData as any[]).map(normaliseCrop)

export function listCrops(): ComprehensiveCropData[] {
  return crops
}

export function getCropByName(name: string): ComprehensiveCropData | undefined {
  return crops.find((c) => c.name.toLowerCase() === name.toLowerCase())
}

export function getCropByCode(code: string): ComprehensiveCropData | undefined {
  return crops.find((c) => c.cropCode?.toLowerCase() === code.toLowerCase())
} 