'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ParsedGardenData, GridTile } from '@/types/layout';
import { TileComponent } from './TileComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

interface GridPreviewProps {
    gardenData?: ParsedGardenData;
    maxWidth?: number;
    maxHeight?: number;
    onTileClick?: (tile: GridTile) => void;
    className?: string;
    useUnifiedStore?: boolean; // New prop to use unified store data
}

export const GridPreview: React.FC<GridPreviewProps> = ({
    gardenData: propGardenData,
    maxWidth,
    maxHeight,
    onTileClick,
    className = '',
    useUnifiedStore = false
}) => {
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

    // Get parsed garden data from unified store if requested
    const storedParsedGardenData = useUnifiedGardenStore(state =>
        useUnifiedStore ? state.parsedGardenData : null
    );

    // Get watering functionality from unified store
    const toggleCropWateredFromGrid = useUnifiedGardenStore(state => state.toggleCropWateredFromGrid);
    const trackedCrops = useUnifiedGardenStore(state => state.trackedCrops);

    // Use unified store data if available, otherwise use prop data
    const gardenData = useUnifiedStore ? storedParsedGardenData : propGardenData;

    // Detect screen size changes
    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScreenSize('sm');
            } else if (width < 1024) {
                setScreenSize('md');
            } else {
                setScreenSize('lg');
            }
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    // Calculate responsive dimensions and tile size
    const { tileSize, containerMaxWidth, containerMaxHeight } = useMemo(() => {
        if (!gardenData) return { tileSize: 32, containerMaxWidth: 400, containerMaxHeight: 300 };

        const { rows, columns } = gardenData.dimensions;

        // Responsive container dimensions
        let containerWidth: number;
        let containerHeight: number;

        if (maxWidth && maxHeight) {
            // Use provided dimensions if available
            containerWidth = maxWidth;
            containerHeight = maxHeight;
        } else {
            // Responsive defaults based on screen size
            switch (screenSize) {
                case 'sm':
                    containerWidth = Math.min(window.innerWidth - 32, 350); // 16px padding on each side
                    containerHeight = Math.min(window.innerHeight * 0.4, 300);
                    break;
                case 'md':
                    containerWidth = Math.min(window.innerWidth - 64, 600); // 32px padding on each side
                    containerHeight = Math.min(window.innerHeight * 0.5, 450);
                    break;
                case 'lg':
                default:
                    containerWidth = 800;
                    containerHeight = 600;
                    break;
            }
        }

        // Calculate optimal tile size
        const maxTileWidth = Math.floor(containerWidth / columns);
        const maxTileHeight = Math.floor(containerHeight / rows);

        // Responsive tile size limits
        const maxTileSize = screenSize === 'sm' ? 32 : screenSize === 'md' ? 40 : 48;
        const minTileSize = screenSize === 'sm' ? 12 : 16;

        const optimalSize = Math.min(maxTileWidth, maxTileHeight, maxTileSize);
        const finalTileSize = Math.max(optimalSize, minTileSize);

        return {
            tileSize: finalTileSize,
            containerMaxWidth: containerWidth,
            containerMaxHeight: containerHeight
        };
    }, [gardenData, gardenData?.dimensions, maxWidth, maxHeight, screenSize]);

    // Calculate grid dimensions
    const gridWidth = gardenData ? gardenData.dimensions.columns * tileSize : 0;
    const gridHeight = gardenData ? gardenData.dimensions.rows * tileSize : 0;

    const handleTileClick = (tile: GridTile) => {
        if (onTileClick) {
            onTileClick(tile);
        } else if (useUnifiedStore && tile.cropType) {
            // If using unified store and tile has a crop, toggle watering for that crop type
            toggleCropWateredFromGrid(tile.cropType);
        }
    };

    // Enhanced tile rendering with watering state
    const renderTileWithWateringState = (tile: GridTile, size: number) => {
        if (useUnifiedStore && tile.cropType) {
            // Find the tracked crop to get watering state
            const trackedCrop = trackedCrops.find(crop => crop.cropType === tile.cropType);
            if (trackedCrop) {
                // Override tile's needsWater based on tracked crop's watering state
                const enhancedTile = {
                    ...tile,
                    needsWater: !trackedCrop.isWatered
                };
                return (
                    <div className="cursor-pointer hover:opacity-80 transition-opacity">
                        <TileComponent
                            tile={enhancedTile}
                            size={size}
                            showTooltip={size >= (screenSize === 'sm' ? 20 : 24)}
                            onClick={handleTileClick}
                        />
                    </div>
                );
            }
        }

        // Default tile rendering
        return (
            <TileComponent
                tile={tile}
                size={size}
                showTooltip={size >= (screenSize === 'sm' ? 20 : 24)}
                onClick={onTileClick ? handleTileClick : undefined}
            />
        );
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading garden preview...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-red-600 mb-2">⚠️ Error loading garden preview</div>
                        <p className="text-gray-600 text-sm">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!gardenData || !gardenData.tiles || gardenData.tiles.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-gray-500 mb-2">🌱 No garden data available</div>
                        <p className="text-gray-400 text-sm">
                            {useUnifiedStore ? 'Add crops to your tracker to see the preview' : 'Import a garden layout to see the preview'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full h-full ${className}`}>
            <CardHeader>

                <div className="flex flex-row justify-between">
                    <CardTitle className="text-base sm:text-lg">
                        Garden Layout Preview
                    </CardTitle>

                    <p className="text-xs sm:text-sm">
                        <a
                            href={`https://palia-garden-planner.vercel.app/?layout=${gardenData.saveCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="outline"
                                title="Open in Palia Garden Planner"
                                className="text-xs sm:text-sm cursor-pointer"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in Planner
                            </Button>
                        </a>
                    </p>
                </div>
                <p className="text-xs sm:text-sm">
                    {gardenData.dimensions.rows} × {gardenData.dimensions.columns} plots
                    {gardenData.cropSummary.totalPlants > 0 && (
                        <span className="block sm:inline sm:ml-2">
                            • {gardenData.cropSummary.totalPlants} plants
                        </span>
                    )}
                </p>
            </CardHeader>

            <CardContent className="h-full overflow-y-auto overflow-x-hidden">
                <div className="flex flex-col items-center space-y-2 sm:space-y-4 min-h-full py-4">
                    {/* Grid Container - Responsive wrapper */}
                    <div className="w-full flex justify-center px-2 sm:px-4 flex-shrink-0">
                        <div className="relative" style={{ maxWidth: '100%' }}>
                            {/* Removed the overarching background grid overlay to show only the per-plot 3×3 grids */}

                            {/* Garden Grid - Organized by Plots */}
                            <div
                                className="relative mx-auto p-4"
                                style={{
                                    minWidth: screenSize === 'sm' ? '200px' : '250px',
                                    minHeight: screenSize === 'sm' ? '150px' : '200px',
                                    maxWidth: '100%'
                                }}
                            >
                                {/* Render plots in a grid layout */}
                                <div
                                    className="grid gap-4"
                                    style={{
                                        gridTemplateColumns: `repeat(${gardenData.activePlots[0]?.length || 1}, 1fr)`,
                                        gridTemplateRows: `repeat(${gardenData.activePlots.length}, 1fr)`
                                    }}
                                >
                                    {gardenData.activePlots.map((plotRow, plotRowIndex) =>
                                        plotRow.map((isPlotActive, plotColIndex) => {
                                            if (!isPlotActive) {
                                                // Render empty space for inactive plots
                                                return (
                                                    <div
                                                        key={`plot-${plotRowIndex}-${plotColIndex}`}
                                                        className="w-full h-full"
                                                        style={{
                                                            width: tileSize * 3,
                                                            height: tileSize * 3
                                                        }}
                                                    />
                                                );
                                            }

                                            // Render active plot as 3x3 grid
                                            return (
                                                <div
                                                    key={`plot-${plotRowIndex}-${plotColIndex}`}
                                                    className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
                                                    style={{
                                                        width: tileSize * 3,
                                                        height: tileSize * 3
                                                    }}
                                                >

                                                    {/* Render 3x3 tiles for this plot */}
                                                    <div className="relative grid grid-cols-3 grid-rows-3 w-full h-full">
                                                        {Array.from({ length: 3 }, (_, pi) =>
                                                            Array.from({ length: 3 }, (_, pj) => {
                                                                const tileRow = plotRowIndex * 3 + pi;
                                                                const tileCol = plotColIndex * 3 + pj;
                                                                const tile = gardenData.tiles[tileRow]?.[tileCol];

                                                                if (!tile) return null;

                                                                return (
                                                                    <div
                                                                        key={`tile-${tileRow}-${tileCol}`}
                                                                        className="w-full h-full"
                                                                        style={{
                                                                            width: tileSize,
                                                                            height: tileSize
                                                                        }}
                                                                    >
                                                                        {renderTileWithWateringState(tile, tileSize)}
                                                                    </div>
                                                                );
                                                            })
                                                        ).flat()}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ).flat()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend - Responsive layout */}
                    <div className="w-full px-4 flex-shrink-0">
                        <div className={`
              flex flex-wrap justify-center gap-2 sm:gap-4 text-xs max-w-full
              ${screenSize === 'sm' ? 'grid grid-cols-2 gap-2' : ''}
            `}>
                            <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="w-3 h-3 bg-green-50 border-green-400 p-0" />
                                <span className="whitespace-nowrap">Watered</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="w-3 h-3 bg-red-50 border-red-400 p-0" />
                                <span className="whitespace-nowrap">Needs Water</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="w-3 h-3 bg-amber-100 border-amber-300 p-0" />
                                <span className="whitespace-nowrap">Empty Plot</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="w-3 h-3 bg-gray-200 border-gray-300 p-0" />
                                <span className="whitespace-nowrap">Inactive</span>
                            </div>
                        </div>
                    </div>

                    {/* Responsive Info */}
                    {tileSize < (screenSize === 'sm' ? 20 : 24) && (
                        <div className="px-4 flex-shrink-0">
                            <p className="text-xs text-center max-w-md mx-auto">
                                💡 {screenSize === 'sm' ? 'Tooltips hidden on small screens' : 'Hover tooltips are hidden at this zoom level'}
                                {screenSize !== 'sm' && gridWidth < containerMaxWidth && gridHeight < containerMaxHeight && (
                                    <span> Try expanding the preview area for more detail.</span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Spacer to ensure content doesn't get cut off */}
                    <div className="flex-grow min-h-4"></div>
                </div>
            </CardContent>
        </Card>
    );
};