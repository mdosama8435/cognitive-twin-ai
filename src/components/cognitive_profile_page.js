import { $, html } from '../utils/dom.js';
import { drawRadarChart } from '../visualizations/canvas_charts.js';

/**
 * Student Cognitive Profile Dashboard Component
 */
export class CognitiveProfilePage {
    constructor(container, appState) {
        this.container = container;
        this.appState = appState;
    }
    
    init() {
        this.render();
    }
    
    renderRadar() {
        const canvas = $('#profile-radar-canvas');
        if (canvas) {
            drawRadarChart(canvas, this.appState.profile);
        }
    }
    
    render() {
        const p = this.appState.profile;
        
        // Define knowledge mapping based on profile scores
        let strongRecall = "Baddeley's Working Memory components, Schema Theory concepts, Attention Filter bottlenecks.";
        let vagueRecall = "Historical research timelines, secondary investigator names, Broadbent filter thresholds.";
        let mathAvoidance = "Logarithmic decay formulations, auditory signal detection equations, latency math.";
        let fatalGaps = "Anatomical visual pathways (V4/MT), specific Brodmann areas, computational modeling variables.";
        
        if (p.roteMemory > 70) {
            strongRecall += ", Historical landmark dates, exact researcher citations.";
            vagueRecall = vagueRecall.replace("Historical research timelines, ", "");
        }
        if (p.quantitativePrecision > 70) {
            mathAvoidance = "None. High precision equations modeled correctly.";
            fatalGaps = "Specific Brodmann brain areas, low-level neuronal details.";
        }
        
        const profileHtml = `
            <div class="profile-layout-grid">
                <!-- Left Column: Radar Chart & Personality -->
                <div class="profile-panel-card">
                    <h4>Cognitive Radar Blueprint</h4>
                    <p class="card-desc">Linguistic and structural performance parameters mapped across five key vectors.</p>
                    
                    <div class="radar-canvas-container">
                        <canvas id="profile-radar-canvas" style="width: 100%; height: 260px;"></canvas>
                    </div>
                    
                    <div class="personality-summary-box" style="margin-top:1rem;">
                        <h5>Behavioral Personality</h5>
                        <div class="stat-badge-row">
                            <span class="trait-lbl">Stress Threshold:</span>
                            <span class="trait-val" style="color:var(--accent-rose);">${p.stressThreshold}%</span>
                        </div>
                        <div class="stat-badge-row">
                            <span class="trait-lbl">Conscientiousness:</span>
                            <span class="trait-val" style="color:var(--accent-emerald);">${p.conscientiousness}%</span>
                        </div>
                        <div class="stat-badge-row">
                            <span class="trait-lbl">Time Sensitivity:</span>
                            <span class="trait-val" style="color:var(--accent-amber);">${p.timeSensitivity}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column: Knowledge Maps & Traits -->
                <div class="profile-main-area">
                    <!-- Knowledge Maps -->
                    <div class="profile-panel-card">
                        <h4>Cognitive Knowledge Map</h4>
                        <p class="card-desc" style="margin-bottom:1rem;">Categorizes subject modules based on memory recall strength and quantitative resistance.</p>
                        
                        <div class="knowledge-categories">
                            <div class="k-card category-strong">
                                <h5>Strong Concept Recall</h5>
                                <p>${strongRecall}</p>
                            </div>
                            <div class="k-card category-vague">
                                <h5>Vague Conceptual Zones</h5>
                                <p>${vagueRecall}</p>
                            </div>
                            <div class="k-card category-math">
                                <h5>Quantitative Hand-waving Zones</h5>
                                <p>${mathAvoidance}</p>
                            </div>
                            <div class="k-card category-gaps">
                                <h5>Biological & Analytical Gaps</h5>
                                <p>${fatalGaps}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Structural Brief Traits Summary -->
                    <div class="profile-panel-card" style="margin-top:1.5rem;">
                        <h4>Emulation Profile Summary</h4>
                        <div class="traits-summary-grid">
                            <div class="summary-trait-row">
                                <strong>Preferred Examples:</strong>
                                <span>${p.preferredExamples}</span>
                            </div>
                            <div class="summary-trait-row">
                                <strong>Citation Style:</strong>
                                <span>${p.citationHabits}</span>
                            </div>
                            <div class="summary-trait-row">
                                <strong>Diagram Preference:</strong>
                                <span>${p.diagramUsage}</span>
                            </div>
                            <div class="summary-trait-row">
                                <strong>Pressure Behavior:</strong>
                                <span>${p.pressureBehavior}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = profileHtml;
        
        // Draw the radar chart after element is inserted into DOM
        setTimeout(() => this.renderRadar(), 50);
    }
}
