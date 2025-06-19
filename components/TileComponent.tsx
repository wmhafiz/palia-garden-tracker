'use client';

import React from 'react';
import { GridTile } from '@/types/layout';
import { getCropByName } from '@/lib/services/cropService';

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
 * Get crop image from new crop service or fallback to legacy mapping
 */
const getCropImage = (cropType: string): string => {
    const cropData = getCropByName(cropType);
    if (cropData?.images?.crop) {
        return `/${cropData.images.crop}`;
    }

    // Legacy fallback mapping
    const legacyMap: { [key: string]: string } = {
        'Apple': 'crops/apple.webp',
        'Batterfly Bean': 'crops/batterfly-bean.webp',
        'Batterfly Beans': 'crops/batterfly-bean.webp',
        'Blueberry': 'crops/blueberry.webp',
        'Bok Choy': 'crops/bok-choy.webp',
        'Carrot': 'crops/carrot.webp',
        'Cotton': 'crops/cotton.webp',
        'Napa Cabbage': 'crops/napa-cabbage.webp',
        'Onion': 'crops/onion.webp',
        'Potato': 'crops/potato.webp',
        'Rice': 'crops/rice.webp',
        'Rockhopper Pumpkin': 'crops/rockhopper-pumpkin.webp',
        'Spicy Pepper': 'crops/spicy-pepper.webp',
        'Tomato': 'crops/tomato.webp',
        'Wheat': 'crops/wheat.webp',
        'Corn': 'crops/corn.webp',
    };

    return legacyMap[cropType] ? `/${legacyMap[cropType]}` : '/crops/wheat.webp';
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
            <div className="group relative">
                {tileElement}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
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
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
            </div>
        );
    }

    return tileElement;
};