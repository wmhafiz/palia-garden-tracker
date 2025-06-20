'use client';

import React from 'react';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Individual Plot Toggle Component
 * Phase 1: Foundation Enhancement - Basic UI Integration
 */
export const IndividualPlotToggle: React.FC = () => {
    const {
        trackedCrops,
        individualPlotsEnabled,
        setIndividualPlotsEnabled,
        setTrackingMode,
        migrateBulkToIndividual,
        migrateIndividualToBulk,
    } = useUnifiedGardenStore();

    const handleGlobalToggle = (enabled: boolean) => {
        setIndividualPlotsEnabled(enabled);
    };

    const handleCropModeToggle = (cropType: string, currentMode: 'bulk' | 'individual') => {
        const newMode = currentMode === 'bulk' ? 'individual' : 'bulk';
        setTrackingMode(cropType, newMode);
    };

    const getCropStats = (crop: any) => {
        if (crop.wateringMode === 'individual' && crop.individualPlots) {
            const plots = Object.values(crop.individualPlots);
            const needsWater = plots.filter((plot: any) => plot.status === 'needsWater').length;
            const growing = plots.filter((plot: any) => plot.status === 'growing').length;
            const readyToHarvest = plots.filter((plot: any) => plot.status === 'readyToHarvest').length;

            return {
                total: plots.length,
                needsWater,
                growing,
                readyToHarvest,
            };
        }

        return {
            total: crop.totalCount,
            needsWater: crop.isWatered ? 0 : crop.totalCount,
            growing: crop.isWatered ? crop.totalCount : 0,
            readyToHarvest: 0,
        };
    };

    if (trackedCrops.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Individual Plot Tracking</CardTitle>
                    <CardDescription>
                        Add some crops to your tracker to enable individual plot management.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    Individual Plot Tracking
                    <Badge variant={individualPlotsEnabled ? "default" : "secondary"}>
                        {individualPlotsEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Enable individual plot tracking to manage each plant separately with precise scheduling.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Global Toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="font-medium">Enable Individual Plot Tracking</div>
                        <div className="text-sm text-muted-foreground">
                            Switch from bulk watering to individual plot management
                        </div>
                    </div>
                    <Switch
                        checked={individualPlotsEnabled}
                        onCheckedChange={handleGlobalToggle}
                    />
                </div>

                <Separator />

                {/* Per-Crop Controls */}
                <div className="space-y-3">
                    <div className="font-medium">Crop Tracking Modes</div>

                    {trackedCrops.map((crop) => {
                        const stats = getCropStats(crop);

                        return (
                            <div key={crop.cropType} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{crop.cropType}</span>
                                        <Badge variant={crop.wateringMode === 'individual' ? "default" : "outline"}>
                                            {crop.wateringMode}
                                        </Badge>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCropModeToggle(crop.cropType, crop.wateringMode)}
                                        disabled={!individualPlotsEnabled}
                                    >
                                        Switch to {crop.wateringMode === 'bulk' ? 'Individual' : 'Bulk'}
                                    </Button>
                                </div>

                                {/* Crop Statistics */}
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>Total: {stats.total}</span>
                                    {stats.needsWater > 0 && (
                                        <span className="text-red-600">Needs Water: {stats.needsWater}</span>
                                    )}
                                    {stats.growing > 0 && (
                                        <span className="text-green-600">Growing: {stats.growing}</span>
                                    )}
                                    {stats.readyToHarvest > 0 && (
                                        <span className="text-blue-600">Ready: {stats.readyToHarvest}</span>
                                    )}
                                </div>

                                {/* Individual Plot Details */}
                                {crop.wateringMode === 'individual' && crop.individualPlots && (
                                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                                        <div className="font-medium mb-1">Individual Plots:</div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {Object.entries(crop.individualPlots).slice(0, 6).map(([plotId, plot]: [string, any]) => (
                                                <div key={plotId} className="flex items-center gap-1">
                                                    <span>{plotId}:</span>
                                                    <Badge
                                                        variant={
                                                            plot.status === 'needsWater' ? 'destructive' :
                                                                plot.status === 'growing' ? 'default' :
                                                                    plot.status === 'readyToHarvest' ? 'secondary' : 'outline'
                                                        }
                                                        className="text-xs px-1 py-0"
                                                    >
                                                        {plot.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {Object.keys(crop.individualPlots).length > 6 && (
                                                <div className="text-muted-foreground">
                                                    +{Object.keys(crop.individualPlots).length - 6} more...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Source Information */}
                                <div className="text-xs text-muted-foreground">
                                    Source: {crop.source} • Added: {crop.addedAt.toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Text */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Phase 1 Foundation:</strong> This demonstrates the basic individual plot tracking
                    infrastructure. Individual plots are created when switching from bulk to individual mode,
                    preserving existing watering states and plant data.
                </div>
            </CardContent>
        </Card>
    );
}; 