'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SavedLayout } from '@/types/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SavedLayoutsSection } from '@/components/SavedLayoutsSection';

export default function ImportPage() {
    const router = useRouter();
    const [importMode, setImportMode] = useState<'url' | 'saved'>('url');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = useCallback(async () => {
        if (!url.trim()) return;
        try {
            setLoading(true);
            setError(null);
            router.push(`/?layout=${encodeURIComponent(url.trim())}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to redirect');
        } finally {
            setLoading(false);
        }
    }, [url, router]);

    const handleSavedLayoutSelect = useCallback((layout: SavedLayout) => {
        router.push(`/?saved=${layout.metadata.id}`);
    }, [router]);

    const handleClose = useCallback(() => {
        router.push('/tracker');
    }, [router]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'url' | 'saved')} className="space-y-6">
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
                                    <p className="text-xs mt-1">Paste a Palia Garden Planner URL or save code directly</p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                                    <Button onClick={handleImport} disabled={loading || !url.trim()}>
                                        {loading ? 'Redirecting...' : 'Import & Preview'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="saved" className="space-y-6">
                        <SavedLayoutsSection onLayoutSelect={handleSavedLayoutSelect} className="w-full" showHeader={true} maxColumns={3} />
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}