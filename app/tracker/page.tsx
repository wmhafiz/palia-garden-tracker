'use client';

import { useUnifiedGardenStore, initializeUnifiedStore } from '@/hooks/useUnifiedGardenStore';
import { MainTracker } from '@/components/MainTracker';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function TrackerPage() {
    const { trackedCrops, isInitialized } = useUnifiedGardenStore();
    const router = useRouter();

    React.useEffect(() => {
        // ensure persisted data is loaded once the component mounts
        initializeUnifiedStore();
    }, []);

    // Optional: simple loading state while store initialises
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <span className="text-foreground">Loading tracker…</span>
            </div>
        );
    }

    // If store initialised but still no crops, encourage the user to import a layout
    if (trackedCrops.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-foreground text-center max-w-md">
                    No layout loaded yet
                </h1>
                <Button onClick={() => router.push('/import')} className="bg-primary hover:bg-primary/90">
                    Go to Import Page
                </Button>
            </div>
        );
    }

    // Otherwise show the full tracker UI
    return <MainTracker />;
} 