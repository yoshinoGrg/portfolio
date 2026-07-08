// ===========================================================================
// AMBIENT EFFECTS
// Lightweight canvas particle field (used for both the boot terminal and the
// hero section) + a cyan glow that follows the mouse in the hero.
// Pure vanilla JS, no dependencies, respects prefers-reduced-motion.
// ===========================================================================
(function () {
    const reducedMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initParticleField(canvasId, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const opts = Object.assign(
            { density: 90, maxSpeed: 0.15, color: "77,225,255", minR: 0.6, maxR: 2 },
            options
        );

        let particles = [];
        let width, height;
        let raf;

        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }

        function spawn() {
            const count = Math.max(20, Math.floor((width * height) / 14000) );
            const total = Math.min(opts.density, count);
            particles = new Array(total).fill(0).map(() => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: opts.minR + Math.random() * (opts.maxR - opts.minR),
                vx: (Math.random() - 0.5) * opts.maxSpeed,
                vy: (Math.random() - 0.5) * opts.maxSpeed - 0.02,
                a: 0.3 + Math.random() * 0.5,
            }));
        }

        function tick() {
            ctx.clearRect(0, 0, width, height);
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${opts.color},${p.a})`;
                ctx.shadowBlur = 6;
                ctx.shadowColor = `rgba(${opts.color},0.8)`;
                ctx.fill();
            }
            raf = requestAnimationFrame(tick);
        }

        resize();
        spawn();
        window.addEventListener("resize", () => {
            resize();
            spawn();
        });

        if (reducedMotion) {
            // Draw one static frame instead of animating forever
            tick();
            cancelAnimationFrame(raf);
        } else {
            tick();
        }
    }

    initParticleField("boot-particles", { density: 70, maxSpeed: 0.12 });
    initParticleField("hero-particles", { density: 60, maxSpeed: 0.1 });

    // Cursor-following glow in the hero ("light follows mouse")
    const hero = document.getElementById("home");
    const glow = document.getElementById("hero-cursor-glow");
    if (hero && glow && !reducedMotion) {
        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
})();
