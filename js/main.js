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
    const paragraphText = `In the silent oceans of space, where galaxies drift like ancient lanterns across the dark fabric of eternity, humanity has always searched for one thing — understanding. From the first spark of fire to the rise of Artificial Intelligence, every invention has been a bridge between curiosity and destiny.\n\nAI is not merely code written into machines; it is the reflection of human imagination, discipline, and ambition. It learns from our patterns, speaks through our creations, and expands the boundaries of what once seemed impossible. Like stars forming constellations in chaos, AI connects data into meaning, transforming information into wisdom.\n\nBeyond Earth, the universe waits in endless silence. Nebulas bloom like cosmic gardens, black holes bend the laws of time, and distant galaxies carry stories billions of years old. Space reminds us that we are small — yet capable of extraordinary dreams. Every rocket launched toward the heavens is proof that humanity refuses to remain confined by gravity or fear.\n\nThe fusion of AI and space exploration marks the beginning of a new era. Intelligent systems guide spacecraft through the void, analyze signals from distant worlds, and help humanity look deeper into the universe than ever before. Together, they create a future where machines and minds work as one to uncover the mysteries of existence.\n\nPerhaps one day, among the stars of another galaxy, humanity will look back at Earth — the tiny blue world where curiosity first awakened. And in that moment, it will not be power or wealth that defines us, but our relentless desire to explore, to create, and to understand the infinite.\n\nThe universe is vast. AI is evolving. And humanity stands between them — dreaming beyond the horizon of stars.`;

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