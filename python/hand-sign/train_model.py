import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

DATA_PATH = 'data/landmarks.csv'
MODEL_PATH = 'models/hand_sign_svc.joblib'
LABELS_PATH = 'models/label_classes.json'

def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f'{DATA_PATH} not found. Collect data first.')

    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=['label']).values.astype(np.float32)
    y = df['label'].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', SVC(kernel='rbf', C=10, gamma='scale', probability=True, class_weight='balanced', random_state=42))
    ])

    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print('Accuracy:', acc)
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({'pipeline': pipe, 'classes_': le.classes_.tolist()}, MODEL_PATH)
    with open(LABELS_PATH, 'w') as f:
        json.dump({'classes': le.classes_.tolist()}, f, indent=2)

    print(f'[SAVED] {MODEL_PATH} and {LABELS_PATH}')

if __name__ == '__main__':
    main()
