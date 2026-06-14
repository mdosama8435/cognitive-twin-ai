export const questions = [
    {
        id: "q1",
        tag: "Question 1: Conceptual Focus",
        text: "Discuss Baddeley's Working Memory model and Treisman's Attenuation theory, explaining how they interact during a complex cognitive task.",
        perfectAnswer: `Baddeley and Hitch’s (1974) multi-component working memory model comprises four primary sub-systems: the Central Executive, the Phonological Loop, the Visuospatial Sketchpad, and the Episodic Buffer (added in 2000). The Phonological Loop processes auditory-verbal information through an active phonological store and an articulatory rehearsal process. Concurrently, the Visuospatial Sketchpad processes visual and spatial layout.

Treisman’s (1964) Attenuation Theory explains selective attention processes by positing an attenuator that processes unattended sensory inputs at a reduced signal strength rather than filtering them completely (Broadbent, 1958). In a dual-task paradigm (e.g., simultaneous auditory navigation and spatial driving), the Central Executive allocates finite attentional resources. 

According to Treisman's model, unattended auditory signals undergo semantic processing if their cognitive threshold is low (e.g., the cocktail party phenomenon). If task demands exceed working memory capacity, performance degrades predictably according to cognitive load theory limits.`,
        briefGuidedAnswer: `In setting out to examine working memory, it's helpful to move past rigid models and think of it like a computer desktop screen. Multiple programs or 'tabs' are active at once, each taking up memory pixels. In Baddeley and Hitch's working memory model, this system splits into verbal processing (the phonological loop) and visual processing (the visuospatial sketchpad), supervised by the central executive.

But how does the brain choose which tabs get focus? Treisman's attenuation theory suggests attention acts like a volume dial. Unattended inputs aren't shut out completely; they are just turned down.

For example, when driving (using the visuospatial sketchpad) while listening to GPS instructions (using the phonological loop), both streams run. The music volume is attenuated, but if someone screams your name, it breaks through due to its low activation threshold. In other words, memory isn't a tape recorder; it's a constructive process—or, more accurately, a reconstructive one, where we rebuild the past using current expectations.`,
        blocks: [
            {
                type: "intro",
                // Under high conceptual, low quant: use analogy. Under low conceptual: keep it basic. Under high quant: make it clinical.
                get: (p) => {
                    if (p.conceptualGrasp >= 75 && p.quantitativePrecision < 50) {
                        return "Working memory isn't just a static storage box; it's more like a [analogy|dynamic computer desktop where you have multiple browser tabs open at the same time, each taking up active processing pixels]. ";
                    } else if (p.conceptualGrasp < 60) {
                        return "Working memory is a short-term store that holds information so we can think. ";
                    } else {
                        return "Baddeley and Hitch's working memory model represents a multi-component buffer that holds information transiently. ";
                    }
                }
            },
            {
                type: "details",
                get: (p) => {
                    let yearText = p.roteMemory >= 70 ? "1974" : "mid-70s";
                    let text = `In their classic ${yearText} model, this system is split into the phonological loop for verbal info and the visuospatial sketchpad for visual layout, all managed by a central executive. `;
                    if (p.roteMemory < 40) {
                        text = text.replace("classic", "famous, though the exact year escapes me,");
                    }
                    return text;
                }
            },
            {
                type: "attention",
                get: (p) => {
                    if (p.conceptualGrasp >= 70 && p.verbosity >= 70) {
                        return "\n\nBut this raises a critical question: how do we decide which 'tabs' get screen time? This is where Treisman's attenuation theory comes in. Unlike Broadbent's early filter model, which acts like a rigid, light-blocking door, Treisman suggests our attention filter is more like a [analogy|volume dial on a radio]. Unattended inputs aren't completely muted; they are just turned down. ";
                    } else {
                        return "\n\nTreisman's attenuation theory explains that unattended messages are attenuated rather than blocked entirely, unlike Broadbent's filter. ";
                    }
                }
            },
            {
                type: "example",
                get: (p) => {
                    let text = "\n\nIf we drive a car (a visuospatial task) and follow GPS directions (a verbal task), the central executive is constantly juggling these inputs. ";
                    if (p.verbosity >= 80) {
                        text += "The background music is turned down, but if someone suddenly screams your name, it breaks through because your name has a very low activation threshold. ";
                    }
                    if (p.conscientiousness < 50) {
                        text += "This suggests that memory is a constructive process—[correction|or, more accurately, a reconstructive one, where we rebuild the past using current expectations].";
                    }
                    return text;
                }
            }
        ]
    },
    {
        id: "q2",
        tag: "Question 2: Application Focus",
        text: "Analyze the role of schemas in memory reconstruction, citing Bartlett's classic experiments and modern applications.",
        perfectAnswer: `Schemas are structured cognitive frameworks that represent generic knowledge about objects, situations, and sequences of events. Frederic Bartlett’s (1932) seminal study utilizing the method of repeated reproduction demonstrated that memory retrieval is reconstructive rather than reproductive.

When British participants recalled the Native American folk tale "The War of the Ghosts," systematic distortions occurred in three categories: rationalization (making the story culturally familiar), leveling (omitting unfamiliar details), and sharpening (accentuating specific familiar elements). For example, "canoes" were reconstructed as "boats" to align with existing schemas.

Modern cognitive research confirms schemas influence both encoding and retrieval. In eyewitness memory research, Loftus and Palmer (1974) demonstrated that post-event misinformation integrates into the original memory trace. The verb "smashed" activated schemas of high-velocity impact, leading participants to falsely report broken glass (critical value p < 0.05).`,
        briefGuidedAnswer: `When we recall the past, we aren't loading a video file from a hard drive. Memory is fundamentally reconstructive. We rely heavily on schemas, which are mental frameworks that organize our knowledge about the world.

To understand this, we have to look at Bartlett's famous 1932 "War of the Ghosts" experiment. [trope|There was a famous study where researchers had participants read a Native American folk tale and retell it repeatedly over months, though the exact names of the co-authors escape me—I believe Bartlett was the lead investigator]. What he found was fascinating: participants didn't just forget details; they actively altered them. Canoes became "boats," and hunting seals became "fishing." They were editing the memory to fit their Western schemas.

In a sense, schemas act like [analogy|predictive text on a phone]. Our brain fills in the blanks of what "should" have happened based on cultural templates. This points to a deeper issue in eyewitness testimony, as shown in classic work on reconstructive retrieval: if you prompt someone with leading words like "smashed" instead of "hit," their schema for a high-speed car crash reconstructs the memory to include broken glass that was never actually there.`,
        blocks: [
            {
                type: "intro",
                get: (p) => {
                    if (p.conceptualGrasp >= 70) {
                        return "When we recall the past, we aren't loading a video file from a hard drive. Memory is fundamentally reconstructive. We rely heavily on schemas, which are mental frameworks that organize our knowledge about the world. ";
                    } else {
                        return "Schemas are mental frameworks that help us organize knowledge. Memory is not perfect; it is reconstructive. ";
                    }
                }
            },
            {
                type: "bartlett",
                get: (p) => {
                    let yearText = p.roteMemory >= 75 ? "1932" : "famous, though the exact year escapes me,";
                    let text = `\n\nTo understand this, we look at Bartlett's ${yearText} 'War of the Ghosts' study. `;
                    if (p.roteMemory < 50) {
                        text += "[trope|There was a famous study where researchers had participants read a Native American folk tale and retell it repeatedly over months, though the names of the co-authors escape me—I believe Bartlett was the lead investigator]. ";
                    } else {
                        text += "Bartlett had British subjects read a Native American story and retell it repeatedly over months. ";
                    }
                    text += "He found that participants systematically altered details: canoes became 'boats' and hunting seals became 'fishing' to fit their existing Western schemas. ";
                    return text;
                }
            },
            {
                type: "application",
                get: (p) => {
                    let analogyStr = p.conceptualGrasp >= 75 ? "In a sense, schemas act like [analogy|predictive text on a phone]. Our brain fills in the blanks of what 'should' have happened based on templates. " : "";
                    let yearText2 = p.roteMemory >= 75 ? "in a 1974 study by Loftus and Palmer" : "in classic experiments on reconstructive retrieval";
                    let text = `\n\n${analogyStr}This points to a deeper issue in eyewitness testimony, as shown ${yearText2}. If you prompt someone with leading words like 'smashed' instead of 'hit', their schema of a high-speed crash reconstructs the memory to include broken glass that was never actually there.`;
                    return text;
                }
            }
        ]
    },
    {
        id: "q3",
        tag: "Question 3: Quantitative Focus",
        text: "Explain Deutsch & Deutsch's late-selection model of attention and detail the mathematical integration of the signal detection threshold under high perceptual load.",
        perfectAnswer: `Deutsch and Deutsch’s (1963) Late-Selection Model posits that all sensory stimuli undergo complete perceptual and semantic analysis prior to selection. The selection bottleneck resides immediately before response selection, governed by the activation level of the cognitive representations.

Response probability P(Ri) for stimulus i is a logistic function of processing activation Ai relative to selection threshold theta: P(Ri) = 1 / (1 + e^-(Ai - theta)). Under high perceptual load, Signal Detection Theory (SDT) parameters describe a shift in decision criterion beta. Sensitivity index d' is defined as: d' = (mus - mun) / sigma.

In early-selection models, d' for unattended channels approaches zero. In Deutsch & Deutsch's model, $d'$ remains constant across channels, but response selection is restricted. Lavie's (1995) Perceptual Load Theory reconciles this by proving early selection occurs under high perceptual load, whereas late selection occurs only under low load, resolving the resource allocation equation.`,
        briefGuidedAnswer: `Deutsch and Deutsch argued for a late-selection model, suggesting that all sensory inputs are processed to a semantic level before we select what to focus on.

[pivot|While the mathematical formulation of Deutsch & Deutsch's model attempts to quantify the threshold of late-stage selection, the core psychological premise rests on a conceptual argument: that all incoming stimuli are processed to the level of meaning before selection occurs. To understand this, we must look at how semantic priming operates.]

If we look at signal detection theory, the probability of detecting a target in a noisy channel depends on the criteria we set. Under high load, the brain must filter out distracting inputs. [handwave|As the perceptual load increases, the detection threshold changes, causing a shift in our sensitivity index. The mathematical relationship shows that as load rises, our criteria for what counts as a signal becomes more conservative, causing us to miss things we would normally detect in a quiet environment.]

Also, the late-selection model has trouble explaining why we don't feel completely overwhelmed. In other words, if everything is processed to meaning, our brain would crash. This basically means that selection must happen earlier under high load. I think Treisman is right here.`,
        blocks: [
            {
                type: "intro",
                get: (p) => {
                    let yearText = p.roteMemory >= 75 ? "1963" : "mid-60s";
                    return `Deutsch and Deutsch's ${yearText} model argues for a late-selection filter. They suggest that all sensory inputs are processed to the level of meaning before selection occurs. `;
                }
            },
            {
                type: "math",
                get: (p) => {
                    if (p.quantitativePrecision < 50) {
                        return "\n\n[pivot|While the mathematical formulation of Deutsch & Deutsch's model attempts to quantify the threshold of late-stage selection, the core psychological premise rests on a conceptual argument: that all incoming stimuli are processed to the level of meaning before selection occurs. To understand this, we must look at how semantic priming operates.] ";
                    } else {
                        return "\n\nMathematically, the probability of response selection is a logistic function of stimulus activation relative to a response threshold: P(Ri) = 1 / (1 + e^-(Ai - theta)). Under high perceptual load, Signal Detection Theory (SDT) describes a shift in the decision criteria beta. ";
                    }
                }
            },
            {
                type: "sdt",
                get: (p) => {
                    if (p.quantitativePrecision < 50) {
                        return "\n\nIf we look at signal detection theory, the probability of detecting a target depends on the criteria we set. [handwave|As the perceptual load increases, the detection threshold changes, causing a shift in our sensitivity index. The mathematical relationship shows that as load rises, our criteria for what counts as a signal becomes more conservative, causing us to miss things we would normally detect in a noisy environment.] ";
                    } else {
                        return `\n\nSensitivity index d' is defined as d' = (mus - mun) / sigma. In Deutsch & Deutsch's model, d' remains constant across unattended channels, but selection is restricted. `;
                    }
                }
            },
            {
                type: "fatigue_slip",
                get: (p) => {
                    // This block triggers near the end of Question 3.
                    // Under high time sensitivity / stress, write rushed sentences.
                    if (p.timeSensitivity >= 70 || p.stressThreshold < 50) {
                        return "\n\nAlso, the model has trouble. If everything is processed to meaning, our brain would crash. This basically means that selection must happen earlier under high load. I think Treisman is right here. Time is low, but basically early selection makes sense.";
                    } else {
                        return "\n\nHowever, empirical data (e.g., Lavie's 1995 Perceptual Load Theory) reconciles this: early selection occurs under high load, and late selection under low load, maintaining attentional resource bounds.";
                    }
                }
            }
        ]
    },
    {
        id: "q4",
        tag: "Question 4: Validation Mode (Unknown Question)",
        text: "Discuss Anderson's ACT-R cognitive architecture, specifically detailing the difference between declarative chunks and procedural production rules, and the mathematical formula for chunk activation latency.",
        perfectAnswer: `Anderson’s (1993) ACT-R (Adaptive Control of Thought-Rational) is an integrated cognitive architecture that models human performance. It bifurcates memory into Declarative Memory, containing facts represented as propositional 'chunks', and Procedural Memory, containing operational units represented as 'production rules' (condition-action statements).

The activation $A_i$ of chunk $i$ is calculated as the sum of its base-level activation and associative activation:
$$A_i = \ln \sum_{j=1}^{n} t_j^{-d} + \sum_{k} W_k S_{ki}$$
The retrieval latency $T$ of chunk $i$ is an exponential decay function of its active strength:
$$T = F \cdot e^{-f \cdot A_i}$$
Where $F$ is the latency scale factor and $f$ is the latency exponent. Procedural rules are selected via utility calculation, and learning is represented by strengthening base-level chunk activation ($d \approx 0.5$).`,
        briefGuidedAnswer: `Anderson's ACT-R is a cognitive architecture model that attempts to simulate the whole brain. It splits memory into declarative chunks (which are facts) and procedural rules (which are rules for actions).

[pivot|While the mathematical formula for ACT-R chunk activation latency attempts to model retrieval timing precisely, the critical conceptual focus is on how memories fade over time. To understand declarative chunks, we should look at how rehearsal keeps facts active, similar to how path pathways get stronger when walked on repeatedly.]

ACT-R uses equations to show that retrieval gets slower if a chunk hasn't been accessed in a while. [handwave|Essentially, the mathematical latency decays logarithmically as time since last recall increases. The formula establishes that retrieval time is an inverse function of the chunk's activation strength, meaning highly active ideas are recalled almost instantly, while neglected chunks eventually fade beyond the retrieval threshold.]

Also, ACT-R procedural rules are like production rules. Basically, they run the cognitive actions. This is like a flowchart of rules.`,
        blocks: [
            {
                type: "intro",
                get: (p) => {
                    let yearText = p.roteMemory >= 75 ? "1993" : "sometime in the 90s";
                    return `Anderson's ACT-R is a complex cognitive architecture developed in the ${yearText} that attempts to simulate human mind flow. It divides memory into declarative memory, which holds factual 'chunks' of info, and procedural memory, which holds 'production rules' that do the work. `;
                }
            },
            {
                type: "declarative_procedural",
                get: (p) => {
                    if (p.conceptualGrasp >= 70) {
                        return "Declarative chunks are structured like semantic nodes (e.g., knowing 'Paris is the capital of France'), while procedural rules are IF-THEN rules that execute mental operations when a condition matches. ";
                    } else {
                        return "Chunks hold facts like words, and rules are the guidelines that run the tasks. ";
                    }
                }
            },
            {
                type: "latency_math",
                get: (p) => {
                    if (p.quantitativePrecision < 60) {
                        return "\n\n[pivot|While the mathematical formula for ACT-R chunk activation latency attempts to model retrieval timing precisely, the critical conceptual focus is on how memories fade over time. To understand declarative chunks, we should look at how rehearsal keeps facts active, similar to how pathways get stronger when walked on repeatedly.] ";
                    } else {
                        return "\n\nThe activation Ai of chunk i is modeled as Ai = ln(sum(tj^-d)) + sum(Wk * Ski). The retrieval latency T is defined as an exponential function: T = F * e^(-f * Ai), meaning latency decays as activation increases. ";
                    }
                }
            },
            {
                type: "unknown_hallucination",
                get: (p) => {
                    // Under low rote memory and high stress, taylor/alex might make a factual error / hallucinate.
                    if (p.roteMemory < 50 || p.stressThreshold < 50) {
                        return "\n\n[handwave|Basically, the retrieval latency decays logarithmically as time since last recall increases. The formula establishes that retrieval time is an inverse function of the chunk's activation strength, meaning highly active ideas are recalled almost instantly, while neglected chunks eventually fade beyond the retrieval threshold.] ";
                    } else {
                        return "\n\nThe learning decay parameter d is typically set around 0.5. As base-level activation decays according to power laws, chunk retrieval probability falls. ";
                    }
                }
            },
            {
                type: "conclusion",
                get: (p) => {
                    if (p.timeSensitivity >= 70) {
                        return "\n\nAlso, production rules are selected by utility. Basically, whichever rule is most useful gets chosen. It's like a path selector. Rushed now, but that is the core idea.";
                    } else {
                        return "\n\nConflict resolution in procedural memory occurs via expected utility calculation, selecting rules that maximize probability of achieving the active cognitive goal.";
                    }
                }
            }
        ]
    }
];
