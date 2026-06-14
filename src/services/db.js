import { presets } from '../data/presets.js';
import { generateBrief } from './brief_generator.js';

/**
 * LocalStorage Relational Database Mock Engine
 */
const STORAGE_KEY = "db_aletheia_hub";

class DatabaseService {
    constructor() {
        this.data = {
            students: [],
            briefs: [],
            cognitive_profiles: [],
            writing_dna: [],
            simulations: [],
            evaluations: [],
            version_history: []
        };
        
        this.load();
        if (this.data.students.length === 0) {
            this.seed();
        }
    }
    
    // Loads DB from localStorage
    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error("Failed parsing Aletheia DB:", e);
            }
        }
    }
    
    // Saves DB to localStorage
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
    
    // Seed initial student presets
    seed() {
        Object.keys(presets).forEach(key => {
            const p = presets[key];
            
            // 1. Insert Student Row
            const student = {
                id: p.id,
                name: p.name,
                degree: p.degree,
                subject: p.subject,
                level: "Undergraduate",
                twinScore: p.id === "jordan" ? 92 : p.id === "taylor" ? 58 : 71,
                lastSimulatedAt: new Date().toLocaleDateString()
            };
            this.data.students.push(student);
            
            // 2. Insert Profile Row
            this.data.cognitive_profiles.push({
                id: `p_${p.id}`,
                student_id: p.id,
                traits: {
                    conceptualGrasp: p.conceptualGrasp,
                    quantitativePrecision: p.quantitativePrecision,
                    roteMemory: p.roteMemory,
                    attentionSpan: p.attentionSpan,
                    verbosity: p.verbosity,
                    stressThreshold: p.stressThreshold,
                    confidenceLevel: p.confidenceLevel || 70,
                    conscientiousness: p.conscientiousness,
                    timeSensitivity: p.timeSensitivity,
                    preferredExamples: p.preferredExamples,
                    strengths: p.strengths,
                    weaknesses: p.weaknesses,
                    commonMistakes: p.commonMistakes,
                    citationHabits: p.citationHabits,
                    diagramUsage: p.diagramUsage,
                    pressureBehavior: p.pressureBehavior
                }
            });
            
            // 3. Insert Brief Row
            const briefText = generateBrief(p);
            this.data.briefs.push({
                id: `b_${p.id}`,
                student_id: p.id,
                markdown_text: briefText,
                completeness: p.id === "jordan" ? 90 : p.id === "taylor" ? 60 : 80,
                version: 1
            });
            
            // 4. Insert initial revision history
            this.data.version_history.push({
                id: `vh_${p.id}_1`,
                brief_id: `b_${p.id}`,
                timestamp: new Date().toLocaleTimeString(),
                action: "System Preset Seed",
                text: briefText
            });
            
            // 5. Insert Writing DNA Row
            this.data.writing_dna.push({
                id: `dna_${p.id}`,
                student_id: p.id,
                stats: {
                    sentenceLengthAvg: p.id === "jordan" ? 18.2 : p.id === "taylor" ? 13.5 : 16.5,
                    sentenceLengthStdDev: p.id === "jordan" ? 3.1 : p.id === "taylor" ? 5.4 : 4.2,
                    analogyDensity: p.id === "jordan" ? 0.8 : p.id === "taylor" ? 4.1 : 2.5,
                    transitionDensity: p.id === "jordan" ? 5.2 : p.id === "taylor" ? 2.8 : 4.6,
                    passiveVoiceDensity: p.id === "jordan" ? 6.5 : p.id === "taylor" ? 2.1 : 3.8,
                    lexicalDensity: p.id === "jordan" ? 48.5 : p.id === "taylor" ? 32.4 : 41.2
                }
            });
        });
        
        this.save();
    }
    
    // ---------------------------------------------------------
    // Student Queries & CRUD
    // ---------------------------------------------------------
    getStudents(search = "", sortBy = "name", filterSubject = "all") {
        let results = [...this.data.students];
        
        // Search filter
        if (search && search.trim() !== "") {
            const query = search.toLowerCase();
            results = results.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.degree.toLowerCase().includes(query) ||
                s.subject.toLowerCase().includes(query)
            );
        }
        
        // Subject filter
        if (filterSubject && filterSubject !== "all") {
            results = results.filter(s => s.subject === filterSubject);
        }
        
        // Sorting
        results.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "score") return b.twinScore - a.twinScore;
            if (sortBy === "subject") return a.subject.localeCompare(b.subject);
            return 0;
        });
        
        return results;
    }
    
    getStudentById(id) {
        return this.data.students.find(s => s.id === id);
    }
    
    getProfileByStudentId(studentId) {
        const row = this.data.cognitive_profiles.find(cp => cp.student_id === studentId);
        return row ? row.traits : null;
    }
    
    getBriefByStudentId(studentId) {
        return this.data.briefs.find(b => b.student_id === studentId);
    }
    
    getDNAByStudentId(studentId) {
        const row = this.data.writing_dna.find(dna => dna.student_id === studentId);
        return row ? row.stats : null;
    }
    
    getStudentSubjects() {
        const subjects = this.data.students.map(s => s.subject);
        return ["all", ...new Set(subjects)];
    }
    
    // Insert new student twin record
    insertStudent(studentObj, traitsObj, briefText, dnaStats) {
        const sId = studentObj.id || `s_${Date.now()}`;
        
        const newStudent = {
            id: sId,
            name: studentObj.name,
            degree: studentObj.degree,
            subject: studentObj.subject,
            level: studentObj.level || "Undergraduate",
            twinScore: studentObj.twinScore || 70,
            lastSimulatedAt: newDateString()
        };
        this.data.students.push(newStudent);
        
        this.data.cognitive_profiles.push({
            id: `p_${sId}`,
            student_id: sId,
            traits: { ...traitsObj }
        });
        
        const bId = `b_${sId}`;
        this.data.briefs.push({
            id: bId,
            student_id: sId,
            markdown_text: briefText,
            completeness: 80,
            version: 1
        });
        
        this.data.version_history.push({
            id: `vh_${sId}_1`,
            brief_id: bId,
            timestamp: new Date().toLocaleTimeString(),
            action: "Onboarding Generation",
            text: briefText
        });
        
        this.data.writing_dna.push({
            id: `dna_${sId}`,
            student_id: sId,
            stats: dnaStats || {
                sentenceLengthAvg: 15.0,
                sentenceLengthStdDev: 3.5,
                analogyDensity: 2.0,
                transitionDensity: 3.5,
                passiveVoiceDensity: 3.0,
                lexicalDensity: 38.0
            }
        });
        
        this.save();
        return sId;
    }
    
    updateStudentBrief(studentId, newMarkdown) {
        const brief = this.getBriefByStudentId(studentId);
        if (brief) {
            brief.markdown_text = newMarkdown;
            brief.version++;
            
            // Add revision entry
            this.data.version_history.unshift({
                id: `vh_${studentId}_${Date.now()}`,
                brief_id: brief.id,
                timestamp: new Date().toLocaleTimeString(),
                action: "Manual Editor Revision",
                text: newMarkdown
            });
            
            this.save();
        }
    }
    
    deleteStudent(studentId) {
        this.data.students = this.data.students.filter(s => s.id !== studentId);
        this.data.cognitive_profiles = this.data.cognitive_profiles.filter(cp => cp.student_id !== studentId);
        this.data.briefs = this.data.briefs.filter(b => b.student_id !== studentId);
        this.data.writing_dna = this.data.writing_dna.filter(dna => dna.student_id !== studentId);
        this.data.simulations = this.data.simulations.filter(sim => sim.student_id !== studentId);
        this.save();
    }
    
    // ---------------------------------------------------------
    // Simulation & Evaluation Logs
    // ---------------------------------------------------------
    insertSimulation(studentId, qAnswers) {
        const simId = `sim_${Date.now()}`;
        this.data.simulations.push({
            id: simId,
            student_id: studentId,
            date: newDateString(),
            answers: qAnswers
        });
        
        // Update last simulated time
        const s = this.getStudentById(studentId);
        if (s) {
            s.lastSimulatedAt = newDateString();
        }
        
        this.save();
        return simId;
    }
    
    getSimulationsByStudentId(studentId) {
        return this.data.simulations.filter(sim => sim.student_id === studentId);
    }
    
    insertEvaluation(simId, rating, remarks) {
        this.data.evaluations.push({
            id: `e_${Date.now()}`,
            simulation_id: simId,
            rating: rating,
            comments: remarks
        });
        this.save();
    }
}

function newDateString() {
    return new Date().toISOString().split('T')[0];
}

export const db = new DatabaseService();
export default db;
