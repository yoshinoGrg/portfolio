// ===========================================================================
// DETAIL.JS — small polish details layered on top of the existing scripts.
// Self-contained: injects its own CSS, touches no other file's logic.
//   1) Safe external links (rel="noopener noreferrer")
//   2) Lazy-loaded images
//   3) Accessible hamburger (role, aria-expanded, keyboard, Escape to close)
//   4) Active-section highlight in the nav
//   5) Scroll progress bar
//   6) Back-to-top button
//   7) Counters auto-synced with real project / technology counts
//   8) Marquee duplicate hidden from screen readers + pause on hover
//   9) Keyboard-playable Tic Tac Toe cells
//  10) Tab title changes when the visitor switches away
// Load AFTER interactions.js:  <script src="js/detail.js" defer></script>
// ===========================================================================
(function () {
    "use strict";

    const reduced =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function init() {
        injectStyles();
        safeExternalLinks();
        lazyImages();
        accessibleHamburger();
        activeSectionNav();
        scrollProgress();
        backToTop();
        syncCounters();
        marqueeDetails();
        keyboardTicTacToe();
        tabTitle();
    }

    // ---------- styles used by this file ----------
    function injectStyles() {
        const css = `
        #nav-links a.nav-active { color: var(--accent); background: var(--accent-dim); }
        #scroll-progress {
            position: fixed; top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, var(--accent), var(--accent-2));
            box-shadow: 0 0 10px rgba(77,225,255,0.6);
            transform: scaleX(0); transform-origin: 0 50%;
            z-index: 1100; pointer-events: none;
        }
        #back-to-top {
            position: fixed; right: 22px; bottom: 22px; z-index: 900;
            width: 46px; height: 46px; border-radius: 50%;
            border: 1px solid var(--accent-line);
            background: rgba(19,19,23,0.8);
            color: var(--accent); font-size: 1.1rem; cursor: pointer;
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            opacity: 0; transform: translateY(12px); pointer-events: none;
            transition: opacity .3s ease, transform .3s ease, box-shadow .25s ease;
        }
        #back-to-top.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
        #back-to-top:hover { box-shadow: 0 0 20px rgba(77,225,255,0.35); }
        .skills:hover .skills-track { animation-play-state: paused; }
        .board .cell:focus-visible, .hamburger:focus-visible,
        #back-to-top:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        `;
        const style = document.createElement("style");
        style.id = "detail-styles";
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ---------- 1) external links ----------
    function safeExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach((a) => {
            const rel = new Set((a.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
            rel.add("noopener");
            rel.add("noreferrer");
            a.setAttribute("rel", Array.from(rel).join(" "));
        });
    }

    // ---------- 2) lazy images ----------
    function lazyImages() {
        document.querySelectorAll(".project-image").forEach((img) => {
            img.loading = "lazy";
            img.decoding = "async";
        });
    }

    // ---------- 3) hamburger ----------
    function accessibleHamburger() {
        const burger = document.getElementById("hamburger");
        const links = document.getElementById("nav-links");
        if (!burger || !links) return;

        burger.setAttribute("role", "button");
        burger.setAttribute("tabindex", "0");
        burger.setAttribute("aria-label", "Toggle navigation menu");
        burger.setAttribute("aria-controls", "nav-links");
        burger.setAttribute("aria-expanded", "false");

        // Mirror the existing .active class (toggled by navbar.js) into aria-expanded
        new MutationObserver(() => {
            burger.setAttribute("aria-expanded", String(burger.classList.contains("active")));
        }).observe(burger, { attributes: true, attributeFilter: ["class"] });

        burger.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                burger.click();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && burger.classList.contains("active")) {
                burger.click();
                burger.focus();
            }
        });
    }

    // ---------- 4) active section highlight ----------
    function activeSectionNav() {
        const anchors = Array.from(document.querySelectorAll("#nav-links a[href^='#']"));
        if (!anchors.length || !("IntersectionObserver" in window)) return;

        const byId = new Map(anchors.map((a) => [a.getAttribute("href").slice(1), a]));
        const sections = Array.from(byId.keys())
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    anchors.forEach((a) => {
                        a.classList.remove("nav-active");
                        a.removeAttribute("aria-current");
                    });
                    const a = byId.get(entry.target.id);
                    if (a) {
                        a.classList.add("nav-active");
                        a.setAttribute("aria-current", "true");
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        );
        sections.forEach((s) => obs.observe(s));
    }

    // ---------- 5) scroll progress ----------
    function scrollProgress() {
        const bar = document.createElement("div");
        bar.id = "scroll-progress";
        bar.setAttribute("aria-hidden", "true");
        document.body.appendChild(bar);

        let ticking = false;
        function update() {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            bar.style.transform = `scaleX(${p})`;
            ticking = false;
        }
        window.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    ticking = true;
                    requestAnimationFrame(update);
                }
            },
            { passive: true }
        );
        window.addEventListener("resize", update, { passive: true });
        update();
    }

    // ---------- 6) back to top ----------
    function backToTop() {
        const btn = document.createElement("button");
        btn.id = "back-to-top";
        btn.type = "button";
        btn.setAttribute("aria-label", "Back to top");
        btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);

        window.addEventListener(
            "scroll",
            () => btn.classList.toggle("show", window.scrollY > 600),
            { passive: true }
        );
        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        });
    }

    // ---------- 7) counters reflect real numbers ----------
    // Runs before interactions.js' observers fire (they animate on scroll), so
    // updating data-count here is enough.
    function syncCounters() {
        const projects = document.querySelectorAll(".project-card").length;
        const track = document.querySelector(".skills-track");
        const techCount = track ? Math.floor(track.querySelectorAll("span").length / 2) : 0;

        document.querySelectorAll(".counter-item").forEach((item) => {
            const num = item.querySelector(".counter-num[data-count]");
            const label = item.querySelector(".counter-label");
            if (!num || !label) return;
            const text = label.textContent.toLowerCase();
            if (text.includes("projects") && projects) num.dataset.count = String(projects);
            if (text.includes("technologies") && techCount) num.dataset.count = String(techCount);
        });
    }

    // ---------- 8) marquee ----------
    function marqueeDetails() {
        const track = document.querySelector(".skills-track");
        if (!track) return;
        const items = Array.from(track.querySelectorAll("span"));
        const half = Math.floor(items.length / 2);
        items.slice(half).forEach((el) => el.setAttribute("aria-hidden", "true"));
    }

    // ---------- 9) keyboard Tic Tac Toe ----------
    function keyboardTicTacToe() {
        const board = document.getElementById("board");
        if (!board) return;

        function decorate() {
            board.setAttribute("role", "grid");
            board.setAttribute("aria-label", "Tic Tac Toe board");
            board.querySelectorAll(".cell").forEach((cell, i) => {
                cell.setAttribute("role", "gridcell");
                cell.setAttribute("tabindex", "0");
                cell.setAttribute(
                    "aria-label",
                    `Cell ${i + 1}, ${cell.textContent.trim() || "empty"}`
                );
            });
        }
        // tictactoe.js rebuilds the board after every move, so re-decorate
        new MutationObserver(decorate).observe(board, { childList: true });
        decorate();

        board.addEventListener("keydown", (e) => {
            if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("cell")) {
                e.preventDefault();
                const index = Array.from(board.children).indexOf(e.target);
                e.target.click();
                // The board was rebuilt; return focus to the same cell
                const next = board.children[index];
                if (next) next.focus();
            }
        });

        const status = document.getElementById("status");
        if (status) status.setAttribute("aria-live", "polite");
    }

    // ---------- 10) tab title ----------
    function tabTitle() {
        const original = document.title;
        document.addEventListener("visibilitychange", () => {
            document.title = document.hidden ? "Come back, there's more to see \u2192" : original;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();