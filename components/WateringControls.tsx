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
    const setIndividualWateringMode = useUnifiedGardenStore(state => state.setIndividualWateringMode);
    
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

    // Handle individual watering mode toggle for a specific crop
    const handleWateringModeToggle = (cropType: string, enabled: boolean) => {
        if (isLoading) return;
        setIndividualWateringMode(cropType, enabled);
    };

    // Calculate statistics
    const cropsWithIndividualMode = Object.values(crops).filter(crop => crop.wateringMode === 'individual').length;
    const cropsWithBulkMode = Object.values(crops).filter(crop => crop.wateringMode === 'bulk').length;

    if (globalStats.totalCrops === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-gray-500 mb-2">💧 No crops to water</div>
                        <p className="text-gray-400 text-sm">Add crops to your tracker to see watering controls</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className={compactMode ? 'pb-3' : ''}>
                <CardTitle className={`flex items-center gap-2 ${compactMode ? 'text-base' : 'text-lg'}`}>
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Watering Controls
                </CardTitle>
            </CardHeader>

            <CardContent className={`space-y-4 ${compactMode ? 'pt-0' : ''}`}>
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

                {/* Individual Crop Mode Toggles */}
                {showModeToggle && trackedCrops.some(crop => crop.source === 'import') && (
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className={`font-medium ${compactMode ? 'text-sm' : 'text-base'}`}>
                                Watering Modes
                            </span>
                        </div>

                        <div className="space-y-2">
                            {trackedCrops
                                .filter(crop => crop.source === 'import')
                                .map(crop => {
                                    const cropData = crops[crop.cropType];
                                    const isIndividualMode = cropData?.wateringMode === 'individual';
                                    
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
                                                {cropData && (
                                                    <Badge 
                                                        variant={isIndividualMode ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {isIndividualMode ? 'Individual' : 'Bulk'}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {cropData && (
                                                    <span className="text-xs text-gray-600">
                                                        {cropData.wateringPercentage}%
                                                    </span>
                                                )}
                                                <Switch
                                                    checked={isIndividualMode}
                                                    onCheckedChange={(enabled) =>
                                                        handleWateringModeToggle(crop.cropType, enabled)
                                                    }
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {!compactMode && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Individual Mode:</strong> Water each plant separately for precise control.
                                <br />
                                <strong>Bulk Mode:</strong> Water all plants of this crop type together.
                            </div>
                        )}
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
                                    <span className="text-gray-600">Individual Mode:</span>
                                    <span className="font-medium">{cropsWithIndividualMode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bulk Mode:</span>
                                    <span className="font-medium">{cropsWithBulkMode}</span>
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
            </CardContent>
        </Card>
    );
};