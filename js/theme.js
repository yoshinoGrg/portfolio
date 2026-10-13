// ===========================================================================
// THEME.JS — Step 1: light / dark mode toggle
//  - Initial theme is set by a tiny inline script in <head> (no flash)
//  - Toggle button is injected into <nav>
//  - Choice is saved in localStorage; with no saved choice, follows the OS
//  - Fires a "themechange" event so later steps (canvas colours, glass
//    effects) can react:  window.addEventListener("themechange", e => e.detail.theme)
// ===========================================================================
(function () {
    "use strict";

    const root = document.documentElement;
    const KEY = "theme";
    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

    function saved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function save(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: ignore */ }
    }

    function apply(theme, announce) {
        root.setAttribute("data-theme", theme);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "light" ? "#f2f5f9" : "#0a0a0d");

        const btn = document.getElementById("theme-toggle");
        if (btn) {
            const toLight = theme === "dark";
            btn.setAttribute("aria-label", toLight ? "Switch to light mode" : "Switch to dark mode");
            btn.setAttribute("aria-pressed", String(theme === "light"));
            btn.innerHTML = '<i class="fas ' + (toLight ? "fa-sun" : "fa-moon") + '" aria-hidden="true"></i>';
        }
        if (announce) {
            window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
        }
    }

    function current() {
        return root.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function init() {
        const nav = document.querySelector("nav");
        if (nav && !document.getElementById("theme-toggle")) {
            const btn = document.createElement("button");
            btn.id = "theme-toggle";
            btn.className = "theme-toggle";
            btn.type = "button";
            nav.appendChild(btn);
            btn.addEventListener("click", () => {
                const next = current() === "dark" ? "light" : "dark";
                apply(next, true);
                save(next);
            });
        }

        apply(current(), true);

        // Enable the cross-fade only after first paint so the page doesn't animate on load
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("theme-ready")));

        // Follow OS changes while the visitor hasn't picked a theme themselves
        if (media && media.addEventListener) {
            media.addEventListener("change", (e) => {
                if (!saved()) apply(e.matches ? "light" : "dark", true);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();