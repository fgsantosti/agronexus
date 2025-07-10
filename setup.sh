#!/bin/bash

# Script to set up and run the AgroNexus project

echo "🚀 Setting up AgroNexus project..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Make migrations
echo "🔄 Making migrations..."
python manage.py makemigrations

# Apply migrations
echo "🔄 Applying migrations..."
python manage.py migrate

# Create superuser (optional)
echo "👤 Creating superuser..."
echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@admin.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run tests
echo "🧪 Running tests..."
python manage.py test

echo "✅ Setup complete!"
echo ""
echo "📖 Available commands:"
echo "  python manage.py runserver      - Start development server"
echo "  python manage.py test           - Run tests"
echo "  python manage.py shell          - Django shell"
echo "  python manage.py createsuperuser - Create admin user"
echo ""
echo "🌐 API Documentation:"
echo "  http://localhost:8000/api/docs/          - Swagger UI"
echo "  http://localhost:8000/api/redoc/         - ReDoc"
echo "  http://localhost:8000/admin/             - Django Admin"
echo ""
echo "🔑 Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
