const video =
document.getElementById("camera");

const canvas =
document.getElementById("detectionCanvas");

const ctx =
canvas.getContext("2d");

const prediction =
document.getElementById("prediction");

let model;

let stream;

async function loadModel(){

    prediction.innerHTML =
    "Loading AI model...";

    model =
    await cocoSsd.load();

    prediction.innerHTML =
    "AI Ready.";
}

loadModel();

async function startDetection(){

    stream =
    await navigator.mediaDevices.getUserMedia({
        video:true
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;

        detectFrame();
    };
}

function stopDetection(){

    if(stream){

        stream.getTracks().forEach(
            track => track.stop()
        );
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    prediction.innerHTML =
    "Detection stopped.";
}

async function detectFrame(){

    const predictions =
    await model.detect(video);

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    predictions.forEach(predictionItem => {

        const [x, y, width, height] =
        predictionItem.bbox;

        ctx.strokeStyle = "#00ffcc";

        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

        ctx.fillStyle = "#00ffcc";

        ctx.font = "18px Arial";

        ctx.fillText(
            `${predictionItem.class}
             (${Math.round(predictionItem.score * 100)}%)`,
            x,
            y > 20 ? y - 5 : y + 20
        );
    });

    prediction.innerHTML =
    predictions.length > 0
    ? predictions.map(p =>
        `${p.class}
         (${Math.round(p.score * 100)}%)`
      ).join("<br>")
    : "No objects detected";

    requestAnimationFrame(detectFrame);
}

window.startDetection =
startDetection;

window.stopDetection =
stopDetection;