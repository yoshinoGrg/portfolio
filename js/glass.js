// ===========================================================================
// GLASS.JS — Step 3: refraction layer for the liquid glass
//  - Injects an SVG displacement filter (#liquid-refract)
//  - Uses it as the backdrop-filter of the small glass pieces (nav pills,
//    round buttons, social cards) ONLY where the browser supports SVG filters
//    in backdrop-filter (currently Chromium-based browsers) and the visitor
//    has a mouse-like pointer and hasn't asked for reduced transparency/motion.
//  - Everywhere else the CSS falls back to the plain blur + saturation glass.
// Opt out any time by adding  <html data-glass="flat">  or removing this file.
// ===========================================================================
(function () {
    "use strict";

    const root = document.documentElement;
    if (root.getAttribute("data-glass") === "flat") return;

    const mq = (q) => window.matchMedia && window.matchMedia(q).matches;

    const supportsSvgBackdrop =
        window.CSS &&
        CSS.supports &&
        CSS.supports("backdrop-filter", "url(#liquid-refract) blur(1px)");

    const allowed =
        supportsSvgBackdrop &&
        mq("(hover: hover) and (pointer: fine)") &&
        !mq("(prefers-reduced-transparency: reduce)") &&
        !mq("(prefers-reduced-motion: reduce)");

    if (!allowed) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none";
    svg.innerHTML =
        '<filter id="liquid-refract" x="0" y="0" width="100%" height="100%" ' +
        'color-interpolation-filters="sRGB">' +
        // low-frequency noise = smooth, lens-like wobble rather than grain
        '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.010" numOctaves="2" seed="7" result="noise"/>' +
        '<feGaussianBlur in="noise" stdDeviation="3" result="soft"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="soft" scale="26" xChannelSelector="R" yChannelSelector="G"/>' +
        "</filter>";
    document.body.appendChild(svg);

    // Small pieces get refraction + blur; big cards stay on plain blur for performance
    root.style.setProperty(
        "--glass-fx-small",
        "url(#liquid-refract) blur(8px) saturate(180%)"
    );
    root.classList.add("glass-refract");
})();