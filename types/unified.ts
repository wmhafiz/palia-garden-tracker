import { Plant } from './index';
import { WateringMode, CropGridLayout } from './watering-grid';

/**
 * Represents a tracked crop in the unified system
 * Combines manual selection and imported plants into a single structure
 */
export interface TrackedCrop {
    /** Unique crop type identifier */
    cropType: string;
    /** Source of this crop entry */
    source: 'manual' | 'import';
    /** Individual plant instances (for imported crops) */
    plantInstances: Plant[];
    /** Total count of this crop type */
    totalCount: number;
    /** Daily watering state (for bulk watering mode) */
    isWatered: boolean;
    /** When this crop was added to tracking */
    addedAt: Date;
    /** Last time this crop was watered (bulk mode) */
    lastWateredAt?: Date;
    /** Watering mode: 'bulk' for all-or-nothing, 'individual' for per-plant tracking */
    wateringMode: WateringMode;
    /** Grid layout for individual plant watering (only when wateringMode is 'individual') */
    gridLayout?: CropGridLayout;
}

/**
 * Daily watering state management
 */
export interface DailyWateringState {
    /** Last day when watering was reset (format: "Day X Cycle XX") */
    lastResetDay: string;
    /** Reset time in hours (6 for 6 AM) */
    resetTime: number;
}

/**
 * Persisted data structure for localStorage
 */
export interface PersistedGardenData {
    /** Version for migration compatibility */
    version: '2.0';
    /** All tracked crops */
    trackedCrops: TrackedCrop[];
    /** Daily watering state */
    dailyWateringState: DailyWateringState;
    /** Whether data was migrated from legacy system */
    migratedFromLegacy: boolean;
    /** Timestamp of last save */
    lastSaved: number;
    /** Original garden layout URL/save code (for grid preview) */
    originalLayoutUrl?: string;
    /** Parsed garden data from the original URL (for grid preview) */
    parsedGardenData?: import('../types/layout').ParsedGardenData;
}

/**
 * Legacy data structure for migration
 */
export interface LegacyData {
    /** Old tracked crops format */
    trackedCrops: string[];
    /** Old watering state format */
    cropWateringState?: {
        watered: { [cropName: string]: boolean };
        lastResetDay: string;
    };
}

/**
 * Migration result information
 */
export interface MigrationResult {
    /** Whether migration was successful */
    success: boolean;
    /** Number of crops migrated */
    migratedCount: number;
    /** Any errors encountered */
    errors: string[];
    /** Whether daily watering state was preserved */
    wateringStatePreserved: boolean;
}

/**
 * Store actions interface
 */
export interface UnifiedGardenStoreActions {
    /** Add a crop manually (from crop selection modal) */
    addCropManually: (cropType: string) => void;
    /** Remove a crop from tracking */
    removeCrop: (cropType: string) => void;
    /** Import plants from garden planner (groups by crop type) */
    importPlantsFromGarden: (plants: Plant[], originalUrl?: string, parsedData?: import('../types/layout').ParsedGardenData) => void;
    /** Toggle watering state for a specific crop type */
    toggleCropWatered: (cropType: string) => void;
    /** Mark all crops as watered */
    waterAllCrops: () => void;
    /** Mark all crops as not watered */
    waterNoneCrops: () => void;
    /** Reset daily watering (called at 6 AM) */
    resetDailyWatering: (currentDay: string) => void;
    /** Import data from legacy localStorage */
    importFromLegacyData: (legacyData: LegacyData) => MigrationResult;
    /** Clear all tracked crops */
    clearAllCrops: () => void;
    /** Get crop by type */
    getCropByType: (cropType: string) => TrackedCrop | undefined;
    /** Get all crops from a specific source */
    getCropsBySource: (source: 'manual' | 'import') => TrackedCrop[];
    /** Update plant instances for an imported crop */
    updatePlantInstances: (cropType: string, plants: Plant[]) => void;
    /** Save and load a layout with the current tracked crops */
    saveAndLoadLayout: (saveCode: string, name: string, options?: { notes?: string; tags?: string[] }) => Promise<{ success: boolean; error?: string }>;
    /** Load a layout by ID and update tracked crops */
    loadLayoutById: (layoutId: string) => Promise<{ success: boolean; error?: string }>;
    /** Set the original layout URL and parsed garden data for grid preview */
    setOriginalLayoutData: (url: string, parsedData: import('../types/layout').ParsedGardenData) => void;
    
    // Grid-specific watering actions
    /** Toggle individual plant watering by grid position */
    togglePlantWateredByPosition: (cropType: string, row: number, col: number) => void;
    /** Toggle individual plant watering by plant ID */
    togglePlantWateredById: (cropType: string, plantId: string) => void;
    /** Get grid data for watering interface */
    getWateringGridData: () => import('./watering-grid').CompleteWateringGridState;
    /** Water all plants in a specific crop's grid */
    waterAllPlantsInGrid: (cropType: string) => void;
    /** Water no plants in a specific crop's grid */
    waterNonePlantsInGrid: (cropType: string) => void;
    /** Switch between bulk and individual watering modes */
    setIndividualWateringMode: (cropType: string, enabled: boolean) => void;
    
    // Crop database actions
    /** Initialize crop database from JSON */
    initializeCropDatabase: () => Promise<void>;
    /** Get crop metadata by crop type */
    getCropMetadata: (cropType: string) => import('./watering-grid').CropMetadata | undefined;
    /** Get all crop metadata */
    getAllCropMetadata: () => import('./watering-grid').CropMetadata[];
}

/**
 * Complete unified garden store interface
 */
export interface UnifiedGardenStore extends UnifiedGardenStoreActions {
    /** All tracked crops (unique by type) */
    trackedCrops: TrackedCrop[];
    /** Daily watering state management */
    dailyWateringState: DailyWateringState;
    /** Crop database with metadata for all available crops */
    cropDatabase: import('./watering-grid').CropMetadata[];
    /** Whether the store has been initialized */
    isInitialized: boolean;
    /** Loading state for async operations */
    isLoading: boolean;
    /** Last error that occurred */
    lastError: string | null;
    /** Original garden layout URL/save code (for grid preview) */
    originalLayoutUrl?: string;
    /** Parsed garden data from the original URL (for grid preview) */
    parsedGardenData?: import('../types/layout').ParsedGardenData;
}

/**
 * Validation functions
 */
export const validateTrackedCrop = (crop: any): crop is TrackedCrop => {
    return (
        typeof crop === 'object' &&
        crop !== null &&
        typeof crop.cropType === 'string' &&
        ['manual', 'import'].includes(crop.source) &&
        Array.isArray(crop.plantInstances) &&
        typeof crop.totalCount === 'number' &&
        typeof crop.isWatered === 'boolean' &&
        crop.addedAt instanceof Date &&
        ['bulk', 'individual'].includes(crop.wateringMode) &&
        (crop.gridLayout === undefined || typeof crop.gridLayout === 'object')
    );
};

export const validatePersistedData = (data: any): data is PersistedGardenData => {
    return (
        typeof data === 'object' &&
        data !== null &&
        data.version === '2.0' &&
        Array.isArray(data.trackedCrops) &&
        data.trackedCrops.every(validateTrackedCrop) &&
        typeof data.dailyWateringState === 'object' &&
        typeof data.dailyWateringState.lastResetDay === 'string' &&
        typeof data.dailyWateringState.resetTime === 'number' &&
        typeof data.migratedFromLegacy === 'boolean' &&
        typeof data.lastSaved === 'number'
    );
};

/**
 * Helper functions for crop management
 */
export const createTrackedCrop = (
    cropType: string,
    source: 'manual' | 'import',
    plantInstances: Plant[] = []
): TrackedCrop => ({
    cropType,
    source,
    plantInstances,
    totalCount: source === 'manual' ? 1 : plantInstances.length,
    isWatered: false,
    addedAt: new Date(),
    wateringMode: 'bulk', // Default to bulk watering mode
    gridLayout: undefined, // No grid layout by default
});

export const groupPlantsByType = (plants: Plant[]): { [cropType: string]: Plant[] } => {
    return plants.reduce((groups, plant) => {
        if (!groups[plant.name]) {
            groups[plant.name] = [];
        }
        groups[plant.name].push(plant);
        return groups;
    }, {} as { [cropType: string]: Plant[] });
};

/**
 * Constants
 */
export const STORAGE_KEYS = {
    UNIFIED_GARDEN: 'paliaUnifiedGarden',
    LEGACY_TRACKED_CROPS: 'paliaTrackedCrops',
    LEGACY_WATERING_STATE: 'paliaWateringState',
    LEGACY_CYCLE_STATE: 'paliaCycleWateringState',
} as const;

export const DEFAULT_DAILY_WATERING_STATE: DailyWateringState = {
    lastResetDay: '',
    resetTime: 6, // 6 AM
};

export const CURRENT_VERSION = '2.0' as const;