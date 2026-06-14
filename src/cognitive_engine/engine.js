import { clamp, gaussianNoise } from '../utils/math.js';

/**
 * Real-time Cognitive State Simulator
 */
export class CognitiveEngine {
    constructor(profile, options = {}) {
        this.profile = profile;
        this.pressureMode = options.pressureMode || false;
        
        // Initial States
        this.attention = 100;
        this.fatigue = 0;
        this.stress = 10;
        this.confidence = profile.confidenceLevel || 70;
        this.cognitiveLoad = 10;
        
        // Internal variables
        this.tickCount = 0;
        this.currentQIndex = 0;
        this.pauseTicks = 0;
        this.eventLog = [];
    }
    
    /**
     * Ticks the engine state forward
     * @param {number} qIndex - Current active question index (0-3)
     * @param {number} progress - Progress in active question (0 to 1)
     * @param {boolean} isMathTopic - Whether active section is quantitative
     */
    tick(qIndex, progress, isMathTopic) {
        this.tickCount++;
        
        // Handle transitions between questions
        if (qIndex !== this.currentQIndex) {
            this.currentQIndex = qIndex;
            // Spikes attention slightly on new question
            this.attention = clamp(this.attention + 35, 10, 100);
            this.addEvent(`Started Question ${qIndex + 1}`, "Information loading...");
        }
        
        // 1. Calculate Time Pressure (increases through the exam questions)
        const totalProgress = (qIndex + progress) / 4.0; // 4 questions total
        const timePressure = totalProgress * 100;
        
        // Adjust for Pressure Mode
        const neuroMod = this.profile.stressThreshold < 50 ? 1.4 : 0.8;
        const pressureMult = this.pressureMode ? 1.5 : 1.0;
        
        // 2. Calculate Fatigue: accumulates over time, faster if stress is high
        const fatigueRate = (1.5 - (this.profile.conscientiousness / 100)) * 0.03 * pressureMult;
        this.fatigue = clamp(this.fatigue + fatigueRate * (1 + this.stress / 50), 0, 95);
        
        // 3. Calculate Attention Decay: decays over text typing, mitigated by attentionSpan setting
        const attentionDecay = (0.05 * (100 / (this.profile.attentionSpan || 50))) * pressureMult;
        this.attention = clamp(this.attention - attentionDecay + gaussianNoise(0, 0.2), 10, 100);
        
        // 4. Calculate Stress: increases with time pressure, fatigue, and quantitative topics
        const mathStress = isMathTopic ? (100 - this.profile.quantitativePrecision) * 0.4 : 0;
        const targetStress = (timePressure * 0.4) + (this.fatigue * 0.3) + mathStress + (this.pressureMode ? 30 : 0);
        const stressRate = 0.05 * neuroMod;
        this.stress = clamp(this.stress + (targetStress - this.stress) * stressRate + gaussianNoise(0, 0.3), 5, 100);
        
        // 5. Calculate Confidence: rises with conceptual topics, drops with math and stress
        let baseConfidence = this.profile.conceptualGrasp * 0.8;
        if (isMathTopic) {
            baseConfidence = (this.profile.quantitativePrecision * 0.9) - (this.stress * 0.2);
        }
        const targetConfidence = baseConfidence - (this.fatigue * 0.3) - (this.stress * 0.2);
        this.confidence = clamp(this.confidence + (targetConfidence - this.confidence) * 0.04 + gaussianNoise(0, 0.4), 10, 100);
        
        // 6. Calculate Cognitive Load: overall mental capacity utilization
        this.cognitiveLoad = clamp((this.stress * 0.3) + (this.fatigue * 0.4) + (isMathTopic ? 40 : 10), 10, 100);
        
        // Check for cognitive events (Human Failures)
        this.checkForEvents(isMathTopic);
    }
    
    /**
     * Checks if a cognitive failure event triggers on this tick
     */
    checkForEvents(isMathTopic) {
        if (this.pauseTicks > 0) return;
        
        const roll = Math.random() * 1000;
        
        // Panic trigger: stress > 75 under pressure mode or math
        if (this.stress > 80 && roll < 5 && isMathTopic) {
            this.addEvent("Panic Response", "Math formula triggered high cognitive load collapse. Pivoting to verbal description.");
            this.pauseTicks = 15;
            return;
        }
        
        // Memory Block: fatigue > 50 and low roteMemory
        if (this.fatigue > 55 && this.profile.roteMemory < 45 && roll < 4) {
            this.addEvent("Memory Recall Failure", "Failed to retrieve exact researcher name. Triggered 'Lost Researcher' fallback.");
            this.pauseTicks = 20;
            return;
        }
        
        // Overthinking: high Neuroticism, low stressThreshold
        if (this.profile.stressThreshold < 40 && this.attention > 60 && roll < 3) {
            this.addEvent("Overthinking loop", "Grammatical self-correction activated to rephrase argument structure.");
            this.pauseTicks = 10;
            return;
        }
        
        // Loss of Focus: attention < 40
        if (this.attention < 40 && roll < 4) {
            this.addEvent("Lapse of Focus", "Mind drifted to external environment. Pausing writing flow.");
            this.pauseTicks = 18;
            return;
        }
    }
    
    addEvent(type, impact) {
        const timestamp = this.getFormattedTime();
        this.eventLog.push({ timestamp, type, impact });
        
        // Keep last 30 events
        if (this.eventLog.length > 30) {
            this.eventLog.shift();
        }
    }
    
    getFormattedTime() {
        const totalSeconds = this.tickCount * 2; // Each tick simulates 2 seconds of exam time
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
