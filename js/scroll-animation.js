// Scroll and touch animation logic from index.html
(function() {
    // These variables must be defined in the same scope as the animation logic
    let targetFrame = 0;
    let currentFrame = 0;
    let frameCount = 192;
    let images = window.images || [];
    let currentFrameIndex = window.currentFrameIndex || 0;
    let drawFrame = window.drawFrame || function(){};
    let typeContainer = document.getElementById("typewriter-text");
    let paragraphText = window.paragraphText || '';
    let scrollContainer = document.getElementById("hero-scroll-container");

    function checkScroll() {
        if (!scrollContainer) return;
        const rect = scrollContainer.getBoundingClientRect();
        const scrollDistance = -rect.top;
        const maxScroll = rect.height - window.innerHeight;
        if (maxScroll <= 0) return;
        let scrollProgress = scrollDistance / maxScroll;
        scrollProgress = Math.max(0, Math.min(1, scrollProgress));
        let animProgress = Math.max(0, Math.min(1, scrollProgress / 0.35));
        targetFrame = animProgress * (frameCount - 1);
        if (scrollProgress > 0.35) {
            if (!canvas.classList.contains("blurred")) {
                canvas.classList.add("blurred");
            }
            let textProgress = Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.65));
            let charsToShow = Math.floor(textProgress * paragraphText.length);
            let visibleText = paragraphText.substring(0, charsToShow).replace(/\n/g, '<br>');
            if (charsToShow > 0) {
                visibleText += '<span style="border-right: 3px solid white; padding-left: 2px; animation: typeCursorBlink 0.8s step-end infinite;">&nbsp;</span>';
            }
            if (typeContainer) typeContainer.innerHTML = visibleText;
        } else {
            if (canvas.classList.contains("blurred")) {
                canvas.classList.remove("blurred");
            }
            if (typeContainer) typeContainer.innerHTML = '';
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    let isTouching = false;
    let lastTouchY = 0;

    scrollContainer.addEventListener('touchstart', (e) => {
        isTouching = true;
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    scrollContainer.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const currentY = e.touches[0].clientY;
        lastTouchY = currentY;
    }, { passive: true });

    scrollContainer.addEventListener('touchend', () => {
        isTouching = false;
    }, { passive: true });

    function updateFrame() {
        currentFrame += (targetFrame - currentFrame) * 0.1;
        let displayFrame = Math.round(currentFrame);
        displayFrame = Math.max(0, Math.min(frameCount - 1, displayFrame));
        if (displayFrame !== currentFrameIndex && images[displayFrame] && images[displayFrame].complete) {
            currentFrameIndex = displayFrame;
            drawFrame(images[displayFrame]);
        }
        requestAnimationFrame(updateFrame);
    }
    requestAnimationFrame(updateFrame);
})();
