"""Depletion prediction.

Deliberately small: a 7-day rolling average over daily usage. Household usage
is bursty and low-volume, so anything heavier would overfit a fortnight of
noisy data. Confidence scales with how many logs we actually have.
"""

from dataclasses import dataclass, asdict
from datetime import date, timedelta
from decimal import Decimal

import pandas as pd
from django.utils import timezone

MIN_LOGS_FOR_PREDICTION = 3
ROLLING_WINDOW = 7
RESTOCK_HORIZON_DAYS = 30
CONFIDENCE_LOG_TARGET = 20


@dataclass
class Prediction:
    days_until_empty: float | None
    predicted_empty_date: date | None
    avg_daily_usage: float | None
    suggested_quantity: float | None
    confidence: float
    log_count: int
    reason: str = ""

    def as_dict(self):
        result = asdict(self)
        if result["predicted_empty_date"] is not None:
            result["predicted_empty_date"] = result["predicted_empty_date"].isoformat()
        return result


def _empty_prediction(log_count, reason):
    return Prediction(
        days_until_empty=None,
        predicted_empty_date=None,
        avg_daily_usage=None,
        suggested_quantity=None,
        confidence=round(min(log_count / CONFIDENCE_LOG_TARGET, 1.0), 2),
        log_count=log_count,
        reason=reason,
    )


def build_daily_series(rows, window_days, end_date=None):
    """Aggregate usage rows into one value per day, zero-filled across the window.

    Zero-filling matters: a day nobody cooked is real evidence of slower usage,
    and dropping it would bias the average upward.
    """
    end_date = end_date or timezone.now().date()
    start_date = end_date - timedelta(days=window_days - 1)
    index = pd.date_range(start=start_date, end=end_date, freq="D")

    if not rows:
        return pd.Series(0.0, index=index)

    frame = pd.DataFrame(rows, columns=["logged_at", "quantity_used"])
    frame["day"] = pd.to_datetime(frame["logged_at"]).dt.tz_localize(None).dt.normalize()
    frame["quantity_used"] = frame["quantity_used"].astype(float)

    daily = frame.groupby("day")["quantity_used"].sum()
    return daily.reindex(index, fill_value=0.0).astype(float)


def predict_depletion(stock, window_days=None, today=None):
    """Return a Prediction for one Stock.

    Returns null fields (not an exception) when there isn't enough history —
    the UI shows "not enough data yet" rather than a made-up date.
    """
    from django.conf import settings

    window_days = window_days or getattr(settings, "PREDICTION_WINDOW_DAYS", 14)
    today = today or timezone.now().date()
    window_start = timezone.now() - timedelta(days=window_days)

    logs = list(
        stock.usage_logs.filter(logged_at__gte=window_start)
        .order_by("logged_at")
        .values_list("logged_at", "quantity_used")
    )
    log_count = len(logs)

    if log_count < MIN_LOGS_FOR_PREDICTION:
        return _empty_prediction(log_count, "Not enough usage logged yet.")

    series = build_daily_series(logs, window_days, end_date=today)
    rolling = series.rolling(window=ROLLING_WINDOW, min_periods=1).mean()
    avg_daily_usage = float(rolling.iloc[-1])

    confidence = round(min(log_count / CONFIDENCE_LOG_TARGET, 1.0), 2)

    if avg_daily_usage <= 0:
        return _empty_prediction(log_count, "No usage in the recent window.")

    current_quantity = float(Decimal(stock.current_quantity))
    days_until_empty = round(current_quantity / avg_daily_usage, 1)
    predicted_empty_date = today + timedelta(days=int(days_until_empty))
    suggested_quantity = round(avg_daily_usage * RESTOCK_HORIZON_DAYS, 2)

    return Prediction(
        days_until_empty=days_until_empty,
        predicted_empty_date=predicted_empty_date,
        avg_daily_usage=round(avg_daily_usage, 4),
        suggested_quantity=suggested_quantity,
        confidence=confidence,
        log_count=log_count,
        reason="",
    )


def usage_history_series(stock, window_days=30, today=None):
    """Daily usage + remaining-quantity trail, for the StockDetail chart."""
    today = today or timezone.now().date()
    window_start = timezone.now() - timedelta(days=window_days)
    logs = list(
        stock.usage_logs.filter(logged_at__gte=window_start)
        .order_by("logged_at")
        .values_list("logged_at", "quantity_used")
    )
    series = build_daily_series(logs, window_days, end_date=today)

    # Walk backwards from today's level to reconstruct what was left each day.
    remaining = float(Decimal(stock.current_quantity))
    trail = []
    for day, used in zip(reversed(series.index), reversed(series.values)):
        trail.append({"date": day.date().isoformat(), "used": float(used), "remaining": remaining})
        remaining += float(used)
    trail.reverse()
    return trail
