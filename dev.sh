#!/bin/bash

# AgroNexus - Sistema Fertili
# Script de desenvolvimento

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AgroNexus - Sistema Fertili${NC}"
echo -e "${BLUE}================================${NC}"

# Função para executar comandos
run_command() {
    echo -e "${YELLOW}$1${NC}"
    eval $2
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${GREEN}Escolha uma opção:${NC}"
    echo "1. Executar servidor de desenvolvimento"
    echo "2. Executar testes"
    echo "3. Criar migrações"
    echo "4. Aplicar migrações"
    echo "5. Criar superusuário"
    echo "6. Shell Django"
    echo "7. Executar Celery Worker"
    echo "8. Executar Celery Beat"
    echo "9. Colete arquivos estáticos"
    echo "10. Limpar cache"
    echo "11. Backup do banco"
    echo "12. Restaurar banco"
    echo "13. Gerar dados de teste"
    echo "0. Sair"
    echo ""
}

# Função para executar servidor
run_server() {
    run_command "🌐 Iniciando servidor de desenvolvimento..." "./venv/bin/python manage.py runserver 0.0.0.0:8000"
}

# Função para executar testes
run_tests() {
    run_command "🧪 Executando testes..." "./venv/bin/python manage.py test --verbosity=2"
}

# Função para criar migrações
make_migrations() {
    run_command "📝 Criando migrações..." "./venv/bin/python manage.py makemigrations"
}

# Função para aplicar migrações
migrate() {
    run_command "🔄 Aplicando migrações..." "./venv/bin/python manage.py migrate"
}

# Função para criar superusuário
create_superuser() {
    run_command "👤 Criando superusuário..." "./venv/bin/python manage.py createsuperuser"
}

# Função para shell Django
django_shell() {
    run_command "🐍 Abrindo shell Django..." "./venv/bin/python manage.py shell"
}

# Função para Celery Worker
celery_worker() {
    run_command "⚡ Iniciando Celery Worker..." "celery -A core worker --loglevel=info"
}

# Função para Celery Beat
celery_beat() {
    run_command "⏰ Iniciando Celery Beat..." "celery -A core beat --loglevel=info"
}

# Função para collectstatic
collect_static() {
    run_command "📁 Coletando arquivos estáticos..." "./venv/bin/python manage.py collectstatic --noinput"
}

# Função para limpar cache
clear_cache() {
    run_command "🧹 Limpando cache..." "./venv/bin/python manage.py clearcache"
}

# Função para backup
backup_db() {
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/agronexus_backup_$(date +%Y%m%d_%H%M%S).json"
    run_command "💾 Fazendo backup do banco..." "./venv/bin/python manage.py dumpdata --exclude=contenttypes --exclude=auth.Permission > $BACKUP_FILE"
    echo -e "${GREEN}✅ Backup salvo em: $BACKUP_FILE${NC}"
}

# Função para restaurar banco
restore_db() {
    echo -e "${YELLOW}Digite o caminho do arquivo de backup:${NC}"
    read backup_file
    if [ -f "$backup_file" ]; then
        run_command "🔄 Restaurando banco..." "./venv/bin/python manage.py loaddata $backup_file"
    else
        echo -e "${RED}❌ Arquivo não encontrado!${NC}"
    fi
}

# Função para gerar dados de teste
generate_test_data() {
    run_command "🎲 Gerando dados de teste..." "./venv/bin/python manage.py shell < scripts/generate_test_data.py"
}

# Loop principal
while true; do
    show_menu
    read -p "Opção: " choice
    
    case $choice in
        1)
            run_server
            ;;
        2)
            run_tests
            ;;
        3)
            make_migrations
            ;;
        4)
            migrate
            ;;
        5)
            create_superuser
            ;;
        6)
            django_shell
            ;;
        7)
            celery_worker
            ;;
        8)
            celery_beat
            ;;
        9)
            collect_static
            ;;
        10)
            clear_cache
            ;;
        11)
            backup_db
            ;;
        12)
            restore_db
            ;;
        13)
            generate_test_data
            ;;
        0)
            echo -e "${GREEN}👋 Até logo!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida!${NC}"
            ;;
    esac
    
    echo ""
    read -p "Pressione Enter para continuar..."
done
