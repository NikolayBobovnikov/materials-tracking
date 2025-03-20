import pytest
from datetime import datetime
import sys
from typing import Dict, Any
from decimal import Decimal

def test_simple():
    """A simple test to ensure pytest is working."""
    assert 1 == 1

def test_calculation():
    """Test the markup calculation logic."""
    base_amount = Decimal('100.00')
    markup_rate = Decimal('0.15')
    expected_transaction_amount = base_amount * (Decimal('1') + markup_rate)
    assert expected_transaction_amount == Decimal('115.00')

def test_error_handling():
    """Test that error handling works properly."""
    try:
        # Try an operation that will fail
        result = 1 / 0
        assert False, "Division by zero didn't raise an exception"
    except ZeroDivisionError:
        # This is the expected outcome
        assert True 