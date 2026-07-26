#!/bin/sh
python manage.py collectstatic --noinput
python manage.py migrate --noinput
celery -A config worker -l info --concurrency=2 &
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120