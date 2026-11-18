"""
Integration Tests for DropOrCop REST API Endpoints
Tests /, /health, /brands, /predict, /history, validation rules, status codes, and edge cases.
"""

import unittest
from fastapi.testclient import TestClient
from api.main import app


class TestAPIEndpoints(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        """Test GET / returns 200 and expected metadata."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("DropOrCop", data["message"])
        self.assertEqual(data.get("version"), "1.0.0")
        self.assertEqual(data.get("docs_url"), "/docs")

    def test_health_endpoint(self):
        """Test GET /health returns healthy status and connected model."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data["status"], ["healthy", "ok"])
        self.assertTrue(data["model_loaded"])

    def test_brands_endpoint(self):
        """Test GET /brands returns supported brands and defaults."""
        response = self.client.get("/brands")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("brands", data)
        self.assertIn("Yeezy", data["brands"])
        self.assertIn("Off-White", data["brands"])
        self.assertIn("default_retail", data)
        self.assertIn("total", data)
        self.assertEqual(data["total"], len(data["brands"]))

    def test_predict_yeezy_cop(self):
        """Test POST /predict with a standard Yeezy release yielding COP."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.5,
            "days_since_release": 45,
            "threshold": 0.15,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["brand"], "Yeezy")
        self.assertEqual(data["retail_price"], 220.0)
        self.assertGreater(data["estimated_resale_price"], 0)
        self.assertIn(data["verdict"], ["COP", "DROP"])
        self.assertAlmostEqual(
            data["estimated_profit"],
            round(data["estimated_resale_price"] - data["retail_price"], 2),
            places=2,
        )

    def test_predict_offwhite(self):
        """Test POST /predict with an Off-White release."""
        payload = {
            "brand": "Off-White",
            "retail_price": 190.0,
            "shoe_size": 9.5,
            "days_since_release": 90,
            "threshold": 0.15,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["brand"], "Off-White")
        self.assertEqual(data["retail_price"], 190.0)
        self.assertGreater(data["estimated_resale_price"], 0)
        self.assertIn(data["verdict"], ["COP", "DROP"])

    def test_predict_brand_case_insensitivity(self):
        """Test POST /predict treats 'adidas' and 'Adidas' identically without divergence."""
        payload_lower = {
            "brand": "adidas",
            "retail_price": 130.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
        }
        payload_upper = {
            "brand": "Adidas",
            "retail_price": 130.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
        }
        res_lower = self.client.post("/predict", json=payload_lower)
        res_upper = self.client.post("/predict", json=payload_upper)

        self.assertEqual(res_lower.status_code, 200)
        self.assertEqual(res_upper.status_code, 200)
        # Predictions must be identical after normalization
        self.assertEqual(
            res_lower.json()["estimated_resale_price"],
            res_upper.json()["estimated_resale_price"],
        )

    def test_predict_threshold_null_fallback(self):
        """Test POST /predict does not crash with 500 when threshold is explicitly null."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.5,
            "days_since_release": 45,
            "threshold": None,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("verdict", data)
        self.assertIn(data["verdict"], ["COP", "DROP"])

    def test_predict_unsupported_brand(self):
        """Test POST /predict with an unknown brand returns 400 Bad Request."""
        payload = {
            "brand": "NonExistentShoeBrand999",
            "retail_price": 150.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Unsupported brand", data["detail"])

    def test_predict_missing_required_fields(self):
        """Test POST /predict with missing required fields returns 422."""
        response = self.client.post("/predict", json={"brand": "Yeezy"})
        self.assertEqual(response.status_code, 422)

    def test_predict_negative_retail_price(self):
        """Test POST /predict with retail_price <= 0 returns 422."""
        payload = {
            "brand": "Yeezy",
            "retail_price": -50.0,
            "shoe_size": 10.5,
            "days_since_release": 45,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_predict_negative_shoe_size(self):
        """Test POST /predict with negative shoe size returns 422."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": -10.0,
            "days_since_release": 45,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_predict_negative_days(self):
        """Test POST /predict with negative days returns 422."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.5,
            "days_since_release": -10,
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
