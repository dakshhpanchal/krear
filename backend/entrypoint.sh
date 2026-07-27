#!/bin/sh
python manage.py collectstatic --noinput
python manage.py migrate --noinput
celery -A config worker -l info --concurrency=1 --pool=solo &
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 120