'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CropWateringItem } from './CropWateringItem';
import { MigrationBanner } from './MigrationBanner';
import { GridPreviewTest } from './GridPreviewTest';
import { useUnifiedGardenStore, initializeUnifiedStore } from '@/hooks/useUnifiedGardenStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from './ui/scroll-area';

interface TimeData {
    clockTime: string;
    partOfDay: string;
    dayText: string;
    dialRotation: number;
    hours: number;
}

interface CycleWateringState {
    cycleHistory: Array<{
        cycleId: string;
        watered: boolean;
        timestamp: number;
        dayText: string;
    }>;
}

const CropListItem: React.FC<{
    crop: any;
    checked?: boolean;
    onCheck?: (checked: boolean) => void;
    onClick?: () => void;
    showCheckbox?: boolean;
    rightContent?: React.ReactNode;
}> = ({ crop, checked, onCheck, onClick, showCheckbox, rightContent }) => (
    <label
        className={`flex items-center space-x-3 py-2 cursor-pointer border-b border-border last:border-b-0 ${onClick ? 'hover:bg-accent transition' : ''}`}
        onClick={onClick}
        style={onClick ? { cursor: 'pointer' } : {}}
    >
        {showCheckbox && (
            <Checkbox
                checked={checked}
                onCheckedChange={(checked) => {
                    onCheck && onCheck(checked as boolean);
                }}
                onClick={(e) => e.stopPropagation()}
            />
        )}
        <img src={crop.picture_url} alt={crop.name} className="w-12 h-12 object-contain rounded bg-secondary border border-border" />
        <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{crop.name}</div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 mt-1">
                <span>⏱ {crop.harvest_time}</span>
                <span>💰 {crop.base_value}/{crop.star_value}</span>
                <span>🌱 {crop.garden_buff}</span>
                <span>🏷 {crop.group}</span>
            </div>
        </div>
        {rightContent}
    </label>
);

export const MainTracker: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showGridPreviewTest, setShowGridPreviewTest] = useState(false);
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    const [cycleWateringState, setCycleWateringState] = useState<CycleWateringState>({
        cycleHistory: []
    });

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [allCrops, setAllCrops] = useState<any[]>([]);
    const [tempSelectedCrops, setTempSelectedCrops] = useState<string[] | null>(null);
    const [filterBuff, setFilterBuff] = useState('');
    const [filterRarity, setFilterRarity] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterPrice, setFilterPrice] = useState([0, 999]);
    const [showMigrationBanner, setShowMigrationBanner] = useState(true);

    // Use unified store
    const {
        trackedCrops,
        dailyWateringState,
        isInitialized,
        addCropManually,
        removeCrop,
        toggleCropWatered,
        waterAllCrops,
        waterNoneCrops,
        resetDailyWatering
    } = useUnifiedGardenStore();

    // Handle mounting for hydration safety
    useEffect(() => {
        setMounted(true);

        // Load localStorage data after mounting
        const saved = localStorage.getItem('paliaCycleWateringState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Validate structure
                if (
                    typeof parsed === 'object' &&
                    parsed !== null &&
                    Array.isArray(parsed.cycleHistory)
                ) {
                    setCycleWateringState(parsed);
                }
            } catch (e) {
                // If parsing fails, reset localStorage
                localStorage.removeItem('paliaCycleWateringState');
            }
        }
    }, []);

    // Initialize unified store on mount
    useEffect(() => {
        if (mounted) {
            initializeUnifiedStore();
        }
    }, [mounted]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 250); // Update every 250ms for smooth animation

        return () => clearInterval(interval);
    }, []);

    const timeData = useMemo((): TimeData & { weekIdentifier: string; dayOfWeek: number; cycleId: string } => {
        // Convert real-world time to Palia time base (PST)
        const PST_UTC_SUNDAY_OFFSET = 60 * 60 * (8 + 3 * 24); // 8 hours PST + 3 days offset
        const realTimePST = currentTime / 1000 - PST_UTC_SUNDAY_OFFSET;

        // One Palia day = 1 real-world hour
        // Palia time runs 24x faster than real time
        const palianTimeOfDay = (realTimePST * 24) % (24 * 60 * 60); // seconds in a day

        // Convert to hours and minutes for display
        const palianMinutes = Math.floor(palianTimeOfDay / 60);
        const hours = Math.floor(palianMinutes / 60);
        const minutes = palianMinutes % 60;
        const clockTime = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;

        // Week starts Sunday 9 PM PST
        const timeSincePSTWeek = (realTimePST - 21 * 3600) % (7 * 24 * 3600);
        const palianCycleThisWeek = timeSincePSTWeek / 3600;
        const palianDayThisWeek = Math.floor(palianCycleThisWeek / 24);
        const palianCycleThisDay = Math.floor(palianCycleThisWeek) % 24;

        const dayText = `Day ${palianDayThisWeek + 1} Cycle ${(palianCycleThisDay + 1)
            .toString()
            .padStart(2, "0")}`;

        // Calculate week identifier for weekly reset
        const weekNumber = Math.floor((realTimePST - 21 * 3600) / (7 * 24 * 3600));
        const weekIdentifier = `week-${weekNumber}`;

        // Calculate cycle identifier (unique for each cycle)
        const totalCycles = Math.floor(realTimePST / 3600);
        const cycleId = `cycle-${totalCycles}`;

        // Determine time period
        const getPartOfDay = (hours: number): string => {
            if (hours >= 21 || hours < 3) return "Night"; // 21:00 - 03:00
            if (hours >= 18) return "Evening"; // 18:00 - 21:00
            if (hours >= 6) return "Day"; // 06:00 - 18:00
            return "Morning"; // 03:00 - 06:00
        };

        const partOfDay = getPartOfDay(hours);

        // Pointer rotation: 6 AM should point to left (180°), 12 PM to top (270°), 18 PM to right (0°)
        // Since Day period (6-18) spans from left (180°) to right (0°/360°) going through top
        // We need to map 6 AM = 180°, so subtract 6 hours worth of rotation
        const dialRotation = (360 * palianTimeOfDay) / (24 * 60 * 60) + 90;

        return {
            clockTime,
            partOfDay,
            dayText,
            dialRotation,
            hours,
            weekIdentifier,
            dayOfWeek: palianDayThisWeek,
            cycleId
        };
    }, [currentTime]);

    useEffect(() => {
        fetch('/crops.json')
            .then(res => res.json())
            .then(data => setAllCrops(data.sort((a: any, b: any) => a.base_value - b.base_value)));
    }, []);

    // Handle daily reset logic with unified store
    useEffect(() => {
        if (!isInitialized) return;

        const currentDay = timeData.dayText;
        const isNewDay = currentDay !== dailyWateringState.lastResetDay;
        const is6amOrLater = timeData.hours >= 6;

        if (isNewDay && is6amOrLater) {
            resetDailyWatering(currentDay);
        }
    }, [timeData.dayText, timeData.hours, dailyWateringState.lastResetDay, isInitialized, resetDailyWatering]);

    useEffect(() => {
        if (mounted && typeof window !== 'undefined') {
            localStorage.setItem('paliaCycleWateringState', JSON.stringify(cycleWateringState));
        }
    }, [cycleWateringState, mounted]);

    // Update document title
    useEffect(() => {
        if (mounted && typeof document !== 'undefined') {
            document.title = `${timeData.clockTime} - ${timeData.partOfDay} - Palia Clock`;
        }
    }, [timeData.clockTime, timeData.partOfDay, mounted]);


    const getCycleProgress = (): number => {
        const wateredCycles = cycleWateringState.cycleHistory.filter(cycle => cycle.watered).length;
        return Math.round((wateredCycles / 5) * 100);
    };

    const getCurrentCycleStatus = (): boolean => {
        return cycleWateringState.cycleHistory.some(cycle => cycle.cycleId === timeData.cycleId && cycle.watered);
    };

    const openCropModal = useCallback(() => {
        setTempSelectedCrops(trackedCrops.map(crop => crop.cropType));
        setIsCropModalOpen(true);
    }, [trackedCrops]);

    const closeCropModal = useCallback(() => setIsCropModalOpen(false), []);

    const handleTrackedCropsChange = (newTracked: string[]) => {
        const currentCropTypes = trackedCrops.map(crop => crop.cropType);

        // Add new crops
        const toAdd = newTracked.filter(cropType => !currentCropTypes.includes(cropType));
        toAdd.forEach(cropType => addCropManually(cropType));

        // Remove crops that are no longer selected
        const toRemove = currentCropTypes.filter(cropType => !newTracked.includes(cropType));
        toRemove.forEach(cropType => removeCrop(cropType));
    };

    // Helper to get unique values for dropdowns
    const unique = (arr: any[], key: string): string[] => Array.from(new Set(arr.map((item: any) => String(item[key])))).filter(Boolean) as string[];

    // Filtered crops for modal
    const filteredCrops = allCrops.filter(crop => {
        return (
            (!filterBuff || crop.garden_buff === filterBuff) &&
            (!filterRarity || crop.rarity === filterRarity) &&
            (!filterGroup || crop.group === filterGroup) &&
            crop.base_value >= filterPrice[0] && crop.base_value <= filterPrice[1]
        );
    });

    // Helper to update cycle status based on watered crops
    const updateCycleStatus = useCallback(() => {
        const allWatered = trackedCrops.length > 0 && trackedCrops.every(crop => crop.isWatered);
        setCycleWateringState(prev => {
            const exists = prev.cycleHistory.some(c => c.cycleId === timeData.cycleId);
            let newHistory;
            if (exists) {
                newHistory = prev.cycleHistory.map(c =>
                    c.cycleId === timeData.cycleId ? { ...c, watered: allWatered } : c
                );
            } else {
                newHistory = [
                    { cycleId: timeData.cycleId, watered: allWatered, timestamp: Date.now(), dayText: timeData.dayText },
                    ...prev.cycleHistory.slice(0, 4)
                ];
            }
            return { ...prev, cycleHistory: newHistory };
        });
    }, [trackedCrops, timeData.cycleId, timeData.dayText]);

    // Update cycle status when crops change
    useEffect(() => {
        if (isInitialized && trackedCrops.length > 0) {
            updateCycleStatus();
        }
    }, [trackedCrops, isInitialized, updateCycleStatus]);

    // Handle import from planner
    const handleImportFromPlanner = useCallback(() => {
        router.push('/import');
    }, [router]);

    // Check URL for test mode
    useEffect(() => {
        if (mounted && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('test') === 'grid') {
                setShowGridPreviewTest(true);
            }
        }
    }, [mounted]);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    // Show test component if requested
    if (showGridPreviewTest) {
        return <GridPreviewTest />;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Migration Banner */}
            {showMigrationBanner && (
                <MigrationBanner onMigrationComplete={() => setShowMigrationBanner(false)} />
            )}

            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-3 px-2 sm:px-4">
                {/* Clock SVG - hidden on small screens */}
                <div>
                    <Card>
                        <CardContent className="p-6">
                            <svg
                                viewBox="0 0 200 200"
                                className="w-full h-full"
                                aria-label="Palia Clock"
                            >
                                {/* Define gradients and effects */}
                                <defs>
                                    <radialGradient id="dayGradient" cx="50%" cy="30%">
                                        <stop offset="0%" stopColor="#E6F3FF" />
                                        <stop offset="40%" stopColor="#87CEEB" />
                                        <stop offset="100%" stopColor="#4A90E2" />
                                    </radialGradient>
                                    <radialGradient id="morningGradient" cx="20%" cy="80%">
                                        <stop offset="0%" stopColor="#FFF8DC" />
                                        <stop offset="50%" stopColor="#FFE55C" />
                                        <stop offset="100%" stopColor="#DAA520" />
                                    </radialGradient>
                                    <radialGradient id="eveningGradient" cx="80%" cy="80%">
                                        <stop offset="0%" stopColor="#FFE4B5" />
                                        <stop offset="50%" stopColor="#FFB347" />
                                        <stop offset="100%" stopColor="#FF8C00" />
                                    </radialGradient>
                                    <radialGradient id="nightGradient" cx="50%" cy="90%">
                                        <stop offset="0%" stopColor="#483D8B" />
                                        <stop offset="50%" stopColor="#2F2F4F" />
                                        <stop offset="100%" stopColor="#191970" />
                                    </radialGradient>
                                    <radialGradient id="centerGradient" cx="50%" cy="40%">
                                        <stop offset="0%" stopColor="#B8B8B8" />
                                        <stop offset="70%" stopColor="#808080" />
                                        <stop offset="100%" stopColor="#606060" />
                                    </radialGradient>
                                    <linearGradient id="metalBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#E0E0E0" />
                                        <stop offset="30%" stopColor="#C0C0C0" />
                                        <stop offset="70%" stopColor="#808080" />
                                        <stop offset="100%" stopColor="#404040" />
                                    </linearGradient>
                                    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                                    </filter>
                                </defs>

                                {/* Outer Ring - Metallic Border */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="95"
                                    fill="none"
                                    stroke="url(#metalBorder)"
                                    strokeWidth="3"
                                />

                                {/* Time Period Segments with Gradients */}
                                {/* Day: 06:00-18:00 - Top half with sky gradient */}
                                <path
                                    d="M 100 100 L 10 100 A 90 90 0 1 1 190 100 Z"
                                    fill="url(#dayGradient)"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="0.5"
                                />

                                {/* Morning: 03:00-06:00 - Bottom left with sunrise gradient */}
                                <path
                                    d="M 100 100 L 36.36 163.64 A 90 90 0 0 1 10 100 Z"
                                    fill="url(#morningGradient)"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="0.5"
                                />

                                {/* Evening: 18:00-21:00 - Bottom right with sunset gradient */}
                                <path
                                    d="M 100 100 L 190 100 A 90 90 0 0 1 163.64 163.64 Z"
                                    fill="url(#eveningGradient)"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="0.5"
                                />

                                {/* Night: 21:00-03:00 - Bottom center with night gradient */}
                                <path
                                    d="M 100 100 L 163.64 163.64 A 90 90 0 0 1 36.36 163.64 Z"
                                    fill="url(#nightGradient)"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="0.5"
                                />

                                {/* Sun Icon - Day period */}
                                <g transform="translate(100, 40)" filter="url(#dropShadow)">
                                    <circle cx="0" cy="0" r="8" fill="#FFF8DC" stroke="#FFD700" strokeWidth="1" />
                                    <circle cx="0" cy="0" r="6" fill="#FFE55C" />
                                    {/* Sun rays */}
                                    {Array.from({ length: 8 }, (_, i) => {
                                        const angle = (i * 45) * Math.PI / 180;
                                        const x1 = Math.cos(angle) * 12;
                                        const y1 = Math.sin(angle) * 12;
                                        const x2 = Math.cos(angle) * 16;
                                        const y2 = Math.sin(angle) * 16;
                                        return (
                                            <line
                                                key={i}
                                                x1={x1}
                                                y1={y1}
                                                x2={x2}
                                                y2={y2}
                                                stroke="#FFD700"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        );
                                    })}
                                </g>

                                {/* Moon Icon - Night period */}
                                <g transform="translate(100, 160)" filter="url(#dropShadow)">
                                    <circle cx="0" cy="0" r="8" fill="#F0F8FF" stroke="#D3D3D3" strokeWidth="1" />
                                    <circle cx="3" cy="-2" r="6" fill="#2F2F4F" opacity="0.8" />
                                    {/* Stars around moon */}
                                    <g fill="#FFE55C" fontSize="4">
                                        <text x="-15" y="-8" textAnchor="middle">✦</text>
                                        <text x="12" y="-5" textAnchor="middle">✦</text>
                                        <text x="-8" y="12" textAnchor="middle">✦</text>
                                    </g>
                                </g>

                                {/* Inner Circle with Gradient and Shadow */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="45"
                                    fill="url(#centerGradient)"
                                    stroke="rgba(255,255,255,0.6)"
                                    strokeWidth="1"
                                    filter="url(#dropShadow)"
                                />

                                {/* Clock Pointer - Enhanced triangle with glow */}
                                <polygon
                                    points="100,15 95,5 105,5"
                                    fill="#2C2C2C"
                                    stroke="#FFD700"
                                    strokeWidth="1.5"
                                    transform={`rotate(${timeData.dialRotation + 90} 100 100)`}
                                    className="transition-transform duration-200 ease-out"
                                    filter="url(#dropShadow)"
                                />

                                {/* Center Text with better styling */}
                                <text
                                    x="100"
                                    y="85"
                                    textAnchor="middle"
                                    className="fill-white font-bold text-xs"
                                    style={{
                                        fontSize: '10px',
                                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
                                    }}
                                >
                                    {timeData.partOfDay}
                                </text>
                                <text
                                    x="100"
                                    y="100"
                                    textAnchor="middle"
                                    className="fill-white font-bold text-lg"
                                    style={{
                                        fontSize: '16px',
                                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
                                    }}
                                >
                                    {timeData.clockTime}
                                </text>
                                <text
                                    x="100"
                                    y="115"
                                    textAnchor="middle"
                                    className="fill-white font-medium text-xs"
                                    style={{
                                        fontSize: '8px',
                                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
                                    }}
                                >
                                    {timeData.dayText}
                                </text>
                            </svg>
                        </CardContent>
                    </Card>
                    {/* Legend - responsive row/column */}
                    <div className="mt-6 grid grid-cols-2 gap-2 text-sm max-w-[300px] mx-auto">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <span className="text-foreground">Morning (3-6)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-sky-300"></div>
                            <span className="text-foreground">Day (6-18)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-foreground">Evening (18-21)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-900 border border-indigo-300"></div>
                            <span className="text-foreground">Night (21-3)</span>
                        </div>
                    </div>
                </div>

                {/* Crop Watering Tracker */}
                <Card className="mt-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">🌱 Daily Crop Watering</CardTitle>
                            <div className="text-sm text-muted-foreground">Resets at 6:00 AM</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {trackedCrops.length === 0 ? (
                            <div className="text-muted-foreground text-center py-4">No crops tracked. </div>
                        ) : (
                            <>
                                <div className="flex justify-end gap-2 mb-2">
                                    <Button
                                        size="sm"
                                        className="bg-green-600/80 hover:bg-green-700"
                                        onClick={() => {
                                            waterAllCrops();
                                            updateCycleStatus();
                                        }}
                                    >Water All</Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-gray-400/80 hover:bg-gray-500"
                                        onClick={() => {
                                            waterNoneCrops();
                                            updateCycleStatus();
                                        }}
                                    >Water None</Button>
                                </div>
                                <div className="space-y-2">
                                    <ScrollArea className="h-[500px]">
                                        {trackedCrops.map(trackedCrop => {
                                            const cropData = allCrops.find(c => c.name === trackedCrop.cropType);
                                            return (
                                                <CropWateringItem
                                                    key={trackedCrop.cropType}
                                                    trackedCrop={trackedCrop}
                                                    cropData={cropData}
                                                    onToggle={() => {
                                                        toggleCropWatered(trackedCrop.cropType);
                                                        updateCycleStatus();
                                                    }}
                                                    showDetails={true}
                                                />
                                            );
                                        })}
                                    </ScrollArea>
                                </div>
                            </>
                        )}
                        <div className="mt-3 text-center space-x-4">
                            <Button variant="link" onClick={openCropModal}>Manage Tracked Crops</Button>
                            <Button variant="link" onClick={handleImportFromPlanner}>Import from Planner</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Last 5 Cycles Watering Status */}
                <div>
                    <Card className="mt-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">🔄 Last 5 Cycles Status</CardTitle>
                                <div className="text-sm text-muted-foreground">
                                    {getCycleProgress()}% Complete
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Progress Bar */}
                            <div className="mb-4 bg-secondary rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
                                    style={{ width: `${getCycleProgress()}%` }}
                                ></div>
                            </div>
                            {/* Cycle History Grid */}
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: 5 }, (_, index) => {
                                    const cycleEntry = cycleWateringState.cycleHistory[index];
                                    const isCurrentCycle = cycleEntry?.cycleId === timeData.cycleId;
                                    const isWatered = cycleEntry?.watered || false;

                                    return (
                                        <div
                                            key={index}
                                            className={`relative p-3 rounded-lg text-center transition-all duration-200 ${isCurrentCycle
                                                ? 'bg-primary/10 border-2 border-primary/50 ring-2 ring-primary/20'
                                                : 'bg-secondary border border-border'
                                                }`}
                                        >
                                            <div className="text-xs font-medium text-muted-foreground mb-2">
                                                {cycleEntry ? cycleEntry.dayText.split(' ').slice(-2).join(' ') : `C${index + 1}`}
                                            </div>
                                            <div className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isWatered
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : isCurrentCycle
                                                    ? 'border-primary text-primary'
                                                    : 'border-muted-foreground text-muted-foreground'
                                                }`}>
                                                {isWatered ? '✓' : cycleEntry ? '○' : '-'}
                                            </div>
                                            {isCurrentCycle && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Cycle Summary */}
                            <div className="mt-4 p-3 bg-secondary rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">
                                        Cycles Watered: {cycleWateringState.cycleHistory.filter(cycle => cycle.watered).length}/5
                                    </span>
                                    <span className="text-foreground">
                                        Current: {getCurrentCycleStatus() ? 'Watered' : 'Not Watered'}
                                    </span>
                                </div>
                                {getCycleProgress() === 100 && (
                                    <div className="mt-2 p-2 bg-green-600/20 border border-green-500/30 rounded text-center">
                                        <span className="text-green-600 font-medium text-sm">🎉 Perfect! Last 5 cycles all watered!</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Crop Modal */}
            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogContent className="max-w-lg w-full">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Select Crops to Track</DialogTitle>
                    </DialogHeader>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Select value={filterBuff} onValueChange={setFilterBuff}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All Buffs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Buffs</SelectItem>
                                {unique(allCrops, 'garden_buff').map(buff => (
                                    <SelectItem key={String(buff)} value={String(buff)}>{String(buff)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterRarity} onValueChange={setFilterRarity}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All Rarities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Rarities</SelectItem>
                                {unique(allCrops, 'rarity').map(rarity => (
                                    <SelectItem key={String(rarity)} value={String(rarity)}>{String(rarity)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterGroup} onValueChange={setFilterGroup}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All Groups" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Groups</SelectItem>
                                {unique(allCrops, 'group').map(group => (
                                    <SelectItem key={String(group)} value={String(group)}>{String(group)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">💰</span>
                            <Slider
                                value={[filterPrice[0]]}
                                onValueChange={(value) => setFilterPrice([value[0], filterPrice[1]])}
                                max={Math.max(...allCrops.map(c => c.base_value))}
                                min={Math.min(...allCrops.map(c => c.base_value))}
                                step={1}
                                className="w-16"
                            />
                            <Slider
                                value={[filterPrice[1]]}
                                onValueChange={(value) => setFilterPrice([filterPrice[0], value[0]])}
                                max={Math.max(...allCrops.map(c => c.base_value))}
                                min={Math.min(...allCrops.map(c => c.base_value))}
                                step={1}
                                className="w-16"
                            />
                            <span className="text-xs text-foreground">{filterPrice[0]} - {filterPrice[1]}</span>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                setFilterBuff('');
                                setFilterRarity('');
                                setFilterGroup('');
                                setFilterPrice([Math.min(...allCrops.map(c => c.base_value)), Math.max(...allCrops.map(c => c.base_value))]);
                            }}
                        >Reset Filter</Button>
                    </div>
                    {/* Tick All / None */}
                    <div className="flex gap-2 mb-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setTempSelectedCrops([])}
                        >Tick None</Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                if (filterBuff || filterRarity || filterGroup || filterPrice[0] !== Math.min(...allCrops.map(c => c.base_value)) || filterPrice[1] !== Math.max(...allCrops.map(c => c.base_value))) {
                                    setTempSelectedCrops(filteredCrops.map(c => c.name));
                                } else {
                                    setTempSelectedCrops(allCrops.map(c => c.name));
                                }
                            }}
                        >Tick All</Button>
                        <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => setTempSelectedCrops(["Rice", "Tomato", "Wheat", "Potato"])}
                        >Tick Default</Button>
                        <Button
                            size="sm"
                            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                            onClick={() => setTempSelectedCrops(trackedCrops.map(c => c.cropType))}
                        >Reset</Button>
                    </div>
                    <div className="max-h-72 overflow-y-auto mb-4">
                        {allCrops.length === 0 ? (
                            <div className="text-muted-foreground">Loading crops...</div>
                        ) : (
                            <div>
                                {filteredCrops.map((crop: any) => (
                                    <CropListItem
                                        key={crop.name}
                                        crop={crop}
                                        checked={!!tempSelectedCrops?.includes(crop.name)}
                                        onCheck={checked => {
                                            setTempSelectedCrops(prev => {
                                                if (!prev) prev = trackedCrops.map(c => c.cropType);
                                                if (checked) {
                                                    return [...prev, crop.name];
                                                } else {
                                                    return prev.filter((name: string) => name !== crop.name);
                                                }
                                            });
                                        }}
                                        showCheckbox
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        <Button
                            variant="secondary"
                            onClick={closeCropModal}
                        >Cancel</Button>
                        <Button
                            onClick={() => {
                                handleTrackedCropsChange(tempSelectedCrops ?? trackedCrops.map(c => c.cropType));
                                closeCropModal();
                            }}
                        >Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};