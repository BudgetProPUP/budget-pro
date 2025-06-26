#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Apply database migrations
echo "Applying budget_service migrations..."
python manage.py migrate --noinput

# Run the seeder
echo "Running budget_service seeder..."
python manage.py comprehensive_seeder

# Collect static files
echo "Collecting static files for budget_service..."
python manage.py collectstatic --no-input --clear

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"