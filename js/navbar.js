document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");
    
    if (!hamburger || !navLinks) return;

    const links = navLinks.querySelectorAll("li a");

    // Toggle Mobile Menu
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        });
    });

    // Close menu when scrolling down to maintain smooth cinematic feel
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50 && navLinks.classList.contains("active")) {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        }
    }, { passive: true });
});