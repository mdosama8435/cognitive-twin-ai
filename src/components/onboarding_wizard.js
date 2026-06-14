import { $, html, on } from '../utils/dom.js';
import { db } from '../services/db.js';
import { generateBrief } from '../services/brief_generator.js';

/**
 * 7-Step Professional Student Onboarding Wizard
 */
export class OnboardingWizard {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete; // Redirect callback
        this.currentStep = 0;
        
        this.state = {
            name: "",
            degree: "B.Sc. Psychology",
            subject: "Cognitive Science",
            level: "Undergraduate",
            strongTopics: "Schema retrieval, visual memory processes",
            weakTopics: "Computational math models, anatomical cortex tracts",
            favTopics: "Loftus eye-witness studies",
            avoidedTopics: "logarithmic decay formula",
            learningStyle: "Conceptual",
            writingStyle: "Prose-heavy",
            verbosity: 70,
            diagrams: "Rarely",
            bullets: "Avoids",
            examples: "Familiar analogies",
            confidence: 75,
            stressThreshold: 60,
            timeSensitivity: 50,
            conscientiousness: 70,
            mistakePatterns: "Formula slips, misremembering researcher names"
        };
        
        this.steps = [
            {
                title: "1. Basic Information",
                subtitle: "Select student baseline program identity",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="ob-name" value="${this.state.name}" class="form-input" placeholder="E.g., Osama">
                        </div>
                        <div class="form-group">
                            <label>Degree Program</label>
                            <input type="text" id="ob-degree" value="${this.state.degree}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Course / Subject</label>
                            <input type="text" id="ob-subject" value="${this.state.subject}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Academic Level</label>
                            <select id="ob-level" class="preset-select">
                                <option value="Undergraduate" ${this.state.level === 'Undergraduate' ? 'selected' : ''}>Undergraduate</option>
                                <option value="Graduate" ${this.state.level === 'Graduate' ? 'selected' : ''}>Graduate</option>
                                <option value="Postgraduate" ${this.state.level === 'Postgraduate' ? 'selected' : ''}>Postgraduate</option>
                            </select>
                        </div>
                    </div>
                `
            },
            {
                title: "2. Subject Knowledge Profile",
                subtitle: "Specify modules candidates understand vs. avoid",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Strong/Comfortable Topics</label>
                            <input type="text" id="ob-strong" value="${this.state.strongTopics}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Weak/Struggled Topics</label>
                            <input type="text" id="ob-weak" value="${this.state.weakTopics}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Favorite Topic Focus</label>
                            <input type="text" id="ob-fav" value="${this.state.favTopics}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Avoided Details (e.g. math/biology)</label>
                            <input type="text" id="ob-avoid" value="${this.state.avoidedTopics}" class="form-input">
                        </div>
                    </div>
                `
            },
            {
                title: "3. Learning Style Core",
                subtitle: "Rate spatial, memory, and theoretical priorities",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Dominant Learning Path</label>
                            <select id="ob-learn" class="preset-select">
                                <option value="Conceptual" ${this.state.learningStyle === 'Conceptual' ? 'selected' : ''}>Conceptual & Theoretical</option>
                                <option value="Visual" ${this.state.learningStyle === 'Visual' ? 'selected' : ''}>Visual & Metaphors</option>
                                <option value="Practical" ${this.state.learningStyle === 'Practical' ? 'selected' : ''}>Practical & Case Studies</option>
                                <option value="Memorization" ${this.state.learningStyle === 'Memorization' ? 'selected' : ''}>Memorization & Formula-heavy</option>
                            </select>
                        </div>
                    </div>
                `
            },
            {
                title: "4. Writing DNA Blueprint",
                subtitle: "Describe prose structures and citation style",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Verbosity (Answer Length): <span class="val-badge" id="ob-v-badge">${this.state.verbosity}%</span></label>
                            <input type="range" id="ob-v" min="20" max="100" value="${this.state.verbosity}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Pronoun & Analogy Habits</label>
                            <input type="text" id="ob-write-examples" value="${this.state.examples}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Diagram usage frequency</label>
                            <input type="text" id="ob-write-diagrams" value="${this.state.diagrams}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Bullet Point usage frequency</label>
                            <input type="text" id="ob-write-bullets" value="${this.state.bullets}" class="form-input">
                        </div>
                    </div>
                `
            },
            {
                title: "5. Exam Behaviour & Focus",
                subtitle: "Specify performance constraints and stress curves",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Self Confidence level: <span class="val-badge" id="ob-conf-badge">${this.state.confidence}%</span></label>
                            <input type="range" id="ob-conf" min="10" max="100" value="${this.state.confidence}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Stress Resistance Threshold: <span class="val-badge" id="ob-stress-badge">${this.state.stressThreshold}%</span></label>
                            <input type="range" id="ob-stress" min="10" max="100" value="${this.state.stressThreshold}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Time sensitivity (Pacing Drops): <span class="val-badge" id="ob-time-badge">${this.state.timeSensitivity}%</span></label>
                            <input type="range" id="ob-time" min="10" max="100" value="${this.state.timeSensitivity}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Conscientiousness (Typo avoidance): <span class="val-badge" id="ob-conscientiousness-badge">${this.state.conscientiousness}%</span></label>
                            <input type="range" id="ob-conscientiousness" min="10" max="100" value="${this.state.conscientiousness}" class="slider">
                        </div>
                    </div>
                `
            },
            {
                title: "6. Operational Mistake Patterns",
                subtitle: "Specify errors, typos, and citation gaps",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Common mistakes described in exams</label>
                            <textarea id="ob-mistakes" class="form-textarea" placeholder="E.g., misremembering study names, calculation slips, hand-waving late equations...">${this.state.mistakePatterns}</textarea>
                        </div>
                    </div>
                `
            },
            {
                title: "7. Save & Generate Cognitive Twin",
                subtitle: "Review parameters and initialize the emulation model",
                render: () => `
                    <div class="summary-onboarding-panel" style="font-size:0.85rem; display:flex; flex-direction:column; gap:0.75rem;">
                        <div style="background:rgba(255,255,255,0.02); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
                            <strong>Student Twin:</strong> ${this.state.name || "Untitled Twin"} (${this.state.degree})
                        </div>
                        <div class="stat-badge-row"><span>Learning Path:</span> <strong>${this.state.learningStyle}</strong></div>
                        <div class="stat-badge-row"><span>Average Verbosity:</span> <strong>${this.state.verbosity}%</strong></div>
                        <div class="stat-badge-row"><span>Confidence level:</span> <strong>${this.state.confidence}%</strong></div>
                        <div class="stat-badge-row"><span>Stress Resistance:</span> <strong>${this.state.stressThreshold}%</strong></div>
                        
                        <div class="info-alert-box bg-emerald" style="margin-top:0.75rem;">
                            <span class="info-badge success">Compilation Verified</span>
                            <p>Continuing will automatically generate a structured prompt brief, extract baseline writing DNA parameters, and insert this student twin into your LocalStorage student database.</p>
                        </div>
                    </div>
                `
            }
        ];
    }
    
    init() {
        this.render();
    }
    
    saveStepData() {
        if (this.currentStep === 0) {
            this.state.name = $('#ob-name').value;
            this.state.degree = $('#ob-degree').value;
            this.state.subject = $('#ob-subject').value;
            this.state.level = $('#ob-level').value;
        } else if (this.currentStep === 1) {
            this.state.strongTopics = $('#ob-strong').value;
            this.state.weakTopics = $('#ob-weak').value;
            this.state.favTopics = $('#ob-fav').value;
            this.state.avoidedTopics = $('#ob-avoid').value;
        } else if (this.currentStep === 2) {
            this.state.learningStyle = $('#ob-learn').value;
        } else if (this.currentStep === 3) {
            this.state.verbosity = parseInt($('#ob-v').value);
            this.state.examples = $('#ob-write-examples').value;
            this.state.diagrams = $('#ob-write-diagrams').value;
            this.state.bullets = $('#ob-write-bullets').value;
        } else if (this.currentStep === 4) {
            this.state.confidence = parseInt($('#ob-conf').value);
            this.state.stressThreshold = parseInt($('#ob-stress').value);
            this.state.timeSensitivity = parseInt($('#ob-time').value);
            this.state.conscientiousness = parseInt($('#ob-conscientiousness').value);
        } else if (this.currentStep === 5) {
            this.state.mistakePatterns = $('#ob-mistakes').value;
        }
    }
    
    nextStep() {
        this.saveStepData();
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        } else {
            // Generate and save new Cognitive Twin
            const sId = `s_${Date.now()}`;
            
            // Map onboarding wizard state variables to profile schema
            const traits = {
                conceptualGrasp: this.state.learningStyle === "Conceptual" ? 85 : this.state.learningStyle === "Visual" ? 70 : 60,
                quantitativePrecision: this.state.learningStyle === "Memorization" ? 85 : this.state.learningStyle === "Practical" ? 60 : 30,
                roteMemory: this.state.learningStyle === "Memorization" ? 80 : 45,
                attentionSpan: this.state.learningStyle === "Practical" ? 80 : 60,
                verbosity: this.state.verbosity,
                stressThreshold: this.state.stressThreshold,
                confidenceLevel: this.state.confidence,
                conscientiousness: this.state.conscientiousness,
                timeSensitivity: this.state.timeSensitivity,
                preferredExamples: this.state.examples,
                strengths: this.state.strongTopics,
                weaknesses: this.state.weakTopics,
                commonMistakes: this.state.mistakePatterns,
                citationHabits: "Refers to paradigms, vague dates",
                diagramUsage: this.state.diagrams,
                pressureBehavior: "Truncates sentences"
            };
            
            const compiledBrief = generateBrief({
                name: this.state.name,
                degree: this.state.degree,
                subject: this.state.subject,
                verbosity: this.state.verbosity,
                preferredExamples: this.state.examples,
                strengths: this.state.strongTopics,
                weaknesses: this.state.weakTopics,
                commonMistakes: this.state.mistakePatterns,
                citationHabits: "Refers to paradigms",
                diagramUsage: this.state.diagrams,
                pressureBehavior: "Truncates sentences"
            });
            
            // Extract DNA baseline
            const dnaStats = {
                sentenceLengthAvg: this.state.verbosity > 75 ? 17.8 : 14.5,
                sentenceLengthStdDev: 4.0,
                analogyDensity: this.state.learningStyle === "Visual" ? 3.5 : 1.8,
                transitionDensity: 4.2,
                passiveVoiceDensity: 3.5,
                lexicalDensity: this.state.learningStyle === "Conceptual" ? 44.5 : 38.0
            };
            
            // Insert Student database
            db.insertStudent(
                { id: sId, name: this.state.name, degree: this.state.degree, subject: this.state.subject, level: this.state.level, twinScore: 70 },
                traits,
                compiledBrief,
                dnaStats
            );
            
            // Complete callback
            this.onComplete(sId);
        }
    }
    
    prevStep() {
        this.saveStepData();
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    }
    
    registerListeners() {
        const btnNext = $('#wizard-next');
        const btnBack = $('#wizard-back');
        
        if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
        if (btnBack) btnBack.addEventListener('click', () => this.prevStep());
        
        // Dynamic labels update
        if (this.currentStep === 3) {
            $('#ob-v').addEventListener('input', (e) => $('#ob-v-badge').textContent = `${e.target.value}%`);
        } else if (this.currentStep === 4) {
            $('#ob-conf').addEventListener('input', (e) => $('#ob-conf-badge').textContent = `${e.target.value}%`);
            $('#ob-stress').addEventListener('input', (e) => $('#ob-stress-badge').textContent = `${e.target.value}%`);
            $('#ob-time').addEventListener('input', (e) => $('#ob-time-badge').textContent = `${e.target.value}%`);
            $('#ob-conscientiousness').addEventListener('input', (e) => $('#ob-conscientiousness-badge').textContent = `${e.target.value}%`);
        }
    }
    
    render() {
        const step = this.steps[this.currentStep];
        const progressPercent = ((this.currentStep + 1) / this.steps.length) * 100;
        
        const wizardHtml = `
            <div class="wizard-header">
                <div class="wizard-title-row">
                    <h2>${step.title}</h2>
                    <span class="step-indicator">Step ${this.currentStep + 1} of ${this.steps.length}</span>
                </div>
                <p class="wizard-subtitle">${step.subtitle}</p>
                <div class="wizard-progress-track">
                    <div class="wizard-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            
            <div class="wizard-body">
                ${step.render()}
            </div>
            
            <div class="wizard-footer">
                <button id="wizard-back" class="btn-secondary" ${this.currentStep === 0 ? 'disabled' : ''}>
                    Back
                </button>
                <button id="wizard-next" class="btn-primary">
                    ${this.currentStep === this.steps.length - 1 ? 'Generate Twin' : 'Next Step'}
                </button>
            </div>
        `;
        
        this.container.innerHTML = wizardHtml;
        this.registerListeners();
    }
}
