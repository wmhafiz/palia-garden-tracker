'use client';

import React, { useState, useCallback } from 'react';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { parseGridData } from '@/lib/services/plannerService';
import { ParsedGardenData, SavedLayout } from '@/types/layout';
import { GridPreview } from '@/components/GridPreview';
import { CropSummaryComponent } from '@/components/CropSummaryComponent';
import { SavedLayoutsSection } from '@/components/SavedLayoutsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Download, Save, FileText, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ImportMode = 'url' | 'saved';

export default function ImportPage() {
    const router = useRouter();
    const [importMode, setImportMode] = useState<ImportMode>('url');
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [gardenData, setGardenData] = useState<ParsedGardenData | null>(null);
    const [layoutName, setLayoutName] = useState('');
    const [layoutNotes, setLayoutNotes] = useState('');
    const [layoutTags, setLayoutTags] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Saved layouts state
    const [selectedLayout, setSelectedLayout] = useState<SavedLayout | null>(null);

    const { saveAndLoadLayout, loadLayoutById } = useUnifiedGardenStore();

    const handleImport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const gridData = await parseGridData(url);
            setGardenData(gridData);
            setShowPreview(true);

            // Generate a default layout name
            const dominantCrops = Object.entries(gridData.cropSummary.cropBreakdown)
                .sort(([, a], [, b]) => b.total - a.total)
                .slice(0, 2)
                .map(([crop]) => crop);

            const defaultName = dominantCrops.length > 0
                ? `${dominantCrops.join(' & ')} Garden`
                : `Garden Layout ${new Date().toLocaleDateString()}`;

            setLayoutName(defaultName);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during import');
        } finally {
            setLoading(false);
        }
    }, [url]);

    // Handle saved layout selection
    const handleSavedLayoutSelect = useCallback((layout: SavedLayout) => {
        setSelectedLayout(layout);
        setGardenData(layout.gardenData);
        setLayoutName(layout.metadata.name);
        setShowPreview(true);
    }, []);

    const handleClose = useCallback(() => {
        router.push('/');
    }, [router]);

    const handleSaveLayout = useCallback(async () => {
        if (!gardenData || !layoutName.trim()) return;

        try {
            setSaveLoading(true);
            setError(null);

            if (selectedLayout) {
                const result = await loadLayoutById(selectedLayout.metadata.id);
                if (!result.success) {
                    setError(result.error || 'Failed to load layout');
                    return;
                }
            } else {
                const tags = layoutTags.trim() ? layoutTags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                const result = await saveAndLoadLayout(url, layoutName, {
                    notes: layoutNotes.trim() || undefined,
                    tags: tags.length > 0 ? tags : undefined
                });

                if (!result.success) {
                    setError(result.error || 'Failed to save and load layout');
                    return;
                }
            }

            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process layout');
        } finally {
            setSaveLoading(false);
        }
    }, [gardenData, layoutName, layoutNotes, layoutTags, selectedLayout, url, saveAndLoadLayout, loadLayoutById, handleClose]);

    const handleBackToImport = useCallback(() => {
        setShowPreview(false);
        setGardenData(null);
        setLayoutName('');
        setSelectedLayout(null);
        setError(null);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {!showPreview ? (
                    <Tabs value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)} className="space-y-6">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="url">Import from URL</TabsTrigger>
                            <TabsTrigger value="saved">Load Saved Layout</TabsTrigger>
                        </TabsList>

                        <TabsContent value="url" className="space-y-6">
                            <Card className="max-w-2xl">
                                <CardHeader>
                                    <CardTitle>Import from Palia Garden Planner</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="planner-url">Palia Planner URL or Save Code</Label>
                                        <Input
                                            id="planner-url"
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://palia-garden-planner.vercel.app/... or v0.4_..."
                                            disabled={loading}
                                            className="mt-2"
                                        />
                                        <p className="text-xs mt-1">
                                            Paste a Palia Garden Planner URL or save code directly
                                        </p>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-3 justify-end">
                                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleImport}
                                            disabled={loading || !url.trim()}
                                        >
                                            {loading ? 'Importing...' : 'Import & Preview'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="saved" className="space-y-6">
                            <SavedLayoutsSection
                                onLayoutSelect={handleSavedLayoutSelect}
                                className="w-full"
                                showHeader={true}
                                maxColumns={3}
                            />
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    // Preview & Load Form
                    <div className="space-y-6">
                        {gardenData && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Grid Preview */}
                                <div className="xl:col-span-2">
                                    <GridPreview
                                        gardenData={gardenData}
                                        className="w-full h-full"
                                    />
                                </div>

                                {/* Crop Summary */}
                                <div className="xl:col-span-1">
                                    <CropSummaryComponent
                                        cropSummary={gardenData.cropSummary}
                                        className="h-fit"
                                        hideWateringStatus={true}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Load/Save Layout Form */}
                        <Card className="">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {selectedLayout ? 'Load Layout' : 'Save Layout'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedLayout && (
                                    <Alert>
                                        <FileText className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{selectedLayout.metadata.name}</span>
                                                {selectedLayout.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                            </div>
                                            <p className="text-sm mb-2">{selectedLayout.metadata.description}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span>Created: {new Date(selectedLayout.metadata.createdAt).toLocaleDateString()}</span>
                                                <span>Modified: {new Date(selectedLayout.metadata.lastModified).toLocaleDateString()}</span>
                                            </div>
                                            {selectedLayout.notes && (
                                                <p className="text-sm mt-2 italic">"{selectedLayout.notes}"</p>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {!selectedLayout && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="layout-name">Layout Name *</Label>
                                            <Input
                                                id="layout-name"
                                                type="text"
                                                value={layoutName}
                                                onChange={(e) => setLayoutName(e.target.value)}
                                                placeholder="Enter a name for this layout..."
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="layout-notes">Notes (Optional)</Label>
                                            <Textarea
                                                id="layout-notes"
                                                value={layoutNotes}
                                                onChange={(e) => setLayoutNotes(e.target.value)}
                                                placeholder="Add any notes about this layout..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="layout-tags">Tags (Optional)</Label>
                                            <Input
                                                id="layout-tags"
                                                type="text"
                                                value={layoutTags}
                                                onChange={(e) => setLayoutTags(e.target.value)}
                                                placeholder="Enter tags separated by commas (e.g., farming, efficient, beginner)"
                                            />
                                            <p className="text-xs mt-1">
                                                Tags help organize and search your layouts
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                    <Button variant="outline" onClick={handleBackToImport} disabled={saveLoading}>
                                        Back
                                    </Button>

                                    {!selectedLayout && (
                                        <Button
                                            onClick={async () => {
                                                if (!gardenData) return;
                                                try {
                                                    setSaveLoading(true);
                                                    setError(null);

                                                    const plants = [];
                                                    for (const [cropType, summary] of Object.entries(gardenData.cropSummary.cropBreakdown)) {
                                                        for (let i = 0; i < summary.total; i++) {
                                                            plants.push({
                                                                id: `${cropType}-${i}`,
                                                                name: cropType,
                                                                needsWater: false
                                                            });
                                                        }
                                                    }

                                                    const { importPlantsFromGarden } = useUnifiedGardenStore.getState();
                                                    importPlantsFromGarden(plants, url, gardenData);

                                                    handleClose();
                                                } catch (err) {
                                                    setError(err instanceof Error ? err.message : 'Failed to load layout');
                                                } finally {
                                                    setSaveLoading(false);
                                                }
                                            }}
                                            disabled={saveLoading}
                                            variant="outline"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            {saveLoading ? 'Loading...' : 'Load Without Saving'}
                                        </Button>
                                    )}

                                    <Button
                                        onClick={handleSaveLayout}
                                        disabled={(!selectedLayout && !layoutName.trim()) || saveLoading}
                                        className={selectedLayout ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                                    >
                                        {saveLoading ? (
                                            'Processing...'
                                        ) : selectedLayout ? (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                Load Layout
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save & Load Layout
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}