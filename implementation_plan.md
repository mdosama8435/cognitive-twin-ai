# Implementation Plan & System Architecture: Aletheia Hub (v4.0)
### Project: Aletheia Hub — Multi-Student Cognitive Twin SaaS & Research Platform

This plan outlines the redesign of the Aletheia application into a SaaS-grade research platform. We are transitioning from a single-student emulation page to a multi-student collaborative research environment featuring student registries, persistent databases, onboarding wizards, clone engines, comparison suites, and printable reports.

---

## 1. Gap Analysis

| Feature Area | Current Project (v3.0) | Target SaaS Platform (v4.0) |
| :--- | :--- | :--- |
| **Data Persistence** | In-memory single-student object. Reverting presets overwrites the active state. | **Persistent SQLite-like LocalStorage Engine** (`src/services/db.js`) maintaining CRUD operations for tables. |
| **Student Profiles** | Hardcoded preset options in a dropdown. | **Student Library Dashboard** with grid/list toggles, search, sort, filter, and comparison. |
| **Twin Onboarding** | Standard range sliders. | **7-Step Interactive Wizard** collecting basic info, topics, styles, and behaviors. |
| **Clone & Experimentation** | Modifying active sliders. | **Cloning Engine** allowing users to clone a profile, mutate variables (e.g., raise anxiety), and run comparative impact simulations. |
| **Compare Engine** | Hardcoded Student vs. Standard AI. | **Multi-Student Benchmarking** allowing Student A vs. Student B comparison reports. |
| **Visualizations** | Canvas timeline and simple profile radar. | **Interactive SaaS Widgets** (comparison radar overlays, timeline benchmarks, gauges). |
| **Document Workspaces** | Standard brief text box. | **Brief Builder Page** with Markdown editor, HTML preview, export controls, and revision selectors. |
| **Reports & Imports** | Static print formatting. | **SaaS Exporter** with export to Markdown, JSON profiles, and PDF. |

---

## 2. New System Architecture

Aletheia Hub utilizes a **Client-Side SaaS Architecture** using a LocalStorage relational mapper.

```
       [UI DOM Layer] (Sidebar, Pages, Modal overlays)
              ↕ (Reactive State Dispatcher)
     [app.js Central Router / Page Manager]
              ↕
     [db.js Relational Storage Engine] (LocalStorage)
       ├── tables: students, briefs, profiles, simulations, etc.
       └── CRUD Operations & Seeding Core
              ↕
 ┌──────────────────────┼──────────────────────┐
 ▼                      ▼                      ▼
[Cognitive Engine]  [Linguistic DNA]  [Contradiction Detector]
State variables       L1/L2 statistics   Warning Heuristic Rules
```

---

## 3. Updated Folder Structure

We will refactor the codebase to reflect a SaaS directory structure:

```
C:\Users\Laptop\.gemini\antigravity-ide\brain\ec6ad2a2-af0e-44d3-a45f-a89d90df2f51\
├── index.html
├── style.css
└── src/
    ├── app.js                       # Router & State controller bootstrap
    ├── data/
    │   └── questions.js             # Shared questions & templates
    ├── services/
    │   └── db.js                    # LocalStorage Relational Engine
    ├── cognitive_engine/
    │   └── engine.js                # Cognitive State math formulas
    ├── brief_builder/
    │   ├── generator.js             # Brief Markdown compiler
    │   └── parser.js                # Contradiction warnings index
    ├── student_profiles/
    │   └── clone_engine.js          # Profile cloning & mutation metrics
    ├── writing_dna/
    │   └── dna_analyzer.js          # Linguistic DNA parser
    ├── evaluation/
    │   └── comparison.js            # Similarity calculation routines
    ├── reports/
    │   └── report_exporter.js       # PDF and JSON formatting exports
    ├── visualizations/
    │   └── canvas_charts.js         # Canvas graphics drawer
    ├── utils/
    │   ├── dom.js                   # DOM shortcuts
    │   └── math.js                  # Math formulas
    └── components/                  # UI View Components
        ├── dashboard.js             # Overview analytics cards
        ├── student_library.js       # Search, Filter, & CRUD grids
        ├── onboarding_wizard.js     # 7-step twin creator wizard
        ├── brief_editor.js          # Workspace with Markdown/HTML splits
        ├── comparison_page.js       # Student A vs Student B overlays
        ├── profile_dashboard.js     # Tabbed individual student stats
        ├── simulation_validation.js # Three-column validation runner
        └── professor_review.js      # Quiz and remarks box
```

---

## 4. Database Schema Design (LocalStorage)

We will write a JSON-relational schema mapping inside `src/services/db.js`:

```javascript
// Database state model inside localStorage: db_aletheia_hub
{
  "students": [
    { "id": "alex", "name": "Alex", "degree": "B.Sc. Cognitive Science", "subject": "Cognitive Psychology", "level": "Undergraduate", "twinScore": 71, "lastSimulatedAt": "2026-06-14" }
  ],
  "briefs": [
    { "id": "b_alex", "student_id": "alex", "markdown_text": "...", "completeness": 80, "version": 1 }
  ],
  "cognitive_profiles": [
    { "id": "p_alex", "student_id": "alex", "traits": { "conceptualGrasp": 85, "quantitativePrecision": 30, "roteMemory": 40, "attentionSpan": 65, "verbosity": 80, "stressThreshold": 50, "conscientiousness": 45, "timeSensitivity": 75, "preferredExamples": "...", "strengths": "...", "weaknesses": "..." } }
  ],
  "writing_dna": [
    { "id": "dna_alex", "student_id": "alex", "stats": { "sentenceLengthAvg": 16.5, "sentenceLengthStdDev": 4.2, "analogyDensity": 2.5, "transitionDensity": 5.4, "passiveVoiceDensity": 3.8, "lexicalDensity": 42.1 } }
  ],
  "simulations": [
    { "id": "sim_1", "student_id": "alex", "date": "2026-06-14", "answers": { "alex": "...", "brief": "...", "perfect": "..." }, "metrics": [] }
  ],
  "evaluations": [
    { "id": "e_1", "simulation_id": "sim_1", "rating": 71, "comments": "Good conceptual grasp but rushed." }
  ],
  "version_history": [
    { "id": "vh_1", "brief_id": "b_alex", "timestamp": "...", "action": "Initial Interview", "text": "..." }
  ]
}
```

---

## 5. Component Map & User Flows

### UI Component Map
- `Dashboard`: Aggregates and stats (Total twins, average accuracy, recent runs list).
- `StudentLibrary`: The user registry. Renders either card grid or list row templates. Includes query filters.
- `OnboardingWizard`: Form wizard containing Steps 1 (Basic Info), 2 (Knowledge), 3 (Learning), 4 (Writing), 5 (Behavior), 6 (Mistakes), and 7 (Generate Twin).
- `BriefEditor`: Side-by-side workspace: Markdown Editor | Rendered Preview, and version selector.
- `ComparisonPage`: Benchmarks two student profiles. Outputs a side-by-side grid, discrepency details, and overlay radar chart.
- `ProfileDashboard`: Individual dashboard with profile parameters, knowledge maps, DNA statistics, and simulation history.

### User Flow
```
1. Open Library -> View Students -> Click "Compare" -> Select Jordan & Taylor -> Compare Metrics
2. Click "Create Cognitive Twin" -> Complete 7 Steps -> Auto-generate Brief & DNA -> Save to Database
3. Open Library -> Select Alex -> Click "Clone" -> Mutate stress to 90% -> Run Simulator -> Review Scorecard
```

---

## 6. UI Wireframes

### Layout Blueprint (Left Sidebar Grid)
```
+---------------------------------------------------------------------------------+
| ALETHEIA HUB   | Header Pane: Page Name & Status Badge                          |
+----------------+----------------------------------------------------------------+
| Dashboard      |                                                                |
| Library        |  Main Content Workspace Pane                                   |
| Create Twin    |                                                                |
| Brief Builder  |                                                                |
| Comparison     |                                                                |
| Simulator      |                                                                |
| Report         |                                                                |
+----------------+----------------------------------------------------------------+
```

### Student Card Wireframe
```
+------------------------------------------+
| Alex                                     |
| B.Sc. Cognitive Science                  |
| Last Run: 2026-06-14                     |
+------------------------------------------+
| Twin Score: 71%  |  Status: Calibrated   |
+------------------------------------------+
| [Simulate]  [Compare]  [Clone]  [Delete] |
+------------------------------------------+
```

---

## 7. Implementation Roadmap

### Phase 1: Database & Router (Steps 1-2)
- Reorganize files into new directory tree.
- Create `src/services/db.js` relational storage layer.
- Populate `presets.js` into DB seed routine.
- Redesign `index.html` sidebar buttons to route all pages dynamically.

### Phase 2: Onboarding & Brief Editor (Steps 3-5)
- Write `src/components/onboarding_wizard.js` with 7 steps.
- Write `src/components/student_library.js` listing card components.
- Rebuild `src/components/brief_editor.js` containing markdown viewer.

### Phase 3: Comparison & Cloning (Steps 6-8)
- Build `src/components/comparison_page.js` to draw dual metrics and radar charts.
- Build profile cloner inside `src/student_profiles/clone_engine.js` with impact stats.
- Connect individual student profile tabs in `src/components/profile_dashboard.js`.

### Phase 4: Assembly & Testing (Steps 9-11)
- Hook up app controller state loops inside `src/app.js`.
- Test dashboard stats and mock import/export JSON functionality.
- Verify through browser subagent verification runs.
