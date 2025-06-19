'use client';

import React, { useMemo } from 'react';
import { ParsedGardenData, GridTile } from '@/types/layout';
import { Badge } from '@/components/ui/badge';
import { getCropByName } from '@/lib/services/cropService';

interface MiniGridPreviewProps {
    gardenData: ParsedGardenData;
    maxWidth?: number;
    maxHeight?: number;
    className?: string;
    showLegend?: boolean;
    interactive?: boolean;
    onPreviewClick?: () => void;
}

// Crop type to color mapping for consistent visualization
const getCropColor = (cropType: string | null): string => {
    if (!cropType) return 'transparent';

    // Try to get crop data from new service first
    const cropData = getCropByName(cropType);
    if (cropData?.gardenBonus) {
        // Use bonus-based colors for consistency
        const bonusColorMap = {
            'Water Retain': '#3b82f6', // blue-500
            'Harvest Boost': '#22c55e', // green-500
            'Quality Boost': '#a855f7', // purple-500
            'Weed Block': '#f97316', // orange-500
            'Speed Boost': '#eab308', // yellow-500
        };
        return bonusColorMap[cropData.gardenBonus as keyof typeof bonusColorMap] || '#6b7280';
    }

    // Legacy fallback colors
    const cropColors: Record<string, string> = {
        'Tomato': '#dc2626', // red-600
        'Potato': '#a16207', // yellow-700
        'Wheat': '#eab308', // yellow-500
        'Rice': '#84cc16', // lime-500
        'Carrot': '#ea580c', // orange-600
        'Onion': '#f3f4f6', // gray-100
        'Lettuce': '#16a34a', // green-600
        'Bok Choy': '#059669', // emerald-600
        'Napa Cabbage': '#10b981', // emerald-500
        'Cotton': '#f9fafb', // gray-50
        'Apple': '#dc2626', // red-600
        'Blueberry': '#3730a3', // indigo-700
        'Spicy Pepper': '#dc2626', // red-600
        'Corn': '#eab308', // yellow-500
        'Batterfly Beans': '#22c55e', // green-500 (Harvest Boost)
        'Rockhopper Pumpkin': '#ea580c', // orange-600
    };

    return cropColors[cropType] || '#6b7280'; // gray-500 as fallback
};

// Get border color based on watering status
const getTileBorderColor = (tile: GridTile): string => {
    if (!tile.isActive) return '#e5e7eb'; // gray-200
    if (!tile.cropType) return '#f3f4f6'; // gray-100
    if (tile.needsWater) return '#fca5a5'; // red-300
    return '#86efac'; // green-300
};

// Get background color for tile
const getTileBackgroundColor = (tile: GridTile): string => {
    if (!tile.isActive) return '#f3f4f6'; // gray-100 for inactive
    if (!tile.cropType) return '#fef3c7'; // amber-100 for empty active plots

    const cropColor = getCropColor(tile.cropType);
    // Make crop colors slightly transparent for better visibility
    return cropColor + '80'; // Add 50% opacity
};

export const MiniGridPreview: React.FC<MiniGridPreviewProps> = ({
    gardenData,
    maxWidth = 200,
    maxHeight = 150,
    className = '',
    showLegend = false,
    interactive = false,
    onPreviewClick
}) => {
    // Calculate optimal tile size and grid dimensions
    const { tileSize, gridWidth, gridHeight, plotsPerRow, plotsPerCol } = useMemo(() => {
        const { rows, columns } = gardenData.dimensions;

        // Calculate how many 3x3 plots we have
        const plotRows = Math.ceil(rows / 3);
        const plotCols = Math.ceil(columns / 3);

        // Calculate optimal tile size to fit within maxWidth/maxHeight
        const maxTileWidth = Math.floor(maxWidth / columns);
        const maxTileHeight = Math.floor(maxHeight / rows);
        const optimalTileSize = Math.min(maxTileWidth, maxTileHeight, 8); // Max 8px per tile
        const finalTileSize = Math.max(optimalTileSize, 2); // Min 2px per tile

        return {
            tileSize: finalTileSize,
            gridWidth: columns * finalTileSize,
            gridHeight: rows * finalTileSize,
            plotsPerRow: plotRows,
            plotsPerCol: plotCols
        };
    }, [gardenData.dimensions, maxWidth, maxHeight]);

    // Render individual tile
    const renderTile = (tile: GridTile, size: number) => {
        const backgroundColor = getTileBackgroundColor(tile);
        const borderColor = getTileBorderColor(tile);

        return (
            <div
                key={`tile-${tile.row}-${tile.col}`}
                className="absolute border-[0.5px]"
                style={{
                    left: tile.col * size,
                    top: tile.row * size,
                    width: size,
                    height: size,
                    backgroundColor,
                    borderColor,
                    minWidth: '1px',
                    minHeight: '1px'
                }}
                title={tile.cropType ? `${tile.cropType}${tile.needsWater ? ' (needs water)' : ' (watered)'}` : 'Empty plot'}
            />
        );
    };

    // Get crop statistics for legend
    const cropStats = useMemo(() => {
        const stats = {
            totalPlants: gardenData.cropSummary.totalPlants,
            needingWater: gardenData.cropSummary.plantsNeedingWater,
            activePlots: 0,
            emptyPlots: 0
        };

        // Count active and empty plots
        gardenData.activePlots.forEach(plotRow => {
            plotRow.forEach(isActive => {
                if (isActive) stats.activePlots++;
            });
        });

        // Count empty plots within active areas
        gardenData.tiles.forEach(tileRow => {
            tileRow.forEach(tile => {
                if (tile.isActive && !tile.cropType) {
                    stats.emptyPlots++;
                }
            });
        });

        return stats;
    }, [gardenData]);

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Mini Grid Container */}
            <div
                className={`relative border border-gray-300 rounded-md bg-gray-50 flex-shrink-0 ${interactive ? 'cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all duration-200' : ''
                    }`}
                style={{
                    width: Math.max(gridWidth, 40), // Minimum width for visibility
                    height: Math.max(gridHeight, 30), // Minimum height for visibility
                    maxWidth,
                    maxHeight
                }}
                onClick={interactive ? onPreviewClick : undefined}
                title={interactive ? 'Click to view full preview' : undefined}
            >
                {/* Render all tiles */}
                {gardenData.tiles.flat().map(tile => renderTile(tile, tileSize))}

                {/* Plot grid overlay for better structure visualization */}
                {tileSize >= 3 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Vertical plot lines */}
                        {Array.from({ length: Math.ceil(gardenData.dimensions.columns / 3) + 1 }, (_, i) => (
                            <div
                                key={`v-line-${i}`}
                                className="absolute bg-gray-400 opacity-30"
                                style={{
                                    left: i * 3 * tileSize - 0.5,
                                    top: 0,
                                    width: '1px',
                                    height: '100%'
                                }}
                            />
                        ))}
                        {/* Horizontal plot lines */}
                        {Array.from({ length: Math.ceil(gardenData.dimensions.rows / 3) + 1 }, (_, i) => (
                            <div
                                key={`h-line-${i}`}
                                className="absolute bg-gray-400 opacity-30"
                                style={{
                                    left: 0,
                                    top: i * 3 * tileSize - 0.5,
                                    width: '100%',
                                    height: '1px'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Size indicator for very small grids */}
                {(gridWidth < 60 || gridHeight < 40) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white text-xs font-medium">
                        {gardenData.dimensions.rows}×{gardenData.dimensions.columns}
                    </div>
                )}
            </div>

            {/* Compact Legend */}
            {showLegend && (
                <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">
                            {gardenData.dimensions.rows}×{gardenData.dimensions.columns} plots
                        </span>
                        <span>
                            {cropStats.totalPlants} plants
                        </span>
                    </div>

                    {cropStats.totalPlants > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-300 border border-green-400 rounded-sm"></div>
                                    <span>Watered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-300 border border-red-400 rounded-sm"></div>
                                    <span>Needs Water</span>
                                </div>
                            </div>
                            <span className="text-gray-600">
                                {cropStats.needingWater}/{cropStats.totalPlants}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};