let stream = null;
let intervalId = null;
let aiMovesCount = 0;

const video = document.getElementById('camera');
const predictionText = document.getElementById('prediction');

async function startCamera() {
    if (stream) return;

    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    intervalId = setInterval(captureFrame, 1200);
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    clearInterval(intervalId);
    predictionText.innerText = "Prediction: --";
}

function captureFrame() {
    if (!video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');

    fetch("https://supratemporal-cayden-dustproof.ngrok-free.dev/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    })
    .then(r => r.json())
    .then(d => {
        console.log(d.prediction);
        predictionText.innerText = d.prediction
            ? "Prediction: " + d.prediction
            : "Prediction: No hand detected";
    });
}