/**
 * Individual Plot Migration Service
 * Phase 1: Foundation Enhancement - Data Migration
 */

import {
    TrackedCrop,
    Plant,
    IndividualPlot,
    IndividualGardenState,
    GardenStatistics,
    generatePlotId,
    createEmptyPlot,
    FERTILIZER_EFFECTS,
    AppliedFertilizer
} from '../../types';
import { ParsedGardenData } from '../../types/layout';

export class IndividualPlotMigrationService {
    /**
     * Migrate bulk tracked crops to individual plot system
     */
    static migrateBulkToIndividual(
        trackedCrops: TrackedCrop[],
        parsedGardenData?: ParsedGardenData
    ): IndividualGardenState {
        const plots: { [plotId: string]: IndividualPlot } = {};
        let dimensions = { rows: 9, columns: 9 }; // Default garden size

        if (parsedGardenData) {
            // Use actual garden layout data
            dimensions = {
                rows: parsedGardenData.tiles.length,
                columns: parsedGardenData.tiles[0]?.length || 9
            };

            // Create plots from actual garden tiles
            parsedGardenData.tiles.forEach((row, rowIndex) => {
                row.forEach((tile, colIndex) => {
                    if (tile.isActive) {
                        const plotId = generatePlotId(rowIndex, colIndex);
                        plots[plotId] = this.createPlotFromTile(tile, plotId, rowIndex, colIndex);
                    }
                });
            });
        } else {
            // Create virtual plots from tracked crops
            let plotIndex = 0;

            trackedCrops.forEach((crop) => {
                if (crop.source === 'import' && crop.plantInstances.length > 0) {
                    // Create plots for each plant instance
                    crop.plantInstances.forEach((plant) => {
                        const row = Math.floor(plotIndex / dimensions.columns);
                        const col = plotIndex % dimensions.columns;

                        if (row < dimensions.rows) {
                            const plotId = generatePlotId(row, col);
                            plots[plotId] = this.createPlotFromPlant(plant, crop, plotId, row, col);
                            plotIndex++;
                        }
                    });
                } else if (crop.source === 'manual') {
                    // Create a single plot for manually added crops
                    const row = Math.floor(plotIndex / dimensions.columns);
                    const col = plotIndex % dimensions.columns;

                    if (row < dimensions.rows) {
                        const plotId = generatePlotId(row, col);
                        plots[plotId] = this.createPlotFromCrop(crop, plotId, row, col);
                        plotIndex++;
                    }
                }
            });
        }

        // Generate initial statistics
        const stats = this.calculateGardenStatistics(plots);

        return {
            plots,
            dimensions,
            activeSchedule: [],
            upcomingActions: [],
            trackingMode: 'individual',
            notificationsEnabled: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            stats
        };
    }

    /**
     * Create an individual plot from a garden tile
     */
    private static createPlotFromTile(
        tile: any, // GridTile from layout
        plotId: string,
        row: number,
        col: number
    ): IndividualPlot {
        const plot: IndividualPlot = {
            id: plotId,
            position: { row, col },
            fertilizers: [],
            harvestHistory: [],
            status: tile.cropType ? (tile.needsWater ? 'needsWater' : 'growing') : 'empty',
            harvestCount: 0,
            isActive: true,
        };

        // Set crop information if available
        if (tile.cropType) {
            plot.cropType = tile.cropType;
            plot.plantedAt = new Date(); // Default to now since we don't have historical data

            if (!tile.needsWater) {
                plot.lastWatered = new Date(); // Assume recently watered if doesn't need water
            }
        }

        // Add fertilizer if present
        if (tile.fertilizerType) {
            const fertilizerEffect = FERTILIZER_EFFECTS[tile.fertilizerType];
            if (fertilizerEffect) {
                const appliedFertilizer: AppliedFertilizer = {
                    type: tile.fertilizerType,
                    appliedAt: new Date(), // Default to now
                    effects: fertilizerEffect
                };
                plot.fertilizers.push(appliedFertilizer);
            }
        }

        return plot;
    }

    /**
     * Create an individual plot from a plant instance
     */
    private static createPlotFromPlant(
        plant: Plant,
        crop: TrackedCrop,
        plotId: string,
        row: number,
        col: number
    ): IndividualPlot {
        return {
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
    }

    /**
     * Create an individual plot from a manually tracked crop
     */
    private static createPlotFromCrop(
        crop: TrackedCrop,
        plotId: string,
        row: number,
        col: number
    ): IndividualPlot {
        return {
            id: plotId,
            position: { row, col },
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

    /**
     * Migrate individual plots back to bulk tracking
     */
    static migrateIndividualToBulk(
        cropType: string,
        individualPlots: { [plotId: string]: IndividualPlot }
    ): Partial<TrackedCrop> {
        const relevantPlots = Object.values(individualPlots).filter(
            plot => plot.cropType === cropType
        );

        if (relevantPlots.length === 0) {
            return {};
        }

        // Create plant instances from individual plots
        const plantInstances: Plant[] = relevantPlots.map((plot, index) => ({
            id: plot.id,
            name: cropType,
            needsWater: plot.status === 'needsWater'
        }));

        // Determine overall watering state
        const wateredPlots = relevantPlots.filter(plot =>
            plot.status !== 'needsWater' && plot.lastWatered
        );
        const isWatered = wateredPlots.length > relevantPlots.length / 2; // Majority rule

        // Find most recent watering time
        const lastWateredTimes = relevantPlots
            .map(plot => plot.lastWatered)
            .filter(Boolean) as Date[];

        const lastWateredAt = lastWateredTimes.length > 0
            ? new Date(Math.max(...lastWateredTimes.map(d => d.getTime())))
            : undefined;

        return {
            plantInstances,
            totalCount: relevantPlots.length,
            isWatered,
            lastWateredAt,
            wateringMode: 'bulk',
            source: 'import', // Treat as imported since it came from individual plots
        };
    }

    /**
     * Calculate garden statistics from individual plots
     */
    private static calculateGardenStatistics(
        plots: { [plotId: string]: IndividualPlot }
    ): GardenStatistics {
        const plotValues = Object.values(plots);
        const activePlots = plotValues.filter(plot => plot.isActive);
        const plotsWithCrops = activePlots.filter(plot => plot.cropType);

        return {
            totalPlots: plotValues.length,
            activePlots: activePlots.length,
            plotsNeedingWater: plotsWithCrops.filter(plot => plot.status === 'needsWater').length,
            plotsReadyToHarvest: plotsWithCrops.filter(plot => plot.status === 'readyToHarvest').length,
            overripePlots: plotsWithCrops.filter(plot => plot.status === 'overripe').length,
            averageWateringEfficiency: this.calculateWateringEfficiency(plotsWithCrops),
            totalHarvests: plotsWithCrops.reduce((sum, plot) => sum + plot.harvestCount, 0),
        };
    }

    /**
     * Calculate watering efficiency percentage
     */
    private static calculateWateringEfficiency(plots: IndividualPlot[]): number {
        if (plots.length === 0) return 100;

        const wateredPlots = plots.filter(plot =>
            plot.lastWatered && plot.status !== 'needsWater'
        );

        return Math.round((wateredPlots.length / plots.length) * 100);
    }

    /**
     * Validate individual garden state
     */
    static validateIndividualGardenState(state: any): state is IndividualGardenState {
        return (
            typeof state === 'object' &&
            state !== null &&
            typeof state.plots === 'object' &&
            typeof state.dimensions === 'object' &&
            typeof state.dimensions.rows === 'number' &&
            typeof state.dimensions.columns === 'number' &&
            Array.isArray(state.activeSchedule) &&
            Array.isArray(state.upcomingActions) &&
            ['bulk', 'individual', 'hybrid'].includes(state.trackingMode) &&
            typeof state.notificationsEnabled === 'boolean' &&
            typeof state.timezone === 'string' &&
            typeof state.stats === 'object'
        );
    }

    /**
     * Create default individual garden state
     */
    static createDefaultIndividualGardenState(): IndividualGardenState {
        return {
            plots: {},
            dimensions: { rows: 9, columns: 9 },
            activeSchedule: [],
            upcomingActions: [],
            trackingMode: 'individual',
            notificationsEnabled: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            stats: {
                totalPlots: 0,
                activePlots: 0,
                plotsNeedingWater: 0,
                plotsReadyToHarvest: 0,
                overripePlots: 0,
                averageWateringEfficiency: 100,
                totalHarvests: 0,
            }
        };
    }
} 