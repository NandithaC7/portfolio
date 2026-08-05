import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Keep the pre-Celery-6 behaviour of retrying the broker on startup, so a
# worker that boots before Redis doesn't just give up.
app.conf.broker_connection_retry_on_startup = True

app.conf.beat_schedule = {
    "run-nightly-predictions": {
        "task": "stocks.tasks.run_nightly_predictions",
        "schedule": crontab(hour=0, minute=0),
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
