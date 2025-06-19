'use client';

import React, { useState, useEffect } from 'react';
import { GridPreview } from './GridPreview';
import { parseGridData } from '@/lib/services/plannerService';
import { ParsedGardenData } from '@/types/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

// Sample save code from demo.ts
const SAMPLE_SAVE_CODE = 'v0.4_D-111-111-111_CR-TTTTTTTTT-PPPPPPPPP-AAAAAAAAA-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN';

export const GridPreviewTest: React.FC = () => {
    const [gardenData, setGardenData] = useState<ParsedGardenData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDemoData = async () => {
            try {
                setLoading(true);
                const data = await parseGridData(SAMPLE_SAVE_CODE);
                setGardenData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load demo data');
            } finally {
                setLoading(false);
            }
        };

        loadDemoData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardContent className="flex flex-col items-center space-y-4 p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-center">Loading demo garden data...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <Alert variant="destructive">
                            <AlertDescription>
                                Error loading demo data: {error}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!gardenData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardContent className="text-center p-8">
                        <p className="text-gray-600">No garden data available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-4">
            <div className="container mx-auto px-4">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl sm:text-3xl font-bold ">
                            Responsive GridPreview Test
                        </CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base">
                            This demonstrates the responsive GridPreview component across different screen sizes.
                            Try resizing your browser window to see how it adapts!
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Screen Size Indicator */}
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <span className="font-semibold">Current breakpoint: </span>
                                <span className="sm:hidden">Small (&lt; 640px)</span>
                                <span className="hidden sm:inline lg:hidden">Medium (640px - 1024px)</span>
                                <span className="hidden lg:inline">Large (≥ 1024px)</span>
                            </AlertDescription>
                        </Alert>

                        {/* Responsive GridPreview */}
                        <GridPreview
                            gardenData={gardenData}
                            className="w-full"
                        />

                        {/* Save/Load Layout Buttons - Now visible on all screen sizes */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button className="bg-green-600 hover:bg-green-700">
                                💾 Save Layout
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                📂 Load Layout
                            </Button>
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                📤 Export Layout
                            </Button>
                        </div>

                        {/* Responsive Info */}
                        <Card className="">
                            <CardHeader>
                                <CardTitle className="text-lg">Responsive Features:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm space-y-1">
                                    <li>• <strong>Small screens:</strong> Compact tiles (12-32px), 2-column legend, optimized spacing</li>
                                    <li>• <strong>Medium screens:</strong> Balanced tiles (16-40px), flexible legend layout</li>
                                    <li>• <strong>Large screens:</strong> Full-size tiles (16-48px), horizontal legend</li>
                                    <li>• <strong>All sizes:</strong> Save/Load buttons are now always visible and accessible</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};