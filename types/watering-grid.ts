/**
 * Grid-based watering system types for individual plant tracking
 */

import { Plant } from './index';

/**
 * Crop metadata from the crops database
 */
export interface CropMetadata {
    /** Crop name */
    name: string;
    /** Crop group (Fruit, Vegetables, Crop) */
    group: string;
    /** Description */
    description: string;
    /** Rarity level */
    rarity: string;
    /** Garden buff provided */
    garden_buff: string;
    /** Harvest time information */
    harvest_time: string;
    /** Base value */
    base_value: number;
    /** Star quality value */
    star_value: number;
    /** Picture URL */
    picture_url: string;
}

/**
 * Individual plant with grid position and watering state
 */
export interface GridPlant extends Plant {
    /** Grid row position (0-based) */
    row: number;
    /** Grid column position (0-based) */
    col: number;
    /** Whether this individual plant has been watered today */
    isWatered: boolean;
    /** When this plant was last watered */
    lastWateredAt?: Date;
}

/**
 * Grid layout configuration for a crop type
 */
export interface CropGridLayout {
    /** Number of rows in the grid */
    rows: number;
    /** Number of columns in the grid */
    cols: number;
    /** Total plants in this grid */
    totalPlants: number;
    /** Grid plants with positions */
    plants: GridPlant[];
}

/**
 * Watering mode for a crop type
 */
export type WateringMode = 'bulk' | 'individual';

/**
 * Grid-specific watering data for the interface
 */
export interface WateringGridData {
    /** Crop type identifier */
    cropType: string;
    /** Current watering mode */
    wateringMode: WateringMode;
    /** Grid layout if in individual mode */
    gridLayout?: CropGridLayout;
    /** Bulk watering state if in bulk mode */
    bulkWatered: boolean;
    /** Number of individually watered plants */
    wateredCount: number;
    /** Total number of plants */
    totalCount: number;
    /** Percentage of plants watered (0-100) */
    wateringPercentage: number;
}

/**
 * Complete watering grid state for all crops
 */
export interface CompleteWateringGridState {
    /** Grid data for each tracked crop */
    crops: { [cropType: string]: WateringGridData };
    /** Global watering statistics */
    globalStats: {
        totalCrops: number;
        totalPlants: number;
        wateredPlants: number;
        wateringPercentage: number;
        allWatered: boolean;
        noneWatered: boolean;
    };
}

/**
 * Grid position utility type
 */
export interface GridPosition {
    row: number;
    col: number;
}

/**
 * Validation functions for grid types
 */
export const validateGridPlant = (plant: any): plant is GridPlant => {
    return (
        typeof plant === 'object' &&
        plant !== null &&
        typeof plant.id === 'string' &&
        typeof plant.name === 'string' &&
        typeof plant.needsWater === 'boolean' &&
        typeof plant.row === 'number' &&
        typeof plant.col === 'number' &&
        typeof plant.isWatered === 'boolean' &&
        plant.row >= 0 &&
        plant.col >= 0
    );
};

export const validateCropGridLayout = (layout: any): layout is CropGridLayout => {
    return (
        typeof layout === 'object' &&
        layout !== null &&
        typeof layout.rows === 'number' &&
        typeof layout.cols === 'number' &&
        typeof layout.totalPlants === 'number' &&
        Array.isArray(layout.plants) &&
        layout.plants.every(validateGridPlant) &&
        layout.rows > 0 &&
        layout.cols > 0 &&
        layout.totalPlants >= 0
    );
};

/**
 * Helper functions for grid operations
 */
export const createGridLayout = (plants: Plant[], maxCols: number = 6): CropGridLayout => {
    const totalPlants = plants.length;
    const cols = Math.min(maxCols, totalPlants);
    const rows = Math.ceil(totalPlants / cols);
    
    const gridPlants: GridPlant[] = plants.map((plant, index) => ({
        ...plant,
        row: Math.floor(index / cols),
        col: index % cols,
        isWatered: false,
        lastWateredAt: undefined
    }));

    return {
        rows,
        cols,
        totalPlants,
        plants: gridPlants
    };
};

export const findPlantByPosition = (layout: CropGridLayout, row: number, col: number): GridPlant | undefined => {
    return layout.plants.find(plant => plant.row === row && plant.col === col);
};

export const findPlantById = (layout: CropGridLayout, plantId: string): GridPlant | undefined => {
    return layout.plants.find(plant => plant.id === plantId);
};

export const calculateWateringStats = (layout: CropGridLayout): { wateredCount: number; wateringPercentage: number } => {
    const wateredCount = layout.plants.filter(plant => plant.isWatered).length;
    const wateringPercentage = layout.totalPlants > 0 ? Math.round((wateredCount / layout.totalPlants) * 100) : 0;
    
    return { wateredCount, wateringPercentage };
};