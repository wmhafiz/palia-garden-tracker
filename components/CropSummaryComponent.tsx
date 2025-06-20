'use client';

import React from 'react';
import { CropSummary } from '@/types/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCropByName } from '@/lib/services/cropService';

interface CropSummaryComponentProps {
    cropSummary: CropSummary;
    onMarkAsWatered?: (cropType: string) => void;
    onMarkAllAsWatered?: () => void;
    className?: string;
    hideWateringStatus?: boolean;
}

/**
 * Get crop image from new crop service
 */
const getCropImage = (cropType: string) => {
    const cropData = getCropByName(cropType);
    if (cropData?.images?.crop) {
        return `/${cropData.images.crop}`;
    }
};

/**
 * Get garden bonus information for a crop
 */
const getCropBonusInfo = (cropType: string) => {
    const cropData = getCropByName(cropType);
    if (!cropData?.gardenBonus || cropData.gardenBonus === 'None') {
        return null;
    }

    const bonusColorMap = {
        'Water Retain': 'bg-blue-100 text-blue-800',
        'Harvest Boost': 'bg-green-100 text-green-800',
        'Quality Boost': 'bg-purple-100 text-purple-800',
        'Weed Block': 'bg-orange-100 text-orange-800',
        'Speed Boost': 'bg-yellow-100 text-yellow-800',
    };

    const bonusIconMap = {
        'Water Retain': '💧',
        'Harvest Boost': '📈',
        'Quality Boost': '⭐',
        'Weed Block': '🛡️',
        'Speed Boost': '⚡',
    };

    return {
        bonus: cropData.gardenBonus,
        color: bonusColorMap[cropData.gardenBonus as keyof typeof bonusColorMap] || 'bg-gray-100 text-gray-800',
        icon: bonusIconMap[cropData.gardenBonus as keyof typeof bonusIconMap] || '🌱'
    };
};

export const CropSummaryComponent: React.FC<CropSummaryComponentProps> = ({
    cropSummary,
    onMarkAsWatered,
    onMarkAllAsWatered,
    className = '',
    hideWateringStatus = false
}) => {
    const getSizeIcon = (size: 'single' | 'bush' | 'tree'): string => {
        switch (size) {
            case 'single': return '🌱';
            case 'bush': return '🌿';
            case 'tree': return '🌳';
            default: return '🌱';
        }
    };

    const getWateringStatus = (needingWater: number, total: number) => {
        if (needingWater === 0) {
            return { text: 'All watered', color: 'text-green-600', bgColor: 'bg-green-100' };
        } else if (needingWater === total) {
            return { text: 'All need water', color: 'text-red-600', bgColor: 'bg-red-100' };
        } else {
            return { text: 'Partially watered', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        }
    };

    // Sort crops by those needing water first, then alphabetically
    const sortedCrops = Object.entries(cropSummary.cropBreakdown).sort(([, a], [, b]) => {
        if (a.needingWater > 0 && b.needingWater === 0) return -1;
        if (a.needingWater === 0 && b.needingWater > 0) return 1;
        return a.needingWater === b.needingWater ? 0 : b.needingWater - a.needingWater;
    });

    if (cropSummary.totalPlants === 0) {
        return (
            <Card className={` ${className}`}>
                <CardContent className="p-6 text-center">
                    <div className="mb-2">🌱 No crops planted</div>
                    <p className="text-sm">
                        Your garden is ready for planting!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${className}`}>
            {/* Header */}
            <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            Crop Summary
                        </CardTitle>
                        <p className="text-sm">
                            {hideWateringStatus
                                ? `${cropSummary.totalPlants} plants`
                                : `${cropSummary.totalPlants} plants • ${cropSummary.plantsNeedingWater} need water`
                            }
                        </p>
                    </div>
                    {!hideWateringStatus && (
                        <div className="text-right">
                            <div className="text-2xl font-bold">
                                {cropSummary.wateringPercentage.toFixed(0)}%
                            </div>
                            <div className="text-xs">need water</div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {!hideWateringStatus && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span>Watering Progress</span>
                            <span>
                                {cropSummary.totalPlants - cropSummary.plantsNeedingWater} / {cropSummary.totalPlants} watered
                            </span>
                        </div>
                        <Progress
                            value={Math.max(0, 100 - cropSummary.wateringPercentage)}
                            className="h-2"
                        />
                    </div>
                )}

                {/* Quick Actions */}
                {!hideWateringStatus && cropSummary.plantsNeedingWater > 0 && onMarkAllAsWatered && (
                    <div className="mt-3">
                        <Button
                            onClick={onMarkAllAsWatered}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            💧 Mark All as Watered
                        </Button>
                    </div>
                )}
            </CardHeader>

            {/* Crop List */}
            <CardContent className="p-4">
                <div className="space-y-3 max-h-122 overflow-y-auto">
                    {sortedCrops.map(([cropType, summary]) => {
                        const status = getWateringStatus(summary.needingWater, summary.total);
                        const bonusInfo = getCropBonusInfo(cropType);

                        return (
                            <div
                                key={cropType}
                                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                {/* Crop Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={getCropImage(cropType)}
                                        alt={cropType}
                                        className="w-8 h-8 object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/crops/wheat.webp';
                                        }}
                                    />
                                </div>

                                {/* Crop Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-medium truncate">
                                            {cropType}
                                        </h4>
                                        <span className="text-xs" title={`${summary.size} crop`}>
                                            {getSizeIcon(summary.size)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                                        <span className="text-xs">
                                            {summary.total} plant{summary.total !== 1 ? 's' : ''}
                                        </span>
                                        {bonusInfo && (
                                            <Badge
                                                className={`text-xs px-2 py-0.5 ${bonusInfo.color}`}
                                                title={`Garden Bonus: ${bonusInfo.bonus}`}
                                            >
                                                {bonusInfo.icon} {bonusInfo.bonus}
                                            </Badge>
                                        )}
                                        {!hideWateringStatus && (
                                            <Badge className={`text-xs ${status.bgColor} ${status.color} whitespace-nowrap`}>
                                                {status.text}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Watering Status */}
                                {!hideWateringStatus && (
                                    <div className="flex-shrink-0 text-right">
                                        {summary.needingWater > 0 ? (
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-red-600">
                                                    {summary.needingWater} need water
                                                </div>
                                                {onMarkAsWatered && (
                                                    <Button
                                                        onClick={() => onMarkAsWatered(cropType)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    >
                                                        Mark Watered
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm font-medium text-green-600">
                                                ✅ All watered
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary Footer */}
                {sortedCrops.length > 3 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                        <p className="text-xs">
                            Showing {sortedCrops.length} crop type{sortedCrops.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};