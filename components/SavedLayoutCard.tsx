'use client';

import React, { useState } from 'react';
import { SavedLayout } from '@/types/layout';
import { MiniGridPreview } from './MiniGridPreview';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Eye, Calendar, Grid3X3, Sprout } from 'lucide-react';

interface SavedLayoutCardProps {
    layout: SavedLayout;
    onLoad: (layout: SavedLayout) => void;
    onDelete: (layoutId: string, event: React.MouseEvent) => void;
    onToggleFavorite: (layoutId: string, isFavorite: boolean, event: React.MouseEvent) => void;
    onPreview?: (layout: SavedLayout) => void;
    className?: string;
}

export const SavedLayoutCard: React.FC<SavedLayoutCardProps> = ({
    layout,
    onLoad,
    onDelete,
    onToggleFavorite,
    onPreview,
    className = ''
}) => {
    const [imageError, setImageError] = useState(false);

    const handleCardClick = () => {
        onLoad(layout);
    };

    const handlePreviewClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (onPreview) {
            onPreview(layout);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <Card
            className={`group cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 ${className}`}
            onClick={handleCardClick}
        >
            <CardContent className="p-0">
                {/* Header with preview and actions */}
                <div className="relative">
                    {/* Mini Grid Preview */}
                    <div className="p-4 pb-2">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base truncate">
                                        {layout.metadata.name}
                                    </h3>
                                    {layout.isFavorite && (
                                        <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm line-clamp-2 mb-2">
                                    {layout.metadata.description}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onPreview && (
                                    <Button
                                        onClick={handlePreviewClick}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-blue-600 h-8 w-8 p-0"
                                        title="Quick preview"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    onClick={(e) => onToggleFavorite(layout.metadata.id, layout.isFavorite, e)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-yellow-500 h-8 w-8 p-0"
                                    title={layout.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <Star className={`h-4 w-4 ${layout.isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                    onClick={(e) => onDelete(layout.metadata.id, e)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                                    title="Delete layout"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Mini Grid Preview */}
                        <div className="flex justify-center mb-3">
                            <MiniGridPreview
                                gardenData={layout.gardenData}
                                maxWidth={180}
                                maxHeight={120}
                                className="border border-gray-200 rounded"
                                interactive={false}
                            />
                        </div>
                    </div>

                    {/* Metadata and stats */}
                    <div className="px-4 pb-4 space-y-3">
                        {/* Primary stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <Grid3X3 className="h-3 w-3" />
                                <span>{layout.metadata.dimensions.rows}×{layout.metadata.dimensions.columns}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Sprout className="h-3 w-3" />
                                <span>{layout.metadata.plantCount} plants</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(layout.metadata.lastModified)}</span>
                            </div>
                        </div>

                        {/* Dominant crops */}
                        {layout.metadata.dominantCrops.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {layout.metadata.dominantCrops.slice(0, 3).map((crop) => (
                                    <Badge
                                        key={crop}
                                        variant="secondary"
                                        className="bg-green-50 text-green-700 text-xs px-2 py-0.5 h-5"
                                    >
                                        {crop}
                                    </Badge>
                                ))}
                                {layout.metadata.dominantCrops.length > 3 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 h-5 text-gray-500"
                                    >
                                        +{layout.metadata.dominantCrops.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {layout.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {layout.metadata.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 h-5 border-gray-300"
                                    >
                                        #{tag}
                                    </Badge>
                                ))}
                                {layout.metadata.tags.length > 2 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 h-5 text-gray-500"
                                    >
                                        +{layout.metadata.tags.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Notes preview */}
                        {layout.notes && (
                            <div className="text-xs italic line-clamp-2 border-t pt-2">
                                "{layout.notes}"
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};