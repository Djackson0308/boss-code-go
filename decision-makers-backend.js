(() => {
    "use strict";

    /* ========================================================= */
    /* B.O.S.S CODE GO
       DECISION MAKERS RESOURCE BACKEND

       IMPORTANT:
       app.js now owns Decision Makers videos,
       focused sessions and Take Action challenges.

       This file owns ONLY Decision Maker resources.
       That prevents duplicate cards and duplicate controls.
    /* ========================================================= */

    const API =
        "https://boss-code-go-api.dezthareason4ever.workers.dev";

    let backendResources = [];

    /* ========================================================= */
    /* HELPERS */
    /* ========================================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
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

    function sortResources(items) {
        return [...items].sort((a, b) => {
            const featuredDifference =
                Number(b.featured ?? 0) -
                Number(a.featured ?? 0);

            if (featuredDifference !== 0) {
                return featuredDifference;
            }

            const sortDifference =
                Number(a.sort_order ?? 0) -
                Number(b.sort_order ?? 0);

            if (sortDifference !== 0) {
                return sortDifference;
            }

            return (
                Number(b.id ?? 0) -
                Number(a.id ?? 0)
            );
        });
    }

    async function getData(path) {
        const response =
            await fetch(
                `${API}${path}`,
                {
                    method: "GET",
                    cache: "no-store",
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

    function safeFilename(
        text,
        extension
    ) {
        const clean =
            String(
                text ||
                "decision-maker-resource"
            )
                .trim()
                .replace(/[^a-z0-9]+/gi, "-")
                .replace(/^-+|-+$/g, "")
                .toLowerCase();

        return `${
            clean ||
            "decision-maker-resource"
        }${extension}`;
    }

    function resourceExtension(
        resource,
        blob
    ) {
        const type =
            String(
                resource.resource_type ||
                ""
            ).toUpperCase();

        const url =
            String(
                resource.file_url ||
                ""
            );

        const urlMatch =
            url.match(
                /\.([a-z0-9]{2,6})(?:[?#].*)?$/i
            );

        if (urlMatch) {
            return `.${urlMatch[1].toLowerCase()}`;
        }

        if (
            blob?.type?.includes("pdf") ||
            type.includes("PDF") ||
            type.includes("BOOK") ||
            type.includes("WORKBOOK") ||
            type.includes("GUIDE")
        ) {
            return ".pdf";
        }

        return ".pdf";
    }

    /* ========================================================= */
    /* RESOURCE SECTION */
    /* ========================================================= */

    function removeLegacyDuplicateResourceSections() {
        const sections =
            [
                ...document.querySelectorAll(
                    "#decision-makers-resources-section"
                )
            ];

        if (sections.length <= 1) {
            return;
        }

        sections
            .slice(1)
            .forEach(
                section =>
                    section.remove()
            );
    }

    function resourceSection() {
        removeLegacyDuplicateResourceSections();

        let section =
            document.getElementById(
                "decision-makers-resources-section"
            );

        if (section) {
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

    /* ========================================================= */
    /* RESOURCE DOWNLOAD */
    /* ========================================================= */

    async function downloadResource(
        resource,
        button
    ) {
        const url =
            String(
                resource.file_url ||
                ""
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
                await fetch(
                    url,
                    {
                        cache: "no-store"
                    }
                );

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

            const anchor =
                document.createElement(
                    "a"
                );

            anchor.href =
                objectURL;

            anchor.download =
                safeFilename(
                    resource.title,
                    resourceExtension(
                        resource,
                        blob
                    )
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
            Some direct file hosts do not allow
            browser fetch because of CORS.
            In that case use the actual file URL.
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
        /* ========================================================= */
    /* RESOURCE RENDERER */
    /* ========================================================= */

    function renderResources() {
        const resources =
            sortResources(
                backendResources.filter(
                    function (item) {
                        return (
                            published(item) &&
                            String(
                                item.file_url ||
                                ""
                            ).trim()
                        );
                    }
                )
            );

        /*
        No published resources means no empty
        resource section should be visible.
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

                card.dataset.resourceId =
                    String(
                        resource.id ??
                        ""
                    );

                const cover =
                    String(
                        resource.cover_image_url ||
                        ""
                    ).trim();

                const resourceType =
                    resource.resource_type ||
                    "RESOURCE";

                const title =
                    resource.title ||
                    "DECISION MAKER RESOURCE";

                const description =
                    resource.description ||
                    "";

                const buttonText =
                    resource.button_text ||
                    "DOWNLOAD FREE SAMPLE";

                card.innerHTML = `
                    ${
                        cover
                            ? `
                                <div class="dm-resource-cover">

                                    <img
                                        src="${escapeHTML(cover)}"
                                        alt="${escapeHTML(title)}"
                                    >

                                </div>
                            `
                            : `
                                <div
                                    class="
                                        dm-resource-cover
                                        dm-resource-cover-placeholder
                                    "
                                >

                                    <span>
                                        DECISION MAKERS
                                    </span>

                                    <strong>
                                        RESOURCE
                                    </strong>

                                    <small>
                                        GREATNESS IS A DECISION
                                    </small>

                                </div>
                            `
                    }

                    <div class="dm-resource-content">

                        <span class="dm-resource-type">
                            ${escapeHTML(resourceType)}
                        </span>

                        <h3>
                            ${escapeHTML(title)}
                        </h3>

                        ${
                            description
                                ? `
                                    <p>
                                        ${escapeHTML(description)}
                                    </p>
                                `
                                : ""
                        }

                        <button
                            class="dm-resource-download"
                            type="button"
                            data-resource-id="${escapeHTML(
                                resource.id ??
                                ""
                            )}"
                        >
                            ${escapeHTML(buttonText)}
                        </button>

                    </div>
                `;

                const button =
                    card.querySelector(
                        ".dm-resource-download"
                    );

                if (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            downloadResource(
                                resource,
                                button
                            );
                        }
                    );
                }

                grid.appendChild(
                    card
                );
            }
        );

        /*
        app.js keeps RETURN TO HOME immediately
        above the company footer.

        Because this resource section is created
        dynamically, move that existing button
        back to its proper position afterward.
        */

        const screen =
            document.getElementById(
                "decision-makers-screen"
            );

        const footer =
            screen?.querySelector(
                ".boss-footer"
            );

        const returnHome =
            screen?.querySelector(
                ".boss-return-home-bottom"
            );

        if (
            footer &&
            returnHome
        ) {
            footer.insertAdjacentElement(
                "beforebegin",
                returnHome
            );
        }
    }


    /* ========================================================= */
    /* B.O.S.S CODE RESOURCE STYLES */
    /* ========================================================= */

    function installStyles() {
        const existing =
            document.getElementById(
                "decision-makers-backend-styles"
            );

        if (existing) {
            existing.remove();
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "decision-makers-backend-styles";

        style.textContent = `

            /* ==============================================
               RESOURCE SECTION
            ============================================== */

            .dm-resource-section {
                width: 100%;
                max-width: 1100px;
                margin-left: auto;
                margin-right: auto;
            }


            .dm-resource-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(240px, 1fr)
                    );
                gap: 22px;
                margin-top: 24px;
            }


            /* ==============================================
               RESOURCE CARD
            ============================================== */

            .dm-resource-card {
                position: relative;
                overflow: hidden;

                background:
                    linear-gradient(
                        145deg,
                        #101010,
                        #050505
                    );

                border:
                    2px solid #F5C518;

                border-radius:
                    20px;

                box-shadow:
                    0 18px 45px
                    rgba(
                        0,
                        0,
                        0,
                        .35
                    );

                color:
                    #fff;
            }


            .dm-resource-card::before {
                content: "";

                position:
                    absolute;

                left:
                    0;

                top:
                    0;

                width:
                    100%;

                height:
                    4px;

                background:
                    #F5C518;

                z-index:
                    2;
            }


            /* ==============================================
               COVER
            ============================================== */

            .dm-resource-cover {
                width:
                    100%;

                aspect-ratio:
                    4 / 5;

                background:
                    #050505;

                overflow:
                    hidden;

                border-bottom:
                    1px solid #282828;
            }


            .dm-resource-cover img {
                display:
                    block;

                width:
                    100%;

                height:
                    100%;

                object-fit:
                    cover;
            }


            .dm-resource-cover-placeholder {
                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                text-align:
                    center;

                padding:
                    30px;

                background:
                    radial-gradient(
                        circle at center,
                        rgba(
                            245,
                            197,
                            24,
                            .12
                        ),
                        transparent 65%
                    ),
                    #050505;
            }


            .dm-resource-cover-placeholder span {
                color:
                    #F5C518;

                font-size:
                    11px;

                font-weight:
                    900;

                letter-spacing:
                    2px;
            }


            .dm-resource-cover-placeholder strong {
                margin-top:
                    10px;

                color:
                    #fff;

                font-size:
                    30px;

                font-weight:
                    900;

                letter-spacing:
                    1px;
            }


            .dm-resource-cover-placeholder small {
                margin-top:
                    12px;

                color:
                    #777;

                font-size:
                    8px;

                font-weight:
                    900;

                letter-spacing:
                    1.5px;
            }


            /* ==============================================
               RESOURCE CONTENT
            ============================================== */

            .dm-resource-content {
                padding:
                    20px;
            }


            .dm-resource-type {
                display:
                    block;

                color:
                    #F5C518;

                font-size:
                    9px;

                font-weight:
                    900;

                letter-spacing:
                    1.8px;

                margin-bottom:
                    7px;
            }


            .dm-resource-content h3 {
                margin:
                    0 0 9px;

                color:
                    #fff;

                font-size:
                    21px;

                line-height:
                    1.2;
            }


            .dm-resource-content p {
                margin:
                    0;

                color:
                    #aaa;

                font-size:
                    13px;

                line-height:
                    1.55;
            }


            /* ==============================================
               YELLOW + BLACK DOWNLOAD BUTTON
            ============================================== */

            .dm-resource-download {
                display:
                    block;

                width:
                    100%;

                min-height:
                    48px;

                margin-top:
                    18px;

                padding:
                    12px 18px;

                border:
                    2px solid #F5C518;

                border-radius:
                    999px;

                background:
                    #F5C518;

                color:
                    #000;

                font:
                    inherit;

                font-size:
                    11px;

                font-weight:
                    900;

                letter-spacing:
                    1px;

                cursor:
                    pointer;

                transition:
                    transform .16s ease,
                    background .16s ease,
                    color .16s ease;
            }


            .dm-resource-download:hover {
                transform:
                    translateY(-1px);

                background:
                    #000;

                color:
                    #F5C518;
            }


            .dm-resource-download:active {
                transform:
                    scale(.985);
            }


            .dm-resource-download:disabled {
                cursor:
                    wait;

                opacity:
                    .75;
            }


            /* ==============================================
               MOBILE
            ============================================== */

            @media (
                max-width: 700px
            ) {

                .dm-resource-grid {
                    grid-template-columns:
                        1fr;

                    gap:
                        18px;
                }


                .dm-resource-card {
                    width:
                        100%;
                }


                .dm-resource-content {
                    padding:
                        18px;
                }


                .dm-resource-content h3 {
                    font-size:
                        19px;
                }


                .dm-resource-download {
                    min-height:
                        50px;

                    font-size:
                        10px;
                }

            }

        `;

        document.head.appendChild(
            style
        );
    }


    /* ========================================================= */
    /* LOAD RESOURCE CONTENT */
    /* ========================================================= */

    async function loadDecisionMakerResources() {
        installStyles();

        try {
            backendResources =
                await getData(
                    "/decision-maker-resources"
                );

            renderResources();

            console.info(
                "Decision Makers resources loaded."
            );
        }
        catch (error) {
            console.warn(
                "Decision Makers resources could not be loaded.",
                error
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
            loadDecisionMakerResources
        );
    }
    else {
        loadDecisionMakerResources();
    }

})();