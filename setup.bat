@echo off
echo 🚀 Setting up AgroNexus project...

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found!
    echo Please create one with: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found!
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Create static directory if it doesn't exist
if not exist "static\" (
    echo 📁 Creating static directory...
    mkdir static
)

REM Remove existing database
if exist "db.sqlite3" (
    echo 🗑️ Removing existing database...
    del db.sqlite3
)

REM Make migrations
echo 🔄 Making migrations...
python manage.py makemigrations

REM Apply migrations
echo 🔄 Applying migrations...
python manage.py migrate

REM Create superuser
echo 👤 Creating superuser...
echo from agronexus.models import Usuario; Usuario.objects.create_superuser('admin', 'admin@admin.com', 'admin123') if not Usuario.objects.filter(username='admin').exists() else print('Admin user already exists') | python manage.py shell

REM Collect static files
echo 📁 Collecting static files...
python manage.py collectstatic --noinput

REM Run basic tests
echo 🧪 Running basic tests...
python manage.py check

REM Create test data
echo 📊 Creating test data...
python manage.py criar_dados_teste --animais 50 --force

echo ✅ Setup complete!
echo.
echo 📖 Available commands:
echo   python manage.py runserver      - Start development server
echo   python manage.py test           - Run tests
echo   python manage.py shell          - Django shell
echo   python manage.py createsuperuser - Create admin user
echo.
echo 🌐 API Documentation:
echo   http://localhost:8000/api/docs/          - Swagger UI
echo   http://localhost:8000/api/redoc/         - ReDoc
echo   http://localhost:8000/admin/             - Django Admin
echo.
echo 🔑 Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo.
pause