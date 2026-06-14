import { $, html } from '../utils/dom.js';

/**
 * Clickable Error Explainer Modal Component
 */
export class ExplainerModal {
    constructor(container) {
        this.container = container;
        this.data = {
            analogy: {
                title: "Everyday Analogy",
                category: "Cognitive Metaphor Mapping",
                trigger: "Conceptual Grasp > 70% & Quantitative Precision < 50%",
                description: "Human learners frequently map complex, abstract theoretical systems onto familiar everyday structures (like computer desktop screens or volume dials) to ground their conceptual reasoning. Rather than writing cold, technical details, the student relies on visual intuition."
            },
            handwave: {
                title: "Verbal Hand-Waving",
                category: "Analytical Avoidance Heuristic",
                trigger: "Quantitative Precision < 50%",
                description: "When faced with mathematical formulas or chemical equations they cannot recall, students frequently retreat to descriptive, qualitative hand-waving. They verbalize the relationships (e.g., 'decays exponentially showing a sharp initial drop') rather than detailing the formal algebraic coefficients."
            },
            correction: {
                title: "Syntactic Self-Correction",
                category: "Real-time Monitoring & Adjustment",
                trigger: "Conscientiousness < 60% & Stress > 40%",
                description: "Replicates a student's sudden realization mid-sentence that their conceptual frame is slightly off. In typed formatting, this creates sudden mid-sentence structural shifts ('or rather, not complete filtering, but attenuation...'), capturing the real-time cognitive editing loop of human writers under time pressure."
            },
            pivot: {
                title: "Conceptual Pivot",
                category: "Strategic Deflection Heuristic",
                trigger: "Cognitive Load > 70% & Mathematical Question",
                description: "A defensive exam behavior. When faced with a highly quantitative or neurobiology question beyond their recall capacity, the student briefly acknowledges the prompt, then immediately deflects (pivots) the text back to a closely related conceptual zone they master (like semantic priming)."
            },
            trope: {
                title: "Lost Researcher Trope",
                category: "Selective Memory Recall Block",
                trigger: "Rote Memory Recall < 45%",
                description: "Occurs when a student has deep familiarity with an experimental paradigm (like the invisible gorilla tracking study) but completely fails to recall the researchers' names (Simons & Chabris) in the exam room. They describe the experiment in high detail but explicitly admit to forgetting the authors."
            }
        };
    }
    
    init() {
        // Build modal layout overlay
        let modalDiv = $('#explainer-modal');
        if (!modalDiv) {
            modalDiv = document.createElement('div');
            modalDiv.id = "explainer-modal";
            modalDiv.className = "modal-overlay";
            this.container.appendChild(modalDiv);
        }
        
        this.modalElement = modalDiv;
        this.close(); // Start closed
    }
    
    open(type) {
        const info = this.data[type];
        if (!info) return;
        
        const modalHtml = `
            <div class="modal-content-card">
                <div class="modal-header">
                    <h4>Cognitive Twin Diagnosis</h4>
                    <button class="btn-close-modal" id="btn-close-explainer">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="diagnosis-header-row">
                        <span class="diagnosis-badge badge-amber">${info.title}</span>
                        <span class="diagnosis-category">${info.category}</span>
                    </div>
                    
                    <div class="diagnosis-block">
                        <strong>Trigger Metric:</strong>
                        <span class="diagnosis-trigger-text">${info.trigger}</span>
                    </div>
                    
                    <div class="diagnosis-block">
                        <strong>Linguistic & Cognitive Rationale:</strong>
                        <p class="diagnosis-description-text">${info.description}</p>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-primary" id="btn-dismiss-explainer">Acknowledge</button>
                </div>
            </div>
        `;
        
        this.modalElement.innerHTML = modalHtml;
        this.modalElement.style.display = "flex";
        
        // Listeners to close
        $('#btn-close-explainer').addEventListener('click', () => this.close());
        $('#btn-dismiss-explainer').addEventListener('click', () => this.close());
        
        // Close if click outside
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) this.close();
        });
    }
    
    close() {
        if (this.modalElement) {
            this.modalElement.style.display = "none";
        }
    }
}
