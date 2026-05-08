import argparse, time, json, os
import cv2
import mediapipe as mp
import numpy as np
import joblib

try:
    import pyttsx3
except Exception:
    pyttsx3 = None

from utils.hand_features import landmarks_to_features

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', default='models/hand_sign_svc.joblib')
    parser.add_argument('--camera-index', type=int, default=0)
    parser.add_argument('--min-prob', type=float, default=0.6, help='Min probability to show prediction')
    args = parser.parse_args()

    if not os.path.exists(args.model):
        raise FileNotFoundError('Model not found. Train first.')

    bundle = joblib.load(args.model)
    pipe = bundle['pipeline']
    classes = bundle['classes_']

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    draw = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(args.camera_index)
    if not cap.isOpened():
        print('ERROR: Could not open camera', args.camera_index)
        return

    tts_enabled = False
    engine = None
    if pyttsx3 is not None:
        engine = pyttsx3.init()
    last_spoken = ''
    show_fps = False
    prev_time = time.time()

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = hands.process(rgb)

        prob = 0.0
        pred_label = ''
        if res.multi_hand_landmarks:
            hand = res.multi_hand_landmarks[0]
            draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)
            feats = landmarks_to_features(hand.landmark)
            if feats is not None:
                proba = pipe.predict_proba([feats])[0]
                idx = int(np.argmax(proba))
                prob = float(proba[idx])
                if prob >= args.min_prob:
                    pred_label = classes[idx]

        # UI overlay
        cv2.putText(frame, f'Pred: {pred_label if pred_label else "-"}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0), 2)
        cv2.putText(frame, f'Prob: {prob:.2f}', (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
        cv2.putText(frame, f'TTS: {"ON" if tts_enabled else "OFF"} (t)', (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)

        if show_fps:
            now = time.time()
            fps = 1.0 / max(1e-6, (now - prev_time))
            prev_time = now
            cv2.putText(frame, f'FPS: {fps:.1f}', (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,0), 2)

        cv2.imshow('Sign Language Translator (q=quit, t=TTS, f=FPS)', frame)

        # Speak when label changes and is confident
        if tts_enabled and pred_label and pred_label != last_spoken and engine is not None:
            engine.say(pred_label)
            engine.runAndWait()
            last_spoken = pred_label

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        if key == ord('t'):
            tts_enabled = not tts_enabled
        if key == ord('f'):
            show_fps = not show_fps

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
