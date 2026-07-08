// ===========================================================================
// BOOT SEQUENCE
// Types out a fake terminal boot log, then fades the overlay to reveal the
// portfolio underneath. Runs once per page load; a "SKIP" control and a
// click-anywhere fallback let returning visitors bypass it instantly.
// ===========================================================================
(function () {
    const bootScreen = document.getElementById("boot-screen");
    const output = document.getElementById("terminal-output");
    const skipBtn = document.getElementById("boot-skip");
    if (!bootScreen || !output) return;

    // Lock scroll while the boot sequence plays
    document.documentElement.style.overflow = "hidden";

    const lines = [
        { text: "Initializing Portfolio...", cls: "" },
        { text: "[####################] 100%", cls: "boot-line-dim" },
        { text: "Loading AI Core...", cls: "" },
        { text: "Loading Machine Learning Engine...", cls: "" },
        { text: "Loading Neural Network...", cls: "" },
        { text: "Loading Projects...", cls: "" },
        { text: "Loading Skills...", cls: "" },
        { text: "Loading Experience...", cls: "" },
        { text: "Loading Contact...", cls: "" },
        { text: "Connecting...", cls: "" },
        { text: "Authentication Success", cls: "boot-line-ok" },
        { text: "Welcome Suraj Gurung", cls: "boot-welcome" },
        { text: "Status: READY", cls: "boot-line-ok" },
    ];

    const CHAR_MIN = 35;
    const CHAR_MAX = 45;
    const LINE_PAUSE = 400;

    let cancelled = false;

    function finishBoot() {
        if (cancelled) return;
        cancelled = true;
        bootScreen.classList.add("boot-hidden");
        document.documentElement.style.overflow = "";
        window.setTimeout(() => {
            if (bootScreen && bootScreen.parentNode) {
                bootScreen.style.display = "none";
            }
        }, 750);
    }

    async function typeLine(line) {
        const span = document.createElement("span");
        if (line.cls) span.className = line.cls;
        output.appendChild(span);

        for (let i = 0; i < line.text.length; i++) {
            if (cancelled) return;
            span.textContent += line.text.charAt(i);
            const delay = CHAR_MIN + Math.random() * (CHAR_MAX - CHAR_MIN);
            await new Promise((r) => setTimeout(r, delay));
        }
        output.appendChild(document.createElement("br"));
        await new Promise((r) => setTimeout(r, LINE_PAUSE));
    }

    async function runBoot() {
        for (const line of lines) {
            if (cancelled) return;
            await typeLine(line);
        }
        if (!cancelled) {
            await new Promise((r) => setTimeout(r, 500));
            finishBoot();
        }
    }

    if (skipBtn) skipBtn.addEventListener("click", finishBoot);

    // Respect users who've asked the OS for reduced motion: skip straight in
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finishBoot();
    } else {
        runBoot();
    }
})();
