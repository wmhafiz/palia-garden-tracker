# Watering Components Documentation

This document describes the Phase 3 watering components that extend the Palia Garden Tracker with advanced watering functionality.

## Overview

The watering system consists of three main components that work together to provide comprehensive plant watering management:

1. **WateringGridPreview** - Visual grid display with watering controls
2. **WateringControls** - Control panel for bulk and individual watering actions
3. **Enhanced TileComponent** - Individual plant tiles with watering indicators

## Components

### WateringGridPreview

A specialized grid preview component that extends the base GridPreview functionality for watering interfaces.

#### Props

```typescript
interface WateringGridPreviewProps {
    className?: string;                    // Additional CSS classes
    showWateringControls?: boolean;        // Enable tile click interactions (default: true)
    onTileWater?: (                       // Custom tile water handler
        cropType: string, 
        plantId?: string, 
        row?: number, 
        col?: number
    ) => void;
    compactMode?: boolean;                 // Compact display mode (default: false)
}
```

#### Features

- **Responsive Design**: Adapts to screen sizes (sm/md/lg) with appropriate tile sizes
- **Interactive Tiles**: Click tiles to water individual plants or toggle bulk watering
- **Visual Indicators**: Clear distinction between watered/unwatered states
- **Mode Support**: Handles both individual and bulk watering modes
- **Custom Handlers**: Optional custom tile water event handling
- **Compact Mode**: Smaller display for sidebar or modal usage

#### Usage

```tsx
import { WateringGridPreview } from '@/components/WateringGridPreview';

// Basic usage
<WateringGridPreview />

// With custom handler
<WateringGridPreview
    showWateringControls={true}
    onTileWater={(cropType, plantId, row, col) => {
        console.log('Water tile:', { cropType, plantId, row, col });
    }}
/>

// Compact mode
<WateringGridPreview compactMode={true} />
```

### WateringControls

A comprehensive control panel for managing watering operations across all tracked crops.

#### Props

```typescript
interface WateringControlsProps {
    className?: string;           // Additional CSS classes
    compactMode?: boolean;        // Compact display mode (default: false)
    showModeToggle?: boolean;     // Show individual/bulk mode toggles (default: true)
    showStatistics?: boolean;     // Show watering statistics (default: true)
}
```

#### Features

- **Global Actions**: Water All/Water None buttons for bulk operations
- **Progress Tracking**: Visual progress bar and percentage indicators
- **Mode Switching**: Toggle between individual and bulk watering modes per crop
- **Statistics Display**: Comprehensive watering statistics and breakdowns
- **Responsive Layout**: Adapts to different screen sizes and compact mode
- **Loading States**: Visual feedback during operations

#### Usage

```tsx
import { WateringControls } from '@/components/WateringControls';

// Full featured
<WateringControls
    showModeToggle={true}
    showStatistics={true}
/>

// Compact mode
<WateringControls
    compactMode={true}
    showModeToggle={false}
    showStatistics={false}
/>
```

### Enhanced TileComponent

The base TileComponent has been enhanced with watering-specific visual states and indicators.

#### New Props

```typescript
interface TileComponentProps {
    // ... existing props
    wateringMode?: boolean;           // Enable watering-specific styling (default: false)
    showWateringIndicators?: boolean; // Show watering status indicators (default: true)
}
```

#### Enhanced Features

- **Watering Visual States**: Enhanced borders and backgrounds for watering mode
- **Interactive Feedback**: Improved hover effects for watering interactions
- **Status Indicators**: 
  - Red pulsing drop for plants needing water
  - Green checkmark for watered plants
  - Blue dot for individual watering mode
- **Enhanced Tooltips**: Additional watering action hints in tooltips

#### Usage

```tsx
import { TileComponent } from '@/components/TileComponent';

// Standard mode
<TileComponent tile={tile} />

// Watering mode with enhanced indicators
<TileComponent
    tile={tile}
    wateringMode={true}
    showWateringIndicators={true}
    onClick={handleTileClick}
/>
```

## Integration with Store

All components integrate seamlessly with the unified zustand store:

### Store Actions Used

- `waterAllCrops()` - Water all tracked crops
- `waterNoneCrops()` - Mark all crops as unwatered
- `setIndividualWateringMode(cropType, enabled)` - Toggle watering mode
- `togglePlantWateredById(cropType, plantId)` - Toggle individual plant
- `togglePlantWateredByPosition(cropType, row, col)` - Toggle by position
- `getWateringGridData()` - Get complete watering state

### Store State Used

- `trackedCrops` - All tracked crop data
- `isLoading` - Loading state for UI feedback
- Watering grid data through `getWateringGridData()`

## Responsive Design

All components implement responsive design patterns:

### Screen Size Breakpoints

- **Small (sm)**: < 640px - Mobile devices
- **Medium (md)**: 640px - 1024px - Tablets
- **Large (lg)**: > 1024px - Desktop

### Responsive Features

- **Tile Sizes**: Automatically calculated based on screen size and container
- **Layout Adaptation**: Grid layouts adapt to available space
- **Touch Friendly**: Larger touch targets on mobile devices
- **Compact Modes**: Alternative layouts for constrained spaces

## Accessibility

Components follow accessibility best practices:

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: High contrast indicators for visual clarity
- **Focus Management**: Clear focus indicators and logical tab order

## Error Handling

Robust error handling throughout:

- **Loading States**: Visual feedback during async operations
- **Error Messages**: Clear error messages for failed operations
- **Graceful Degradation**: Fallback displays when data is unavailable
- **Validation**: Input validation and type checking

## Performance Considerations

- **Memoization**: useMemo for expensive calculations
- **Efficient Updates**: Minimal re-renders through proper state management
- **Lazy Loading**: Components load only when needed
- **Optimized Rendering**: Efficient grid rendering for large gardens

## Example Integration

Here's how to integrate all components in a main tracker:

```tsx
import { WateringGridPreview } from '@/components/WateringGridPreview';
import { WateringControls } from '@/components/WateringControls';

export const MainTracker = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1">
                <WateringControls />
            </div>
            
            {/* Grid Preview */}
            <div className="lg:col-span-2">
                <WateringGridPreview />
            </div>
        </div>
    );
};
```

## Future Enhancements

Potential future improvements:

1. **Batch Operations**: Select multiple tiles for batch watering
2. **Watering Schedules**: Automated watering reminders
3. **Analytics**: Historical watering data and trends
4. **Export/Import**: Save and share watering configurations
5. **Mobile App**: Native mobile app integration

## Testing

Components include comprehensive testing considerations:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Store integration and data flow
- **Visual Tests**: Responsive design and accessibility
- **User Experience Tests**: Interaction flows and usability

## Troubleshooting

Common issues and solutions:

1. **Components not displaying**: Ensure store is initialized
2. **Click handlers not working**: Check showWateringControls prop
3. **Visual indicators missing**: Verify showWateringIndicators prop
4. **Responsive issues**: Check screen size detection logic
5. **Performance issues**: Monitor component re-renders and memoization