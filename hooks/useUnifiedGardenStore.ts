import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
    UnifiedGardenStore,
    TrackedCrop,
    PersistedGardenData,
    LegacyData,
    MigrationResult,
    DailyWateringState,
    createTrackedCrop,
    groupPlantsByType,
    validatePersistedData,
    STORAGE_KEYS,
    DEFAULT_DAILY_WATERING_STATE,
    CURRENT_VERSION
} from '../types/unified';
import { Plant } from '../types';
import { MigrationService } from '../lib/services/migrationService';
import { layoutService } from '../lib/services/layoutService';
import {
    CropMetadata,
    CompleteWateringGridState,
    WateringGridData,
} from '../types/watering-grid';
import { IndividualPlotMigrationService } from '../lib/services/individualPlotMigrationService';
import {
    IndividualPlot,
    IndividualGardenState,
    generatePlotId,
    createEmptyPlot,
    AppliedFertilizer
} from '../types/individual-plot';
import { FERTILIZER_EFFECTS } from '../types/enhanced-crop';

/**
 * Persistence utilities for the unified store
 */
const persistenceUtils = {
    /**
     * Load persisted data from localStorage
     */
    loadPersistedData: (): PersistedGardenData | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.UNIFIED_GARDEN);
            if (!stored) return null;

            const parsed = JSON.parse(stored);

            // Convert date strings back to Date objects
            if (parsed.trackedCrops) {
                parsed.trackedCrops = parsed.trackedCrops.map((crop: any) => ({
                    ...crop,
                    addedAt: new Date(crop.addedAt),
                    lastWateredAt: crop.lastWateredAt ? new Date(crop.lastWateredAt) : undefined
                }));
            }

            if (validatePersistedData(parsed)) {
                return parsed;
            } else {
                console.warn('Invalid persisted data format, starting fresh');
                return null;
            }
        } catch (error) {
            console.error('Error loading persisted data:', error);
            return null;
        }
    },

    /**
     * Save data to localStorage
     */
    savePersistedData: (data: Omit<PersistedGardenData, 'lastSaved'>): void => {
        try {
            const toSave: PersistedGardenData = {
                ...data,
                lastSaved: Date.now()
            };

            localStorage.setItem(STORAGE_KEYS.UNIFIED_GARDEN, JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving persisted data:', error);
        }
    },

    /**
     * Create initial persisted data structure
     */
    createInitialData: (migratedFromLegacy = false): PersistedGardenData => ({
        version: CURRENT_VERSION,
        trackedCrops: [],
        dailyWateringState: { ...DEFAULT_DAILY_WATERING_STATE },
        migratedFromLegacy,
        lastSaved: Date.now()
    })
};

/**
 * Create the unified garden store
 */
export const useUnifiedGardenStore = create<UnifiedGardenStore>()(
    subscribeWithSelector((set, get) => {
        // Memoization cache for getWateringGridData to prevent infinite loops
        let cachedWateringGridData: CompleteWateringGridState | null = null;
        let lastTrackedCropsHash: string | null = null;

        const computeTrackedCropsHash = (crops: any[]): string => {
            return JSON.stringify(crops.map(crop => ({
                cropType: crop.cropType,
                wateringMode: crop.wateringMode,
                isWatered: crop.isWatered,
                totalCount: crop.totalCount,
                gridLayoutHash: crop.gridLayout ?
                    crop.gridLayout.plants.map((p: any) => `${p.id}:${p.isWatered}`).join(',') :
                    null
            })));
        };

        return {
            // State
            trackedCrops: [],
            dailyWateringState: { ...DEFAULT_DAILY_WATERING_STATE },
            cropDatabase: [],
            isInitialized: false,
            isLoading: false,
            lastError: null,
            originalLayoutUrl: undefined,
            parsedGardenData: undefined,
            individualGardenState: undefined,
            individualPlotsEnabled: false,

            // Actions
            addCropManually: (cropType: string) => {
                set((state) => {
                    // Check if crop already exists
                    const existingCrop = state.trackedCrops.find(crop => crop.cropType === cropType);
                    if (existingCrop) {
                        return { lastError: `${cropType} is already being tracked` };
                    }

                    const newCrop = createTrackedCrop(cropType, 'manual');
                    const updatedCrops = [...state.trackedCrops, newCrop];

                    // CRITICAL FIX: Invalidate cache when crops change
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            removeCrop: (cropType: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.filter(crop => crop.cropType !== cropType);

                    // CRITICAL FIX: Invalidate cache when crops change
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            importPlantsFromGarden: (plants: Plant[], originalUrl?: string, parsedData?: import('../types/layout').ParsedGardenData) => {
                set((state) => {
                    // Group plants by crop type
                    const plantGroups = groupPlantsByType(plants);
                    const updatedCrops = [...state.trackedCrops];

                    // Process each crop type
                    for (const [cropType, plantInstances] of Object.entries(plantGroups)) {
                        const existingCropIndex = updatedCrops.findIndex(crop => crop.cropType === cropType);

                        if (existingCropIndex >= 0) {
                            // Update existing crop with new plant instances
                            updatedCrops[existingCropIndex] = {
                                ...updatedCrops[existingCropIndex],
                                source: 'import', // Change source to import
                                plantInstances,
                                totalCount: plantInstances.length,
                                addedAt: new Date() // Update timestamp
                            };
                        } else {
                            // Create new tracked crop
                            const newCrop = createTrackedCrop(cropType, 'import', plantInstances);
                            updatedCrops.push(newCrop);
                        }
                    }

                    // CRITICAL FIX: Invalidate cache when crops change
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes with original layout data if provided
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: originalUrl || state.originalLayoutUrl,
                        parsedGardenData: parsedData || state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        originalLayoutUrl: originalUrl || state.originalLayoutUrl,
                        parsedGardenData: parsedData || state.parsedGardenData,
                        lastError: null
                    };
                });
            },

            toggleCropWatered: (cropType: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType) {
                            const newWateredState = !crop.isWatered;
                            return {
                                ...crop,
                                isWatered: newWateredState,
                                lastWateredAt: newWateredState ? new Date() : crop.lastWateredAt
                            };
                        }
                        return crop;
                    });

                    // CRITICAL FIX: Invalidate cache when watering state changes
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            waterAllCrops: () => {
                set((state) => {
                    const now = new Date();
                    const updatedCrops = state.trackedCrops.map(crop => ({
                        ...crop,
                        isWatered: true,
                        lastWateredAt: now
                    }));

                    // CRITICAL FIX: Invalidate cache when watering state changes
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            waterNoneCrops: () => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => ({
                        ...crop,
                        isWatered: false
                    }));

                    // CRITICAL FIX: Invalidate cache when watering state changes
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            resetDailyWatering: (currentDay: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => ({
                        ...crop,
                        isWatered: false
                    }));

                    const updatedWateringState: DailyWateringState = {
                        ...state.dailyWateringState,
                        lastResetDay: currentDay
                    };

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: updatedWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        dailyWateringState: updatedWateringState,
                        lastError: null
                    };
                });
            },

            importFromLegacyData: (legacyData: LegacyData): MigrationResult => {
                const result = MigrationService.migrateLegacyData(legacyData);

                if (result.success) {
                    set((state) => {
                        const migratedCrops: TrackedCrop[] = [];

                        // Create tracked crops from legacy data
                        for (const cropType of legacyData.trackedCrops) {
                            const trackedCrop = createTrackedCrop(cropType, 'manual');

                            // Preserve watering state if available
                            if (legacyData.cropWateringState?.watered[cropType] !== undefined) {
                                trackedCrop.isWatered = legacyData.cropWateringState.watered[cropType];
                                if (trackedCrop.isWatered) {
                                    trackedCrop.lastWateredAt = new Date();
                                }
                            }

                            migratedCrops.push(trackedCrop);
                        }

                        const updatedWateringState: DailyWateringState = {
                            lastResetDay: legacyData.cropWateringState?.lastResetDay || '',
                            resetTime: 6
                        };

                        // Persist migrated data
                        persistenceUtils.savePersistedData({
                            version: CURRENT_VERSION,
                            trackedCrops: migratedCrops,
                            dailyWateringState: updatedWateringState,
                            migratedFromLegacy: true
                        });

                        return {
                            trackedCrops: migratedCrops,
                            dailyWateringState: updatedWateringState,
                            lastError: null
                        };
                    });
                }

                return result;
            },

            clearAllCrops: () => {
                set((state) => {
                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: [],
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: [],
                        lastError: null
                    };
                });
            },

            getCropByType: (cropType: string) => {
                return get().trackedCrops.find(crop => crop.cropType === cropType);
            },

            getCropsBySource: (source: 'manual' | 'import') => {
                return get().trackedCrops.filter(crop => crop.source === source);
            },

            updatePlantInstances: (cropType: string, plants: Plant[]) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType && crop.source === 'import') {
                            return {
                                ...crop,
                                plantInstances: plants,
                                totalCount: plants.length
                            };
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            saveAndLoadLayout: async (saveCode: string, name: string, options: { notes?: string; tags?: string[] } = {}) => {
                try {
                    set((state) => ({ ...state, isLoading: true, lastError: null }));

                    // Parse the garden data from the save code to store it
                    const { parseGridData } = await import('../lib/services/plannerService');
                    const parsedGardenData = await parseGridData(saveCode);

                    // Save the layout using the layout service
                    const saveResult = await layoutService.saveLayout(saveCode, name, {
                        notes: options.notes,
                        tags: options.tags,
                        isFavorite: false
                    });

                    if (!saveResult.success) {
                        set((state) => ({
                            ...state,
                            isLoading: false,
                            lastError: saveResult.error?.message || 'Failed to save layout'
                        }));
                        return { success: false, error: saveResult.error?.message || 'Failed to save layout' };
                    }

                    // Import the plants from the saved layout
                    const savedLayout = saveResult.data!;
                    const plants: Plant[] = [];

                    // Convert garden data to plants
                    for (const [cropType, summary] of Object.entries(savedLayout.gardenData.cropSummary.cropBreakdown)) {
                        for (let i = 0; i < summary.total; i++) {
                            plants.push({
                                id: `${cropType}-${i}`,
                                name: cropType,
                                needsWater: false
                            });
                        }
                    }

                    // Update tracked crops using existing importPlantsFromGarden logic
                    const plantGroups = groupPlantsByType(plants);
                    const updatedCrops = [...get().trackedCrops];

                    // Process each crop type
                    for (const [cropType, plantInstances] of Object.entries(plantGroups)) {
                        const existingCropIndex = updatedCrops.findIndex(crop => crop.cropType === cropType);

                        if (existingCropIndex >= 0) {
                            // Update existing crop with new plant instances
                            updatedCrops[existingCropIndex] = {
                                ...updatedCrops[existingCropIndex],
                                source: 'import',
                                plantInstances,
                                totalCount: plantInstances.length,
                                addedAt: new Date()
                            };
                        } else {
                            // Create new tracked crop
                            const newCrop = createTrackedCrop(cropType, 'import', plantInstances);
                            updatedCrops.push(newCrop);
                        }
                    }

                    // Persist changes with original layout data
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: get().dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: saveCode,
                        parsedGardenData: parsedGardenData
                    });

                    set((state) => ({
                        ...state,
                        trackedCrops: updatedCrops,
                        originalLayoutUrl: saveCode,
                        parsedGardenData: parsedGardenData,
                        isLoading: false,
                        lastError: null
                    }));

                    return { success: true };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to save and load layout';
                    set((state) => ({
                        ...state,
                        isLoading: false,
                        lastError: errorMessage
                    }));
                    return { success: false, error: errorMessage };
                }
            },

            loadLayoutById: async (layoutId: string) => {
                try {
                    set((state) => ({ ...state, isLoading: true, lastError: null }));

                    // Load the layout using the layout service
                    const loadResult = layoutService.loadLayout(layoutId);

                    if (!loadResult.success) {
                        set((state) => ({
                            ...state,
                            isLoading: false,
                            lastError: loadResult.error?.message || 'Failed to load layout'
                        }));
                        return { success: false, error: loadResult.error?.message || 'Failed to load layout' };
                    }

                    // Import the plants from the loaded layout
                    const savedLayout = loadResult.data!;
                    const plants: Plant[] = [];

                    // Convert garden data to plants
                    for (const [cropType, summary] of Object.entries(savedLayout.gardenData.cropSummary.cropBreakdown)) {
                        for (let i = 0; i < summary.total; i++) {
                            plants.push({
                                id: `${cropType}-${i}`,
                                name: cropType,
                                needsWater: false
                            });
                        }
                    }

                    // Update tracked crops using existing importPlantsFromGarden logic
                    const plantGroups = groupPlantsByType(plants);
                    const updatedCrops = [...get().trackedCrops];

                    // Process each crop type
                    for (const [cropType, plantInstances] of Object.entries(plantGroups)) {
                        const existingCropIndex = updatedCrops.findIndex(crop => crop.cropType === cropType);

                        if (existingCropIndex >= 0) {
                            // Update existing crop with new plant instances
                            updatedCrops[existingCropIndex] = {
                                ...updatedCrops[existingCropIndex],
                                source: 'import',
                                plantInstances,
                                totalCount: plantInstances.length,
                                addedAt: new Date()
                            };
                        } else {
                            // Create new tracked crop
                            const newCrop = createTrackedCrop(cropType, 'import', plantInstances);
                            updatedCrops.push(newCrop);
                        }
                    }

                    // Persist changes with original layout data
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: get().dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: savedLayout.gardenData.saveCode || '',
                        parsedGardenData: savedLayout.gardenData
                    });

                    set((state) => ({
                        ...state,
                        trackedCrops: updatedCrops,
                        originalLayoutUrl: savedLayout.gardenData.saveCode || '',
                        parsedGardenData: savedLayout.gardenData,
                        isLoading: false,
                        lastError: null
                    }));

                    return { success: true };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load layout';
                    set((state) => ({
                        ...state,
                        isLoading: false,
                        lastError: errorMessage
                    }));
                    return { success: false, error: errorMessage };
                }
            },

            // Simplified watering action - clicking any crop toggles the entire crop type
            toggleCropWateredFromGrid: (cropType: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType) {
                            const newWateredState = !crop.isWatered;
                            return {
                                ...crop,
                                isWatered: newWateredState,
                                lastWateredAt: newWateredState ? new Date() : crop.lastWateredAt
                            };
                        }
                        return crop;
                    });

                    // CRITICAL FIX: Invalidate cache when watering state changes
                    cachedWateringGridData = null;
                    lastTrackedCropsHash = null;

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            getWateringGridData: (): CompleteWateringGridState => {
                const state = get();

                // CRITICAL FIX: Implement memoization to prevent infinite loops
                const currentHash = computeTrackedCropsHash(state.trackedCrops);

                if (cachedWateringGridData && lastTrackedCropsHash === currentHash) {
                    // Return cached result if nothing changed
                    return cachedWateringGridData;
                }

                // Recompute only when state actually changed

                const crops: { [cropType: string]: WateringGridData } = {};
                let totalPlants = 0;
                let wateredPlants = 0;

                for (const crop of state.trackedCrops) {
                    // Simplified: all crops use bulk watering mode
                    const wateredCount = crop.isWatered ? crop.totalCount : 0;
                    const wateringPercentage = crop.isWatered ? 100 : 0;

                    crops[crop.cropType] = {
                        cropType: crop.cropType,
                        wateringMode: 'bulk' as const,
                        gridLayout: crop.gridLayout,
                        bulkWatered: crop.isWatered,
                        wateredCount,
                        totalCount: crop.totalCount,
                        wateringPercentage
                    };

                    totalPlants += crop.totalCount;
                    wateredPlants += wateredCount;
                }

                const globalWateringPercentage = totalPlants > 0 ? Math.round((wateredPlants / totalPlants) * 100) : 0;

                const result = {
                    crops,
                    globalStats: {
                        totalCrops: state.trackedCrops.length,
                        totalPlants,
                        wateredPlants,
                        wateringPercentage: globalWateringPercentage,
                        allWatered: totalPlants > 0 && wateredPlants === totalPlants,
                        noneWatered: wateredPlants === 0
                    }
                };

                // Cache the result
                cachedWateringGridData = result;
                lastTrackedCropsHash = currentHash;

                return result;
            },

            // Removed individual watering mode functions - only bulk watering now

            // Crop database actions
            initializeCropDatabase: async () => {
                try {
                    set((state) => ({ ...state, isLoading: true, lastError: null }));

                    const response = await fetch('/crops.json');
                    if (!response.ok) {
                        throw new Error('Failed to fetch crop database');
                    }

                    const cropData: CropMetadata[] = await response.json();

                    set((state) => ({
                        ...state,
                        cropDatabase: cropData,
                        isLoading: false,
                        lastError: null
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize crop database';
                    set((state) => ({
                        ...state,
                        isLoading: false,
                        lastError: errorMessage
                    }));
                }
            },

            getCropMetadata: (cropType: string): CropMetadata | undefined => {
                return get().cropDatabase.find(crop => crop.name === cropType);
            },

            getAllCropMetadata: (): CropMetadata[] => {
                return get().cropDatabase;
            },

            setOriginalLayoutData: (url: string, parsedData: import('../types/layout').ParsedGardenData) => {
                set((state) => {
                    // Persist the original layout data
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: state.trackedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: url,
                        parsedGardenData: parsedData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        originalLayoutUrl: url,
                        parsedGardenData: parsedData,
                        lastError: null
                    };
                });
            },

            // Individual plot tracking actions
            setTrackingMode: (cropType: string, mode: 'bulk' | 'individual') => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType) {
                            const updatedCrop = { ...crop, wateringMode: mode };

                            // If switching to individual mode, create individual plots
                            if (mode === 'individual' && !crop.individualPlots) {
                                const plots: { [plotId: string]: IndividualPlot } = {};

                                // Create plots from plant instances or default to single plot
                                if (crop.plantInstances.length > 0) {
                                    crop.plantInstances.forEach((plant, index) => {
                                        const row = Math.floor(index / 9);
                                        const col = index % 9;
                                        const plotId = generatePlotId(row, col);
                                        plots[plotId] = {
                                            id: plotId,
                                            position: { row, col },
                                            cropType: crop.cropType,
                                            fertilizers: [],
                                            plantedAt: crop.addedAt,
                                            lastWatered: crop.isWatered ? crop.lastWateredAt : undefined,
                                            harvestHistory: [],
                                            status: plant.needsWater ? 'needsWater' : 'growing',
                                            harvestCount: 0,
                                            isActive: true,
                                        };
                                    });
                                } else {
                                    // Create single plot for manual crops
                                    const plotId = generatePlotId(0, 0);
                                    plots[plotId] = {
                                        id: plotId,
                                        position: { row: 0, col: 0 },
                                        cropType: crop.cropType,
                                        fertilizers: [],
                                        plantedAt: crop.addedAt,
                                        lastWatered: crop.isWatered ? crop.lastWateredAt : undefined,
                                        harvestHistory: [],
                                        status: crop.isWatered ? 'growing' : 'needsWater',
                                        harvestCount: 0,
                                        isActive: true,
                                    };
                                }

                                updatedCrop.individualPlots = plots;
                            }

                            return updatedCrop;
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            setIndividualPlotsEnabled: (enabled: boolean) => {
                set((state) => {
                    let individualGardenState = state.individualGardenState;

                    if (enabled && !individualGardenState) {
                        // Create initial individual garden state
                        individualGardenState = IndividualPlotMigrationService.migrateBulkToIndividual(
                            state.trackedCrops,
                            state.parsedGardenData
                        );
                    }

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: state.trackedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState,
                        individualPlotsEnabled: enabled
                    });

                    return {
                        individualPlotsEnabled: enabled,
                        individualGardenState,
                        lastError: null
                    };
                });
            },

            addPlot: (cropType: string, position: { row: number; col: number }) => {
                set((state) => {
                    const plotId = generatePlotId(position.row, position.col);
                    const newPlot = createEmptyPlot(position.row, position.col);
                    newPlot.cropType = cropType;
                    newPlot.plantedAt = new Date();
                    newPlot.status = 'growing';

                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType && crop.individualPlots) {
                            return {
                                ...crop,
                                individualPlots: {
                                    ...crop.individualPlots,
                                    [plotId]: newPlot
                                }
                            };
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            removePlot: (cropType: string, plotId: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType && crop.individualPlots) {
                            const { [plotId]: removed, ...remainingPlots } = crop.individualPlots;
                            return {
                                ...crop,
                                individualPlots: remainingPlots
                            };
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            updatePlot: (cropType: string, plotId: string, updates: Partial<IndividualPlot>) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType && crop.individualPlots?.[plotId]) {
                            return {
                                ...crop,
                                individualPlots: {
                                    ...crop.individualPlots,
                                    [plotId]: {
                                        ...crop.individualPlots[plotId],
                                        ...updates
                                    }
                                }
                            };
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            },

            plantCrop: (cropType: string, plotId: string, plantedAt?: Date) => {
                get().updatePlot(cropType, plotId, {
                    cropType,
                    plantedAt: plantedAt || new Date(),
                    status: 'growing'
                });
            },

            harvestPlot: (cropType: string, plotId: string) => {
                const state = get();
                const crop = state.trackedCrops.find(c => c.cropType === cropType);
                const plot = crop?.individualPlots?.[plotId];

                if (plot) {
                    const harvestEvent = {
                        timestamp: new Date(),
                        quantity: 1,
                        quality: 'base' as const
                    };

                    get().updatePlot(cropType, plotId, {
                        harvestHistory: [...plot.harvestHistory, harvestEvent],
                        harvestCount: plot.harvestCount + 1,
                        status: 'growing' // Reset to growing after harvest
                    });
                }
            },

            waterPlot: (cropType: string, plotId: string) => {
                get().updatePlot(cropType, plotId, {
                    lastWatered: new Date(),
                    status: 'growing'
                });
            },

            waterPlots: (cropType: string, plotIds: string[]) => {
                const now = new Date();
                plotIds.forEach(plotId => {
                    get().updatePlot(cropType, plotId, {
                        lastWatered: now,
                        status: 'growing'
                    });
                });
            },

            applyFertilizer: (cropType: string, plotId: string, fertilizerType: string) => {
                const state = get();
                const crop = state.trackedCrops.find(c => c.cropType === cropType);
                const plot = crop?.individualPlots?.[plotId];

                if (plot) {
                    const fertilizerEffect = FERTILIZER_EFFECTS[fertilizerType];
                    if (fertilizerEffect) {
                        const appliedFertilizer: AppliedFertilizer = {
                            type: fertilizerType,
                            appliedAt: new Date(),
                            effects: fertilizerEffect
                        };

                        get().updatePlot(cropType, plotId, {
                            fertilizers: [...plot.fertilizers, appliedFertilizer]
                        });
                    }
                }
            },

            removeFertilizer: (cropType: string, plotId: string, fertilizerType: string) => {
                const state = get();
                const crop = state.trackedCrops.find(c => c.cropType === cropType);
                const plot = crop?.individualPlots?.[plotId];

                if (plot) {
                    const updatedFertilizers = plot.fertilizers.filter(f => f.type !== fertilizerType);
                    get().updatePlot(cropType, plotId, {
                        fertilizers: updatedFertilizers
                    });
                }
            },

            getIndividualGardenState: () => {
                return get().individualGardenState;
            },

            migrateBulkToIndividual: (cropType: string) => {
                const state = get();
                const crop = state.trackedCrops.find(c => c.cropType === cropType);

                if (crop && crop.wateringMode === 'bulk') {
                    get().setTrackingMode(cropType, 'individual');
                }
            },

            migrateIndividualToBulk: (cropType: string) => {
                set((state) => {
                    const updatedCrops = state.trackedCrops.map(crop => {
                        if (crop.cropType === cropType && crop.individualPlots) {
                            // Migrate individual plots back to bulk
                            const bulkData = IndividualPlotMigrationService.migrateIndividualToBulk(
                                cropType,
                                crop.individualPlots
                            );

                            return {
                                ...crop,
                                ...bulkData,
                                wateringMode: 'bulk' as const,
                                individualPlots: undefined
                            };
                        }
                        return crop;
                    });

                    // Persist changes
                    persistenceUtils.savePersistedData({
                        version: CURRENT_VERSION,
                        trackedCrops: updatedCrops,
                        dailyWateringState: state.dailyWateringState,
                        migratedFromLegacy: false,
                        originalLayoutUrl: state.originalLayoutUrl,
                        parsedGardenData: state.parsedGardenData,
                        individualGardenState: state.individualGardenState,
                        individualPlotsEnabled: state.individualPlotsEnabled
                    });

                    return {
                        trackedCrops: updatedCrops,
                        lastError: null
                    };
                });
            }
        };
    })
);

/**
 * Initialize the store with persisted data
 */
export const initializeUnifiedStore = async () => {
    const store = useUnifiedGardenStore.getState();

    if (store.isInitialized) {
        return;
    }

    // Try to load persisted data
    const persistedData = persistenceUtils.loadPersistedData();

    if (persistedData) {
        // Migrate existing data to support simplified bulk-only watering
        const migratedCrops = persistedData.trackedCrops.map(crop => {
            // Ensure all crops use bulk watering mode
            return {
                ...crop,
                wateringMode: 'bulk' as const,
                // Keep gridLayout for display purposes but not for individual watering
                gridLayout: crop.gridLayout
            };
        });

        // Load from persisted data
        useUnifiedGardenStore.setState({
            trackedCrops: migratedCrops,
            dailyWateringState: persistedData.dailyWateringState,
            cropDatabase: [],
            isInitialized: true,
            isLoading: false,
            lastError: null,
            originalLayoutUrl: persistedData.originalLayoutUrl,
            parsedGardenData: persistedData.parsedGardenData,
            individualGardenState: persistedData.individualGardenState,
            individualPlotsEnabled: persistedData.individualPlotsEnabled || false
        });

        // Save migrated data back to localStorage if changes were made
        if (migratedCrops.some((crop, index) => crop !== persistedData.trackedCrops[index])) {
            persistenceUtils.savePersistedData({
                version: CURRENT_VERSION,
                trackedCrops: migratedCrops,
                dailyWateringState: persistedData.dailyWateringState,
                migratedFromLegacy: persistedData.migratedFromLegacy,
                originalLayoutUrl: persistedData.originalLayoutUrl,
                parsedGardenData: persistedData.parsedGardenData,
                individualGardenState: persistedData.individualGardenState,
                individualPlotsEnabled: persistedData.individualPlotsEnabled || false
            });
        }
    } else {
        // Initialize with empty state
        const initialData = persistenceUtils.createInitialData();
        persistenceUtils.savePersistedData(initialData);

        useUnifiedGardenStore.setState({
            trackedCrops: [],
            dailyWateringState: { ...DEFAULT_DAILY_WATERING_STATE },
            cropDatabase: [],
            isInitialized: true,
            isLoading: false,
            lastError: null,
            individualGardenState: undefined,
            individualPlotsEnabled: false
        });
    }

    // Initialize crop database
    await store.initializeCropDatabase();
};

/**
 * Hook for accessing store statistics
 */
export const useGardenStats = () => {
    return useUnifiedGardenStore((state) => {
        const totalCrops = state.trackedCrops.length;
        const wateredCrops = state.trackedCrops.filter(crop => crop.isWatered).length;
        const manualCrops = state.trackedCrops.filter(crop => crop.source === 'manual').length;
        const importedCrops = state.trackedCrops.filter(crop => crop.source === 'import').length;
        const totalPlants = state.trackedCrops.reduce((sum, crop) => sum + crop.totalCount, 0);

        return {
            totalCrops,
            wateredCrops,
            unwateredCrops: totalCrops - wateredCrops,
            manualCrops,
            importedCrops,
            totalPlants,
            wateringPercentage: totalCrops > 0 ? Math.round((wateredCrops / totalCrops) * 100) : 0,
            allWatered: totalCrops > 0 && wateredCrops === totalCrops,
            noneWatered: wateredCrops === 0
        };
    });
};