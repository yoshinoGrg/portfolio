document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const scrollContainer = document.getElementById("hero-scroll-container");
    const frameCount = 192; 
    const getFramePath = (index) => `Galaxy/19439_${index.toString().padStart(3, '0')}.png`;

    const images = [];
    let loadedImages = 0;
    let currentFrameIndex = -1;

    function drawFrame(img) {
        if (!img || !img.complete || img.width === 0) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const iw = img.width;
        const ih = img.height;
        const cropX = iw * 0.18;
        const cropY = ih * 0.12;
        const cropWidth = iw * 0.65;
        const cropHeight = ih * 0.75;
        ctx.drawImage(
            img,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    window.addEventListener('resize', () => {
        if (currentFrameIndex >= 0 && images[currentFrameIndex]) {
            drawFrame(images[currentFrameIndex]);
        }
    });

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
            loadedImages++;
            if (i === 1) {
                currentFrameIndex = 0;
                drawFrame(images[0]); 
            }
        };
        images.push(img);
    }

    let targetFrame = 0;
    let currentFrame = 0;

    const typeContainer = document.getElementById("typewriter-text");
    const paragraphText = `And yet — let us not be afraid of what we have made.\n\nAI is not a conqueror. It is a collaborator. It is a new kind of tool, yes — but also a new kind of mirror. When you speak to a machine with intelligence, you are, in a very real sense, hearing the distilled echo of millions of human voices speaking back to you. Every insight it offers was once a human insight. Every story it tells was shaped by human stories.\n\nThink of what becomes possible when human creativity and machine capability walk together. Diseases diagnosed faster. Languages translated with nuance. Artists freed from the tedious to pursue the transcendent. Scientists accelerated toward discoveries that might take lifetimes without assistance.\n\nThe question was never human or machine. The question has always been — what kind of world do we want to build, and are we wise enough to build it well?`;

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
});