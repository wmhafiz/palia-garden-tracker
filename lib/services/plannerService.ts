import { v4 as uuidv4 } from 'uuid';
import { Plant } from '../../types/index';
import {
    ParsedGardenData,
    GridTile,
    CropSummary
} from '../../types/layout';

/**
 * Correct crop code mappings from the Palia Garden Planner v0.4
 * Based on palia-tools/assets/scripts/garden-planner/enums/cropCode.ts
 */
const CROP_MAPPINGS: { [key: string]: string } = {
    'N': 'None',
    'T': 'Tomato',
    'P': 'Potato',
    'R': 'Rice',
    'W': 'Wheat',
    'C': 'Carrot',
    'O': 'Onion',
    'Co': 'Cotton',
    'B': 'Blueberry',
    'A': 'Apple',
    'Cr': 'Corn',
    'S': 'Spicy Pepper',
    'Cb': 'Napa Cabbage',
    'Bk': 'Bok Choy',
    'Pm': 'Rockhopper Pumpkin',
    'Bt': 'Batterfly Bean'
};

/**
 * Fertilizer code mappings from the Palia Garden Planner
 */
const FERTILIZER_MAPPINGS: { [key: string]: string } = {
    'N': 'None',
    'S': 'Speedy Gro',
    'Q': 'Quality Up',
    'W': 'Weed Block',
    'H': 'Harvest Boost',
    'Y': 'Hydrate Pro'
};

// ============================================================================
// LEGACY SAVE CODE VERSION CONVERSION SYSTEM
// ============================================================================

/**
 * Legacy crop code mappings for version conversion
 */
const v0_1CropCodes: { [key: string]: string } = {
    'Na': 'N',    // None
    'To': 'T',    // Tomato
    'Po': 'P',    // Potato
    'Ri': 'R',    // Rice
    'Wh': 'W',    // Wheat
    'Ca': 'C',    // Carrot
    'On': 'O',    // Onion
    'Co': 'Co',   // Cotton (unchanged)
    'Bl': 'B',    // Blueberry
    'Ap': 'A',    // Apple
    'Cr': 'Cr',   // Corn (Note: Original had conflict, using Cr for consistency)
};

const v0_2CropCodes: { [key: string]: string } = {
    'N': 'N',     // None
    'T': 'T',     // Tomato
    'P': 'P',     // Potato
    'R': 'R',     // Rice
    'W': 'W',     // Wheat
    'C': 'C',     // Carrot
    'O': 'O',     // Onion
    'Co': 'Co',   // Cotton
    'B': 'B',     // Blueberry
    'A': 'A',     // Apple
    'Cr': 'Cr',   // Corn
    'S': 'S',     // Spicy Pepper
};

const v0_3CropCodes: { [key: string]: string } = {
    'N': 'N',     // None
    'T': 'T',     // Tomato
    'P': 'P',     // Potato
    'R': 'R',     // Rice
    'W': 'W',     // Wheat
    'C': 'C',     // Carrot
    'O': 'O',     // Onion
    'Co': 'Co',   // Cotton
    'B': 'B',     // Blueberry
    'A': 'A',     // Apple
    'Cr': 'Cr',   // Corn
    'S': 'S',     // Spicy Pepper
    'Cb': 'Cb',   // Napa Cabbage
    'Bk': 'Bk',   // Bok Choy
    'Pm': 'Pm',   // Rockhopper Pumpkin
    'Bt': 'Bt',   // Batterfly Bean
};

const v0_4CropCodes: { [key: string]: string } = {
    'N': 'N',     // None
    'T': 'T',     // Tomato
    'P': 'P',     // Potato
    'R': 'R',     // Rice
    'W': 'W',     // Wheat
    'C': 'C',     // Carrot
    'O': 'O',     // Onion
    'Co': 'Co',   // Cotton
    'B': 'B',     // Blueberry
    'A': 'A',     // Apple
    'Cr': 'Cr',   // Corn
    'S': 'S',     // Spicy Pepper
    'Cb': 'Cb',   // Napa Cabbage
    'Bk': 'Bk',   // Bok Choy
    'Pm': 'Pm',   // Rockhopper Pumpkin
    'Bt': 'Bt',   // Batterfly Bean
};

const v0_2FertCodes: { [key: string]: string } = {
    'N': 'N',     // None
    'S': 'S',     // Speedy Gro
    'Q': 'Q',     // Quality Up
    'W': 'W',     // Weed Block
    'H': 'H',     // Harvest Boost
    'Y': 'Y',     // Hydrate Pro
};

const v0_3FertCodes: { [key: string]: string } = {
    'N': 'N',     // None
    'S': 'S',     // Speedy Gro
    'Q': 'Q',     // Quality Up
    'W': 'W',     // Weed Block
    'H': 'H',     // Harvest Boost
    'Y': 'Y',     // Hydrate Pro
};

/**
 * Helper function to get crop code key by value
 */
function getCropCode(codeMap: { [key: string]: string }, value: string): string | undefined {
    return Object.keys(codeMap).find(key => codeMap[key] === value);
}

/**
 * Helper function to get fertilizer code key by value
 */
function getFertCode(codeMap: { [key: string]: string }, value: string): string | undefined {
    return Object.keys(codeMap).find(key => codeMap[key] === value);
}

/**
 * Detects the version of a save code
 * @param saveCode - The save code to analyze
 * @returns Version string (e.g., "0.1", "0.2", "0.3", "0.4")
 */
function detectSaveCodeVersion(saveCode: string): string {
    const versionMatch = saveCode.match(/^v(\d+\.\d+)/);
    if (versionMatch) {
        return versionMatch[1];
    }

    // If no version prefix, assume it's a very old format
    throw new Error('Invalid save code format - no version information found');
}

/**
 * Converts v0.1 save code to v0.2 format
 * @param save - v0.1 format save code
 * @returns v0.2 format save code
 */
function convertV01ToV02(save: string): string {
    console.log(`🔄 Converting v0.1 to v0.2: ${save}`);

    // Extract the crop section
    let newSave = save.replace("CROPS-", "");

    // Convert crop codes
    for (const [oldCode, newCode] of Object.entries(v0_1CropCodes)) {
        const regex = new RegExp(oldCode, 'g');
        newSave = newSave.replace(regex, newCode);
    }

    const result = `CROPS-${newSave}`;
    console.log(`✅ v0.1 → v0.2 conversion result: ${result}`);
    return result;
}

/**
 * Converts v0.2 save code to v0.3 format
 * @param save - v0.2 format save code
 * @returns v0.3 format save code
 */
function convertV02ToV03(save: string): string {
    console.log(`🔄 Converting v0.2 to v0.3: ${save}`);

    const cropSection = save.replace("CROPS-", "");
    const cropSections = cropSection.split('-');
    const regex = /([A-Z][a-z]?)(?:\.([A-Z][a-z]?))?/g;

    let newCode = '';
    for (let i = 0; i < cropSections.length; i++) {
        let newSection = '';
        let match;
        const sectionRegex = new RegExp(regex.source, 'g');

        while ((match = sectionRegex.exec(cropSections[i])) !== null) {
            const cropKey = getCropCode(v0_2CropCodes, match[1]) ?? 'N';
            const crop = v0_3CropCodes[cropKey] || 'N';
            const fertKey = match[2] ? (getFertCode(v0_2FertCodes, match[2]) ?? 'N') : 'N';
            const fertiliser = v0_3FertCodes[fertKey] || 'N';

            newSection += `${crop}${(fertiliser && fertiliser !== 'N') ? '.' + fertiliser : ''}`;
        }

        if (i < cropSections.length - 1) newSection += '-';
        newCode += newSection;
    }

    const result = `CR-${newCode}`;
    console.log(`✅ v0.2 → v0.3 conversion result: ${result}`);
    return result;
}

/**
 * Converts v0.3 save code to v0.4 format
 * @param save - v0.3 format save code
 * @returns v0.4 format save code
 */
function convertV03ToV04(save: string): string {
    console.log(`🔄 Converting v0.3 to v0.4: ${save}`);

    const cropSections = save.split('-');
    if (["CR", "CROPS"].includes(cropSections[0])) {
        cropSections.shift();
    }

    const regex = /([A-Z][a-z]?)(?:\.([A-Z][a-z]?))?/g;
    let newCode = '';

    for (let i = 0; i < cropSections.length; i++) {
        let newSection = '';
        let match;
        const sectionRegex = new RegExp(regex.source, 'g');

        while ((match = sectionRegex.exec(cropSections[i])) !== null) {
            const cropKey = getCropCode(v0_3CropCodes, match[1]) ?? 'N';
            const crop = v0_4CropCodes[cropKey] || 'N';
            const fertiliser = match[2] ?? 'N';

            newSection += `${crop}${(fertiliser && fertiliser !== 'N') ? '.' + fertiliser : ''}`;
        }

        if (i < cropSections.length - 1) newSection += '-';
        newCode += newSection;
    }

    const result = `CR-${newCode}`;
    console.log(`✅ v0.3 → v0.4 conversion result: ${result}`);
    return result;
}

/**
 * Main function to convert legacy save codes to v0.4 format
 * @param saveCode - Save code in any supported version (v0.1 - v0.4)
 * @returns Save code converted to v0.4 format
 * @throws Error if version is unsupported or conversion fails
 */
export function convertLegacySaveCode(saveCode: string): string {
    console.log(`🔍 Converting legacy save code: ${saveCode.substring(0, 100)}...`);

    try {
        let currentCode = saveCode;
        let version = detectSaveCodeVersion(currentCode);

        console.log(`📝 Detected version: v${version}`);

        // If already v0.4, return as-is
        if (version === '0.4') {
            console.log(`✅ Already v0.4 format, no conversion needed`);
            return currentCode;
        }

        // Convert through version chain: v0.1 → v0.2 → v0.3 → v0.4
        while (version !== '0.4') {
            const oldVersion = version;

            switch (version) {
                case '0.1':
                    // Extract the crop section for v0.1 conversion
                    const parts = currentCode.split('_');
                    if (parts.length >= 3) {
                        const convertedCrops = convertV01ToV02(parts[2]);
                        currentCode = `v0.2_${parts[1]}_${convertedCrops}${parts[3] ? '_' + parts[3] : ''}`;
                    } else {
                        throw new Error('Invalid v0.1 save code format');
                    }
                    version = '0.2';
                    break;

                case '0.2':
                    // Extract the crop section for v0.2 conversion
                    const parts02 = currentCode.split('_');
                    if (parts02.length >= 3) {
                        const convertedCrops = convertV02ToV03(parts02[2]);
                        currentCode = `v0.3_${parts02[1]}_${convertedCrops}${parts02[3] ? '_' + parts02[3] : ''}`;
                    } else {
                        throw new Error('Invalid v0.2 save code format');
                    }
                    version = '0.3';
                    break;

                case '0.3':
                    // Extract the crop section for v0.3 conversion
                    const parts03 = currentCode.split('_');
                    if (parts03.length >= 3) {
                        const convertedCrops = convertV03ToV04(parts03[2]);
                        currentCode = `v0.4_${parts03[1]}_${convertedCrops}${parts03[3] ? '_' + parts03[3] : ''}`;
                    } else {
                        throw new Error('Invalid v0.3 save code format');
                    }
                    version = '0.4';
                    break;

                default:
                    throw new Error(`Unsupported save code version: v${version}`);
            }

            console.log(`🔄 Converted v${oldVersion} → v${version}`);
        }

        console.log(`✅ Final conversion result: ${currentCode.substring(0, 100)}...`);
        return currentCode;

    } catch (error) {
        console.error(`❌ Save code conversion failed:`, error);
        if (error instanceof Error) {
            throw new Error(`Save code conversion failed: ${error.message}`);
        }
        throw new Error('Save code conversion failed: Unknown error');
    }
}

/**
 * Crop size definitions for proper counting
 */
const CROP_SIZES: { [key: string]: { size: 'single' | 'bush' | 'tree', tiles: number } } = {
    'Tomato': { size: 'single', tiles: 1 },
    'Potato': { size: 'single', tiles: 1 },
    'Rice': { size: 'single', tiles: 1 },
    'Wheat': { size: 'single', tiles: 1 },
    'Carrot': { size: 'single', tiles: 1 },
    'Onion': { size: 'single', tiles: 1 },
    'Cotton': { size: 'single', tiles: 1 },
    'Corn': { size: 'single', tiles: 1 },
    'Napa Cabbage': { size: 'single', tiles: 1 },
    'Bok Choy': { size: 'single', tiles: 1 },
    'Blueberry': { size: 'bush', tiles: 4 },
    'Spicy Pepper': { size: 'bush', tiles: 4 },
    'Batterfly Bean': { size: 'bush', tiles: 4 },
    'Rockhopper Pumpkin': { size: 'bush', tiles: 4 },
    'Apple': { size: 'tree', tiles: 9 }
};

/**
 * Parses crop codes from a plot using the exact garden planner regex
 * @param plotCropString - String containing crop codes for one plot (e.g., "OOCrCrTCoCoPO")
 * @returns Array of crop names found in the plot
 */
function parseCropCodesFromPlot(plotCropString: string): string[] {
    console.log(`🔍 Parsing plot: "${plotCropString}"`);

    // Use the exact regex from garden.ts: /[A-Z](?:\.[A-Z]|[^A-Z])*/g
    const regex = /[A-Z](?:\.[A-Z]|[^A-Z])*/g;
    const cropCodes = plotCropString.match(regex);

    if (!cropCodes) {
        console.log(`⚠️ No crop codes found in plot: "${plotCropString}"`);
        return [];
    }

    console.log(`🔍 Found ${cropCodes.length} crop codes:`, cropCodes);

    const crops: string[] = [];

    // Process each tile in the plot (should be 9 tiles per plot)
    for (let tileIndex = 0; tileIndex < cropCodes.length; tileIndex++) {
        const cropCodeWithFert = cropCodes[tileIndex];
        const [cropCode, fertiliserCode] = cropCodeWithFert.split('.');

        console.log(`  🔸 Tile ${tileIndex + 1}: "${cropCodeWithFert}" -> crop: "${cropCode}", fert: "${fertiliserCode || 'none'}"`);

        if (CROP_MAPPINGS[cropCode]) {
            const cropName = CROP_MAPPINGS[cropCode];
            if (cropName !== 'None') {
                crops.push(cropName);
                console.log(`    ✅ Added ${cropName}`);
            }
        } else {
            console.log(`    ❌ Unknown crop code: "${cropCode}"`);
        }
    }

    return crops;
}

/**
 * Counts crops properly, handling multi-tile crops (bushes and trees)
 * @param allCropTiles - Array of all crop names from individual tiles
 * @returns Object with proper crop counts
 */
function countCropsCorrectly(allCropTiles: string[]): { [key: string]: number } {
    console.log(`📊 Counting crops from ${allCropTiles.length} tiles...`);

    const tileCounts: { [key: string]: number } = {};

    // Count all tiles first
    for (const cropName of allCropTiles) {
        tileCounts[cropName] = (tileCounts[cropName] || 0) + 1;
    }

    console.log(`🔢 Tile counts:`, tileCounts);

    // Convert tile counts to plant counts based on crop size
    const plantCounts: { [key: string]: number } = {};

    for (const [cropName, tileCount] of Object.entries(tileCounts)) {
        const cropSize = CROP_SIZES[cropName];
        if (cropSize) {
            const plantCount = Math.floor(tileCount / cropSize.tiles);
            if (plantCount > 0) {
                plantCounts[cropName] = plantCount;
                console.log(`🌱 ${cropName}: ${tileCount} tiles ÷ ${cropSize.tiles} tiles/plant = ${plantCount} plants`);
            }
        } else {
            console.log(`⚠️ Unknown crop size for: ${cropName}`);
            plantCounts[cropName] = tileCount; // Fallback to tile count
        }
    }

    return plantCounts;
}

/**
 * Parses garden save code or URL and extracts plant data
 * @param input - Either a direct save code or palia-garden-planner.vercel.app URL
 * @returns Promise<Plant[]> - Array of Plant objects parsed from the input
 * @throws Error if input is invalid or parsing fails
 */
export async function parsePaliaPlannerUrl(input: string): Promise<Plant[]> {
    console.log(`🚀 Starting to parse input: ${input.substring(0, 100)}...`);

    let saveCode = '';

    // Determine if input is URL or direct save code
    if (input.startsWith('http')) {
        try {
            const urlObj = new URL(input);

            // Check if it's a palia-garden-planner.vercel.app URL
            if (urlObj.hostname !== 'palia-garden-planner.vercel.app') {
                throw new Error('Invalid Palia Planner URL.');
            }

            // Extract layout parameter
            const layoutParam = urlObj.searchParams.get('layout');
            if (!layoutParam) {
                throw new Error('Invalid Palia Planner URL - no layout parameter found.');
            }

            saveCode = layoutParam;
            console.log(`📋 Extracted save code from URL: ${saveCode}`);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid Palia Planner URL')) {
                throw error;
            }
            throw new Error('Invalid URL format.');
        }
    } else {
        // Direct save code
        saveCode = input;
        console.log(`📋 Using direct save code: ${saveCode}`);
    }

    try {
        // NEW: Convert legacy save codes to v0.4 format before parsing
        const convertedSaveCode = convertLegacySaveCode(saveCode);
        console.log(`🔄 Using converted save code for parsing`);

        // Parse the save code format: v{version}_{dimensionInfo}_{cropInfo}_{settingsInfo}
        const sections = convertedSaveCode.split('_');
        console.log(`📊 Save code sections:`, sections);

        if (sections.length < 3) {
            throw new Error('Invalid save code format - insufficient sections.');
        }

        const version = sections[0];
        const dimensionInfo = sections[1];
        const cropInfo = sections[2];
        const settingsInfo = sections[3] || '';

        console.log(`📝 Version: ${version}`);
        console.log(`📐 Dimensions: ${dimensionInfo}`);
        console.log(`🌱 Crops: ${cropInfo}`);
        console.log(`⚙️ Settings: ${settingsInfo}`);

        // Validate version (should be v0.4 after conversion)
        if (!version.startsWith('v')) {
            throw new Error('Invalid save code format - missing version prefix.');
        }

        // Extract crop data
        let cropsSection = '';
        if (cropInfo.startsWith('CR-')) {
            cropsSection = cropInfo.substring(3); // Remove 'CR-' prefix
        } else {
            throw new Error('Invalid save code format - crops section should start with CR-.');
        }

        console.log(`🌾 Crops section after removing CR-: ${cropsSection}`);

        // Split crops section by dashes to get individual rows
        const rows = cropsSection.split('-');
        console.log(`📋 Crop rows:`, rows);

        const plants: Plant[] = [];

        // Collect all crop tiles first
        const allCropTiles: string[] = [];

        // Process each row to extract crop codes
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            console.log(`🔄 Processing plot ${rowIndex + 1}/${rows.length}: "${row}"`);

            // Process all plots, including Apple plots (AAAAAAAAA)
            const plotCrops = parseCropCodesFromPlot(row);
            allCropTiles.push(...plotCrops);
        }

        // Count crops correctly (handling multi-tile crops)
        const cropCounts = countCropsCorrectly(allCropTiles);

        console.log(`📊 Final crop counts:`, cropCounts);

        // Convert counts to Plant objects
        for (const [cropName, count] of Object.entries(cropCounts)) {
            for (let i = 0; i < count; i++) {
                const plant: Plant = {
                    id: uuidv4(),
                    name: cropName,
                    needsWater: false
                };
                plants.push(plant);
            }
        }

        console.log(`✅ Successfully parsed ${plants.length} plants`);
        return plants;

    } catch (error) {
        console.error(`❌ Parsing error:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to parse garden data.');
    }
}

/**
 * Parses garden save code and extracts complete garden layout data
 * @param input - Either a direct save code or palia-garden-planner.vercel.app URL
 * @returns Promise<ParsedGardenData> - Complete garden data structure
 * @throws Error if input is invalid or parsing fails
 */
export async function parseGridData(input: string): Promise<ParsedGardenData> {
    console.log(`🔍 Parsing grid data from input: ${input.substring(0, 100)}...`);

    let saveCode = '';

    // Extract save code from URL or use direct input
    if (input.startsWith('http')) {
        try {
            const urlObj = new URL(input);

            if (urlObj.hostname !== 'palia-garden-planner.vercel.app') {
                throw new Error('Invalid Palia Planner URL.');
            }

            const layoutParam = urlObj.searchParams.get('layout');
            if (!layoutParam) {
                throw new Error('Invalid Palia Planner URL - no layout parameter found.');
            }

            saveCode = layoutParam;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid Palia Planner URL')) {
                throw error;
            }
            throw new Error('Invalid URL format.');
        }
    } else {
        saveCode = input;
    }

    try {
        // NEW: Convert legacy save codes to v0.4 format before parsing
        const convertedSaveCode = convertLegacySaveCode(saveCode);
        console.log(`🔄 Using converted save code for grid parsing`);

        // Parse the save code format: v{version}_{dimensionInfo}_{cropInfo}_{settingsInfo}
        const sections = convertedSaveCode.split('_');

        if (sections.length < 3) {
            throw new Error('Invalid save code format - insufficient sections.');
        }

        const version = sections[0];
        const dimensionInfo = sections[1];
        const cropInfo = sections[2];
        const settingsInfo = sections[3] || '';

        // Validate version (should be v0.4 after conversion)
        if (!version.startsWith('v')) {
            throw new Error('Invalid save code format - missing version prefix.');
        }

        // Parse dimensions - these represent plot dimensions, not tile dimensions
        const plotDimensions = dimensionInfo.split('-').slice(1); // Remove first empty element
        const plotRows = plotDimensions.length;
        const plotColumns = plotDimensions[0] ? plotDimensions[0].length : 0;

        // Calculate actual tile dimensions (each plot is 3x3 tiles)
        const tileRows = plotRows * 3;
        const tileColumns = plotColumns * 3;

        console.log(`📐 Plot dimensions: ${plotRows}x${plotColumns} plots`);
        console.log(`📐 Tile dimensions: ${tileRows}x${tileColumns} tiles`);

        // Parse active plots
        const activePlots: boolean[][] = [];
        for (let i = 0; i < plotRows; i++) {
            activePlots[i] = [];
            for (let j = 0; j < plotColumns; j++) {
                activePlots[i][j] = plotDimensions[i][j] === '1';
            }
        }

        // Extract and parse crop data
        let cropsSection = '';
        if (cropInfo.startsWith('CR-')) {
            cropsSection = cropInfo.substring(3);
        } else {
            cropsSection = cropInfo;
        }

        const cropRows = cropsSection.split('-');

        // Initialize tiles grid with actual tile dimensions
        const tiles: GridTile[][] = [];
        for (let i = 0; i < tileRows; i++) {
            tiles[i] = [];
            for (let j = 0; j < tileColumns; j++) {
                const plotRow = Math.floor(i / 3);
                const plotCol = Math.floor(j / 3);
                const isPlotActive = plotRow < plotRows && plotCol < plotColumns && activePlots[plotRow][plotCol];

                tiles[i][j] = {
                    row: i,
                    col: j,
                    cropType: null,
                    fertilizerType: null,
                    needsWater: false, // Don't set random watering status - only relevant for tracked crops
                    isActive: isPlotActive
                };
            }
        }

        // Parse crop data for each active plot
        let plotIndex = 0;
        for (let plotRow = 0; plotRow < plotRows; plotRow++) {
            for (let plotCol = 0; plotCol < plotColumns; plotCol++) {
                if (activePlots[plotRow][plotCol] && plotIndex < cropRows.length) {
                    const plotCropString = cropRows[plotIndex];
                    const regex = /[A-Z](?:\.[A-Z]|[^A-Z])*/g;
                    const cropCodes = plotCropString.match(regex);

                    if (cropCodes && cropCodes.length === 9) { // Each plot should have 9 tiles
                        // Map each crop code to its corresponding tile in the 3x3 plot
                        let tileIndex = 0;
                        for (let pi = 0; pi < 3; pi++) {
                            for (let pj = 0; pj < 3; pj++) {
                                const tileRow = plotRow * 3 + pi;
                                const tileCol = plotCol * 3 + pj;

                                if (tileRow < tileRows && tileCol < tileColumns && tileIndex < cropCodes.length) {
                                    const cropCodeWithFert = cropCodes[tileIndex];
                                    const [cropCode, fertiliserCode] = cropCodeWithFert.split('.');

                                    const tile = tiles[tileRow][tileCol];

                                    if (CROP_MAPPINGS[cropCode] && CROP_MAPPINGS[cropCode] !== 'None') {
                                        tile.cropType = CROP_MAPPINGS[cropCode];

                                        // Generate crop ID for multi-tile crops
                                        const cropSize = CROP_SIZES[CROP_MAPPINGS[cropCode]];
                                        if (cropSize && cropSize.size !== 'single') {
                                            tile.cropId = uuidv4();
                                        }
                                    }

                                    if (fertiliserCode && FERTILIZER_MAPPINGS[fertiliserCode] && FERTILIZER_MAPPINGS[fertiliserCode] !== 'None') {
                                        tile.fertilizerType = FERTILIZER_MAPPINGS[fertiliserCode];
                                    }
                                }
                                tileIndex++;
                            }
                        }
                    }
                    plotIndex++;
                }
            }
        }

        // Generate crop summary
        const cropSummary = generateCropSummary(tiles);

        const gardenData: ParsedGardenData = {
            dimensions: { rows: tileRows, columns: tileColumns },
            tiles,
            activePlots,
            cropSummary,
            saveCode,
            version,
            settings: settingsInfo || undefined
        };

        console.log(`✅ Successfully parsed garden data: ${tileRows}x${tileColumns} tiles (${plotRows}x${plotColumns} plots) with ${cropSummary.totalPlants} plants`);
        return gardenData;

    } catch (error) {
        console.error(`❌ Grid parsing error:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to parse garden grid data.');
    }
}

/**
 * Generates a summary of crops and their watering status
 * @param tiles - 2D array of garden tiles
 * @returns CropSummary with watering statistics
 */
export function generateCropSummary(tiles: GridTile[][]): CropSummary {
    const cropBreakdown: CropSummary['cropBreakdown'] = {};
    let totalPlants = 0;
    let plantsNeedingWater = 0;

    // Count all crop tiles
    const cropTiles: string[] = [];
    for (const row of tiles) {
        for (const tile of row) {
            if (tile.cropType && tile.cropType !== 'None' && tile.isActive) {
                cropTiles.push(tile.cropType);
            }
        }
    }

    // Count tiles by crop type
    const tileCounts: { [key: string]: { total: number; needingWater: number } } = {};
    for (const row of tiles) {
        for (const tile of row) {
            if (tile.cropType && tile.cropType !== 'None' && tile.isActive) {
                if (!tileCounts[tile.cropType]) {
                    tileCounts[tile.cropType] = { total: 0, needingWater: 0 };
                }
                tileCounts[tile.cropType].total++;
                if (tile.needsWater) {
                    tileCounts[tile.cropType].needingWater++;
                }
            }
        }
    }

    // Convert tile counts to plant counts
    for (const [cropType, counts] of Object.entries(tileCounts)) {
        const cropSize = CROP_SIZES[cropType];
        if (cropSize) {
            const plantCount = Math.floor(counts.total / cropSize.tiles);
            const plantsNeedingWaterCount = Math.floor(counts.needingWater / cropSize.tiles);

            if (plantCount > 0) {
                cropBreakdown[cropType] = {
                    total: plantCount,
                    needingWater: plantsNeedingWaterCount,
                    size: cropSize.size,
                    tilesPerPlant: cropSize.tiles
                };

                totalPlants += plantCount;
                plantsNeedingWater += plantsNeedingWaterCount;
            }
        }
    }

    const wateringPercentage = totalPlants > 0 ? (plantsNeedingWater / totalPlants) * 100 : 0;

    return {
        totalPlants,
        plantsNeedingWater,
        cropBreakdown,
        wateringPercentage: Math.round(wateringPercentage * 100) / 100
    };
}

/**
 * Enhanced version of parsePaliaPlannerUrl that maintains backward compatibility
 * but uses the new parseGridData function internally
 * @param input - Either a direct save code or palia-garden-planner.vercel.app URL
 * @returns Promise<Plant[]> - Array of Plant objects for backward compatibility
 */
export async function parseSaveCode(input: string): Promise<Plant[]> {
    try {
        const gardenData = await parseGridData(input);
        const plants: Plant[] = [];

        // Convert crop summary to Plant objects for backward compatibility
        for (const [cropType, summary] of Object.entries(gardenData.cropSummary.cropBreakdown)) {
            for (let i = 0; i < summary.total; i++) {
                plants.push({
                    id: uuidv4(),
                    name: cropType,
                    needsWater: false
                });
            }
        }

        return plants;
    } catch {
        // Fallback to original implementation for backward compatibility
        return parsePaliaPlannerUrl(input);
    }
}