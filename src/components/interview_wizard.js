import { $ } from '../utils/dom.js';
import { generateBrief } from '../services/brief_generator.js';

/**
 * Step-by-Step Student Interview Wizard Component
 */
export class InterviewWizard {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.currentStep = 0;
        
        // Initial state compiled from fields
        this.state = {
            name: "Alex",
            degree: "B.Sc. Cognitive Science",
            subject: "Cognitive Psychology (Memory & Attention)",
            conceptualGrasp: 75,
            quantitativePrecision: 40,
            roteMemory: 45,
            attentionSpan: 60,
            verbosity: 70,
            stressThreshold: 55,
            conscientiousness: 50,
            timeSensitivity: 60,
            preferredExamples: "Computer desktop for working memory, volume dials for attention filtering",
            strengths: "Conceptual synthesis, analogical reasoning",
            weaknesses: "Neuroanatomy, mathematical decay formulas",
            commonMistakes: "Verbal hand-waving, wrong citation dates, rushed Question 3",
            citationHabits: "Vague decades (mid-70s), refers to paradigms instead of names",
            diagramUsage: "Rarely uses diagrams, prefers continuous paragraphs",
            pressureBehavior: "Truncates sentences, skips details, forgets names"
        };
        
        this.steps = [
            {
                title: "Academic Background",
                subtitle: "Select your degree subject and profile baseline",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Student Name</label>
                            <input type="text" id="int-name" value="${this.state.name}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Degree Title</label>
                            <input type="text" id="int-degree" value="${this.state.degree}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Chosen Exam Subject</label>
                            <input type="text" id="int-subject" value="${this.state.subject}" class="form-input">
                        </div>
                    </div>
                `
            },
            {
                title: "Cognitive & Knowledge Profile",
                subtitle: "Rate your academic focus and strengths",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Conceptual Grasp (Theory Mastery): <span class="val-badge" id="grasp-badge">${this.state.conceptualGrasp}%</span></label>
                            <input type="range" id="int-grasp" min="10" max="100" value="${this.state.conceptualGrasp}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Quantitative Precision (Equations/Biology): <span class="val-badge" id="quant-badge">${this.state.quantitativePrecision}%</span></label>
                            <input type="range" id="int-quant" min="10" max="100" value="${this.state.quantitativePrecision}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Rote Memory (Dates/Citations Recall): <span class="val-badge" id="memory-badge">${this.state.roteMemory}%</span></label>
                            <input type="range" id="int-memory" min="10" max="100" value="${this.state.roteMemory}" class="slider">
                        </div>
                        <div class="form-group full-width">
                            <label>Academic Strengths</label>
                            <textarea id="int-strengths" class="form-textarea" placeholder="E.g., Conceptual synthesis, analogical reasoning">${this.state.strengths}</textarea>
                        </div>
                        <div class="form-group full-width">
                            <label>Academic Weaknesses</label>
                            <textarea id="int-weaknesses" class="form-textarea" placeholder="E.g., Neurobiology, mathematical decay formulas">${this.state.weaknesses}</textarea>
                        </div>
                    </div>
                `
            },
            {
                title: "Writing Fingerprint",
                subtitle: "Specify how you draft academic answers",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Verbosity Index (Answer Length): <span class="val-badge" id="verbosity-badge">${this.state.verbosity}%</span></label>
                            <input type="range" id="int-verbosity" min="20" max="100" value="${this.state.verbosity}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Preferred Examples & Analogies</label>
                            <input type="text" id="int-examples" value="${this.state.preferredExamples}" class="form-input" placeholder="E.g., desktop screen, volume dials">
                        </div>
                        <div class="form-group">
                            <label>Citation Habits</label>
                            <input type="text" id="int-citations" value="${this.state.citationHabits}" class="form-input" placeholder="E.g., Vague decades, refers to paradigms">
                        </div>
                        <div class="form-group">
                            <label>Diagram & Format Preference</label>
                            <input type="text" id="int-diagrams" value="${this.state.diagramUsage}" class="form-input" placeholder="E.g., Avoids diagrams, writes continuous text">
                        </div>
                    </div>
                `
            },
            {
                title: "Exam Behavior & Temperament",
                subtitle: "Rate how stress and time affect your writing",
                render: () => `
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Attention Span Focus: <span class="val-badge" id="attention-badge">${this.state.attentionSpan}%</span></label>
                            <input type="range" id="int-attention" min="20" max="100" value="${this.state.attentionSpan}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Stress Resistance Threshold: <span class="val-badge" id="stress-badge">${this.state.stressThreshold}%</span></label>
                            <input type="range" id="int-stress" min="10" max="100" value="${this.state.stressThreshold}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Time Sensitivity (Rushing tendency): <span class="val-badge" id="time-badge">${this.state.timeSensitivity}%</span></label>
                            <input type="range" id="int-time" min="10" max="100" value="${this.state.timeSensitivity}" class="slider">
                        </div>
                        <div class="form-group">
                            <label>Conscientiousness (Typo avoidance): <span class="val-badge" id="conscientiousness-badge">${this.state.conscientiousness}%</span></label>
                            <input type="range" id="int-conscientiousness" min="10" max="100" value="${this.state.conscientiousness}" class="slider">
                        </div>
                        <div class="form-group full-width">
                            <label>Typical Mistakes Under Pressure</label>
                            <textarea id="int-mistakes" class="form-textarea" placeholder="E.g., Spelling typos, rushed final questions, incomplete arguments">${this.state.commonMistakes}</textarea>
                        </div>
                    </div>
                `
            }
        ];
    }
    
    init() {
        this.render();
    }
    
    setPreset(presetData) {
        this.state = { ...this.state, ...presetData };
        this.render();
    }
    
    saveStepData() {
        // Collects elements based on current step
        if (this.currentStep === 0) {
            this.state.name = $('#int-name').value;
            this.state.degree = $('#int-degree').value;
            this.state.subject = $('#int-subject').value;
        } else if (this.currentStep === 1) {
            this.state.conceptualGrasp = parseInt($('#int-grasp').value);
            this.state.quantitativePrecision = parseInt($('#int-quant').value);
            this.state.roteMemory = parseInt($('#int-memory').value);
            this.state.strengths = $('#int-strengths').value;
            this.state.weaknesses = $('#int-weaknesses').value;
        } else if (this.currentStep === 2) {
            this.state.verbosity = parseInt($('#int-verbosity').value);
            this.state.preferredExamples = $('#int-examples').value;
            this.state.citationHabits = $('#int-citations').value;
            this.state.diagramUsage = $('#int-diagrams').value;
        } else if (this.currentStep === 3) {
            this.state.attentionSpan = parseInt($('#int-attention').value);
            this.state.stressThreshold = parseInt($('#int-stress').value);
            this.state.timeSensitivity = parseInt($('#int-time').value);
            this.state.conscientiousness = parseInt($('#int-conscientiousness').value);
            this.state.commonMistakes = $('#int-mistakes').value;
        }
    }
    
    nextStep() {
        this.saveStepData();
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        } else {
            // Compile final brief
            const compiledBrief = generateBrief(this.state);
            this.onComplete(this.state, compiledBrief);
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
        
        // Dynamically update slider display values
        if (this.currentStep === 1) {
            $('#int-grasp').addEventListener('input', (e) => $('#grasp-badge').textContent = `${e.target.value}%`);
            $('#int-quant').addEventListener('input', (e) => $('#quant-badge').textContent = `${e.target.value}%`);
            $('#int-memory').addEventListener('input', (e) => $('#memory-badge').textContent = `${e.target.value}%`);
        } else if (this.currentStep === 2) {
            $('#int-verbosity').addEventListener('input', (e) => $('#verbosity-badge').textContent = `${e.target.value}%`);
        } else if (this.currentStep === 3) {
            $('#int-attention').addEventListener('input', (e) => $('#attention-badge').textContent = `${e.target.value}%`);
            $('#int-stress').addEventListener('input', (e) => $('#stress-badge').textContent = `${e.target.value}%`);
            $('#int-time').addEventListener('input', (e) => $('#time-badge').textContent = `${e.target.value}%`);
            $('#int-conscientiousness').addEventListener('input', (e) => $('#conscientiousness-badge').textContent = `${e.target.value}%`);
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
                    ${this.currentStep === this.steps.length - 1 ? 'Generate Brief' : 'Next Step'}
                </button>
            </div>
        `;
        
        this.container.innerHTML = wizardHtml;
        this.registerListeners();
    }
}
