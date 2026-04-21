# train_model.py
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from sklearn import metrics
from sklearn.model_selection import train_test_split
from sklearn.linear_model import RidgeCV
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
import joblib

CSV_PATH = "dsaa_dataset_order_rename_1.csv"

def load_and_prepare():
    data = pd.read_csv(CSV_PATH)

    # Drop unused columns if present
    data = data.drop(columns=['id', 'TtlPrc'], errors='ignore')
    data = data.dropna(subset=['UntPrc'])

    # Feature engineering (must match Streamlit app)
    data['Age'] = 2025 - data['Year']
    data['RoomsTotal'] = data['RmNum'] + data['HllNum'] + data['KchNum'] + data['BthNum']
    data['SchoolAccess'] = data['EdcNum'] / (data['EdcDst'] + 1)
    data['HealthAccess'] = data['HthNum'] / (data['HthDst'] + 1)
    data['RetailAccess'] = data['RtlNum'] / (data['RtlDst'] + 1)
    data['RestaurantAccess'] = data['RstNum'] / (data['RstDst'] + 1)

    data = data.dropna(axis=0).reset_index(drop=True)

    X = data.drop(columns=['UntPrc'])
    y = data['UntPrc']

    return X, y

def train_and_save():
    X, y = load_and_prepare()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    # Base models
    rf = RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    xgb = XGBRegressor(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='reg:squarederror',
        eval_metric='rmse',
        random_state=42,
        n_jobs=-1,
        verbosity=0
    )
    xgb.fit(X_train, y_train)

    lgbm = LGBMRegressor(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbosity=-1
    )
    lgbm.fit(X_train, y_train)

    ridge = RidgeCV(alphas=[0.1, 1.0, 10.0])
    ridge.fit(X_train, y_train)

    estimators = [
        ('rf', rf),
        ('xgb', xgb),
        ('lgbm', lgbm),
        ('ridge', ridge),
    ]

    stacking_reg = StackingRegressor(
        estimators=estimators,
        final_estimator=CatBoostRegressor(
            iterations=300,
            depth=8,
            learning_rate=0.03,
            verbose=0,
            random_state=42
        ),
        passthrough=True,
        cv=3,
        n_jobs=-1
    )
    stacking_reg.fit(X_train, y_train)

    y_pred = stacking_reg.predict(X_test)
    r2 = metrics.r2_score(y_test, y_pred)
    print(f"Stacking model R^2 on test data: {r2:.4f}")

    # Bundle everything the app needs
    bundle = {
        "model": stacking_reg,
        "columns": X.columns.tolist(),
        "feature_means": X_train.mean(),
        "center_lat": float(X["Lat"].mean()),
        "center_lng": float(X["Lng"].mean()),
        "r2": float(r2),
    }

    joblib.dump(bundle, "house_price_bundle.joblib")
    print("Saved model bundle to house_price_bundle.joblib")

if __name__ == "__main__":
    train_and_save()
