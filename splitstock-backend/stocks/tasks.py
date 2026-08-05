import logging

from celery import shared_task

from ml.predictor import predict_depletion

from .broadcast import broadcast_restock_alert
from .models import RestockSuggestion, Stock

logger = logging.getLogger(__name__)


def apply_prediction(stock):
    """Run the model for one stock and persist the result."""
    prediction = predict_depletion(stock)

    stock.days_until_empty = prediction.days_until_empty
    stock.predicted_empty_date = prediction.predicted_empty_date
    stock.save(update_fields=["days_until_empty", "predicted_empty_date", "updated_at"])

    RestockSuggestion.objects.update_or_create(
        stock=stock,
        defaults={
            "predicted_empty_date": prediction.predicted_empty_date,
            "suggested_quantity": prediction.suggested_quantity,
            "confidence": prediction.confidence,
            "avg_daily_usage": prediction.avg_daily_usage,
        },
    )
    return prediction


@shared_task(name="stocks.tasks.run_nightly_predictions")
def run_nightly_predictions():
    """Re-forecast every active stock and raise alerts for anything running out."""
    from notifications.tasks import send_restock_alert

    stocks = Stock.objects.filter(is_active=True).select_related("household")

    predicted = 0
    alerted = 0
    skipped = 0

    for stock in stocks:
        prediction = apply_prediction(stock)

        if prediction.days_until_empty is None:
            skipped += 1
            continue

        predicted += 1
        if prediction.days_until_empty <= stock.alert_threshold:
            send_restock_alert.delay(
                stock.id,
                days_left=prediction.days_until_empty,
                suggested_quantity=prediction.suggested_quantity,
            )
            broadcast_restock_alert(
                stock,
                days_left=prediction.days_until_empty,
                suggested_quantity=prediction.suggested_quantity,
            )
            alerted += 1

    summary = {"predicted": predicted, "alerted": alerted, "skipped": skipped}
    logger.info("Nightly predictions complete: %s", summary)
    return summary


@shared_task(name="stocks.tasks.predict_single_stock")
def predict_single_stock(stock_id):
    stock = Stock.objects.filter(id=stock_id).first()
    if stock is None:
        return {"error": "stock_missing"}
    return apply_prediction(stock).as_dict()
