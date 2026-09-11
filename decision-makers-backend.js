(() => {

  "use strict";


  /* =========================================================
     B.O.S.S CODE GO
     DECISION MAKERS BACKEND
     SECURE LOGIN + COURSES + SAVED PROGRESS + PAST DAY REVIEW
  ========================================================= */


  const API =
    "https://boss-code-go-api.dezthareason4ever.workers.dev";


  const CHALLENGE_KEY =
    "boss-code-decision-maker-challenges-v1";


  const COURSE_EMAIL_KEY =
    "boss-code-dm-course-email-v1";


  const COURSE_AUTH_TOKEN_KEY =
    "boss-code-dm-auth-token-v1";


  const COURSE_AUTH_CUSTOMER_KEY =
    "boss-code-dm-auth-customer-v1";


  let sessions = [];

  let challenges = [];

  let resources = [];


  let activeCourse = null;

  let activeRun = null;

  let activeSummary = null;

  let activeDays = [];

  let activeProgress = [];

  let activeEmail = "";

  let activeAuthToken = "";

  let activeCustomer = null;

  let authCodeEmail = "";


  /* =========================================================
     HELPERS
  ========================================================= */


  const $ = (id) =>
    document.getElementById(id);


  function esc(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function isPublished(item) {

    return (
      item?.published == null ||
      Number(item.published) === 1
    );

  }


  function sortItems(items) {

    return [...items].sort(
      (a, b) => {

        const aSort =
          Number(
            a.sort_order ?? 0
          );


        const bSort =
          Number(
            b.sort_order ?? 0
          );


        if (
          aSort !== bSort
        ) {

          return (
            aSort - bSort
          );

        }


        return (

          Number(
            a.session_number ??
            a.challenge_number ??
            a.day_number ??
            a.id ??
            0
          )

          -

          Number(
            b.session_number ??
            b.challenge_number ??
            b.day_number ??
            b.id ??
            0
          )

        );

      }
    );

  }


  async function api(
    path,
    options = {}
  ) {

    const token =
      activeAuthToken ||
      savedAuthToken();


    const response =
      await fetch(
        `${API}${path}`,
        {

          ...options,

          headers: {

            Accept:
              "application/json",

            ...(
              options.body
                ? {
                    "Content-Type":
                      "application/json"
                  }
                : {}
            ),

            ...(
              token
                ? {
                    Authorization:
                      `Bearer ${token}`
                  }
                : {}
            ),

            ...(
              options.headers ||
              {}
            )

          }

        }
      );


    let data = null;


    try {

      data =
        await response.json();

    }
    catch (_) {}


    if (
      !response.ok
    ) {

      const error =
        new Error(
          data?.error ||
          data?.message ||
          `Request failed: ${response.status}`
        );


      error.status =
        response.status;


      error.data =
        data;


      throw error;

    }


    return (
      data || {}
    );

  }


  async function getArray(
    path
  ) {

    const json =
      await api(path);


    if (
      Array.isArray(json)
    ) {

      return json;

    }


    return (
      Array.isArray(
        json.data
      )
        ? json.data
        : []
    );

  }


  function youtubeId(value) {

    const text =
      String(
        value || ""
      ).trim();


    if (
      /^[A-Za-z0-9_-]{11}$/.test(
        text
      )
    ) {

      return text;

    }


    try {

      const url =
        new URL(text);


      if (
        url.hostname.includes(
          "youtu.be"
        )
      ) {

        return (
          url.pathname
            .replace("/", "")
            .split("?")[0]
        );

      }


      if (
        url.searchParams.get("v")
      ) {

        return (
          url.searchParams.get(
            "v"
          )
        );

      }


      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);


      for (
        const key of [
          "live",
          "embed",
          "shorts"
        ]
      ) {

        const index =
          parts.indexOf(key);


        if (
          index !== -1 &&
          parts[index + 1]
        ) {

          return (
            parts[index + 1]
          );

        }

      }

    }
    catch (_) {}


    return "";

  }


  function savedEmail() {

    try {

      return String(
        localStorage.getItem(
          COURSE_EMAIL_KEY
        ) || ""
      )
        .trim()
        .toLowerCase();

    }
    catch (_) {

      return "";

    }

  }


  function saveEmail(email) {

    try {

      localStorage.setItem(
        COURSE_EMAIL_KEY,
        email
      );

    }
    catch (_) {}

  }


  function savedAuthToken() {

    try {

      return String(
        localStorage.getItem(
          COURSE_AUTH_TOKEN_KEY
        ) || ""
      ).trim();

    }
    catch (_) {

      return "";

    }

  }


  function savedAuthCustomer() {

    try {

      const value =
        localStorage.getItem(
          COURSE_AUTH_CUSTOMER_KEY
        );


      return value
        ? JSON.parse(value)
        : null;

    }
    catch (_) {

      return null;

    }

  }


  function saveAuthSession(
    token,
    customer
  ) {

    activeAuthToken =
      String(
        token || ""
      ).trim();


    activeCustomer =
      customer || null;


    activeEmail =
      String(
        customer?.email || ""
      )
        .trim()
        .toLowerCase();


    try {

      localStorage.setItem(
        COURSE_AUTH_TOKEN_KEY,
        activeAuthToken
      );


      localStorage.setItem(
        COURSE_AUTH_CUSTOMER_KEY,
        JSON.stringify(
          activeCustomer || {}
        )
      );


      if (
        activeEmail
      ) {

        localStorage.setItem(
          COURSE_EMAIL_KEY,
          activeEmail
        );

      }

    }
    catch (_) {}

  }


  function clearAuthSession() {

    activeAuthToken =
      "";


    activeCustomer =
      null;


    activeEmail =
      "";


    authCodeEmail =
      "";


    try {

      localStorage.removeItem(
        COURSE_AUTH_TOKEN_KEY
      );


      localStorage.removeItem(
        COURSE_AUTH_CUSTOMER_KEY
      );

    }
    catch (_) {}

  }


  function validEmail(email) {

    return (
      /^\S+@\S+\.\S+$/.test(
        String(
          email || ""
        ).trim()
      )
    );

  }


  function currentDayNumber() {

    return Number(

      activeSummary
        ?.next_day ||

      activeRun
        ?.current_day ||

      1

    );

  }


  function completedPastDays() {

    const current =
      currentDayNumber();


    return activeProgress

      .filter(
        (item) => {

          return (
            Number(
              item.completed
            ) === 1 &&
            Number(
              item.day_number
            ) < current
          );

        }
      )

      .sort(
        (a, b) =>
          Number(
            a.day_number
          )
          -
          Number(
            b.day_number
          )
      );

  }


  function savedForDay(
    number
  ) {

    return (

      activeProgress.find(
        (item) =>

          Number(
            item.day_number
          )

          ===

          Number(number)
      )

      ||

      {}

    );

  }


  function courseDay(
    number
  ) {

    return (

      activeDays.find(
        (item) =>

          Number(
            item.day_number
          )

          ===

          Number(number)
      )

      ||

      null

    );

  }


  /* =========================================================
     STYLES
  ========================================================= */


  function installStyles() {

    if (
      $(
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
      .dm-resource-download,
      .dm-course-primary,
      #dm-send-login-code,
      #dm-verify-login-code {

        border:
          1px solid #e32636;

        background:
          #e32636;

        color:
          #fff;

        font:
          inherit;

        font-size:
          11px;

        font-weight:
          900;

        letter-spacing:
          1px;

        padding:
          12px 16px;

        border-radius:
          999px;

        cursor:
          pointer;

      }


      .dm-course-secondary {

        border:
          1px solid #555;

        background:
          #111;

        color:
          #fff;

        font:
          inherit;

        font-size:
          11px;

        font-weight:
          900;

        letter-spacing:
          1px;

        padding:
          12px 16px;

        border-radius:
          999px;

        cursor:
          pointer;

      }


      .dm-course-gold-button {

        border:
          1px solid #f5c518;

        background:
          #f5c518;

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

        padding:
          12px 16px;

        border-radius:
          999px;

        cursor:
          pointer;

      }


      .action-button.accepted {

        background:
          #f5c518;

        border-color:
          #f5c518;

        color:
          #000;

        opacity:
          1;

      }


      #dm-session-player-overlay,
      #dm-course-player-overlay {

        position:
          fixed;

        inset:
          0;

        z-index:
          999999;

        background:
          rgba(
            0,
            0,
            0,
            .96
          );

        display:
          none;

      }


      #dm-session-player-overlay.show {

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        padding:
          18px;

      }


      #dm-course-player-overlay.show {

        display:
          block;

        overflow-y:
          auto;

        padding:
          14px;

      }


      .dm-session-player-shell,
      .dm-course-player-shell {

        width:
          min(
            100%,
            900px
          );

        margin:
          auto;

        background:
          #080808;

        border:
          1px solid #303030;

        border-radius:
          18px;

        overflow:
          hidden;

        box-shadow:
          0 25px 80px
          rgba(
            0,
            0,
            0,
            .6
          );

      }


      .dm-course-player-shell {

        margin:
          0 auto 40px;

      }


      .dm-session-player-top,
      .dm-course-player-top {

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          16px;

        padding:
          15px 18px;

        border-bottom:
          1px solid #222;

        background:
          #090909;

      }


      .dm-course-player-top {

        position:
          sticky;

        top:
          0;

        z-index:
          10;

      }


      .dm-session-player-top span,
      .dm-course-player-top span {

        display:
          block;

        color:
          #f5c518;

        font-size:
          9px;

        font-weight:
          900;

        letter-spacing:
          1.8px;

      }


      .dm-session-player-top h3,
      .dm-course-player-top h3 {

        color:
          #fff;

        margin:
          4px 0 0;

        font-size:
          16px;

      }


      #dm-session-player-close,
      #dm-course-player-close {

        width:
          42px;

        height:
          42px;

        min-width:
          42px;

        border-radius:
          50%;

        border:
          1px solid #444;

        background:
          #111;

        color:
          #fff;

        font-size:
          17px;

        cursor:
          pointer;

      }


      .dm-session-video-wrap,
      .dm-course-video {

        width:
          100%;

        aspect-ratio:
          16 / 9;

        background:
          #000;

        overflow:
          hidden;

      }


      .dm-session-video-wrap iframe,
      .dm-course-video iframe,
      .dm-course-video video {

        width:
          100%;

        height:
          100%;

        border:
          0;

        display:
          block;

      }


      .dm-resource-grid {

        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              230px,
              1fr
            )
          );

        gap:
          18px;

        margin-top:
          22px;

      }


      .dm-resource-card {

        overflow:
          hidden;

        border:
          1px solid #2a2a2a;

        border-radius:
          18px;

        background:
          #0b0b0b;

      }


      .dm-resource-cover {

        width:
          100%;

        aspect-ratio:
          4 / 5;

        background:
          #111;

        overflow:
          hidden;

      }


      .dm-resource-cover img {

        width:
          100%;

        height:
          100%;

        display:
          block;

        object-fit:
          cover;

      }


      .dm-resource-placeholder {

        width:
          100%;

        height:
          100%;

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
          25px;

      }


      .dm-resource-placeholder span,
      .dm-resource-type {

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          1.6px;

      }


      .dm-resource-placeholder strong {

        color:
          #fff;

        font-size:
          26px;

        margin-top:
          8px;

      }


      .dm-resource-content {

        padding:
          18px;

      }


      .dm-resource-content h3 {

        margin:
          8px 0;

        color:
          #fff;

        font-size:
          20px;

      }


      .dm-resource-content p {

        color:
          #ccc;

        font-size:
          13px;

        line-height:
          1.5;

      }


      .dm-resource-download {

        width:
          100%;

        margin-top:
          10px;

      }


      .dm-course-access {

        margin-top:
          18px;

        padding:
          18px;

        border:
          1px solid #2a2a2a;

        border-radius:
          18px;

        background:
          #090909;

      }


      .dm-course-access label {

        display:
          block;

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          1.7px;

        margin-bottom:
          8px;

      }


      .dm-course-access-row {

        display:
          grid;

        grid-template-columns:
          1fr auto;

        gap:
          10px;

      }


      .dm-course-access input {

        width:
          100%;

        min-width:
          0;

        border:
          1px solid #333;

        border-radius:
          999px;

        background:
          #050505;

        color:
          #fff;

        padding:
          13px 16px;

        font:
          inherit;

        outline:
          none;

      }


      .dm-course-access input:focus {

        border-color:
          #f5c518;

      }


      .dm-course-status,
      .dm-save-status {

        min-height:
          18px;

        margin-top:
          8px;

        color:
          #999;

        font-size:
          10px;

        font-weight:
          800;

      }


      .dm-course-status.success,
      .dm-save-status.success {

        color:
          #f5c518;

      }


      .dm-course-status.error,
      .dm-save-status.error {

        color:
          #ff6b75;

      }


      .dm-auth-hidden {

        display:
          none !important;

      }


      .dm-auth-code-panel {

        margin-top:
          14px;

        padding-top:
          14px;

        border-top:
          1px solid #242424;

      }


      .dm-auth-code-note {

        color:
          #aaa;

        font-size:
          11px;

        line-height:
          1.5;

        margin:
          0 0 12px;

      }


      .dm-auth-code-row {

        display:
          grid;

        grid-template-columns:
          1fr auto;

        gap:
          10px;

      }


      #dm-login-code {

        text-align:
          center;

        font-size:
          21px;

        font-weight:
          900;

        letter-spacing:
          7px;

      }


      .dm-auth-code-actions {

        display:
          flex;

        gap:
          10px;

        flex-wrap:
          wrap;

        margin-top:
          10px;

      }


      .dm-auth-code-actions button {

        flex:
          1 1 160px;

      }


      .dm-auth-signed-panel {

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          15px;

      }


      .dm-auth-signed-copy span {

        display:
          block;

        color:
          #f5c518;

        font-size:
          9px;

        font-weight:
          900;

        letter-spacing:
          1.6px;

        margin-bottom:
          5px;

      }


      .dm-auth-signed-copy strong {

        display:
          block;

        color:
          #fff;

        font-size:
          16px;

      }


      .dm-auth-signed-copy small {

        display:
          block;

        color:
          #999;

        font-size:
          11px;

        margin-top:
          3px;

      }


      .dm-auth-link-button {

        border:
          1px solid #444;

        background:
          #111;

        color:
          #fff;

        font:
          inherit;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          1px;

        padding:
          11px 14px;

        border-radius:
          999px;

        cursor:
          pointer;

      }


      #dm-auth-logout {

        flex:
          0 0 auto;

      }


      .dm-course-list {

        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              260px,
              1fr
            )
          );

        gap:
          18px;

        margin-top:
          20px;

      }


      .dm-course-empty,
      .dm-course-loading,
      .dm-course-error {

        padding:
          20px;

        border:
          1px solid #2a2a2a;

        border-radius:
          16px;

        background:
          #090909;

        color:
          #aaa;

        text-align:
          center;

        font-size:
          11px;

        font-weight:
          900;

      }


      .dm-course-card {

        overflow:
          hidden;

        border:
          1px solid #2b2b2b;

        border-radius:
          20px;

        background:
          #0a0a0a;

      }


      .dm-course-cover {

        aspect-ratio:
          16 / 9;

        overflow:
          hidden;

        background:
          #111;

      }


      .dm-course-cover img {

        width:
          100%;

        height:
          100%;

        object-fit:
          cover;

        display:
          block;

      }


      .dm-course-cover-fallback {

        width:
          100%;

        height:
          100%;

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
          20px;

      }


      .dm-course-cover-fallback span,
      .dm-course-kicker {

        color:
          #f5c518;

        font-size:
          9px;

        font-weight:
          900;

        letter-spacing:
          1.8px;

      }


      .dm-course-cover-fallback strong {

        color:
          #fff;

        margin-top:
          6px;

      }


      .dm-course-card-body {

        padding:
          18px;

      }


      .dm-course-card-body h3 {

        color:
          #fff;

        font-size:
          22px;

        margin:
          7px 0;

      }


      .dm-course-card-body p {

        color:
          #bbb;

        font-size:
          13px;

        line-height:
          1.45;

        margin:
          0 0 14px;

      }


      .dm-progress-copy {

        display:
          flex;

        justify-content:
          space-between;

        gap:
          10px;

        font-size:
          10px;

        font-weight:
          900;

      }


      .dm-progress-copy strong {

        color:
          #fff;

      }


      .dm-progress-copy span {

        color:
          #f5c518;

      }


      .dm-progress-track {

        width:
          100%;

        height:
          7px;

        overflow:
          hidden;

        border-radius:
          999px;

        background:
          #242424;

        margin:
          8px 0 15px;

      }


      .dm-progress-track div {

        height:
          100%;

        background:
          #f5c518;

        border-radius:
          inherit;

      }


      .dm-course-primary {

        width:
          100%;

      }


      .dm-course-player-content {

        padding:
          20px;

      }


      .dm-day-head {

        display:
          flex;

        justify-content:
          space-between;

        gap:
          15px;

        align-items:
          flex-start;

      }


      .dm-day-head span {

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          1.7px;

      }


      .dm-day-head h2 {

        color:
          #fff;

        font-size:
          clamp(
            24px,
            5vw,
            38px
          );

        line-height:
          1;

        margin:
          5px 0;

      }


      .dm-day-head strong {

        color:
          #f5c518;

        font-size:
          20px;

      }


      .dm-player-progress {

        margin:
          12px 0 20px;

      }


      .dm-course-toolbar {

        display:
          flex;

        gap:
          10px;

        flex-wrap:
          wrap;

        margin:
          0 0 20px;

      }


      .dm-course-toolbar button {

        flex:
          1 1 180px;

      }


      .dm-course-audio,
      .dm-course-message,
      .dm-course-prompt,
      .dm-made-decision,
      .dm-review-notice {

        margin:
          16px 0;

        padding:
          18px;

        border:
          1px solid #292929;

        border-radius:
          17px;

        background:
          #0c0c0c;

      }


      .dm-course-audio span,
      .dm-course-message > span,
      .dm-course-prompt label,
      .dm-made-decision span,
      .dm-review-notice span {

        display:
          block;

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          1.5px;

        margin-bottom:
          9px;

      }


      .dm-review-notice {

        border-color:
          #5d4d10;

      }


      .dm-review-notice strong {

        color:
          #fff;

        font-size:
          15px;

        line-height:
          1.4;

      }


      .dm-course-audio audio {

        width:
          100%;

      }


      .dm-course-message div {

        color:
          #eee;

        font-size:
          15px;

        line-height:
          1.65;

      }


      .dm-course-prompt p {

        color:
          #fff;

        font-size:
          15px;

        line-height:
          1.5;

        margin:
          0 0 12px;

      }


      .dm-course-prompt textarea {

        width:
          100%;

        resize:
          vertical;

        border:
          1px solid #333;

        border-radius:
          13px;

        background:
          #050505;

        color:
          #fff;

        padding:
          13px;

        font:
          inherit;

        line-height:
          1.5;

        outline:
          none;

      }


      .dm-course-prompt textarea:focus {

        border-color:
          #f5c518;

      }


      .dm-course-prompt textarea[readonly] {

        color:
          #ddd;

        background:
          #080808;

        border-color:
          #252525;

        cursor:
          default;

      }


      .dm-facing {

        border-color:
          #574912;

      }


      .dm-response {

        border-color:
          #473019;

      }


      .dm-made-decision strong {

        color:
          #fff;

        font-size:
          18px;

        line-height:
          1.4;

      }


      .dm-day-actions {

        display:
          grid;

        grid-template-columns:
          1fr 1fr;

        gap:
          10px;

        margin-top:
          18px;

      }


      .dm-past-days-head {

        text-align:
          center;

        padding:
          10px 0 20px;

      }


      .dm-past-days-head span {

        display:
          block;

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          2px;

      }


      .dm-past-days-head h2 {

        color:
          #fff;

        font-size:
          30px;

        margin:
          6px 0;

      }


      .dm-past-days-head p {

        color:
          #aaa;

        font-size:
          13px;

        line-height:
          1.5;

      }


      .dm-past-days-list {

        display:
          grid;

        gap:
          12px;

        margin:
          18px 0;

      }


      .dm-past-day-card {

        width:
          100%;

        display:
          grid;

        grid-template-columns:
          auto 1fr auto;

        align-items:
          center;

        gap:
          14px;

        text-align:
          left;

        padding:
          15px;

        border:
          1px solid #292929;

        border-radius:
          16px;

        background:
          #0b0b0b;

        color:
          #fff;

        cursor:
          pointer;

      }


      .dm-past-day-card:hover {

        border-color:
          #f5c518;

      }


      .dm-past-day-number {

        width:
          46px;

        height:
          46px;

        border-radius:
          50%;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        background:
          #f5c518;

        color:
          #000;

        font-size:
          13px;

        font-weight:
          900;

      }


      .dm-past-day-copy span {

        display:
          block;

        color:
          #888;

        font-size:
          9px;

        font-weight:
          900;

        letter-spacing:
          1.4px;

        margin-bottom:
          3px;

      }


      .dm-past-day-copy strong {

        display:
          block;

        color:
          #fff;

        font-size:
          15px;

      }


      .dm-past-day-arrow {

        color:
          #f5c518;

        font-size:
          24px;

      }


      .dm-complete-box {

        text-align:
          center;

        padding:
          34px 18px;

      }


      .dm-complete-box span {

        color:
          #f5c518;

        font-size:
          10px;

        font-weight:
          900;

        letter-spacing:
          2px;

      }


      .dm-complete-box h2 {

        color:
          #fff;

        font-size:
          30px;

        margin:
          8px 0;

      }


      .dm-complete-box p {

        color:
          #bbb;

      }


      /* =========================================================
         DECISION MAKERS PAGE HIERARCHY
         VIDEOS FIRST, COURSES SECOND, RESOURCES THIRD
      ========================================================= */


      #decision-makers-screen .dm-course-list {

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              240px,
              320px
            )
          );

        justify-content:
          start;

      }


      #decision-makers-screen .dm-resource-grid {

        grid-template-columns:
          1fr;

        max-width:
          900px;

      }


      #decision-makers-screen .dm-resource-card {

        display:
          grid;

        grid-template-columns:
          130px minmax(0, 1fr);

        align-items:
          stretch;

      }


      #decision-makers-screen .dm-resource-cover {

        width:
          130px;

        height:
          100%;

        min-height:
          170px;

        aspect-ratio:
          auto;

      }


      #decision-makers-screen .dm-resource-content {

        display:
          flex;

        flex-direction:
          column;

        justify-content:
          center;

      }


      #decision-makers-screen .dm-resource-download {

        width:
          auto;

        min-width:
          170px;

        align-self:
          flex-start;

      }


      @media(
        max-width:600px
      ) {

        .dm-resource-grid,
        .dm-course-list,
        .dm-course-access-row,
        .dm-auth-code-row,
        .dm-day-actions {

          grid-template-columns:
            1fr;

        }


        #decision-makers-screen .dm-resource-card {

          grid-template-columns:
            105px minmax(0, 1fr);

        }


        #decision-makers-screen .dm-resource-cover {

          width:
            105px;

          min-height:
            145px;

        }


        #decision-makers-screen .dm-resource-content {

          padding:
            14px;

        }


        #decision-makers-screen .dm-resource-download {

          width:
            100%;

          min-width:
            0;

        }


        .dm-auth-signed-panel {

          align-items:
            flex-start;

          flex-direction:
            column;

        }


        #dm-auth-logout {

          width:
            100%;

        }


        .dm-course-player-content {

          padding:
            14px;

        }


        .dm-session-player-shell,
        .dm-course-player-shell {

          border-radius:
            12px;

        }


        .dm-past-day-card {

          grid-template-columns:
            auto 1fr auto;

          gap:
            10px;

          padding:
            12px;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =========================================================
     SESSION PLAYER
  ========================================================= */


  function ensureSessionPlayer() {

    if (
      $(
        "dm-session-player-overlay"
      )
    ) {

      return;

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "dm-session-player-overlay";


    overlay.innerHTML = `

      <div class="dm-session-player-shell">

        <div class="dm-session-player-top">

          <div>

            <span>
              DECISION MAKER SESSION
            </span>

            <h3
              id="dm-session-player-title"
            >
              SESSION
            </h3>

          </div>


          <button
            id="dm-session-player-close"
            type="button"
          >
            ✕
          </button>

        </div>


        <div class="dm-session-video-wrap">

          <iframe
            id="dm-session-player-frame"
            src=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    $(
      "dm-session-player-close"
    ).addEventListener(
      "click",
      closeSessionPlayer
    );


    overlay.addEventListener(
      "click",
      (event) => {

        if (
          event.target === overlay
        ) {

          closeSessionPlayer();

        }

      }
    );

  }


  function openSessionPlayer(
    title,
    id
  ) {

    if (
      !id
    ) {

      return;

    }


    ensureSessionPlayer();


    $(
      "dm-session-player-title"
    ).textContent =
      title ||
      "SESSION";


    $(
      "dm-session-player-frame"
    ).src =
      `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;


    $(
      "dm-session-player-overlay"
    ).classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeSessionPlayer() {

    const frame =
      $(
        "dm-session-player-frame"
      );


    if (
      frame
    ) {

      frame.src =
        "";

    }


    $(
      "dm-session-player-overlay"
    )
      ?.classList.remove(
        "show"
      );


    document.body.style.overflow =
      "";

  }


  /* =========================================================
     SESSIONS
  ========================================================= */


  function renderSessions() {

    const grid =
      document.querySelector(
        "#decision-makers-screen .session-grid"
      );


    if (
      !grid
    ) {

      return;

    }


    const list =
      sortItems(
        sessions.filter(
          isPublished
        )
      );


    if (
      !list.length
    ) {

      return;

    }


    grid.innerHTML =
      "";


    list.forEach(
      (item) => {

        const id =
          item.youtube_id ||
          youtubeId(
            item.youtube_url
          );


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "session-card";


        card.innerHTML = `

          <div class="session-number">

            ${
              String(
                Number(
                  item.session_number ||
                  item.id ||
                  1
                )
              ).padStart(
                2,
                "0"
              )
            }

          </div>


          <div class="session-content">

            <span>
              FOCUSED SESSION
            </span>

            <h3>
              ${esc(
                item.title
              )}
            </h3>

            <p>
              ${esc(
                item.description
              )}
            </p>


            ${
              id
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

                `
            }

          </div>

        `;


        if (
          id
        ) {

          card
            .querySelector(
              "button"
            )
            .addEventListener(
              "click",
              () =>

                openSessionPlayer(
                  item.title,
                  id
                )
            );

        }


        grid.appendChild(
          card
        );

      }
    );

  }


  /* =========================================================
     CHALLENGES
  ========================================================= */


  function loadChallengeState() {

    try {

      return (
        JSON.parse(
          localStorage.getItem(
            CHALLENGE_KEY
          )
        )
        ||
        {}
      );

    }
    catch (_) {

      return {};

    }

  }


  function saveChallengeState(
    state
  ) {

    try {

      localStorage.setItem(
        CHALLENGE_KEY,
        JSON.stringify(
          state
        )
      );

    }
    catch (_) {}

  }


  function renderChallenges() {

    const grid =
      document.querySelector(
        "#decision-makers-screen .action-grid"
      );


    if (
      !grid
    ) {

      return;

    }


    const list =
      sortItems(
        challenges.filter(
          isPublished
        )
      );


    if (
      !list.length
    ) {

      return;

    }


    const state =
      loadChallengeState();


    grid.innerHTML =
      "";


    list.forEach(
      (item) => {

        const key =
          String(
            item.id ??
            item.challenge_number ??
            item.title
          );


        const accepted =
          Boolean(
            state[key]
              ?.accepted
          );


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "action-card";


        card.innerHTML = `

          <div class="action-number">

            ${
              String(
                Number(
                  item.challenge_number ||
                  item.id ||
                  1
                )
              ).padStart(
                2,
                "0"
              )
            }

          </div>


          <h3>
            ${esc(
              item.title
            )}
          </h3>


          <p>
            ${esc(
              item.description
            )}
          </p>


          <button
            class="action-button ${
              accepted
                ? "accepted"
                : ""
            }"
            type="button"
            ${
              accepted
                ? "disabled"
                : ""
            }
          >

            ${
              accepted
                ? "CHALLENGE ACCEPTED ✓"
                : esc(
                    item.button_text ||
                    "ACCEPT CHALLENGE"
                  )
            }

          </button>

        `;


        const button =
          card.querySelector(
            "button"
          );


        button.addEventListener(
          "click",
          () => {

            state[key] = {

              accepted:
                true,

              accepted_at:
                new Date()
                  .toISOString()

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


            const title =
              $(
                "challenge-title"
              );


            const copy =
              $(
                "challenge-copy"
              );


            const box =
              $(
                "decision-challenge-message"
              );


            if (
              title
            ) {

              title.textContent =
                item.title ||
                "YOU MADE THE DECISION.";

            }


            if (
              copy
            ) {

              copy.textContent =
                item.completion_message ||
                "NOW TAKE ACTION.";

            }


            box
              ?.classList.add(
                "show"
              );

          }
        );


        grid.appendChild(
          card
        );

      }
    );

  }


  /* =========================================================
     RESOURCES
  ========================================================= */


  function ensureResourceSection() {

    let section =
      $(
        "decision-makers-resources-section"
      );


    if (
      section
    ) {

      return section;

    }


    const screen =
      $(
        "decision-makers-screen"
      );


    if (
      !screen
    ) {

      return null;

    }


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


    const footer =
      screen.querySelector(
        ".boss-footer"
      );


    if (
      footer
    ) {

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


    arrangeDecisionMakersSections();


    return section;

  }


  function renderResources() {

    const list =
      sortItems(

        resources.filter(
          (item) =>

            isPublished(
              item
            )

            &&

            String(
              item.file_url ||
              ""
            ).trim()
        )

      );


    if (
      !list.length
    ) {

      $(
        "decision-makers-resources-section"
      )
        ?.remove();


      return;

    }


    const section =
      ensureResourceSection();


    const grid =
      $(
        "decision-makers-resource-grid"
      );


    if (
      !section ||
      !grid
    ) {

      return;

    }


    grid.innerHTML =
      "";


    list.forEach(
      (item) => {

        const cover =
          String(
            item.cover_image_url ||
            ""
          ).trim();


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "dm-resource-card";


        card.innerHTML = `

          <div class="dm-resource-cover">

            ${
              cover
                ? `

                  <img
                    src="${esc(
                      cover
                    )}"
                    alt="${esc(
                      item.title ||
                      "Decision Maker Resource"
                    )}"
                  >

                `
                : `

                  <div class="dm-resource-placeholder">

                    <span>
                      DECISION MAKERS
                    </span>

                    <strong>
                      RESOURCE
                    </strong>

                  </div>

                `
            }

          </div>


          <div class="dm-resource-content">

            <span class="dm-resource-type">

              ${
                esc(
                  item.resource_type ||
                  "RESOURCE"
                )
              }

            </span>


            <h3>
              ${esc(
                item.title
              )}
            </h3>


            <p>
              ${esc(
                item.description
              )}
            </p>


            <button
              class="dm-resource-download"
              type="button"
            >

              ${
                esc(
                  item.button_text ||
                  "OPEN RESOURCE"
                )
              }

            </button>

          </div>

        `;


        card
          .querySelector(
            "button"
          )
          .addEventListener(
            "click",
            () => {

              window.open(
                item.file_url,
                "_blank",
                "noopener,noreferrer"
              );

            }
          );


        grid.appendChild(
          card
        );

      }
    );

  }


  /* =========================================================
     DECISION MAKERS PAGE ORDER
     VIDEOS + ACTION FIRST, COURSES SECOND, RESOURCES THIRD
  ========================================================= */


  function arrangeDecisionMakersSections() {

    const screen =
      $(
        "decision-makers-screen"
      );


    if (
      !screen
    ) {

      return;

    }


    const courses =
      $(
        "decision-makers-my-courses"
      );


    const resourcesSection =
      $(
        "decision-makers-resources-section"
      );


    const actionSection =
      screen
        .querySelector(
          ".action-grid"
        )
        ?.closest(
          ".decision-section"
        );


    const sessionSection =
      screen.querySelector(
        ".session-section"
      );


    const videoAnchor =
      actionSection ||
      sessionSection ||
      screen.querySelector(
        ".decision-section"
      );


    if (
      courses &&
      videoAnchor
    ) {

      videoAnchor
        .insertAdjacentElement(
          "afterend",
          courses
        );

    }


    if (
      resourcesSection &&
      courses
    ) {

      courses
        .insertAdjacentElement(
          "afterend",
          resourcesSection
        );

    }

  }


  /* =========================================================
     MY COURSES
  ========================================================= */


  function setCourseStatus(
    message,
    type = ""
  ) {

    const box =
      $(
        "dm-course-status"
      );


    if (
      !box
    ) {

      return;

    }


    box.className =
      `dm-course-status ${type}`
        .trim();


    box.textContent =
      message ||
      "";

  }


  function ensureMyCourses() {

    let section =
      $(
        "decision-makers-my-courses"
      );


    if (
      section
    ) {

      return section;

    }


    const screen =
      $(
        "decision-makers-screen"
      );


    if (
      !screen
    ) {

      return null;

    }


    section =
      document.createElement(
        "section"
      );


    section.id =
      "decision-makers-my-courses";


    section.className =
      "decision-section dm-my-courses";


    section.innerHTML = `

      <div class="decision-heading">

        <div>

          <span class="decision-kicker">
            YOUR DECISION. YOUR PROGRESS.
          </span>

          <h2>
            MY COURSES
          </h2>

        </div>

        <span class="red-line"></span>

      </div>


      <p class="decision-section-copy">
        Securely sign in with the email connected to your Decision Makers account. We will send you a 6 digit login code.
      </p>


      <div class="dm-course-access">

        <div
          id="dm-auth-login-panel"
        >

          <label
            for="dm-course-email"
          >
            ACCOUNT EMAIL
          </label>


          <div class="dm-course-access-row">

            <input
              id="dm-course-email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
            >


            <button
              id="dm-send-login-code"
              type="button"
            >
              SEND LOGIN CODE
            </button>

          </div>

        </div>


        <div
          id="dm-auth-code-panel"
          class="dm-auth-code-panel dm-auth-hidden"
        >

          <label
            for="dm-login-code"
          >
            6 DIGIT LOGIN CODE
          </label>


          <p
            id="dm-auth-code-note"
            class="dm-auth-code-note"
          >
            Check your email and enter the code we sent you. If you do not see it, check your spam or junk folder.
          </p>


          <div class="dm-auth-code-row">

            <input
              id="dm-login-code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="000000"
            >


            <button
              id="dm-verify-login-code"
              type="button"
            >
              SIGN IN
            </button>

          </div>


          <div class="dm-auth-code-actions">

            <button
              id="dm-resend-login-code"
              class="dm-auth-link-button"
              type="button"
            >
              SEND NEW CODE
            </button>


            <button
              id="dm-change-login-email"
              class="dm-auth-link-button"
              type="button"
            >
              USE DIFFERENT EMAIL
            </button>

          </div>

        </div>


        <div
          id="dm-auth-signed-panel"
          class="dm-auth-signed-panel dm-auth-hidden"
        >

          <div class="dm-auth-signed-copy">

            <span>
              SECURELY SIGNED IN
            </span>

            <strong
              id="dm-auth-customer-name"
            >
              DECISION MAKER
            </strong>

            <small
              id="dm-auth-customer-email"
            ></small>

          </div>


          <button
            id="dm-auth-logout"
            class="dm-auth-link-button"
            type="button"
          >
            LOG OUT
          </button>

        </div>


        <div
          id="dm-course-status"
          class="dm-course-status"
          aria-live="polite"
        ></div>

      </div>


      <div
        id="dm-course-list"
        class="dm-course-list"
      ></div>

    `;


    screen.appendChild(
      section
    );


    arrangeDecisionMakersSections();


    const email =
      savedEmail();


    if (
      email
    ) {

      $(
        "dm-course-email"
      ).value =
        email;

    }


    $(
      "dm-send-login-code"
    ).addEventListener(
      "click",
      () => sendLoginCode()
    );


    $(
      "dm-course-email"
    ).addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
          "Enter"
        ) {

          sendLoginCode();

        }

      }
    );


    $(
      "dm-login-code"
    ).addEventListener(
      "input",
      (event) => {

        event.target.value =
          String(
            event.target.value ||
            ""
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              6
            );

      }
    );


    $(
      "dm-login-code"
    ).addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
          "Enter"
        ) {

          verifyLoginCode();

        }

      }
    );


    $(
      "dm-verify-login-code"
    ).addEventListener(
      "click",
      verifyLoginCode
    );


    $(
      "dm-resend-login-code"
    ).addEventListener(
      "click",
      () =>

        sendLoginCode(
          authCodeEmail
        )
    );


    $(
      "dm-change-login-email"
    ).addEventListener(
      "click",
      () => {

        authCodeEmail =
          "";


        $(
          "dm-login-code"
        ).value =
          "";


        showAuthView(
          "login"
        );


        setCourseStatus(
          ""
        );


        setTimeout(
          () =>

            $(
              "dm-course-email"
            )?.focus(),

          50
        );

      }
    );


    $(
      "dm-auth-logout"
    ).addEventListener(
      "click",
      logoutSecureCustomer
    );


    showAuthView(
      "login"
    );


    return section;

  }


  function showAuthView(
    mode
  ) {

    const login =
      $(
        "dm-auth-login-panel"
      );


    const code =
      $(
        "dm-auth-code-panel"
      );


    const signed =
      $(
        "dm-auth-signed-panel"
      );


    login
      ?.classList.toggle(
        "dm-auth-hidden",
        mode !== "login"
      );


    code
      ?.classList.toggle(
        "dm-auth-hidden",
        mode !== "code"
      );


    signed
      ?.classList.toggle(
        "dm-auth-hidden",
        mode !== "signed"
      );

  }


  function renderSignedInCustomer() {

    if (
      !activeCustomer
    ) {

      showAuthView(
        "login"
      );


      return;

    }


    const name =
      String(
        activeCustomer.name ||
        ""
      ).trim();


    const email =
      String(
        activeCustomer.email ||
        activeEmail ||
        ""
      )
        .trim()
        .toLowerCase();


    const nameBox =
      $(
        "dm-auth-customer-name"
      );


    const emailBox =
      $(
        "dm-auth-customer-email"
      );


    if (
      nameBox
    ) {

      nameBox.textContent =
        name ||
        "DECISION MAKER";

    }


    if (
      emailBox
    ) {

      emailBox.textContent =
        email;

    }


    showAuthView(
      "signed"
    );

  }


  function clearCourseCards() {

    const list =
      $(
        "dm-course-list"
      );


    if (
      list
    ) {

      list.innerHTML =
        "";

    }

  }


  function handleSessionExpired(
    message =
      "Your secure login expired. Sign in again."
  ) {

    clearAuthSession();


    clearCourseCards();


    closeCoursePlayer();


    showAuthView(
      "login"
    );


    const email =
      savedEmail();


    if (
      email &&
      $(
        "dm-course-email"
      )
    ) {

      $(
        "dm-course-email"
      ).value =
        email;

    }


    setCourseStatus(
      message,
      "error"
    );

  }


  async function restoreSecureSession() {

    ensureMyCourses();


    const token =
      savedAuthToken();


    if (
      !token
    ) {

      const savedCustomer =
        savedAuthCustomer();


      if (
        savedCustomer?.email
      ) {

        $(
          "dm-course-email"
        ).value =
          savedCustomer.email;

      }


      showAuthView(
        "login"
      );


      return;

    }


    activeAuthToken =
      token;


    setCourseStatus(
      "RESTORING SECURE LOGIN..."
    );


    try {

      const result =
        await api(
          "/auth/session"
        );


      if (
        !result.authenticated ||
        !result.customer
      ) {

        throw new Error(
          "Secure login was not restored."
        );

      }


      saveAuthSession(
        token,
        result.customer
      );


      renderSignedInCustomer();


      setCourseStatus(
        "SECURE LOGIN ACTIVE",
        "success"
      );


      await loadMyCourses();

    }
    catch (error) {

      clearAuthSession();


      clearCourseCards();


      showAuthView(
        "login"
      );


      setCourseStatus(
        error.status === 401
          ? "Your previous login expired. Enter your email to sign in again."
          : error.message ||
            "Secure login could not be restored.",
        error.status === 401
          ? ""
          : "error"
      );

    }

  }


  async function sendLoginCode(
    forcedEmail = ""
  ) {

    ensureMyCourses();


    const email =
      String(

        forcedEmail

        ||

        $(
          "dm-course-email"
        )?.value

        ||

        ""

      )
        .trim()
        .toLowerCase();


    if (
      !validEmail(
        email
      )
    ) {

      setCourseStatus(
        "Enter a valid email address.",
        "error"
      );


      return;

    }


    saveEmail(
      email
    );


    $(
      "dm-course-email"
    ).value =
      email;


    const button =
      $(
        "dm-send-login-code"
      );


    const resend =
      $(
        "dm-resend-login-code"
      );


    const old =
      button?.textContent ||
      "SEND LOGIN CODE";


    if (
      button
    ) {

      button.disabled =
        true;


      button.textContent =
        "SENDING...";

    }


    if (
      resend
    ) {

      resend.disabled =
        true;

    }


    setCourseStatus(
      "SENDING YOUR SECURE LOGIN CODE..."
    );


    try {

      const result =
        await api(
          "/auth/send-code",
          {

            method:
              "POST",

            body:
              JSON.stringify({
                email
              })

          }
        );


      authCodeEmail =
        email;


      $(
        "dm-auth-code-note"
      ).textContent =
        result.email
          ? `Code sent to ${result.email}. It expires in 10 minutes. If you do not see it, check your spam or junk folder.`
          : "If an account exists for that email, a login code has been sent. If you do not see it, check your spam or junk folder.";


      $(
        "dm-login-code"
      ).value =
        "";


      showAuthView(
        "code"
      );


      setCourseStatus(
        "LOGIN CODE SENT ✓",
        "success"
      );


      setTimeout(
        () =>

          $(
            "dm-login-code"
          )?.focus(),

        50
      );

    }
    catch (error) {

      const waiting =
        error.status === 503;


      setCourseStatus(
        waiting
          ? "Secure email login is still being activated. Try again after the email service is verified."
          : error.message ||
            "Could not send the login code.",
        "error"
      );

    }
    finally {

      if (
        button
      ) {

        button.disabled =
          false;


        button.textContent =
          old;

      }


      if (
        resend
      ) {

        resend.disabled =
          false;

      }

    }

  }


  async function verifyLoginCode() {

    const email =
      String(
        authCodeEmail ||
        $(
          "dm-course-email"
        )?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const code =
      String(
        $(
          "dm-login-code"
        )?.value ||
        ""
      )
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );


    if (
      !validEmail(
        email
      ) ||
      !/^\d{6}$/.test(
        code
      )
    ) {

      setCourseStatus(
        "Enter the 6 digit code from your email.",
        "error"
      );


      return;

    }


    const button =
      $(
        "dm-verify-login-code"
      );


    const old =
      button?.textContent ||
      "SIGN IN";


    if (
      button
    ) {

      button.disabled =
        true;


      button.textContent =
        "VERIFYING...";

    }


    setCourseStatus(
      "VERIFYING SECURE LOGIN..."
    );


    try {

      const result =
        await api(
          "/auth/verify-code",
          {

            method:
              "POST",

            body:
              JSON.stringify({
                email,
                code
              })

          }
        );


      if (
        !result.authenticated ||
        !result.token ||
        !result.customer
      ) {

        throw new Error(
          "Secure login could not be completed."
        );

      }


      saveAuthSession(
        result.token,
        result.customer
      );


      authCodeEmail =
        "";


      $(
        "dm-login-code"
      ).value =
        "";


      renderSignedInCustomer();


      setCourseStatus(
        "SECURE LOGIN ACTIVE ✓",
        "success"
      );


      await loadMyCourses();

    }
    catch (error) {

      setCourseStatus(
        error.message ||
        "That login code could not be verified.",
        "error"
      );

    }
    finally {

      if (
        button
      ) {

        button.disabled =
          false;


        button.textContent =
          old;

      }

    }

  }


  async function logoutSecureCustomer() {

    const button =
      $(
        "dm-auth-logout"
      );


    if (
      button
    ) {

      button.disabled =
        true;


      button.textContent =
        "LOGGING OUT...";

    }


    try {

      if (
        activeAuthToken ||
        savedAuthToken()
      ) {

        await api(
          "/auth/logout",
          {
            method:
              "POST"
          }
        );

      }

    }
    catch (_) {

      /*
        Local logout still happens if the network is unavailable.
      */

    }
    finally {

      clearAuthSession();


      clearCourseCards();


      closeCoursePlayer();


      showAuthView(
        "login"
      );


      if (
        button
      ) {

        button.disabled =
          false;


        button.textContent =
          "LOG OUT";

      }


      setCourseStatus(
        "SIGNED OUT"
      );

    }

  }


  async function courseState(
    email,
    course
  ) {

    try {

      const result =
        await api(

          `/dm-course-runs/current?email=${encodeURIComponent(
            email
          )}&course_id=${encodeURIComponent(
            course.id
          )}`

        );


      return {

        course,

        unlocked:
          Boolean(
            result.unlocked
          ),

        hasRun:
          Boolean(
            result.has_run
          ),

        data:
          result.data ||
          null

      };

    }
    catch (error) {

      if (
        error.status ===
        403
      ) {

        return {

          course,

          unlocked:
            false,

          hasRun:
            false,

          data:
            null

        };

      }


      throw error;

    }

  }


  async function loadMyCourses() {

    ensureMyCourses();


    const email =
      String(
        activeCustomer?.email ||
        activeEmail ||
        ""
      )
        .trim()
        .toLowerCase();


    const list =
      $(
        "dm-course-list"
      );


    if (
      !activeAuthToken ||
      !validEmail(
        email
      )
    ) {

      clearCourseCards();


      showAuthView(
        "login"
      );


      setCourseStatus(
        "Secure login is required to view your courses."
      );


      return;

    }


    activeEmail =
      email;


    renderSignedInCustomer();


    setCourseStatus(
      "LOADING YOUR COURSES..."
    );


    if (
      list
    ) {

      list.innerHTML = `

        <div class="dm-course-loading">
          CHECKING COURSE ACCESS...
        </div>

      `;

    }


    try {

      const courseResult =
        await api(
          "/dm-courses"
        );


      const courses =
        Array.isArray(
          courseResult.data
        )
          ? courseResult.data
          : [];


      const states =
        await Promise.all(

          courses.map(
            (course) =>

              courseState(
                email,
                course
              )
          )

        );


      const owned =
        states.filter(
          (state) =>
            state.unlocked
        );


      renderCourseCards(
        email,
        owned
      );


      setCourseStatus(

        owned.length

          ? `${owned.length} COURSE${
              owned.length === 1
                ? ""
                : "S"
            } READY`

          : "No unlocked courses were found for this account.",


        owned.length
          ? "success"
          : ""

      );

    }
    catch (error) {

      if (
        error.status === 401
      ) {

        handleSessionExpired(
          error.message ||
          "Your secure login expired. Sign in again."
        );


        return;

      }


      if (
        list
      ) {

        list.innerHTML =
          "";

      }


      setCourseStatus(
        error.message ||
        "Could not load your courses.",
        "error"
      );

    }

  }


  function renderCourseCards(
    email,
    states
  ) {

    const list =
      $(
        "dm-course-list"
      );


    if (
      !list
    ) {

      return;

    }


    list.innerHTML =
      "";


    if (
      !states.length
    ) {

      list.innerHTML = `

        <div class="dm-course-empty">

          NO COURSES FOUND

          <br>

          <small>
            Use the same email connected to your course access.
          </small>

        </div>

      `;


      return;

    }


    states.forEach(
      (state) => {

        const course =
          state.course;


        const data =
          state.data ||
          {};


        const run =
          data.run ||
          null;


        const summary =
          data.summary ||
          null;


        const percent =
          Math.max(
            0,
            Math.min(
              100,
              Number(
                summary
                  ?.completion_percent ||
                0
              )
            )
          );


        const total =
          Number(
            course.total_days ||
            summary?.total_days ||
            30
          );


        const current =
          Number(
            summary?.next_day ||
            run?.current_day ||
            1
          );


        const complete =
          Boolean(
            summary?.complete ||
            run?.status ===
              "completed"
          );


        const cover =
          String(
            course.cover_url ||
            ""
          ).trim();


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "dm-course-card";


        card.innerHTML = `

          <div class="dm-course-cover">

            ${
              cover
                ? `

                  <img
                    src="${esc(
                      cover
                    )}"
                    alt="${esc(
                      course.title
                    )}"
                  >

                `
                : `

                  <div class="dm-course-cover-fallback">

                    <span>
                      DECISION MAKERS
                    </span>

                    <strong>
                      GREATNESS IS A DECISION
                    </strong>

                  </div>

                `
            }

          </div>


          <div class="dm-course-card-body">

            <span class="dm-course-kicker">

              ${
                complete
                  ? "COURSE COMPLETE"
                  : "YOUR COURSE"
              }

            </span>


            <h3>

              ${esc(
                course.title
              )}

            </h3>


            <p>

              ${esc(
                course.subtitle ||
                course.description ||
                ""
              )}

            </p>


            ${
              run
                ? `

                  <div class="dm-progress-copy">

                    <strong>

                      ${
                        complete
                          ? "COMPLETE"
                          : `DAY ${current} OF ${total}`
                      }

                    </strong>

                    <span>
                      ${percent}% COMPLETE
                    </span>

                  </div>


                  <div class="dm-progress-track">

                    <div
                      style="width:${percent}%"
                    ></div>

                  </div>

                `
                : `

                  <div class="dm-progress-copy">

                    <strong>
                      READY TO BEGIN
                    </strong>

                    <span>

                      ${
                        Number(
                          course.price_cents ||
                          0
                        )
                          ? `$${(
                              Number(
                                course.price_cents
                              )
                              /
                              100
                            ).toFixed(
                              2
                            )}`
                          : "FREE"
                      }

                    </span>

                  </div>

                `
            }


            <button
              class="dm-course-primary"
              type="button"
            >

              ${
                complete
                  ? "COURSE COMPLETE"
                  : run
                    ? "CONTINUE COURSE"
                    : "START COURSE"
              }

            </button>

          </div>

        `;


        const button =
          card.querySelector(
            "button"
          );


        if (
          complete
        ) {

          button.disabled =
            true;

        }
        else if (
          run
        ) {

          button.addEventListener(
            "click",
            () =>

              openCoursePlayer(
                email,
                course,
                data
              )
          );

        }
        else {

          button.addEventListener(
            "click",
            () =>

              startCourse(
                email,
                course,
                button
              )
          );

        }


        list.appendChild(
          card
        );

      }
    );

  }


  async function startCourse(
    email,
    course,
    button
  ) {

    const old =
      button.textContent;


    button.disabled =
      true;


    button.textContent =
      "STARTING COURSE...";


    try {

      const result =
        await api(
          "/dm-course-runs/start",
          {

            method:
              "POST",

            body:
              JSON.stringify({
                email,
                course_id:
                  Number(
                    course.id
                  )
              })

          }
        );


      if (
        result.data
      ) {

        await openCoursePlayer(
          email,
          course,
          result.data
        );


        loadMyCourses();

      }

    }
    catch (error) {

      if (
        error.status === 401
      ) {

        handleSessionExpired(
          error.message ||
          "Your secure login expired. Sign in again."
        );


        return;

      }


      alert(
        error.message ||
        "Could not start this course."
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        old;

    }

  }


  /* =========================================================
     COURSE PLAYER
  ========================================================= */


  function ensureCoursePlayer() {

    let overlay =
      $(
        "dm-course-player-overlay"
      );


    if (
      overlay
    ) {

      return overlay;

    }


    overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "dm-course-player-overlay";


    overlay.innerHTML = `

      <div class="dm-course-player-shell">

        <div class="dm-course-player-top">

          <div>

            <span>
              DECISION MAKERS
            </span>

            <h3
              id="dm-course-player-title"
            >
              COURSE
            </h3>

          </div>


          <button
            id="dm-course-player-close"
            type="button"
          >
            ✕
          </button>

        </div>


        <div
          id="dm-course-player-content"
          class="dm-course-player-content"
        ></div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    $(
      "dm-course-player-close"
    ).addEventListener(
      "click",
      closeCoursePlayer
    );


    overlay.addEventListener(
      "click",
      (event) => {

        if (
          event.target === overlay
        ) {

          closeCoursePlayer();

        }

      }
    );


    return overlay;

  }


  function closeCoursePlayer() {

    const overlay =
      $(
        "dm-course-player-overlay"
      );


    overlay
      ?.querySelectorAll(
        "video,audio"
      )
      .forEach(
        (media) => {

          try {

            media.pause();

          }
          catch (_) {}

        }
      );


    overlay
      ?.querySelectorAll(
        "iframe"
      )
      .forEach(
        (frame) => {

          frame.src =
            "";

        }
      );


    overlay
      ?.classList.remove(
        "show"
      );


    document.body.style.overflow =
      "";

  }


  async function openCoursePlayer(
    email,
    course,
    data = null
  ) {

    const overlay =
      ensureCoursePlayer();


    $(
      "dm-course-player-title"
    ).textContent =
      course.title ||
      "DECISION MAKER COURSE";


    $(
      "dm-course-player-content"
    ).innerHTML = `

      <div class="dm-course-loading">
        LOADING TODAY'S COURSE...
      </div>

    `;


    overlay.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";


    try {

      let currentData =
        data;


      if (
        !currentData?.run
      ) {

        const current =
          await api(

            `/dm-course-runs/current?email=${encodeURIComponent(
              email
            )}&course_id=${encodeURIComponent(
              course.id
            )}`

          );


        currentData =
          current.data;

      }


      if (
        !currentData?.run
      ) {

        throw new Error(
          "Course run was not found."
        );

      }


      const [
        daysResult,
        progressResult
      ] =
        await Promise.all([

          api(

            `/dm-courses/${encodeURIComponent(
              course.id
            )}/days`

          ),


          api(

            `/dm-course-runs/${encodeURIComponent(
              currentData.run.id
            )}/progress?email=${encodeURIComponent(
              email
            )}`

          )

        ]);


      activeEmail =
        email;


      activeCourse =
        course;


      activeRun =
        currentData.run;


      activeSummary =
        currentData.summary

        ||

        progressResult
          ?.data
          ?.summary

        ||

        {};


      activeDays =
        Array.isArray(
          daysResult.data
        )
          ? daysResult.data
          : [];


      activeProgress =
        Array.isArray(
          progressResult
            ?.data
            ?.progress
        )
          ? progressResult
              .data
              .progress
          : [];


      renderCurrentDay();

    }
    catch (error) {

      if (
        error.status === 401
      ) {

        handleSessionExpired(
          error.message ||
          "Your secure login expired. Sign in again."
        );


        return;

      }


      $(
        "dm-course-player-content"
      ).innerHTML = `

        <div class="dm-course-error">

          ${
            esc(
              error.message ||
              "Could not load this course."
            )
          }

        </div>

      `;

    }

  }


  function videoHTML(
    day
  ) {

    const url =
      String(
        day.video_url ||
        ""
      ).trim();


    if (
      !url
    ) {

      return "";

    }


    const id =
      youtubeId(
        url
      );


    if (
      id
    ) {

      return `

        <div class="dm-course-video">

          <iframe
            src="https://www.youtube.com/embed/${esc(
              id
            )}?rel=0"
            title="${esc(
              day.video_title ||
              day.title ||
              "Course Video"
            )}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>

        </div>

      `;

    }


    return `

      <div class="dm-course-video">

        <video
          controls
          playsinline
          preload="metadata"
          src="${esc(
            url
          )}"
        ></video>

      </div>

    `;

  }


  function audioHTML(
    day
  ) {

    const url =
      String(
        day.audio_url ||
        ""
      ).trim();


    if (
      !url
    ) {

      return "";

    }


    return `

      <div class="dm-course-audio">

        <span>

          ${esc(
            day.audio_title ||
            "TODAY'S AUDIO"
          )}

        </span>


        <audio
          controls
          preload="metadata"
          src="${esc(
            url
          )}"
        ></audio>

      </div>

    `;

  }


  function promptBox(
    id,
    label,
    prompt,
    value,
    extra = "",
    readOnly = false
  ) {

    return `

      <section
        class="dm-course-prompt ${extra}"
      >

        <label
          for="${id}"
        >

          ${esc(
            label
          )}

        </label>


        <p>

          ${esc(
            prompt
          )}

        </p>


        <textarea
          id="${id}"
          rows="4"
          ${
            readOnly
              ? "readonly"
              : ""
          }
        >${esc(
          value ||
          ""
        )}</textarea>

      </section>

    `;

  }


  function renderCurrentDay() {

    renderDay(
      currentDayNumber(),
      false
    );

  }


  function renderDay(
    dayNumber,
    reviewMode = false
  ) {

    const content =
      $(
        "dm-course-player-content"
      );


    if (
      !content ||
      !activeRun ||
      !activeCourse
    ) {

      return;

    }


    const day =
      courseDay(
        dayNumber
      );


    if (
      !day
    ) {

      content.innerHTML = `

        <div class="dm-complete-box">

          <span>
            COURSE COMPLETE
          </span>

          <h2>
            YOU ARE A DECISION MAKER
          </h2>

          <p>
            Your 30 day run is complete.
          </p>

        </div>

      `;


      return;

    }


    const saved =
      savedForDay(
        day.day_number
      );


    const total =
      Number(
        activeCourse.total_days ||
        activeSummary?.total_days ||
        30
      );


    const percent =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            activeSummary
              ?.completion_percent ||
            0
          )
        )
      );


    const text =
      esc(
        day.text_content ||
        ""
      )
        .replace(
          /\n/g,
          "<br>"
        );


    const pastDays =
      completedPastDays();


    content.innerHTML = `

      ${
        reviewMode
          ? `

            <div class="dm-review-notice">

              <span>
                REVIEW MODE
              </span>

              <strong>
                You are reviewing a completed day. Your current course progress will not change.
              </strong>

            </div>

          `
          : ""
      }


      <div class="dm-day-head">

        <div>

          <span>

            ${
              reviewMode
                ? "REVIEWING"
                : "CURRENT"
            }

            DAY ${esc(
              day.day_number
            )}

            OF ${esc(
              total
            )}

          </span>


          <h2>

            ${esc(
              day.title
            )}

          </h2>

        </div>


        <strong>

          ${percent}%

        </strong>

      </div>


      <div
        class="dm-progress-track dm-player-progress"
      >

        <div
          style="width:${percent}%"
        ></div>

      </div>


      <div class="dm-course-toolbar">

        ${
          reviewMode
            ? `

              <button
                id="dm-back-current-day"
                class="dm-course-gold-button"
                type="button"
              >
                ← BACK TO CURRENT DAY
              </button>

            `
            : ""
        }


        ${
          pastDays.length
            ? `

              <button
                id="dm-view-past-days"
                class="dm-course-secondary"
                type="button"
              >
                VIEW PAST DAYS
              </button>

            `
            : ""
        }

      </div>


      ${videoHTML(
        day
      )}


      ${audioHTML(
        day
      )}


      ${
        text
          ? `

            <section class="dm-course-message">

              <span>

                ${esc(
                  day.text_title ||
                  "THE MESSAGE"
                )}

              </span>


              <div>
                ${text}
              </div>

            </section>

          `
          : ""
      }


      ${promptBox(
        "dm-answer-decision",
        "TODAY'S DECISION",
        day.decision_prompt ||
        "What decision will you make today?",
        saved.decision_answer,
        "",
        reviewMode
      )}


      ${promptBox(
        "dm-answer-move",
        "TODAY'S MOVE",
        day.move_prompt ||
        "What action will you take today?",
        saved.move_answer,
        "",
        reviewMode
      )}


      ${promptBox(
        "dm-answer-facing",
        "WHAT I'M FACING TODAY",
        day.facing_prompt ||
        "What are you facing today that could get in the way of your goal?",
        saved.facing_answer,
        "dm-facing",
        reviewMode
      )}


      ${promptBox(
        "dm-answer-response",
        "HOW I'LL FACE IT",
        day.response_plan_prompt ||
        "What decision or action will you take so this does not stop you today?",
        saved.response_plan_answer,
        "dm-response",
        reviewMode
      )}


      ${promptBox(
        "dm-answer-reflection",
        "REFLECTION",
        day.reflection_prompt ||
        "What did you learn today?",
        saved.reflection_answer,
        "",
        reviewMode
      )}


      ${
        day.completion_message
          ? `

            <div class="dm-made-decision">

              <span>
                I MADE THE DECISION
              </span>

              <strong>

                ${esc(
                  day.completion_message
                )}

              </strong>

            </div>

          `
          : ""
      }


      ${
        reviewMode
          ? `

            <div class="dm-day-actions">

              <button
                id="dm-review-back-bottom"
                class="dm-course-gold-button"
                type="button"
              >
                BACK TO CURRENT DAY
              </button>


              <button
                id="dm-review-past-list"
                class="dm-course-secondary"
                type="button"
              >
                VIEW PAST DAYS
              </button>

            </div>

          `
          : `

            <div class="dm-day-actions">

              <button
                id="dm-save-day"
                class="dm-course-secondary"
                type="button"
              >
                SAVE PROGRESS
              </button>


              <button
                id="dm-complete-day"
                class="dm-course-primary"
                type="button"
              >
                COMPLETE DAY ${esc(
                  day.day_number
                )}
              </button>

            </div>


            <div
              id="dm-save-status"
              class="dm-save-status"
              aria-live="polite"
            ></div>

          `
      }

    `;


    if (
      reviewMode
    ) {

      $(
        "dm-back-current-day"
      )
        ?.addEventListener(
          "click",
          renderCurrentDay
        );


      $(
        "dm-review-back-bottom"
      )
        ?.addEventListener(
          "click",
          renderCurrentDay
        );


      $(
        "dm-view-past-days"
      )
        ?.addEventListener(
          "click",
          renderPastDaysList
        );


      $(
        "dm-review-past-list"
      )
        ?.addEventListener(
          "click",
          renderPastDaysList
        );


      return;

    }


    $(
      "dm-view-past-days"
    )
      ?.addEventListener(
        "click",
        renderPastDaysList
      );


    $(
      "dm-save-day"
    )
      ?.addEventListener(
        "click",
        () =>

          saveDay(
            day,
            false
          )
      );


    $(
      "dm-complete-day"
    )
      ?.addEventListener(
        "click",
        () =>

          saveDay(
            day,
            true
          )
      );

  }


  /* =========================================================
     PAST DAYS REVIEW
  ========================================================= */


  function renderPastDaysList() {

    const content =
      $(
        "dm-course-player-content"
      );


    if (
      !content
    ) {

      return;

    }


    const completed =
      completedPastDays();


    if (
      !completed.length
    ) {

      content.innerHTML = `

        <div class="dm-past-days-head">

          <span>
            YOUR JOURNEY
          </span>

          <h2>
            PAST DAYS
          </h2>

          <p>
            You have not completed any previous days yet.
          </p>

        </div>


        <button
          id="dm-past-back-current"
          class="dm-course-gold-button"
          type="button"
        >
          BACK TO CURRENT DAY
        </button>

      `;


      $(
        "dm-past-back-current"
      ).addEventListener(
        "click",
        renderCurrentDay
      );


      return;

    }


    let cards =
      "";


    completed.forEach(
      (progress) => {

        const day =
          courseDay(
            progress.day_number
          );


        if (
          !day
        ) {

          return;

        }


        cards += `

          <button
            class="dm-past-day-card"
            type="button"
            data-day="${esc(
              day.day_number
            )}"
          >

            <div class="dm-past-day-number">

              ${esc(
                day.day_number
              )}

            </div>


            <div class="dm-past-day-copy">

              <span>
                COMPLETED DAY
              </span>

              <strong>

                ${esc(
                  day.title
                )}

              </strong>

            </div>


            <div class="dm-past-day-arrow">
              ›
            </div>

          </button>

        `;

      }
    );


    content.innerHTML = `

      <div class="dm-past-days-head">

        <span>
          YOUR JOURNEY
        </span>

        <h2>
          PAST DAYS
        </h2>

        <p>
          Look back at previous lessons, your decisions, your actions, what you faced, and what you learned.
        </p>

      </div>


      <button
        id="dm-past-back-current"
        class="dm-course-gold-button"
        type="button"
      >
        ← BACK TO CURRENT DAY
      </button>


      <div class="dm-past-days-list">

        ${cards}

      </div>


      <button
        id="dm-past-back-current-bottom"
        class="dm-course-secondary"
        type="button"
      >
        BACK TO CURRENT DAY
      </button>

    `;


    $(
      "dm-past-back-current"
    ).addEventListener(
      "click",
      renderCurrentDay
    );


    $(
      "dm-past-back-current-bottom"
    ).addEventListener(
      "click",
      renderCurrentDay
    );


    content
      .querySelectorAll(
        ".dm-past-day-card"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const dayNumber =
                Number(
                  button.dataset.day
                );


              renderDay(
                dayNumber,
                true
              );

            }
          );

        }
      );

  }


  /* =========================================================
     SAVE DAY
  ========================================================= */


  function answer(
    id
  ) {

    return String(
      $(
        id
      )?.value ||
      ""
    ).trim();

  }


  function saveStatus(
    message,
    type = ""
  ) {

    const box =
      $(
        "dm-save-status"
      );


    if (
      !box
    ) {

      return;

    }


    box.className =
      `dm-save-status ${type}`
        .trim();


    box.textContent =
      message ||
      "";

  }


  async function saveDay(
    day,
    completed
  ) {

    const button =
      $(

        completed
          ? "dm-complete-day"
          : "dm-save-day"

      );


    const old =
      button?.textContent ||
      "SAVE";


    if (
      button
    ) {

      button.disabled =
        true;


      button.textContent =
        completed
          ? "COMPLETING..."
          : "SAVING...";

    }


    saveStatus(

      completed
        ? "SAVING AND COMPLETING TODAY..."
        : "SAVING YOUR PROGRESS..."

    );


    try {

      const result =
        await api(
          "/dm-course-progress/save",
          {

            method:
              "POST",


            body:
              JSON.stringify({

                email:
                  activeEmail,


                run_id:
                  Number(
                    activeRun.id
                  ),


                course_id:
                  Number(
                    activeCourse.id
                  ),


                day_id:
                  Number(
                    day.id
                  ),


                day_number:
                  Number(
                    day.day_number
                  ),


                decision_answer:
                  answer(
                    "dm-answer-decision"
                  ),


                move_answer:
                  answer(
                    "dm-answer-move"
                  ),


                facing_answer:
                  answer(
                    "dm-answer-facing"
                  ),


                response_plan_answer:
                  answer(
                    "dm-answer-response"
                  ),


                reflection_answer:
                  answer(
                    "dm-answer-reflection"
                  ),


                completed

              })

          }
        );


      activeRun =
        result
          ?.data
          ?.run

        ||

        activeRun;


      activeSummary =
        result
          ?.data
          ?.summary

        ||

        activeSummary;


      const progress =
        result
          ?.data
          ?.progress;


      if (
        progress
      ) {

        const index =
          activeProgress.findIndex(
            (item) =>

              Number(
                item.day_number
              )

              ===

              Number(
                progress.day_number
              )
          );


        if (
          index >= 0
        ) {

          activeProgress[index] =
            progress;

        }
        else {

          activeProgress.push(
            progress
          );

        }

      }


      saveStatus(

        completed
          ? "DAY COMPLETE ✓"
          : "PROGRESS SAVED ✓",

        "success"

      );


      if (
        completed
      ) {

        loadMyCourses();


        setTimeout(
          renderCurrentDay,
          550
        );

      }

    }
    catch (error) {

      if (
        error.status === 401
      ) {

        handleSessionExpired(
          error.message ||
          "Your secure login expired. Sign in again."
        );


        return;

      }


      saveStatus(
        error.message ||
        "Could not save your progress.",
        "error"
      );

    }
    finally {

      if (
        button
      ) {

        button.disabled =
          false;


        button.textContent =
          old;

      }

    }

  }



  /* =========================================================
     COMPACT AVAILABLE COURSE CARDS
     Keeps public course cards small like resource cards
  ========================================================= */


  function installCompactAvailableCourseStyles() {

    if (
      $(
        "boss-compact-available-course-styles"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "boss-compact-available-course-styles";


    style.textContent = `

      #decision-makers-screen .boss-available-course-compact {

        display:
          grid !important;

        grid-template-columns:
          130px minmax(0, 1fr) !important;

        align-items:
          stretch !important;

        width:
          100% !important;

        max-width:
          900px !important;

        min-height:
          0 !important;

        margin:
          18px 0 0 !important;

        overflow:
          hidden !important;

      }


      #decision-makers-screen .boss-available-course-cover {

        width:
          130px !important;

        min-height:
          0 !important;

        aspect-ratio:
          auto !important;

        overflow:
          hidden !important;

        display:
          flex !important;

        align-items:
          center !important;

        justify-content:
          center !important;

        background:
          #000 !important;

      }


      #decision-makers-screen .boss-available-course-image {

        display:
          block !important;

        width:
          100% !important;

        height:
          auto !important;

        min-height:
          0 !important;

        max-height:
          none !important;

        object-fit:
          contain !important;

        object-position:
          center center !important;

      }


      #decision-makers-screen .boss-available-course-compact h2,
      #decision-makers-screen .boss-available-course-compact h3 {

        font-size:
          20px !important;

        line-height:
          1.15 !important;

        margin:
          5px 0 7px !important;

      }


      #decision-makers-screen .boss-available-course-compact p {

        font-size:
          12px !important;

        line-height:
          1.45 !important;

        margin:
          0 0 10px !important;

      }


      #decision-makers-screen .boss-available-course-button {

        width:
          auto !important;

        min-width:
          160px !important;

        max-width:
          240px !important;

        min-height:
          0 !important;

        padding:
          11px 18px !important;

        margin-top:
          10px !important;

        align-self:
          flex-start !important;

      }


      @media(
        max-width:600px
      ) {

        #decision-makers-screen .boss-available-course-compact {

          grid-template-columns:
            105px minmax(0, 1fr) !important;

        }


        #decision-makers-screen .boss-available-course-cover {

          width:
            105px !important;

          min-height:
            0 !important;

        }


        #decision-makers-screen .boss-available-course-image {

          min-height:
            0 !important;

          max-height:
            none !important;

        }


        #decision-makers-screen .boss-available-course-compact h2,
        #decision-makers-screen .boss-available-course-compact h3 {

          font-size:
            17px !important;

        }


        #decision-makers-screen .boss-available-course-button {

          width:
            100% !important;

          min-width:
            0 !important;

          max-width:
            none !important;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  function compactAvailableCourseCards() {

    installCompactAvailableCourseStyles();


    const screen =
      $(
        "decision-makers-screen"
      );


    if (
      !screen
    ) {

      return;

    }


    const controls =
      [
        ...screen.querySelectorAll(
          "button,a"
        )
      ];


    controls.forEach(
      (control) => {

        const label =
          String(
            control.textContent ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim()
            .toUpperCase();


        if (
          label !==
          "VIEW COURSE"
        ) {

          return;

        }


        let card =
          control.closest(
            "article"
          );


        if (
          !card
        ) {

          card =
            control.closest(
              '[class*="course-card"],[class*="course_card"],[class*="courseCard"]'
            );

        }


        if (
          !card
        ) {

          let node =
            control.parentElement;


          while (
            node &&
            node !== screen
          ) {

            if (
              node.querySelector(
                "img"
              ) &&
              (
                node.textContent ||
                ""
              ).includes(
                "$"
              )
            ) {

              card =
                node;

              break;

            }


            node =
              node.parentElement;

          }

        }


        if (
          !card
        ) {

          return;

        }


        card.classList.add(
          "boss-available-course-compact"
        );


        control.classList.add(
          "boss-available-course-button"
        );


        const image =
          card.querySelector(
            "img"
          );


        if (
          image
        ) {

          image.classList.add(
            "boss-available-course-image"
          );


          const cover =
            image.parentElement;


          if (
            cover &&
            cover !== card
          ) {

            cover.classList.add(
              "boss-available-course-cover"
            );

          }

        }

      }
    );

  }


  function watchAvailableCourseCards() {

    compactAvailableCourseCards();


    const screen =
      $(
        "decision-makers-screen"
      );


    if (
      !screen ||
      screen.dataset.compactCourseWatch ===
        "1"
    ) {

      return;

    }


    screen.dataset.compactCourseWatch =
      "1";


    const observer =
      new MutationObserver(
        () => {

          compactAvailableCourseCards();

        }
      );


    observer.observe(
      screen,
      {
        childList:
          true,

        subtree:
          true
      }
    );

  }


  /* =========================================================
     LOAD BACKEND CONTENT
  ========================================================= */


  async function loadBackend() {

    installStyles();


    ensureMyCourses();


    const authRestore =
      restoreSecureSession();


    const results =
      await Promise.allSettled([

        getArray(
          "/decision-maker-sessions"
        ),


        getArray(
          "/decision-maker-challenges"
        ),


        getArray(
          "/decision-maker-resources"
        )

      ]);


    if (
      results[0].status ===
      "fulfilled"
    ) {

      sessions =
        results[0].value;


      renderSessions();

    }


    if (
      results[1].status ===
      "fulfilled"
    ) {

      challenges =
        results[1].value;


      renderChallenges();

    }


    if (
      results[2].status ===
      "fulfilled"
    ) {

      resources =
        results[2].value;


      renderResources();

    }


    if (

      results.some(
        (result) =>

          result.status ===
          "rejected"
      )

    ) {

      console.warn(
        "Some Decision Makers backend content could not be loaded."
      );

    }

    arrangeDecisionMakersSections();


    watchAvailableCourseCards();


    setTimeout(
      compactAvailableCourseCards,
      250
    );


    setTimeout(
      compactAvailableCourseCards,
      900
    );

  }


  /* =========================================================
     START
  ========================================================= */


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadBackend
    );

  }
  else {

    loadBackend();

  }


})();