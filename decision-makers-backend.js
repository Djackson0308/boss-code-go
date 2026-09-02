(() => {

    "use strict";


    /* ========================================================= */
    /* B.O.S.S CODE GO
       DECISION MAKERS BACKEND
    /* ========================================================= */


    const API =
        "https://boss-code-go-api.dezthareason4ever.workers.dev";


    const CHALLENGE_STORAGE_KEY =
        "boss-code-decision-maker-challenges-v1";


    let backendSessions = [];
    let backendChallenges = [];
    let backendResources = [];


    /* ========================================================= */
    /* HELPERS */
    /* ========================================================= */


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function published(item) {

        if (
            item.published === undefined ||
            item.published === null
        ) {
            return true;
        }

        return Number(item.published) === 1;

    }


    function sortItems(items) {

        return [...items].sort((a, b) => {

            const aSort =
                Number(a.sort_order ?? 0);

            const bSort =
                Number(b.sort_order ?? 0);


            if (aSort !== bSort) {
                return aSort - bSort;
            }


            const aNumber =
                Number(
                    a.session_number ??
                    a.challenge_number ??
                    a.id ??
                    0
                );

            const bNumber =
                Number(
                    b.session_number ??
                    b.challenge_number ??
                    b.id ??
                    0
                );


            return aNumber - bNumber;

        });

    }


    async function getData(path) {

        const response =
            await fetch(
                `${API}${path}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Request failed: ${response.status}`
            );

        }


        const json =
            await response.json();


        if (Array.isArray(json)) {
            return json;
        }


        if (Array.isArray(json.data)) {
            return json.data;
        }


        return [];

    }


    function getYouTubeId(value) {

        if (!value) {
            return "";
        }


        const text =
            String(value).trim();


        if (
            /^[A-Za-z0-9_-]{11}$/.test(text)
        ) {
            return text;
        }


        try {

            const url =
                new URL(text);


            if (
                url.hostname.includes("youtu.be")
            ) {

                return url.pathname
                    .replace("/", "")
                    .split("?")[0];

            }


            if (
                url.searchParams.get("v")
            ) {

                return url.searchParams.get("v");

            }


            const parts =
                url.pathname
                    .split("/")
                    .filter(Boolean);


            const liveIndex =
                parts.indexOf("live");


            if (
                liveIndex !== -1 &&
                parts[liveIndex + 1]
            ) {

                return parts[liveIndex + 1];

            }


            const embedIndex =
                parts.indexOf("embed");


            if (
                embedIndex !== -1 &&
                parts[embedIndex + 1]
            ) {

                return parts[embedIndex + 1];

            }


            const shortsIndex =
                parts.indexOf("shorts");


            if (
                shortsIndex !== -1 &&
                parts[shortsIndex + 1]
            ) {

                return parts[shortsIndex + 1];

            }

        }
        catch (error) {

            return "";

        }


        return "";

    }


    function twoDigits(number) {

        return String(
            Number(number || 0)
        ).padStart(2, "0");

    }


    /* ========================================================= */
    /* SESSION PLAYER */
/* ========================================================= */


    function ensureSessionPlayer() {

        if (
            document.getElementById(
                "dm-session-player-overlay"
            )
        ) {
            return;
        }


        const overlay =
            document.createElement("div");


        overlay.id =
            "dm-session-player-overlay";


        overlay.innerHTML = `

            <div class="dm-session-player-shell">

                <div class="dm-session-player-top">

                    <div>
                        <span>
                            DECISION MAKER SESSION
                        </span>

                        <h3 id="dm-session-player-title">
                            SESSION
                        </h3>
                    </div>

                    <button
                        id="dm-session-player-close"
                        type="button"
                        aria-label="Close Session"
                    >
                        ✕
                    </button>

                </div>

                <div class="dm-session-video-wrap">

                    <iframe
                        id="dm-session-player-frame"
                        src=""
                        title="Decision Maker Session"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>

                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        document
            .getElementById(
                "dm-session-player-close"
            )
            .addEventListener(
                "click",
                closeSessionPlayer
            );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === overlay
                ) {

                    closeSessionPlayer();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    overlay.classList.contains("show")
                ) {

                    closeSessionPlayer();

                }

            }
        );

    }


    function openSessionPlayer(
        title,
        youtubeId
    ) {

        if (!youtubeId) {
            return;
        }


        ensureSessionPlayer();


        const overlay =
            document.getElementById(
                "dm-session-player-overlay"
            );


        const frame =
            document.getElementById(
                "dm-session-player-frame"
            );


        const titleElement =
            document.getElementById(
                "dm-session-player-title"
            );


        titleElement.textContent =
            title || "SESSION";


        frame.src =
            `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;


        overlay.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeSessionPlayer() {

        const overlay =
            document.getElementById(
                "dm-session-player-overlay"
            );


        const frame =
            document.getElementById(
                "dm-session-player-frame"
            );


        if (frame) {
            frame.src = "";
        }


        if (overlay) {
            overlay.classList.remove("show");
        }


        document.body.style.overflow =
            "";

    }


    /* ========================================================= */
    /* DECISION MAKER SESSIONS */
    /* ========================================================= */


    function renderSessions() {

        const grid =
            document.querySelector(
                "#decision-makers-screen .session-grid"
            );


        if (!grid) {
            return;
        }


        const sessions =
            sortItems(
                backendSessions.filter(
                    published
                )
            );


        /*
        If nothing is published in Admin,
        keep the existing placeholder sessions.
        */

        if (!sessions.length) {
            return;
        }


        grid.innerHTML = "";


        sessions.forEach(
            function (session) {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "session-card";


                const youtubeId =
                    session.youtube_id ||
                    getYouTubeId(
                        session.youtube_url
                    );


                const number =
                    session.session_number ||
                    session.id ||
                    1;


                const buttonHTML =
                    youtubeId
                        ? `
                            <button
                                class="dm-watch-session-button"
                                type="button"
                            >
                                ▶ WATCH SESSION
                            </button>
                        `
                        : `
                            <div class="session-status">
                                SESSION COMING SOON
                            </div>
                        `;


                article.innerHTML = `

                    <div class="session-number">
                        ${twoDigits(number)}
                    </div>

                    <div class="session-content">

                        <span>
                            FOCUSED SESSION
                        </span>

                        <h3>
                            ${escapeHTML(session.title || "")}
                        </h3>

                        <p>
                            ${escapeHTML(session.description || "")}
                        </p>

                        ${buttonHTML}

                    </div>

                `;


                if (youtubeId) {

                    const button =
                        article.querySelector(
                            ".dm-watch-session-button"
                        );


                    button.addEventListener(
                        "click",
                        function () {

                            openSessionPlayer(
                                session.title,
                                youtubeId
                            );

                        }
                    );

                }


                grid.appendChild(
                    article
                );

            }
        );

    }


    /* ========================================================= */
    /* CHALLENGE STORAGE */
    /* ========================================================= */


    function loadChallengeState() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    CHALLENGE_STORAGE_KEY
                )
            ) || {};

        }
        catch (error) {

            return {};

        }

    }


    function saveChallengeState(
        state
    ) {

        try {

            localStorage.setItem(
                CHALLENGE_STORAGE_KEY,
                JSON.stringify(state)
            );

        }
        catch (error) {

            console.warn(
                "Could not save Decision Makers challenge state."
            );

        }

    }


    function challengeKey(
        challenge
    ) {

        return String(
            challenge.id ??
            challenge.challenge_number ??
            challenge.title
        );

    }


    /* ========================================================= */
    /* TAKE ACTION CHALLENGES */
    /* ========================================================= */


    function showChallengeMessage(
        challenge
    ) {

        const box =
            document.getElementById(
                "decision-challenge-message"
            );


        const title =
            document.getElementById(
                "challenge-title"
            );


        const copy =
            document.getElementById(
                "challenge-copy"
            );


        if (title) {

            title.textContent =
                challenge.title ||
                "YOU MADE THE DECISION.";

        }


        if (copy) {

            copy.textContent =
                challenge.completion_message ||
                "NOW TAKE ACTION.";

        }


        if (box) {

            box.classList.add(
                "show"
            );


            setTimeout(
                function () {

                    box.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });

                },
                100
            );

        }

    }


    function acceptChallenge(
        challenge,
        button
    ) {

        const state =
            loadChallengeState();


        const key =
            challengeKey(
                challenge
            );


        state[key] = {
            accepted: true,
            accepted_at:
                new Date().toISOString()
        };


        saveChallengeState(
            state
        );


        button.textContent =
            "CHALLENGE ACCEPTED ✓";


        button.classList.add(
            "accepted"
        );


        button.disabled =
            true;


        showChallengeMessage(
            challenge
        );

    }


    function renderChallenges() {

        const grid =
            document.querySelector(
                "#decision-makers-screen .action-grid"
            );


        if (!grid) {
            return;
        }


        const challenges =
            sortItems(
                backendChallenges.filter(
                    published
                )
            );


        /*
        Keep the original three challenges
        if Admin has none published.
        */

        if (!challenges.length) {
            return;
        }


        const state =
            loadChallengeState();


        grid.innerHTML = "";


        challenges.forEach(
            function (challenge) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "action-card";


                const number =
                    challenge.challenge_number ||
                    challenge.id ||
                    1;


                const key =
                    challengeKey(
                        challenge
                    );


                const accepted =
                    Boolean(
                        state[key] &&
                        state[key].accepted
                    );


                card.innerHTML = `

                    <div class="action-number">
                        ${twoDigits(number)}
                    </div>

                    <h3>
                        ${escapeHTML(challenge.title || "")}
                    </h3>

                    <p>
                        ${escapeHTML(challenge.description || "")}
                    </p>

                    <button
                        class="action-button ${accepted ? "accepted" : ""}"
                        type="button"
                        ${accepted ? "disabled" : ""}
                    >
                        ${
                            accepted
                                ? "CHALLENGE ACCEPTED ✓"
                                : escapeHTML(
                                    challenge.button_text ||
                                    "ACCEPT CHALLENGE"
                                )
                        }
                    </button>

                `;


                const button =
                    card.querySelector(
                        ".action-button"
                    );


                button.addEventListener(
                    "click",
                    function () {

                        acceptChallenge(
                            challenge,
                            button
                        );

                    }
                );


                grid.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================= */
    /* DECISION MAKERS RESOURCES */
    /* ========================================================= */


    function resourceSection() {

        let section =
            document.getElementById(
                "decision-makers-resources-section"
            );


        if (section) {
            return section;
        }


        const screen =
            document.getElementById(
                "decision-makers-screen"
            );


        if (!screen) {
            return null;
        }


        const footer =
            screen.querySelector(
                ".boss-footer"
            );


        section =
            document.createElement(
                "section"
            );


        section.id =
            "decision-makers-resources-section";


        section.className =
            "decision-section dm-resource-section";


        section.innerHTML = `

            <div class="decision-heading">

                <div>

                    <span class="decision-kicker">
                        KEEP BUILDING
                    </span>

                    <h2>
                        DECISION MAKER RESOURCES
                    </h2>

                </div>

                <span class="red-line"></span>

            </div>

            <p class="decision-section-copy">
                Tools designed to help you turn the decision into action.
            </p>

            <div
                id="decision-makers-resource-grid"
                class="dm-resource-grid"
            ></div>

        `;


        if (footer) {

            screen.insertBefore(
                section,
                footer
            );

        }
        else {

            screen.appendChild(
                section
            );

        }


        return section;

    }


    function safeFilename(
        text,
        extension
    ) {

        const clean =
            String(text || "decision-maker-resource")
                .trim()
                .replace(/[^a-z0-9]+/gi, "-")
                .replace(/^-+|-+$/g, "")
                .toLowerCase();


        return `${clean || "decision-maker-resource"}${extension}`;

    }


    async function downloadResource(
        resource,
        button
    ) {

        const url =
            String(
                resource.file_url || ""
            ).trim();


        if (!url) {
            return;
        }


        const originalText =
            button.textContent;


        button.disabled =
            true;


        button.textContent =
            "PREPARING DOWNLOAD...";


        try {

            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Download failed."
                );

            }


            const blob =
                await response.blob();


            const objectURL =
                URL.createObjectURL(
                    blob
                );


            const type =
                String(
                    resource.resource_type ||
                    ""
                ).toUpperCase();


            let extension =
                ".pdf";


            if (
                blob.type.includes("pdf") ||
                type.includes("PDF") ||
                type.includes("BOOK") ||
                type.includes("WORKBOOK") ||
                type.includes("GUIDE")
            ) {

                extension = ".pdf";

            }


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                objectURL;


            anchor.download =
                safeFilename(
                    resource.title,
                    extension
                );


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        objectURL
                    );

                },
                1000
            );


            button.textContent =
                "DOWNLOAD STARTED ✓";


            setTimeout(
                function () {

                    button.textContent =
                        originalText;

                    button.disabled =
                        false;

                },
                2000
            );

        }
        catch (error) {

            /*
            If the R2 CORS settings prevent
            JavaScript from fetching the PDF,
            fall back to opening the file directly.
            */

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );


            button.textContent =
                originalText;


            button.disabled =
                false;

        }

    }


    function renderResources() {

        const resources =
            sortItems(
                backendResources.filter(
                    function (item) {

                        return (
                            published(item) &&
                            String(
                                item.file_url || ""
                            ).trim()
                        );

                    }
                )
            );


        /*
        Do not show an empty Resources section.
        It appears only after a resource has
        been uploaded and published in Admin.
        */

        if (!resources.length) {

            const existing =
                document.getElementById(
                    "decision-makers-resources-section"
                );


            if (existing) {
                existing.remove();
            }


            return;

        }


        const section =
            resourceSection();


        if (!section) {
            return;
        }


        const grid =
            document.getElementById(
                "decision-makers-resource-grid"
            );


        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        resources.forEach(
            function (resource) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "dm-resource-card";


                const cover =
                    String(
                        resource.cover_image_url || ""
                    ).trim();


                card.innerHTML = `

                    ${
                        cover
                            ? `
                                <div class="dm-resource-cover">

                                    <img
                                        src="${escapeHTML(cover)}"
                                        alt="${escapeHTML(resource.title || "Decision Maker Resource")}"
                                    >

                                </div>
                            `
                            : `
                                <div class="dm-resource-cover dm-resource-cover-placeholder">

                                    <span>
                                        DECISION MAKERS
                                    </span>

                                    <strong>
                                        RESOURCE
                                    </strong>

                                </div>
                            `
                    }

                    <div class="dm-resource-content">

                        <span class="dm-resource-type">
                            ${escapeHTML(resource.resource_type || "RESOURCE")}
                        </span>

                        <h3>
                            ${escapeHTML(resource.title || "")}
                        </h3>

                        <p>
                            ${escapeHTML(resource.description || "")}
                        </p>

                        <button
                            class="dm-resource-download"
                            type="button"
                        >
                            ${escapeHTML(
                                resource.button_text ||
                                "DOWNLOAD FREE SAMPLE"
                            )}
                        </button>

                    </div>

                `;


                const button =
                    card.querySelector(
                        ".dm-resource-download"
                    );


                button.addEventListener(
                    "click",
                    function () {

                        downloadResource(
                            resource,
                            button
                        );

                    }
                );


                grid.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================= */
    /* STYLES */
    /* ========================================================= */


    function installStyles() {

        if (
            document.getElementById(
                "decision-makers-backend-styles"
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "decision-makers-backend-styles";


        style.textContent = `

            .dm-watch-session-button,
            .dm-resource-download {
                border: 1px solid #e32636;
                background: #e32636;
                color: #fff;
                font: inherit;
                font-size: 12px;
                font-weight: 900;
                letter-spacing: 1px;
                padding: 12px 16px;
                border-radius: 999px;
                cursor: pointer;
                margin-top: 10px;
            }


            .dm-watch-session-button:hover,
            .dm-resource-download:hover {
                transform: translateY(-1px);
            }


            .action-button.accepted {
                background: #f5c518;
                border-color: #f5c518;
                color: #000;
                opacity: 1;
            }


            #dm-session-player-overlay {
                position: fixed;
                inset: 0;
                z-index: 999999;
                background: rgba(0,0,0,.94);
                display: none;
                align-items: center;
                justify-content: center;
                padding: 18px;
            }


            #dm-session-player-overlay.show {
                display: flex;
            }


            .dm-session-player-shell {
                width: min(100%, 1000px);
                background: #090909;
                border: 1px solid #333;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 25px 80px rgba(0,0,0,.55);
            }


            .dm-session-player-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 18px 20px;
                border-bottom: 1px solid #222;
            }


            .dm-session-player-top span {
                display: block;
                color: #f5c518;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 2px;
                margin-bottom: 4px;
            }


            .dm-session-player-top h3 {
                color: #fff;
                margin: 0;
                font-size: 18px;
            }


            #dm-session-player-close {
                width: 42px;
                height: 42px;
                min-width: 42px;
                border-radius: 50%;
                border: 1px solid #444;
                background: #111;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
            }


            .dm-session-video-wrap {
                width: 100%;
                aspect-ratio: 16 / 9;
                background: #000;
            }


            .dm-session-video-wrap iframe {
                width: 100%;
                height: 100%;
                border: 0;
                display: block;
            }


            .dm-resource-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(230px, 1fr)
                    );
                gap: 18px;
                margin-top: 22px;
            }


            .dm-resource-card {
                overflow: hidden;
                border: 1px solid #2a2a2a;
                border-radius: 18px;
                background: #0b0b0b;
            }


            .dm-resource-cover {
                width: 100%;
                aspect-ratio: 4 / 5;
                background: #111;
                overflow: hidden;
            }


            .dm-resource-cover img {
                width: 100%;
                height: 100%;
                display: block;
                object-fit: cover;
            }


            .dm-resource-cover-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 25px;
                border-bottom: 1px solid #222;
            }


            .dm-resource-cover-placeholder span {
                color: #f5c518;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 2px;
            }


            .dm-resource-cover-placeholder strong {
                color: #fff;
                font-size: 28px;
                margin-top: 8px;
            }


            .dm-resource-content {
                padding: 18px;
            }


            .dm-resource-type {
                color: #f5c518;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 1.6px;
            }


            .dm-resource-content h3 {
                margin: 8px 0 8px;
                color: #fff;
                font-size: 20px;
            }


            .dm-resource-content p {
                color: #ccc;
                font-size: 14px;
                line-height: 1.5;
                margin: 0 0 6px;
            }


            .dm-resource-download {
                width: 100%;
                margin-top: 14px;
            }


            @media (max-width: 600px) {

                .dm-session-player-shell {
                    border-radius: 12px;
                }


                .dm-session-player-top {
                    padding: 14px;
                }


                .dm-session-player-top h3 {
                    font-size: 15px;
                }


                .dm-resource-grid {
                    grid-template-columns: 1fr;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ========================================================= */
    /* LOAD BACKEND CONTENT */
    /* ========================================================= */


    async function loadDecisionMakerBackend() {

        installStyles();


        const results =
            await Promise.allSettled([

                getData(
                    "/decision-maker-sessions"
                ),

                getData(
                    "/decision-maker-challenges"
                ),

                getData(
                    "/decision-maker-resources"
                )

            ]);


        if (
            results[0].status ===
            "fulfilled"
        ) {

            backendSessions =
                results[0].value;

            renderSessions();

        }


        if (
            results[1].status ===
            "fulfilled"
        ) {

            backendChallenges =
                results[1].value;

            renderChallenges();

        }


        if (
            results[2].status ===
            "fulfilled"
        ) {

            backendResources =
                results[2].value;

            renderResources();

        }


        if (
            results.some(
                result =>
                    result.status ===
                    "rejected"
            )
        ) {

            console.warn(
                "Some Decision Makers backend content could not be loaded."
            );

        }

    }


    /* ========================================================= */
    /* START */
    /* ========================================================= */


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadDecisionMakerBackend
        );

    }
    else {

        loadDecisionMakerBackend();

    }


})();