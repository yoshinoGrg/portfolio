// ===========================================================================
// INTERACTIONS
// 1) Rotating hero role text (fades every 2s)
// 2) Animated counters that count up once scrolled into view
// 3) Animated skill progress bars that fill once scrolled into view
// 4) Subtle 3D tilt on project cards, following the cursor
// ===========================================================================
(function () {
    const reducedMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- 1) Rotating hero roles ----------
    const roles = [
        "AI Engineer",
        "Machine Learning Enthusiast",
        "Full Stack Developer",
        "Data Science Learner",
    ];
    const roleEl = document.getElementById("role-text");
    if (roleEl) {
        let index = 0;
        if (reducedMotion) {
            roleEl.textContent = roles[0];
        } else {
            setInterval(() => {
                index = (index + 1) % roles.length;
                // Restart the CSS fade animation
                roleEl.style.animation = "none";
                // eslint-disable-next-line no-unused-expressions
                roleEl.offsetHeight; // force reflow
                roleEl.textContent = roles[index];
                roleEl.style.animation = "";
            }, 2000);
        }
    }

    // ---------- 2) Animated counters ----------
    const counters = document.querySelectorAll(".counter-num");
    if (counters.length) {
        const animateCounter = (el) => {
            if (el.dataset.infinite) {
                el.textContent = "\u221E"; // ∞ symbol, no counting needed
                return;
            }
            const target = parseInt(el.dataset.count, 10) || 0;
            if (reducedMotion) {
                el.textContent = target;
                return;
            }
            const duration = 1400;
            const start = performance.now();
            function step(now) {
                const progress = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(eased * target);
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        };

        const counterObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        counters.forEach((el) => counterObserver.observe(el));
    }

    // ---------- 3) Animated skill bars ----------
    const skillBars = document.querySelectorAll(".skill-bar");
    if (skillBars.length) {
        const fillBar = (bar) => {
            const level = bar.dataset.level || "0";
            const fill = bar.querySelector(".skill-fill");
            const pct = bar.querySelector(".skill-pct");
            if (fill) fill.style.width = level + "%";
            if (pct) {
                let current = 0;
                const target = parseInt(level, 10);
                if (reducedMotion) {
                    pct.textContent = target + "%";
                    return;
                }
                const start = performance.now();
                const duration = 1200;
                function step(now) {
                    const progress = Math.min(1, (now - start) / duration);
                    current = Math.floor(progress * target);
                    pct.textContent = current + "%";
                    if (progress < 1) requestAnimationFrame(step);
                    else pct.textContent = target + "%";
                }
                requestAnimationFrame(step);
            }
        };

        const barObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        fillBar(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        skillBars.forEach((bar) => barObserver.observe(bar));
    }

    // ---------- 4) Project card tilt ----------
    if (!reducedMotion) {
        document.querySelectorAll(".project-card").forEach((card) => {
            const maxTilt = 6; // degrees

            card.addEventListener("mouseenter", () => {
                card.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";
            });

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                const rotateX = (-py * maxTilt).toFixed(2);
                const rotateY = (px * maxTilt).toFixed(2);
                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transition = "border-color 0.3s ease, transform 0.4s ease, box-shadow 0.3s ease";
                card.style.transform = "";
            });
        });
    }

    // ---------- Scroll-reveal for .scroll-animate elements ----------
    const revealTargets = document.querySelectorAll(".scroll-animate");
    if (revealTargets.length) {
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealTargets.forEach((el) => revealObserver.observe(el));
    }
})();
