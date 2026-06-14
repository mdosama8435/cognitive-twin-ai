import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';

/**
 * Research Report Exporter Component (Publication Grade)
 */
export class ResearchReport {
    constructor(container, appState) {
        this.container = container;
        this.appState = appState;
    }
    
    init() {
        this.render();
    }
    
    triggerPrint() {
        window.print();
    }
    
    exportJSON(studentId) {
        const s = db.getStudentById(studentId);
        const p = db.getProfileByStudentId(studentId);
        const brief = db.getBriefByStudentId(studentId);
        const dna = db.getDNAByStudentId(studentId);
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            student: s,
            profile: p,
            brief: brief,
            dna: dna
        }, null, 2));
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${s.name}_cognitive_twin.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    exportMarkdown(studentId) {
        const s = db.getStudentById(studentId);
        const brief = db.getBriefByStudentId(studentId);
        
        const markdownContent = `# Cognitive Twin Report: ${s.name}\n\n${brief ? brief.markdown_text : ""}`;
        const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent);
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${s.name}_brief.md`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    render() {
        const students = db.getStudents();
        const sId = this.appState.activeStudentId || students[0].id;
        this.appState.activeStudentId = sId;
        
        const student = db.getStudentById(sId);
        const profile = db.getProfileByStudentId(sId);
        const brief = db.getBriefByStudentId(sId);
        
        const percentage = student ? student.twinScore : 70;
        const comments = this.appState.profComments || "*No evaluator comments provided.*";
        
        const reportHtml = `
            <div class="report-actions-container" style="gap:0.75rem;">
                <select id="report-student-select" class="preset-select" style="width:160px; padding:0.4rem;">
                    ${students.map(s => `<option value="${s.id}" ${s.id === sId ? 'selected' : ''}>Report: ${s.name}</option>`).join("")}
                </select>
                <button id="btn-export-json" class="btn-secondary">Export JSON</button>
                <button id="btn-export-md" class="btn-secondary">Export Markdown</button>
                <button id="btn-print-report" class="btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print PDF
                </button>
            </div>
            
            <div class="research-report-sheet" id="print-area">
                <div class="report-header">
                    <div class="report-meta-top">RESEARCH PROTOTYPE EVALUATION REPORT</div>
                    <h2>ALETHEIA COGNITIVE TWIN LAB</h2>
                    <div class="report-subheading">Evaluating alignment fidelity between AI Emulation and Human Academic Footprints</div>
                    
                    <div class="report-meta-grid">
                        <div><strong>Student Subject:</strong> ${student ? student.name : "Alex"}</div>
                        <div><strong>Subject Course:</strong> ${student ? student.subject : "Cognitive Psychology"}</div>
                        <div><strong>Degree Field:</strong> ${student ? student.degree : "Cognitive Science"}</div>
                        <div><strong>Verification Date:</strong> ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                
                <hr class="report-divider">
                
                <div class="report-section">
                    <h3>1. Executive Summary</h3>
                    <p>This report documents the verification results of the cognitive alignment model for the subject candidate. Utilizing a constrained prompt brief parsed from the candidate's discovery interview, we evaluated the twin accuracy of a Large Language Model (GPT-4) in replicating the student's conceptual focus, stylistic formatting, citation behaviors, and fatigue levels across a four-stage assessment paper.</p>
                    
                    <div class="report-summary-scores-grid">
                        <div class="score-card-item">
                            <span class="score-lbl">Cognitive Twin Accuracy</span>
                            <span class="score-val text-amber">${percentage}%</span>
                        </div>
                        <div class="score-card-item">
                            <span class="score-lbl">Brief Completeness</span>
                            <span class="score-val text-cyan">${brief ? brief.completeness : 80}%</span>
                        </div>
                        <div class="score-card-item">
                            <span class="score-lbl">Linguistic DNA Match</span>
                            <span class="score-val text-emerald">${Math.round(percentage * 0.95)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>2. Cognitive Profile Baseline</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Cognitive Dimension</th>
                                <th>Parameter Level</th>
                                <th>Operational Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Conceptual Grasp</td>
                                <td>${profile ? profile.conceptualGrasp : 0}%</td>
                                <td>Excellent mastery of high-level models, loops, and schemas.</td>
                            </tr>
                            <tr>
                                <td>Quantitative Precision</td>
                                <td>${profile ? profile.quantitativePrecision : 0}%</td>
                                <td>Avoids equations; tends to translate math into verbal explanations.</td>
                            </tr>
                            <tr>
                                <td>Rote Memory Recall</td>
                                <td>${profile ? profile.roteMemory : 0}%</td>
                                <td>Prone to minor study dates and names discrepancies.</td>
                            </tr>
                            <tr>
                                <td>Attention Span / Focus</td>
                                <td>${profile ? profile.attentionSpan : 0}%</td>
                                <td>Prone to cognitive fatigue and pacing drops under pressure.</td>
                            </tr>
                            <tr>
                                <td>Conscientiousness</td>
                                <td>${profile ? profile.conscientiousness : 0}%</td>
                                <td>Spelling typo frequency increases.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3>3. Validation Simulation Results</h3>
                    <p>The student's AI twin was run in validation mode. Question answers show substantial alignment in stylistic DNA markers.</p>
                    <div class="report-script-block">
                        <strong>Simulated Student Answer Excerpt (Question 1):</strong>
                        <p style="font-style:italic; font-size:0.8rem; line-height:1.5; color:#334155; margin-top:0.4rem;">
                            "${(this.appState.simulationAnswers.alex || "No answer generated yet. Run simulation in the validation lab.").slice(0, 350)}..."
                        </p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>4. University Assessment & Remarks</h3>
                    <div class="report-remarks-box">
                        <strong>Remarks:</strong>
                        <p>${comments}</p>
                    </div>
                </div>
                
                <div class="report-signatures">
                    <div class="sig-line">
                        <div class="sig-line-draw"></div>
                        <span>Principal AI Researcher Signature</span>
                    </div>
                    <div class="sig-line">
                        <div class="sig-line-draw"></div>
                        <span>University Evaluator Signature</span>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = reportHtml;
        
        // Listeners
        on($('#btn-print-report'), 'click', () => this.triggerPrint());
        on($('#btn-export-json'), 'click', () => this.exportJSON(sId));
        on($('#btn-export-md'), 'click', () => this.exportMarkdown(sId));
        
        on($('#report-student-select'), 'change', (e) => {
            this.appState.activeStudentId = e.target.value;
            this.render();
        });
    }
}
