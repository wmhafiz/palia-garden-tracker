export enum Bonus {
  None = 'None',
  WaterRetain = 'Water Retain',
  HarvestIncrease = 'Harvest Boost',
  QualityIncrease = 'Quality Boost',
  SpeedIncrease = 'Speed Boost',
  WeedPrevention = 'Weed Block',
}

export enum CropSize {
  Single = 'Single',
  Bush = 'Bush',
  Tree = 'Tree',
}

export type CropType =
  | 'Tomato'
  | 'Potato'
  | 'Rice'
  | 'Wheat'
  | 'Carrot'
  | 'Onion'
  | 'Cotton'
  | 'Blueberry'
  | 'Apple'
  | 'Corn'
  | 'Spicy Pepper'
  | 'Napa Cabbage'
  | 'Bok Choy'
  | 'Rockhopper Pumpkin'
  | 'Batterfly Beans'
  | 'None';

// Basic economic number pair (base, star)
export interface ValuePair {
  base: number;
  star: number;
}

export interface ConversionRatios {
  cropsPerSeed: number;
  seedsPerConversion: number;
  cropsPerPreserve: number;
}

export interface ProcessingTimes {
  seedProcessMinutes: number;
  preserveProcessMinutes: number;
}

export interface ComprehensiveCropData {
  // Basic Information
  name: CropType;
  type?: string; // Category (Fruit, Vegetable, Crop) – optional for now
  group?: string;
  description?: string;
  rarity?: string;

  // Garden Mechanics
  gardenBonus: Bonus;
  cropSize: CropSize;
  tilesRequired: 1 | 4 | 9;

  // Growth Information
  baseYield: number;
  growthTime: number;
  isReharvestable: boolean;
  reharvestCooldown?: number;
  reharvestLimit?: number;

  // Economic Data
  values: {
    crop: ValuePair;
    seed: ValuePair;
    preserve?: ValuePair;
  };

  // Conversion Ratios & Processing
  conversionRatios: ConversionRatios;
  processingTimes: ProcessingTimes;

  // Visual Assets
  images: {
    crop: string;
    seed?: string;
    preserve?: string;
  };

  // UI Metadata / Misc
  tooltip?: string;
  backgroundColor?: string;
  cropCode?: string;
} 