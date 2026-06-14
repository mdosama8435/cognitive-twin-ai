/**
 * Math and Statistical Utilities
 */

export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

export const scale = (num, inMin, inMax, outMin, outMax) => {
    const clamped = clamp(num, inMin, inMax);
    return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
};

export const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Box-Muller transform for generating gaussian-distributed random numbers
 */
export const gaussianNoise = (mean = 0, stdDev = 1) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
};

/**
 * Analyzes sentence lengths in a string and returns stats
 */
export const getSentenceStats = (textText) => {
    if (!textText || textText.trim() === "") {
        return { average: 0, stdDev: 0, count: 0 };
    }
    
    // Split sentences by standard punctuation followed by space
    const sentences = textText
        .split(/[.!?]+(?=\s|$)/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
    if (sentences.length === 0) {
        return { average: 0, stdDev: 0, count: 0 };
    }
    
    const wordCounts = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
    const sum = wordCounts.reduce((a, b) => a + b, 0);
    const average = sum / sentences.length;
    
    // Standard deviation
    const variance = wordCounts.reduce((sqSum, val) => sqSum + Math.pow(val - average, 2), 0) / sentences.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        average: Math.round(average * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        count: sentences.length,
        lengths: wordCounts
    };
};
