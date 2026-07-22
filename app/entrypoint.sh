#!/bin/sh
echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Installing frontend dependencies..."
cd /app/frontend/
npm install

echo "Building frontend assets..."
npm run build
cd /app

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 1 \
    --timeout 120


