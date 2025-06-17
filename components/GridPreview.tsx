'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ParsedGardenData, GridTile } from '@/types/layout';
import { TileComponent } from './TileComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GridPreviewProps {
    gardenData: ParsedGardenData;
    maxWidth?: number;
    maxHeight?: number;
    onTileClick?: (tile: GridTile) => void;
    showGrid?: boolean;
    className?: string;
}

export const GridPreview: React.FC<GridPreviewProps> = ({
    gardenData,
    maxWidth,
    maxHeight,
    onTileClick,
    showGrid = true,
    className = ''
}) => {
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

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
    }, [gardenData.dimensions, maxWidth, maxHeight, screenSize]);

    // Calculate grid dimensions
    const gridWidth = gardenData.dimensions.columns * tileSize;
    const gridHeight = gardenData.dimensions.rows * tileSize;

    const handleTileClick = (tile: GridTile) => {
        if (onTileClick) {
            onTileClick(tile);
        }
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

    if (!gardenData.tiles || gardenData.tiles.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-gray-500 mb-2">🌱 No garden data available</div>
                        <p className="text-gray-400 text-sm">Import a garden layout to see the preview</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full h-full ${className}`}>
            <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                    Garden Layout Preview
                </CardTitle>
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
                            {/* Grid Background */}
                            {showGrid && (
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                                        backgroundSize: `${tileSize}px ${tileSize}px`
                                    }}
                                />
                            )}

                            {/* Garden Grid */}
                            <div
                                className="relative  border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
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
                                                    showTooltip={tileSize >= (screenSize === 'sm' ? 20 : 24)}
                                                    onClick={onTileClick ? handleTileClick : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
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