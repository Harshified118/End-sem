"""
DropOrCop - SQLite Database Manager
Provides persistent logging, indexing, and state management for sneaker resale valuations.
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

DEFAULT_DB_PATH = Path("data/droporcop.db")


class DatabaseManager:
    """Manages SQLite connections, schema creation, indexed lookups, and prediction logging."""

    def __init__(self, db_path: Path = DEFAULT_DB_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    @contextmanager
    def _connection(self):
        """Context manager yielding a SQLite connection with guaranteed closing."""
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute("PRAGMA foreign_keys=ON;")
            yield conn
        finally:
            conn.close()

    def init_db(self) -> None:
        """Create tables, enable WAL once, and add performance indexes."""
        with self._connection() as conn:
            # WAL is a database-level mode; set it once at startup, not per connection.
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    brand TEXT NOT NULL,
                    retail_price REAL NOT NULL,
                    shoe_size REAL NOT NULL,
                    days_since_release INTEGER NOT NULL,
                    estimated_resale_price REAL NOT NULL,
                    profit REAL NOT NULL,
                    margin_pct REAL NOT NULL,
                    verdict TEXT NOT NULL,
                    sneaker_name TEXT
                );
                """
            )
            # Create indexes for fast chronological and brand-based lookups
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions (timestamp DESC);"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_predictions_brand ON predictions (brand);"
            )

            # Check if sneaker_name column exists (migration for existing database schemas)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(predictions);")
            columns = [col[1] for col in cursor.fetchall()]
            if "sneaker_name" not in columns:
                conn.execute("ALTER TABLE predictions ADD COLUMN sneaker_name TEXT;")

            conn.commit()

    def log_prediction(
        self,
        brand: str,
        retail_price: float,
        shoe_size: float,
        days_since_release: int,
        estimated_resale_price: float,
        profit: float,
        margin_pct: float,
        verdict: str,
        sneaker_name: Optional[str] = None,
    ) -> int:
        """Insert prediction record and return the newly generated row id."""
        query = """
            INSERT INTO predictions (
                brand, retail_price, shoe_size, days_since_release,
                estimated_resale_price, profit, margin_pct, verdict, sneaker_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                query,
                (
                    str(brand),
                    float(retail_price),
                    float(shoe_size),
                    int(days_since_release),
                    float(estimated_resale_price),
                    float(profit),
                    float(margin_pct),
                    str(verdict),
                    str(sneaker_name) if sneaker_name else None,
                ),
            )
            conn.commit()
            return cursor.lastrowid

    def get_prediction_count(self) -> int:
        """Return total number of recorded predictions."""
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM predictions;")
            return cursor.fetchone()[0]

    def get_recent_predictions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve recent predictions ordered by timestamp descending."""
        query = "SELECT * FROM predictions ORDER BY id DESC LIMIT ?;"
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_predictions_by_brand(self, brand: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve predictions for a specific brand."""
        query = "SELECT * FROM predictions WHERE brand = ? ORDER BY id DESC LIMIT ?;"
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (brand, limit))
            return [dict(row) for row in cursor.fetchall()]

    def get_predictions_by_verdict(self, verdict: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve predictions filtered by verdict (COP or DROP)."""
        query = "SELECT * FROM predictions WHERE verdict = ? ORDER BY id DESC LIMIT ?;"
        with self._connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (verdict, limit))
            return [dict(row) for row in cursor.fetchall()]
