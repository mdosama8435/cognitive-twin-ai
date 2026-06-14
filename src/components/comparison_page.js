import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';

/**
 * Multi-Student Benchmarking Comparison Component
 */
export class ComparisonPage {
    constructor(container, preselectedA = "alex", preselectedB = "jordan") {
        this.container = container;
        this.studentAId = preselectedA;
        this.studentBId = preselectedB;
    }
    
    init() {
        this.render();
    }
    
    drawComparisonOverlay(canvas, traitsA, traitsB, nameA, nameB) {
        if (!canvas) return;
        
        // Custom HDPI canvas setup
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.35;
        
        const axes = [
            { label: "Conceptual", valA: traitsA.conceptualGrasp, valB: traitsB.conceptualGrasp },
            { label: "Quantitative", valA: traitsA.quantitativePrecision, valB: traitsB.quantitativePrecision },
            { label: "Rote Memory", valA: traitsA.roteMemory, valB: traitsB.roteMemory },
            { label: "Attention Span", valA: traitsA.attentionSpan, valB: traitsB.attentionSpan },
            { label: "Verbosity", valA: traitsA.verbosity, valB: traitsB.verbosity }
        ];
        
        const numAxes = axes.length;
        
        // Concentric Polygons Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let l = 1; l <= 4; l++) {
            const levelRadius = radius * (l / 4);
            ctx.beginPath();
            for (let i = 0; i < numAxes; i++) {
                const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                const x = centerX + levelRadius * Math.cos(angle);
                const y = centerY + levelRadius * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // Axis lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        axes.forEach((axis, i) => {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const outerX = centerX + radius * Math.cos(angle);
            const outerY = centerY + radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
            
            const labelX = centerX + (radius + 20) * Math.cos(angle);
            const labelY = centerY + (radius + 12) * Math.sin(angle);
            ctx.fillText(axis.label, labelX, labelY);
        });
        
        // Draw Student A (Amber)
        ctx.beginPath();
        axes.forEach((axis, i) => {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const valRadius = radius * ((axis.valA || 10) / 100);
            const x = centerX + valRadius * Math.cos(angle);
            const y = centerY + valRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw Student B (Cyan)
        ctx.beginPath();
        axes.forEach((axis, i) => {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const valRadius = radius * ((axis.valB || 10) / 100);
            const x = centerX + valRadius * Math.cos(angle);
            const y = centerY + valRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
        ctx.fill();
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    
    getDifferenceDetails(traitsA, traitsB, nameA, nameB) {
        const diffs = [];
        
        // 1. Math discrepancy
        const mathDiff = Math.abs(traitsA.quantitativePrecision - traitsB.quantitativePrecision);
        if (mathDiff > 40) {
            const highName = traitsA.quantitativePrecision > traitsB.quantitativePrecision ? nameA : nameB;
            const lowName = traitsA.quantitativePrecision > traitsB.quantitativePrecision ? nameB : nameA;
            diffs.push(`**Quantitative Divergence**: ${highName} solves technical formulas accurately, whereas ${lowName} avoids math and triggers verbal hand-waving.`);
        }
        
        // 2. Writing Verbosity
        const lenDiff = Math.abs(traitsA.verbosity - traitsB.verbosity);
        if (lenDiff > 35) {
            const longName = traitsA.verbosity > traitsB.verbosity ? nameA : nameB;
            const shortName = traitsA.verbosity > traitsB.verbosity ? nameB : nameA;
            diffs.push(`**Verbosity Mismatch**: ${longName} writes extremely long, prose-heavy answers, while ${shortName} prefers short, direct descriptions.`);
        }
        
        // 3. Stress handling
        const stressDiff = Math.abs(traitsA.stressThreshold - traitsB.stressThreshold);
        if (stressDiff > 35) {
            const weakName = traitsA.stressThreshold < traitsB.stressThreshold ? nameA : nameB;
            diffs.push(`**Stress Vulnerability**: ${weakName} has high stress reactivity under pressure, triggering severe spelling typos and panic behaviors.`);
        }
        
        // 4. Memory Gap
        const memDiff = Math.abs(traitsA.roteMemory - traitsB.roteMemory);
        if (memDiff > 35) {
            const lowName = traitsA.roteMemory < traitsB.roteMemory ? nameA : nameB;
            diffs.push(`**Recall Profile**: ${lowName} has low rote memory limits, causing citation date errors and missing researcher names.`);
        }
        
        if (diffs.length === 0) {
            diffs.push("Highly aligned! Profiles exhibit equivalent cognitive capacities, writing styles, and temperament curves.");
        }
        
        return diffs;
    }
    
    render() {
        const students = db.getStudents();
        
        // Handle preselection checks
        if (students.length < 2) {
            this.container.innerHTML = `
                <div class="empty-state-box">
                    <span>👥</span>
                    <h5>Insufficient Student twins</h5>
                    <p class="text-muted">Create at least two student twin profiles to activate the Comparison Engine.</p>
                </div>
            `;
            return;
        }
        
        const sA = db.getStudentById(this.studentAId) || students[0];
        const sB = db.getStudentById(this.studentBId) || students[1];
        
        const traitsA = db.getProfileByStudentId(sA.id);
        const traitsB = db.getProfileByStudentId(sB.id);
        
        const dnaA = db.getDNAByStudentId(sA.id);
        const dnaB = db.getDNAByStudentId(sB.id);
        
        // Similarity score computation
        const diffSum = Math.abs(traitsA.conceptualGrasp - traitsB.conceptualGrasp) +
                        Math.abs(traitsA.quantitativePrecision - traitsB.quantitativePrecision) +
                        Math.abs(traitsA.roteMemory - traitsB.roteMemory) +
                        Math.abs(traitsA.attentionSpan - traitsB.attentionSpan) +
                        Math.abs(traitsA.verbosity - traitsB.verbosity) +
                        Math.abs(traitsA.stressThreshold - traitsB.stressThreshold);
                        
        const similarity = Math.round(100 - (diffSum / 6));
        const diffReportList = this.getDifferenceDetails(traitsA, traitsB, sA.name, sB.name);
        
        const compHtml = `
            <div class="comparison-workspace-grid">
                <!-- Toolbar Selectors -->
                <div class="comparison-toolbar full-width">
                    <div class="comp-select-item">
                        <label>Student A (Amber):</label>
                        <select id="comp-select-a" class="preset-select" style="width:200px;">
                            ${students.map(s => `<option value="${s.id}" ${s.id === sA.id ? 'selected' : ''}>${s.name}</option>`).join("")}
                        </select>
                    </div>
                    
                    <div class="similarity-central-badge">
                        <span>Linguistic/Cognitive Overlap:</span>
                        <strong style="color:var(--accent-amber); font-size:1.15rem;">${similarity}% Match</strong>
                    </div>
                    
                    <div class="comp-select-item">
                        <label>Student B (Cyan):</label>
                        <select id="comp-select-b" class="preset-select" style="width:200px;">
                            ${students.map(s => `<option value="${s.id}" ${s.id === sB.id ? 'selected' : ''}>${s.name}</option>`).join("")}
                        </select>
                    </div>
                </div>
                
                <!-- Radar Overlay Panel -->
                <div class="profile-panel-card">
                    <h4>Overlaid Performance Blueprint</h4>
                    <p class="card-desc">Comparative radar chart mapping Student A (Amber) vs. Student B (Cyan) parameters.</p>
                    
                    <div class="radar-canvas-container" style="margin-top:1rem;">
                        <canvas id="comp-radar-canvas" style="width: 100%; height: 260px;"></canvas>
                    </div>
                    
                    <div class="legend-row" style="justify-content:center; margin-top:0.5rem; font-size:0.8rem;">
                        <span class="legend-dot" style="background:#f59e0b;"></span> ${sA.name}
                        <span class="legend-dot" style="background:#06b6d4; margin-left:1.5rem;"></span> ${sB.name}
                    </div>
                </div>
                
                <!-- Main Differences Panel -->
                <div class="profile-main-area" style="display:flex; flex-direction:column; gap:1.5rem;">
                    <!-- Table parameters comparison -->
                    <div class="profile-panel-card">
                        <h4>Parameters Comparison Matrix</h4>
                        <table class="report-table" style="margin-top:0.5rem; font-size:0.75rem;">
                            <thead>
                                <tr>
                                    <th>Metric Parameter</th>
                                    <th>${sA.name} (A)</th>
                                    <th>${sB.name} (B)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Conceptual Grasp</td>
                                    <td>${traitsA.conceptualGrasp}%</td>
                                    <td>${traitsB.conceptualGrasp}%</td>
                                </tr>
                                <tr>
                                    <td>Quantitative Precision</td>
                                    <td>${traitsA.quantitativePrecision}%</td>
                                    <td>${traitsB.quantitativePrecision}%</td>
                                </tr>
                                <tr>
                                    <td>Rote Memory Recall</td>
                                    <td>${traitsA.roteMemory}%</td>
                                    <td>${traitsB.roteMemory}%</td>
                                </tr>
                                <tr>
                                    <td>Average Sentence Length</td>
                                    <td>${dnaA ? dnaA.sentenceLengthAvg : 0} words</td>
                                    <td>${dnaB ? dnaB.sentenceLengthAvg : 0} words</td>
                                </tr>
                                <tr>
                                    <td>Analogy Density</td>
                                    <td>${dnaA ? dnaA.analogyDensity : 0}%</td>
                                    <td>${dnaB ? dnaB.analogyDensity : 0}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Discrepancy report list -->
                    <div class="profile-panel-card">
                        <h4>Cognitive Discrepancy Report</h4>
                        <div class="suggestions-list" style="margin-top:0.5rem;">
                            ${diffReportList.map(item => `
                                <div class="suggestion-item">
                                    <svg class="suggestion-bullet" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="3"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>
                                    <span>${item}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = compHtml;
        
        // Listeners for dropdowns change
        on($('#comp-select-a'), 'change', (e) => {
            this.studentAId = e.target.value;
            this.render();
        });
        
        on($('#comp-select-b'), 'change', (e) => {
            this.studentBId = e.target.value;
            this.render();
        });
        
        // Draw Canvas radar overlay
        setTimeout(() => {
            const canvas = $('#comp-radar-canvas');
            this.drawComparisonOverlay(canvas, traitsA, traitsB, sA.name, sB.name);
        }, 50);
    }
}
