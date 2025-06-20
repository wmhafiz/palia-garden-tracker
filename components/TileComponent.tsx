'use client';

import React from 'react';
import { GridTile } from '@/types/layout';
import { getCropByName } from '@/lib/services/cropService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TileComponentProps {
    tile: GridTile;
    size?: number;
    showTooltip?: boolean;
    onClick?: (tile: GridTile) => void;
    wateringMode?: boolean;
    showWateringIndicators?: boolean;
}

/**
 * Fertilizer color mappings for visual indicators
 */
const FERTILIZER_COLORS: { [key: string]: string } = {
    'Speedy Gro': '#10B981', // Green
    'Quality Up': '#8B5CF6', // Purple
    'Weed Block': '#F59E0B', // Amber
    'Harvest Boost': '#EF4444', // Red
    'Hydrate Pro': '#3B82F6', // Blue
};

/**
 * Get crop image from new crop service
 */
const getCropImage = (cropType: string) => {
    const cropData = getCropByName(cropType);
    if (cropData?.images?.crop) {
        return `/${cropData.images.crop}`;
    }
};

export const TileComponent: React.FC<TileComponentProps> = ({
    tile,
    size = 32,
    showTooltip = true,
    onClick,
    wateringMode = false,
    showWateringIndicators = true
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick(tile);
        }
    };

    const renderTileContent = () => {
        if (!tile.isActive) {
            // Inactive plot - show gray background
            return (
                <div
                    className="w-full h-full bg-gray-200 border border-gray-300 rounded-sm"
                    style={{ width: size, height: size }}
                />
            );
        }

        if (!tile.cropType) {
            // Empty active plot - show soil background
            return (
                <div
                    className="w-full h-full bg-amber-100 border border-amber-300 rounded-sm"
                    style={{ width: size, height: size }}
                />
            );
        }

        // Active plot with crop
        const borderColor = wateringMode
            ? (tile.needsWater ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50')
            : (tile.needsWater ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50');

        const hoverEffects = onClick
            ? (wateringMode
                ? 'cursor-pointer hover:scale-110 hover:shadow-lg hover:border-blue-500 hover:bg-blue-50'
                : 'cursor-pointer hover:scale-105 hover:shadow-md')
            : '';

        return (
            <div
                className={`relative w-full h-full border-2 rounded-sm transition-all duration-200 ${borderColor} ${hoverEffects}`}
                style={{ width: size, height: size }}
                onClick={handleClick}
            >
                {/* Crop Image */}
                <img
                    src={getCropImage(tile.cropType)}
                    alt={tile.cropType}
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                        // Fallback to wheat image if crop image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/crops/wheat.webp';
                    }}
                />

                {/* Fertilizer Indicator */}
                {tile.fertilizerType && tile.fertilizerType !== 'None' && (
                    <div
                        className="absolute top-0 right-0 w-2 h-2 rounded-full border border-white"
                        style={{
                            backgroundColor: FERTILIZER_COLORS[tile.fertilizerType] || '#6B7280',
                            width: Math.max(4, size * 0.125),
                            height: Math.max(4, size * 0.125)
                        }}
                        title={tile.fertilizerType}
                    />
                )}

                {/* Enhanced Watering Status Indicators */}
                {showWateringIndicators && (
                    <>
                        {/* Water Drop Indicator for Needs Water */}
                        {tile.needsWater && (
                            <div
                                className={`absolute bottom-0 left-0 rounded-full border border-white ${wateringMode ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                                    }`}
                                style={{
                                    width: Math.max(6, size * 0.15),
                                    height: Math.max(6, size * 0.15)
                                }}
                                title="Needs Water"
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className={`rounded-full ${wateringMode ? 'w-1.5 h-1.5 bg-white' : 'w-1 h-1 bg-white'
                                        }`} />
                                </div>
                            </div>
                        )}

                        {/* Checkmark Indicator for Watered */}
                        {!tile.needsWater && wateringMode && (
                            <div
                                className="absolute bottom-0 left-0 bg-green-500 rounded-full border border-white flex items-center justify-center"
                                style={{
                                    width: Math.max(6, size * 0.15),
                                    height: Math.max(6, size * 0.15)
                                }}
                                title="Watered"
                            >
                                <div className="text-white text-xs font-bold">✓</div>
                            </div>
                        )}

                        {/* Individual Plant Mode Indicator */}
                        {wateringMode && size >= 24 && (
                            <div
                                className="absolute top-0 left-0 bg-blue-600 rounded-full border border-white"
                                style={{
                                    width: Math.max(4, size * 0.1),
                                    height: Math.max(4, size * 0.1)
                                }}
                                title="Individual Watering Mode"
                            />
                        )}
                    </>
                )}
            </div>
        );
    };

    const tileElement = (
        <div className="relative inline-block">
            {renderTileContent()}
        </div>
    );

    // Add tooltip if enabled and there's crop data
    if (showTooltip && tile.isActive && tile.cropType) {
        const cropData = getCropByName(tile.cropType);

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {tileElement}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="font-medium">{tile.cropType}</div>
                    {cropData?.gardenBonus && cropData.gardenBonus !== 'None' && (
                        <div className="text-blue-300">Bonus: {cropData.gardenBonus}</div>
                    )}
                    {tile.fertilizerType && tile.fertilizerType !== 'None' && (
                        <div className="text-gray-300">Fertilizer: {tile.fertilizerType}</div>
                    )}
                    <div className={tile.needsWater ? 'text-red-300' : 'text-green-300'}>
                        {tile.needsWater ? 'Needs Water' : 'Watered'}
                    </div>
                    {wateringMode && onClick && (
                        <div className="text-blue-300 text-xs mt-1">
                            Click to {tile.needsWater ? 'water' : 'unwater'}
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return tileElement;
};