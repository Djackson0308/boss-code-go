/* ========================================================= */
/* B.O.S.S CODE GO */
/* COMPLETE APP.JS */
/* ========================================================= */


/* ========================================================= */
/* BASIC HELPERS */
/* ========================================================= */

const $ = id =>
    document.getElementById(id);


function addClick(
    id,
    callback
) {

    const element =
        $(id);

    if (element) {

        element.addEventListener(
            "click",
            callback
        );
    }
}



function showScreen(
    screen
) {

    if (!screen) {
        return;
    }


    document
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active-screen"
                );
            }
        );


    screen.classList.add(
        "active-screen"
    );


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });


    if (
        screen.id ===
        "boss-bite-screen" &&
        bossBiteMap
    ) {

        setTimeout(
            function () {

                bossBiteMap.resize();

            },
            300
        );
    }


    if (
        screen.id ===
        "boss-code-tv-screen"
    ) {

        updateBossCodeTvLive();
    }
}



/* ========================================================= */
/* ADMIN / LIVE SETTINGS */
/* ========================================================= */

const ADMIN_STORAGE_KEY =
    "boss-code-admin-settings-v1";


function getBossCodeAdminSettings() {

    try {

        const stored =
            localStorage.getItem(
                ADMIN_STORAGE_KEY
            );


        if (!stored) {

            return {

                liveUrl:"",
                liveVideoId:"",
                liveEnabled:false,
                updatedAt:null

            };
        }


        return JSON.parse(
            stored
        );


    } catch (error) {

        return {

            liveUrl:"",
            liveVideoId:"",
            liveEnabled:false,
            updatedAt:null

        };
    }
}



/* ========================================================= */
/* B.O.S.S CODE TV LIVE */
/* READS FROM ADMIN.HTML */
/* ========================================================= */

function updateBossCodeTvLive() {

    const settings =
        getBossCodeAdminSettings();


    const section =
        document.querySelector(
            ".boss-tv-live-section"
        );


    if (!section) {
        return;
    }


    const player =
        section.querySelector(
            ".boss-tv-live-player"
        );


    const badge =
        section.querySelector(
            ".boss-tv-live-badge"
        );


    const bottomLabel =
        section.querySelector(
            ".boss-tv-live-label"
        );


    const bottomTitle =
        section.querySelector(
            ".boss-tv-live-bottom strong"
        );


    const bottomCopy =
        section.querySelector(
            ".boss-tv-live-bottom p"
        );


    const isLive =
        Boolean(
            settings.liveEnabled &&
            settings.liveVideoId
        );


    /* ===================================================== */
    /* LIVE */
    /* ===================================================== */

    if (isLive) {

        if (badge) {

            badge.innerHTML = `

                <span class="live-dot"></span>

                LIVE
            `;


            badge.style.background =
                "#d40000";


            badge.style.color =
                "#fff";
        }


        if (player) {

            player.style.display =
                "block";


            player.style.background =
                "#000";


            player.innerHTML = `

                <iframe
                    src="https://www.youtube.com/embed/${settings.liveVideoId}?rel=0"
                    title="B.O.S.S CODE TV LIVE"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>
            `;
        }


        if (bottomLabel) {

            bottomLabel.textContent =
                "LIVE BROADCAST";


            bottomLabel.style.color =
                "#d40000";
        }


        if (bottomTitle) {

            bottomTitle.textContent =
                "B.O.S.S CODE MEDIA LIVE STREAM";
        }


        if (bottomCopy) {

            bottomCopy.textContent =
                "Watch the current B.O.S.S CODE MEDIA broadcast live inside B.O.S.S CODE GO.";
        }


        return;
    }



    /* ===================================================== */
    /* OFF AIR */
    /* ===================================================== */

    if (badge) {

        badge.innerHTML = `

            <span
                style="
                    width:9px;
                    height:9px;
                    border-radius:50%;
                    background:#777;
                    display:block;
                "
            ></span>

            OFF AIR
        `;


        badge.style.background =
            "#181818";


        badge.style.color =
            "#888";
    }


    if (player) {

        player.innerHTML = `

            <div
                style="
                    width:100%;
                    height:100%;
                    min-height:280px;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    padding:30px;
                    background:
                        radial-gradient(
                            circle at center,
                            rgba(212,0,0,.12),
                            transparent 55%
                        ),
                        #050505;
                "
            >

                <div
                    style="
                        color:#d40000;
                        font-size:11px;
                        font-weight:900;
                        letter-spacing:3px;
                        margin-bottom:12px;
                    "
                >
                    B.O.S.S CODE TV
                </div>


                <div
                    style="
                        color:#fff;
                        font-size:clamp(28px,6vw,48px);
                        font-weight:900;
                        line-height:1;
                        margin-bottom:12px;
                    "
                >
                    OFF AIR
                </div>


                <div
                    style="
                        color:#777;
                        font-size:13px;
                        line-height:1.6;
                        max-width:420px;
                    "
                >
                    There is no live B.O.S.S CODE TV broadcast right now.
                    Check back for the next live conversation, interview or event.
                </div>

            </div>
        `;
    }


    if (bottomLabel) {

        bottomLabel.textContent =
            "CURRENT STATUS";


        bottomLabel.style.color =
            "#F5C518";
    }


    if (bottomTitle) {

        bottomTitle.textContent =
            "B.O.S.S CODE TV IS CURRENTLY OFF AIR";
    }


    if (bottomCopy) {

        bottomCopy.textContent =
            "Previously recorded interviews and conversations are available below.";
    }
}



/* ========================================================= */
/* DAILY DECISIONS */
/* ========================================================= */

const dailyDecisions = [

    {
        decision:
            "Finish one thing you have been avoiding before you start something new.",

        move:
            "Choose the unfinished task that has been following you around and complete the next real step today."
    },

    {
        decision:
            "Stop waiting for somebody else to believe in an idea you already know deserves a chance.",

        move:
            "Take one action toward the idea without asking anyone for permission."
    },

    {
        decision:
            "Protect the first hour of your day from unnecessary noise.",

        move:
            "Give your first focused hour to something that moves your life forward."
    },

    {
        decision:
            "Make one decision today based on purpose instead of appearance.",

        move:
            "Choose what makes sense for your future even if it does not impress anybody today."
    },

    {
        decision:
            "Do the important thing before the easy thing.",

        move:
            "Identify the task with the greatest impact and work on it first."
    },

    {
        decision:
            "Stop measuring your beginning against somebody else's middle.",

        move:
            "Return your attention to one measurable step on your own path."
    },

    {
        decision:
            "Say no to one thing that is stealing time from what matters.",

        move:
            "Remove one unnecessary commitment, distraction or obligation today."
    },

    {
        decision:
            "Give yourself permission to start before you feel completely ready.",

        move:
            "Begin the smallest usable version of the thing you keep postponing."
    },

    {
        decision:
            "Choose discipline over mood for one hour.",

        move:
            "Work on the goal for one uninterrupted hour whether you feel motivated or not."
    },

    {
        decision:
            "Stop explaining your vision to people who are committed to misunderstanding it.",

        move:
            "Use that energy to build evidence instead."
    },

    {
        decision:
            "Make a decision your future self will thank you for.",

        move:
            "Choose one action today that improves tomorrow instead of only comforting today."
    },

    {
        decision:
            "Finish what you said you would finish.",

        move:
            "Pick one promise you made to yourself and honor it before the day ends."
    },

    {
        decision:
            "Do not let one bad moment become a bad day.",

        move:
            "Reset your attention and make the next decision a useful one."
    },

    {
        decision:
            "Spend less time consuming somebody else's life and more time building your own.",

        move:
            "Trade thirty minutes of scrolling for thirty minutes of focused work."
    },

    {
        decision:
            "Choose progress that can be measured.",

        move:
            "Complete one task you can point to at the end of the day."
    },

    {
        decision:
            "Stop trying to look successful and do something that actually builds success.",

        move:
            "Put your time into the work, skill or relationship that produces real value."
    },

    {
        decision:
            "Make the phone call you have been avoiding.",

        move:
            "Handle the conversation with clarity, respect and confidence."
    },

    {
        decision:
            "Decide what you are no longer willing to tolerate from yourself.",

        move:
            "Name one habit that keeps costing you and interrupt it today."
    },

    {
        decision:
            "Give one good idea enough time to become something.",

        move:
            "Choose one idea and work on it instead of creating another new plan."
    },

    {
        decision:
            "Stop making fear sound like wisdom.",

        move:
            "Ask whether the concern is a real fact or simply discomfort about moving."
    },

    {
        decision:
            "Choose your own pace without losing your urgency.",

        move:
            "Move deliberately today without comparing your timeline to anybody else's."
    },

    {
        decision:
            "Do one thing that strengthens your confidence through evidence.",

        move:
            "Complete a task that reminds you that you can trust yourself to follow through."
    },

    {
        decision:
            "Ask for what you actually want instead of hoping people guess.",

        move:
            "Communicate one need, opportunity or boundary clearly today."
    },

    {
        decision:
            "Stop waiting for the perfect conditions.",

        move:
            "Use what you have and create the best next version possible."
    },

    {
        decision:
            "Protect your attention like it has value, because it does.",

        move:
            "Turn off one source of interruption during your most important work."
    },

    {
        decision:
            "Decide what deserves your best energy today.",

        move:
            "Give your strongest part of the day to the highest value task."
    },

    {
        decision:
            "Do not confuse being busy with moving forward.",

        move:
            "Remove one low value task and replace it with meaningful progress."
    },

    {
        decision:
            "Choose the conversation that creates clarity.",

        move:
            "Address one issue directly instead of continuing to think around it."
    },

    {
        decision:
            "Let the result teach you instead of embarrass you.",

        move:
            "Review one thing that did not work and identify the next adjustment."
    },

    {
        decision:
            "Stop asking whether everybody will understand.",

        move:
            "Ask whether the decision is aligned with your values, facts and purpose."
    },

    {
        decision:
            "Make one financial decision from discipline instead of impulse.",

        move:
            "Delay one unnecessary purchase and put that money toward something more important."
    },

    {
        decision:
            "Use your talent instead of only talking about it.",

        move:
            "Create, practice, publish or perform something today."
    },

    {
        decision:
            "Make room for the version of you that you keep saying you want to become.",

        move:
            "Remove one routine that belongs to the old version of your life."
    },

    {
        decision:
            "Stop negotiating with a task you already decided matters.",

        move:
            "Start it now for ten minutes and let momentum take over."
    },

    {
        decision:
            "Choose peace without choosing passivity.",

        move:
            "Release what you cannot control and act clearly on what you can."
    },

    {
        decision:
            "Do not let somebody else's urgency become your emergency.",

        move:
            "Pause before saying yes and decide whether the request deserves your time."
    },

    {
        decision:
            "Create before you consume.",

        move:
            "Make something of your own before opening entertainment or social media."
    },

    {
        decision:
            "Decide what you want this week to be remembered for.",

        move:
            "Choose one result and take the first step toward it today."
    },

    {
        decision:
            "Use the criticism, but do not wear it.",

        move:
            "Take any useful information from feedback and leave the rest behind."
    },

    {
        decision:
            "Stop waiting to feel confident before acting.",

        move:
            "Take the action that confidence is supposed to help you take."
    },

    {
        decision:
            "Choose one relationship to strengthen intentionally.",

        move:
            "Send the message, make the call or show appreciation without waiting for a reason."
    },

    {
        decision:
            "Do the task that keeps showing up in the back of your mind.",

        move:
            "Give it a clear next action and complete that action today."
    },

    {
        decision:
            "Stop trying to win every argument.",

        move:
            "Choose understanding, boundaries or silence when proving your point adds no value."
    },

    {
        decision:
            "Make one choice that protects your health.",

        move:
            "Choose movement, rest, hydration or a better meal on purpose today."
    },

    {
        decision:
            "Turn one excuse into a plan.",

        move:
            "Take the obstacle you keep naming and write one practical way around it."
    },

    {
        decision:
            "Decide what you need to stop giving access to your mind.",

        move:
            "Reduce one source of negativity, comparison or unnecessary stress today."
    },

    {
        decision:
            "Choose consistency over intensity.",

        move:
            "Do the smaller action you can repeat instead of waiting for a dramatic burst of motivation."
    },

    {
        decision:
            "Stop shrinking the goal because the path looks difficult.",

        move:
            "Keep the goal and identify a smaller next step."
    },

    {
        decision:
            "Use what you already know.",

        move:
            "Apply one lesson you keep agreeing with but have not put into practice."
    },

    {
        decision:
            "Make one decision with no audience in mind.",

        move:
            "Choose what is right for your life even if nobody sees or praises it."
    },

    {
        decision:
            "Protect the promise you made to yourself.",

        move:
            "Complete one action connected to a goal you said mattered."
    },

    {
        decision:
            "Stop carrying a decision that already has an answer.",

        move:
            "If the facts are clear, choose and move forward."
    },

    {
        decision:
            "Make your environment support your goal.",

        move:
            "Change one thing around you that makes the right action easier."
    },

    {
        decision:
            "Do not let perfection delay something useful.",

        move:
            "Release, send, post or finish the version that is ready enough to move."
    },

    {
        decision:
            "Choose courage in one small place.",

        move:
            "Do the thing you have been avoiding because of how somebody might react."
    },

    {
        decision:
            "Give your attention to what you can build, not what you cannot control.",

        move:
            "Put thirty focused minutes into something within your power."
    },

    {
        decision:
            "Stop letting yesterday vote on today's decisions.",

        move:
            "Make today's choice based on who you are becoming, not what went wrong before."
    },

    {
        decision:
            "Make one decision that creates more freedom later.",

        move:
            "Handle a task, payment, conversation or responsibility you have been postponing."
    },

    {
        decision:
            "Do not let comfort make the decision for you.",

        move:
            "Choose the option that grows you if it is responsible and aligned with your goals."
    },

    {
        decision:
            "Ask a better question.",

        move:
            "Replace 'What if I fail?' with 'What would I learn if I tried?' and act from there."
    },

    {
        decision:
            "Choose one priority and let something else wait.",

        move:
            "Finish the priority before giving your attention to lower value demands."
    },

    {
        decision:
            "Stop looking for proof that you cannot do it.",

        move:
            "Look for the next piece of evidence you can create that says you can."
    },

    {
        decision:
            "Make your next hour intentional.",

        move:
            "Decide exactly what the next sixty minutes are for before they disappear."
    },

    {
        decision:
            "Let your values make the decision before your emotions rewrite it.",

        move:
            "Name the value that matters most in the situation and choose accordingly."
    },

    {
        decision:
            "Stop chasing validation from people who are not building what you are building.",

        move:
            "Measure today's progress by your own standards and responsibilities."
    },

    {
        decision:
            "Give yourself a deadline.",

        move:
            "Choose one unfinished task and decide exactly when it will be completed."
    },

    {
        decision:
            "Do not confuse slow progress with no progress.",

        move:
            "Identify one thing that is better than it was thirty days ago and keep building it."
    },

    {
        decision:
            "Choose the action that makes tomorrow easier.",

        move:
            "Prepare, organize or finish one thing your future self would otherwise have to handle."
    },

    {
        decision:
            "Stop rehearsing the problem and work the solution.",

        move:
            "Write the next three possible actions and complete the first one."
    },

    {
        decision:
            "Create a boundary before resentment creates one for you.",

        move:
            "Communicate one limit clearly and respectfully today."
    },

    {
        decision:
            "Do one thing with excellence even if nobody notices.",

        move:
            "Choose a task and give it your full standard instead of doing it halfway."
    },

    {
        decision:
            "Stop treating your dream like an optional hobby if you expect serious results.",

        move:
            "Schedule real time for it today and protect that time."
    },

    {
        decision:
            "Make the difficult decision smaller.",

        move:
            "Ask only what the next right step is and take that step."
    },

    {
        decision:
            "Choose gratitude without losing ambition.",

        move:
            "Acknowledge something good in your life, then continue building what is next."
    },

    {
        decision:
            "Stop using preparation to hide from execution.",

        move:
            "Move one idea from planning into real world action today."
    },

    {
        decision:
            "Give yourself evidence that you can change.",

        move:
            "Break one familiar pattern on purpose before the day ends."
    },

    {
        decision:
            "Choose one thing to learn deeply instead of ten things to skim.",

        move:
            "Spend focused time improving one skill connected to your goals."
    },

    {
        decision:
            "Stop allowing one person's opinion to become a crowd in your head.",

        move:
            "Separate their opinion from the facts and make your own decision."
    },

    {
        decision:
            "Make one clean decision about your money.",

        move:
            "Save, pay down, plan or avoid one expense with intention today."
    },

    {
        decision:
            "Finish the uncomfortable five minutes.",

        move:
            "Start the task you have been avoiding and stay with it for at least five minutes."
    },

    {
        decision:
            "Do not abandon a good plan because today feels hard.",

        move:
            "Adjust the pace if necessary, but keep the commitment."
    },

    {
        decision:
            "Choose what you want more than what you want right now.",

        move:
            "Trade one short term comfort for progress toward a larger goal."
    },

    {
        decision:
            "Stop asking for motivation when the next step is already clear.",

        move:
            "Do the next step before looking for another video, quote or conversation."
    },

    {
        decision:
            "Make one decision that protects your reputation with yourself.",

        move:
            "Follow through on something you said you would do."
    },

    {
        decision:
            "Let silence be useful.",

        move:
            "Take ten quiet minutes to think before making one important decision today."
    },

    {
        decision:
            "Stop rewarding distraction.",

        move:
            "Put your phone out of reach while you complete one important task."
    },

    {
        decision:
            "Choose the standard before the situation tests you.",

        move:
            "Decide in advance what you will and will not compromise today."
    },

    {
        decision:
            "Do not make a permanent decision from temporary frustration.",

        move:
            "Give yourself space, gather the facts and choose from clarity."
    },

    {
        decision:
            "Make one move that expands your opportunity.",

        move:
            "Apply, ask, pitch, introduce yourself or send the message today."
    },

    {
        decision:
            "Stop waiting for somebody to rescue a responsibility that belongs to you.",

        move:
            "Own one situation completely and take the next step yourself."
    },

    {
        decision:
            "Choose one thing to simplify.",

        move:
            "Remove an unnecessary step, expense, commitment or distraction from your day."
    },

    {
        decision:
            "Make your confidence practical.",

        move:
            "Use it to speak, create, ask, apply or take action."
    },

    {
        decision:
            "Do not let a setback rename you.",

        move:
            "Describe what happened as an event, not as your identity, then decide what comes next."
    },

    {
        decision:
            "Choose a better response instead of trying to control somebody else's behavior.",

        move:
            "Control your words, boundary and next action."
    },

    {
        decision:
            "Stop treating rest like failure.",

        move:
            "Take intentional recovery if it helps you return sharper."
    },

    {
        decision:
            "Make one decision that honors your purpose more than your popularity.",

        move:
            "Choose the action you would still respect even if nobody applauded it."
    },

    {
        decision:
            "Do not let uncertainty become inactivity.",

        move:
            "Take the step that remains sensible even without knowing the whole path."
    },

    {
        decision:
            "Choose one small win before noon.",

        move:
            "Complete something meaningful early enough to create momentum for the rest of the day."
    },

    {
        decision:
            "Stop carrying everything mentally.",

        move:
            "Write down the tasks, choose the top three and begin with number one."
    },

    {
        decision:
            "Make one move your younger self would be proud to see.",

        move:
            "Use the opportunity, knowledge or courage you once wished you had."
    },

    {
        decision:
            "Choose responsibility over excuses.",

        move:
            "Name what is within your control and take action on that part today."
    },

    {
        decision:
            "Do not wait until the goal feels easy.",

        move:
            "Build the capacity to handle what the goal requires."
    },

    {
        decision:
            "Make today's decision something you can prove with action.",

        move:
            "Before the day ends, create visible evidence that you followed through."
    }

];



/* ========================================================= */
/* DAILY DECISION 24 HOUR SYSTEM */
/* ========================================================= */

const DAILY_DECISION_DURATION =
    24 * 60 * 60 * 1000;


const DAILY_DECISION_STORAGE_KEY =
    "boss-code-daily-decision-v1";


const dailyDecisionModal =
    $("daily-decision-modal");


const dailyDecisionNumber =
    $("daily-decision-number");


const dailyDecisionTitle =
    $("daily-decision-title");


const dailyDecisionMove =
    $("daily-decision-move-text");


const dailyDecisionMade =
    $("daily-decision-made");


const dailyDecisionConfirmation =
    $("daily-decision-confirmation");


const dailyDecisionHomePreview =
    $("daily-decision-home-preview");



function saveDailyDecisionState(
    state
) {

    try {

        localStorage.setItem(

            DAILY_DECISION_STORAGE_KEY,

            JSON.stringify(
                state
            )
        );

    } catch (error) {}
}



function createDailyDecisionState() {

    const now =
        Date.now();


    const startingIndex =
        Math.floor(
            now /
            DAILY_DECISION_DURATION
        ) %
        dailyDecisions.length;


    return {

        index:
            startingIndex,

        startedAt:
            now,

        acknowledged:
            false

    };
}



function getDailyDecisionState() {

    let state =
        null;


    try {

        const stored =
            localStorage.getItem(
                DAILY_DECISION_STORAGE_KEY
            );


        if (stored) {

            state =
                JSON.parse(
                    stored
                );
        }

    } catch (error) {

        state =
            null;
    }


    if (
        !state ||
        typeof state.index !==
        "number" ||
        typeof state.startedAt !==
        "number"
    ) {

        state =
            createDailyDecisionState();


        saveDailyDecisionState(
            state
        );


        return state;
    }


    const now =
        Date.now();


    const elapsed =
        now -
        state.startedAt;


    if (
        elapsed >=
        DAILY_DECISION_DURATION
    ) {

        const completedCycles =
            Math.floor(
                elapsed /
                DAILY_DECISION_DURATION
            );


        state.index =
            (
                state.index +
                completedCycles
            ) %
            dailyDecisions.length;


        state.startedAt =
            state.startedAt +
            (
                completedCycles *
                DAILY_DECISION_DURATION
            );


        state.acknowledged =
            false;


        saveDailyDecisionState(
            state
        );
    }


    return state;
}



function renderDailyDecision() {

    const state =
        getDailyDecisionState();


    const item =
        dailyDecisions[
            state.index
        ];


    if (!item) {
        return;
    }


    if (dailyDecisionNumber) {

        dailyDecisionNumber.textContent =
            "DECISION " +
            String(
                state.index +
                1
            )
            .padStart(
                3,
                "0"
            );
    }


    if (dailyDecisionTitle) {

        dailyDecisionTitle.textContent =
            item.decision;
    }


    if (dailyDecisionMove) {

        dailyDecisionMove.textContent =
            item.move;
    }


    if (dailyDecisionHomePreview) {

        dailyDecisionHomePreview.textContent =
            item.decision;
    }


    if (dailyDecisionConfirmation) {

        dailyDecisionConfirmation.textContent =
            state.acknowledged
                ?
                "DECISION MADE. NOW MOVE."
                :
                "";
    }


    if (dailyDecisionMade) {

        dailyDecisionMade
            .classList
            .toggle(

                "completed",

                Boolean(
                    state.acknowledged
                )
            );
    }
}



function openDailyDecision() {

    if (!dailyDecisionModal) {
        return;
    }


    renderDailyDecision();


    dailyDecisionModal
        .classList
        .add(
            "open"
        );


    dailyDecisionModal.setAttribute(

        "aria-hidden",

        "false"

    );


    document.body.style.overflow =
        "hidden";
}



function closeDailyDecision(
    markSeen = true
) {

    if (markSeen) {

        const state =
            getDailyDecisionState();


        state.acknowledged =
            true;


        saveDailyDecisionState(
            state
        );
    }


    if (dailyDecisionModal) {

        dailyDecisionModal
            .classList
            .remove(
                "open"
            );


        dailyDecisionModal.setAttribute(

            "aria-hidden",

            "true"

        );
    }


    document.body.style.overflow =
        "";
}



function maybeShowDailyDecision() {

    const state =
        getDailyDecisionState();


    renderDailyDecision();


    if (
        !state.acknowledged
    ) {

        setTimeout(

            openDailyDecision,

            300

        );
    }
}



addClick(

    "daily-decision-close",

    function () {

        closeDailyDecision(
            true
        );
    }

);



addClick(

    "daily-decision-reopen",

    function () {

        openDailyDecision();
    }

);



addClick(

    "daily-decision-made",

    function () {

        const state =
            getDailyDecisionState();


        state.acknowledged =
            true;


        saveDailyDecisionState(
            state
        );


        renderDailyDecision();


        if (
            dailyDecisionConfirmation
        ) {

            dailyDecisionConfirmation.textContent =
                "DECISION MADE. NOW MOVE.";
        }


        setTimeout(

            function () {

                closeDailyDecision(
                    false
                );

            },

            850

        );
    }

);



if (dailyDecisionModal) {

    dailyDecisionModal.addEventListener(

        "click",

        function (event) {

            if (
                event.target ===
                dailyDecisionModal
            ) {

                closeDailyDecision(
                    true
                );
            }
        }

    );
}



/* ========================================================= */
/* SPLASH */
/* ========================================================= */

const splashScreen =
    $("splash-screen");


window.addEventListener(

    "load",

    function () {

        renderDailyDecision();

        updateBossCodeTvLive();


        if (!splashScreen) {

            maybeShowDailyDecision();

            return;
        }


        setTimeout(

            function () {

                splashScreen
                    .classList
                    .add(
                        "fade-out"
                    );


                setTimeout(

                    function () {

                        splashScreen.style.display =
                            "none";


                        maybeShowDailyDecision();

                    },

                    700

                );

            },

            2000

        );
    }

);



/* ========================================================= */
/* SCREENS */
/* ========================================================= */

const homeScreen =
    $("home-screen");


const bossBiteScreen =
    $("boss-bite-screen");


const bossCodeTvScreen =
    $("boss-code-tv-screen");


const decisionMakersScreen =
    $("decision-makers-screen");


const bossCheckinScreen =
    $("boss-checkin-screen");


const musicScreen =
    $("music-screen");



/* ========================================================= */
/* NAVIGATION */
/* ========================================================= */

addClick(

    "boss-bite-button",

    function () {

        showScreen(
            bossBiteScreen
        );


        initializeBossBiteMap();
    }

);



addClick(

    "boss-bite-back",

    function () {

        showScreen(
            homeScreen
        );
    }

);



addClick(

    "boss-code-tv-button",

    function () {

        updateBossCodeTvLive();


        showScreen(
            bossCodeTvScreen
        );
    }

);



addClick(

    "boss-code-tv-back",

    function () {

        stopBossCodeTvVideos();


        showScreen(
            homeScreen
        );
    }

);



addClick(

    "decision-makers-button",

    function () {

        showScreen(
            decisionMakersScreen
        );
    }

);



addClick(

    "decision-makers-back",

    function () {

        stopDecisionMakerVideos();


        showScreen(
            homeScreen
        );
    }

);



addClick(

    "boss-checkin-button",

    function () {

        showScreen(
            bossCheckinScreen
        );


        showCheckinIntro();
    }

);



addClick(

    "boss-checkin-back",

    function () {

        showScreen(
            homeScreen
        );
    }

);



addClick(

    "music-button",

    function () {

        showScreen(
            musicScreen
        );


        buildArtistPicker();
    }

);



addClick(

    "music-back",

    function () {

        if (
            bossMusicAudio &&
            !bossMusicAudio.paused
        ) {

            bossMusicAudio.pause();
        }


        if (musicPlayPause) {

            musicPlayPause.textContent =
                "▶";
        }


        showScreen(
            homeScreen
        );
    }

);



/* ========================================================= */
/* YOUTUBE */
/* ========================================================= */

function getYouTubeId(
    url
) {

    if (!url) {
        return null;
    }


    const patterns = [

        /youtube\.com\/watch\?v=([^&]+)/,

        /youtu\.be\/([^?&]+)/,

        /youtube\.com\/shorts\/([^?&]+)/,

        /youtube\.com\/embed\/([^?&]+)/,

        /youtube\.com\/live\/([^?&/]+)/

    ];


    for (
        const pattern
        of patterns
    ) {

        const match =
            url.match(
                pattern
            );


        if (
            match &&
            match[1]
        ) {

            return match[1];
        }
    }


    return null;
}



/* ========================================================= */
/* MUSIC DATABASE */
/* ========================================================= */

const bossArtists = [

    {

        id:
            "dez-tha-reason",

        name:
            "Dez Tha Reason",

        initials:
            "DTR",

        image:
            "Music/dez-tha-reason/artwork/Dez photo.jpg",

        tagline:
            "Music. Purpose. Perspective.",


        featuredRelease: {

            title:
                "RISE OF THE DECISION MAKER",

            type:
                "FEATURED PROJECT",

            artwork:
                "Music/dez-tha-reason/artwork/Rise Cover.jpg",

            description:
                "Listen to Dez Tha Reason directly inside B.O.S.S CODE Music."

        },


        tracks: [

            {

                title:
                    "Winners Delight",

                album:
                    "RISE OF THE DECISION MAKER",

                audioSources: [

                    "Music/dez-tha-reason/music/1.Winners Delight.wav",

                    "Music/dez-tha-reason/music/1.Winners Delight.WAV"

                ],

                artwork:
                    "Music/dez-tha-reason/artwork/Rise Cover.jpg",

                status:
                    "PLAY"

            },


            {

                title:
                    "Greatness Is A Decision",

                album:
                    "RISE OF THE DECISION MAKER",

                audioSources: [

                    "Music/dez-tha-reason/music/2.GREATNESS.wav",

                    "Music/dez-tha-reason/music/2.GREATNESS.WAV"

                ],

                artwork:
                    "Music/dez-tha-reason/artwork/Rise Cover.jpg",

                status:
                    "PLAY"

            },


            {

                title:
                    "Heavy Is The Head",

                album:
                    "RISE OF THE DECISION MAKER",

                audioSources: [

                    "Music/dez-tha-reason/music/3.Heavy.wav",

                    "Music/dez-tha-reason/music/3.Heavy.WAV"

                ],

                artwork:
                    "Music/dez-tha-reason/artwork/Rise Cover.jpg",

                status:
                    "PLAY"

            }

        ],


        releases: [

            {

                title:
                    "RISE OF THE DECISION MAKER",

                type:
                    "PROJECT",

                artwork:
                    "Music/dez-tha-reason/artwork/Rise Cover.jpg",

                status:
                    "Listen now"

            }

        ]

    },


    {

        id:
            "fundamentals",

        name:
            "Fundamentals",

        initials:
            "FUN",

        image:
            "Music/fundamentals/artwork/fundamentals-photo.jpg",

        tagline:
            "Independent music from B.O.S.S CODE Music.",


        featuredRelease: {

            title:
                "RISE OF THE DECISION MAKER",

            type:
                "FEATURED RELEASE",

            artwork:
                "Music/fundamentals/artwork/Fun-album-cover.png",

            description:
                "Listen to Fundamentals directly inside B.O.S.S CODE Music."

        },


        tracks: [

            {

                title:
                    "Is There Something Wrong With Me",

                album:
                    "RISE OF THE DECISION MAKER",

                audioSources: [

                    "Music/fundamentals/music/Is There Something.mp3",

                    "Music/fundamentals/music/Is There Something.MP3"

                ],

                artwork:
                    "Music/fundamentals/artwork/Fun-album-cover.png",

                status:
                    "PLAY"

            }

        ],


        releases: [

            {

                title:
                    "RISE OF THE DECISION MAKER",

                type:
                    "PROJECT",

                artwork:
                    "Music/fundamentals/artwork/Fun-album-cover.png",

                status:
                    "Listen now"

            }

        ]

    }

];



/* ========================================================= */
/* MUSIC PLAYER */
/* ========================================================= */

const bossMusicAudio =
    $("boss-music-audio");


const musicTrackList =
    $("music-track-list");


const musicPlayPause =
    $("music-play-pause");


const musicPrevious =
    $("music-previous");


const musicNext =
    $("music-next");


const musicProgress =
    $("music-progress");


const musicCurrentTime =
    $("music-current-time");


const musicDuration =
    $("music-duration");


const nowPlayingTitle =
    $("now-playing-title");


const nowPlayingArtist =
    $("now-playing-artist");


const nowPlayingArt =
    $("now-playing-art");


const musicPlayerMessage =
    $("music-player-message");


let activeArtist =
    bossArtists[0];


let activeTracks =
    activeArtist.tracks;


let currentMusicTrack =
    null;


let currentMusicTrackIndex =
    0;


let currentAudioSourceIndex =
    0;



function buildArtistPicker() {

    const header =
        document.querySelector(
            "#music-screen .music-header"
        );


    if (!header) {
        return;
    }


    let picker =
        $("artist-picker-section");


    if (!picker) {

        picker =
            document.createElement(
                "section"
            );


        picker.id =
            "artist-picker-section";


        picker.className =
            "artist-picker-section";


        picker.innerHTML = `

            <div class="artist-picker-heading">

                <span>
                    B.O.S.S CODE MUSIC
                </span>

                <h2>
                    CHOOSE YOUR ARTIST
                </h2>

                <p>
                    Pick an artist to explore their music.
                </p>

            </div>

            <div
                id="artist-grid"
                class="artist-grid"
            ></div>
        `;


        header.insertAdjacentElement(

            "afterend",

            picker

        );


        const banner =
            document.createElement(
                "section"
            );


        banner.id =
            "selected-artist-banner";


        banner.className =
            "selected-artist-banner";


        picker.insertAdjacentElement(

            "afterend",

            banner

        );
    }


    renderArtistCards();


    loadArtist(

        activeArtist.id,

        false

    );
}



function renderArtistCards() {

    const grid =
        $("artist-grid");


    if (!grid) {
        return;
    }


    grid.innerHTML =
        "";


    bossArtists.forEach(

        function (artist) {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "artist-card";


            if (
                artist.id ===
                activeArtist.id
            ) {

                card.classList.add(
                    "active"
                );
            }


            card.innerHTML = `

                <div class="artist-card-image">

                    <img
                        src="${artist.image}"
                        alt="${artist.name}"
                    >

                </div>

                <div class="artist-card-body">

                    <span>
                        ARTIST
                    </span>

                    <strong>
                        ${artist.name}
                    </strong>

                </div>
            `;


            card.addEventListener(

                "click",

                function () {

                    loadArtist(

                        artist.id,

                        true

                    );
                }

            );


            grid.appendChild(
                card
            );
        }

    );
}



function loadArtist(
    id,
    scroll
) {

    const artist =
        bossArtists.find(

            item =>
                item.id ===
                id

        );


    if (!artist) {
        return;
    }


    if (bossMusicAudio) {

        bossMusicAudio.pause();


        bossMusicAudio.removeAttribute(
            "src"
        );


        bossMusicAudio.load();
    }


    activeArtist =
        artist;


    activeTracks =
        artist.tracks;


    currentMusicTrack =
        null;


    currentMusicTrackIndex =
        0;


    currentAudioSourceIndex =
        0;


    if (musicPlayPause) {

        musicPlayPause.textContent =
            "▶";
    }


    renderArtistCards();


    updateSelectedArtistBanner();


    updateMusicHeader();


    updateFeaturedRelease();


    buildMusicLibrary();


    buildArtistReleases();


    resetMusicPlayer();


    if (scroll) {

        const banner =
            $("selected-artist-banner");


        if (banner) {

            banner.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });
        }
    }
}



function updateSelectedArtistBanner() {

    const banner =
        $("selected-artist-banner");


    if (!banner) {
        return;
    }


    banner.innerHTML = `

        <div class="selected-artist-photo">

            <img
                src="${activeArtist.image}"
                alt="${activeArtist.name}"
            >

        </div>

        <div class="selected-artist-info">

            <span>
                NOW VIEWING
            </span>

            <h2>
                ${activeArtist.name}
            </h2>

            <p>
                ${activeArtist.tagline}
            </p>

        </div>
    `;


    banner.classList.add(
        "show"
    );
}



function updateMusicHeader() {

    const title =
        document.querySelector(
            "#music-screen .music-header h1"
        );


    const description =
        document.querySelector(
            "#music-screen .music-header p"
        );


    const image =
        document.querySelector(
            "#music-screen .music-artist-logo"
        );


    if (title) {

        title.textContent =
            "B.O.S.S CODE MUSIC";
    }


    if (description) {

        description.textContent =
            "Independent music. Direct from the artists.";
    }


    if (image) {

        image.src =
            activeArtist.image;


        image.alt =
            activeArtist.name;
    }
}



function updateFeaturedRelease() {

    const release =
        activeArtist.featuredRelease;


    const title =
        document.querySelector(
            ".featured-release-info h2"
        );


    const artist =
        document.querySelector(
            ".featured-artist"
        );


    const label =
        document.querySelector(
            ".featured-label"
        );


    const description =
        document.querySelector(
            ".featured-description"
        );


    const cover =
        document.querySelector(
            ".placeholder-cover"
        );


    if (title) {

        title.textContent =
            release.title;
    }


    if (artist) {

        artist.textContent =
            activeArtist.name.toUpperCase();
    }


    if (label) {

        label.textContent =
            release.type;
    }


    if (description) {

        description.textContent =
            release.description;
    }


    if (cover) {

        cover.innerHTML = `

            <img
                src="${release.artwork}"
                alt="${release.title}"
            >
        `;
    }
}



function buildMusicLibrary() {

    if (!musicTrackList) {
        return;
    }


    musicTrackList.innerHTML =
        "";


    activeTracks.forEach(

        function (
            track,
            index
        ) {

            const row =
                document.createElement(
                    "article"
                );


            row.className =
                "music-track";


            row.dataset.track =
                index;


            row.innerHTML = `

                <div class="track-number">

                    ${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}

                </div>

                <div class="track-info">

                    <strong>
                        ${track.title}
                    </strong>

                    <span>
                        ${activeArtist.name} • ${track.album}
                    </span>

                </div>

                <div class="track-status">
                    ${track.status}
                </div>

                <div class="track-play-icon">
                    ▶
                </div>
            `;


            row.addEventListener(

                "click",

                function () {

                    selectMusicTrack(

                        index,

                        true

                    );
                }

            );


            musicTrackList.appendChild(
                row
            );
        }

    );
}



function selectMusicTrack(
    index,
    play
) {

    if (
        index < 0 ||
        index >=
        activeTracks.length
    ) {

        return;
    }


    currentMusicTrackIndex =
        index;


    currentMusicTrack =
        activeTracks[
            index
        ];


    currentAudioSourceIndex =
        0;


    document
        .querySelectorAll(
            ".music-track"
        )
        .forEach(

            row => {

                row.classList.remove(
                    "active"
                );
            }

        );


    const selected =
        document.querySelector(
            `.music-track[data-track="${index}"]`
        );


    if (selected) {

        selected.classList.add(
            "active"
        );
    }


    if (nowPlayingTitle) {

        nowPlayingTitle.textContent =
            currentMusicTrack.title;
    }


    if (nowPlayingArtist) {

        nowPlayingArtist.textContent =
            activeArtist.name;
    }


    if (nowPlayingArt) {

        nowPlayingArt.innerHTML = `

            <img
                src="${currentMusicTrack.artwork}"
                alt="${currentMusicTrack.title}"
            >
        `;
    }


    loadCurrentAudioSource(
        play
    );
}



function loadCurrentAudioSource(
    play
) {

    if (
        !bossMusicAudio ||
        !currentMusicTrack
    ) {

        return;
    }


    const sources =
        currentMusicTrack.audioSources ||
        [];


    if (
        currentAudioSourceIndex >=
        sources.length
    ) {

        if (musicPlayerMessage) {

            musicPlayerMessage.textContent =
                "AUDIO FILE NOT FOUND • CHECK FILE NAME";
        }


        return;
    }


    bossMusicAudio.pause();


    bossMusicAudio.src =
        sources[
            currentAudioSourceIndex
        ];


    bossMusicAudio.load();


    if (musicProgress) {

        musicProgress.value =
            0;
    }


    if (musicCurrentTime) {

        musicCurrentTime.textContent =
            "0:00";
    }


    if (musicDuration) {

        musicDuration.textContent =
            "0:00";
    }


    if (musicPlayerMessage) {

        musicPlayerMessage.textContent =
            `LOADING • ${currentMusicTrack.title}`;
    }


    if (play) {

        playCurrentMusicTrack();
    }
}



function playCurrentMusicTrack() {

    if (
        !bossMusicAudio ||
        !currentMusicTrack
    ) {

        return;
    }


    bossMusicAudio
        .play()
        .then(

            function () {

                if (musicPlayPause) {

                    musicPlayPause.textContent =
                        "Ⅱ";
                }


                if (musicPlayerMessage) {

                    musicPlayerMessage.textContent =
                        `PLAYING • ${currentMusicTrack.title}`;
                }
            }

        )
        .catch(
            function () {}
        );
}



if (bossMusicAudio) {

    bossMusicAudio.addEventListener(

        "error",

        function () {

            if (!currentMusicTrack) {
                return;
            }


            currentAudioSourceIndex++;


            const sources =
                currentMusicTrack.audioSources ||
                [];


            if (
                currentAudioSourceIndex <
                sources.length
            ) {

                loadCurrentAudioSource(
                    true
                );


            } else {

                if (musicPlayerMessage) {

                    musicPlayerMessage.textContent =
                        "AUDIO FILE NOT FOUND • CHECK EXACT FILE NAME";
                }
            }
        }

    );
}



function resetMusicPlayer() {

    if (nowPlayingTitle) {

        nowPlayingTitle.textContent =
            "SELECT A TRACK";
    }


    if (nowPlayingArtist) {

        nowPlayingArtist.textContent =
            activeArtist.name;
    }


    if (nowPlayingArt) {

        nowPlayingArt.innerHTML = `

            <img
                src="${activeArtist.featuredRelease.artwork}"
                alt="${activeArtist.name}"
            >
        `;
    }


    if (musicProgress) {

        musicProgress.value =
            0;
    }


    if (musicCurrentTime) {

        musicCurrentTime.textContent =
            "0:00";
    }


    if (musicDuration) {

        musicDuration.textContent =
            "0:00";
    }


    if (musicPlayerMessage) {

        musicPlayerMessage.textContent =
            `Choose a ${activeArtist.name} track.`;
    }
}



if (musicPlayPause) {

    musicPlayPause.addEventListener(

        "click",

        function () {

            if (!currentMusicTrack) {

                selectMusicTrack(

                    0,

                    true

                );


                return;
            }


            if (
                bossMusicAudio.paused
            ) {

                playCurrentMusicTrack();


            } else {

                bossMusicAudio.pause();


                musicPlayPause.textContent =
                    "▶";
            }
        }

    );
}



if (musicPrevious) {

    musicPrevious.addEventListener(

        "click",

        function () {

            if (!activeTracks.length) {
                return;
            }


            const previous =
                (
                    currentMusicTrackIndex -
                    1 +
                    activeTracks.length
                ) %
                activeTracks.length;


            selectMusicTrack(

                previous,

                true

            );
        }

    );
}



if (musicNext) {

    musicNext.addEventListener(

        "click",

        function () {

            if (!activeTracks.length) {
                return;
            }


            const next =
                (
                    currentMusicTrackIndex +
                    1
                ) %
                activeTracks.length;


            selectMusicTrack(

                next,

                true

            );
        }

    );
}



addClick(

    "play-featured-release",

    function () {

        if (
            activeTracks.length
        ) {

            selectMusicTrack(

                0,

                true

            );
        }
    }

);



if (bossMusicAudio) {

    bossMusicAudio.addEventListener(

        "loadedmetadata",

        function () {

            if (musicDuration) {

                musicDuration.textContent =
                    formatMusicTime(
                        bossMusicAudio.duration
                    );
            }
        }

    );


    bossMusicAudio.addEventListener(

        "timeupdate",

        function () {

            if (
                !bossMusicAudio.duration
            ) {

                return;
            }


            if (musicProgress) {

                musicProgress.value =
                    (
                        bossMusicAudio.currentTime /
                        bossMusicAudio.duration
                    ) *
                    100;
            }


            if (musicCurrentTime) {

                musicCurrentTime.textContent =
                    formatMusicTime(
                        bossMusicAudio.currentTime
                    );
            }


            if (musicDuration) {

                musicDuration.textContent =
                    formatMusicTime(
                        bossMusicAudio.duration
                    );
            }
        }

    );


    bossMusicAudio.addEventListener(

        "ended",

        function () {

            if (
                activeTracks.length
            ) {

                selectMusicTrack(

                    (
                        currentMusicTrackIndex +
                        1
                    ) %
                    activeTracks.length,

                    true

                );
            }
        }

    );
}



if (musicProgress) {

    musicProgress.addEventListener(

        "input",

        function () {

            if (
                bossMusicAudio &&
                bossMusicAudio.duration
            ) {

                bossMusicAudio.currentTime =
                    (
                        Number(
                            musicProgress.value
                        ) /
                        100
                    ) *
                    bossMusicAudio.duration;
            }
        }

    );
}



function formatMusicTime(
    seconds
) {

    if (
        !seconds ||
        Number.isNaN(
            seconds
        )
    ) {

        return "0:00";
    }


    const minutes =
        Math.floor(
            seconds /
            60
        );


    const remaining =
        Math.floor(
            seconds %
            60
        );


    return (

        minutes +
        ":" +
        String(
            remaining
        ).padStart(
            2,
            "0"
        )

    );
}



function buildArtistReleases() {

    const grid =
        document.querySelector(
            ".release-grid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML =
        "";


    activeArtist.releases.forEach(

        function (release) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "release-card";


            card.innerHTML = `

                <div class="release-placeholder">

                    <img
                        src="${release.artwork}"
                        alt="${release.title}"
                    >

                </div>

                <div class="release-info">

                    <span>
                        ${release.type}
                    </span>

                    <h3>
                        ${release.title}
                    </h3>

                    <p>
                        ${release.status}
                    </p>

                </div>
            `;


            grid.appendChild(
                card
            );
        }

    );
}



/* ========================================================= */
/* DECISION MAKERS */
/* ========================================================= */

const decisionMakerOnTheGoVideos = [

    {

        title:
            "Be Intentional",

        file:
            "Videos/Decision Makers/Be Intentional.mp4",

        description:
            "Move through your day with intention instead of letting everything around you decide your direction."

    },

    {

        title:
            "Celebrity",

        file:
            "Videos/Decision Makers/Celebrity.mp4",

        description:
            "A quick perspective on attention, influence and how we choose who gets access to our thinking."

    },

    {

        title:
            "Congrats To You",

        file:
            "Videos/Decision Makers/Congrats to you.mp4",

        description:
            "Sometimes you need to recognize the progress you have already made before rushing toward the next thing."

    },

    {

        title:
            "Don't Be Afraid",

        file:
            "Videos/Decision Makers/Dont Be Affraid.mp4",

        description:
            "Fear can speak loudly, but it does not have to make the decision."

    },

    {

        title:
            "Don't Be Surprised",

        file:
            "Videos/Decision Makers/Dont Be Surprised.mp4",

        description:
            "When you have put in the work, stop acting surprised when the opportunity finally arrives."

    },

    {

        title:
            "One Life To Live",

        file:
            "Videos/Decision Makers/One Life To Live.mp4",

        description:
            "You only get one life. Make decisions that reflect what really matters to you."

    },

    {

        title:
            "Peace",

        file:
            "Videos/Decision Makers/Peace.mp4",

        description:
            "Protecting your peace sometimes requires making a decision about what no longer deserves your energy."

    },

    {

        title:
            "You're The Teacher",

        file:
            "Videos/Decision Makers/You're The Teacher.mp4",

        description:
            "Your choices are teaching people how to treat you and teaching you what you are willing to accept."

    }

];



function buildDecisionMakerOnTheGo() {

    const row =
        document.querySelector(
            "#decision-makers-screen .on-the-go-row"
        );


    if (!row) {
        return;
    }


    row.innerHTML =
        "";


    decisionMakerOnTheGoVideos.forEach(

        function (item) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "on-the-go-card";


            card.innerHTML = `

                <div
                    class="decision-placeholder-video"
                    style="
                        aspect-ratio:9/16;
                        background:#000;
                        overflow:hidden;
                    "
                >

                    <video
                        class="decision-maker-local-video"
                        preload="metadata"
                        controls
                        playsinline
                        style="
                            width:100%;
                            height:100%;
                            display:block;
                            object-fit:contain;
                            background:#000;
                        "
                    >

                        <source
                            src="${item.file}"
                            type="video/mp4"
                        >

                        Your browser does not support video playback.

                    </video>

                    <span
                        class="coming-label"
                        style="pointer-events:none;"
                    >
                        ON THE GO
                    </span>

                </div>

                <div class="decision-card-body">

                    <span class="decision-card-type">
                        QUICK DECISION
                    </span>

                    <h3>
                        ${item.title}
                    </h3>

                    <p>
                        ${item.description}
                    </p>

                </div>
            `;


            row.appendChild(
                card
            );
        }

    );


    setupDecisionMakerVideoBehavior();
}



function setupDecisionMakerVideoBehavior() {

    const videos =
        document.querySelectorAll(
            ".decision-maker-local-video"
        );


    videos.forEach(

        function (video) {

            video.addEventListener(

                "play",

                function () {

                    videos.forEach(

                        function (otherVideo) {

                            if (
                                otherVideo !==
                                video
                            ) {

                                otherVideo.pause();
                            }
                        }

                    );


                    if (
                        bossMusicAudio &&
                        !bossMusicAudio.paused
                    ) {

                        bossMusicAudio.pause();


                        if (musicPlayPause) {

                            musicPlayPause.textContent =
                                "▶";
                        }
                    }
                }

            );
        }

    );
}



function stopDecisionMakerVideos() {

    document
        .querySelectorAll(
            ".decision-maker-local-video"
        )
        .forEach(

            function (video) {

                video.pause();
            }

        );
}



/* ========================================================= */
/* DECISION MAKERS CHALLENGES */
/* ========================================================= */

const challenges = {

    decision: {

        title:
            "YOU MADE THE DECISION.",

        copy:
            "Write down the thing you have been putting off. Decide today that waiting is over."

    },


    step: {

        title:
            "NOW MOVE.",

        copy:
            "Complete one real action toward your goal before today ends."

    },


    perfect: {

        title:
            "PROGRESS OVER PERFECT.",

        copy:
            "Start before everything is polished. Improve while moving."

    }

};



document
    .querySelectorAll(
        ".action-button"
    )
    .forEach(

        function (button) {

            button.addEventListener(

                "click",

                function () {

                    const challenge =
                        challenges[
                            this.dataset.action
                        ];


                    if (!challenge) {
                        return;
                    }


                    document
                        .querySelectorAll(
                            ".action-button"
                        )
                        .forEach(

                            item => {

                                item.classList.remove(
                                    "accepted"
                                );


                                item.textContent =
                                    "ACCEPT CHALLENGE";
                            }

                        );


                    this.classList.add(
                        "accepted"
                    );


                    this.textContent =
                        "CHALLENGE ACCEPTED ✓";


                    if ($("challenge-title")) {

                        $("challenge-title").textContent =
                            challenge.title;
                    }


                    if ($("challenge-copy")) {

                        $("challenge-copy").textContent =
                            challenge.copy;
                    }


                    if (
                        $("decision-challenge-message")
                    ) {

                        $("decision-challenge-message")
                            .classList
                            .add(
                                "show"
                            );
                    }
                }

            );
        }

    );



/* ========================================================= */
/* B.O.S.S CHECK IN */
/* ========================================================= */

const checkinIntro =
    $("checkin-intro");


const checkinQuestionsScreen =
    $("checkin-questions");


const checkinResults =
    $("checkin-results");


const questionCount =
    $("question-count");


const progressPercent =
    $("progress-percent");


const checkinProgressBar =
    $("checkin-progress-bar");


const questionCategory =
    $("question-category");


const questionText =
    $("checkin-question-text");


const checkinAnswers =
    $("checkin-answers");


const previousQuestionButton =
    $("previous-question");


const CHECKIN_HISTORY_KEY =
    "boss-code-checkin-question-history-v1";



const bossCheckinQuestionBank = [

/* ===================================================== */
/* APPROVAL */
/* ===================================================== */

{
id:"approval-01",
category:"APPROVAL",
question:"When people close to you do not understand a goal you are pursuing, what usually happens?",
answers:[
["I normally stop pursuing it.",1],
["I seriously question whether I should continue.",2],
["It bothers me, but I usually keep going.",3],
["I trust my direction and continue.",4]
]
},

{
id:"approval-02",
category:"APPROVAL",
question:"How much does the possibility of being judged affect what you are willing to try?",
answers:[
["A lot. It stops me from doing certain things.",1],
["More than I would like to admit.",2],
["Sometimes, but I usually push through.",3],
["Very little. Judgment does not make my decisions.",4]
]
},

{
id:"approval-03",
category:"APPROVAL",
question:"How often do you make choices based on how they will look to other people?",
answers:[
["Very often.",1],
["Sometimes.",2],
["Rarely.",3],
["Almost never.",4]
]
},

{
id:"approval-04",
category:"APPROVAL",
question:"If somebody important to you disagrees with your decision, how likely are you to change it just to keep the peace?",
answers:[
["Very likely.",1],
["Somewhat likely.",2],
["I reconsider it but usually decide for myself.",3],
["I listen, evaluate and still own my decision.",4]
]
},

{
id:"approval-05",
category:"APPROVAL",
question:"When you accomplish something meaningful but nobody recognizes it, how does that affect you?",
answers:[
["It makes the accomplishment feel less valuable.",1],
["I feel disappointed and question myself.",2],
["I notice the lack of recognition but move on.",3],
["The accomplishment still matters to me.",4]
]
},

{
id:"approval-06",
category:"APPROVAL",
question:"How comfortable are you saying no when somebody may be disappointed with you?",
answers:[
["Very uncomfortable. I usually say yes.",1],
["I struggle with it.",2],
["I can do it when necessary.",3],
["I can set the boundary respectfully and move forward.",4]
]
},

{
id:"approval-07",
category:"APPROVAL",
question:"Before making a major decision, how much reassurance do you usually need from other people?",
answers:[
["A lot. I need people to agree.",1],
["I need considerable reassurance.",2],
["I value input but can decide without agreement.",3],
["I seek wisdom but do not need permission.",4]
]
},

{
id:"approval-08",
category:"APPROVAL",
question:"If people misunderstand why you are making a certain move, what is your first reaction?",
answers:[
["I want to change the decision.",1],
["I feel pressure to explain myself repeatedly.",2],
["I explain when appropriate and continue.",3],
["I am comfortable letting the decision speak for itself.",4]
]
},

{
id:"approval-09",
category:"APPROVAL",
question:"How often do you avoid expressing your real opinion because you do not want people to disagree with you?",
answers:[
["Very often.",1],
["Fairly often.",2],
["Occasionally.",3],
["Rarely.",4]
]
},

{
id:"approval-10",
category:"APPROVAL",
question:"Someone does not support something you are building. What does that usually mean to you?",
answers:[
["Maybe I should stop.",1],
["Maybe the idea is not as strong as I thought.",2],
["Their opinion is information, not a verdict.",3],
["Support is appreciated, but not required for me to build.",4]
]
},

{
id:"approval-11",
category:"APPROVAL",
question:"How often do you feel responsible for making sure everybody is comfortable with your choices?",
answers:[
["Almost always.",1],
["Often.",2],
["Sometimes.",3],
["Rarely. I can be respectful without needing everyone comfortable.",4]
]
},

{
id:"approval-12",
category:"APPROVAL",
question:"If you knew nobody would praise your next move, would you still make it?",
answers:[
["Probably not.",1],
["I would hesitate.",2],
["Most likely.",3],
["Absolutely, if I believed it was right.",4]
]
},

{
id:"approval-13",
category:"APPROVAL",
question:"When somebody questions your ability, how much does their opinion influence what you attempt next?",
answers:[
["A lot.",1],
["More than it should.",2],
["I think about it, then usually move forward.",3],
["Very little. I let effort and results answer it.",4]
]
},

{
id:"approval-14",
category:"APPROVAL",
question:"How difficult is it for you to make a decision that may temporarily disappoint somebody you care about?",
answers:[
["Extremely difficult.",1],
["Pretty difficult.",2],
["Uncomfortable but manageable.",3],
["I can do it when the decision is necessary and responsible.",4]
]
},

{
id:"approval-15",
category:"APPROVAL",
question:"Which statement best describes how you handle other people's expectations?",
answers:[
["They often determine what I do.",1],
["They strongly influence me.",2],
["I consider them but decide for myself.",3],
["I respect others without letting their expectations run my life.",4]
]
},


/* ===================================================== */
/* COMPARISON */
/* ===================================================== */

{
id:"comparison-01",
category:"COMPARISON",
question:"You share something you are proud of online and it receives very little attention. What happens next?",
answers:[
["I feel embarrassed and consider removing it.",1],
["I question whether it was actually good.",2],
["I am disappointed, but I keep creating.",3],
["Engagement does not determine its value.",4]
]
},

{
id:"comparison-02",
category:"COMPARISON",
question:"When you see someone succeeding in an area where you are trying to succeed, what is your typical response?",
answers:[
["I feel like I am falling behind.",1],
["I start comparing my progress to theirs.",2],
["I notice it, then refocus on my path.",3],
["I use it as proof success is possible.",4]
]
},

{
id:"comparison-03",
category:"COMPARISON",
question:"How often do you consume other people's lives instead of working on your own?",
answers:[
["Very often.",1],
["More often than I should.",2],
["Occasionally.",3],
["Rarely. I am intentional with my attention.",4]
]
},

{
id:"comparison-04",
category:"COMPARISON",
question:"When somebody reaches a milestone faster than you expected to reach yours, what happens internally?",
answers:[
["I feel defeated.",1],
["I feel behind.",2],
["I notice the feeling and refocus.",3],
["Their timeline does not define mine.",4]
]
},

{
id:"comparison-05",
category:"COMPARISON",
question:"How often do you change your goals after seeing what somebody else is doing?",
answers:[
["Very often.",1],
["Sometimes.",2],
["Rarely.",3],
["Almost never unless new information genuinely changes my direction.",4]
]
},

{
id:"comparison-06",
category:"COMPARISON",
question:"Someone in your field appears to be getting more attention than you. What do you tend to do?",
answers:[
["Assume I am doing something wrong.",1],
["Obsess over what they are doing.",2],
["Study anything useful and return to my work.",3],
["Stay focused on building my own value.",4]
]
},

{
id:"comparison-07",
category:"COMPARISON",
question:"How often does social media make you feel like you should be further ahead?",
answers:[
["Very often.",1],
["Often.",2],
["Sometimes.",3],
["Rarely.",4]
]
},

{
id:"comparison-08",
category:"COMPARISON",
question:"If somebody has more money, followers or recognition than you, how much does that affect how you view your own progress?",
answers:[
["A lot.",1],
["More than I want it to.",2],
["A little.",3],
["Very little. Those numbers do not define my direction.",4]
]
},

{
id:"comparison-09",
category:"COMPARISON",
question:"When you see somebody doing something similar to your idea, what is your first thought?",
answers:[
["There is no point in me doing it now.",1],
["They are already ahead of me.",2],
["I need to make mine distinctly mine.",3],
["Their existence does not eliminate my opportunity.",4]
]
},

{
id:"comparison-10",
category:"COMPARISON",
question:"How often do you measure your success using somebody else's definition of success?",
answers:[
["Very often.",1],
["Sometimes.",2],
["Rarely.",3],
["Almost never.",4]
]
},

{
id:"comparison-11",
category:"COMPARISON",
question:"When someone posts a major win, does it change how you feel about your own day?",
answers:[
["Yes, usually negatively.",1],
["Sometimes.",2],
["Briefly, then I refocus.",3],
["Their win does not reduce mine.",4]
]
},

{
id:"comparison-12",
category:"COMPARISON",
question:"How easy is it for you to celebrate somebody else's success while still believing in your own future?",
answers:[
["Very difficult.",1],
["Sometimes difficult.",2],
["Usually easy.",3],
["Very easy.",4]
]
},

{
id:"comparison-13",
category:"COMPARISON",
question:"If your progress looks slower from the outside than somebody else's, what matters most to you?",
answers:[
["How it looks.",1],
["Whether people think I am succeeding.",2],
["Whether I am actually moving forward.",3],
["Whether my progress is aligned, sustainable and real.",4]
]
},

{
id:"comparison-14",
category:"COMPARISON",
question:"How often do you abandon something because another person seems better at it?",
answers:[
["Often.",1],
["Sometimes.",2],
["Rarely.",3],
["Almost never.",4]
]
},

{
id:"comparison-15",
category:"COMPARISON",
question:"Which statement sounds most like you?",
answers:[
["Other people's progress often makes mine feel inadequate.",1],
["Comparison affects me more than I want.",2],
["I compare sometimes but can redirect myself.",3],
["I can observe others without losing sight of my own path.",4]
]
},


/* ===================================================== */
/* CONFIDENCE */
/* ===================================================== */

{
id:"confidence-01",
category:"CONFIDENCE",
question:"You have an idea you strongly believe in, but nobody around you seems excited about it. What do you do?",
answers:[
["I probably abandon it.",1],
["I wait until I get more validation.",2],
["I research it and decide for myself.",3],
["I start working on it and let the results speak.",4]
]
},

{
id:"confidence-02",
category:"CONFIDENCE",
question:"When someone criticizes something you are building, how long does that criticism affect you?",
answers:[
["It can completely derail me.",1],
["I think about it for a long time.",2],
["I evaluate whether it is useful and move on.",3],
["I take what is useful and leave the rest.",4]
]
},

{
id:"confidence-03",
category:"CONFIDENCE",
question:"If pursuing what you believe is right means being misunderstood for a while, how comfortable are you with that?",
answers:[
["Very uncomfortable.",1],
["Somewhat uncomfortable.",2],
["I do not like it, but I can handle it.",3],
["I am willing to be misunderstood.",4]
]
},

{
id:"confidence-04",
category:"CONFIDENCE",
question:"When you make a mistake publicly, what usually happens to your confidence?",
answers:[
["It drops badly.",1],
["It takes a while to recover.",2],
["I learn from it and recover.",3],
["I treat mistakes as information, not identity.",4]
]
},

{
id:"confidence-05",
category:"CONFIDENCE",
question:"How strongly do you trust yourself to figure things out when you do not have every answer yet?",
answers:[
["Not very much.",1],
["Somewhat.",2],
["Usually.",3],
["Strongly.",4]
]
},

{
id:"confidence-06",
category:"CONFIDENCE",
question:"When somebody with more experience disagrees with you, what happens?",
answers:[
["I assume they must be right.",1],
["I lose confidence quickly.",2],
["I listen carefully and evaluate the facts.",3],
["I respect experience without surrendering my own judgment.",4]
]
},

{
id:"confidence-07",
category:"CONFIDENCE",
question:"How comfortable are you entering a room where you may be the least experienced person?",
answers:[
["Very uncomfortable.",1],
["Pretty uncomfortable.",2],
["A little nervous but willing.",3],
["Comfortable enough to learn and participate.",4]
]
},

{
id:"confidence-08",
category:"CONFIDENCE",
question:"When you hear no, what does it usually mean to you?",
answers:[
["I should probably stop trying.",1],
["Maybe I am not good enough.",2],
["That opportunity was not available.",3],
["It is information, not a definition of me.",4]
]
},

{
id:"confidence-09",
category:"CONFIDENCE",
question:"How comfortable are you sharing work before it is perfect?",
answers:[
["I almost never do.",1],
["Very uncomfortable.",2],
["I can when necessary.",3],
["Comfortable enough to improve in public.",4]
]
},

{
id:"confidence-10",
category:"CONFIDENCE",
question:"When you have to make a decision without certainty, how do you usually respond?",
answers:[
["I freeze.",1],
["I delay as long as possible.",2],
["I gather enough information and decide.",3],
["I accept uncertainty and make the best responsible decision available.",4]
]
},

{
id:"confidence-11",
category:"CONFIDENCE",
question:"How much does one bad result affect how capable you believe you are?",
answers:[
["A lot.",1],
["Quite a bit.",2],
["Temporarily.",3],
["Very little. One result does not define my capability.",4]
]
},

{
id:"confidence-12",
category:"CONFIDENCE",
question:"When someone doubts you, what do you most want to do?",
answers:[
["Give up.",1],
["Convince them verbally.",2],
["Keep working.",3],
["Stay focused and let consistent action speak.",4]
]
},

{
id:"confidence-13",
category:"CONFIDENCE",
question:"How comfortable are you asking for an opportunity you may not receive?",
answers:[
["Very uncomfortable.",1],
["I avoid it often.",2],
["I can do it even when nervous.",3],
["Comfortable. Asking gives the opportunity a chance to exist.",4]
]
},

{
id:"confidence-14",
category:"CONFIDENCE",
question:"How often do you underestimate yourself before you even begin?",
answers:[
["Very often.",1],
["Often.",2],
["Sometimes.",3],
["Rarely.",4]
]
},

{
id:"confidence-15",
category:"CONFIDENCE",
question:"Which statement best describes your confidence?",
answers:[
["My confidence depends heavily on outside feedback.",1],
["I believe in myself until something goes wrong.",2],
["I usually trust myself but still have moments of doubt.",3],
["My confidence comes from values, preparation and evidence built over time.",4]
]
},


/* ===================================================== */
/* ACTION */
/* ===================================================== */

{
id:"action-01",
category:"ACTION",
question:"How often have you delayed starting something because you did not feel ready enough?",
answers:[
["Constantly.",1],
["Often.",2],
["Occasionally.",3],
["Rarely. I improve while moving.",4]
]
},

{
id:"action-02",
category:"ACTION",
question:"When something you are pursuing is not producing results quickly, what determines whether you continue?",
answers:[
["What other people think.",1],
["Whether I am receiving encouragement.",2],
["Whether the goal still makes sense.",3],
["Purpose, evidence and necessary adjustments.",4]
]
},

{
id:"action-03",
category:"ACTION",
question:"Which statement best describes how you currently make major decisions?",
answers:[
["I need approval before moving.",1],
["Other people's opinions heavily influence me.",2],
["I listen to others but ultimately decide.",3],
["I seek wisdom, evaluate facts and own my decision.",4]
]
},

{
id:"action-04",
category:"ACTION",
question:"When the next step is obvious but uncomfortable, what usually happens?",
answers:[
["I avoid it.",1],
["I delay it.",2],
["I eventually do it.",3],
["I try to handle it before avoidance grows.",4]
]
},

{
id:"action-05",
category:"ACTION",
question:"How often do you finish the things you tell yourself you are going to finish?",
answers:[
["Rarely.",1],
["Sometimes.",2],
["Most of the time.",3],
["Very consistently.",4]
]
},

{
id:"action-06",
category:"ACTION",
question:"You have an important task and an easier distraction available. What usually wins?",
answers:[
["The distraction.",1],
["Usually the distraction.",2],
["It depends.",3],
["The important task more often than not.",4]
]
},

{
id:"action-07",
category:"ACTION",
question:"How quickly do you usually act after making an important decision?",
answers:[
["I often never act.",1],
["I delay for a long time.",2],
["I usually take action reasonably soon.",3],
["I deliberately create a next step immediately.",4]
]
},

{
id:"action-08",
category:"ACTION",
question:"When a plan stops working, what do you tend to do?",
answers:[
["Quit.",1],
["Stay stuck for a long time.",2],
["Adjust eventually.",3],
["Evaluate, adjust and keep moving if the goal still makes sense.",4]
]
},

{
id:"action-09",
category:"ACTION",
question:"How often do you confuse planning with actually making progress?",
answers:[
["Very often.",1],
["Often.",2],
["Sometimes.",3],
["Rarely.",4]
]
},

{
id:"action-10",
category:"ACTION",
question:"If you only had 30 minutes today to work toward an important goal, what would you likely do?",
answers:[
["Probably nothing.",1],
["Wait until I have more time.",2],
["Try to use some of it.",3],
["Use the 30 minutes intentionally.",4]
]
},

{
id:"action-11",
category:"ACTION",
question:"How often does fear of making the wrong decision keep you from making any decision?",
answers:[
["Very often.",1],
["Often.",2],
["Sometimes.",3],
["Rarely. I know most decisions can be adjusted.",4]
]
},

{
id:"action-12",
category:"ACTION",
question:"When motivation disappears, what usually happens to your goals?",
answers:[
["They stop completely.",1],
["Progress slows dramatically.",2],
["I still do some of the work.",3],
["I rely on systems and discipline more than motivation.",4]
]
},

{
id:"action-13",
category:"ACTION",
question:"How often do you take a useful first step before you know the entire path?",
answers:[
["Almost never.",1],
["Rarely.",2],
["Sometimes.",3],
["Often.",4]
]
},

{
id:"action-14",
category:"ACTION",
question:"You realize you have been avoiding something important for weeks. What do you usually do?",
answers:[
["Keep avoiding it.",1],
["Think about it more.",2],
["Eventually force myself to deal with it.",3],
["Define the next action and start dealing with it.",4]
]
},

{
id:"action-15",
category:"ACTION",
question:"Which statement best describes your relationship with action?",
answers:[
["I usually wait until I feel ready.",1],
["I think about things much longer than I act on them.",2],
["I usually take action but sometimes hesitate.",3],
["I believe clarity often comes from responsible movement.",4]
]
}

];



let activeCheckinQuestions =
    [];


let currentCheckinQuestion =
    0;


let checkinResponses =
    [];



function shuffleArray(
    array
) {

    const copy =
        [...array];


    for (
        let i =
            copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (
                    i + 1
                )
            );


        [
            copy[i],
            copy[j]
        ] =
        [
            copy[j],
            copy[i]
        ];
    }


    return copy;
}



function getCheckinHistory() {

    try {

        const stored =
            localStorage.getItem(
                CHECKIN_HISTORY_KEY
            );


        if (!stored) {

            return {};
        }


        return JSON.parse(
            stored
        );


    } catch (error) {

        return {};
    }
}



function saveCheckinHistory(
    history
) {

    try {

        localStorage.setItem(

            CHECKIN_HISTORY_KEY,

            JSON.stringify(
                history
            )

        );

    } catch (error) {}
}



function chooseQuestionsForCategory(
    category,
    amount
) {

    const categoryQuestions =
        bossCheckinQuestionBank.filter(

            question =>
                question.category ===
                category

        );


    const history =
        getCheckinHistory();


    let usedIds =
        Array.isArray(
            history[
                category
            ]
        )
            ?
            history[
                category
            ]
            :
            [];


    let unusedQuestions =
        categoryQuestions.filter(

            question =>
                !usedIds.includes(
                    question.id
                )

        );


    if (
        unusedQuestions.length <
        amount
    ) {

        usedIds =
            [];


        unusedQuestions =
            [...categoryQuestions];
    }


    const selected =
        shuffleArray(
            unusedQuestions
        )
        .slice(
            0,
            amount
        );


    history[
        category
    ] =
        [

            ...usedIds,

            ...selected.map(

                item =>
                    item.id

            )

        ];


    saveCheckinHistory(
        history
    );


    return selected;
}



function generateCheckinQuestions() {

    const categories = [

        "APPROVAL",

        "COMPARISON",

        "CONFIDENCE",

        "ACTION"

    ];


    const selected =
        [];


    categories.forEach(

        category => {

            selected.push(

                ...chooseQuestionsForCategory(

                    category,

                    3

                )

            );
        }

    );


    activeCheckinQuestions =
        shuffleArray(
            selected
        );


    checkinResponses =
        new Array(
            activeCheckinQuestions.length
        )
        .fill(
            null
        );


    currentCheckinQuestion =
        0;
}



function showCheckinIntro() {

    if (checkinIntro) {

        checkinIntro.style.display =
            "flex";
    }


    if (checkinQuestionsScreen) {

        checkinQuestionsScreen.style.display =
            "none";
    }


    if (checkinResults) {

        checkinResults.style.display =
            "none";
    }
}



addClick(

    "start-checkin",

    function () {

        generateCheckinQuestions();


        if (checkinIntro) {

            checkinIntro.style.display =
                "none";
        }


        if (checkinQuestionsScreen) {

            checkinQuestionsScreen.style.display =
                "block";
        }


        if (checkinResults) {

            checkinResults.style.display =
                "none";
        }


        renderCheckinQuestion();
    }

);



function renderCheckinQuestion() {

    const question =
        activeCheckinQuestions[
            currentCheckinQuestion
        ];


    if (!question) {
        return;
    }


    const number =
        currentCheckinQuestion +
        1;


    const percent =
        Math.round(
            (
                number /
                activeCheckinQuestions.length
            ) *
            100
        );


    if (questionCount) {

        questionCount.textContent =
            `QUESTION ${number} OF ${activeCheckinQuestions.length}`;
    }


    if (progressPercent) {

        progressPercent.textContent =
            `${percent}%`;
    }


    if (checkinProgressBar) {

        checkinProgressBar.style.width =
            `${percent}%`;
    }


    if (questionCategory) {

        questionCategory.textContent =
            question.category;
    }


    if (questionText) {

        questionText.textContent =
            question.question;
    }


    if (!checkinAnswers) {
        return;
    }


    checkinAnswers.innerHTML =
        "";


    question.answers.forEach(

        function (
            answer,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "checkin-answer";


            button.innerHTML = `

                <span class="answer-letter">

                    ${String.fromCharCode(
                        65 +
                        index
                    )}

                </span>

                <span>
                    ${answer[0]}
                </span>
            `;


            button.addEventListener(

                "click",

                function () {

                    checkinResponses[
                        currentCheckinQuestion
                    ] =
                        index;


                    if (
                        currentCheckinQuestion <
                        activeCheckinQuestions.length -
                        1
                    ) {

                        currentCheckinQuestion++;


                        renderCheckinQuestion();


                    } else {

                        calculateBossScore();
                    }
                }

            );


            checkinAnswers.appendChild(
                button
            );
        }

    );


    if (previousQuestionButton) {

        previousQuestionButton.style.display =
            currentCheckinQuestion ===
            0
                ?
                "none"
                :
                "block";
    }
}



if (previousQuestionButton) {

    previousQuestionButton.addEventListener(

        "click",

        function () {

            if (
                currentCheckinQuestion >
                0
            ) {

                currentCheckinQuestion--;


                renderCheckinQuestion();
            }
        }

    );
}



function calculateBossScore() {

    const totals = {

        APPROVAL:[
            0,
            0
        ],

        COMPARISON:[
            0,
            0
        ],

        CONFIDENCE:[
            0,
            0
        ],

        ACTION:[
            0,
            0
        ]

    };


    let earned =
        0;


    let possible =
        0;


    activeCheckinQuestions.forEach(

        function (
            question,
            index
        ) {

            const selected =
                checkinResponses[
                    index
                ];


            if (
                selected ===
                null
            ) {

                return;
            }


            const score =
                question.answers[
                    selected
                ][1] -
                1;


            earned +=
                score;


            possible +=
                3;


            totals[
                question.category
            ][0] +=
                score;


            totals[
                question.category
            ][1] +=
                3;
        }

    );


    const overall =
        possible
            ?
            Math.round(
                (
                    earned /
                    possible
                ) *
                100
            )
            :
            0;


    const categories =
        {};


    Object
        .keys(
            totals
        )
        .forEach(

            function (
                category
            ) {

                const categoryPossible =
                    totals[
                        category
                    ][1];


                categories[
                    category
                ] =
                    categoryPossible
                        ?
                        Math.round(
                            (
                                totals[
                                    category
                                ][0] /
                                categoryPossible
                            ) *
                            100
                        )
                        :
                        0;
            }

        );


    showBossResults(

        overall,

        categories

    );
}



function showBossResults(
    overall,
    categories
) {

    if (checkinQuestionsScreen) {

        checkinQuestionsScreen.style.display =
            "none";
    }


    if (checkinResults) {

        checkinResults.style.display =
            "block";
    }


    if ($("boss-score")) {

        $("boss-score").textContent =
            overall;
    }


    [

        "approval",

        "comparison",

        "confidence",

        "action"

    ]
    .forEach(

        function (
            name
        ) {

            const score =
                categories[
                    name.toUpperCase()
                ];


            if (
                $(`${name}-score`)
            ) {

                $(`${name}-score`).textContent =
                    score;
            }


            if (
                $(`${name}-meter`)
            ) {

                $(`${name}-meter`).style.width =
                    `${score}%`;
            }
        }

    );


    let weakest =
        "APPROVAL";


    Object
        .keys(
            categories
        )
        .forEach(

            function (
                category
            ) {

                if (
                    categories[
                        category
                    ] <
                    categories[
                        weakest
                    ]
                ) {

                    weakest =
                        category;
                }
            }

        );


    if ($("weakest-category")) {

        $("weakest-category").textContent =
            weakest;
    }


    const messages = {

        APPROVAL:
            "Outside validation may be carrying too much weight in your decisions.",

        COMPARISON:
            "Watching other people's progress may be affecting how you view your own.",

        CONFIDENCE:
            "You may know what you want to do but lose confidence when uncertainty or disagreement appears.",

        ACTION:
            "Hesitation may be creating more resistance than the goal itself."

    };


    if ($("weakest-message")) {

        $("weakest-message").textContent =
            messages[
                weakest
            ];
    }


    if ($("next-decision")) {

        $("next-decision").textContent =
            "Take one intentional action today that reduces the influence this area has over your decisions.";
    }


    if ($("boss-score-title")) {

        if (
            overall >=
            85
        ) {

            $("boss-score-title").textContent =
                "YOU'RE MOVING LIKE A B.O.S.S.";


        } else if (
            overall >=
            70
        ) {

            $("boss-score-title").textContent =
                "YOU'RE BREAKING THE PATTERN";


        } else if (
            overall >=
            50
        ) {

            $("boss-score-title").textContent =
                "YOU'RE GAINING CONTROL";


        } else {

            $("boss-score-title").textContent =
                "YOUR NEXT DECISION MATTERS";
        }
    }


    if (
        $("boss-score-description")
    ) {

        $("boss-score-description").textContent =
            "Your score reflects how strongly your answers suggest you are making decisions independently of social pressure.";
    }


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });
}



addClick(

    "retake-checkin",

    function () {

        generateCheckinQuestions();


        if (checkinIntro) {

            checkinIntro.style.display =
                "none";
        }


        if (checkinResults) {

            checkinResults.style.display =
                "none";
        }


        if (checkinQuestionsScreen) {

            checkinQuestionsScreen.style.display =
                "block";
        }


        renderCheckinQuestion();


        window.scrollTo({

            top:0,

            behavior:"smooth"

        });
    }

);



addClick(

    "go-to-decision-makers",

    function () {

        showScreen(
            decisionMakersScreen
        );
    }

);



/* ========================================================= */
/* BOSS BITE EPISODES */
/* ========================================================= */

const episodes = [

    {

        id:
            "trailer",

        title:
            "The Boss Bite Trailer",

        description:
            "Welcome to The Boss Bite. Fueling Your Hustle.",

        youtubeUrl:
            "https://youtu.be/wKAwLNXTf6g?si=3UNB7oxtZrIzO_yI"

    },

    {

        id:
            "haitian",

        title:
            "Haitian Sensation",

        description:
            "The Boss Bite visits Haitian Sensation.",

        youtubeUrl:
            "https://youtu.be/D6GujKBRZX0?si=yq3_lngkGvHayEui"

    },

    {

        id:
            "spudz",

        title:
            "House of Spudz + Pickle Fest",

        description:
            "Loaded potatoes, big flavors and Pickle Fest.",

        youtubeUrl:
            "https://youtu.be/uLLjlAieS64"

    },

    {

        id:
            "rr",

        title:
            "The Coffee Shop That You Won't Want To Leave",

        description:
            "The Boss Bite visits R+R Coffee Bar.",

        youtubeUrl:
            "https://youtu.be/bRhah6mR2zk"

    },

    {

        id:
            "grizzly",

        title:
            "Did We Find The Coolest Coffee Shop Ever",

        description:
            "The Boss Bite visits Grizzly Bean Coffee.",

        youtubeUrl:
            "https://youtu.be/vxNr89y_5IY"

    }

];


const episodeGrid =
    $("episode-grid");


const featuredPlayer =
    $("featured-player");


const featuredTitle =
    $("featured-title");



function buildEpisodes() {

    if (!episodeGrid) {
        return;
    }


    episodeGrid.innerHTML =
        "";


    episodes.forEach(

        function (episode) {

            const id =
                getYouTubeId(
                    episode.youtubeUrl
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "episode-card";


            card.innerHTML = `

                <div class="episode-thumbnail">

                    <img
                        src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
                        alt="${episode.title}"
                    >

                    <div class="play-circle">
                        ▶
                    </div>

                </div>

                <div class="episode-info">

                    <h3>
                        ${episode.title}
                    </h3>

                    <p>
                        ${episode.description}
                    </p>

                </div>
            `;


            card.addEventListener(

                "click",

                function () {

                    playEpisode(

                        id,

                        episode.title

                    );
                }

            );


            episodeGrid.appendChild(
                card
            );
        }

    );
}



function playEpisode(
    id,
    title
) {

    if (
        !featuredPlayer ||
        !id
    ) {

        return;
    }


    featuredPlayer.innerHTML = `

        <iframe
            src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
            title="${title}"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
        ></iframe>
    `;


    if (featuredTitle) {

        featuredTitle.textContent =
            title;
    }


    featuredPlayer.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });
}



function loadFirstEpisode() {

    if (
        !featuredPlayer ||
        !episodes.length
    ) {

        return;
    }


    const episode =
        episodes[0];


    const id =
        getYouTubeId(
            episode.youtubeUrl
        );


    featuredPlayer.innerHTML = `

        <iframe
            src="https://www.youtube.com/embed/${id}?rel=0"
            title="${episode.title}"
            allowfullscreen
        ></iframe>
    `;


    if (featuredTitle) {

        featuredTitle.textContent =
            episode.title;
    }
}



/* ========================================================= */
/* B.O.S.S CODE TV */
/* PREVIOUSLY RECORDED */
/* ========================================================= */

const bossCodeTvVideos = [

    {

        url:
            "https://youtu.be/wHHYCaypgvc",

        title:
            "Xavier Simmons (Son Of DMX)"

    },

    {

        url:
            "https://youtu.be/4EJHi_E2JTo",

        title:
            "Layzie Bone (Member of Bone Thugs-N-Harmony)"

    },

    {

        url:
            "https://youtu.be/NukOMiQESl0",

        title:
            "Cormega Part 1"

    },

    {

        url:
            "https://youtu.be/CZfe1hiIJd4",

        title:
            "Cormega Part 2"

    },

    {

        url:
            "https://youtu.be/54rw1X4dCKw",

        title:
            "Steve Baughman (Grammy Award-Winning Engineer)"

    },

    {

        url:
            "https://youtu.be/TADG86xTtSQ",

        title:
            "James Starks (Super Bowl Winning RB)"

    },

    {

        url:
            "https://youtu.be/T2myWEyUrTI",

        title:
            "Eric Sattler (Filmmaker)"

    }

];


const bossCodeTvGrid =
    $("boss-code-tv-grid");



function createTvThumbnail(
    id,
    title
) {

    return `

        <button
            class="tv-thumbnail"
            type="button"
            data-video-id="${id}"
        >

            <img
                src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
                alt="${title}"
            >

            <span class="tv-play-button"></span>

        </button>
    `;
}



function buildBossCodeTv() {

    if (!bossCodeTvGrid) {
        return;
    }


    bossCodeTvGrid.innerHTML =
        "";


    bossCodeTvVideos.forEach(

        function (video) {

            const id =
                getYouTubeId(
                    video.url
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "tv-card";


            card.innerHTML = `

                <div class="tv-player">

                    <div class="tv-media">

                        ${createTvThumbnail(
                            id,
                            video.title
                        )}

                    </div>

                </div>

                <div class="tv-card-body">

                    <h3>
                        ${video.title}
                    </h3>

                </div>
            `;


            bossCodeTvGrid.appendChild(
                card
            );
        }

    );
}



function stopBossCodeTvVideos() {

    buildBossCodeTv();
}



if (bossCodeTvGrid) {

    bossCodeTvGrid.addEventListener(

        "click",

        function (event) {

            const thumbnail =
                event.target.closest(
                    ".tv-thumbnail"
                );


            if (!thumbnail) {
                return;
            }


            const id =
                thumbnail.dataset.videoId;


            stopBossCodeTvVideos();


            const selected =
                bossCodeTvGrid.querySelector(
                    `[data-video-id="${id}"]`
                );


            if (!selected) {
                return;
            }


            const media =
                selected.closest(
                    ".tv-media"
                );


            media.innerHTML = `

                <iframe
                    class="tv-iframe"
                    src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                ></iframe>
            `;
        }

    );
}



/* ========================================================= */
/* GALLERY */
/* ========================================================= */

const gallery =
    $("boss-bite-gallery");


const galleryLightbox =
    $("gallery-lightbox");


const galleryLargeImage =
    $("gallery-large-image");


const galleryCounter =
    $("gallery-counter");


const galleryExtensions = [

    "jpg",

    "jpeg",

    "png",

    "webp"

];


const galleryPhotos =
    [];


let currentGalleryIndex =
    0;



function findGalleryImage(
    number,
    callback
) {

    let extensionIndex =
        0;


    function tryNext() {

        if (
            extensionIndex >=
            galleryExtensions.length
        ) {

            callback(
                null
            );


            return;
        }


        const path =
            `images/Action photos/bossbite-${number}.${galleryExtensions[extensionIndex]}`;


        const image =
            new Image();


        image.onload =
            function () {

                callback(
                    path
                );
            };


        image.onerror =
            function () {

                extensionIndex++;


                tryNext();
            };


        image.src =
            path;
    }


    tryNext();
}



function buildGallery() {

    if (!gallery) {
        return;
    }


    gallery.innerHTML =
        "";


    galleryPhotos.length =
        0;


    for (
        let number =
            1;
        number <=
        29;
        number++
    ) {

        findGalleryImage(

            number,

            function (path) {

                if (!path) {
                    return;
                }


                galleryPhotos.push({

                    number:
                        number,

                    path:
                        path

                });


                galleryPhotos.sort(

                    function (
                        a,
                        b
                    ) {

                        return (

                            a.number -
                            b.number

                        );
                    }

                );


                renderGallery();
            }

        );
    }
}



function renderGallery() {

    if (!gallery) {
        return;
    }


    gallery.innerHTML =
        "";


    galleryPhotos.forEach(

        function (
            photo,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "gallery-photo";


            button.innerHTML = `

                <img
                    src="${photo.path}"
                    alt="Boss Bite photo"
                >
            `;


            button.addEventListener(

                "click",

                function () {

                    currentGalleryIndex =
                        index;


                    updateGalleryViewer();


                    if (galleryLightbox) {

                        galleryLightbox.classList.add(
                            "open"
                        );
                    }
                }

            );


            gallery.appendChild(
                button
            );
        }

    );
}



function updateGalleryViewer() {

    if (
        !galleryPhotos.length ||
        !galleryLargeImage
    ) {

        return;
    }


    galleryLargeImage.src =
        galleryPhotos[
            currentGalleryIndex
        ].path;


    if (galleryCounter) {

        galleryCounter.textContent =
            `${currentGalleryIndex + 1} / ${galleryPhotos.length}`;
    }
}



addClick(

    "gallery-close",

    function () {

        if (galleryLightbox) {

            galleryLightbox.classList.remove(
                "open"
            );
        }
    }

);



addClick(

    "gallery-next",

    function () {

        if (
            !galleryPhotos.length
        ) {

            return;
        }


        currentGalleryIndex =
            (
                currentGalleryIndex +
                1
            ) %
            galleryPhotos.length;


        updateGalleryViewer();
    }

);



addClick(

    "gallery-previous",

    function () {

        if (
            !galleryPhotos.length
        ) {

            return;
        }


        currentGalleryIndex =
            (
                currentGalleryIndex -
                1 +
                galleryPhotos.length
            ) %
            galleryPhotos.length;


        updateGalleryViewer();
    }

);



/* ========================================================= */
/* RESTAURANTS */
/* ========================================================= */

const restaurants = [

    {

        id:
            "grizzly",

        name:
            "Grizzly Bean Coffee",

        category:
            "COFFEE • FOOD",

        address:
            "2560 E State St, Hermitage, PA 16148",

        image:
            "images/restaurants/Grizzly bean.jpg",

        website:
            "https://grizzlybean.com",

        episodeId:
            "grizzly"

    },


    {

        id:
            "haitian",

        name:
            "Haitian Sensation",

        category:
            "HAITIAN • CARIBBEAN • COFFEE",

        address:
            "76 Shenango Ave, Sharon, PA 16146",

        image:
            "images/restaurants/haitian sensation.png",

        website:
            "https://haitiansensationcoffee.com",

        episodeId:
            "haitian"

    },


    {

        id:
            "rr",

        name:
            "R+R Coffee Bar",

        category:
            "COFFEE • COMMUNITY",

        address:
            "2840 Lincoln Way E Unit H, Massillon, OH 44646",

        image:
            "images/restaurants/rr coffee.jpg",

        website:
            "https://randrcoffee.com",

        episodeId:
            "rr",

        coordinates: {

            lat:
                40.796612,

            lng:
                -81.482421

        }

    },


    {

        id:
            "spudz",

        name:
            "House of Spudz",

        category:
            "LOADED POTATOES • COMFORT FOOD",

        address:
            "3974 Fulton Dr NW, Canton, OH 44718",

        image:
            "images/restaurants/house of spudz.jpeg",

        website:
            "",

        episodeId:
            "spudz",

        coordinates: {

            lat:
                40.835695,

            lng:
                -81.422358

        }

    },


    {

        id:
            "century",

        name:
            "Century Farms",

        category:
            "VENUE • LOCAL EXPERIENCE",

        address:
            "1121 Canton Rd NW, Carrollton, OH 44615",

        image:
            "images/restaurants/century.jpeg",

        website:
            "https://www.centuryfarmsohio.com",

        episodeId:
            ""

    },


    {

        id:
            "deli",

        name:
            "Deli On The Square",

        category:
            "DELI • LOCAL FOOD",

        address:
            "50 S Lisbon St, Carrollton, OH 44615",

        image:
            "images/restaurants/Deli on the square.jpeg",

        website:
            "",

        episodeId:
            ""

    },


    {

        id:
            "carroll-coffee",

        name:
            "Carroll County Coffee Company",

        category:
            "COFFEE",

        address:
            "704 Canton Rd NW # C, Carrollton, OH 44615",

        image:
            "images/restaurants/Carroll County.jpeg",

        website:
            "",

        episodeId:
            "",

        coordinates: {

            lat:
                40.5820228,

            lng:
                -81.0916092

        }

    },


    {

        id:
            "betty",

        name:
            "Betty Kaye Bakery",

        category:
            "BAKERY • SWEETS",

        address:
            "72 W Main St, Carrollton, OH 44615",

        image:
            "images/restaurants/betty kaye.png",

        website:
            "https://www.bettykayebakery.com",

        episodeId:
            ""

    },


    {

        id:
            "chop-house",

        name:
            "The Chop House Carrollton",

        category:
            "STEAKHOUSE • DINING",

        address:
            "1117 Canton Rd NW, Carrollton, OH 44615",

        image:
            "images/restaurants/The chop house.png",

        website:
            "https://www.chopcc.com",

        episodeId:
            ""

    }

];



/* ========================================================= */
/* BOSS BITE MAP */
/* ========================================================= */

let bossBiteMap =
    null;


let mapHasLoaded =
    false;


const restaurantMarkers =
    {};


const pendingRestaurantClicks =
    {};


const restaurantList =
    $("restaurant-list");



function buildRestaurantList() {

    if (!restaurantList) {
        return;
    }


    restaurantList.innerHTML =
        "";


    restaurants.forEach(

        function (restaurant) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "restaurant-list-item";


            button.dataset.restaurant =
                restaurant.id;


            button.innerHTML = `

                <img
                    class="restaurant-list-image"
                    src="${restaurant.image}"
                    alt="${restaurant.name}"
                >

                <div class="restaurant-list-info">

                    <strong>
                        ${restaurant.name}
                    </strong>

                    <span>
                        ${restaurant.category}
                    </span>

                </div>
            `;


            button.addEventListener(

                "click",

                function () {

                    focusRestaurant(
                        restaurant.id
                    );
                }

            );


            restaurantList.appendChild(
                button
            );
        }

    );
}



function selectRestaurantListItem(
    id
) {

    document
        .querySelectorAll(
            ".restaurant-list-item"
        )
        .forEach(

            item => {

                item.classList.remove(
                    "selected"
                );
            }

        );


    const selected =
        document.querySelector(
            `[data-restaurant="${id}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );
    }
}



async function geocodeAddress(
    address
) {

    const key =
        "bossbite-" +
        address;


    const cached =
        localStorage.getItem(
            key
        );


    if (cached) {

        try {

            return JSON.parse(
                cached
            );

        } catch (error) {}
    }


    try {

        const response =
            await fetch(

                "https://nominatim.openstreetmap.org/search" +
                "?format=jsonv2" +
                "&limit=1" +
                "&countrycodes=us" +
                "&q=" +
                encodeURIComponent(
                    address
                )

            );


        const results =
            await response.json();


        if (
            !results.length
        ) {

            return null;
        }


        const coordinates = {

            lat:
                Number(
                    results[0].lat
                ),

            lng:
                Number(
                    results[0].lon
                )

        };


        localStorage.setItem(

            key,

            JSON.stringify(
                coordinates
            )

        );


        return coordinates;


    } catch (error) {

        return null;
    }
}



function createDirectionsUrl(
    address
) {

    return (

        "https://www.google.com/maps/dir/?api=1&destination=" +

        encodeURIComponent(
            address
        )

    );
}



function createRestaurantPopup(
    restaurant
) {

    return `

        <div class="restaurant-popup">

            <img
                class="restaurant-popup-image"
                src="${restaurant.image}"
                alt="${restaurant.name}"
            >

            <div class="restaurant-popup-body">

                <h3>
                    ${restaurant.name}
                </h3>

                <div class="restaurant-category">
                    ${restaurant.category}
                </div>

                <div class="restaurant-address">
                    ${restaurant.address}
                </div>

                ${
                    restaurant.episodeId
                        ?
                        `

                        <button
                            class="restaurant-action watch-episode-button"
                            data-episode="${restaurant.episodeId}"
                            type="button"
                        >
                            ▶ WATCH EPISODE
                        </button>

                        `
                        :
                        ""
                }

                <a
                    class="restaurant-action directions-button"
                    href="${createDirectionsUrl(restaurant.address)}"
                    target="_blank"
                >
                    📍 GET DIRECTIONS
                </a>

                ${
                    restaurant.website
                        ?
                        `

                        <a
                            class="restaurant-action website-button"
                            href="${restaurant.website}"
                            target="_blank"
                        >
                            VISIT WEBSITE
                        </a>

                        `
                        :
                        ""
                }

            </div>

        </div>
    `;
}



function customizeBossBiteMap() {

    if (!bossBiteMap) {
        return;
    }


    const style =
        bossBiteMap.getStyle();


    if (
        !style ||
        !style.layers
    ) {

        return;
    }


    style.layers.forEach(

        function (layer) {

            if (
                layer.type !==
                "symbol"
            ) {

                return;
            }


            const sourceLayer =
                layer[
                    "source-layer"
                ] ||
                "";


            try {

                if (
                    sourceLayer ===
                    "place"
                ) {

                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-color",

                        "#F5C518"

                    );


                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-halo-color",

                        "#000000"

                    );


                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-halo-width",

                        2

                    );
                }


                if (
                    sourceLayer ===
                    "transportation_name"
                ) {

                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-color",

                        "#FFFFFF"

                    );


                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-halo-color",

                        "#000000"

                    );


                    bossBiteMap.setPaintProperty(

                        layer.id,

                        "text-halo-width",

                        1.5

                    );
                }


            } catch (error) {}
        }

    );
}



function addRestaurantMarker(
    restaurant,
    coordinates
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "boss-bite-map-marker";


    element.innerHTML = `

        <img
            src="images/boss-bite-pin.png"
            alt="${restaurant.name}"
        >
    `;


    const popup =
        new maplibregl.Popup({

            offset:
                35,

            maxWidth:
                "285px"

        })
        .setHTML(
            createRestaurantPopup(
                restaurant
            )
        );


    const marker =
        new maplibregl.Marker({

            element:
                element,

            anchor:
                "bottom"

        })
        .setLngLat([

            coordinates.lng,

            coordinates.lat

        ])
        .setPopup(
            popup
        )
        .addTo(
            bossBiteMap
        );


    restaurantMarkers[
        restaurant.id
    ] =
        marker;


    element.addEventListener(

        "click",

        function () {

            selectRestaurantListItem(
                restaurant.id
            );
        }

    );


    if (
        pendingRestaurantClicks[
            restaurant.id
        ]
    ) {

        delete pendingRestaurantClicks[
            restaurant.id
        ];


        setTimeout(

            function () {

                focusRestaurant(
                    restaurant.id
                );
            },

            150

        );
    }
}



function focusRestaurant(
    id
) {

    selectRestaurantListItem(
        id
    );


    const marker =
        restaurantMarkers[
            id
        ];


    if (!marker) {

        pendingRestaurantClicks[
            id
        ] =
            true;


        return;
    }


    const position =
        marker.getLngLat();


    bossBiteMap.flyTo({

        center:[

            position.lng,

            position.lat

        ],

        zoom:
            15,

        speed:
            1.35,

        curve:
            1.4,

        essential:
            true

    });


    setTimeout(

        function () {

            const popup =
                marker.getPopup();


            if (
                popup &&
                !popup.isOpen()
            ) {

                marker.togglePopup();
            }
        },

        850

    );
}



document.addEventListener(

    "click",

    function (event) {

        const button =
            event.target.closest(
                ".watch-episode-button"
            );


        if (!button) {
            return;
        }


        const episode =
            episodes.find(

                item =>
                    item.id ===
                    button.dataset.episode

            );


        if (!episode) {
            return;
        }


        playEpisode(

            getYouTubeId(
                episode.youtubeUrl
            ),

            episode.title

        );
    }

);



async function initializeBossBiteMap() {

    const mapElement =
        $("boss-bite-map");


    if (
        !mapElement ||
        typeof maplibregl ===
        "undefined"
    ) {

        return;
    }


    if (mapHasLoaded) {

        if (bossBiteMap) {

            bossBiteMap.resize();
        }


        return;
    }


    mapHasLoaded =
        true;


    bossBiteMap =
        new maplibregl.Map({

            container:
                "boss-bite-map",

            style:
                "https://tiles.openfreemap.org/styles/dark",

            center:[

                -80.90,

                40.85

            ],

            zoom:
                7

        });


    bossBiteMap.addControl(

        new maplibregl.NavigationControl({

            showCompass:
                false

        }),

        "top-left"

    );


    bossBiteMap.on(

        "load",

        async function () {

            customizeBossBiteMap();


            const bounds =
                new maplibregl
                    .LngLatBounds();


            for (
                const restaurant
                of restaurants
            ) {

                const coordinates =
                    restaurant.coordinates ||
                    await geocodeAddress(
                        restaurant.address
                    );


                if (coordinates) {

                    bounds.extend([

                        coordinates.lng,

                        coordinates.lat

                    ]);


                    addRestaurantMarker(

                        restaurant,

                        coordinates

                    );
                }


                if (
                    !restaurant.coordinates
                ) {

                    await new Promise(

                        function (resolve) {

                            setTimeout(

                                resolve,

                                1100

                            );
                        }

                    );
                }
            }


            if (
                !bounds.isEmpty()
            ) {

                bossBiteMap.fitBounds(

                    bounds,

                    {

                        padding:
                            60,

                        maxZoom:
                            9

                    }

                );
            }


            const loading =
                $("map-loading");


            if (loading) {

                loading.classList.add(
                    "hidden"
                );
            }


            bossBiteMap.resize();
        }

    );
}



/* ========================================================= */
/* START B.O.S.S CODE GO */
/* ========================================================= */

buildArtistPicker();


buildMusicLibrary();


buildArtistReleases();


buildDecisionMakerOnTheGo();


buildEpisodes();


loadFirstEpisode();


buildBossCodeTv();


buildGallery();


buildRestaurantList();


renderDailyDecision();


updateBossCodeTvLive();