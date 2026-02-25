# Real‑Time Sign Language Translator (MediaPipe + OpenCV + scikit‑learn)

This project lets you collect your own hand‑sign dataset, train a classifier, and run real‑time translation from webcam. It uses **MediaPipe Hands** for 21 hand landmarks and a simple ML pipeline (StandardScaler + SVC). Optional **text‑to‑speech** reads predictions aloud.

## 1) Install
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## 2) Collect data
Run once for each label (sign) you want, e.g. A, B, Hello:
```bash
python collect_data.py --label A --num-samples 200
python collect_data.py --label B --num-samples 200
python collect_data.py --label Hello --num-samples 200
```
Tips:
- Hold the sign steady; move/rotate a little for variance.
- Use **`s`** to start/pause sampling; **`q`** to quit.

Data is appended to `data/landmarks.csv` (one row per sample with 63 features + label).

## 3) Train
```bash
python train_model.py
```
It creates `models/hand_sign_svc.joblib` and `models/label_classes.json`.

## 4) Run real‑time inference
```bash
python realtime_inference.py
```
Keys:
- **q**: quit
- **t**: toggle Text‑to‑Speech on/off
- **f**: show FPS

## 5) Add more signs later
Just collect more samples for a new label, then re‑run training.

## 6) Use NVIDIA Broadcast (optional)
In the scripts, change `VideoCapture(0)` to the index of **NVIDIA Broadcast** virtual camera (often 1 or 2). You can also set with `--camera-index` flag where available.

## Notes
- Works best with single hand visible. Two hands also supported but we use the first detected hand for classification.
- Model here is intentionally lightweight. For higher accuracy, increase samples, add more varied lighting/backgrounds, and consider sequence models (e.g., LSTM) for dynamic signs.
