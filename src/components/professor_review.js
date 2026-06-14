import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';

/**
 * Professor Review Portal & Turing Quiz Component
 */
export class ProfessorReview {
    constructor(container, appState, onCommentChange) {
        this.container = container;
        this.appState = appState;
        this.onCommentChange = onCommentChange;
        this.quizAttempted = false;
        this.selectedScript = null;
    }
    
    init() {
        this.render();
    }
    
    submitQuiz(choice) {
        this.quizAttempted = true;
        this.selectedScript = choice;
        this.render();
    }
    
    saveFeedback() {
        const sId = this.appState.activeStudentId;
        const comment = $('#prof-remarks-textarea').value;
        this.appState.profComments = comment;
        
        // Find latest simulation run
        const sims = db.getSimulationsByStudentId(sId);
        if (sims.length > 0) {
            const latestSim = sims[sims.length - 1];
            const student = db.getStudentById(sId);
            const score = student ? student.twinScore : 70;
            db.insertEvaluation(latestSim.id, score, comment);
        }
        
        if (this.onCommentChange) this.onCommentChange();
        
        // Show saved alert
        const saveAlert = $('#save-feedback-alert');
        saveAlert.style.display = 'block';
        setTimeout(() => {
            saveAlert.style.display = 'none';
        }, 1500);
    }
    
    render() {
        const sId = this.appState.activeStudentId;
        const student = db.getStudentById(sId);
        const percentage = student ? student.twinScore : 70;
        
        // Similarity scores based on stats
        const writingMatch = Math.round(percentage * 0.95);
        const reasoningMatch = Math.round(percentage * 0.92);
        const mistakeMatch = Math.round(percentage * 0.88);
        const behaviorMatch = Math.round(percentage * 0.90);
        
        const q1Text = this.appState.simulationAnswers.alex || "Run a simulation first to populate answers.";
        const q1AI = this.appState.simulationAnswers.ai || "Run a simulation first to populate answers.";
        const q1Perfect = this.appState.simulationAnswers.perfect || "Run a simulation first to populate answers.";
        
        let quizHtml = "";
        
        if (!this.appState.simulationCompleted) {
            quizHtml = `
                <div class="info-alert-box bg-amber" style="margin-top:1rem;">
                    <span class="info-badge warning">Simulation Required</span>
                    <p>You must run the exam validation simulation first in the **Exam Simulator** tab to generate the answers for this evaluation.</p>
                </div>
            `;
        } else if (!this.quizAttempted) {
            quizHtml = `
                <div class="turing-quiz-card">
                    <h5>Blind Identity Validation Game (Fool the Professor)</h5>
                    <p class="card-desc">Evaluate the three compiled exam responses below. Identify which answer successfully twins the student's authentic cognitive profile (${student ? student.name : "Alex"}).</p>
                    
                    <div class="turing-options-grid">
                        <div class="turing-option-box">
                            <h6>Script Option A</h6>
                            <p class="turing-script-preview">"${q1Text.slice(0, 180)}..."</p>
                            <button class="btn-primary btn-select-turing" data-choice="student">Select Script A</button>
                        </div>
                        <div class="turing-option-box">
                            <h6>Script Option B</h6>
                            <p class="turing-script-preview">"${q1AI.slice(0, 180)}..."</p>
                            <button class="btn-primary btn-select-turing" data-choice="brief">Select Script B</button>
                        </div>
                        <div class="turing-option-box">
                            <h6>Script Option C</h6>
                            <p class="turing-script-preview">"${q1Perfect.slice(0, 180)}..."</p>
                            <button class="btn-primary btn-select-turing" data-choice="perfect">Select Script C</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const isCorrect = this.selectedScript === "student";
            quizHtml = `
                <div class="turing-results-card ${isCorrect ? 'results-correct' : 'results-incorrect'}">
                    <h5>Identity Verification Results: ${isCorrect ? '✅ Success!' : '❌ Divergence Detected'}</h5>
                    <p class="card-desc">You selected **Script Option ${this.selectedScript === "student" ? "A" : this.selectedScript === "brief" ? "B" : "C"}**.</p>
                    
                    <div class="results-reveal-grid">
                        <div class="reveal-col">
                            <strong>Script A:</strong>
                            <span class="reveal-tag tag-student">Simulated Twin Student (${student ? student.name : "Alex"}-Sim)</span>
                        </div>
                        <div class="reveal-col">
                            <strong>Script B:</strong>
                            <span class="reveal-tag tag-brief">Brief-Guided GPT-4 Response</span>
                        </div>
                        <div class="reveal-col">
                            <strong>Script C:</strong>
                            <span class="reveal-tag tag-perfect">Perfect GPT-4 Control Answer</span>
                        </div>
                    </div>
                    
                    <div class="results-feedback-box">
                        ${isCorrect 
                            ? "Correct! You successfully identified the cognitive twin. This indicates that the simulated student's writing patterns and pacing logic accurately model the characteristics of the actual student."
                            : "Divergence! The AI twin was indistinguishable from other models. Refine parameters in the **Brief Builder**."
                        }
                    </div>
                    
                    <button id="btn-reset-quiz" class="btn-secondary" style="margin-top:1rem;">Retake Quiz</button>
                </div>
            `;
        }
        
        const pageHtml = `
            <div class="prof-review-layout">
                <div class="prof-top-grid">
                    <div class="prof-card">
                        <h4>Twin Similarity Scorecard</h4>
                        <div class="prof-metrics-grid">
                            <div class="prof-metric-row">
                                <div class="prof-lbl-row"><span>Writing DNA Alignment:</span> <strong>${writingMatch}%</strong></div>
                                <div class="prof-progress"><div class="prof-fill" style="width: ${writingMatch}%; background: var(--accent-cyan);"></div></div>
                            </div>
                            <div class="prof-metric-row">
                                <div class="prof-lbl-row"><span>Reasoning Logic Similarity:</span> <strong>${reasoningMatch}%</strong></div>
                                <div class="prof-progress"><div class="prof-fill" style="width: ${reasoningMatch}%; background: var(--accent-amber);"></div></div>
                            </div>
                            <div class="prof-metric-row">
                                <div class="prof-lbl-row"><span>Mistake Envelope Alignment:</span> <strong>${mistakeMatch}%</strong></div>
                                <div class="prof-progress"><div class="prof-fill" style="width: ${mistakeMatch}%; background: var(--accent-rose);"></div></div>
                            </div>
                            <div class="prof-metric-row">
                                <div class="prof-lbl-row"><span>Exam Pacing Similarity:</span> <strong>${behaviorMatch}%</strong></div>
                                <div class="prof-progress"><div class="prof-fill" style="width: ${behaviorMatch}%; background: var(--accent-emerald);"></div></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="prof-card">
                        <h4>Evaluator Remarks & Notes</h4>
                        <p class="card-desc">Observations will be appended to the print report.</p>
                        <textarea id="prof-remarks-textarea" class="prof-textarea-input" placeholder="Type evaluator remarks here...">${this.appState.profComments || ""}</textarea>
                        <button id="btn-save-remarks" class="btn-primary full-width" style="margin-top:0.75rem; justify-content:center;">Save Remarks</button>
                        <div id="save-feedback-alert" class="autosave-saved" style="display:none; text-align:center; margin-top:0.5rem;">Remarks appended!</div>
                    </div>
                </div>
                
                <div class="prof-bottom-area">
                    ${quizHtml}
                </div>
            </div>
        `;
        
        this.container.innerHTML = pageHtml;
        
        // Listeners
        this.container.querySelectorAll('.btn-select-turing').forEach(btn => {
            btn.addEventListener('click', (e) => this.submitQuiz(e.target.getAttribute('data-choice')));
        });
        
        if ($('#btn-reset-quiz')) {
            on($('#btn-reset-quiz'), 'click', () => {
                this.quizAttempted = false;
                this.selectedScript = null;
                this.render();
            });
        }
        
        if ($('#btn-save-remarks')) {
            on($('#btn-save-remarks'), 'click', () => this.saveFeedback());
        }
    }
}
