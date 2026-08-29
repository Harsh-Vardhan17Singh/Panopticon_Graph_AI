import os
import random

import joblib
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "fraud_model.joblib"
)


def generate_training_data(n_samples=2000):
    """
    Generate synthetic transaction data for development/demo purposes.

    Features:
    1. amount
    2. cash_transaction
    3. account_age_days
    4. transaction_frequency
    5. unusual_device
    """

    X = []
    y = []

    for _ in range(n_samples):

        amount = random.randint(500, 200000)

        cash_transaction = random.randint(0, 1)

        account_age_days = random.randint(1, 2000)

        transaction_frequency = random.randint(1, 30)

        unusual_device = random.randint(0, 1)

        # Synthetic fraud logic used only to create demo training data
        fraud_score = 0

        if amount >= 100000:
            fraud_score += 3
        elif amount >= 50000:
            fraud_score += 2
        elif amount >= 10000:
            fraud_score += 1

        if cash_transaction:
            fraud_score += 1

        if account_age_days < 30:
            fraud_score += 2

        if transaction_frequency > 20:
            fraud_score += 1

        if unusual_device:
            fraud_score += 2

        is_fraud = 1 if fraud_score >= 4 else 0

        X.append([
            amount,
            cash_transaction,
            account_age_days,
            transaction_frequency,
            unusual_device
        ])

        y.append(is_fraud)

    return np.array(X), np.array(y)


def train_model():

    print("Generating training data...")

    X, y = generate_training_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        class_weight="balanced"
    )

    print("Training ML model...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print(f"Model accuracy: {accuracy:.2%}")

    joblib.dump(model, MODEL_PATH)

    print(f"Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()