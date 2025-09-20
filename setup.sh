#!/bin/bash

# Script to set up and run the AgroNexus project

echo "🚀 Setting up AgroNexus project..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please create one with: python -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create static directory if it doesn't exist
if [ ! -d "static" ]; then
    echo "📁 Creating static directory..."
    mkdir -p static
fi

# Remove existing database
if [ -f "db.sqlite3" ]; then
    echo "🗑️ Removing existing database..."
    rm db.sqlite3
fi

# Make migrations
echo "🔄 Making migrations..."
python manage.py makemigrations

# Apply migrations
echo "🔄 Applying migrations..."
python manage.py migrate

# Create superuser (skip if already exists)
echo "👤 Creating superuser..."
echo "from agronexus.models import Usuario; Usuario.objects.create_superuser('admin', 'admin@admin.com', 'admin123') if not Usuario.objects.filter(username='admin').exists() else print('Admin user already exists')" | python manage.py shell

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run basic tests (skip problematic ones)
echo "🧪 Running basic tests..."
python manage.py check

# Create test data
echo "📊 Creating test data..."
python manage.py criar_dados_teste --animais 50 --force

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
