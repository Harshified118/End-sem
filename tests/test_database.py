"""
Unit and Integration Tests for DropOrCop Database Operations
Tests database initialization, schema indexes, inserting predictions, querying history, and state transitions.
"""

import unittest
import sqlite3
import tempfile
import os
from pathlib import Path
from src.db import DatabaseManager


class TestDatabaseManager(unittest.TestCase):

    def setUp(self):
        # Create temporary database for testing isolation
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "test_droporcop.db"
        self.db_manager = DatabaseManager(db_path=self.db_path)
        self.db_manager.init_db()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_schema_initialization_and_indexes(self):
        """Test tables and performance indexes are created properly."""
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            self.assertIn("predictions", tables)

            # Check index on timestamp and brand for fast lookups
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index';")
            indexes = [row[0] for row in cursor.fetchall()]
            self.assertIn("idx_predictions_timestamp", indexes)
            self.assertIn("idx_predictions_brand", indexes)
        finally:
            conn.close()

    def test_insert_prediction_and_state_transition(self):
        """Test inserting a prediction record and verifying state transition."""
        initial_count = self.db_manager.get_prediction_count()
        self.assertEqual(initial_count, 0)

        record_id = self.db_manager.log_prediction(
            brand="Yeezy",
            retail_price=220.0,
            shoe_size=10.5,
            days_since_release=45,
            estimated_resale_price=340.50,
            profit=120.50,
            margin_pct=54.77,
            verdict="COP",
            sneaker_name="Yeezy Boost 350 V2",
        )
        self.assertIsInstance(record_id, int)
        self.assertGreater(record_id, 0)

        # Count transitioned from 0 to 1
        new_count = self.db_manager.get_prediction_count()
        self.assertEqual(new_count, 1)

        # Retrieve recent predictions and verify fields
        recent = self.db_manager.get_recent_predictions(limit=5)
        self.assertEqual(len(recent), 1)
        row = recent[0]
        self.assertEqual(row["brand"], "Yeezy")
        self.assertEqual(row["retail_price"], 220.0)
        self.assertEqual(row["estimated_resale_price"], 340.50)
        self.assertEqual(row["verdict"], "COP")
        self.assertEqual(row["sneaker_name"], "Yeezy Boost 350 V2")

    def test_query_filter_by_brand(self):
        """Test filtered retrieval of predictions by brand."""
        self.db_manager.log_prediction("Yeezy", 220.0, 10.5, 45, 340.0, 120.0, 54.5, "COP")
        self.db_manager.log_prediction("Off-White", 190.0, 9.0, 100, 600.0, 410.0, 215.8, "COP")
        self.db_manager.log_prediction("Nike", 120.0, 11.0, 20, 100.0, -20.0, -16.7, "DROP")

        yeezy_records = self.db_manager.get_predictions_by_brand("Yeezy")
        self.assertEqual(len(yeezy_records), 1)
        self.assertEqual(yeezy_records[0]["brand"], "Yeezy")

        drop_records = self.db_manager.get_predictions_by_verdict("DROP")
        self.assertEqual(len(drop_records), 1)
        self.assertEqual(drop_records[0]["brand"], "Nike")


if __name__ == "__main__":
    unittest.main()
