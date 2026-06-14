import { getSentenceStats } from '../utils/math.js';

/**
 * Writing DNA Fingerprint Analyzer Service
 */

const ANALOGY_MARKERS = ["like", "as if", "similar to", "analogous", "analogy", "metaphor", "resemble", "compares to"];
const TRANSITION_MARKERS = [
    "however", "therefore", "consequently", "furthermore", "moreover", 
    "crucially", "indeed", "specifically", "additionally", "meanwhile",
    "in a sense", "it is worth noting", "this points to", "on the other hand"
];
const PASSIVE_MARKERS = ["is", "was", "were", "been", "be", "being", "are", "get", "got"];
const PASSIVE_VERBS_REGEX = /\b(is|was|were|been|be|being|are)\s+[a-zA-Z]+ed\b/i;

export const analyzeWritingDNA = (textString) => {
    if (!textString || textString.trim() === "") {
        return {
            sentenceLengthAvg: 0,
            sentenceLengthStdDev: 0,
            analogyDensity: 0,
            transitionDensity: 0,
            passiveVoiceDensity: 0,
            lexicalDensity: 0,
            verbosityLevel: 0
        };
    }
    
    // Clean text and split words
    const words = textString.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    if (wordCount === 0) {
        return {
            sentenceLengthAvg: 0,
            sentenceLengthStdDev: 0,
            analogyDensity: 0,
            transitionDensity: 0,
            passiveVoiceDensity: 0,
            lexicalDensity: 0,
            verbosityLevel: 0
        };
    }
    
    // 1. Sentence stats (average length, standard deviation)
    const sentenceStats = getSentenceStats(textString);
    
    // 2. Analogy density
    let analogyCount = 0;
    const lowerText = textString.toLowerCase();
    ANALOGY_MARKERS.forEach(marker => {
        const regex = new RegExp(`\\b${marker}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) analogyCount += matches.length;
    });
    const analogyDensity = (analogyCount / wordCount) * 100;
    
    // 3. Transition density
    let transitionCount = 0;
    TRANSITION_MARKERS.forEach(marker => {
        const regex = new RegExp(`\\b${marker}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) transitionCount += matches.length;
    });
    const transitionDensity = (transitionCount / wordCount) * 100;
    
    // 4. Passive voice density estimation
    // Search for passive constructions: auxiliary verb + past participle ending in 'ed'
    const passiveMatches = lowerText.match(PASSIVE_VERBS_REGEX);
    let passiveCount = passiveMatches ? passiveMatches.length : 0;
    // fallback word count estimate
    words.forEach((w, idx) => {
        if (PASSIVE_MARKERS.includes(w.toLowerCase()) && idx < words.length - 1) {
            const nextWord = words[idx + 1].toLowerCase();
            if (nextWord.endsWith("ed") || nextWord.endsWith("t") || nextWord === "shown" || nextWord === "seen" || nextWord === "done") {
                passiveCount++;
            }
        }
    });
    const passiveVoiceDensity = (passiveCount / wordCount) * 100;
    
    // 5. Lexical density (complexity helper)
    // Percentage of words with length > 6 characters (rough metric for complex vocabulary)
    const complexWords = words.filter(w => w.replace(/[^a-zA-Z]/g, "").length > 6);
    const lexicalDensity = (complexWords.length / wordCount) * 100;
    
    // Normalization to 0-100 scales for user radar charts
    return {
        sentenceLengthAvg: sentenceStats.average,
        sentenceLengthStdDev: sentenceStats.stdDev,
        analogyDensity: Math.round(analogyDensity * 10) / 10,
        transitionDensity: Math.round(transitionDensity * 10) / 10,
        passiveVoiceDensity: Math.round(passiveVoiceDensity * 10) / 10,
        lexicalDensity: Math.round(lexicalDensity * 10) / 10,
        wordCount: wordCount
    };
};
