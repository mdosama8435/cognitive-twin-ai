import { $, $$, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { calculateBriefQuality } from '../brief_parser/contradiction_detector.js';

/**
 * Multi-Student Brief Builder Component
 */
export class BriefEditor {
    constructor(container, appState, onChange) {
        this.container = container;
        this.appState = appState;
        this.onChange = onChange;
        this.autosaveTimeout = null;
    }
    
    init() {
        this.render();
    }
    
    handleInput(e) {
        const text = e.target.value;
        const studentId = this.appState.activeStudentId;
        
        // Dynamic Word count
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        $('#brief-word-count').textContent = `${wordCount} words`;
        
        // Auto-save indicator
        const autoSaveNode = $('#autosave-status');
        autoSaveNode.textContent = "Saving...";
        autoSaveNode.className = "autosave-saving";
        
        clearTimeout(this.autosaveTimeout);
        this.autosaveTimeout = setTimeout(() => {
            // Update Database brief text
            db.updateStudentBrief(studentId, text);
            
            // Recalculate stats
            const profile = db.getProfileByStudentId(studentId);
            const samples = db.getSimulationsByStudentId(studentId);
            const stats = calculateBriefQuality(profile, text, samples.length);
            
            // Sync twin score in DB
            const student = db.getStudentById(studentId);
            if (student) student.twinScore = stats.reliability;
            db.save();
            
            autoSaveNode.textContent = "Changes saved";
            autoSaveNode.className = "autosave-saved";
            
            this.onChange();
        }, 1000);
    }
    
    addWritingSample() {
        const sampleText = $('#sample-text').value;
        if (!sampleText || sampleText.trim() === "") return;
        
        const sId = this.appState.activeStudentId;
        const studentDna = db.getDNAByStudentId(sId);
        
        if (studentDna) {
            // Estimate new average length and increase transition density
            studentDna.sentenceLengthAvg = Math.round((studentDna.sentenceLengthAvg * 0.8 + 15) * 10) / 10;
            studentDna.transitionDensity = Math.round((studentDna.transitionDensity * 0.9 + 4) * 10) / 10;
            db.save();
        }
        
        $('#sample-text').value = "";
        
        // Redraw page
        this.render();
        this.onChange();
    }
    
    renderVersions() {
        const list = $('#version-list');
        if (!list) return;
        
        const sId = this.appState.activeStudentId;
        const brief = db.getBriefByStudentId(sId);
        if (!brief) return;
        
        const versions = db.data.version_history.filter(vh => vh.brief_id === brief.id);
        if (versions.length === 0) {
            list.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">No version history.</span>`;
            return;
        }
        
        list.innerHTML = versions.map(v => `
            <div class="version-item">
                <div>
                    <span class="version-action">${v.action}</span>
                    <span class="version-time">${v.timestamp}</span>
                </div>
                <button class="btn-restore btn-load-ver" data-text="${encodeURIComponent(v.text)}">Load</button>
            </div>
        `).join("");
        
        list.querySelectorAll('.btn-load-ver').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = decodeURIComponent(e.target.getAttribute('data-text'));
                $('#brief-textarea').value = text;
                db.updateStudentBrief(sId, text);
                this.onChange();
            });
        });
    }
    
    render() {
        const students = db.getStudents();
        const sId = this.appState.activeStudentId || students[0].id;
        this.appState.activeStudentId = sId;
        
        const student = db.getStudentById(sId);
        const brief = db.getBriefByStudentId(sId);
        const profile = db.getProfileByStudentId(sId);
        const dna = db.getDNAByStudentId(sId);
        
        const text = brief ? brief.markdown_text : "";
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const stats = calculateBriefQuality(profile, text, 1);
        
        const editorHtml = `
            <div class="brief-editor-grid">
                <!-- Main Editor Area -->
                <div class="editor-main-card">
                    <div class="card-header-row">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <h3>Brief Guidelines Editor</h3>
                            <select id="editor-student-select" class="preset-select" style="width:160px; padding:0.25rem;">
                                ${students.map(s => `<option value="${s.id}" ${s.id === sId ? 'selected' : ''}>Brief: ${s.name}</option>`).join("")}
                            </select>
                        </div>
                        <div id="autosave-status" class="autosave-saved">All changes saved</div>
                    </div>
                    
                    <div class="editor-meta">
                        <span id="brief-word-count">${wordCount} words</span>
                        <span>Twin Alignment: <strong style="color:var(--accent-amber);">${stats.reliability}%</strong></span>
                    </div>
                    
                    <textarea id="brief-textarea" class="brief-textarea">${text}</textarea>
                </div>
                
                <!-- Side Panel (Samples & Versioning) -->
                <div class="editor-side-panel">
                    <div class="editor-card">
                        <h4> L2 DNA Sample Uploader</h4>
                        <p class="card-desc">Paste text notes or essays to align vocabulary complexity weights.</p>
                        <textarea id="sample-text" class="sample-textarea" placeholder="Paste student writing sample..."></textarea>
                        <button id="btn-add-sample" class="btn-primary full-width" style="margin-top:0.5rem; justify-content:center;">Add Writing Sample</button>
                    </div>
                    
                    <div class="editor-card" style="flex:1;">
                        <h4>Brief Revision history</h4>
                        <div id="version-list" class="version-list-container">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = editorHtml;
        
        // Listeners
        on($('#brief-textarea'), 'input', (e) => this.handleInput(e));
        on($('#btn-add-sample'), 'click', () => this.addWritingSample());
        on($('#editor-student-select'), 'change', (e) => {
            this.appState.activeStudentId = e.target.value;
            this.render();
        });
        
        this.renderVersions();
    }
}
