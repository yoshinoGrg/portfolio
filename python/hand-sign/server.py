from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import joblib
import mediapipe as mp

from utils.hand_features import landmarks_to_features

app = Flask(__name__)
CORS(app)

# Load your trained SVC model
bundle = joblib.load('models/hand_sign_svc.joblib')
pipe = bundle['pipeline']
classes = bundle['classes_']

# Setup mediapipe hands ONCE
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def predict_sign(frame, min_prob=0.6):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = hands.process(rgb)

    if res.multi_hand_landmarks:
        hand = res.multi_hand_landmarks[0]
        feats = landmarks_to_features(hand.landmark)

        if feats is not None:
            proba = pipe.predict_proba([feats])[0]
            idx = int(np.argmax(proba))
            prob = float(proba[idx])

            if prob >= min_prob:
                return classes[idx]

    return ""

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['image']
    img_data = base64.b64decode(data.split(',')[1])
    np_img = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    label = predict_sign(frame)

    return jsonify({"prediction": label})

if __name__ == '__main__':
    app.run(port=5000)
