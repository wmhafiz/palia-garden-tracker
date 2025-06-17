'use client';

import React from 'react';
import { WateringGridPreview } from './WateringGridPreview';
import { WateringControls } from './WateringControls';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';

interface WateringSystemDemoProps {
    className?: string;
}

/**
 * Demo component showcasing the integration of all watering components
 * This demonstrates how the components work together in the MainTracker
 */
export const WateringSystemDemo: React.FC<WateringSystemDemoProps> = ({
    className = ''
}) => {
    const trackedCrops = useUnifiedGardenStore(state => state.trackedCrops);
    const wateringGridData = useUnifiedGardenStore(state => state.getWateringGridData());

    // Custom tile water handler for demonstration
    const handleTileWater = (cropType: string, plantId?: string, row?: number, col?: number) => {
        console.log('Custom tile water handler:', { cropType, plantId, row, col });
        // This would be handled by the store actions in the actual implementation
    };

    if (trackedCrops.length === 0) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-500 mb-2">🌱 No crops tracked</div>
                    <p className="text-gray-400 text-sm">
                        Add crops to your tracker or import a garden layout to see the watering system in action
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Watering Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WateringControls
                        showModeToggle={true}
                        showStatistics={true}
                    />
                </div>

                {/* Watering Grid Preview */}
                <div className="lg:col-span-2">
                    <WateringGridPreview
                        showWateringControls={true}
                        onTileWater={handleTileWater}
                        compactMode={false}
                    />
                </div>
            </div>

            {/* Compact Mode Demo */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Compact Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WateringControls
                        compactMode={true}
                        showModeToggle={false}
                        showStatistics={false}
                    />
                    <WateringGridPreview
                        compactMode={true}
                        showWateringControls={true}
                    />
                </div>
            </div>

            {/* Statistics Display */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Current Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-blue-700">Total Crops</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {wateringGridData.globalStats.totalCrops}
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-semibold text-green-700">Total Plants</div>
                        <div className="text-2xl font-bold text-green-900">
                            {wateringGridData.globalStats.totalPlants}
                        </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-semibold text-purple-700">Watered</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {wateringGridData.globalStats.wateredPlants}
                        </div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="font-semibold text-amber-700">Progress</div>
                        <div className="text-2xl font-bold text-amber-900">
                            {wateringGridData.globalStats.wateringPercentage}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};