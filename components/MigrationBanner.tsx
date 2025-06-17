'use client';

import React, { useState, useEffect } from 'react';
import { MigrationService, migrationUtils } from '@/lib/services/migrationService';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronUp, Package, AlertTriangle } from 'lucide-react';

interface MigrationBannerProps {
    onMigrationComplete?: () => void;
}

export const MigrationBanner: React.FC<MigrationBannerProps> = ({ onMigrationComplete }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [migrationSummary, setMigrationSummary] = useState<{
        cropCount: number;
        hasWateringState: boolean;
        estimatedDataSize: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const { importFromLegacyData } = useUnifiedGardenStore();

    // Check if migration should be offered
    useEffect(() => {
        const migrationStatus = migrationUtils.getMigrationStatus();

        if (migrationStatus === 'available') {
            setShowBanner(true);
            const summary = MigrationService.getMigrationSummary();
            setMigrationSummary(summary);
        }
    }, []);

    const handleMigrate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const legacyData = MigrationService.extractLegacyData();

            if (!legacyData) {
                setError('No legacy data found to migrate');
                return;
            }

            const result = importFromLegacyData(legacyData);

            if (result.success) {
                // Clean up legacy data after successful migration
                MigrationService.cleanupLegacyData();

                // Hide banner and notify parent
                setShowBanner(false);
                onMigrationComplete?.();

                // Show success message briefly
                setTimeout(() => {
                    alert(migrationUtils.formatMigrationResult(result));
                }, 100);
            } else {
                setError(migrationUtils.formatMigrationResult(result));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Migration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        setShowBanner(false);
        onMigrationComplete?.();
    };

    const handleDismiss = () => {
        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/20 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Package className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    Import Your Existing Crop Data
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">
                                    We found your previously tracked crops. Would you like to import them into the new system?
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleDismiss}
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white hover:bg-blue-500/20"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {migrationSummary && (
                        <div className="mt-4 bg-blue-500/20 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="flex items-center space-x-4">
                                        <Badge variant="secondary" className="bg-blue-400/20 text-blue-100">
                                            🌱 {migrationSummary.cropCount} crops
                                        </Badge>
                                        {migrationSummary.hasWateringState && (
                                            <Badge variant="secondary" className="bg-blue-400/20 text-blue-100">
                                                💧 Watering state preserved
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="bg-blue-400/20 text-blue-100">
                                            📊 {migrationSummary.estimatedDataSize}
                                        </Badge>
                                    </div>
                                </div>
                                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-200 hover:text-white text-xs"
                                        >
                                            {showDetails ? (
                                                <>
                                                    Hide details <ChevronUp className="w-3 h-3 ml-1" />
                                                </>
                                            ) : (
                                                <>
                                                    Show details <ChevronDown className="w-3 h-3 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-3 pt-3 border-t border-blue-400/20">
                                        <div className="text-xs text-blue-100 space-y-1">
                                            <p>• Your tracked crops will be imported as manually selected crops</p>
                                            <p>• Current watering status will be preserved if available</p>
                                            <p>• Daily reset schedule (6 AM) will continue as normal</p>
                                            <p>• Original data will be safely removed after successful import</p>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert className="mt-4 bg-red-500/20 border-red-400/30">
                            <AlertTriangle className="h-4 w-4 text-red-200" />
                            <AlertDescription className="text-red-100">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-4 flex items-center justify-end space-x-3">
                        <Button
                            onClick={handleSkip}
                            disabled={isLoading}
                            variant="ghost"
                            className="text-blue-200 hover:text-white hover:bg-blue-500/20 disabled:opacity-50"
                        >
                            Skip for now
                        </Button>
                        <Button
                            onClick={handleMigrate}
                            disabled={isLoading}
                            className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Importing...</span>
                                </div>
                            ) : (
                                'Import Data'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * Hook to manage migration banner state
 */
export const useMigrationBanner = () => {
    const [showMigration, setShowMigration] = useState(false);

    useEffect(() => {
        const migrationStatus = migrationUtils.getMigrationStatus();
        setShowMigration(migrationStatus === 'available');
    }, []);

    const hideMigration = () => setShowMigration(false);

    return {
        showMigration,
        hideMigration
    };
};