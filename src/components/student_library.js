import { $, $$, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { generateCloneImpact } from '../student_profiles/clone_engine.js';

/**
 * Student Library Dashboard Component (Grid / List CRUD workspace)
 */
export class StudentLibrary {
    constructor(container, onAction) {
        this.container = container;
        this.onAction = onAction; // Callback to navigate pages (e.g. go to profile, simulator, compare)
        this.viewMode = "grid"; // grid or list
        this.searchQuery = "";
        this.sortBy = "name";
        this.filterSubject = "all";
    }
    
    init() {
        this.render();
    }
    
    handleClone(studentId) {
        const student = db.getStudentById(studentId);
        const traits = db.getProfileByStudentId(studentId);
        const dna = db.getDNAByStudentId(studentId);
        const brief = db.getBriefByStudentId(studentId);
        
        if (!student) return;
        
        // Open a modal to customize mutated parameters for the clone
        let cloneModal = $('#clone-modal');
        if (!cloneModal) {
            cloneModal = document.createElement('div');
            cloneModal.id = "clone-modal";
            cloneModal.className = "modal-overlay";
            this.container.appendChild(cloneModal);
        }
        
        cloneModal.innerHTML = `
            <div class="modal-content-card">
                <div class="modal-header">
                    <h4>Clone Cognitive Twin</h4>
                    <button class="btn-close-modal" id="btn-close-clone">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="card-desc" style="margin-bottom:0.75rem;">Create an experimental mutation clone of <strong>${student.name}</strong> to test behavioral drift.</p>
                    
                    <div class="form-group">
                        <label>Cloned Name</label>
                        <input type="text" id="clone-name" value="${student.name} (Mutated)" class="form-input">
                    </div>
                    
                    <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.75rem;">
                        <div class="form-group">
                            <label>Confidence Level mutation: <span class="val-badge" id="c-conf-badge">30%</span></label>
                            <input type="range" id="clone-conf" min="10" max="100" value="30" class="slider">
                        </div>
                        
                        <div class="form-group">
                            <label>Stress Resistance mutation: <span class="val-badge" id="c-stress-badge">85%</span></label>
                            <input type="range" id="clone-stress" min="10" max="100" value="85" class="slider">
                        </div>
                    </div>
                    
                    <div class="clone-impact-box" style="margin-top:1rem; background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:6px; font-size:0.75rem;">
                        <strong>Experimental Hypothesis:</strong>
                        <p id="clone-hypothesis" class="text-muted" style="margin-top:0.25rem;">Lowering confidence and increasing stress reactivity will trigger a higher rate of 'Panic Pivots' and spelling typos during testing.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-cancel-clone">Cancel</button>
                    <button class="btn-primary" id="btn-submit-clone">Execute Mutation</button>
                </div>
            </div>
        `;
        
        cloneModal.style.display = "flex";
        
        // Listeners inside modal
        $('#btn-close-clone').addEventListener('click', () => cloneModal.style.display = "none");
        $('#btn-cancel-clone').addEventListener('click', () => cloneModal.style.display = "none");
        
        const sliderConf = $('#clone-conf');
        const sliderStress = $('#clone-stress');
        const badgeConf = $('#c-conf-badge');
        const badgeStress = $('#c-stress-badge');
        const hypothesis = $('#clone-hypothesis');
        
        const updateHypothesis = () => {
            const conf = parseInt(sliderConf.value);
            const stress = parseInt(sliderStress.value);
            
            // Generate clone impact analysis
            const tempTraits = { ...traits, confidenceLevel: conf, stressThreshold: stress };
            const impact = generateCloneImpact(traits, tempTraits);
            
            let desc = `<strong>Predicted Score Shift:</strong> <span style="color:${impact.expectedScoreShift >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${impact.expectedScoreShift >= 0 ? '+' : ''}${impact.expectedScoreShift}%</span><br><br>`;
            
            if (impact.behavioralImpacts.length > 0) {
                desc += `<strong>Behavioral Adjustments:</strong><br>`;
                impact.behavioralImpacts.forEach(imp => {
                    desc += `<div style="margin-top:0.25rem;">• <em>${imp.variable} (${imp.shift}):</em> ${imp.pacingImpact} ${imp.errorImpact}</div>`;
                });
            }
            
            if (impact.dnaShifts.length > 0) {
                desc += `<br><strong>DNA Shifts:</strong><br>`;
                impact.dnaShifts.forEach(shift => {
                    desc += `<div style="margin-top:0.15rem;">• ${shift}</div>`;
                });
            }
            
            hypothesis.innerHTML = desc;
        };
        
        sliderConf.addEventListener('input', (e) => {
            badgeConf.textContent = `${e.target.value}%`;
            updateHypothesis();
        });
        sliderStress.addEventListener('input', (e) => {
            badgeStress.textContent = `${e.target.value}%`;
            updateHypothesis();
        });
        
        $('#btn-submit-clone').addEventListener('click', () => {
            const newName = $('#clone-name').value;
            const newConf = parseInt(sliderConf.value);
            const newStress = parseInt(sliderStress.value);
            
            // Insert cloned record
            const newTraits = { ...traits, confidenceLevel: newConf, stressThreshold: newStress };
            const newStudentId = `c_${Date.now()}`;
            
            db.insertStudent(
                { id: newStudentId, name: newName, degree: student.degree, subject: student.subject, twinScore: 68 },
                newTraits,
                brief.markdown_text,
                dna
            );
            
            cloneModal.style.display = "none";
            this.render(); // Redraw library
        });
    }
    
    handleDelete(studentId) {
        if (confirm("Are you sure you want to delete this Student Cognitive Twin? This action is permanent.")) {
            db.deleteStudent(studentId);
            this.render();
        }
    }
    
    registerListeners() {
        // Toggle view buttons
        const btnGrid = $('#btn-view-grid');
        const btnList = $('#btn-view-list');
        
        if (btnGrid) {
            btnGrid.addEventListener('click', () => {
                this.viewMode = "grid";
                this.render();
            });
        }
        if (btnList) {
            btnList.addEventListener('click', () => {
                this.viewMode = "list";
                this.render();
            });
        }
        
        // Search & Filters inputs
        const searchInput = $('#lib-search-input');
        const selectSubject = $('#lib-filter-subject');
        const selectSort = $('#lib-sort-select');
        
        if (searchInput) {
            on(searchInput, 'input', (e) => {
                this.searchQuery = e.target.value;
                this.renderListOnly();
            });
        }
        
        if (selectSubject) {
            on(selectSubject, 'change', (e) => {
                this.filterSubject = e.target.value;
                this.renderListOnly();
            });
        }
        
        if (selectSort) {
            on(selectSort, 'change', (e) => {
                this.sortBy = e.target.value;
                this.renderListOnly();
            });
        }
    }
    
    renderListOnly() {
        const students = db.getStudents(this.searchQuery, this.sortBy, this.filterSubject);
        const container = $('#library-mount-container');
        if (!container) return;
        
        if (students.length === 0) {
            container.innerHTML = `
                <div class="empty-state-box full-width">
                    <span style="font-size: 1.5rem;">🔍</span>
                    <h5>No twins matched query</h5>
                    <p class="text-muted">Adjust search terms or select another preset filter.</p>
                </div>
            `;
            return;
        }
        
        if (this.viewMode === "grid") {
            container.innerHTML = students.map(s => {
                const brief = db.getBriefByStudentId(s.id) || { completeness: 80 };
                return `
                    <div class="student-card">
                        <div class="card-header-row">
                            <h4>${s.name}</h4>
                            <span class="score-badge">${s.twinScore}% Match</span>
                        </div>
                        <span class="card-degree-text">${s.degree}</span>
                        <div class="card-subject-tag">${s.subject}</div>
                        
                        <div class="card-metrics-row">
                            <div class="card-metric-col">
                                <span>Completeness</span>
                                <strong>${brief.completeness}%</strong>
                            </div>
                            <div class="card-metric-col">
                                <span>Last Verified</span>
                                <strong>${s.lastSimulatedAt || "Never"}</strong>
                            </div>
                        </div>
                        
                        <div class="card-actions-grid">
                            <button class="btn-primary btn-lib-sim" data-id="${s.id}">Simulate</button>
                            <button class="btn-secondary btn-lib-comp" data-id="${s.id}">Compare</button>
                            <button class="btn-secondary btn-lib-profile" data-id="${s.id}">Profile</button>
                            <button class="btn-secondary btn-lib-clone" data-id="${s.id}">Clone</button>
                            <button class="btn-delete-icon btn-lib-del" data-id="${s.id}" title="Delete Twin">&times;</button>
                        </div>
                    </div>
                `;
            }).join("");
        } else {
            // List View Table
            container.innerHTML = `
                <table class="library-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Degree Program</th>
                            <th>Exam Subject</th>
                            <th>Twin Score</th>
                            <th>Last Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td><strong>${s.name}</strong></td>
                                <td>${s.degree}</td>
                                <td>${s.subject}</td>
                                <td><strong style="color:var(--accent-amber);">${s.twinScore}%</strong></td>
                                <td>${s.lastSimulatedAt || "Never"}</td>
                                <td>
                                    <div style="display:flex; gap:0.4rem;">
                                        <button class="btn-restore btn-lib-sim" data-id="${s.id}">Simulate</button>
                                        <button class="btn-restore btn-lib-comp" data-id="${s.id}">Compare</button>
                                        <button class="btn-restore btn-lib-profile" data-id="${s.id}">Profile</button>
                                        <button class="btn-restore btn-lib-clone" data-id="${s.id}">Clone</button>
                                        <button class="btn-restore btn-lib-del" data-id="${s.id}" style="color:var(--accent-rose);">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }
        
        // Attach action click listeners
        container.querySelectorAll('.btn-lib-sim').forEach(btn => {
            btn.addEventListener('click', (e) => this.onAction("simulate", e.target.getAttribute('data-id')));
        });
        container.querySelectorAll('.btn-lib-comp').forEach(btn => {
            btn.addEventListener('click', (e) => this.onAction("compare", e.target.getAttribute('data-id')));
        });
        container.querySelectorAll('.btn-lib-profile').forEach(btn => {
            btn.addEventListener('click', (e) => this.onAction("profile", e.target.getAttribute('data-id')));
        });
        container.querySelectorAll('.btn-lib-clone').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleClone(e.target.getAttribute('data-id')));
        });
        container.querySelectorAll('.btn-lib-del').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e.target.getAttribute('data-id')));
        });
    }
    
    render() {
        const subjects = db.getStudentSubjects();
        
        const libraryHtml = `
            <div class="library-workspace-container">
                <!-- Toolbar controls -->
                <div class="library-toolbar">
                    <div class="toolbar-left-group">
                        <input type="text" id="lib-search-input" class="form-input" placeholder="Search student names, subjects..." value="${this.searchQuery}" style="width:240px;">
                        
                        <select id="lib-filter-subject" class="preset-select" style="width:180px;">
                            ${subjects.map(sub => `<option value="${sub}" ${this.filterSubject === sub ? 'selected' : ''}>Subject: ${sub === 'all' ? 'All Subjects' : sub}</option>`).join("")}
                        </select>
                        
                        <select id="lib-sort-select" class="preset-select" style="width:140px;">
                            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Sort: Name</option>
                            <option value="score" ${this.sortBy === 'score' ? 'selected' : ''}>Sort: Twin Score</option>
                            <option value="subject" ${this.sortBy === 'subject' ? 'selected' : ''}>Sort: Subject</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-right-group">
                        <button id="btn-view-grid" class="btn-secondary" style="padding:0.4rem 0.6rem; border-color:${this.viewMode === 'grid' ? 'var(--accent-amber)' : 'var(--border-color)'};">Grid</button>
                        <button id="btn-view-list" class="btn-secondary" style="padding:0.4rem 0.6rem; border-color:${this.viewMode === 'list' ? 'var(--accent-amber)' : 'var(--border-color)'};">List</button>
                    </div>
                </div>
                
                <!-- Content cards grid or table row mount point -->
                <div class="library-grid" id="library-mount-container">
                    <!-- Populated dynamically -->
                </div>
            </div>
        `;
        
        this.container.innerHTML = libraryHtml;
        this.registerListeners();
        this.renderListOnly();
    }
}
