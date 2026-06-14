import { clamp, randomInt } from '../utils/math.js';

/**
 * Text Compiler Service
 */

// Common typo mappings
const TYPOS = {
    "model": "mdoel",
    "attention": "attnetion",
    "reconstructive": "recontructive",
    "formulas": "formualas",
    "declarative": "delcarative",
    "procedural": "proceudral",
    "retrieval": "retreival",
    "threshold": "thereshold",
    "working": "wroking",
    "memory": "memroy",
    "information": "infomration",
    "cognitive": "congitve",
    "perceptual": "perctepual",
    "selection": "selcetion"
};

/**
 * Parses raw text with tags like [quirk|content] into tokens
 */
export const parseTextToTokens = (text) => {
    const tokens = [];
    const regex = /\[(analogy|handwave|correction|pivot|trope)\|([^\]]+)\]/g;
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }
        tokens.push({
            type: match[1],
            content: match[2]
        });
        lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }
    return tokens;
};

/**
 * Gets clean character length excluding markup tags
 */
export const getCleanTextLength = (tokens) => {
    return tokens.reduce((sum, token) => sum + token.content.length, 0);
};

/**
 * Compiles question blocks based on profile settings, and injects dynamic typos under high stress
 */
export const compileAnswer = (question, profile, stressLevel, pressureMode) => {
    // 1. Core Block Compilation
    let compiled = question.blocks.map(block => block.get(profile)).join("");
    
    // 2. Stress Typo Injection
    // Probability of typos is proportional to stress level and inverse of conscientiousness
    const typoChance = clamp((stressLevel - 40) / 100, 0, 0.8) * (1.2 - (profile.conscientiousness / 100)) * (pressureMode ? 1.4 : 1.0);
    
    if (typoChance > 0.05) {
        // Tokenize words to inject typos, ensuring we do not touch text inside markup tags!
        // A simple word-level replacement on text segments outside bracket tags.
        const regexPattern = /(\[[a-z]+\|[^\]]+\])|(\b[a-zA-Z]+\b)/g;
        
        compiled = compiled.replace(regexPattern, (match, tagGroup, wordGroup) => {
            if (tagGroup) {
                // Do not mutate tag contents (keep tooltips correct!)
                return tagGroup;
            }
            if (wordGroup) {
                const lower = wordGroup.toLowerCase();
                if (TYPOS[lower] && Math.random() < typoChance * 0.35) {
                    // Check casing
                    const typoWord = TYPOS[lower];
                    if (wordGroup[0] === wordGroup[0].toUpperCase()) {
                        return typoWord[0].toUpperCase() + typoWord.slice(1);
                    }
                    return typoWord;
                }
            }
            return match;
        });
    }
    
    return compiled;
};

/**
 * Renders HTML up to a character count
 */
export const renderTokensToHtml = (tokens, charCount) => {
    let outputHtml = '';
    let currentCount = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenLen = token.content.length;
        
        if (currentCount >= charCount) break;
        
        const isLast = (currentCount + tokenLen) > charCount;
        const printLen = isLast ? (charCount - currentCount) : tokenLen;
        const printedContent = token.content.substring(0, printLen);
        
        if (token.type === 'text') {
            outputHtml += printedContent;
        } else {
            let tooltip = '';
            switch (token.type) {
                case 'analogy':
                    tooltip = 'Everyday Analogy: Maps complex cognitive theories to familiar real-world structures to ground reasoning.';
                    break;
                case 'handwave':
                    tooltip = 'Verbal Hand-Waving: Replaces quantitative mathematical equations with descriptive, qualitative explanations.';
                    break;
                case 'correction':
                    tooltip = 'Syntactic Self-Correction: Shifting sentence structures mid-thought, mimicking a live editing process.';
                    break;
                case 'pivot':
                    tooltip = 'Conceptual Pivot: Sidestepping difficult biological or formulas queries to double-down on familiar concepts.';
                    break;
                case 'trope':
                    tooltip = 'Lost Researcher Trope: Explaining a major research study accurately while admitting to forgetting authors\' names.';
                    break;
            }
            outputHtml += `<span class="hl hl-${token.type}" data-tooltip="${tooltip}">${printedContent}</span>`;
        }
        currentCount += printLen;
    }
    return outputHtml;
};

/**
 * Finds the currently active tag at typing character count
 */
export const getActiveQuirkType = (tokens, charCount) => {
    let currentCount = 0;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenLen = token.content.length;
        if (charCount > currentCount && charCount <= currentCount + tokenLen) {
            return token.type === 'text' ? null : token.type;
        }
        currentCount += tokenLen;
    }
    return null;
};
