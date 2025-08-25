#!/bin/bash

# Script simplificado para setup do AgroNexus

echo "🚀 AgroNexus - Setup Simplificado..."

# Ativar ambiente virtual
if [ -d "venv" ]; then
    echo "📦 Ativando ambiente virtual..."
    source venv/bin/activate
else
    echo "❌ Ambiente virtual não encontrado!"
    echo "Crie um com: python -m venv venv"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Criar diretório static se não existir
mkdir -p static

# Fazer migrações
echo "🔄 Aplicando migrações..."
python manage.py migrate

# Verificar sistema
echo "🔍 Verificando sistema..."
python manage.py check

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Criar superusuário se não existir
echo "👤 Verificando superusuário..."
python manage.py shell -c "
from agronexus.models import Usuario
if not Usuario.objects.filter(username='admin').exists():
    Usuario.objects.create_superuser('admin', 'admin@admin.com', 'admin123')
    print('✅ Superusuário admin criado')
else:
    print('✅ Superusuário admin já existe')
"

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📖 Comandos disponíveis:"
echo "  python manage.py runserver        - Iniciar servidor de desenvolvimento"
echo "  python manage.py shell            - Shell Django"
echo "  python manage.py createsuperuser  - Criar usuário administrativo"
echo ""
echo "🌐 URLs importantes:"
echo "  http://localhost:8000/api/docs/   - Documentação da API (Swagger)"
echo "  http://localhost:8000/api/redoc/  - Documentação da API (ReDoc)"
echo "  http://localhost:8000/admin/      - Painel administrativo Django"
echo ""
echo "🔑 Credenciais padrão do admin:"
echo "  Usuário: admin"
echo "  Senha: admin123"
