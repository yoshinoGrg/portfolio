import argparse, csv, os, time
import cv2
import mediapipe as mp
import numpy as np
from utils.hand_features import landmarks_to_features


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--label', required=True, type=int,
                        help='Jutsu label (1=CLONE, 2=FIRE)')
    parser.add_argument('--num-samples', type=int, default=200,
                        help='Number of samples to capture')
    parser.add_argument('--out', default='data/jutsu_landmarks.csv',
                        help='Output CSV path')
    parser.add_argument('--camera-index', type=int, default=0,
                        help='Camera index')
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    # ======================
    # MediaPipe setup (TWO HANDS)
    # ======================
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )
    draw = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(args.camera_index)
    if not cap.isOpened():
        print('❌ ERROR: Could not open camera', args.camera_index)
        return

    collected = 0
    sampling = False
    last_save = time.time()

    print('[INFO] Press "s" to start/pause sampling, "q" to quit.')
    print(f'[INFO] Collecting label: {args.label}')

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = hands.process(rgb)

        features = []

        if res.multi_hand_landmarks:
            # draw + extract features for each hand
            for hand in res.multi_hand_landmarks:
                draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)
                feats = landmarks_to_features(hand.landmark)
                features.extend(feats.tolist())

        # Pad if only ONE hand detected
        if len(features) > 0 and len(features) < 2 * len(feats):
            pad = [0.0] * len(feats)
            features.extend(pad)

        # ======================
        # Save sample
        # ======================
        if sampling and len(features) > 0 and (time.time() - last_save) > 0.03:
            newfile = not os.path.exists(args.out)
            with open(args.out, 'a', newline='') as f:
                wr = csv.writer(f)
                if newfile:
                    header = [f'f{i}' for i in range(len(features))] + ['label']
                    wr.writerow(header)
                wr.writerow(features + [args.label])

            collected += 1
            last_save = time.time()

        # ======================
        # UI
        # ======================
        cv2.putText(frame, f'Label: {args.label}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        cv2.putText(frame, f'Samples: {collected}/{args.num_samples}', (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
        cv2.putText(frame, f'Sampling: {"ON" if sampling else "OFF"} (press s)', (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)

        cv2.imshow('Collect Naruto Jutsu Data (q=quit, s=start/pause)', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        if key == ord('s'):
            sampling = not sampling
        if collected >= args.num_samples:
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f'[DONE] Collected {collected} samples for label {args.label} → {args.out}')


if __name__ == '__main__':
    main()
