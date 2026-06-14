import { $, $$, on, html, text, show, hide } from './utils/dom.js';
import { db } from './services/db.js';
import { questions } from './data/questions.js';
import { CognitiveEngine } from './cognitive_engine/engine.js';
import { compileAnswer, parseTextToTokens, renderTokensToHtml, getCleanTextLength } from './services/text_compiler.js';
import { calculateBriefQuality } from './brief_parser/contradiction_detector.js';

// Visual Components
import { drawTimelineChart } from './visualizations/canvas_charts.js';
import { Dashboard } from './components/dashboard.js';
import { StudentLibrary } from './components/student_library.js';
import { OnboardingWizard } from './components/onboarding_wizard.js';
import { BriefEditor } from './components/brief_editor.js';
import { BriefAnalyzer } from './components/brief_analyzer.js';
import { WritingDNA } from './components/writing_dna.js';
import { ProfileDashboard } from './components/profile_dashboard.js';
import { ComparisonPage } from './components/comparison_page.js';
import { ProfessorReview } from './components/professor_review.js';
import { ResearchReport } from './components/research_report.js';
import { ExplainerModal } from './components/explainer.js';

// Global Application State
const appState = {
    activeStudentId: "alex", // Default active student ID
    profComments: "",
    simulationCompleted: false,
    simulationAnswers: {
        alex: "",
        ai: "",
        perfect: ""
    }
};

// Navigation title mappings
const screenMeta = {
    dashboard: { title: "Twin Alignment Dashboard", subtitle: "Benchmarking alignment metrics of Student Cognitive Twin" },
    "student-library": { title: "Student Registry Library", subtitle: "Manage, edit, clone, and delete student twin records" },
    "create-twin": { title: "Student Onboarding Wizard", subtitle: "Calibrate cognitive baselines and exam habits" },
    "brief-builder": { title: "Prompt Brief Builder", subtitle: "Edit instruction guidelines and revision samples" },
    "brief-analyzer": { title: "Instruction Quality Analyzer", subtitle: "Identify contradiction warnings and logical coverage" },
    "writing-dna": { title: "Linguistic DNA Parser", subtitle: "Extract sentence standard deviations and style quirks" },
    "student-profiles": { title: "Cognitive Profile Summary", subtitle: "Interactive student recall capacity mapping" },
    "exam-simulator": { title: "Brief Validation Lab", subtitle: "Simulate and verify twin alignment under pressure" },
    "student-comparison": { title: "Multi-Student Benchmarking Suite", subtitle: "Compare cognitive twin profiles side-by-side" },
    "professor-review": { title: "Professor Assessment Portal", subtitle: "Blind verification quiz and scorecard grading" },
    "research-reports": { title: "Research Evaluation Sheet", subtitle: "Consolidated, print-ready twin summary report" },
    settings: { title: "SaaS Platform Settings", subtitle: "Configure relational localStorage database seeds" }
};

// UI Component Instances
let dashboard, studentLibrary, onboardingWizard, briefEditor, briefAnalyzer, writingDna, profileDashboard, comparisonPage, professorReview, researchReport, explainerModal;

// Simulation States
let simState = {
    isPlaying: false,
    currentQ: 0,
    alexCharIndex: 0,
    aiCharIndex: 0,
    perfCharIndex: 0,
    tickCount: 0,
    timerId: null,
    history: [],
    engine: null,
    compiledQuestions: [] // holds tokenized pre-compiled answers for active simulation
};

// -------------------------------------------------------------
// Component Orchestration & Page Toggles
// -------------------------------------------------------------
function loadScreen(screenId) {
    // 1. Toggle Workspace Screens in HTML
    $$('.workspace-screen').forEach(scr => {
        if (scr.id === `screen-${screenId}`) scr.classList.add('active');
        else scr.classList.remove('active');
    });
    
    // Toggle active link class
    $$('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-target') === screenId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    // Update Header Titles
    const meta = screenMeta[screenId];
    if (meta) {
        text($('#page-title'), meta.title);
        text($('#page-subtitle'), meta.subtitle);
    }
    
    // 2. Initialize / Update Component views
    switch (screenId) {
        case "dashboard":
            if (dashboard) dashboard.init();
            break;
        case "student-library":
            if (studentLibrary) studentLibrary.init();
            break;
        case "create-twin":
            if (onboardingWizard) onboardingWizard.init();
            break;
        case "brief-builder":
            if (briefEditor) briefEditor.init();
            break;
        case "brief-analyzer":
            if (briefAnalyzer) briefAnalyzer.init();
            break;
        case "writing-dna":
            if (writingDna) writingDna.init();
            break;
        case "student-profiles":
            if (profileDashboard) {
                profileDashboard.setStudent(appState.activeStudentId);
            }
            break;
        case "student-comparison":
            if (comparisonPage) {
                // Ensure compare has reasonable default values
                const students = db.getStudents();
                if (students.length >= 2) {
                    comparisonPage.studentAId = appState.activeStudentId;
                    const candidateB = students.find(s => s.id !== appState.activeStudentId);
                    if (candidateB) {
                        comparisonPage.studentBId = candidateB.id;
                    }
                }
                comparisonPage.init();
            }
            break;
        case "exam-simulator":
            initSimulatorWorkspace();
            break;
        case "professor-review":
            if (professorReview) professorReview.init();
            break;
        case "research-reports":
            if (researchReport) researchReport.init();
            break;
    }
}

// Sidebar Buttons Event
$$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        loadScreen(target);
    });
});

// -------------------------------------------------------------
// Core UI State Syncing
// -------------------------------------------------------------
function populateStudentDropdown() {
    const selector = $('#app-student-selector');
    if (!selector) return;
    
    const students = db.getStudents();
    selector.innerHTML = students.map(s => `<option value="${s.id}" ${s.id === appState.activeStudentId ? 'selected' : ''}>${s.name}</option>`).join("");
}

function syncActiveStudentDropdown() {
    populateStudentDropdown();
    const selector = $('#app-student-selector');
    if (selector) {
        selector.value = appState.activeStudentId;
    }
}

function resetSimulationStateForActiveStudent() {
    appState.simulationCompleted = false;
    appState.profComments = "";
    appState.simulationAnswers = {
        alex: "",
        ai: "",
        perfect: ""
    };
    if (professorReview) {
        professorReview.quizAttempted = false;
        professorReview.selectedScript = null;
    }
    resetSimulator();
}

// -------------------------------------------------------------
// Exam Validation Simulator Engine Logic
// -------------------------------------------------------------
const speedConfigs = {
    1: { multiplier: 1.0 },
    2: { multiplier: 2.5 },
    3: { multiplier: 6.0 },
    4: { multiplier: 25.0 },
    5: { multiplier: Infinity } // Complete instantly
};

// Speed range slider config
on($('#sim-speed-slider'), 'input', (e) => {
    const val = parseInt(e.target.value);
    const labels = ["1x", "2x", "5x (Default)", "20x", "Instant"];
    text($('#sim-speed-label'), labels[val - 1]);
});

// Switch Question tabs inside Simulator
function switchSimQuestion(qIndex) {
    if (simState.isPlaying && parseInt($('#sim-speed-slider').value) !== 5) {
        return; // Lock switching during typing unless paused/instant
    }
    
    simState.currentQ = qIndex;
    
    $$('.sim-q-tab').forEach((tab, idx) => {
        if (idx === qIndex) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    
    const question = questions[qIndex];
    text($('#sim-q-tag-label'), question.tag);
    text($('#sim-q-prompt-text'), question.text);
    
    renderSimulatorTextUpToCurrentProgress();
}

$$('.sim-q-tab').forEach((tab, idx) => {
    tab.addEventListener('click', () => switchSimQuestion(idx));
});

function renderSimulatorTextUpToCurrentProgress() {
    const qData = simState.compiledQuestions[simState.currentQ];
    if (!qData) return;
    
    const alexHtml = renderTokensToHtml(qData.alexTokens, simState.alexCharIndex);
    const briefHtml = renderTokensToHtml(qData.briefTokens, simState.aiCharIndex);
    const perfHtml = renderTokensToHtml(qData.perfTokens, simState.perfCharIndex);
    
    html($('#content-student'), alexHtml);
    html($('#content-brief'), briefHtml);
    html($('#content-perfect'), perfHtml);
    
    text($('#words-student'), `${getWordCountClean(alexHtml)} words`);
    text($('#words-brief'), `${getWordCountClean(briefHtml)} words`);
    text($('#words-perfect'), `${getWordCountClean(perfHtml)} words`);
    
    // Bind click events on highlights
    $$('#content-student .hl').forEach(span => {
        span.addEventListener('click', (e) => {
            const classList = e.currentTarget.className;
            let type = "analogy";
            if (classList.includes("hl-handwave")) type = "handwave";
            else if (classList.includes("hl-correction")) type = "correction";
            else if (classList.includes("hl-pivot")) type = "pivot";
            else if (classList.includes("hl-trope")) type = "trope";
            
            explainerModal.open(type);
        });
    });
}

function getWordCountClean(htmlStr) {
    const el = document.createElement('div');
    el.innerHTML = htmlStr;
    const clean = el.textContent || el.innerText || "";
    return clean.split(/\s+/).filter(Boolean).length;
}

function initSimulatorWorkspace() {
    const studentId = appState.activeStudentId;
    const student = db.getStudentById(studentId);
    const profile = db.getProfileByStudentId(studentId);
    
    if (!student || !profile) return;
    
    // Update simulated student label
    const colStudentLabel = $('#sim-col-student-label');
    if (colStudentLabel) {
        colStudentLabel.textContent = `Twin: ${student.name}`;
    }

    // 1. Compile Answers for the simulation session based on active traits
    simState.compiledQuestions = questions.map(q => {
        const studentRawText = compileAnswer(q, profile, 20, $('#pressure-mode-toggle').checked);
        const alexTokens = parseTextToTokens(studentRawText);
        const alexLen = getCleanTextLength(alexTokens);
        
        // Brief guided compiles guided brief text
        const briefTokens = parseTextToTokens(q.briefGuidedAnswer);
        const briefLen = getCleanTextLength(briefTokens);
        
        // Perfect AI answers compiled without markup
        const perfTokens = parseTextToTokens(q.perfectAnswer);
        const perfLen = getCleanTextLength(perfTokens);
        
        return {
            alexTokens, alexLen,
            briefTokens, briefLen,
            perfTokens, perfLen
        };
    });
    
    // Reset simulation parameters
    simState.currentQ = 0;
    simState.alexCharIndex = 0;
    simState.aiCharIndex = 0;
    simState.perfCharIndex = 0;
    simState.tickCount = 0;
    simState.history = [];
    
    // Set initial text display
    switchSimQuestion(simState.currentQ);
}

// Cognitive Timeline canvas drawing helper
function renderSimulatorTimeline() {
    const canvas = $('#sim-timeline-canvas');
    if (canvas) {
        drawTimelineChart(canvas, simState.history);
    }
}

// Tick step of simulation loop
function simTickStep() {
    const qData = simState.compiledQuestions[simState.currentQ];
    const speedIndex = parseInt($('#sim-speed-slider').value);
    const speed = speedConfigs[speedIndex].multiplier;
    const isPressure = $('#pressure-mode-toggle').checked;
    
    if (speed === Infinity) {
        // Instant Validation mode
        while (simState.currentQ < questions.length) {
            const currentQData = simState.compiledQuestions[simState.currentQ];
            simState.alexCharIndex = currentQData.alexLen;
            simState.aiCharIndex = currentQData.briefLen;
            simState.perfCharIndex = currentQData.perfLen;
            
            if (simState.currentQ < questions.length - 1) {
                simState.currentQ++;
                simState.alexCharIndex = 0;
                simState.aiCharIndex = 0;
                simState.perfCharIndex = 0;
            } else {
                break;
            }
        }
        
        const studentId = appState.activeStudentId;
        const profile = db.getProfileByStudentId(studentId);
        const textQ1 = compileAnswer(questions[0], profile, 20, isPressure);
        
        // Save answers in state
        appState.simulationAnswers.alex = textQ1;
        appState.simulationAnswers.ai = questions[0].briefGuidedAnswer;
        appState.simulationAnswers.perfect = questions[0].perfectAnswer;
        
        switchSimQuestion(simState.currentQ);
        completeSimulatorRun();
        return;
    }
    
    simState.tickCount++;
    
    // Ticks the cognitive engine calculations
    const activeQuestion = questions[simState.currentQ];
    const isMath = activeQuestion.id === "q3" || activeQuestion.id === "q4";
    const currentProgress = simState.alexCharIndex / qData.alexLen;
    simState.engine.tick(simState.currentQ, currentProgress, isMath);
    
    // Push metric frame to history
    simState.history.push({
        attention: simState.engine.attention,
        fatigue: simState.engine.fatigue,
        stress: simState.engine.stress,
        confidence: simState.engine.confidence
    });
    if (simState.history.length > 100) simState.history.shift(); // Keep last 100 frames
    
    // Dynamic Speed increment computations
    let aiStep = Math.ceil(2.0 * speed);
    simState.aiCharIndex = Math.min(simState.aiCharIndex + aiStep, qData.briefLen);
    simState.perfCharIndex = Math.min(simState.perfCharIndex + aiStep, qData.perfLen);
    
    let studentStep = 0;
    if (simState.engine.pauseTicks > 0) {
        simState.engine.pauseTicks--;
    } else {
        // Organic pacing variation based on stress, fatigue
        let baseSpeed = 1.0;
        if (simState.currentQ === 0) {
            baseSpeed = 0.95 + Math.sin(simState.tickCount / 10) * 0.25;
        } else if (simState.currentQ === 1) {
            baseSpeed = 0.85 + Math.random() * 0.2;
        } else {
            if (simState.tickCount % 40 < 10) {
                baseSpeed = 0;
            } else {
                baseSpeed = 1.5 + Math.random() * 0.4;
            }
        }
        
        studentStep = Math.ceil(baseSpeed * speed);
        simState.alexCharIndex = Math.min(simState.alexCharIndex + studentStep, qData.alexLen);
    }
    
    // Draw changes to text container content
    renderSimulatorTextUpToCurrentProgress();
    
    // Draw timeline graph
    renderSimulatorTimeline();
    
    // Update Event Ticker Terminal panel
    updateEventsTerminal();
    
    // Scroll container content boxes downwards
    $('#content-student').parentElement.scrollTop = $('#content-student').parentElement.scrollHeight;
    $('#content-brief').parentElement.scrollTop = $('#content-brief').parentElement.scrollHeight;
    $('#content-perfect').parentElement.scrollTop = $('#content-perfect').parentElement.scrollHeight;
    
    // Check if question completed
    if (simState.alexCharIndex >= qData.alexLen && simState.aiCharIndex >= qData.briefLen && simState.perfCharIndex >= qData.perfLen) {
        if (simState.currentQ < questions.length - 1) {
            // Transition to next question slide
            simState.isPlaying = false;
            clearInterval(simState.timerId);
            
            setTimeout(() => {
                simState.currentQ++;
                simState.alexCharIndex = 0;
                simState.aiCharIndex = 0;
                simState.perfCharIndex = 0;
                simState.isPlaying = true;
                switchSimQuestion(simState.currentQ);
                simState.timerId = setInterval(simTickStep, 35);
            }, 1000);
        } else {
            const studentId = appState.activeStudentId;
            const profile = db.getProfileByStudentId(studentId);
            const textQ1 = compileAnswer(questions[0], profile, 20, isPressure);
            
            appState.simulationAnswers.alex = textQ1;
            appState.simulationAnswers.ai = questions[0].briefGuidedAnswer;
            appState.simulationAnswers.perfect = questions[0].perfectAnswer;
            
            completeSimulatorRun();
        }
    }
}

function updateEventsTerminal() {
    const term = $('#sim-events-log');
    if (!term) return;
    
    const logs = simState.engine.eventLog;
    if (logs.length === 0) return;
    
    term.innerHTML = logs.map(l => `
        <div class="terminal-line">
            <span class="term-time">[${l.timestamp}]</span>
            <strong style="color:var(--accent-amber);">${l.type}:</strong> ${l.impact}
        </div>
    `).join("");
    
    term.scrollTop = term.scrollHeight;
}

function startSimulator() {
    const studentId = appState.activeStudentId;
    const profile = db.getProfileByStudentId(studentId);
    if (!profile) return;

    simState.isPlaying = true;
    simState.engine = new CognitiveEngine(profile, {
        pressureMode: $('#pressure-mode-toggle').checked
    });
    
    $('#sim-btn-start').disabled = true;
    $('#sim-btn-pause').disabled = false;
    $('#sim-btn-reset').disabled = false;
    
    $('#sim-events-log').innerHTML = `<div class="terminal-line"><span class="term-time">[00:00]</span> Launching brief validation run...</div>`;
    
    simState.timerId = setInterval(simTickStep, 35);
}

function pauseSimulator() {
    simState.isPlaying = false;
    clearInterval(simState.timerId);
    
    $('#sim-btn-start').disabled = false;
    $('#sim-btn-pause').disabled = true;
}

function resetSimulator() {
    simState.isPlaying = false;
    clearInterval(simState.timerId);
    
    simState.currentQ = 0;
    simState.alexCharIndex = 0;
    simState.aiCharIndex = 0;
    simState.perfCharIndex = 0;
    simState.tickCount = 0;
    simState.history = [];
    
    $('#sim-btn-start').disabled = false;
    $('#sim-btn-pause').disabled = true;
    $('#sim-btn-reset').disabled = true;
    
    initSimulatorWorkspace();
    
    const canvas = $('#sim-timeline-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function completeSimulatorRun() {
    simState.isPlaying = false;
    clearInterval(simState.timerId);
    
    $('#sim-btn-start').disabled = true;
    $('#sim-btn-pause').disabled = true;
    $('#sim-btn-reset').disabled = false;
    
    appState.simulationCompleted = true;
    
    const studentId = appState.activeStudentId;
    const isPressure = $('#pressure-mode-toggle').checked;
    const profile = db.getProfileByStudentId(studentId);
    const textQ1 = compileAnswer(questions[0], profile, 20, isPressure);
    
    appState.simulationAnswers.alex = textQ1;
    appState.simulationAnswers.ai = questions[0].briefGuidedAnswer;
    appState.simulationAnswers.perfect = questions[0].perfectAnswer;
    
    db.insertSimulation(studentId, {
        alex: textQ1,
        ai: questions[0].briefGuidedAnswer,
        perfect: questions[0].perfectAnswer
    });
    
    setTimeout(() => {
        loadScreen("professor-review");
    }, 1500);
}

on($('#sim-btn-start'), 'click', () => startSimulator());
on($('#sim-btn-pause'), 'click', () => pauseSimulator());
on($('#sim-btn-reset'), 'click', () => resetSimulator());

on($('#pressure-mode-toggle'), 'change', (e) => {
    const light = $('#pressure-warning-light');
    if (e.target.checked) {
        light.classList.add('active');
        if (simState.engine) simState.engine.pressureMode = true;
    } else {
        light.classList.remove('active');
        if (simState.engine) simState.engine.pressureMode = false;
    }
});

// -------------------------------------------------------------
// Bootstrapping Initializer
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Explainer modal
    explainerModal = new ExplainerModal($('#modal-mount'));
    explainerModal.init();
    
    // 2. Initialize Components
    dashboard = new Dashboard($('#screen-dashboard'), (targetScreen) => {
        loadScreen(targetScreen);
    });
    
    studentLibrary = new StudentLibrary($('#screen-student-library'), (action, id) => {
        appState.activeStudentId = id;
        syncActiveStudentDropdown();
        resetSimulationStateForActiveStudent();
        
        if (action === "simulate") {
            loadScreen("exam-simulator");
        } else if (action === "compare") {
            comparisonPage.studentAId = id;
            loadScreen("student-comparison");
        } else if (action === "profile") {
            loadScreen("student-profiles");
        }
    });
    
    onboardingWizard = new OnboardingWizard($('#screen-create-twin'), (newStudentId) => {
        appState.activeStudentId = newStudentId;
        syncActiveStudentDropdown();
        resetSimulationStateForActiveStudent();
        loadScreen("student-library");
    });
    
    briefEditor = new BriefEditor($('#screen-brief-builder'), appState, () => {
        syncActiveStudentDropdown();
    });
    
    briefAnalyzer = new BriefAnalyzer($('#screen-brief-analyzer'), appState);
    
    writingDna = new WritingDNA($('#screen-writing-dna'), appState, () => {
        syncActiveStudentDropdown();
    });
    
    profileDashboard = new ProfileDashboard($('#screen-student-profiles'), appState.activeStudentId);
    
    comparisonPage = new ComparisonPage($('#screen-student-comparison'), "alex", "jordan");
    
    professorReview = new ProfessorReview($('#screen-professor-review'), appState, () => {
        if (researchReport) researchReport.render();
    });
    
    researchReport = new ResearchReport($('#screen-research-reports'), appState);
    
    // Sidebar toggle controls for mobile viewports
    const sidebarToggle = $('#sidebar-toggle');
    const navSidebar = $('.nav-sidebar');
    const sidebarBackdrop = $('#sidebar-backdrop');
    
    if (sidebarToggle && navSidebar && sidebarBackdrop) {
        sidebarToggle.addEventListener('click', () => {
            navSidebar.classList.add('open');
            sidebarBackdrop.classList.add('active');
        });
        
        sidebarBackdrop.addEventListener('click', () => {
            navSidebar.classList.remove('open');
            sidebarBackdrop.classList.remove('active');
        });
    }
    
    // Dismiss collapsible menu on link trigger
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navSidebar && sidebarBackdrop) {
                navSidebar.classList.remove('open');
                sidebarBackdrop.classList.remove('active');
            }
        });
    });
    
    // 3. Load active dropdowns & route dashboard screen
    populateStudentDropdown();
    loadScreen("dashboard");
    
    // Global active selector
    on($('#app-student-selector'), 'change', (e) => {
        appState.activeStudentId = e.target.value;
        resetSimulationStateForActiveStudent();
        
        const currentActive = $('.nav-btn.active').getAttribute('data-target');
        loadScreen(currentActive);
    });
    
    on($('#btn-reset-db'), 'click', () => {
        if (confirm("Are you sure you want to clear all data and reset the database?")) {
            localStorage.clear();
            window.location.reload();
        }
    });
});
