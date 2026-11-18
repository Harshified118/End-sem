"""
Shared helpers for integration tests.

Redirects the FastAPI app's prediction ledger to a throwaway temp database so
the test suite cannot pollute `data/droporcop.db` (the user's real ledger).
"""

import tempfile
from pathlib import Path

import api.main as api_main
from src.db import DatabaseManager


def use_temp_ledger():
    """
    Swap the module-level db_manager for a fresh temp one.
    Returns a cleanup callable; the original (pre-test) manager is re-set on
    cleanup so the process state is sane after the suite.
    """
    tmp = tempfile.TemporaryDirectory(prefix="droporcop-test-")
    original = api_main.db_manager
    api_main.db_manager = DatabaseManager(Path(tmp.name) / "test_droporcop.db")
    api_main.db_manager.init_db()

    def cleanup():
        api_main.db_manager = original
        tmp.cleanup()

    return cleanup
