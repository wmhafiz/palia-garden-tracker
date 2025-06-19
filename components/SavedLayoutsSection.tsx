'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SavedLayout } from '@/types/layout';
import { SavedLayoutCard } from './SavedLayoutCard';
import { GridPreview } from './GridPreview';
import { layoutService } from '@/lib/services/layoutService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Search,
    Filter,
    Star,
    Grid3X3,
    Calendar,
    Sprout,
    FileText,
    AlertTriangle,
    X,
    SortAsc,
    SortDesc
} from 'lucide-react';

interface SavedLayoutsSectionProps {
    onLayoutSelect: (layout: SavedLayout) => void;
    onLayoutDelete?: (layoutId: string) => void;
    className?: string;
    showHeader?: boolean;
    maxColumns?: number;
}

type SortField = 'name' | 'createdAt' | 'lastModified' | 'plantCount' | 'plotCount';
type SortDirection = 'asc' | 'desc';

export const SavedLayoutsSection: React.FC<SavedLayoutsSectionProps> = ({
    onLayoutSelect,
    onLayoutDelete,
    className = '',
    showHeader = true,
    maxColumns = 4
}) => {
    // State management
    const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('lastModified');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all-crops');
    const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all-tags');

    // Preview dialog state
    const [previewLayout, setPreviewLayout] = useState<SavedLayout | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);

    // Load saved layouts
    const loadSavedLayouts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = layoutService.searchLayouts({
                query: searchQuery,
                sortBy: sortField,
                sortDirection,
                favoritesOnly: showFavoritesOnly,
                cropTypes: selectedCropFilter && selectedCropFilter !== 'all-crops' ? [selectedCropFilter] : undefined,
                tags: selectedTagFilter && selectedTagFilter !== 'all-tags' ? [selectedTagFilter] : undefined
            });

            if (result.success) {
                setSavedLayouts(result.data || []);
            } else {
                setError(result.error?.message || 'Failed to load saved layouts');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, sortField, sortDirection, showFavoritesOnly, selectedCropFilter, selectedTagFilter]);

    // Load layouts on mount and when filters change
    useEffect(() => {
        loadSavedLayouts();
    }, [loadSavedLayouts]);

    // Get unique crop types and tags for filters
    const { availableCrops, availableTags } = useMemo(() => {
        const crops = new Set<string>();
        const tags = new Set<string>();

        savedLayouts.forEach(layout => {
            layout.metadata.dominantCrops.forEach(crop => crops.add(crop));
            layout.metadata.tags.forEach(tag => tags.add(tag));
        });

        return {
            availableCrops: Array.from(crops).sort(),
            availableTags: Array.from(tags).sort()
        };
    }, [savedLayouts]);

    // Handle layout actions
    const handleLayoutLoad = useCallback((layout: SavedLayout) => {
        onLayoutSelect(layout);
    }, [onLayoutSelect]);

    const handleLayoutDelete = useCallback(async (layoutId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this layout?')) {
            return;
        }

        try {
            const result = layoutService.deleteLayout(layoutId);
            if (result.success) {
                await loadSavedLayouts();
                if (onLayoutDelete) {
                    onLayoutDelete(layoutId);
                }
            } else {
                setError(result.error?.message || 'Failed to delete layout');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete layout');
        }
    }, [loadSavedLayouts, onLayoutDelete]);

    const handleToggleFavorite = useCallback(async (layoutId: string, isFavorite: boolean, event: React.MouseEvent) => {
        event.stopPropagation();

        try {
            const result = layoutService.updateLayoutMetadata(layoutId, {
                isFavorite: !isFavorite
            });

            if (result.success) {
                await loadSavedLayouts();
            } else {
                setError(result.error?.message || 'Failed to update favorite status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update favorite status');
        }
    }, [loadSavedLayouts]);

    const handlePreview = useCallback((layout: SavedLayout) => {
        setPreviewLayout(layout);
        setShowPreviewDialog(true);
    }, []);

    const handleClosePreview = useCallback(() => {
        setShowPreviewDialog(false);
        setPreviewLayout(null);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCropFilter('all-crops');
        setSelectedTagFilter('all-tags');
        setShowFavoritesOnly(false);
    }, []);

    // Toggle sort direction
    const toggleSortDirection = useCallback(() => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    // Get grid column classes based on maxColumns
    const getGridColumns = () => {
        switch (maxColumns) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-1 sm:grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading saved layouts...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={className}>
                {showHeader && (
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Grid3X3 className="h-5 w-5" />
                            Saved Layouts
                        </CardTitle>

                        {/* Search and Filter Controls */}
                        <div className="space-y-4">
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search layouts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filter controls */}
                            <div className="flex flex-wrap gap-2">
                                {/* Sort controls */}
                                <div className="flex items-center gap-2">
                                    <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lastModified">Last Modified</SelectItem>
                                            <SelectItem value="createdAt">Created Date</SelectItem>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="plantCount">Plant Count</SelectItem>
                                            <SelectItem value="plotCount">Plot Count</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleSortDirection}
                                        className="px-2"
                                    >
                                        {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                    </Button>
                                </div>

                                {/* Favorites filter */}
                                <Button
                                    variant={showFavoritesOnly ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className="flex items-center gap-1"
                                >
                                    <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                    Favorites
                                </Button>

                                {/* Crop filter */}
                                {availableCrops.length > 0 && (
                                    <Select value={selectedCropFilter} onValueChange={setSelectedCropFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Crop" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all-crops">All Crops</SelectItem>
                                            {availableCrops.map(crop => (
                                                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Tag filter */}
                                {availableTags.length > 0 && (
                                    <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all-tags">All Tags</SelectItem>
                                            {availableTags.map(tag => (
                                                <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Clear filters */}
                                {(searchQuery || (selectedCropFilter && selectedCropFilter !== 'all-crops') || (selectedTagFilter && selectedTagFilter !== 'all-tags') || showFavoritesOnly) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                )}

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {savedLayouts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2 text-gray-600">
                                {searchQuery || (selectedCropFilter && selectedCropFilter !== 'all-crops') || (selectedTagFilter && selectedTagFilter !== 'all-tags') || showFavoritesOnly
                                    ? 'No layouts match your filters'
                                    : 'No saved layouts found'
                                }
                            </p>
                            <p className="text-sm text-gray-500">
                                {searchQuery || (selectedCropFilter && selectedCropFilter !== 'all-crops') || (selectedTagFilter && selectedTagFilter !== 'all-tags') || showFavoritesOnly
                                    ? 'Try adjusting your search criteria'
                                    : 'Import and save some layouts to see them here'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Layout grid */}
                            <div className={`grid gap-4 ${getGridColumns()}`}>
                                {savedLayouts.map((layout) => (
                                    <SavedLayoutCard
                                        key={layout.metadata.id}
                                        layout={layout}
                                        onLoad={handleLayoutLoad}
                                        onDelete={handleLayoutDelete}
                                        onToggleFavorite={handleToggleFavorite}
                                        onPreview={handlePreview}
                                    />
                                ))}
                            </div>

                            {/* Results summary */}
                            <div className="flex justify-between items-center pt-6 border-t mt-6 text-sm text-gray-600">
                                <span>
                                    {savedLayouts.length} layout{savedLayouts.length !== 1 ? 's' : ''} found
                                </span>
                                {(searchQuery || selectedCropFilter || selectedTagFilter || showFavoritesOnly) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Show all layouts
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Grid3X3 className="h-5 w-5" />
                            {previewLayout?.metadata.name}
                        </DialogTitle>
                    </DialogHeader>

                    {previewLayout && (
                        <div className="space-y-4">
                            {/* Layout metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{previewLayout.metadata.dimensions.rows}×{previewLayout.metadata.dimensions.columns}</div>
                                    <div className="text-xs text-gray-600">Garden Size</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{previewLayout.metadata.plantCount}</div>
                                    <div className="text-xs text-gray-600">Total Plants</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{previewLayout.metadata.plotCount}</div>
                                    <div className="text-xs text-gray-600">Active Plots</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{previewLayout.gardenData.cropSummary.plantsNeedingWater}</div>
                                    <div className="text-xs text-gray-600">Need Water</div>
                                </div>
                            </div>

                            {/* Full grid preview */}
                            <GridPreview
                                gardenData={previewLayout.gardenData}
                                className="w-full"
                            />

                            {/* Action buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={handleClosePreview}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    handleLayoutLoad(previewLayout);
                                    handleClosePreview();
                                }}>
                                    Load This Layout
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};