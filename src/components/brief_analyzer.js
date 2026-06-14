import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { calculateBriefQuality } from '../brief_parser/contradiction_detector.js';

/**
 * Brief Quality Analyzer & Contradiction Board Component
 */
export class BriefAnalyzer {
    constructor(container, appState) {
        this.container = container;
        this.appState = appState;
    }
    
    init() {
        this.render();
    }
    
    getRecommendations(stats, profile, samplesCount) {
        const list = [];
        if (samplesCount === 0) {
            list.push("Upload at least one writing sample in the **Brief Builder** to analyze linguistic DNA.");
        }
        if (stats.conflicts.length > 0) {
            list.push("Resolve the active contradictions shown below to improve cognitive simulation reliability.");
        }
        if (profile.roteMemory < 45 && !profile.citationHabits.toLowerCase().includes("vague")) {
            list.push(`Rote memory is low (${profile.roteMemory}%). Consider specifying a 'vague citation' strategy in your Brief guidelines.`);
        }
        if (profile.quantitativePrecision < 45 && !profile.preferredExamples.toLowerCase().includes("hand-wav")) {
            list.push(`Quantitative precision is low (${profile.quantitativePrecision}%). Recommend updating brief to specify qualitative 'hand-waving' examples.`);
        }
        if (list.length === 0) {
            list.push("Perfect alignment! Your brief is fully optimized and ready for validation.");
        }
        return list;
    }
    
    render() {
        const students = db.getStudents();
        const sId = this.appState.activeStudentId || students[0].id;
        this.appState.activeStudentId = sId;
        
        const student = db.getStudentById(sId);
        const brief = db.getBriefByStudentId(sId);
        const profile = db.getProfileByStudentId(sId);
        const sims = db.getSimulationsByStudentId(sId);
        
        const briefText = brief ? brief.markdown_text : "";
        const stats = calculateBriefQuality(profile, briefText, sims.length);
        const recommendations = this.getRecommendations(stats, profile, sims.length);
        
        const conflictsHtml = stats.conflicts.length === 0 
            ? `<div class="info-alert-box bg-emerald">
                <span class="info-badge success">Zero Conflicts</span>
                <p>Heuristic engine detected no logical contradictions between profile configurations and brief guidelines.</p>
               </div>`
            : stats.conflicts.map(c => `
                <div class="conflict-card severity-${c.severity.toLowerCase()}">
                    <div class="conflict-header-row">
                        <span class="conflict-badge badge-${c.severity.toLowerCase()}">${c.severity} Severity</span>
                        <h5>${c.title}</h5>
                    </div>
                    <div class="conflict-traits"><strong>Traits Affected:</strong> ${c.affectedTraits}</div>
                    <p class="conflict-desc">${c.description}</p>
                    <div class="conflict-impact"><strong>Simulation Impact:</strong> ${c.impact}</div>
                </div>
            `).join("");
            
        const analyzerHtml = `
            <div class="analyzer-layout">
                <!-- Top Section: Quality Gauges -->
                <div class="dashboard-header-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h4>Quality Assessment Report</h4>
                        <select id="analyzer-student-select" class="preset-select" style="width:160px; padding:0.25rem;">
                            ${students.map(s => `<option value="${s.id}" ${s.id === sId ? 'selected' : ''}>Analyzer: ${s.name}</option>`).join("")}
                        </select>
                    </div>
                    
                    <div class="gauges-grid">
                        <div class="gauge-card">
                            <div class="gauge-circle-container">
                                <svg width="80" height="80" viewBox="0 0 36 36" class="circular-chart text-amber">
                                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="circle" stroke-dasharray="${stats.completeness}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span class="gauge-text">${stats.completeness}%</span>
                            </div>
                            <span class="gauge-label">Brief Completeness</span>
                        </div>
                        
                        <div class="gauge-card">
                            <div class="gauge-circle-container">
                                <svg width="80" height="80" viewBox="0 0 36 36" class="circular-chart text-cyan">
                                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="circle" stroke-dasharray="${stats.behaviorCoverage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span class="gauge-text">${stats.behaviorCoverage}%</span>
                            </div>
                            <span class="gauge-label">Behavior Coverage</span>
                        </div>
                        
                        <div class="gauge-card">
                            <div class="gauge-circle-container">
                                <svg width="80" height="80" viewBox="0 0 36 36" class="circular-chart text-emerald">
                                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="circle" stroke-dasharray="${stats.knowledgeCoverage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span class="gauge-text">${stats.knowledgeCoverage}%</span>
                            </div>
                            <span class="gauge-label">Knowledge Coverage</span>
                        </div>
                        
                        <div class="gauge-card">
                            <div class="gauge-circle-container">
                                <svg width="80" height="80" viewBox="0 0 36 36" class="circular-chart text-rose">
                                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="circle" stroke-dasharray="${stats.writingCoverage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span class="gauge-text">${stats.writingCoverage}%</span>
                            </div>
                            <span class="gauge-label">Writing Coverage</span>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom Split Grid -->
                <div class="analyzer-split-grid">
                    <!-- Contradiction Warnings -->
                    <div class="analyzer-panel-card">
                        <h4>Contradiction Board</h4>
                        <div class="contradictions-list" style="margin-top:0.5rem;">
                            ${conflictsHtml}
                        </div>
                    </div>
                    
                    <!-- Recommendations List -->
                    <div class="analyzer-panel-card">
                        <h4>Optimization Suggestions</h4>
                        <div class="suggestions-list" style="margin-top:0.5rem;">
                            ${recommendations.map(r => `
                                <div class="suggestion-item">
                                    <svg class="suggestion-bullet" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="3"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>
                                    <span>${r}</span>
                                </div>
                            `).join("")}
                        </div>
                        
                        <div class="validation-readiness-banner" style="margin-top:1.5rem;">
                            <span>Validation Readiness:</span>
                            <strong style="color:${stats.reliability > 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}; font-size:1.2rem;">
                                ${stats.reliability}% - ${stats.reliability > 75 ? 'Ready' : 'Needs Optimization'}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = analyzerHtml;
        
        // Listeners
        on($('#analyzer-student-select'), 'change', (e) => {
            this.appState.activeStudentId = e.target.value;
            this.render();
        });
    }
}
