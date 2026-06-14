// Exam Questions & Script Contents (with markup for Alex's cognitive traits)
const examData = [
    {
        tag: "Question 1 of 3 (Conceptual Focus)",
        text: "Discuss Baddeley's Working Memory model and Treisman's Attenuation theory, explaining how they interact during a complex cognitive task.",
        alexRaw: `Working memory isn't just a static storage box; it's more like a [analogy|dynamic computer desktop where you have multiple browser tabs open at the same time, each taking up active processing pixels]. In Baddeley and Hitch's classic working memory model, we see this system split into the phonological loop for verbal info and the visuospatial sketchpad for imagery, all managed by a central executive.

But this raises a critical question: how do we decide which "tabs" get screen time? This is where Treisman's attenuation theory comes in. Unlike Broadbent's early filter model, which acts like a rigid, light-blocking door, Treisman suggests our attention filter is more like a [analogy|volume dial on a radio]. Unattended inputs aren't completely muted; they are just turned down.

It is worth noting that if you are driving a car (a visuospatial sketchpad task) while trying to follow GPS verbal directions (a phonological loop task), your central executive is constantly juggling these inputs. The volume on the music is attenuated, but if someone screams your name from the passenger seat, it breaks through because your name has a very low activation threshold. This suggests that memory is a constructive process—[correction|or, more accurately, a reconstructive one, where we rebuild the past using current expectations].`,
        aiRaw: `Baddeley and Hitch’s (1974) multi-component working memory model comprises four primary sub-systems: the Central Executive, the Phonological Loop, the Visuospatial Sketchpad, and the Episodic Buffer (added in 2000). The Phonological Loop processes auditory-verbal information through an active phonological store and an articulatory rehearsal process. Concurrently, the Visuospatial Sketchpad processes visual and spatial layout.

Treisman’s (1964) Attenuation Theory explains selective attention processes by positing an attenuator that processes unattended sensory inputs at a reduced signal strength rather than filtering them completely (Broadbent, 1958). In a dual-task paradigm (e.g., simultaneous auditory navigation and spatial driving), the Central Executive allocates finite attentional resources. 

According to Treisman's model, unattended auditory signals undergo semantic processing if their cognitive threshold is low (e.g., the cocktail party phenomenon). If task demands exceed working memory capacity, performance degrades predictably according to cognitive load theory limits.`
    },
    {
        tag: "Question 2 of 3 (Application Focus)",
        text: "Analyze the role of schemas in memory reconstruction, citing Bartlett's classic experiments and modern applications.",
        alexRaw: `When we recall the past, we aren't loading a video file from a hard drive. Memory is fundamentally reconstructive. We rely heavily on schemas, which are mental frameworks that organize our knowledge about the world.

To understand this, we have to look at Bartlett's famous 1932 "War of the Ghosts" experiment. [trope|There was a famous study where researchers had participants read a Native American folk tale and retell it repeatedly over months, though the exact names of the co-authors escape me—I believe Bartlett was the lead investigator]. What he found was fascinating: participants didn't just forget details; they actively altered them. Canoes became "boats," and hunting seals became "fishing." They were editing the memory to fit their Western schemas.

In a sense, schemas act like [analogy|predictive text on a phone]. Our brain fills in the blanks of what "should" have happened based on cultural templates. This points to a deeper issue in eyewitness testimony, as shown in classic work on reconstructive retrieval: if you prompt someone with leading words like "smashed" instead of "hit," their schema for a high-speed car crash reconstructs the memory to include broken glass that was never actually there.`,
        aiRaw: `Schemas are structured cognitive frameworks that represent generic knowledge about objects, situations, and sequences of events. Frederic Bartlett’s (1932) seminal study utilizing the method of repeated reproduction demonstrated that memory retrieval is reconstructive rather than reproductive.

When British participants recalled the Native American folk tale "The War of the Ghosts," systematic distortions occurred in three categories: rationalization (making the story culturally familiar), leveling (omitting unfamiliar details), and sharpening (accentuating specific familiar elements). For example, "canoes" were reconstructed as "boats" to align with existing schemas.

Modern cognitive research confirms schemas influence both encoding and retrieval. In eyewitness memory research, Loftus and Palmer (1974) demonstrated that post-event misinformation integrates into the original memory trace. The verb "smashed" activated schemas of high-velocity impact, leading participants to falsely report broken glass (critical value p < 0.05).`
    },
    {
        tag: "Question 3 of 3 (Quantitative / Biology Focus)",
        text: "Explain Deutsch & Deutsch's late-selection model of attention and detail the mathematical integration of the signal detection threshold under high perceptual load.",
        alexRaw: `Deutsch and Deutsch argued for a late-selection model, suggesting that all sensory inputs are processed to a semantic level before we select what to focus on.

[pivot|While the mathematical formulation of Deutsch & Deutsch's model attempts to quantify the threshold of late-stage selection, the core psychological premise rests on a conceptual argument: that all incoming stimuli are processed to the level of meaning before selection occurs. To understand this, we must look at how semantic priming operates.]

If we look at signal detection theory, the probability of detecting a target in a noisy channel depends on the criteria we set. Under high load, the brain must filter out distracting inputs. [handwave|As the perceptual load increases, the detection threshold changes, causing a shift in our sensitivity index. The mathematical relationship shows that as load rises, our criteria for what counts as a signal becomes more conservative, causing us to miss things we would normally detect in a quiet environment.]

Also, the late-selection model has trouble explaining why we don't feel completely overwhelmed. In other words, if everything is processed to meaning, our brain would crash. This basically means that selection must happen earlier under high load. I think Treisman is right here.`,
        aiRaw: `Deutsch and Deutsch’s (1963) Late-Selection Model posits that all sensory stimuli undergo complete perceptual and semantic analysis prior to selection. The selection bottleneck resides immediately before response selection, governed by the activation level of the cognitive representations.

Response probability P(Ri) for stimulus i is a logistic function of processing activation Ai relative to selection threshold theta: P(Ri) = 1 / (1 + e^-(Ai - theta)). Under high perceptual load, Signal Detection Theory (SDT) parameters describe a shift in decision criterion beta. Sensitivity index d' is defined as: d' = (mus - mun) / sigma.

In early-selection models, d' for unattended channels approaches zero. In Deutsch & Deutsch's model, d' remains constant across channels, but response selection is restricted. Lavie's (1995) Perceptual Load Theory reconciles this by proving early selection occurs under high perceptual load, whereas late selection occurs only under low load, resolving the resource allocation equation.`
    }
];

// Parser to turn raw marked up text into token arrays
function parseTextToTokens(text) {
    const tokens = [];
    const regex = /\[(analogy|handwave|correction|pivot|trope)\|([^\]]+)\]/g;
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }
        tokens.push({
            type: match[1],
            content: match[2]
        });
        lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }
    return tokens;
}

// Get raw text length (excluding tags)
function getCleanTextLength(tokens) {
    return tokens.reduce((sum, token) => sum + token.content.length, 0);
}

// Render HTML content up to a character count
function renderTokensToHtml(tokens, charCount) {
    let outputHtml = '';
    let currentCount = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenLen = token.content.length;
        
        if (currentCount >= charCount) break;
        
        const isLast = (currentCount + tokenLen) > charCount;
        const printLen = isLast ? (charCount - currentCount) : tokenLen;
        const printedContent = token.content.substring(0, printLen);
        
        if (token.type === 'text') {
            outputHtml += printedContent;
        } else {
            let tooltip = '';
            switch (token.type) {
                case 'analogy':
                    tooltip = 'Everyday Analogy: Alex maps complex cognitive processes to familiar everyday concepts (e.g., computer browser tabs) to establish intuitive reasoning.';
                    break;
                case 'handwave':
                    tooltip = 'Verbal Hand-Waving: When unsure of specific equations or quantitative details, Alex retreats to descriptive, qualitative hand-waving.';
                    break;
                case 'correction':
                    tooltip = 'Syntactic Self-Correction: Simulates real-time thinking and editing by shifting mid-sentence structure to clarify a point.';
                    break;
                case 'pivot':
                    tooltip = 'Conceptual Pivot: When faced with a quantitative detail Alex doesn\'t know, they pivot the question back to their strong conceptual zones.';
                    break;
                case 'trope':
                    tooltip = 'Lost Researcher Trope: Alex accurately explains a landmark experiment but admits to completely forgetting the researchers\' names.';
                    break;
            }
            outputHtml += `<span class="hl hl-${token.type}" data-tooltip="${tooltip}">${printedContent}</span>`;
        }
        currentCount += printLen;
    }
    return outputHtml;
}

// Check which quirk is active at the current character index
function getActiveQuirkType(tokens, charCount) {
    let currentCount = 0;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenLen = token.content.length;
        if (charCount > currentCount && charCount <= currentCount + tokenLen) {
            return token.type === 'text' ? null : token.type;
        }
        currentCount += tokenLen;
    }
    return null;
}

// Calculate word count of text printed so far
function getWordCount(htmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
    return cleanText.split(/\s+/).filter(Boolean).length;
}

// Simulation State
let state = {
    isPlaying: false,
    isCompleted: false,
    currentQ: 0,
    alexCharIndex: 0,
    aiCharIndex: 0,
    tickCount: 0,
    alexPauseTicks: 0,
    speedSliderVal: 3,
    timerId: null
};

// Prepared Tokens
const parsedQuestions = examData.map(q => ({
    alexTokens: parseTextToTokens(q.alexRaw),
    aiTokens: parseTextToTokens(q.aiRaw),
    alexLen: getCleanTextLength(parseTextToTokens(q.alexRaw)),
    aiLen: getCleanTextLength(parseTextToTokens(q.aiRaw))
}));

// DOM Elements
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');

const stateBadge = document.getElementById('state-badge');
const valAttention = document.getElementById('val-attention');
const barAttention = document.getElementById('bar-attention');
const valFatigue = document.getElementById('val-fatigue');
const barFatigue = document.getElementById('bar-fatigue');
const valConceptual = document.getElementById('val-conceptual');
const barConceptual = document.getElementById('bar-conceptual');
const valPrecision = document.getElementById('val-precision');
const barPrecision = document.getElementById('bar-precision');

const questionTag = document.getElementById('question-tag');
const questionText = document.getElementById('question-text');
const qTabs = document.querySelectorAll('.q-tab');

const alexContent = document.getElementById('alex-content');
const aiContent = document.getElementById('ai-content');
const alexWords = document.getElementById('alex-words');
const aiWords = document.getElementById('ai-words');
const evaluationPanel = document.getElementById('evaluation-panel');

// Speed configuration mappings
const speedConfigs = {
    1: { name: '1x (Reading speed)', multiplier: 1.0 },
    2: { name: '2x', multiplier: 2.5 },
    3: { name: '5x (Default)', multiplier: 6.0 },
    4: { name: '20x', multiplier: 25.0 },
    5: { name: 'Instant', multiplier: Infinity }
};

// Update speed label
function updateSpeedConfig() {
    state.speedSliderVal = parseInt(speedSlider.value);
    speedLabel.textContent = speedConfigs[state.speedSliderVal].name;
}
speedSlider.addEventListener('input', updateSpeedConfig);
updateSpeedConfig();

// Switch active question tab
function switchQuestionTab(qIndex) {
    if (state.isPlaying && state.speedSliderVal !== 5) {
        // Prevent manual switching while typing, unless in pause or reset
        return;
    }
    state.currentQ = qIndex;
    
    qTabs.forEach((tab, index) => {
        if (index === qIndex) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    
    const q = examData[qIndex];
    questionTag.textContent = q.tag;
    questionText.textContent = q.text;
    
    // Render text up to current index
    const qParsed = parsedQuestions[qIndex];
    
    let currentAlexIndex = 0;
    let currentAiIndex = 0;
    
    if (qIndex < state.currentQ) {
        currentAlexIndex = qParsed.alexLen;
        currentAiIndex = qParsed.aiLen;
    } else if (qIndex === state.currentQ) {
        currentAlexIndex = state.alexCharIndex;
        currentAiIndex = state.aiCharIndex;
    }
    
    const alexHtml = renderTokensToHtml(qParsed.alexTokens, currentAlexIndex);
    const aiHtml = renderTokensToHtml(qParsed.aiTokens, currentAiIndex);
    
    alexContent.innerHTML = alexHtml;
    aiContent.innerHTML = aiHtml;
    
    alexWords.textContent = `${getWordCount(alexHtml)} words`;
    aiWords.textContent = `${getWordCount(aiHtml)} words`;
    
    if (state.isPlaying) {
        alexContent.classList.add('cursor');
        aiContent.classList.add('cursor');
    } else {
        alexContent.classList.remove('cursor');
        aiContent.classList.remove('cursor');
    }
}

qTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        switchQuestionTab(index);
    });
});

// Update Real-time Metrics
function updateMetrics() {
    let fatigue = 0;
    let attention = 100;
    let focus = 95;
    let precision = 40;
    let statusText = "IDLE";
    
    if (state.isCompleted) {
        statusText = "FINISHED";
        fatigue = 90;
        attention = 25;
        focus = 55;
        precision = 35;
    } else if (state.isPlaying) {
        // Calculate progress within the entire exam
        const totalLen = parsedQuestions.reduce((sum, q) => sum + q.alexLen, 0);
        let progressLen = 0;
        for (let i = 0; i < state.currentQ; i++) {
            progressLen += parsedQuestions[i].alexLen;
        }
        progressLen += state.alexCharIndex;
        const totalProgressPercent = progressLen / totalLen;
        
        // Scale metrics based on progression
        fatigue = Math.round(totalProgressPercent * 90);
        attention = Math.round(100 - (totalProgressPercent * 75));
        
        if (state.currentQ === 0) {
            statusText = "WRITING Q1 (MASTERPIECE)";
            focus = 95;
            precision = 42;
        } else if (state.currentQ === 1) {
            statusText = "WRITING Q2 (STEADY)";
            focus = 85;
            precision = 38;
        } else {
            statusText = "RUSHING Q3 (FATIGUED)";
            focus = 60;
            precision = 25;
        }
    }
    
    // DOM Updates
    stateBadge.textContent = statusText;
    valAttention.textContent = `${attention}%`;
    barAttention.style.width = `${attention}%`;
    valFatigue.textContent = `${fatigue}%`;
    barFatigue.style.width = `${fatigue}%`;
    valConceptual.textContent = `${focus}%`;
    barConceptual.style.width = `${focus}%`;
    valPrecision.textContent = `${precision}%`;
    barPrecision.style.width = `${precision}%`;
}

// Typing Loop Step
function simStep() {
    const qParsed = parsedQuestions[state.currentQ];
    const speed = speedConfigs[state.speedSliderVal].multiplier;
    
    if (speed === Infinity) {
        // Instant Mode: Complete current and all remaining questions
        while (state.currentQ < examData.length) {
            const currentQP = parsedQuestions[state.currentQ];
            state.alexCharIndex = currentQP.alexLen;
            state.aiCharIndex = currentQP.aiLen;
            
            // Mark tab as completed
            qTabs[state.currentQ].classList.add('completed');
            
            if (state.currentQ < examData.length - 1) {
                state.currentQ++;
                state.alexCharIndex = 0;
                state.aiCharIndex = 0;
            } else {
                break;
            }
        }
        switchQuestionTab(state.currentQ);
        completeSimulation();
        return;
    }
    
    state.tickCount++;
    
    // 1. Calculate character step increment for Control AI
    let aiStep = Math.ceil(2.2 * speed);
    state.aiCharIndex = Math.min(state.aiCharIndex + aiStep, qParsed.aiLen);
    
    // 2. Calculate character step increment for Alex (organic variation)
    let alexStep = 0;
    if (state.alexPauseTicks > 0) {
        state.alexPauseTicks--;
    } else {
        let baseSpeed = 1.0;
        
        if (state.currentQ === 0) {
            // Masterpiece: confident and flowing
            baseSpeed = 0.9 + Math.sin(state.tickCount / 12) * 0.3;
        } else if (state.currentQ === 1) {
            // Steady middle
            baseSpeed = 0.85 + Math.random() * 0.25;
        } else {
            // Rushed and fatigued: erratic bursts
            if (state.tickCount % 60 < 15) {
                // Pause to think (simulate brain blocks)
                state.alexPauseTicks = Math.floor(Math.random() * 10 + 5);
                baseSpeed = 0;
            } else {
                // Rush forwards breathlessly
                baseSpeed = 1.6 + Math.random() * 0.5;
            }
        }
        
        alexStep = Math.ceil(baseSpeed * speed);
        state.alexCharIndex = Math.min(state.alexCharIndex + alexStep, qParsed.alexLen);
    }
    
    // Render text updates
    const alexHtml = renderTokensToHtml(qParsed.alexTokens, state.alexCharIndex);
    const aiHtml = renderTokensToHtml(qParsed.aiTokens, state.aiCharIndex);
    
    alexContent.innerHTML = alexHtml;
    aiContent.innerHTML = aiHtml;
    
    alexWords.textContent = `${getWordCount(alexHtml)} words`;
    aiWords.textContent = `${getWordCount(aiHtml)} words`;
    
    // Scroll container down as typing progress increases
    alexContent.parentElement.scrollTop = alexContent.parentElement.scrollHeight;
    aiContent.parentElement.scrollTop = aiContent.parentElement.scrollHeight;
    
    // Update active brief quirk highlights in sidebar
    const activeQuirk = getActiveQuirkType(qParsed.alexTokens, state.alexCharIndex);
    document.querySelectorAll('.quirk-badge').forEach(badge => {
        badge.classList.remove('active');
    });
    if (activeQuirk) {
        const activeBadge = document.getElementById(`q-${activeQuirk}`);
        if (activeBadge) activeBadge.classList.add('active');
    }
    
    updateMetrics();
    
    // Check if both scripts finished typing this question
    if (state.alexCharIndex >= qParsed.alexLen && state.aiCharIndex >= qParsed.aiLen) {
        qTabs[state.currentQ].classList.add('completed');
        
        // Move to next question or complete
        if (state.currentQ < examData.length - 1) {
            // Pause briefly, then load next question
            state.isPlaying = false;
            clearInterval(state.timerId);
            
            setTimeout(() => {
                state.currentQ++;
                state.alexCharIndex = 0;
                state.aiCharIndex = 0;
                state.isPlaying = true;
                switchQuestionTab(state.currentQ);
                state.timerId = setInterval(simStep, 35);
            }, 1000);
        } else {
            completeSimulation();
        }
    }
}

// Finish the entire exam simulation
function completeSimulation() {
    state.isPlaying = false;
    state.isCompleted = true;
    clearInterval(state.timerId);
    
    // UI state updates
    btnStart.disabled = true;
    btnPause.disabled = true;
    btnReset.disabled = false;
    
    alexContent.classList.remove('cursor');
    aiContent.classList.remove('cursor');
    
    // Deactivate all quirk badges
    document.querySelectorAll('.quirk-badge').forEach(badge => {
        badge.classList.remove('active');
    });
    
    updateMetrics();
    
    // Reveal Evaluation panel
    evaluationPanel.style.display = 'flex';
    setTimeout(() => {
        evaluationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

// Start simulation
btnStart.addEventListener('click', () => {
    if (state.isCompleted) return;
    
    state.isPlaying = true;
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnReset.disabled = false;
    
    alexContent.classList.add('cursor');
    aiContent.classList.add('cursor');
    
    updateMetrics();
    
    // Clear and focus on current active tab
    switchQuestionTab(state.currentQ);
    
    // Launch simulation timer
    state.timerId = setInterval(simStep, 35);
});

// Pause simulation
btnPause.addEventListener('click', () => {
    state.isPlaying = false;
    clearInterval(state.timerId);
    
    btnStart.disabled = false;
    btnPause.disabled = true;
    
    alexContent.classList.remove('cursor');
    aiContent.classList.remove('cursor');
    
    updateMetrics();
});

// Reset simulation
btnReset.addEventListener('click', () => {
    state.isPlaying = false;
    state.isCompleted = false;
    clearInterval(state.timerId);
    
    state.currentQ = 0;
    state.alexCharIndex = 0;
    state.aiCharIndex = 0;
    state.tickCount = 0;
    state.alexPauseTicks = 0;
    
    btnStart.disabled = false;
    btnPause.disabled = true;
    btnReset.disabled = true;
    
    // Remove completed styling from tabs
    qTabs.forEach(tab => {
        tab.classList.remove('completed');
    });
    
    // Reset contents
    switchQuestionTab(0);
    
    // Hide evaluation
    evaluationPanel.style.display = 'none';
    
    updateMetrics();
});
