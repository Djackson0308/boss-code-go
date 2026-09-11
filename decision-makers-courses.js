(() => {
    "use strict";

    /* =========================================================
       B.O.S.S CODE GO
       DECISION MAKERS COURSES

       PURPOSE:
       This file owns the public Decision Makers course catalog,
       public course sales screen and Stripe checkout handoff.

       It does NOT own:
       - Decision Makers videos
       - Focused sessions
       - Take Action challenges
       - Free Decision Maker resources
       - Payment confirmation
       - Course entitlement creation
       - Saved progress

       Stripe confirmation, course access and progress remain
       protected backend systems.
    ========================================================= */

    const API =
        "https://boss-code-go-api.dezthareason4ever.workers.dev";

    const COURSE_EMAIL_KEY =
        "boss-code-dm-course-email-v1";

    const COURSE_PENDING_CHECKOUT_KEY =
        "boss-code-dm-course-pending-checkout-v1";

    let checkoutReturnHandled = false;

    let courses = [];

    let activeCourse = null;

    let activeCourseData = null;

    let activeDayId = null;

    let placementObserver = null;


    /* =========================================================
       HELPERS
    ========================================================= */

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
            item?.published === undefined ||
            item?.published === null
        ) {
            return true;
        }

        return Number(item.published) === 1;
    }


    function sortCourses(items) {
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
                Number(a.id ?? 0) -
                Number(b.id ?? 0)
            );
        });
    }


    function sortPhases(items) {
        return [...items].sort((a, b) => {

            const sortDifference =
                Number(a.sort_order ?? 0) -
                Number(b.sort_order ?? 0);

            if (sortDifference !== 0) {
                return sortDifference;
            }

            return (
                Number(a.id ?? 0) -
                Number(b.id ?? 0)
            );
        });
    }


    function sortDays(items) {
        return [...items].sort((a, b) => {

            const dayDifference =
                Number(a.day_number ?? 0) -
                Number(b.day_number ?? 0);

            if (dayDifference !== 0) {
                return dayDifference;
            }


            const sortDifference =
                Number(a.sort_order ?? 0) -
                Number(b.sort_order ?? 0);

            if (sortDifference !== 0) {
                return sortDifference;
            }


            return (
                Number(a.id ?? 0) -
                Number(b.id ?? 0)
            );
        });
    }


    function formatPrice(priceCents) {

        const cents =
            Number(priceCents || 0);

        if (!cents) {
            return "FREE";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD"
            }
        ).format(
            cents / 100
        );
    }


    function hasValue(value) {
        return String(
            value ?? ""
        ).trim().length > 0;
    }


    async function apiGet(path) {

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


        let json = null;


        try {
            json =
                await response.json();
        }
        catch (error) {

            throw new Error(
                `Server response could not be read.`
            );
        }


        if (!response.ok) {

            throw new Error(
                json?.error ||
                `Request failed: ${response.status}`
            );
        }


        if (
            json &&
            Object.prototype.hasOwnProperty.call(
                json,
                "data"
            )
        ) {
            return json.data;
        }


        return json;
    }


    function validEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            String(value || "")
                .trim()
                .toLowerCase()
        );
    }


    function savedCourseEmail() {

        try {
            return String(
                localStorage.getItem(
                    COURSE_EMAIL_KEY
                ) || ""
            )
                .trim()
                .toLowerCase();
        }
        catch (error) {
            return "";
        }
    }


    function saveCourseEmail(email) {

        const value =
            String(email || "")
                .trim()
                .toLowerCase();

        if (!validEmail(value)) {
            return;
        }

        try {
            localStorage.setItem(
                COURSE_EMAIL_KEY,
                value
            );
        }
        catch (error) {
            /* local storage is optional */
        }
    }


    function savePendingCourseCheckout(data) {

        try {
            localStorage.setItem(
                COURSE_PENDING_CHECKOUT_KEY,
                JSON.stringify({
                    ...data,
                    created_at: Date.now()
                })
            );
        }
        catch (error) {
            /* local storage is optional */
        }
    }


    function pendingCourseCheckout() {

        try {
            const raw =
                localStorage.getItem(
                    COURSE_PENDING_CHECKOUT_KEY
                );

            if (!raw) {
                return null;
            }

            const data = JSON.parse(raw);

            if (
                !data ||
                !Number(data.created_at) ||
                Date.now() - Number(data.created_at) >
                    1000 * 60 * 60 * 6
            ) {
                localStorage.removeItem(
                    COURSE_PENDING_CHECKOUT_KEY
                );
                return null;
            }

            return data;
        }
        catch (error) {
            return null;
        }
    }


    function clearPendingCourseCheckout() {

        try {
            localStorage.removeItem(
                COURSE_PENDING_CHECKOUT_KEY
            );
        }
        catch (error) {
            /* ignore */
        }
    }


    async function apiPost(path, body) {

        const response =
            await fetch(
                `${API}${path}`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body || {})
                }
            );

        let json = null;

        try {
            json = await response.json();
        }
        catch (error) {
            throw new Error(
                "Server response could not be read."
            );
        }

        if (!response.ok) {
            throw new Error(
                json?.error ||
                `Request failed: ${response.status}`
            );
        }

        return json;
    }


    function sleep(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }


    async function waitForCoursePayment(sessionId) {

        let last = null;

        for (
            let attempt = 0;
            attempt < 12;
            attempt += 1
        ) {
            last = await apiGet(
                `/payments/session/${encodeURIComponent(sessionId)}`
            );

            if (last?.order_type !== "course") {
                return last;
            }

            const status =
                String(last?.status || "")
                    .toLowerCase();

            if (
                status === "paid" ||
                status === "failed" ||
                status === "canceled"
            ) {
                return last;
            }

            await sleep(1100);
        }

        return last;
    }


    function courseById(courseId) {

        return courses.find(
            item =>
                Number(item.id) ===
                Number(courseId)
        ) || null;
    }


    function setPurchaseStatus(message, type = "") {

        const box =
            document.getElementById(
                "dm-course-purchase-status"
            );

        if (!box) {
            return;
        }

        box.className =
            `dm-course-purchase-status ${type}`
                .trim();

        box.textContent = message || "";
    }


    async function beginCourseCheckout(courseId) {

        const course =
            courseById(courseId) ||
            activeCourse;

        if (!course) {
            setPurchaseStatus(
                "COURSE COULD NOT BE FOUND.",
                "error"
            );
            return;
        }

        const amountCents =
            Number(course.price_cents || 0);

        if (amountCents <= 0) {
            setPurchaseStatus(
                "THIS COURSE DOES NOT REQUIRE A PAID CHECKOUT.",
                "error"
            );
            return;
        }

        const name =
            String(
                document.getElementById(
                    "dm-course-purchase-name"
                )?.value || ""
            ).trim();

        const email =
            String(
                document.getElementById(
                    "dm-course-purchase-email"
                )?.value || ""
            )
                .trim()
                .toLowerCase();

        if (!name) {
            setPurchaseStatus(
                "ENTER YOUR NAME.",
                "error"
            );
            return;
        }

        if (!validEmail(email)) {
            setPurchaseStatus(
                "ENTER A VALID EMAIL ADDRESS.",
                "error"
            );
            return;
        }

        saveCourseEmail(email);

        const button =
            document.getElementById(
                "dm-course-purchase-button"
            );

        const originalText =
            button?.textContent ||
            "SECURE CHECKOUT";

        if (button) {
            button.disabled = true;
            button.textContent =
                "OPENING SECURE CHECKOUT...";
        }

        setPurchaseStatus(
            "CONNECTING TO STRIPE..."
        );

        try {
            const result =
                await apiPost(
                    "/payments/checkout/course",
                    {
                        course_id: Number(course.id),
                        name,
                        email
                    }
                );

            if (
                !result?.checkout_url ||
                !result?.stripe_session_id
            ) {
                throw new Error(
                    "Secure checkout did not return a Stripe session."
                );
            }

            savePendingCourseCheckout({
                course_id: Number(course.id),
                course_title: course.title || "",
                email,
                name,
                stripe_session_id:
                    result.stripe_session_id
            });

            window.location.href =
                result.checkout_url;
        }
        catch (error) {
            console.warn(
                "Decision Makers course checkout could not start.",
                error
            );

            setPurchaseStatus(
                error.message ||
                "SECURE CHECKOUT COULD NOT START.",
                "error"
            );

            if (button) {
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    }


    function showCoursePaymentBanner(
        title,
        message,
        type = "success"
    ) {

        const screen =
            document.getElementById(
                "decision-makers-screen"
            );

        if (!screen) {
            return null;
        }

        let banner =
            document.getElementById(
                "dm-course-payment-banner"
            );

        if (!banner) {
            banner =
                document.createElement(
                    "section"
                );

            banner.id =
                "dm-course-payment-banner";

            banner.className =
                "decision-section dm-course-payment-banner";

            const header =
                screen.querySelector(
                    ".decision-header"
                );

            if (header) {
                header.insertAdjacentElement(
                    "afterend",
                    banner
                );
            }
            else {
                screen.prepend(banner);
            }
        }

        banner.className =
            `decision-section dm-course-payment-banner ${type}`;

        banner.innerHTML = `
            <span>
                ${escapeHTML(title)}
            </span>

            <h2>
                ${escapeHTML(message)}
            </h2>

            <button
                id="dm-course-payment-go"
                type="button"
            >
                GO TO MY COURSES
            </button>
        `;

        const button =
            banner.querySelector(
                "#dm-course-payment-go"
            );

        if (button) {
            button.addEventListener(
                "click",
                function () {
                    const target =
                        document.getElementById(
                            "decision-makers-my-courses"
                        ) ||
                        document.getElementById(
                            "decision-makers-courses-section"
                        );

                    target?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        }

        return banner;
    }


    function prefillMyCoursesEmail(email) {

        if (!validEmail(email)) {
            return;
        }

        saveCourseEmail(email);

        const input =
            document.getElementById(
                "dm-course-email"
            );

        if (input) {
            input.value = email;
        }
    }


    async function handleCheckoutReturn() {

        if (checkoutReturnHandled) {
            return;
        }

        checkoutReturnHandled = true;

        const params =
            new URLSearchParams(
                window.location.search
            );

        const checkout =
            String(
                params.get("checkout") || ""
            ).toLowerCase();

        const pending =
            pendingCourseCheckout();

        if (
            checkout === "cancel" &&
            pending?.course_id
        ) {
            const course =
                courseById(
                    pending.course_id
                );

            if (course) {
                openCourse(course.id);

                setTimeout(
                    function () {
                        setPurchaseStatus(
                            "CHECKOUT CANCELED. NO COURSE PAYMENT WAS COMPLETED.",
                            "error"
                        );
                    },
                    50
                );
            }

            return;
        }

        if (checkout !== "success") {
            return;
        }

        const sessionId =
            String(
                params.get("session_id") || ""
            ).trim();

        if (!sessionId) {
            return;
        }

        let payment = null;

        try {
            payment =
                await waitForCoursePayment(
                    sessionId
                );
        }
        catch (error) {
            console.warn(
                "Course payment return could not be checked.",
                error
            );
            return;
        }

        if (payment?.order_type !== "course") {
            return;
        }

        activateScreen(
            "decision-makers-screen"
        );

        const email =
            String(
                pending?.email ||
                savedCourseEmail() ||
                ""
            )
                .trim()
                .toLowerCase();

        if (email) {
            prefillMyCoursesEmail(email);
        }

        const status =
            String(payment?.status || "")
                .toLowerCase();

        if (status === "paid") {
            showCoursePaymentBanner(
                "PAYMENT COMPLETE",
                email
                    ? `YOUR COURSE IS READY. SIGN IN WITH ${email} TO BEGIN.`
                    : "YOUR COURSE IS READY. SIGN IN UNDER MY COURSES TO BEGIN.",
                "success"
            );

            clearPendingCourseCheckout();

            setTimeout(
                function () {
                    document.getElementById(
                        "dm-course-payment-banner"
                    )?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                },
                100
            );

            return;
        }

        if (
            status === "failed" ||
            status === "canceled"
        ) {
            showCoursePaymentBanner(
                "PAYMENT NOT COMPLETED",
                "YOUR COURSE ACCESS WAS NOT CHARGED.",
                "error"
            );
            return;
        }

        showCoursePaymentBanner(
            "PAYMENT RECEIVED",
            "STRIPE IS STILL FINALIZING YOUR COURSE ACCESS. CHECK MY COURSES AGAIN IN A MOMENT.",
            "processing"
        );
    }


    function stopMedia() {

        document
            .querySelectorAll(
                "#decision-maker-course-screen audio, " +
                "#decision-maker-course-screen video"
            )
            .forEach(
                media => {
                    try {
                        media.pause();
                    }
                    catch (error) {
                        /* ignore */
                    }
                }
            );
    }


    /* =========================================================
       COURSE SECTION
    ========================================================= */

    function createCourseSection() {

        let section =
            document.getElementById(
                "decision-makers-courses-section"
            );


        if (section) {
            return section;
        }


        section =
            document.createElement(
                "section"
            );


        section.id =
            "decision-makers-courses-section";


        section.className =
            "decision-section dm-courses-section";


        section.innerHTML = `

            <div class="decision-heading">

                <div>

                    <span class="decision-kicker">
                        TAKE THE NEXT STEP
                    </span>

                    <h2>
                        DECISION MAKERS COURSES
                    </h2>

                </div>

                <span class="red-line"></span>

            </div>


            <p class="decision-section-copy">
                Interactive Decision Maker experiences designed
                to help you move from decision to execution.
            </p>


            <div
                id="dm-course-message"
                class="dm-course-message"
            >
                LOADING COURSES...
            </div>


            <div
                id="dm-course-grid"
                class="dm-course-grid"
            ></div>
        `;


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


    function placeCourseSection() {

        const screen =
            document.getElementById(
                "decision-makers-screen"
            );


        const section =
            document.getElementById(
                "decision-makers-courses-section"
            );


        if (
            !screen ||
            !section
        ) {
            return;
        }


        /*
           If the free Decision Maker resource section exists,
           paid courses stay AFTER the free resources.
        */

        const resourceSection =
            document.getElementById(
                "decision-makers-resources-section"
            );


        if (resourceSection) {

            if (
                resourceSection.nextElementSibling !==
                section
            ) {

                resourceSection.insertAdjacentElement(
                    "afterend",
                    section
                );
            }

            return;
        }


        /*
           Until resources finish loading, keep courses
           immediately above the footer.
        */

        const footer =
            screen.querySelector(
                ".boss-footer"
            );


        if (
            footer &&
            section.nextElementSibling !== footer
        ) {

            screen.insertBefore(
                section,
                footer
            );
        }
    }


    function watchSectionPlacement() {

        const screen =
            document.getElementById(
                "decision-makers-screen"
            );


        if (!screen) {
            return;
        }


        if (placementObserver) {
            placementObserver.disconnect();
        }


        placementObserver =
            new MutationObserver(
                function () {
                    placeCourseSection();
                }
            );


        placementObserver.observe(
            screen,
            {
                childList: true
            }
        );
    }


    /* =========================================================
       COURSE CARDS
    ========================================================= */

    function renderCourses() {

        createCourseSection();

        placeCourseSection();


        const grid =
            document.getElementById(
                "dm-course-grid"
            );


        const message =
            document.getElementById(
                "dm-course-message"
            );


        if (
            !grid ||
            !message
        ) {
            return;
        }


        const visibleCourses =
            sortCourses(
                courses.filter(
                    item =>
                        published(item)
                )
            );


        if (!visibleCourses.length) {

            grid.innerHTML =
                "";


            message.style.display =
                "block";


            message.textContent =
                "NEW DECISION MAKER COURSES ARE COMING SOON.";


            return;
        }


        message.style.display =
            "none";


        grid.innerHTML =
            visibleCourses
                .map(
                    course => {

                        const cover =
                            String(
                                course.cover_url || ""
                            ).trim();


                        const title =
                            course.title ||
                            "DECISION MAKER COURSE";


                        const subtitle =
                            course.subtitle || "";


                        const description =
                            course.description || "";


                        const price =
                            formatPrice(
                                course.price_cents
                            );


                        const totalDays =
                            Number(
                                course.total_days || 0
                            );


                        return `

                            <article
                                class="dm-course-card"
                                data-course-id="${Number(course.id)}"
                            >

                                ${
                                    cover
                                        ? `
                                            <div class="dm-course-cover">

                                                <img
                                                    src="${escapeHTML(cover)}"
                                                    alt="${escapeHTML(title)}"
                                                >

                                            </div>
                                        `
                                        : `
                                            <div
                                                class="
                                                    dm-course-cover
                                                    dm-course-cover-placeholder
                                                "
                                            >

                                                <span>
                                                    DECISION MAKERS
                                                </span>

                                                <strong>
                                                    ${escapeHTML(title)}
                                                </strong>

                                                ${
                                                    subtitle
                                                        ? `
                                                            <small>
                                                                ${escapeHTML(subtitle)}
                                                            </small>
                                                        `
                                                        : `
                                                            <small>
                                                                GREATNESS IS A DECISION
                                                            </small>
                                                        `
                                                }

                                            </div>
                                        `
                                }


                                <div class="dm-course-card-body">

                                    <div class="dm-course-card-topline">

                                        <span>
                                            DECISION MAKERS COURSE
                                        </span>

                                        ${
                                            Number(course.featured) === 1
                                                ? `
                                                    <strong>
                                                        FEATURED
                                                    </strong>
                                                `
                                                : ""
                                        }

                                    </div>


                                    <h3>
                                        ${escapeHTML(title)}
                                    </h3>


                                    ${
                                        subtitle
                                            ? `
                                                <h4>
                                                    ${escapeHTML(subtitle)}
                                                </h4>
                                            `
                                            : ""
                                    }


                                    ${
                                        description
                                            ? `
                                                <p>
                                                    ${escapeHTML(description)}
                                                </p>
                                            `
                                            : ""
                                    }


                                    <div class="dm-course-card-meta">

                                        <span>
                                            ${
                                                totalDays
                                                    ? `${totalDays} DAYS`
                                                    : "INTERACTIVE COURSE"
                                            }
                                        </span>

                                        <strong>
                                            ${escapeHTML(price)}
                                        </strong>

                                    </div>


                                    <button
                                        class="dm-course-view-button"
                                        type="button"
                                        data-course-id="${Number(course.id)}"
                                    >
                                        VIEW COURSE
                                    </button>

                                </div>

                            </article>
                        `;
                    }
                )
                .join("");


        grid
            .querySelectorAll(
                ".dm-course-view-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const id =
                                Number(
                                    button.dataset.courseId
                                );


                            openCourse(
                                id
                            );
                        }
                    );
                }
            );
    }


    /* =========================================================
       COURSE PLAYER SCREEN
    ========================================================= */

    function createCoursePlayerScreen() {

        let screen =
            document.getElementById(
                "decision-maker-course-screen"
            );


        if (screen) {
            return screen;
        }


        screen =
            document.createElement(
                "div"
            );


        screen.id =
            "decision-maker-course-screen";


        screen.className =
            "screen dm-course-player-screen";


        screen.innerHTML = `

            <div class="dm-course-player-wrap">

                <button
                    id="dm-course-back"
                    class="back-button dm-course-back"
                    type="button"
                >
                    ← DECISION MAKERS
                </button>


                <div
                    id="dm-course-player-loading"
                    class="dm-course-player-loading"
                >
                    LOADING COURSE...
                </div>


                <div
                    id="dm-course-player-content"
                ></div>


                <footer class="boss-footer dm-course-footer">

                    <img
                        src="images/boss-code-media-logo.png"
                        alt="B.O.S.S CODE MEDIA"
                    >

                    <p>
                        GREATNESS IS A DECISION
                    </p>

                </footer>

            </div>
        `;


        document.body.appendChild(
            screen
        );


        const backButton =
            screen.querySelector(
                "#dm-course-back"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                closeCourse
            );
        }


        return screen;
    }


    function activateScreen(screenId) {

        document
            .querySelectorAll(
                ".screen"
            )
            .forEach(
                screen => {

                    screen.classList.remove(
                        "active-screen"
                    );
                }
            );


        const target =
            document.getElementById(
                screenId
            );


        if (target) {

            target.classList.add(
                "active-screen"
            );
        }


        window.scrollTo(
            {
                top: 0,
                behavior: "instant"
            }
        );
    }


    function closeCourse() {

        stopMedia();


        activeCourse =
            null;


        activeCourseData =
            null;


        activeDayId =
            null;


        activateScreen(
            "decision-makers-screen"
        );


        setTimeout(
            function () {

                const section =
                    document.getElementById(
                        "decision-makers-courses-section"
                    );


                if (section) {

                    section.scrollIntoView(
                        {
                            behavior: "smooth",
                            block: "start"
                        }
                    );
                }
            },
            50
        );
    }


    async function openCourse(courseId) {

        const course = courseById(courseId);

        if (!course) {
            return;
        }

        activeCourse = course;
        activeCourseData = null;
        activeDayId = null;

        createCoursePlayerScreen();

        const loading =
            document.getElementById(
                "dm-course-player-loading"
            );

        const content =
            document.getElementById(
                "dm-course-player-content"
            );

        if (loading) {
            loading.style.display = "none";
        }

        if (!content) {
            return;
        }

        const cover =
            String(course.cover_url || "")
                .trim();

        const title =
            course.title ||
            "DECISION MAKER COURSE";

        const subtitle =
            course.subtitle || "";

        const description =
            course.description || "";

        const price =
            formatPrice(
                course.price_cents
            );

        const totalDays =
            Number(
                course.total_days || 0
            );

        const savedEmail =
            savedCourseEmail();

        content.innerHTML = `

            <section class="dm-course-hero">

                <div class="dm-course-hero-cover">

                    ${
                        cover
                            ? `
                                <img
                                    src="${escapeHTML(cover)}"
                                    alt="${escapeHTML(title)}"
                                >
                            `
                            : `
                                <div class="dm-course-hero-placeholder">

                                    <span>
                                        DECISION MAKERS
                                    </span>

                                    <strong>
                                        ${escapeHTML(title)}
                                    </strong>

                                    <small>
                                        ${
                                            subtitle
                                                ? escapeHTML(subtitle)
                                                : "GREATNESS IS A DECISION"
                                        }
                                    </small>

                                </div>
                            `
                    }

                </div>


                <div class="dm-course-hero-content">

                    <span class="dm-course-eyebrow">
                        DECISION MAKERS COURSE
                    </span>


                    <h1>
                        ${escapeHTML(title)}
                    </h1>


                    ${
                        subtitle
                            ? `
                                <h2>
                                    ${escapeHTML(subtitle)}
                                </h2>
                            `
                            : ""
                    }


                    ${
                        description
                            ? `
                                <p>
                                    ${escapeHTML(description)}
                                </p>
                            `
                            : ""
                    }


                    <div class="dm-course-hero-stats">

                        <div>

                            <span>
                                COURSE LENGTH
                            </span>

                            <strong>
                                ${
                                    totalDays
                                        ? `${totalDays} DAYS`
                                        : "DECISION MAKERS"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                COURSE PRICE
                            </span>

                            <strong>
                                ${escapeHTML(price)}
                            </strong>

                        </div>

                    </div>


                    ${
                        Number(course.price_cents || 0) > 0
                            ? `
                                <div class="dm-course-purchase-panel">

                                    <span class="dm-course-purchase-kicker">
                                        SECURE COURSE ACCESS
                                    </span>

                                    <h3>
                                        GET THE COURSE
                                    </h3>

                                    <p>
                                        Enter your name and the email you want connected to your Decision Makers access.
                                    </p>

                                    <div class="dm-course-purchase-fields">

                                        <label>

                                            <span>
                                                YOUR NAME
                                            </span>

                                            <input
                                                id="dm-course-purchase-name"
                                                type="text"
                                                autocomplete="name"
                                                placeholder="Your name"
                                            >

                                        </label>


                                        <label>

                                            <span>
                                                ACCOUNT EMAIL
                                            </span>

                                            <input
                                                id="dm-course-purchase-email"
                                                type="email"
                                                autocomplete="email"
                                                placeholder="you@example.com"
                                                value="${escapeHTML(savedEmail)}"
                                            >

                                        </label>

                                    </div>


                                    <button
                                        id="dm-course-purchase-button"
                                        type="button"
                                        data-course-id="${Number(course.id)}"
                                    >
                                        SECURE CHECKOUT
                                    </button>


                                    <div
                                        id="dm-course-purchase-status"
                                        class="dm-course-purchase-status"
                                        aria-live="polite"
                                    ></div>


                                    <small class="dm-course-purchase-note">
                                        Payment is completed securely through Stripe. Course access is connected to the email used at checkout.
                                    </small>

                                </div>
                            `
                            : `
                                <div class="dm-course-free-panel">

                                    <strong>
                                        FREE COURSE
                                    </strong>

                                    <p>
                                        Sign in under My Courses with your Decision Makers email to begin.
                                    </p>

                                </div>
                            `
                    }

                </div>

            </section>


            <section class="dm-course-sales-detail">

                <div class="dm-course-section-heading">

                    <span>
                        MAKE THE DECISION
                    </span>

                    <h2>
                        START YOUR COURSE
                    </h2>

                </div>


                <p>
                    ${
                        description
                            ? escapeHTML(description)
                            : "This Decision Makers course is built to help you move from decision to execution."
                    }
                </p>

            </section>
        `;

        const purchaseButton =
            document.getElementById(
                "dm-course-purchase-button"
            );

        if (purchaseButton) {
            purchaseButton.addEventListener(
                "click",
                function () {
                    beginCourseCheckout(
                        Number(
                            purchaseButton.dataset.courseId
                        )
                    );
                }
            );
        }

        const emailInput =
            document.getElementById(
                "dm-course-purchase-email"
            );

        if (emailInput) {
            emailInput.addEventListener(
                "keydown",
                function (event) {
                    if (event.key === "Enter") {
                        beginCourseCheckout(
                            Number(course.id)
                        );
                    }
                }
            );
        }

        activateScreen(
            "decision-maker-course-screen"
        );
    }


    /* =========================================================
       FULL COURSE RENDERER
    ========================================================= */

    function renderCoursePlayer(data) {

        const loading =
            document.getElementById(
                "dm-course-player-loading"
            );


        const content =
            document.getElementById(
                "dm-course-player-content"
            );


        if (!content) {
            return;
        }


        if (loading) {

            loading.style.display =
                "none";
        }


        const course =
            data?.course ||
            activeCourse ||
            {};


        const phases =
            sortPhases(
                Array.isArray(data?.phases)
                    ? data.phases
                    : []
            );


        const unassignedDays =
            sortDays(
                Array.isArray(
                    data?.unassigned_days
                )
                    ? data.unassigned_days
                    : []
            );


        const cover =
            String(
                course.cover_url || ""
            ).trim();


        const title =
            course.title ||
            "DECISION MAKER COURSE";


        const subtitle =
            course.subtitle || "";


        const description =
            course.description || "";


        const price =
            formatPrice(
                course.price_cents
            );


        let totalPublishedDays = 0;


        phases.forEach(
            phase => {

                totalPublishedDays +=
                    Array.isArray(phase.days)
                        ? phase.days.filter(
                            day =>
                                published(day)
                        ).length
                        : 0;
            }
        );


        totalPublishedDays +=
            unassignedDays.filter(
                day =>
                    published(day)
            ).length;


        content.innerHTML = `

            <section class="dm-course-hero">

                <div class="dm-course-hero-cover">

                    ${
                        cover
                            ? `
                                <img
                                    src="${escapeHTML(cover)}"
                                    alt="${escapeHTML(title)}"
                                >
                            `
                            : `
                                <div class="dm-course-hero-placeholder">

                                    <span>
                                        DECISION MAKERS
                                    </span>

                                    <strong>
                                        ${escapeHTML(title)}
                                    </strong>

                                    <small>
                                        ${
                                            subtitle
                                                ? escapeHTML(subtitle)
                                                : "GREATNESS IS A DECISION"
                                        }
                                    </small>

                                </div>
                            `
                    }

                </div>


                <div class="dm-course-hero-content">

                    <span class="dm-course-eyebrow">
                        DECISION MAKERS COURSE
                    </span>


                    <h1>
                        ${escapeHTML(title)}
                    </h1>


                    ${
                        subtitle
                            ? `
                                <h2>
                                    ${escapeHTML(subtitle)}
                                </h2>
                            `
                            : ""
                    }


                    ${
                        description
                            ? `
                                <p>
                                    ${escapeHTML(description)}
                                </p>
                            `
                            : ""
                    }


                    <div class="dm-course-hero-stats">

                        <div>

                            <span>
                                COURSE LENGTH
                            </span>

                            <strong>
                                ${
                                    Number(course.total_days || 0)
                                        ? `${Number(course.total_days)} DAYS`
                                        : `${totalPublishedDays} LESSONS`
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                COURSE PRICE
                            </span>

                            <strong>
                                ${escapeHTML(price)}
                            </strong>

                        </div>

                    </div>


                    <div class="dm-course-preview-notice">

                        <strong>
                            COURSE PREVIEW
                        </strong>

                        <p>
                            Purchase access and saved progress
                            will be connected in the next stage
                            of the build.
                        </p>

                    </div>

                </div>

            </section>


            <section class="dm-course-roadmap">

                <div class="dm-course-section-heading">

                    <span>
                        YOUR ROADMAP
                    </span>

                    <h2>
                        COURSE CONTENT
                    </h2>

                </div>


                <p class="dm-course-roadmap-copy">
                    Work through each phase one decision at a time.
                </p>


                <div id="dm-course-phase-list"></div>

            </section>


            <section
                id="dm-course-day-view"
                class="dm-course-day-view"
            ></section>
        `;


        renderPhaseList(
            phases,
            unassignedDays
        );
    }


    /* =========================================================
       PHASES + DAYS
    ========================================================= */

    function renderPhaseList(
        phases,
        unassignedDays
    ) {

        const container =
            document.getElementById(
                "dm-course-phase-list"
            );


        if (!container) {
            return;
        }


        const visiblePhases =
            phases.filter(
                phase =>
                    published(phase)
            );


        let html = "";


        visiblePhases.forEach(
            (phase, phaseIndex) => {

                const days =
                    sortDays(
                        Array.isArray(phase.days)
                            ? phase.days.filter(
                                day =>
                                    published(day)
                            )
                            : []
                    );


                html += `

                    <section class="dm-phase-block">

                        <div class="dm-phase-heading">

                            <div class="dm-phase-number">
                                ${String(
                                    phaseIndex + 1
                                ).padStart(2, "0")}
                            </div>


                            <div>

                                <span>
                                    PHASE
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        phase.title ||
                                        `PHASE ${phaseIndex + 1}`
                                    )}
                                </h3>

                                ${
                                    hasValue(
                                        phase.description
                                    )
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    phase.description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                            </div>

                        </div>


                        <div class="dm-phase-days">

                            ${
                                days.length
                                    ? days
                                        .map(
                                            day =>
                                                renderDayButton(day)
                                        )
                                        .join("")
                                    : `
                                        <div class="dm-course-empty-days">
                                            CONTENT COMING SOON
                                        </div>
                                    `
                            }

                        </div>

                    </section>
                `;
            }
        );


        const remainingDays =
            unassignedDays.filter(
                day =>
                    published(day)
            );


        if (remainingDays.length) {

            html += `

                <section class="dm-phase-block">

                    <div class="dm-phase-heading">

                        <div class="dm-phase-number">
                            +
                        </div>


                        <div>

                            <span>
                                MORE
                            </span>

                            <h3>
                                COURSE LESSONS
                            </h3>

                        </div>

                    </div>


                    <div class="dm-phase-days">

                        ${
                            remainingDays
                                .map(
                                    day =>
                                        renderDayButton(day)
                                )
                                .join("")
                        }

                    </div>

                </section>
            `;
        }


        if (!html) {

            html = `

                <div class="dm-course-no-content">

                    <strong>
                        COURSE CONTENT COMING SOON
                    </strong>

                    <p>
                        The course has been published,
                        but its lessons are still being built.
                    </p>

                </div>
            `;
        }


        container.innerHTML =
            html;


        container
            .querySelectorAll(
                ".dm-day-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const dayId =
                                Number(
                                    button.dataset.dayId
                                );


                            openDay(
                                dayId
                            );
                        }
                    );
                }
            );
    }


    function renderDayButton(day) {

        const dayNumber =
            Number(
                day.day_number || 0
            );


        const title =
            day.title ||
            `DAY ${dayNumber}`;


        return `

            <button
                class="dm-day-button"
                type="button"
                data-day-id="${Number(day.id)}"
            >

                <span class="dm-day-number">

                    <small>
                        DAY
                    </small>

                    <strong>
                        ${String(dayNumber).padStart(2, "0")}
                    </strong>

                </span>


                <span class="dm-day-button-title">

                    <strong>
                        ${escapeHTML(title)}
                    </strong>

                    <small>
                        OPEN LESSON
                    </small>

                </span>


                <span class="dm-day-arrow">
                    ›
                </span>

            </button>
        `;
    }


    function findDay(dayId) {

        if (!activeCourseData) {
            return null;
        }


        const phases =
            Array.isArray(
                activeCourseData.phases
            )
                ? activeCourseData.phases
                : [];


        for (const phase of phases) {

            const days =
                Array.isArray(phase.days)
                    ? phase.days
                    : [];


            const day =
                days.find(
                    item =>
                        Number(item.id) ===
                        Number(dayId)
                );


            if (day) {

                return {
                    day,
                    phase
                };
            }
        }


        const unassigned =
            Array.isArray(
                activeCourseData.unassigned_days
            )
                ? activeCourseData.unassigned_days
                : [];


        const day =
            unassigned.find(
                item =>
                    Number(item.id) ===
                    Number(dayId)
            );


        if (day) {

            return {
                day,
                phase: null
            };
        }


        return null;
    }


    function openDay(dayId) {

        const result =
            findDay(
                dayId
            );


        if (!result) {
            return;
        }


        stopMedia();


        activeDayId =
            Number(dayId);


        renderDay(
            result.day,
            result.phase
        );


        document
            .querySelectorAll(
                ".dm-day-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        Number(button.dataset.dayId) ===
                        Number(dayId)
                    );
                }
            );


        const view =
            document.getElementById(
                "dm-course-day-view"
            );


        if (view) {

            view.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );
        }
    }


    /* =========================================================
       DAY PLAYER
    ========================================================= */

    function renderDay(
        day,
        phase
    ) {

        const container =
            document.getElementById(
                "dm-course-day-view"
            );


        if (!container) {
            return;
        }


        const dayNumber =
            Number(
                day.day_number || 0
            );


        const title =
            day.title ||
            `DAY ${dayNumber}`;


        const textTitle =
            day.text_title || "";


        const textContent =
            day.text_content || "";


        const audioUrl =
            String(
                day.audio_url || ""
            ).trim();


        const videoUrl =
            String(
                day.video_url || ""
            ).trim();


        const thumbnail =
            String(
                day.video_thumbnail_url || ""
            ).trim();


        const resourceUrl =
            String(
                day.resource_url || ""
            ).trim();


        const externalUrl =
            String(
                day.external_url || ""
            ).trim();


        container.innerHTML = `

            <div class="dm-day-player">

                <div class="dm-day-player-topline">

                    <span>
                        ${
                            phase?.title
                                ? escapeHTML(phase.title)
                                : "DECISION MAKERS"
                        }
                    </span>

                    <strong>
                        DAY ${String(dayNumber).padStart(2, "0")}
                    </strong>

                </div>


                <h2>
                    ${escapeHTML(title)}
                </h2>


                ${
                    hasValue(textContent)
                        ? `

                            <div class="dm-day-message">

                                ${
                                    hasValue(textTitle)
                                        ? `
                                            <span class="dm-day-content-label">
                                                THE MESSAGE
                                            </span>

                                            <h3>
                                                ${escapeHTML(textTitle)}
                                            </h3>
                                        `
                                        : `
                                            <span class="dm-day-content-label">
                                                THE MESSAGE
                                            </span>
                                        `
                                }

                                <div class="dm-day-text">
                                    ${formatTextContent(textContent)}
                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    audioUrl
                        ? `

                            <div class="dm-day-media-block">

                                <span class="dm-day-content-label">
                                    LISTEN
                                </span>

                                <h3>
                                    ${
                                        escapeHTML(
                                            day.audio_title ||
                                            "AUDIO LESSON"
                                        )
                                    }
                                </h3>

                                ${
                                    hasValue(
                                        day.audio_description
                                    )
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    day.audio_description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                <audio
                                    controls
                                    preload="metadata"
                                    src="${escapeHTML(audioUrl)}"
                                ></audio>

                            </div>
                        `
                        : ""
                }


                ${
                    videoUrl
                        ? `

                            <div class="dm-day-media-block">

                                <span class="dm-day-content-label">
                                    WATCH
                                </span>

                                <h3>
                                    ${
                                        escapeHTML(
                                            day.video_title ||
                                            "VIDEO LESSON"
                                        )
                                    }
                                </h3>

                                ${
                                    hasValue(
                                        day.video_description
                                    )
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    day.video_description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                <video
                                    controls
                                    playsinline
                                    preload="metadata"
                                    ${
                                        thumbnail
                                            ? `poster="${escapeHTML(thumbnail)}"`
                                            : ""
                                    }
                                    src="${escapeHTML(videoUrl)}"
                                ></video>

                            </div>
                        `
                        : ""
                }


                ${
                    hasValue(
                        day.decision_prompt
                    )
                        ? renderPrompt(
                            "TODAY'S DECISION",
                            day.decision_prompt,
                            "decision"
                        )
                        : ""
                }


                ${
                    hasValue(
                        day.move_prompt
                    )
                        ? renderPrompt(
                            "TODAY'S MOVE",
                            day.move_prompt,
                            "move"
                        )
                        : ""
                }


                ${
                    hasValue(
                        day.reflection_prompt
                    )
                        ? renderPrompt(
                            "REFLECTION",
                            day.reflection_prompt,
                            "reflection"
                        )
                        : ""
                }


                ${
                    resourceUrl
                        ? `

                            <div class="dm-day-resource">

                                <span class="dm-day-content-label">
                                    COURSE RESOURCE
                                </span>

                                <h3>
                                    ${
                                        escapeHTML(
                                            day.resource_title ||
                                            "COURSE RESOURCE"
                                        )
                                    }
                                </h3>

                                ${
                                    hasValue(
                                        day.resource_description
                                    )
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    day.resource_description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                <a
                                    href="${escapeHTML(resourceUrl)}"
                                    class="dm-day-resource-button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ${
                                        escapeHTML(
                                            day.resource_button_text ||
                                            "DOWNLOAD RESOURCE"
                                        )
                                    }
                                </a>

                            </div>
                        `
                        : ""
                }


                ${
                    externalUrl
                        ? `

                            <div class="dm-day-external">

                                <span class="dm-day-content-label">
                                    CONTINUE
                                </span>

                                ${
                                    hasValue(
                                        day.external_description
                                    )
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    day.external_description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                <a
                                    href="${escapeHTML(externalUrl)}"
                                    class="dm-day-external-button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ${
                                        escapeHTML(
                                            day.external_label ||
                                            "OPEN LINK"
                                        )
                                    }
                                </a>

                            </div>
                        `
                        : ""
                }


                ${
                    hasValue(
                        day.completion_message
                    )
                        ? `
                            <div class="dm-day-completion-preview">

                                <span>
                                    COMPLETION MESSAGE
                                </span>

                                <p>
                                    ${escapeHTML(
                                        day.completion_message
                                    )}
                                </p>

                            </div>
                        `
                        : ""
                }


                <div class="dm-day-build-notice">

                    <strong>
                        PREVIEW MODE
                    </strong>

                    <p>
                        Saving answers, completing days
                        and unlocking progress will be connected
                        with the course access system.
                    </p>

                </div>

            </div>
        `;
    }


    function renderPrompt(
        label,
        prompt,
        type
    ) {

        return `

            <div class="dm-day-prompt">

                <span class="dm-day-content-label">
                    ${escapeHTML(label)}
                </span>

                <h3>
                    ${escapeHTML(prompt)}
                </h3>

                <textarea
                    class="dm-course-preview-input"
                    data-prompt-type="${escapeHTML(type)}"
                    rows="4"
                    placeholder="Your response will save here once course progress is connected."
                    disabled
                ></textarea>

            </div>
        `;
    }


    function formatTextContent(text) {

        const value =
            String(
                text || ""
            ).trim();


        if (!value) {
            return "";
        }


        return value
            .split(/\n{2,}/)
            .map(
                paragraph => `
                    <p>
                        ${escapeHTML(
                            paragraph.trim()
                        ).replace(/\n/g, "<br>")}
                    </p>
                `
            )
            .join("");
    }


    /* =========================================================
       STYLES
    ========================================================= */

    function installStyles() {

        const old =
            document.getElementById(
                "decision-makers-course-styles"
            );


        if (old) {
            old.remove();
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "decision-makers-course-styles";


        style.textContent = `

            /* =================================================
               COURSE SECTION
            ================================================= */

            .dm-courses-section {
                width: 100%;
                max-width: 1100px;
                margin-left: auto;
                margin-right: auto;
            }


            .dm-course-message {
                margin-top: 24px;
                padding: 24px;
                border: 1px solid #2c2c2c;
                border-radius: 16px;
                background: #090909;
                color: #888;
                text-align: center;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 1.5px;
            }


            .dm-course-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(270px, 1fr)
                    );
                gap: 24px;
                margin-top: 26px;
            }


            /* =================================================
               COURSE CARD
            ================================================= */

            .dm-course-card {
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

                border-radius: 22px;

                box-shadow:
                    0 20px 50px
                    rgba(0, 0, 0, .38);

                color: #fff;
            }


            .dm-course-card::before {
                content: "";
                position: absolute;
                z-index: 3;
                top: 0;
                left: 0;
                width: 100%;
                height: 5px;
                background: #c50000;
            }


            .dm-course-cover {
                width: 100%;
                aspect-ratio: 4 / 5;
                overflow: hidden;
                background: #050505;
                border-bottom: 1px solid #282828;
            }


            .dm-course-cover img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }


            .dm-course-cover-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                padding: 30px;

                text-align: center;

                background:
                    radial-gradient(
                        circle at center,
                        rgba(245, 197, 24, .13),
                        transparent 64%
                    ),
                    #050505;
            }


            .dm-course-cover-placeholder span {
                margin-bottom: 14px;

                color: #F5C518;

                font-size: 10px;
                font-weight: 900;
                letter-spacing: 2.3px;
            }


            .dm-course-cover-placeholder strong {
                max-width: 260px;

                color: #fff;

                font-size: 30px;
                line-height: 1.05;
                font-weight: 950;
                letter-spacing: -.5px;
            }


            .dm-course-cover-placeholder small {
                margin-top: 15px;

                color: #999;

                font-size: 10px;
                font-weight: 900;
                letter-spacing: 1.6px;
            }


            .dm-course-card-body {
                padding: 22px;
            }


            .dm-course-card-topline {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;

                margin-bottom: 10px;
            }


            .dm-course-card-topline span {
                color: #F5C518;

                font-size: 9px;
                font-weight: 900;
                letter-spacing: 1.8px;
            }


            .dm-course-card-topline strong {
                padding: 5px 8px;

                border:
                    1px solid
                    rgba(197, 0, 0, .65);

                border-radius: 999px;

                color: #fff;
                background: #9d0000;

                font-size: 8px;
                font-weight: 900;
                letter-spacing: 1px;
            }


            .dm-course-card-body h3 {
                margin: 0;

                color: #fff;

                font-size: 24px;
                line-height: 1.1;
                font-weight: 950;
            }


            .dm-course-card-body h4 {
                margin: 7px 0 0;

                color: #F5C518;

                font-size: 14px;
                line-height: 1.25;
                font-weight: 900;
            }


            .dm-course-card-body p {
                margin: 14px 0 0;

                color: #aaa;

                font-size: 13px;
                line-height: 1.6;
            }


            .dm-course-card-meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;

                margin-top: 20px;
                padding-top: 16px;

                border-top: 1px solid #292929;
            }


            .dm-course-card-meta span {
                color: #888;

                font-size: 10px;
                font-weight: 900;
                letter-spacing: 1.3px;
            }


            .dm-course-card-meta strong {
                color: #fff;

                font-size: 20px;
                font-weight: 950;
            }


            .dm-course-view-button {
                display: block;
                width: 100%;
                min-height: 50px;

                margin-top: 18px;
                padding: 13px 20px;

                border: 2px solid #F5C518;
                border-radius: 999px;

                background: #F5C518;
                color: #000;

                font: inherit;
                font-size: 11px;
                font-weight: 950;
                letter-spacing: 1.1px;

                cursor: pointer;

                transition:
                    transform .16s ease,
                    background .16s ease,
                    color .16s ease;
            }


            .dm-course-view-button:hover {
                transform: translateY(-1px);

                background: #000;
                color: #F5C518;
            }


            .dm-course-view-button:active {
                transform: scale(.985);
            }


            /* =================================================
               COURSE SALES AND PAYMENT
            ================================================= */

            .dm-course-purchase-panel {
                margin-top: 24px;
                padding: 20px;
                border: 2px solid #F5C518;
                border-radius: 18px;
                background:
                    linear-gradient(
                        145deg,
                        #0b0b0b,
                        #030303
                    );
            }

            .dm-course-purchase-kicker {
                display: block;
                color: #F5C518;
                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.8px;
            }

            .dm-course-purchase-panel h3 {
                margin: 7px 0 0;
                color: #fff;
                font-size: 27px;
                line-height: 1;
                font-weight: 950;
            }

            .dm-course-purchase-panel > p {
                margin: 10px 0 0;
                color: #aaa;
                font-size: 13px;
                line-height: 1.55;
            }

            .dm-course-purchase-fields {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin-top: 18px;
            }

            .dm-course-purchase-fields label {
                display: block;
            }

            .dm-course-purchase-fields label > span {
                display: block;
                margin-bottom: 7px;
                color: #888;
                font-size: 8px;
                font-weight: 950;
                letter-spacing: 1.4px;
            }

            .dm-course-purchase-fields input {
                display: block;
                width: 100%;
                min-height: 48px;
                padding: 12px 14px;
                border: 1px solid #343434;
                border-radius: 12px;
                outline: none;
                background: #050505;
                color: #fff;
                font: inherit;
                font-size: 13px;
            }

            .dm-course-purchase-fields input:focus {
                border-color: #F5C518;
            }

            #dm-course-purchase-button {
                display: block;
                width: 100%;
                min-height: 52px;
                margin-top: 15px;
                padding: 13px 20px;
                border: 2px solid #F5C518;
                border-radius: 999px;
                background: #F5C518;
                color: #000;
                font: inherit;
                font-size: 11px;
                font-weight: 950;
                letter-spacing: 1.1px;
                cursor: pointer;
            }

            #dm-course-purchase-button:hover {
                background: #000;
                color: #F5C518;
            }

            #dm-course-purchase-button:disabled {
                cursor: wait;
                opacity: .72;
            }

            .dm-course-purchase-status {
                min-height: 18px;
                margin-top: 12px;
                color: #aaa;
                font-size: 10px;
                font-weight: 900;
                line-height: 1.45;
                letter-spacing: .7px;
            }

            .dm-course-purchase-status.error {
                color: #ff6b6b;
            }

            .dm-course-purchase-status.success {
                color: #F5C518;
            }

            .dm-course-purchase-note {
                display: block;
                margin-top: 10px;
                color: #777;
                font-size: 10px;
                line-height: 1.5;
            }

            .dm-course-free-panel {
                margin-top: 24px;
                padding: 18px;
                border-left: 4px solid #F5C518;
                background: rgba(245, 197, 24, .06);
            }

            .dm-course-free-panel strong {
                color: #F5C518;
                font-size: 11px;
                font-weight: 950;
                letter-spacing: 1.5px;
            }

            .dm-course-free-panel p {
                margin: 7px 0 0;
                color: #aaa;
                font-size: 12px;
                line-height: 1.5;
            }

            .dm-course-sales-detail {
                margin-top: 42px;
                padding: 26px;
                border: 1px solid #252525;
                border-radius: 20px;
                background: #090909;
            }

            .dm-course-sales-detail > p {
                max-width: 850px;
                margin: 14px 0 0;
                color: #aaa;
                font-size: 14px;
                line-height: 1.7;
            }

            .dm-course-payment-banner {
                width: min(1100px, 100%);
                margin-left: auto;
                margin-right: auto;
                padding: 24px;
                border: 2px solid #F5C518;
                border-radius: 20px;
                background:
                    radial-gradient(
                        circle at top right,
                        rgba(245, 197, 24, .09),
                        transparent 38%
                    ),
                    #080808;
                text-align: center;
            }

            .dm-course-payment-banner > span {
                display: block;
                color: #F5C518;
                font-size: 10px;
                font-weight: 950;
                letter-spacing: 1.8px;
            }

            .dm-course-payment-banner > h2 {
                margin: 8px 0 0;
                color: #fff;
                font-size: clamp(21px, 4vw, 34px);
                line-height: 1.15;
                font-weight: 950;
            }

            .dm-course-payment-banner.error {
                border-color: #c50000;
            }

            .dm-course-payment-banner.processing {
                border-color: #777;
            }

            #dm-course-payment-go {
                min-height: 48px;
                margin-top: 18px;
                padding: 11px 22px;
                border: 2px solid #F5C518;
                border-radius: 999px;
                background: #F5C518;
                color: #000;
                font: inherit;
                font-size: 10px;
                font-weight: 950;
                letter-spacing: 1px;
                cursor: pointer;
            }

            /* =================================================
               COURSE PLAYER SCREEN
            ================================================= */

            .dm-course-player-screen {
                min-height: 100vh;
                background: #050505;
                color: #fff;
            }


            .dm-course-player-wrap {
                width: min(1180px, 100%);
                margin: 0 auto;
                padding: 24px 22px 60px;
            }


            .dm-course-back {
                margin-bottom: 26px;
            }


            .dm-course-player-loading {
                padding: 70px 20px;

                text-align: center;

                color: #F5C518;

                font-size: 12px;
                font-weight: 950;
                letter-spacing: 1.7px;
            }


            .dm-course-player-loading strong,
            .dm-course-player-loading span {
                display: block;
            }


            .dm-course-player-loading span {
                margin-top: 10px;
                color: #999;
            }


            /* =================================================
               COURSE HERO
            ================================================= */

            .dm-course-hero {
                display: grid;
                grid-template-columns:
                    minmax(240px, 360px)
                    minmax(0, 1fr);

                gap: 42px;
                align-items: center;

                padding: 30px;

                border: 1px solid #242424;
                border-radius: 26px;

                background:
                    radial-gradient(
                        circle at top right,
                        rgba(245, 197, 24, .09),
                        transparent 38%
                    ),
                    #090909;

                box-shadow:
                    0 25px 70px
                    rgba(0, 0, 0, .35);
            }


            .dm-course-hero-cover {
                overflow: hidden;

                aspect-ratio: 4 / 5;

                border:
                    2px solid #F5C518;

                border-radius: 20px;

                background: #000;
            }


            .dm-course-hero-cover img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }


            .dm-course-hero-placeholder {
                display: flex;
                width: 100%;
                height: 100%;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                padding: 30px;

                text-align: center;

                background:
                    radial-gradient(
                        circle,
                        rgba(245, 197, 24, .13),
                        transparent 62%
                    ),
                    #050505;
            }


            .dm-course-hero-placeholder span {
                color: #F5C518;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 2.4px;
            }


            .dm-course-hero-placeholder strong {
                margin-top: 16px;

                color: #fff;

                font-size: clamp(
                    28px,
                    5vw,
                    44px
                );

                line-height: .98;
                font-weight: 950;
            }


            .dm-course-hero-placeholder small {
                margin-top: 16px;

                color: #999;

                font-size: 10px;
                font-weight: 900;
                letter-spacing: 1.5px;
            }


            .dm-course-eyebrow {
                display: block;

                color: #F5C518;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 2.2px;
            }


            .dm-course-hero-content h1 {
                margin: 10px 0 0;

                color: #fff;

                font-size: clamp(
                    35px,
                    6vw,
                    64px
                );

                line-height: .98;
                font-weight: 950;
                letter-spacing: -1.5px;
            }


            .dm-course-hero-content h2 {
                margin: 12px 0 0;

                color: #F5C518;

                font-size: clamp(
                    18px,
                    3vw,
                    28px
                );

                line-height: 1.15;
                font-weight: 900;
            }


            .dm-course-hero-content > p {
                max-width: 680px;

                margin: 20px 0 0;

                color: #aaa;

                font-size: 15px;
                line-height: 1.7;
            }


            .dm-course-hero-stats {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));

                gap: 12px;

                margin-top: 25px;
            }


            .dm-course-hero-stats > div {
                padding: 15px;

                border: 1px solid #272727;
                border-radius: 14px;

                background: #050505;
            }


            .dm-course-hero-stats span,
            .dm-course-hero-stats strong {
                display: block;
            }


            .dm-course-hero-stats span {
                color: #777;

                font-size: 9px;
                font-weight: 900;
                letter-spacing: 1.3px;
            }


            .dm-course-hero-stats strong {
                margin-top: 6px;

                color: #fff;

                font-size: 18px;
                font-weight: 950;
            }


            .dm-course-preview-notice {
                margin-top: 18px;
                padding: 15px 17px;

                border-left: 4px solid #c50000;

                background:
                    rgba(197, 0, 0, .08);
            }


            .dm-course-preview-notice strong {
                display: block;

                color: #fff;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 1.5px;
            }


            .dm-course-preview-notice p {
                margin: 6px 0 0;

                color: #aaa;

                font-size: 12px;
                line-height: 1.5;
            }


            /* =================================================
               COURSE ROADMAP
            ================================================= */

            .dm-course-roadmap {
                margin-top: 48px;
            }


            .dm-course-section-heading span {
                display: block;

                color: #F5C518;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 2px;
            }


            .dm-course-section-heading h2 {
                margin: 6px 0 0;

                color: #fff;

                font-size: clamp(
                    28px,
                    5vw,
                    42px
                );

                font-weight: 950;
                line-height: 1;
            }


            .dm-course-roadmap-copy {
                margin: 12px 0 28px;

                color: #888;

                font-size: 14px;
            }


            /* =================================================
               PHASES
            ================================================= */

            .dm-phase-block {
                margin-bottom: 24px;

                overflow: hidden;

                border: 1px solid #252525;
                border-radius: 20px;

                background: #090909;
            }


            .dm-phase-heading {
                display: flex;
                gap: 18px;
                align-items: flex-start;

                padding: 22px;

                border-bottom: 1px solid #252525;

                background:
                    linear-gradient(
                        90deg,
                        rgba(245, 197, 24, .07),
                        transparent
                    );
            }


            .dm-phase-number {
                display: flex;
                flex: 0 0 48px;
                width: 48px;
                height: 48px;
                align-items: center;
                justify-content: center;

                border: 2px solid #F5C518;
                border-radius: 50%;

                color: #F5C518;

                font-size: 15px;
                font-weight: 950;
            }


            .dm-phase-heading span {
                display: block;

                color: #888;

                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.5px;
            }


            .dm-phase-heading h3 {
                margin: 4px 0 0;

                color: #fff;

                font-size: 24px;
                font-weight: 950;
            }


            .dm-phase-heading p {
                margin: 7px 0 0;

                color: #999;

                font-size: 12px;
                line-height: 1.5;
            }


            .dm-phase-days {
                padding: 12px;
            }


            .dm-day-button {
                display: grid;
                width: 100%;

                grid-template-columns:
                    62px
                    minmax(0, 1fr)
                    30px;

                align-items: center;
                gap: 15px;

                margin-bottom: 9px;
                padding: 12px;

                border: 1px solid #252525;
                border-radius: 14px;

                background: #050505;
                color: #fff;

                text-align: left;

                font: inherit;

                cursor: pointer;

                transition:
                    border-color .15s ease,
                    background .15s ease,
                    transform .15s ease;
            }


            .dm-day-button:last-child {
                margin-bottom: 0;
            }


            .dm-day-button:hover,
            .dm-day-button.active {
                border-color: #F5C518;

                background:
                    rgba(245, 197, 24, .055);
            }


            .dm-day-button:hover {
                transform: translateX(2px);
            }


            .dm-day-number {
                display: flex;
                min-height: 52px;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                border: 1px solid #333;
                border-radius: 10px;

                background: #0c0c0c;
            }


            .dm-day-number small {
                color: #777;

                font-size: 7px;
                font-weight: 950;
                letter-spacing: 1.3px;
            }


            .dm-day-number strong {
                margin-top: 2px;

                color: #F5C518;

                font-size: 18px;
                font-weight: 950;
            }


            .dm-day-button-title strong,
            .dm-day-button-title small {
                display: block;
            }


            .dm-day-button-title strong {
                color: #fff;

                font-size: 14px;
                line-height: 1.25;
                font-weight: 900;
            }


            .dm-day-button-title small {
                margin-top: 5px;

                color: #777;

                font-size: 8px;
                font-weight: 900;
                letter-spacing: 1px;
            }


            .dm-day-arrow {
                color: #F5C518;

                text-align: center;

                font-size: 29px;
                font-weight: 400;
            }


            .dm-course-empty-days {
                padding: 20px;

                color: #666;

                text-align: center;

                font-size: 9px;
                font-weight: 900;
                letter-spacing: 1.4px;
            }


            .dm-course-no-content {
                padding: 40px 22px;

                border: 1px dashed #333;
                border-radius: 18px;

                text-align: center;

                background: #080808;
            }


            .dm-course-no-content strong {
                color: #F5C518;

                font-size: 12px;
                letter-spacing: 1.4px;
            }


            .dm-course-no-content p {
                margin: 8px 0 0;

                color: #888;

                font-size: 12px;
            }


            /* =================================================
               DAY PLAYER
            ================================================= */

            .dm-course-day-view {
                scroll-margin-top: 20px;
            }


            .dm-course-day-view:empty {
                display: none;
            }


            .dm-day-player {
                margin-top: 45px;
                padding: 28px;

                border: 2px solid #F5C518;
                border-radius: 24px;

                background:
                    radial-gradient(
                        circle at top right,
                        rgba(245, 197, 24, .07),
                        transparent 35%
                    ),
                    #080808;

                box-shadow:
                    0 25px 70px
                    rgba(0, 0, 0, .4);
            }


            .dm-day-player-topline {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }


            .dm-day-player-topline span {
                color: #F5C518;

                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.7px;
            }


            .dm-day-player-topline strong {
                color: #fff;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 1.3px;
            }


            .dm-day-player > h2 {
                margin: 10px 0 28px;

                color: #fff;

                font-size: clamp(
                    30px,
                    6vw,
                    50px
                );

                line-height: 1;
                font-weight: 950;
            }


            .dm-day-message,
            .dm-day-media-block,
            .dm-day-prompt,
            .dm-day-resource,
            .dm-day-external {
                margin-top: 18px;
                padding: 21px;

                border: 1px solid #292929;
                border-radius: 16px;

                background: #050505;
            }


            .dm-day-content-label {
                display: block;

                margin-bottom: 8px;

                color: #F5C518;

                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.7px;
            }


            .dm-day-message h3,
            .dm-day-media-block h3,
            .dm-day-prompt h3,
            .dm-day-resource h3 {
                margin: 0;

                color: #fff;

                font-size: 20px;
                line-height: 1.25;
                font-weight: 900;
            }


            .dm-day-text {
                margin-top: 14px;

                color: #c4c4c4;

                font-size: 15px;
                line-height: 1.75;
            }


            .dm-day-text p {
                margin: 0 0 15px;
            }


            .dm-day-text p:last-child {
                margin-bottom: 0;
            }


            .dm-day-media-block > p,
            .dm-day-resource > p,
            .dm-day-external > p {
                margin: 9px 0 0;

                color: #999;

                font-size: 13px;
                line-height: 1.55;
            }


            .dm-day-media-block audio {
                display: block;
                width: 100%;

                margin-top: 17px;
            }


            .dm-day-media-block video {
                display: block;
                width: 100%;
                max-height: 620px;

                margin-top: 17px;

                border-radius: 13px;

                background: #000;
            }


            .dm-course-preview-input {
                display: block;
                width: 100%;

                margin-top: 16px;
                padding: 14px;

                resize: vertical;

                border: 1px solid #303030;
                border-radius: 12px;

                background: #0a0a0a;
                color: #777;

                font: inherit;
                font-size: 13px;
                line-height: 1.5;
            }


            .dm-course-preview-input:disabled {
                opacity: .72;
            }


            .dm-day-resource-button,
            .dm-day-external-button {
                display: inline-flex;
                min-height: 46px;
                align-items: center;
                justify-content: center;

                margin-top: 17px;
                padding: 11px 20px;

                border: 2px solid #F5C518;
                border-radius: 999px;

                background: #F5C518;
                color: #000;

                text-decoration: none;

                font-size: 10px;
                font-weight: 950;
                letter-spacing: 1px;
            }


            .dm-day-completion-preview {
                margin-top: 20px;
                padding: 18px;

                border-left: 4px solid #F5C518;

                background:
                    rgba(245, 197, 24, .06);
            }


            .dm-day-completion-preview span {
                display: block;

                color: #F5C518;

                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.4px;
            }


            .dm-day-completion-preview p {
                margin: 7px 0 0;

                color: #ddd;

                font-size: 13px;
                line-height: 1.55;
            }


            .dm-day-build-notice {
                margin-top: 22px;
                padding: 16px;

                border: 1px solid #292929;
                border-radius: 12px;

                background: #050505;
            }


            .dm-day-build-notice strong {
                display: block;

                color: #c50000;

                font-size: 9px;
                font-weight: 950;
                letter-spacing: 1.4px;
            }


            .dm-day-build-notice p {
                margin: 6px 0 0;

                color: #777;

                font-size: 11px;
                line-height: 1.5;
            }


            .dm-course-footer {
                margin-top: 65px;
            }


            /* =================================================
               MOBILE
            ================================================= */

            @media (max-width: 760px) {

                .dm-course-grid {
                    grid-template-columns: 1fr;
                    gap: 19px;
                }


                .dm-course-player-wrap {
                    padding:
                        18px
                        14px
                        50px;
                }


                .dm-course-hero {
                    grid-template-columns: 1fr;

                    gap: 25px;

                    padding: 17px;
                }


                .dm-course-hero-cover {
                    width: min(100%, 340px);
                    margin: 0 auto;
                }


                .dm-course-hero-content {
                    text-align: left;
                }


                .dm-course-hero-stats {
                    grid-template-columns: 1fr 1fr;
                }


                .dm-course-purchase-fields {
                    grid-template-columns: 1fr;
                }


                .dm-phase-heading {
                    padding: 17px;
                }


                .dm-phase-number {
                    flex-basis: 43px;
                    width: 43px;
                    height: 43px;
                }


                .dm-phase-heading h3 {
                    font-size: 20px;
                }


                .dm-phase-days {
                    padding: 9px;
                }


                .dm-day-button {
                    grid-template-columns:
                        54px
                        minmax(0, 1fr)
                        24px;

                    gap: 10px;

                    padding: 9px;
                }


                .dm-day-number {
                    min-height: 48px;
                }


                .dm-day-button-title strong {
                    font-size: 12px;
                }


                .dm-day-player {
                    margin-top: 30px;
                    padding: 17px;

                    border-radius: 18px;
                }


                .dm-day-message,
                .dm-day-media-block,
                .dm-day-prompt,
                .dm-day-resource,
                .dm-day-external {
                    padding: 16px;
                }


                .dm-course-card-body {
                    padding: 19px;
                }

            }


            @media (max-width: 430px) {

                .dm-course-hero-stats {
                    grid-template-columns: 1fr;
                }


                .dm-day-player-topline {
                    align-items: flex-start;
                    flex-direction: column;
                }

            }

        `;


        document.head.appendChild(
            style
        );
    }


    /* =========================================================
       LOAD COURSES
    ========================================================= */

    async function loadCourses() {

        installStyles();

        createCourseSection();

        watchSectionPlacement();

        placeCourseSection();


        const message =
            document.getElementById(
                "dm-course-message"
            );


        try {

            const result =
                await apiGet(
                    "/dm-courses"
                );


            courses =
                Array.isArray(result)
                    ? result
                    : [];


            renderCourses();


            await handleCheckoutReturn();


            console.info(
                "Decision Makers courses loaded.",
                courses.length
            );
        }
        catch (error) {

            console.warn(
                "Decision Makers courses could not be loaded.",
                error
            );


            if (message) {

                message.style.display =
                    "block";


                message.textContent =
                    "COURSES COULD NOT BE LOADED.";
            }
        }
    }


    /* =========================================================
       PUBLIC REFRESH HOOK

       Allows us to refresh the course catalog later without
       reloading the entire app.
    ========================================================= */

    window.DecisionMakerCourses = {

        reload:
            async function () {
                await loadCourses();
            },

        close:
            function () {
                closeCourse();
            },

        open:
            function (courseId) {
                openCourse(
                    courseId
                );
            }

    };


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadCourses
        );
    }
    else {

        loadCourses();
    }

})();