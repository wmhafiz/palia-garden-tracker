'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { Droplets, DropletOff, Settings, BarChart3 } from 'lucide-react';

interface WateringControlsProps {
    className?: string;
    compactMode?: boolean;
    showModeToggle?: boolean;
    showStatistics?: boolean;
}

export const WateringControls: React.FC<WateringControlsProps> = ({
    className = '',
    compactMode = false,
    showModeToggle = true,
    showStatistics = true
}) => {
    // Store actions and state
    const waterAllCrops = useUnifiedGardenStore(state => state.waterAllCrops);
    const waterNoneCrops = useUnifiedGardenStore(state => state.waterNoneCrops);

    // CRITICAL FIX: Use React.useMemo to properly memoize the watering grid data
    // This prevents infinite re-renders by ensuring stable references
    const trackedCrops = useUnifiedGardenStore(state => state.trackedCrops);
    const isLoading = useUnifiedGardenStore(state => state.isLoading);

    // Memoize the watering grid data computation to prevent infinite loops
    const wateringGridData = React.useMemo(() => {
        return useUnifiedGardenStore.getState().getWateringGridData();
    }, [trackedCrops]); // Only recompute when trackedCrops actually changes

    const { globalStats, crops } = wateringGridData;

    // Handle bulk watering actions
    const handleWaterAll = () => {
        if (isLoading) return;
        waterAllCrops();
    };

    const handleWaterNone = () => {
        if (isLoading) return;
        waterNoneCrops();
    };

    // All crops now use bulk watering mode - no mode switching needed

    if (globalStats.totalCrops === 0) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-gray-500 mb-2">💧 No crops to water</div>
                        <p className="text-gray-400 text-sm">Add crops to your tracker to see watering controls</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <div className={`space-y-4 ${compactMode ? 'pt-0' : ''}`}>
                {/* Global Watering Actions */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className={`font-medium ${compactMode ? 'text-sm' : 'text-base'}`}>
                            Global Actions
                        </span>
                        <Badge variant="outline" className="text-xs">
                            {globalStats.wateringPercentage}% watered
                        </Badge>
                    </div>

                    <div className={`grid gap-2 ${compactMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <Button
                            onClick={handleWaterAll}
                            disabled={isLoading || globalStats.allWatered}
                            variant={globalStats.allWatered ? "outline" : "default"}
                            size={compactMode ? "sm" : "default"}
                            className="flex items-center gap-2"
                        >
                            <Droplets className="h-4 w-4" />
                            Water All
                            {globalStats.allWatered && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    Done
                                </Badge>
                            )}
                        </Button>

                        <Button
                            onClick={handleWaterNone}
                            disabled={isLoading || globalStats.noneWatered}
                            variant="outline"
                            size={compactMode ? "sm" : "default"}
                            className="flex items-center gap-2"
                        >
                            <DropletOff className="h-4 w-4" />
                            Water None
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {showStatistics && !compactMode && (
                        <div className="space-y-2">
                            <Progress
                                value={globalStats.wateringPercentage}
                                className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>{globalStats.wateredPlants} watered</span>
                                <span>{globalStats.totalPlants} total plants</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Crop List - Simplified without mode toggles */}
                {trackedCrops.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className={`font-medium ${compactMode ? 'text-sm' : 'text-base'}`}>
                                Crop Status
                            </span>
                        </div>

                        <div className="space-y-2">
                            {trackedCrops.map(crop => {
                                const cropData = crops[crop.cropType];

                                return (
                                    <div
                                        key={crop.cropType}
                                        className={`flex items-center justify-between p-2 rounded-lg border ${compactMode ? 'text-sm' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{crop.cropType}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {crop.totalCount} plants
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {cropData && (
                                                <span className="text-xs text-gray-600">
                                                    {cropData.wateringPercentage}%
                                                </span>
                                            )}
                                            <Badge
                                                variant={crop.isWatered ? "secondary" : "default"}
                                                className="text-xs"
                                            >
                                                {crop.isWatered ? 'Watered' : 'Needs Water'}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Statistics Summary */}
                {showStatistics && !compactMode && (
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-base">Statistics</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Crops:</span>
                                    <span className="font-medium">{globalStats.totalCrops}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Plants:</span>
                                    <span className="font-medium">{globalStats.totalPlants}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Watered:</span>
                                    <span className="font-medium text-green-600">{globalStats.wateredPlants}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Watered Crops:</span>
                                    <span className="font-medium text-green-600">{trackedCrops.filter(crop => crop.isWatered).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Remaining:</span>
                                    <span className="font-medium">{trackedCrops.filter(crop => !crop.isWatered).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className={`font-medium ${globalStats.wateringPercentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {globalStats.wateringPercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Updating...</span>
                    </div>
                )}
            </div>
        </div>
    );
};