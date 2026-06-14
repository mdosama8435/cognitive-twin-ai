import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { analyzeWritingDNA } from '../services/dna_analyzer.js';
import { calculateBriefQuality } from '../brief_parser/contradiction_detector.js';

/**
 * Writing DNA Analyzer Component
 */
export class WritingDNA {
    constructor(container, appState, onChange) {
        this.container = container;
        this.appState = appState;
        this.onChange = onChange;
        this.currentDNAStats = null;
    }

    init() {
        this.render();
    }

    handleAnalyze() {
        const textSample = $('#dna-textarea').value;
        if (!textSample || textSample.trim() === "") return;

        // Perform analysis
        const dna = analyzeWritingDNA(textSample);
        this.currentDNAStats = dna;

        // Update active student DNA stats in database
        const studentId = this.appState.activeStudentId;
        const studentDna = db.getDNAByStudentId(studentId);
        if (studentDna) {
            // Blend existing DNA stats with new sample stats
            studentDna.sentenceLengthAvg = Math.round(((studentDna.sentenceLengthAvg + dna.sentenceLengthAvg) / 2) * 10) / 10;
            studentDna.sentenceLengthStdDev = Math.round(((studentDna.sentenceLengthStdDev + dna.sentenceLengthStdDev) / 2) * 10) / 10;
            studentDna.analogyDensity = Math.round(((studentDna.analogyDensity + dna.analogyDensity) / 2) * 10) / 10;
            studentDna.transitionDensity = Math.round(((studentDna.transitionDensity + dna.transitionDensity) / 2) * 10) / 10;
            studentDna.passiveVoiceDensity = Math.round(((studentDna.passiveVoiceDensity + dna.passiveVoiceDensity) / 2) * 10) / 10;
            studentDna.lexicalDensity = Math.round(((studentDna.lexicalDensity + dna.lexicalDensity) / 2) * 10) / 10;
        }

        // Add to writing samples list in appState/db simulations if needed
        // For local simulation, let's keep writing samples in database simulations/evals or version histories
        if (!db.data.simulations) db.data.simulations = [];
        db.data.simulations.push({
            id: `sim_sample_${Date.now()}`,
            student_id: studentId,
            date: new Date().toISOString().split('T')[0],
            answers: { alex: textSample, brief: "Uploaded sample text for L2 DNA alignment", perfect: "" }
        });

        // Recalculate twin score & brief quality
        const student = db.getStudentById(studentId);
        const profile = db.getProfileByStudentId(studentId);
        const brief = db.getBriefByStudentId(studentId);
        if (student && brief && profile) {
            const stats = calculateBriefQuality(profile, brief.markdown_text, db.getSimulationsByStudentId(studentId).length);
            student.twinScore = stats.reliability;
        }

        db.save();

        // Re-render to show updated stats and history
        this.render();
        if (this.onChange) this.onChange();
    }

    render() {
        const students = db.getStudents();
        const studentId = this.appState.activeStudentId || students[0].id;
        this.appState.activeStudentId = studentId;

        const student = db.getStudentById(studentId);
        const dnaStats = db.getDNAByStudentId(studentId);

        const textSample = $('#dna-textarea') ? $('#dna-textarea').value : "";

        const compHtml = `
            <div class="brief-editor-grid">
                <!-- Main Analyzer Workspace -->
                <div class="editor-main-card">
                    <div class="card-header-row">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <h3>Linguistic DNA Parser</h3>
                            <select id="dna-student-select" class="preset-select" style="width:160px; padding:0.25rem;">
                                ${students.map(s => `<option value="${s.id}" ${s.id === studentId ? 'selected' : ''}>DNA: ${s.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    
                    <p class="card-desc" style="margin-bottom:1rem;">Upload a sample of student writing to reverse-engineer their syntax fingerprint, passive construction ratio, and vocabulary complexity.</p>
                    
                    <div class="form-group">
                        <textarea id="dna-textarea" class="brief-textarea" style="height: 180px;" placeholder="Paste student writing/notes sample here...">${textSample}</textarea>
                    </div>
                    
                    <button id="btn-run-dna" class="btn-primary" style="margin-top:1rem; justify-content:center;">Run DNA Analyzer</button>
                </div>
                
                <!-- Sidebar Results -->
                <div class="editor-side-panel">
                    <div class="editor-card">
                        <h4>Calibrated DNA Footprint</h4>
                        <p class="card-desc">Current aggregated profile parameters for <strong>${student ? student.name : "Alex"}</strong>.</p>
                        
                        <div class="dna-results" style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.8rem; margin-top:0.75rem;">
                            <div class="summary-trait-row"><span>Average Sentence Length:</span> <strong>${dnaStats ? dnaStats.sentenceLengthAvg : 0} words</strong></div>
                            <div class="summary-trait-row"><span>Sentence Variance (Std Dev):</span> <strong>${dnaStats ? dnaStats.sentenceLengthStdDev : 0}</strong></div>
                            <div class="summary-trait-row"><span>Analogy / Metaphor Index:</span> <strong>${dnaStats ? dnaStats.analogyDensity : 0}%</strong></div>
                            <div class="summary-trait-row"><span>Transitions Density:</span> <strong>${dnaStats ? dnaStats.transitionDensity : 0}%</strong></div>
                            <div class="summary-trait-row"><span>Passive Voice Ratio:</span> <strong>${dnaStats ? dnaStats.passiveVoiceDensity : 0}%</strong></div>
                            <div class="summary-trait-row"><span>Lexical Density (Complexity):</span> <strong>${dnaStats ? dnaStats.lexicalDensity : 0}%</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = compHtml;

        // Binds
        on($('#btn-run-dna'), 'click', () => this.handleAnalyze());
        on($('#dna-student-select'), 'change', (e) => {
            this.appState.activeStudentId = e.target.value;
            this.render();
        });
    }
}
