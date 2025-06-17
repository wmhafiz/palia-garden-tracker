'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GridTile } from '@/types/layout';
import { CompleteWateringGridState, WateringGridData, GridPlant } from '@/types/watering-grid';
import { TileComponent } from './TileComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';

// Extended GridTile interface for watering functionality
interface WateringGridTile extends GridTile {
    plantId?: string;
    gridPosition?: { row: number; col: number };
    isBulkMode?: boolean;
}

interface WateringGridPreviewProps {
    className?: string;
    showWateringControls?: boolean;
    onTileWater?: (cropType: string, plantId?: string, row?: number, col?: number) => void;
    compactMode?: boolean;
}

export const WateringGridPreview: React.FC<WateringGridPreviewProps> = ({
    className = '',
    showWateringControls = true,
    onTileWater,
    compactMode = false
}) => {
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

    // Get watering grid data from store
    const wateringGridData = useUnifiedGardenStore(state => state.getWateringGridData());
    const togglePlantWateredById = useUnifiedGardenStore(state => state.togglePlantWateredById);
    const togglePlantWateredByPosition = useUnifiedGardenStore(state => state.togglePlantWateredByPosition);
    const toggleCropWatered = useUnifiedGardenStore(state => state.toggleCropWatered);

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

    // Convert watering grid data to garden-like structure for display
    const gardenData = useMemo(() => {
        const crops = Object.values(wateringGridData.crops);
        if (crops.length === 0) {
            return null;
        }

        // Calculate grid dimensions based on all crops
        let maxCols = 0;
        let totalRows = 0;

        crops.forEach(crop => {
            if (crop.gridLayout) {
                maxCols = Math.max(maxCols, crop.gridLayout.cols);
                totalRows += crop.gridLayout.rows + 1; // +1 for spacing between crops
            } else {
                // For bulk mode, create a simple representation
                maxCols = Math.max(maxCols, Math.min(6, crop.totalCount));
                totalRows += Math.ceil(crop.totalCount / Math.min(6, crop.totalCount)) + 1;
            }
        });

        const tiles: WateringGridTile[][] = [];
        let currentRow = 0;

        crops.forEach((crop, cropIndex) => {
            if (crop.gridLayout) {
                // Individual mode - use actual grid layout
                for (let r = 0; r < crop.gridLayout.rows; r++) {
                    if (!tiles[currentRow + r]) {
                        tiles[currentRow + r] = [];
                    }
                    for (let c = 0; c < maxCols; c++) {
                        const plant = crop.gridLayout.plants.find(p => p.row === r && p.col === c);
                        if (plant && c < crop.gridLayout.cols) {
                            tiles[currentRow + r][c] = {
                                row: currentRow + r,
                                col: c,
                                isActive: true,
                                cropType: crop.cropType,
                                needsWater: !plant.isWatered,
                                fertilizerType: 'None',
                                plantId: plant.id,
                                gridPosition: { row: r, col: c }
                            };
                        } else {
                            tiles[currentRow + r][c] = {
                                row: currentRow + r,
                                col: c,
                                isActive: false,
                                cropType: null,
                                needsWater: false,
                                fertilizerType: 'None'
                            };
                        }
                    }
                }
                currentRow += crop.gridLayout.rows + 1;
            } else {
                // Bulk mode - create a simple grid representation
                const cols = Math.min(6, crop.totalCount);
                const rows = Math.ceil(crop.totalCount / cols);
                
                for (let r = 0; r < rows; r++) {
                    if (!tiles[currentRow + r]) {
                        tiles[currentRow + r] = [];
                    }
                    for (let c = 0; c < maxCols; c++) {
                        const plantIndex = r * cols + c;
                        if (plantIndex < crop.totalCount && c < cols) {
                            tiles[currentRow + r][c] = {
                                row: currentRow + r,
                                col: c,
                                isActive: true,
                                cropType: crop.cropType,
                                needsWater: !crop.bulkWatered,
                                fertilizerType: 'None',
                                isBulkMode: true
                            };
                        } else {
                            tiles[currentRow + r][c] = {
                                row: currentRow + r,
                                col: c,
                                isActive: false,
                                cropType: null,
                                needsWater: false,
                                fertilizerType: 'None'
                            };
                        }
                    }
                }
                currentRow += rows + 1;
            }
        });

        return {
            dimensions: { rows: totalRows, columns: maxCols },
            tiles,
            cropSummary: {
                totalPlants: wateringGridData.globalStats.totalPlants,
                cropBreakdown: {}
            }
        };
    }, [wateringGridData]);

    // Calculate responsive dimensions and tile size
    const { tileSize, containerMaxWidth, containerMaxHeight } = useMemo(() => {
        if (!gardenData) return { tileSize: 32, containerMaxWidth: 400, containerMaxHeight: 300 };

        const { rows, columns } = gardenData.dimensions;

        // Responsive container dimensions
        let containerWidth: number;
        let containerHeight: number;

        if (compactMode) {
            // Compact mode uses smaller dimensions
            switch (screenSize) {
                case 'sm':
                    containerWidth = Math.min(window.innerWidth - 16, 300);
                    containerHeight = Math.min(window.innerHeight * 0.3, 200);
                    break;
                case 'md':
                    containerWidth = Math.min(window.innerWidth - 32, 400);
                    containerHeight = Math.min(window.innerHeight * 0.4, 300);
                    break;
                case 'lg':
                default:
                    containerWidth = 500;
                    containerHeight = 400;
                    break;
            }
        } else {
            // Full mode uses larger dimensions
            switch (screenSize) {
                case 'sm':
                    containerWidth = Math.min(window.innerWidth - 32, 350);
                    containerHeight = Math.min(window.innerHeight * 0.4, 300);
                    break;
                case 'md':
                    containerWidth = Math.min(window.innerWidth - 64, 600);
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
        const maxTileSize = compactMode 
            ? (screenSize === 'sm' ? 24 : screenSize === 'md' ? 32 : 40)
            : (screenSize === 'sm' ? 32 : screenSize === 'md' ? 40 : 48);
        const minTileSize = compactMode 
            ? (screenSize === 'sm' ? 8 : 12)
            : (screenSize === 'sm' ? 12 : 16);

        const optimalSize = Math.min(maxTileWidth, maxTileHeight, maxTileSize);
        const finalTileSize = Math.max(optimalSize, minTileSize);

        return {
            tileSize: finalTileSize,
            containerMaxWidth: containerWidth,
            containerMaxHeight: containerHeight
        };
    }, [gardenData, compactMode, screenSize]);

    const handleTileClick = (tile: GridTile) => {
        const wateringTile = tile as WateringGridTile;
        if (!wateringTile.isActive || !wateringTile.cropType) return;

        if (onTileWater) {
            // Use custom handler if provided
            onTileWater(
                wateringTile.cropType,
                wateringTile.plantId,
                wateringTile.gridPosition?.row,
                wateringTile.gridPosition?.col
            );
        } else {
            // Use store actions
            if (wateringTile.isBulkMode) {
                toggleCropWatered(wateringTile.cropType);
            } else if (wateringTile.plantId) {
                togglePlantWateredById(wateringTile.cropType, wateringTile.plantId);
            } else if (wateringTile.gridPosition) {
                togglePlantWateredByPosition(wateringTile.cropType, wateringTile.gridPosition.row, wateringTile.gridPosition.col);
            }
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading watering preview...</p>
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
                        <div className="text-red-600 mb-2">⚠️ Error loading watering preview</div>
                        <p className="text-gray-600 text-sm">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!gardenData || wateringGridData.globalStats.totalCrops === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-gray-500 mb-2">💧 No crops to water</div>
                        <p className="text-gray-400 text-sm">Add crops to your tracker to see watering status</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate grid dimensions
    const gridWidth = gardenData.dimensions.columns * tileSize;
    const gridHeight = gardenData.dimensions.rows * tileSize;

    return (
        <Card className={`w-full h-full ${className}`}>
            <CardHeader className={compactMode ? 'pb-2' : ''}>
                <CardTitle className={`${compactMode ? 'text-sm' : 'text-base sm:text-lg'}`}>
                    Watering Grid Preview
                </CardTitle>
                {!compactMode && (
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                        <span>{wateringGridData.globalStats.totalCrops} crops</span>
                        <span>•</span>
                        <span>{wateringGridData.globalStats.totalPlants} plants</span>
                        <span>•</span>
                        <span className={wateringGridData.globalStats.wateringPercentage >= 100 ? 'text-green-600' : 'text-blue-600'}>
                            {wateringGridData.globalStats.wateringPercentage}% watered
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className={`h-full overflow-y-auto overflow-x-hidden ${compactMode ? 'pt-0' : ''}`}>
                <div className={`flex flex-col items-center ${compactMode ? 'space-y-1' : 'space-y-2 sm:space-y-4'} min-h-full py-2`}>
                    {/* Grid Container */}
                    <div className="w-full flex justify-center px-2 sm:px-4 flex-shrink-0">
                        <div className="relative" style={{ maxWidth: '100%' }}>
                            {/* Garden Grid */}
                            <div
                                className="relative border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
                                style={{
                                    width: gridWidth,
                                    height: gridHeight,
                                    minWidth: screenSize === 'sm' ? '200px' : '250px',
                                    minHeight: screenSize === 'sm' ? '150px' : '200px',
                                    maxWidth: '100%'
                                }}
                            >
                                {gardenData.tiles.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="flex"
                                        style={{ height: tileSize }}
                                    >
                                        {row.map((tile, colIndex) => (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                className="flex-shrink-0"
                                                style={{ width: tileSize, height: tileSize }}
                                            >
                                                <TileComponent
                                                    tile={tile}
                                                    size={tileSize}
                                                    showTooltip={tileSize >= (screenSize === 'sm' ? 20 : 24) && !compactMode}
                                                    onClick={showWateringControls ? handleTileClick : undefined}
                                                    wateringMode={true}
                                                    showWateringIndicators={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    {!compactMode && (
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
                                    <Badge variant="outline" className="w-3 h-3 bg-blue-50 border-blue-400 p-0" />
                                    <span className="whitespace-nowrap">Individual Mode</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Badge variant="outline" className="w-3 h-3 bg-purple-50 border-purple-400 p-0" />
                                    <span className="whitespace-nowrap">Bulk Mode</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Responsive Info */}
                    {!compactMode && tileSize < (screenSize === 'sm' ? 20 : 24) && (
                        <div className="px-4 flex-shrink-0">
                            <p className="text-xs text-center max-w-md mx-auto">
                                💡 {screenSize === 'sm' ? 'Tooltips hidden on small screens' : 'Hover tooltips are hidden at this zoom level'}
                                {screenSize !== 'sm' && gridWidth < containerMaxWidth && gridHeight < containerMaxHeight && (
                                    <span> Try expanding the preview area for more detail.</span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-grow min-h-4"></div>
                </div>
            </CardContent>
        </Card>
    );
};