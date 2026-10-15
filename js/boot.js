// ===========================================================================
// BOOT SEQUENCE v2
//   1) Short terminal log (types fast, ~2 s)
//   2) Terminal fades out -> a robot DANCES  ("warming up the circuits")
//   3) The robot switches to WALKING across a track; the bar and the percent
//      follow it, and it waits at 96% until the page has really loaded
//   4) Overlay fades out and the portfolio is revealed
// Plays once per browser session. Add ?boot=1 to the URL to force a replay
// while you are tweaking it. Skip button / Escape / Enter skip at any time.
// Needs boot.css. Reuses the existing #boot-screen markup, no HTML changes.
// ===========================================================================
(function () {
    "use strict";

    const bootScreen = document.getElementById("boot-screen");
    const output = document.getElementById("terminal-output");
    const skipBtn = document.getElementById("boot-skip");
    if (!bootScreen || !output) return;

    // ---------- tuning ----------
    const CHAR_MIN = 8;          // ms per typed character
    const CHAR_MAX = 14;
    const LINE_PAUSE = 90;       // ms after each line
    const DANCE_MS = 2200;       // how long the robot dances
    const WALK_MS = 2600;        // how long the walk takes (0 -> 100%)
    const MAX_WAIT_LOAD = 4000;  // never wait longer than this for window "load"
    const HARD_TIMEOUT = 14000;  // absolute safety net

    const lines = [
        { text: "Initializing Portfolio...", cls: "" },
        { text: "Loading AI Core...", cls: "" },
        { text: "Loading Projects...", cls: "" },
        { text: "Loading Skills...", cls: "" },
        { text: "Authentication Success", cls: "boot-line-ok" },
        { text: "Welcome !!!", cls: "boot-welcome" },
    ];

    // ---------- skip rules ----------
    const reduced =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const force = /[?&]boot=1\b/.test(window.location.search);
    let seen = false;
    try { seen = sessionStorage.getItem("booted") === "1"; } catch (e) { /* ignore */ }

    if (reduced || (seen && !force)) {
        bootScreen.style.display = "none";
        return;
    }

    document.documentElement.style.overflow = "hidden"; // lock scroll while booting

    // ---------- robot loader markup (injected, so the HTML stays untouched) ----------
    const ROBOT_SVG = `
<svg class="bot" viewBox="0 0 120 160" width="96" height="128" fill="none"
     stroke="#4de1ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <g class="bot-bounce"><g class="bot-sway">
    <g class="bot-leg bot-leg-l">
      <rect x="42" y="112" width="14" height="30" rx="6" fill="#141b22"/>
      <rect x="38" y="138" width="22" height="10" rx="5" fill="#141b22"/>
    </g>
    <g class="bot-leg bot-leg-r">
      <rect x="64" y="112" width="14" height="30" rx="6" fill="#141b22"/>
      <rect x="60" y="138" width="22" height="10" rx="5" fill="#141b22"/>
    </g>
    <g class="bot-arm bot-arm-l"><rect x="20" y="76" width="12" height="36" rx="6" fill="#141b22"/></g>
    <g class="bot-arm bot-arm-r"><rect x="88" y="76" width="12" height="36" rx="6" fill="#141b22"/></g>
    <rect x="34" y="70" width="52" height="48" rx="13" fill="#10161c"/>
    <circle class="bot-core" cx="60" cy="93" r="7" fill="#4de1ff" stroke="none"/>
    <path d="M47 108h26" opacity=".45"/>
    <g class="bot-head">
      <line x1="60" y1="13" x2="60" y2="22"/>
      <circle class="bot-antenna-dot" cx="60" cy="10" r="4" fill="#8ef3ff" stroke="none"/>
      <rect x="28" y="22" width="64" height="46" rx="15" fill="#10161c"/>
      <rect x="36" y="31" width="48" height="26" rx="10" fill="#04080b" stroke-width="1.5"/>
      <g class="bot-eyes">
        <ellipse class="bot-eye" cx="50" cy="44" rx="4.5" ry="5.5" fill="#8ef3ff" stroke="none"/>
        <ellipse class="bot-eye" cx="70" cy="44" rx="4.5" ry="5.5" fill="#8ef3ff" stroke="none"/>
      </g>
      <circle cx="26" cy="45" r="3.5" fill="#141b22"/>
      <circle cx="94" cy="45" r="3.5" fill="#141b22"/>
    </g>
  </g></g>
</svg>`;

    const stage = document.createElement("div");
    stage.className = "boot-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML =
        '<p class="boot-caption" id="boot-caption">WARMING UP THE CIRCUITS</p>' +
        '<div class="boot-track" id="boot-track">' +
            '<div class="boot-robot dance" id="boot-robot">' +
                '<span class="boot-note n1">\u266A</span>' +
                '<span class="boot-note n2">\u266B</span>' +
                '<span class="boot-note n3">\u266A</span>' +
                ROBOT_SVG +
                '<span class="boot-shadow"></span>' +
            "</div>" +
            '<div class="boot-ground"><div class="boot-ground-fill" id="boot-fill"></div></div>' +
        "</div>" +
        '<p class="boot-percent" id="boot-percent">0%</p>';
    bootScreen.appendChild(stage);

    const termWin = bootScreen.querySelector(".terminal-window");
    const robot = stage.querySelector("#boot-robot");
    const track = stage.querySelector("#boot-track");
    const fill = stage.querySelector("#boot-fill");
    const caption = stage.querySelector("#boot-caption");
    const percent = stage.querySelector("#boot-percent");

    // ---------- helpers ----------
    let cancelled = false;
    let loaded = document.readyState === "complete";
    window.addEventListener("load", () => { loaded = true; });

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    function finishBoot() {
        if (cancelled) return;
        cancelled = true;
        try { sessionStorage.setItem("booted", "1"); } catch (e) { /* ignore */ }
        bootScreen.classList.add("boot-hidden");
        document.documentElement.style.overflow = "";
        window.setTimeout(() => { bootScreen.style.display = "none"; }, 750);
    }

    async function typeLine(line) {
        const span = document.createElement("span");
        if (line.cls) span.className = line.cls;
        output.appendChild(span);
        for (let i = 0; i < line.text.length; i++) {
            if (cancelled) return;
            span.textContent += line.text.charAt(i);
            await wait(CHAR_MIN + Math.random() * (CHAR_MAX - CHAR_MIN));
        }
        output.appendChild(document.createElement("br"));
        await wait(LINE_PAUSE);
    }

    function setProgress(p, trackW, robotW) {
        const x = (trackW - robotW) * p;
        robot.style.transform = "translateX(" + x.toFixed(1) + "px)";
        // bar stays level with the robot's body, and reaches 100% at the end
        fill.style.transform = "scaleX(" + Math.min(1, (x + robotW * (0.5 + 0.5 * p)) / trackW).toFixed(4) + ")";
        percent.textContent = Math.round(p * 100) + "%";
    }

    function walk() {
        return new Promise((resolve) => {
            const trackW = track.clientWidth;
            const robotW = robot.offsetWidth;
            const start = performance.now();
            function frame(now) {
                if (cancelled) return resolve();
                const elapsed = now - start;
                let p = Math.min(1, elapsed / WALK_MS);
                // hold just short of the end until the page has really loaded
                if (!loaded && elapsed < WALK_MS + MAX_WAIT_LOAD) p = Math.min(p, 0.96);
                setProgress(p, trackW, robotW);
                if (p >= 1) return resolve();
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        });
    }

    // ---------- the sequence ----------
    async function run() {
        for (const line of lines) {
            if (cancelled) return;
            await typeLine(line);
        }
        await wait(280);
        if (cancelled) return;

        // terminal -> loader
        termWin.classList.add("is-leaving");
        stage.classList.add("show");
        await wait(500);
        if (cancelled) return;

        // 1) dance
        robot.className = "boot-robot dance";
        caption.textContent = "WARMING UP THE CIRCUITS";
        await wait(DANCE_MS);
        if (cancelled) return;

        // 2) walk
        robot.className = "boot-robot walk";
        caption.textContent = "LOADING PORTFOLIO";
        await walk();
        if (cancelled) return;

        // 3) arrived
        robot.className = "boot-robot idle";
        caption.textContent = "READY";
        await wait(500);
        finishBoot();
    }

    // ---------- controls ----------
    if (skipBtn) {
        skipBtn.setAttribute("role", "button");
        skipBtn.setAttribute("tabindex", "0");
        skipBtn.addEventListener("click", finishBoot);
        skipBtn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finishBoot(); }
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") finishBoot();
    });

    window.setTimeout(finishBoot, HARD_TIMEOUT); // never trap the visitor
    run();
})();