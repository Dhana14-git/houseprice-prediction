from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import joblib
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ---------------- LOAD TRAINED BUNDLE ----------------
bundle = joblib.load("house_price_bundle.joblib")
model = bundle["model"]
columns = bundle["columns"]
feature_means = bundle["feature_means"]

# Ensure feature_means is Series (same as Streamlit)
if not isinstance(feature_means, pd.Series):
    feature_means = pd.Series(feature_means, index=columns)

real_r2 = bundle.get("r2", 0.942)

# ---------------- PREDICTION ROUTE ----------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        current_year = datetime.now().year

        # ---- START from feature_means (IMPORTANT) ----
        user_row = feature_means.copy()

        # ---- Basic House Features ----
        year = int(data.get("Year", 2010))
        rooms = int(data.get("RmNum", 0))
        halls = int(data.get("HllNum", 0))
        kitchens = int(data.get("KchNum", 1))
        baths = int(data.get("BthNum", 1))

        user_row["Year"] = year
        user_row["RmNum"] = rooms
        user_row["HllNum"] = halls
        user_row["KchNum"] = kitchens
        user_row["BthNum"] = baths

        # ---- Amenities ----
        user_row["EdcNum"] = int(data.get("EdcNum", 0))
        user_row["EdcDst"] = float(data.get("EdcDst", 1000))

        user_row["HthNum"] = int(data.get("HthNum", 0))
        user_row["HthDst"] = float(data.get("HthDst", 1000))

        user_row["RtlNum"] = int(data.get("RtlNum", 0))
        user_row["RtlDst"] = float(data.get("RtlDst", 1000))

        user_row["RstNum"] = int(data.get("RstNum", 0))
        user_row["RstDst"] = float(data.get("RstDst", 1000))

        # ---- Derived Features (EXACTLY like Streamlit) ----
        if "Age" in columns:
            user_row["Age"] = current_year - year

        if "RoomsTotal" in columns:
            user_row["RoomsTotal"] = rooms + halls + kitchens + baths

        if "SchoolAccess" in columns:
            user_row["SchoolAccess"] = user_row["EdcNum"] / (user_row["EdcDst"] + 1)

        if "HealthAccess" in columns:
            user_row["HealthAccess"] = user_row["HthNum"] / (user_row["HthDst"] + 1)

        if "RetailAccess" in columns:
            user_row["RetailAccess"] = user_row["RtlNum"] / (user_row["RtlDst"] + 1)

        if "RestaurantAccess" in columns:
            user_row["RestaurantAccess"] = user_row["RstNum"] / (user_row["RstDst"] + 1)

        # ---- Location ----
        if "Lat" in columns:
            user_row["Lat"] = float(data.get("Lat"))

        if "Lng" in columns:
            user_row["Lng"] = float(data.get("Lng"))

        # ---- Create DataFrame in CORRECT ORDER ----
        df = pd.DataFrame([user_row[col] for col in columns], index=columns).T

        # ---- DEBUG ----
        print("===== FLASK MODEL DEBUG =====")
        print("Columns count:", len(df.columns))
        print("First row:", df.iloc[0].to_dict())

        # ---- Predict ----
        prediction = float(model.predict(df)[0])

        return jsonify({
            "predictedValue": prediction,
            "accuracyScore": f"{real_r2 * 100:.1f}%"
        })

    except Exception as e:
        print("Prediction Error:", e)
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)