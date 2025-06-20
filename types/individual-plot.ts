/**
 * Individual Plot Tracking Types
 * Phase 1: Foundation Enhancement - Data Structures
 */

export type PlotStatus =
    | "empty"
    | "growing"
    | "needsWater"
    | "readyToHarvest"
    | "overripe";

export interface FertilizerEffect {
    waterRetain: boolean;
    growthBoost: number; // percentage
    harvestBoost: number;
    qualityIncrease: number;
    weedPrevention: boolean;
}

export interface AppliedFertilizer {
    type: string;
    appliedAt: Date;
    effects: FertilizerEffect;
}

export interface HarvestEvent {
    timestamp: Date;
    quantity: number;
    quality: "base" | "star";
}

export interface GrowthStage {
    name: string;
    durationHours: number; // Palia hours
    visualIndicator: string;
    canHarvest: boolean;
}

export interface IndividualPlot {
    id: string; // e.g., "A1", "B3" (row-col identifier)
    position: { row: number; col: number };

    // Crop Information
    cropType?: string;
    cropId?: string; // For multi-tile crops (bushes/trees)

    // Fertilizer System
    fertilizers: AppliedFertilizer[];

    // Timing Information
    plantedAt?: Date;
    lastWatered?: Date;
    harvestHistory: HarvestEvent[];

    // Calculated States
    status: PlotStatus;
    nextWateringTime?: Date;
    nextHarvestTime?: Date;

    // Multi-harvest tracking
    harvestCount: number;
    maxHarvests?: number;

    // Visual/UI state
    isActive: boolean;
    isSelected?: boolean;
}

export interface ScheduledEvent {
    id: string;
    plotId: string;
    type: "water" | "harvest" | "replant";
    scheduledTime: Date;
    realWorldTime: Date;
    priority: "low" | "medium" | "high" | "urgent";
    completed: boolean;
}

export interface ActionItem {
    id: string;
    plotIds: string[];
    action: string;
    timeRemaining: number; // milliseconds
    canBatch: boolean;
}

export interface GardenStatistics {
    totalPlots: number;
    activePlots: number;
    plotsNeedingWater: number;
    plotsReadyToHarvest: number;
    overripePlots: number;
    averageWateringEfficiency: number;
    totalHarvests: number;
}

export interface IndividualGardenState {
    // Plot Management
    plots: { [plotId: string]: IndividualPlot };
    dimensions: { rows: number; columns: number };

    // Scheduling
    activeSchedule: ScheduledEvent[];
    upcomingActions: ActionItem[];

    // Settings
    trackingMode: "bulk" | "individual" | "hybrid";
    notificationsEnabled: boolean;
    timezone: string;

    // Statistics
    stats: GardenStatistics;
}

// Helper function to generate plot ID from position
export const generatePlotId = (row: number, col: number): string => {
    return `${String.fromCharCode(65 + row)}${col + 1}`;
};

// Helper function to parse plot ID back to position
export const parseplotId = (plotId: string): { row: number; col: number } => {
    const row = plotId.charCodeAt(0) - 65;
    const col = parseInt(plotId.slice(1)) - 1;
    return { row, col };
};

// Helper function to create an empty plot
export const createEmptyPlot = (row: number, col: number): IndividualPlot => {
    const plotId = generatePlotId(row, col);
    return {
        id: plotId,
        position: { row, col },
        fertilizers: [],
        harvestHistory: [],
        status: "empty",
        harvestCount: 0,
        isActive: true,
    };
}; 