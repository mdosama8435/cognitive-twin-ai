import { $, $$, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { drawRadarChart } from '../visualizations/canvas_charts.js';

/**
 * Tabbed Individual Student Profile Dashboard Component
 */
export class ProfileDashboard {
    constructor(container, studentId = "alex") {
        this.container = container;
        this.studentId = studentId;
        this.activeTab = "academic"; // academic, dna, history
    }
    
    init() {
        this.render();
    }
    
    setStudent(studentId) {
        this.studentId = studentId;
        this.activeTab = "academic";
        this.render();
    }
    
    renderRadar(traits) {
        const canvas = $('#profile-radar-canvas');
        if (canvas && traits) {
            drawRadarChart(canvas, traits);
        }
    }
    
    render() {
        const student = db.getStudentById(this.studentId);
        if (!student) {
            this.container.innerHTML = `
                <div class="empty-state-box">
                    <span>⚠️</span>
                    <h5>Student profile not found</h5>
                    <p class="text-muted">Return to Library and select a valid student twin.</p>
                </div>
            `;
            return;
        }
        
        const traits = db.getProfileByStudentId(this.studentId);
        const dna = db.getDNAByStudentId(this.studentId);
        const sims = db.getSimulationsByStudentId(this.studentId);
        
        // Dynamic HTML tab buttons
        const tabButtonsHtml = `
            <div class="sim-q-tabs" style="margin-bottom:1.5rem;">
                <button class="sim-q-tab ${this.activeTab === 'academic' ? 'active' : ''}" data-tab="academic">Academic Profile</button>
                <button class="sim-q-tab ${this.activeTab === 'dna' ? 'active' : ''}" data-tab="dna">Linguistic DNA</button>
                <button class="sim-q-tab ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">Simulation History</button>
            </div>
        `;
        
        let tabContentHtml = "";
        
        if (this.activeTab === "academic") {
            // Renders standard parameters + Canvas radar
            tabContentHtml = `
                <div class="profile-layout-grid" style="grid-template-columns: 300px 1fr;">
                    <!-- Left: Radar canvas -->
                    <div class="profile-panel-card">
                        <h5>Radar Blueprint</h5>
                        <div class="radar-canvas-container" style="padding:0.75rem 0;">
                            <canvas id="profile-radar-canvas" style="width: 100%; height: 230px;"></canvas>
                        </div>
                        
                        <div class="personality-summary-box">
                            <div class="stat-badge-row"><span>Attention Span:</span> <strong>${traits.attentionSpan}%</strong></div>
                            <div class="stat-badge-row"><span>Stress Resistance:</span> <strong>${traits.stressThreshold}%</strong></div>
                            <div class="stat-badge-row"><span>Conscientiousness:</span> <strong>${traits.conscientiousness}%</strong></div>
                        </div>
                    </div>
                    
                    <!-- Right: Knowledge mappings -->
                    <div class="profile-main-area" style="display:flex; flex-direction:column; gap:1.2rem;">
                        <div class="profile-panel-card">
                            <h5>Emulation Text Metrics</h5>
                            <div class="traits-summary-grid" style="margin-top:0.5rem; font-size:0.8rem;">
                                <div class="summary-trait-row"><strong>Degree Program:</strong> <span>${student.degree}</span></div>
                                <div class="summary-trait-row"><strong>Subject Specialty:</strong> <span>${student.subject}</span></div>
                                <div class="summary-trait-row"><strong>Preferred Examples:</strong> <span>${traits.preferredExamples}</span></div>
                                <div class="summary-trait-row"><strong>Format & Diagrams:</strong> <span>${traits.diagramUsage}</span></div>
                            </div>
                        </div>
                        
                        <div class="profile-panel-card">
                            <h5>Factual Recall Gaps</h5>
                            <p class="text-muted" style="font-size:0.75rem; margin-bottom:0.5rem;">Specific operational blocks identified for memory simulation.</p>
                            <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.4rem;">
                                <div><strong>Comfortable recall:</strong> ${traits.strengths}</div>
                                <div><strong>Struggled recall:</strong> ${traits.weaknesses}</div>
                                <div><strong>Common Mistakes:</strong> ${traits.commonMistakes}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.activeTab === "dna") {
            // DNA numbers grid
            tabContentHtml = `
                <div class="profile-panel-card">
                    <h5>Linguistic DNA Blueprint</h5>
                    <p class="card-desc" style="margin-bottom:1.2rem;">Linguistic fingerprinter analysis of active copy-paste text samples.</p>
                    
                    <div class="dna-results" style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                        <div class="dna-metric-row-item"><span>Average Sentence Length:</span> <strong>${dna ? dna.sentenceLengthAvg : 0} words</strong></div>
                        <div class="dna-metric-row-item"><span>Sentence Variance (Std Dev):</span> <strong>${dna ? dna.sentenceLengthStdDev : 0}</strong></div>
                        <div class="dna-metric-row-item"><span>Analogy / Metaphor Index:</span> <strong>${dna ? dna.analogyDensity : 0}%</strong></div>
                        <div class="dna-metric-row-item"><span>Transitions Density:</span> <strong>${dna ? dna.transitionDensity : 0}%</strong></div>
                        <div class="dna-metric-row-item"><span>Passive Voice Density:</span> <strong>${dna ? dna.passiveVoiceDensity : 0}%</strong></div>
                        <div class="dna-metric-row-item"><span>Lexical Density (Vocabulary Complexity):</span> <strong>${dna ? dna.lexicalDensity : 0}%</strong></div>
                    </div>
                </div>
            `;
        } else {
            // History list
            const rows = sims.length === 0
                ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No validation simulations run for this twin yet.</td></tr>`
                : sims.map((sim, idx) => `
                    <tr>
                        <td><strong>Run #${idx + 1}</strong></td>
                        <td>${sim.date}</td>
                        <td>${sim.answers.alex.split(/\s+/).filter(Boolean).length} words</td>
                        <td><span class="val-badge">${student.twinScore}% Accuracy</span></td>
                    </tr>
                `).join("");
                
            tabContentHtml = `
                <div class="profile-panel-card">
                    <h5>Simulation Execution History</h5>
                    <table class="report-table" style="margin-top:0.75rem;">
                        <thead>
                            <tr>
                                <th>Simulation Run</th>
                                <th>Execution Date</th>
                                <th>Output Length</th>
                                <th>Accuracy Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        const outerHtml = `
            <div class="individual-profile-container">
                <!-- Header card -->
                <div class="dashboard-header-card" style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="font-family:var(--font-heading); font-size:1.35rem;">${student.name}</h3>
                        <span class="card-degree-text" style="color:var(--text-secondary); font-size:0.85rem;">${student.degree} | Level: ${student.level}</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.75rem; color:var(--text-muted); display:block; text-transform:uppercase; letter-spacing:0.05em;">Cognitive Twin Accuracy</span>
                        <strong style="color:var(--accent-amber); font-size:1.6rem; font-family:var(--font-heading);">${student.twinScore}%</strong>
                    </div>
                </div>
                
                <!-- Tab Buttons -->
                ${tabButtonsHtml}
                
                <!-- Tab Content Mount -->
                <div id="profile-tab-content-mount">
                    ${tabContentHtml}
                </div>
            </div>
        `;
        
        this.container.innerHTML = outerHtml;
        
        // Listeners for tabs toggle
        this.container.querySelectorAll('.sim-q-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.activeTab = e.target.getAttribute('data-tab');
                this.render();
            });
        });
        
        // Render Canvas radar if active
        if (this.activeTab === "academic") {
            setTimeout(() => this.renderRadar(traits), 50);
        }
    }
}
