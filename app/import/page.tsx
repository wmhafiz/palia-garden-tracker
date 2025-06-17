'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { parseGridData } from '@/lib/services/plannerService';
import { ParsedGardenData, SavedLayout } from '@/types/layout';
import { GridPreview } from '@/components/GridPreview';
import { CropSummaryComponent } from '@/components/CropSummaryComponent';
import { layoutService } from '@/lib/services/layoutService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Search, Star, Trash2, AlertTriangle, Download, Save, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
    const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
    const [selectedLayout, setSelectedLayout] = useState<SavedLayout | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastModified'>('lastModified');

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

    const loadSavedLayouts = useCallback(() => {
        const result = layoutService.searchLayouts({
            query: searchQuery,
            sortBy,
            sortDirection: 'desc'
        });

        if (result.success) {
            setSavedLayouts(result.data || []);
        } else {
            setError(result.error?.message || 'Failed to load saved layouts');
        }
    }, [searchQuery, sortBy]);

    useEffect(() => {
        if (importMode === 'saved') {
            loadSavedLayouts();
        }
    }, [importMode, loadSavedLayouts, searchQuery, sortBy]);

    const handleClose = useCallback(() => {
        router.push('/');
    }, [router]);

    const handleLoadSavedLayout = useCallback((layout: SavedLayout) => {
        setSelectedLayout(layout);
        setGardenData(layout.gardenData);
        setLayoutName(layout.metadata.name);
        setShowPreview(true);
    }, []);

    const handleDeleteLayout = useCallback(async (layoutId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this layout?')) {
            return;
        }

        const result = layoutService.deleteLayout(layoutId);
        if (result.success) {
            loadSavedLayouts();
        } else {
            setError(result.error?.message || 'Failed to delete layout');
        }
    }, [loadSavedLayouts]);

    const handleToggleFavorite = useCallback(async (layoutId: string, isFavorite: boolean, event: React.MouseEvent) => {
        event.stopPropagation();

        const result = layoutService.updateLayoutMetadata(layoutId, { isFavorite: !isFavorite });
        if (result.success) {
            loadSavedLayouts();
        } else {
            setError(result.error?.message || 'Failed to update favorite status');
        }
    }, [loadSavedLayouts]);

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
        setError(null);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Content */}
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
                                        <p className="text-xs text-gray-500 mt-1">
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Saved Layouts</CardTitle>
                                    <div className="flex gap-4 mt-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                type="text"
                                                placeholder="Search layouts..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'createdAt' | 'lastModified')}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lastModified">Last Modified</SelectItem>
                                                <SelectItem value="createdAt">Created Date</SelectItem>
                                                <SelectItem value="name">Name</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {error && (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {savedLayouts.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium mb-2">No saved layouts found</p>
                                            <p className="text-sm">Import and save some layouts to see them here</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {savedLayouts.map((layout) => (
                                                <Card
                                                    key={layout.metadata.id}
                                                    className="cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                    onClick={() => handleLoadSavedLayout(layout)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-medium text-gray-900 truncate">
                                                                        {layout.metadata.name}
                                                                    </h3>
                                                                    {layout.isFavorite && (
                                                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {layout.metadata.description}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                    <span>{layout.metadata.plantCount} plants</span>
                                                                    <span>{layout.metadata.dimensions.rows}×{layout.metadata.dimensions.columns}</span>
                                                                    <span>{new Date(layout.metadata.lastModified).toLocaleDateString()}</span>
                                                                </div>
                                                                {layout.metadata.dominantCrops.length > 0 && (
                                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                                        {layout.metadata.dominantCrops.slice(0, 3).map((crop) => (
                                                                            <Badge key={crop} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                                                                {crop}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 ml-2">
                                                                <Button
                                                                    onClick={(e) => handleToggleFavorite(layout.metadata.id, layout.isFavorite, e)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-gray-400 hover:text-yellow-500"
                                                                    title={layout.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                                >
                                                                    <Star className={`h-4 w-4 ${layout.isFavorite ? 'fill-current' : ''}`} />
                                                                </Button>
                                                                <Button
                                                                    onClick={(e) => handleDeleteLayout(layout.metadata.id, e)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-gray-400 hover:text-red-500"
                                                                    title="Delete layout"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-6 border-t mt-6">
                                        <span className="text-sm text-gray-500">
                                            {savedLayouts.length} layout{savedLayouts.length !== 1 ? 's' : ''} found
                                        </span>
                                        <Button variant="outline" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
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
                        <Card className="bg-gray-50">
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
                                            <p className="text-xs text-gray-500 mt-1">
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
                                    <Button variant="outline" onClick={handleClose} disabled={saveLoading}>
                                        Cancel
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
                                                    importPlantsFromGarden(plants);

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