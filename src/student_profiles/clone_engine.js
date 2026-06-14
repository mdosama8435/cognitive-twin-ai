/**
 * Cognitive Twin Cloning & Mutation Impact Analyzer Service
 */

export const generateCloneImpact = (oldTraits, newTraits) => {
    const impacts = [];
    const dnaShifts = [];
    
    // 1. Stress threshold shifts
    const stressDiff = newTraits.stressThreshold - oldTraits.stressThreshold;
    if (stressDiff > 25) {
        impacts.push({
            variable: "Anxiety & Stress Reactivity",
            shift: `Spikes by +${stressDiff}%`,
            pacingImpact: "Typing speed becomes highly erratic, with frequent cognitive block pauses (thinking loops) and sentence-level rush bursts near the end of Question 3 and Question 4.",
            errorImpact: "Generates a substantial increase in context-dependent spelling typos (e.g. 'mdoel', 'infomration') when stress surges beyond threshold boundaries."
        });
        dnaShifts.push("Sentence length variance standard deviation increases due to irregular punctuation stops.");
        dnaShifts.push("Linguistic self-corrections trigger at a 3x higher frequency.");
    } else if (stressDiff < -25) {
        impacts.push({
            variable: "Anxiety & Stress Reactivity",
            shift: `Reduces by ${stressDiff}%`,
            pacingImpact: "Stable and continuous typing rhythms without sudden panic pauses.",
            errorImpact: "Typo generation rates drop significantly, resulting in a cleaner text output."
        });
        dnaShifts.push("Fewer grammatical shifts or mid-thought revisions.");
    }
    
    // 2. Confidence level shifts
    const confDiff = newTraits.confidenceLevel - oldTraits.confidenceLevel;
    if (confDiff < -30) {
        impacts.push({
            variable: "Self Confidence Calibration",
            shift: `Drops by ${confDiff}%`,
            pacingImpact: "Triggers early 'Panic Pivots' during quantitative question blocks, deflecting text to conceptual descriptions earlier in the script.",
            errorImpact: "Retreats to passive voice constructions and qualitative hand-waving earlier in the exam timeline."
        });
        dnaShifts.push("Analogy density increases as the twin relies on conceptual comparisons instead of precise details.");
    } else if (confDiff > 30) {
        impacts.push({
            variable: "Self Confidence Calibration",
            shift: `Increases by +${confDiff}%`,
            pacingImpact: "Maintains writing arguments for longer periods, attempting to detail complex theoretical frameworks.",
            errorImpact: "Confidence limits spelling typos but can cause the twin to over-assert concepts with incorrect years/names due to memory recall constraints."
        });
        dnaShifts.push("Active pronoun usage rises, creating a more authoritative writing tone.");
    }
    
    if (impacts.length === 0) {
        impacts.push({
            variable: "Baseline System",
            shift: "Negligible mutations (< 10% change)",
            pacingImpact: "Maintain standard attention decay and fatigue gradients.",
            errorImpact: "Spelling typo frequency and recall blocks align with presets."
        });
    }
    
    return {
        behavioralImpacts: impacts,
        dnaShifts: dnaShifts,
        expectedScoreShift: Math.round(confDiff * 0.15 - stressDiff * 0.25)
    };
};
