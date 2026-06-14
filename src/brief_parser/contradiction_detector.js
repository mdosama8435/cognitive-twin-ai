import { clamp } from '../utils/math.js';

/**
 * Contradiction Detector & Brief Quality Analyzer Service
 */

/**
 * Scans persona profile sliders and descriptive text for conflicts
 */
export const detectContradictions = (profile) => {
    const conflicts = [];
    const examplesLower = (profile.preferredExamples || "").toLowerCase();
    const weaknessesLower = (profile.weaknesses || "").toLowerCase();
    const strengthsLower = (profile.strengths || "").toLowerCase();
    const citationLower = (profile.citationHabits || "").toLowerCase();
    const diagramLower = (profile.diagramUsage || "").toLowerCase();
    
    // 1. Math/Quantitative Conflict
    if (profile.quantitativePrecision > 70 && 
        (weaknessesLower.includes("math") || weaknessesLower.includes("formula") || weaknessesLower.includes("equations") || examplesLower.includes("avoid"))) {
        conflicts.push({
            id: "math_conflict",
            severity: "High",
            title: "Quantitative Alignment Mismatch",
            affectedTraits: "Quantitative Precision vs. Weaknesses",
            impact: "Confidence rating drops. AI is forced to write math equations in Q3/Q4 while the brief explicitly asks to avoid formulas.",
            description: `You set Quantitative Precision to a high level (${profile.quantitativePrecision}%), but your written weaknesses indicate an aversion to formulas or math. This will destabilize the simulation twin in technical questions.`
        });
    }
    
    // 2. Memory vs. Citation Accuracy Conflict
    if (profile.roteMemory < 40 && 
        (citationLower.includes("perfect") || citationLower.includes("exact") || citationLower.includes("academic formats") || strengthsLower.includes("recall"))) {
        conflicts.push({
            id: "citation_conflict",
            severity: "Medium",
            title: "Memory & Citation Conflict",
            affectedTraits: "Rote Memory vs. Citation Habits",
            impact: "Creates semantic friction in historical attributions. The twin will occasionally guess dates while attempting to maintain exact academic formats.",
            description: `A low Rote Memory score (${profile.roteMemory}%) conflicts with your preference for exact names and dates. Real students with low rote memory typically resort to vague decade attributions (e.g. 'mid-70s').`
        });
    }
    
    // 3. Conscientiousness vs. Diagram/Structure Conflict
    if (profile.conscientiousness < 40 && 
        (diagramLower.includes("regularly") || diagramLower.includes("always") || diagramLower.includes("complex diagrams"))) {
        conflicts.push({
            id: "structure_conflict",
            severity: "Medium",
            title: "Structural Rigor Mismatch",
            affectedTraits: "Conscientiousness vs. Diagram Usage",
            impact: "Formatting inconsistencies in simulation scripts. Disorganized prose will contrast with highly structured diagrams.",
            description: `Low Conscientiousness (${profile.conscientiousness}%) usually leads to prose-heavy, unstructured answers, but you specified frequent/complex diagram usage. This is highly atypical for this academic profile.`
        });
    }
    
    // 4. Pacing vs. Focus Conflict
    if (profile.timeSensitivity > 80 && profile.attentionSpan > 80) {
        conflicts.push({
            id: "pacing_conflict",
            severity: "Low",
            title: "Attention Span & Pacing Collision",
            affectedTraits: "Attention Span vs. Time Sensitivity",
            impact: "Fatigue gradients trigger earlier in the timeline despite high cognitive focus.",
            description: `High Time Sensitivity (${profile.timeSensitivity}%) implies a rapid drop in final answer quality due to rushing, which conflicts with a very high Attention Span (${profile.attentionSpan}%).`
        });
    }
    
    return conflicts;
};

/**
 * Computes coverage and quality scores of the student brief
 */
export const calculateBriefQuality = (profile, briefText = "", writingSampleCount = 0) => {
    // 1. Behavior Coverage
    const behaviorScore = clamp(
        ((profile.attentionSpan + profile.stressThreshold + profile.timeSensitivity) / 3) + 
        (profile.preferredExamples ? 15 : 0), 
        30, 98
    );
    
    // 2. Knowledge Coverage
    const knowledgeScore = clamp(
        ((profile.conceptualGrasp + profile.quantitativePrecision + profile.roteMemory) / 3) +
        (profile.strengths ? 10 : 0) + (profile.weaknesses ? 10 : 0),
        30, 97
    );
    
    // 3. Writing Coverage
    const writingScore = clamp(
        profile.verbosity * 0.7 + (profile.citationHabits ? 15 : 0) + (profile.diagramUsage ? 15 : 0),
        30, 96
    );
    
    // 4. Completeness Score (Calculated from length of brief and writing samples upload)
    const textLen = (briefText || "").length;
    let lengthBonus = 0;
    if (textLen > 1000) lengthBonus = 20;
    else if (textLen > 500) lengthBonus = 10;
    
    const uploadBonus = clamp(writingSampleCount * 15, 0, 30);
    const completenessScore = clamp(50 + lengthBonus + uploadBonus - (detectContradictions(profile).length * 8), 20, 99);
    
    // 5. Contradiction Risk (based on number of active conflicts)
    const activeConflicts = detectContradictions(profile);
    const contradictionRisk = activeConflicts.length === 0 ? 0 : clamp(activeConflicts.length * 15, 5, 80);
    
    // 6. Simulation Reliability Score
    const reliability = clamp(completenessScore * 0.7 + (100 - contradictionRisk) * 0.3, 10, 98);
    
    return {
        completeness: Math.round(completenessScore),
        behaviorCoverage: Math.round(behaviorScore),
        knowledgeCoverage: Math.round(knowledgeScore),
        writingCoverage: Math.round(writingScore),
        contradictionRisk: Math.round(contradictionRisk),
        reliability: Math.round(reliability),
        conflicts: activeConflicts
    };
};
