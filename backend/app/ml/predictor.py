import os
import joblib


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "fraud_model.joblib"
)


class MLPredictor:

    def __init__(self):
        self.model = None

        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)

    def predict(
        self,
        amount: float,
        transaction_type: str,
        account_age_days: int = 365,
        transaction_frequency: int = 5,
        unusual_device: int = 0,
    ) -> dict:

        # If model isn't available, don't break the API
        if self.model is None:
            return {
                "ml_score": 0,
                "ml_prediction": 0,
            }

        cash_transaction = (
            1 if transaction_type.upper() == "CASH" else 0
        )

        features = [[
            amount,
            cash_transaction,
            account_age_days,
            transaction_frequency,
            unusual_device
        ]]

        probability = self.model.predict_proba(features)[0][1]

        prediction = self.model.predict(features)[0]

        return {
            "ml_score": round(float(probability * 100), 2),
            "ml_prediction": int(prediction),
        }


ml_predictor = MLPredictor()