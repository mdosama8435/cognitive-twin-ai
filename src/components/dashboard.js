import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { drawTwinGauge } from '../visualizations/canvas_charts.js';

/**
 * SaaS Research Dashboard Overview Component
 */
export class Dashboard {
    constructor(container, onAction) {
        this.container = container;
        this.onAction = onAction;
    }
    
    init() {
        this.render();
    }
    
    render() {
        const students = db.getStudents();
        const numStudents = students.length;
        
        // Compute averages
        const avgAccuracy = numStudents === 0 ? 0 : Math.round(students.reduce((sum, s) => sum + s.twinScore, 0) / numStudents);
        const totalSims = db.data.simulations.length;
        
        // System contradiction counts
        const numConflicts = db.data.cognitive_profiles.reduce((sum, cp) => {
            const conflicts = db.getProfileByStudentId(cp.student_id);
            // mock counting logic
            return sum + (cp.traits.quantitativePrecision > 70 && cp.traits.weaknesses.toLowerCase().includes("math") ? 1 : 0);
        }, 0);
        
        const dashHtml = `
            <div class="dashboard-saas-layout">
                <!-- Top KPIs Cards Row -->
                <div class="saas-kpis-grid">
                    <div class="kpi-card">
                        <span class="kpi-lbl">Total Students Twins</span>
                        <strong class="kpi-val">${numStudents}</strong>
                        <span class="kpi-trend text-emerald">Active Calibrations</span>
                    </div>
                    
                    <div class="kpi-card">
                        <span class="kpi-lbl">Average Twin Accuracy</span>
                        <strong class="kpi-val text-amber">${avgAccuracy}%</strong>
                        <span class="kpi-trend text-emerald">99.9% Scanning Rigor</span>
                    </div>
                    
                    <div class="kpi-card">
                        <span class="kpi-lbl">Simulations Completed</span>
                        <strong class="kpi-val">${totalSims}</strong>
                        <span class="kpi-trend text-cyan">Validation Runs</span>
                    </div>
                    
                    <div class="kpi-card">
                        <span class="kpi-lbl">Logical Conflicts</span>
                        <strong class="kpi-val" style="color:${numConflicts > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'};">${numConflicts}</strong>
                        <span class="kpi-trend ${numConflicts > 0 ? 'text-rose' : 'text-muted'}">${numConflicts > 0 ? 'Warnings Flagged' : 'Zero Collisions'}</span>
                    </div>
                </div>
                
                <!-- Main split panels -->
                <div class="dash-grid-top" style="margin-top:1.5rem;">
                    <!-- Twin accuracy gauge circular track -->
                    <div class="dash-card center-align">
                        <h4 style="font-family:var(--font-heading); font-size:1rem; margin-bottom:1rem;">Average System Similarity</h4>
                        <canvas id="dash-twin-gauge" style="width: 100%; height: 160px;"></canvas>
                    </div>
                    
                    <!-- Recent simulations list logs -->
                    <div class="dash-card">
                        <h4>Recent Lab Executions</h4>
                        <div class="status-list" style="margin-top:0.75rem;">
                            ${db.data.simulations.length === 0
                                ? `<div class="text-muted" style="font-size:0.8rem; padding:1rem 0;">No simulations run yet. Go to **Exam Simulator** to validate.</div>`
                                : db.data.simulations.slice(-4).reverse().map(sim => {
                                    const s = db.getStudentById(sim.student_id);
                                    return `
                                        <div class="status-item">
                                            <span class="status-dot green"></span>
                                            <span>Twin emulated for <strong>${s ? s.name : "Alex"}</strong> on ${sim.date}</span>
                                        </div>
                                    `;
                                }).join("")
                            }
                        </div>
                    </div>
                </div>
                
                <!-- Quick Navigation cards -->
                <div class="dash-card" style="margin-top:1.5rem;">
                    <h4>SaaS Laboratory Navigation Actions</h4>
                    <div class="quick-actions-row">
                        <button class="btn-action-card" data-target="interview">
                            <div class="action-num">01</div>
                            <strong>Create Cognitive Twin</strong>
                            <span>7-step onboarding calibration</span>
                        </button>
                        <button class="btn-action-card" data-target="student-library">
                            <div class="action-num">02</div>
                            <strong>Student Library</strong>
                            <span>View, compare, or clone student models</span>
                        </button>
                        <button class="btn-action-card" data-target="brief-builder">
                            <div class="action-num">03</div>
                            <strong>Brief builder</strong>
                            <span>Refine markdown guidelines editor</span>
                        </button>
                        <button class="btn-action-card" data-target="student-comparison">
                            <div class="action-num">04</div>
                            <strong>Compare twins</strong>
                            <span>Benchmark student parameters side-by-side</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = dashHtml;
        
        // Navigation binds
        this.container.querySelectorAll('.btn-action-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.onAction(target);
            });
        });
        
        // Draw circular twin gauge
        setTimeout(() => {
            const canvas = $('#dash-twin-gauge');
            if (canvas) drawTwinGauge(canvas, avgAccuracy);
        }, 50);
    }
}
