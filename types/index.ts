export interface Plant {
    id: string;
    name: string;
    needsWater: boolean;
}

// Re-export layout types for convenience
export * from './layout';

// Re-export unified types for convenience
export * from './unified';

export * from './crop';

// Re-export individual plot tracking types
export * from './individual-plot';

// Re-export enhanced crop types
export * from './enhanced-crop';