'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { parseGridData } from '@/lib/services/plannerService';
import { SavedLayout } from '@/types/layout';
import { useUnifiedGardenStore } from '@/hooks/useUnifiedGardenStore';
import { GridPreview } from '@/components/GridPreview';
import { CropSummaryComponent } from '@/components/CropSummaryComponent';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Download, Save, FileText, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { layoutService } from '@/lib/services/layoutService';

export default function GridPreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveAndLoadLayout, loadLayoutById, importPlantsFromGarden } = useUnifiedGardenStore();

  const layoutParam = searchParams.get('layout');
  const savedParam = searchParams.get('saved');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gardenData, setGardenData] = useState<import('@/types/layout').ParsedGardenData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<SavedLayout | null>(null);

  // Fields for saving a new layout
  const [layoutName, setLayoutName] = useState('');
  const [layoutNotes, setLayoutNotes] = useState('');
  const [layoutTags, setLayoutTags] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Redirect to tracker if no relevant param
  useEffect(() => {
    if (!layoutParam && !savedParam) {
      router.replace('/tracker');
    }
  }, [layoutParam, savedParam, router]);

  // Fetch garden data based on params
  useEffect(() => {
    const fetchData = async () => {
      if (!layoutParam && !savedParam) return;
      setLoading(true);
      setError(null);
      try {
        if (layoutParam) {
          const data = await parseGridData(layoutParam);
          setGardenData(data);
          // generate default name like before
          const dominantCrops = Object.entries(data.cropSummary.cropBreakdown)
            .sort(([, a]: any, [, b]: any) => b.total - a.total)
            .slice(0, 2)
            .map(([crop]) => crop);
          const defaultName = dominantCrops.length > 0 ? `${dominantCrops.join(' & ')} Garden` : `Garden Layout ${new Date().toLocaleDateString()}`;
          setLayoutName(defaultName);
        } else if (savedParam) {
          const res = layoutService.loadLayout(savedParam);
          if (!res.success) throw new Error(res.error?.message || 'Failed to load saved layout');
          setSelectedLayout(res.data!);
          setGardenData(res.data!.gardenData);
          setLayoutName(res.data!.metadata.name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse layout');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [layoutParam, savedParam]);

  const handleBack = useCallback(() => {
    router.push('/import');
  }, [router]);

  const handleSaveLayout = useCallback(async () => {
    if (!gardenData) return;
    try {
      setSaveLoading(true);
      setError(null);
      if (selectedLayout) {
        // loading existing saved layout
        const result = await loadLayoutById(selectedLayout.metadata.id);
        if (!result.success) {
          setError(result.error || 'Failed to load layout');
          return;
        }
      } else {
        const tags = layoutTags.trim() ? layoutTags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const result = await saveAndLoadLayout(layoutParam!, layoutName, { notes: layoutNotes.trim() || undefined, tags: tags.length > 0 ? tags : undefined });
        if (!result.success) {
          setError(result.error || 'Failed to save layout');
          return;
        }
      }
      router.push('/tracker');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process layout');
    } finally {
      setSaveLoading(false);
    }
  }, [gardenData, selectedLayout, layoutParam, layoutName, layoutNotes, layoutTags, loadLayoutById, saveAndLoadLayout, router]);

  const handleLoadWithoutSaving = async () => {
    if (!gardenData) return;
    try {
      setSaveLoading(true);
      setError(null);
      const plants: any[] = [];
      for (const [cropType, summary] of Object.entries(gardenData.cropSummary.cropBreakdown)) {
        for (let i = 0; i < (summary as any).total; i++) {
          plants.push({ id: `${cropType}-${i}`, name: cropType, needsWater: false });
        }
      }
      importPlantsFromGarden(plants, layoutParam || selectedLayout?.gardenData.saveCode, gardenData);
      router.push('/tracker');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layout');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!layoutParam && !savedParam) {
    return null; // redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading || !gardenData ? (
          <div className="text-foreground">{loading ? 'Loading preview…' : error || 'No data'}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <GridPreview gardenData={gardenData} className="w-full h-full" />
              </div>
              <div className="xl:col-span-1">
                <CropSummaryComponent cropSummary={gardenData.cropSummary} className="h-fit" hideWateringStatus={true} />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedLayout ? 'Load Layout' : 'Save Layout'}</CardTitle>
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
                      {selectedLayout.notes && <p className="text-sm mt-2 italic">"{selectedLayout.notes}"</p>}
                    </AlertDescription>
                  </Alert>
                )}

                {!selectedLayout && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="layout-name">Layout Name *</Label>
                      <Input id="layout-name" value={layoutName} onChange={e => setLayoutName(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="layout-notes">Notes (Optional)</Label>
                      <Textarea id="layout-notes" value={layoutNotes} onChange={e => setLayoutNotes(e.target.value)} rows={3} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="layout-tags">Tags (Optional)</Label>
                      <Input id="layout-tags" value={layoutTags} onChange={e => setLayoutTags(e.target.value)} placeholder="tag1, tag2" />
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
                  <Button variant="outline" onClick={handleBack} disabled={saveLoading}>Back</Button>
                  {!selectedLayout && (
                    <Button variant="outline" disabled={saveLoading} onClick={handleLoadWithoutSaving}>
                      <Download className="h-4 w-4 mr-2" />
                      {saveLoading ? 'Loading…' : 'Load Without Saving'}
                    </Button>
                  )}
                  <Button onClick={handleSaveLayout} disabled={saveLoading || (!selectedLayout && !layoutName.trim())} className={selectedLayout ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}>
                    {saveLoading ? 'Processing…' : selectedLayout ? (<><Download className="h-4 w-4 mr-2" />Load Layout</>) : (<><Save className="h-4 w-4 mr-2" />Save & Load Layout</>)}
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
