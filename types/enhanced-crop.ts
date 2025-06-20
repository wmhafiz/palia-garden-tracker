/**
 * Enhanced Crop Data Types
 * Phase 1: Foundation Enhancement - Extended Crop Database
 */

import { ComprehensiveCropData } from './crop';
import { GrowthStage, FertilizerEffect } from './individual-plot';

export interface EnhancedCropData extends ComprehensiveCropData {
    // Scheduling Information
    wateringFrequency: number; // Palia hours between watering
    harvestWindow: number; // Palia hours before overripe

    // Multi-harvest specifics
    reharvestInterval?: number; // Palia hours between harvests

    // Fertilizer compatibility
    compatibleFertilizers: string[];

    // Growth stages for visual feedback
    growthStages: GrowthStage[];

    // Additional scheduling metadata
    canOverripe: boolean;
    requiresWater: boolean;
    maxConsecutiveHarvests?: number;
}

// Fertilizer database with effects
export interface FertilizerData {
    id: string;
    name: string;
    description: string;
    effects: FertilizerEffect;
    duration: number; // Palia hours the fertilizer lasts
    cost: number; // in gold
    imageUrl?: string;
}

// Default fertilizer effects mapping
export const FERTILIZER_EFFECTS: { [fertilizerType: string]: FertilizerEffect } = {
    'weed-block': {
        waterRetain: false,
        growthBoost: 0,
        harvestBoost: 0,
        qualityIncrease: 0,
        weedPrevention: true,
    },
    'speedy-gro': {
        waterRetain: false,
        growthBoost: 35, // 35% faster growth
        harvestBoost: 0,
        qualityIncrease: 0,
        weedPrevention: false,
    },
    'hydrate-pro': {
        waterRetain: true, // Eliminates watering requirement
        growthBoost: 0,
        harvestBoost: 0,
        qualityIncrease: 0,
        weedPrevention: false,
    },
    'harvest-boost': {
        waterRetain: false,
        growthBoost: 0,
        harvestBoost: 1, // +1 additional harvest
        qualityIncrease: 0,
        weedPrevention: false,
    },
    'quality-up': {
        waterRetain: false,
        growthBoost: 0,
        harvestBoost: 0,
        qualityIncrease: 1, // Guarantees star quality
        weedPrevention: false,
    },
};

// Default crop scheduling data (will be enhanced with actual game data)
export const DEFAULT_CROP_SCHEDULING: { [cropType: string]: Partial<EnhancedCropData> } = {
    'Tomato': {
        wateringFrequency: 24, // Every 24 Palia hours
        harvestWindow: 48, // 48 hours before overripe
        reharvestInterval: 24, // Reharvest every 24 hours
        canOverripe: true,
        requiresWater: true,
        maxConsecutiveHarvests: 4,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'harvest-boost', 'quality-up'],
    },
    'Potato': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Carrot': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Wheat': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Cotton': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Rice': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Corn': {
        wateringFrequency: 24,
        harvestWindow: 48,
        reharvestInterval: 24,
        canOverripe: true,
        requiresWater: true,
        maxConsecutiveHarvests: 3,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'harvest-boost', 'quality-up'],
    },
    'Onion': {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    },
    'Spicy Pepper': {
        wateringFrequency: 24,
        harvestWindow: 48,
        reharvestInterval: 24,
        canOverripe: true,
        requiresWater: true,
        maxConsecutiveHarvests: 4,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'harvest-boost', 'quality-up'],
    },
    'Apple': {
        wateringFrequency: 48, // Trees need less frequent watering
        harvestWindow: 72,
        reharvestInterval: 48,
        canOverripe: true,
        requiresWater: true,
        maxConsecutiveHarvests: 6,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'harvest-boost', 'quality-up'],
    },
    'Blueberry': {
        wateringFrequency: 48,
        harvestWindow: 72,
        reharvestInterval: 48,
        canOverripe: true,
        requiresWater: true,
        maxConsecutiveHarvests: 6,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'harvest-boost', 'quality-up'],
    },
};

// Helper function to get enhanced crop data
export const getEnhancedCropData = (
    baseCropData: ComprehensiveCropData,
    cropType: string
): EnhancedCropData => {
    const schedulingData = DEFAULT_CROP_SCHEDULING[cropType] || {
        wateringFrequency: 24,
        harvestWindow: 24,
        canOverripe: false,
        requiresWater: true,
        compatibleFertilizers: ['weed-block', 'speedy-gro', 'hydrate-pro', 'quality-up'],
    };

    return {
        ...baseCropData,
        wateringFrequency: schedulingData.wateringFrequency || 24,
        harvestWindow: schedulingData.harvestWindow || 24,
        reharvestInterval: schedulingData.reharvestInterval,
        compatibleFertilizers: schedulingData.compatibleFertilizers || [],
        growthStages: [], // Will be populated with actual growth stage data
        canOverripe: schedulingData.canOverripe || false,
        requiresWater: schedulingData.requiresWater !== false,
        maxConsecutiveHarvests: schedulingData.maxConsecutiveHarvests,
    };
}; 