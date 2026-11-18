"""
Phase 3: Adversarial Quality Assurance & Stress Testing (/qa)
Actively attempts to break the system: malformed payloads, injection strings,
boundary values, oversized strings, and concurrent load.
"""

import concurrent.futures
import math
import time
import unittest
import api.main as api_main
from fastapi.testclient import TestClient
from tests._support import use_temp_ledger


class TestAdversarialQA(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls._cleanup = use_temp_ledger()
        cls.client = TestClient(api_main.app)

    @classmethod
    def tearDownClass(cls):
        cls._cleanup()

    # 1. Malformed JSON & Content Types
    def test_malformed_json_syntax(self):
        """Send malformed JSON syntax and ensure graceful 422 response."""
        res = self.client.post(
            "/predict",
            content=b'{"brand": "Yeezy", "retail_price": 220.0, BROKEN_JSON}',
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(res.status_code, 422)

    def test_empty_request_body(self):
        """Send empty request body and ensure 422."""
        res = self.client.post(
            "/predict",
            content=b"",
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(res.status_code, 422)

    def test_non_json_content_type(self):
        """Send plain text body to predict endpoint."""
        res = self.client.post(
            "/predict",
            content=b"brand=Yeezy&retail_price=220",
            headers={"Content-Type": "text/plain"},
        )
        self.assertEqual(res.status_code, 422)

    # 2. Boundary Values (Null, Zero, Negative, Extremes)
    def test_zero_retail_price(self):
        """retail_price = 0 must be rejected with 422 (gt=0)."""
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 0.0, "shoe_size": 10.0, "days_since_release": 30},
        )
        self.assertEqual(res.status_code, 422)

    def test_zero_shoe_size(self):
        """shoe_size = 0 must be rejected with 422 (gt=0)."""
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 220.0, "shoe_size": 0.0, "days_since_release": 30},
        )
        self.assertEqual(res.status_code, 422)

    def test_boundary_days_since_release_zero(self):
        """days_since_release = 0 (same day drop) should be valid."""
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 220.0, "shoe_size": 10.0, "days_since_release": 0},
        )
        self.assertEqual(res.status_code, 200)

    def test_extreme_large_numbers(self):
        """Test with extreme large retail price and release days without server crash."""
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 100000.0, "shoe_size": 16.0, "days_since_release": 5000},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("verdict", data)
        self.assertEqual(data["verdict"], "DROP")

    # 3. Security & Injection Probing
    def test_sql_injection_in_brand(self):
        """Attempt SQL injection via brand string."""
        payload = {
            "brand": "Yeezy'; DROP TABLE predictions; --",
            "retail_price": 220.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
        }
        res = self.client.post("/predict", json=payload)
        # Should be rejected as unsupported brand (400)
        self.assertEqual(res.status_code, 400)

        # Confirm predictions table was not dropped
        self.assertGreaterEqual(api_main.db_manager.get_prediction_count(), 0)

    def test_sql_injection_in_sneaker_name(self):
        """Attempt SQL injection via sneaker_name string."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
            "sneaker_name": "'; DELETE FROM predictions; --",
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 200)

        # Database parameterization must protect table
        self.assertGreater(api_main.db_manager.get_prediction_count(), 0)

    def test_xss_payload_in_sneaker_name(self):
        """Verify HTML/XSS strings do not cause unhandled errors."""
        payload = {
            "brand": "Off-White",
            "retail_price": 190.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
            "sneaker_name": "<script>alert('XSS')</script>",
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["sneaker_name"], "<script>alert('XSS')</script>")

    # 4. Oversized String DoS Probing
    def test_oversized_string_handling(self):
        """Test sending a 50,000 character string in sneaker_name."""
        huge_name = "Yeezy " + ("A" * 50000)
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.0,
            "days_since_release": 30,
            "sneaker_name": huge_name,
        }
        t0 = time.time()
        res = self.client.post("/predict", json=payload)
        elapsed = time.time() - t0
        # Names are capped at 120 chars; anything longer is rejected, not stored.
        self.assertEqual(res.status_code, 422)
        self.assertLess(elapsed, 1.0)

    # 5. High Concurrency Stress Test
    # 6. Numerical Abuse (NaN / Infinity / Imbalance)
    def test_nan_retail_price_rejected(self):
        res = self.client.post(
            "/predict",
            content=b'{"brand": "Yeezy", "retail_price": NaN, "shoe_size": 10.0, "days_since_release": 30}',
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(res.status_code, 422)

    def test_infinity_retail_price_rejected(self):
        res = self.client.post(
            "/predict",
            content=b'{"brand": "Yeezy", "retail_price": 1e400, "shoe_size": 10.0, "days_since_release": 30}',
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(res.status_code, 422)

    def test_subnormal_retail_price_rejected(self):
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 5e-324, "shoe_size": 10.0, "days_since_release": 30},
        )
        self.assertEqual(res.status_code, 422)

    def test_threshold_out_of_range_rejected(self):
        for bad in ("-0.1", "1.0001", "1e400"):
            res = self.client.post(
                "/predict",
                content=(
                    b'{"brand": "Yeezy", "retail_price": 220.0, "shoe_size": 10.0, '
                    b'"days_since_release": 30, "threshold": ' + bad.encode() + b'}'
                ),
                headers={"Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 422, f"threshold={bad} should be rejected")

    def test_extrapolated_brand_flagged(self):
        res = self.client.post(
            "/predict",
            json={"brand": "Nike", "retail_price": 150.0, "shoe_size": 10.0,
                  "days_since_release": 30, "threshold": 0.15},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_extrapolated"])
        self.assertEqual(data["threshold"], 0.15)

    def test_trained_brand_not_flagged(self):
        res = self.client.post(
            "/predict",
            json={"brand": "Off-White", "retail_price": 190.0, "shoe_size": 10.0,
                  "days_since_release": 30},
        )
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["is_extrapolated"])

    def test_zero_days_is_valid(self):
        res = self.client.post(
            "/predict",
            json={"brand": "Yeezy", "retail_price": 220.0, "shoe_size": 10.0, "days_since_release": 0},
        )
        self.assertEqual(res.status_code, 200)

    def test_concurrent_requests_stress(self):
        """Fire 40 concurrent prediction requests and verify zero thread contention crashes."""
        payload = {
            "brand": "Yeezy",
            "retail_price": 220.0,
            "shoe_size": 10.5,
            "days_since_release": 45,
            "sneaker_name": "Yeezy 350 V2 Concurrent Stress",
        }

        def make_request(i):
            client = TestClient(api_main.app)
            return client.post("/predict", json=payload)

        num_workers = 40
        t_start = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_workers) as executor:
            futures = [executor.submit(make_request, i) for i in range(num_workers)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        total_time = time.time() - t_start

        # Assert every single concurrent request succeeded
        self.assertEqual(len(responses), num_workers)
        for r in responses:
            self.assertEqual(r.status_code, 200)
            self.assertIn(r.json()["verdict"], ["COP", "DROP"])

        avg_latency = (total_time / num_workers) * 1000
        print(f"\n[Stress Test] {num_workers} concurrent requests finished in {total_time:.2f}s (Avg per request: {avg_latency:.2f}ms)")


if __name__ == "__main__":
    unittest.main()
