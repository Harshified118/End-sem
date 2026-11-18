"""
Unit Tests for DropOrCop Core Business Logic and Feature Extraction
Tests math formulas, verdict calculations, feature extractor flags, and data prep helpers.
"""

import unittest
import pandas as pd
from src.predict import predict_resale, load_model
from src.data_prep import clean_currency
from src.feature_extractor import SneakerFeatureExtractor


class TestPredictLogic(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.model = load_model()

    def test_clean_currency_utility(self):
        """Test currency cleaner handles $, commas, and whitespace."""
        s = pd.Series(["$220.00", " $1,050.50 ", "350", "$0.00"])
        cleaned = clean_currency(s)
        self.assertEqual(list(cleaned), [220.0, 1050.5, 350.0, 0.0])

    def test_feature_extractor_hype_detection(self):
        """Test SneakerFeatureExtractor flags hype keywords, retros, and dunks."""
        df = pd.DataFrame([
            {"brand": "Nike", "sneaker_name": "Nike SB Dunk Low Travis Scott", "retail_price": 150.0, "shoe_size": 10.0, "days_since_release": 50},
            {"brand": "Jordan", "sneaker_name": "Air Jordan 1 Retro High OG Chicago", "retail_price": 180.0, "shoe_size": 10.5, "days_since_release": 100},
            {"brand": "adidas", "sneaker_name": "Stan Smith Classic", "retail_price": 100.0, "shoe_size": 9.0, "days_since_release": 10},
        ])
        fe = SneakerFeatureExtractor()
        transformed = fe.transform(df)

        # Travis Scott SB Dunk should be flagged as high hype, dunk
        self.assertEqual(transformed.loc[0, "is_high_hype"], 1)
        self.assertEqual(transformed.loc[0, "is_dunk"], 1)

        # Jordan 1 Retro High should be flagged as retro, jordan 1
        self.assertEqual(transformed.loc[1, "is_retro"], 1)
        self.assertEqual(transformed.loc[1, "is_jordan1"], 1)

        # Stan smith should have 0 hype and 0 retro
        self.assertEqual(transformed.loc[2, "is_high_hype"], 0)
        self.assertEqual(transformed.loc[2, "is_retro"], 0)

        # Raw sneaker_name should be dropped after feature extraction
        self.assertNotIn("sneaker_name", transformed.columns)

    def test_predict_resale_cop_verdict(self):
        """Test predict_resale correctly flags profitable sneakers as COP."""
        res = predict_resale(
            brand="Yeezy",
            retail_price=220.0,
            shoe_size=10.5,
            days_since_release=45,
            sneaker_name="Yeezy Boost 350 V2",
            margin_threshold=0.15,
            model=self.model,
        )
        self.assertIn("estimated_resale_price", res)
        self.assertIn("estimated_profit", res)
        self.assertIn("profit_margin_pct", res)
        self.assertIn("verdict", res)
        self.assertEqual(res["brand"], "Yeezy")
        self.assertEqual(res["retail_price"], 220.0)

        # Check mathematical consistency: profit = resale - retail
        expected_profit = round(res["estimated_resale_price"] - res["retail_price"], 2)
        self.assertAlmostEqual(res["estimated_profit"], expected_profit, places=2)

        # Check profit margin pct: (profit / retail) * 100
        expected_margin = round((expected_profit / res["retail_price"]) * 100, 2)
        self.assertAlmostEqual(res["profit_margin_pct"], expected_margin, places=2)

        # Check verdict boundary logic
        if (expected_profit / res["retail_price"]) >= 0.15:
            self.assertEqual(res["verdict"], "COP")
        else:
            self.assertEqual(res["verdict"], "DROP")

    def test_predict_resale_high_threshold_drop_verdict(self):
        """Test that setting an unattainable threshold yields a DROP verdict."""
        res = predict_resale(
            brand="Yeezy",
            retail_price=220.0,
            shoe_size=10.5,
            days_since_release=45,
            margin_threshold=10.0,  # 1000% profit required
            model=self.model,
        )
        self.assertEqual(res["verdict"], "DROP")


if __name__ == "__main__":
    unittest.main()
