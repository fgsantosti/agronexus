#!/usr/bin/env python
"""
Script para verificar os usuários criados no banco
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from agronexus.models import Usuario
from django.contrib.auth import authenticate

def verificar_usuarios():
    """Verifica os usuários criados"""
    print("=" * 60)
    print("VERIFICANDO USUÁRIOS NO BANCO DE DADOS")
    print("=" * 60)
    
    usuarios = Usuario.objects.all()
    print(f"Total de usuários: {usuarios.count()}")
    print()
    
    for usuario in usuarios[:15]:  # Mostrar os primeiros 15
        print(f"👤 Username: {usuario.username}")
        print(f"   Email: {usuario.email}")
        print(f"   Perfil: {usuario.perfil}")
        print(f"   Ativo: {usuario.is_active}")
        print(f"   Staff: {usuario.is_staff}")
        print(f"   Superuser: {usuario.is_superuser}")
        print(f"   Senha hash: {usuario.password[:20]}...")
        print()

def testar_login():
    """Testa login com algumas credenciais"""
    print("=" * 60)
    print("TESTANDO LOGIN")
    print("=" * 60)
    
    credenciais_teste = [
        ('admin', 'admin123'),
        ('admin@agronexus.com', 'admin123'),
        ('proprietario1', '123456'),
        ('proprietario1@fazenda.com', '123456'),
        ('gerente1', '123456'),
        ('gerente1@fazenda.com', '123456'),
        ('funcionario1', '123456'),
        ('funcionario1@fazenda.com', '123456'),
    ]
    
    for username, password in credenciais_teste:
        print(f"Testando: {username} / {password}")
        user = authenticate(username=username, password=password)
        if user:
            print(f"  ✅ LOGIN SUCESSO: {user.username} ({user.email}) - Perfil: {user.perfil}")
        else:
            print(f"  ❌ LOGIN FALHOU")
        print()

def verificar_configuracao_auth():
    """Verifica configurações de autenticação"""
    print("=" * 60)
    print("VERIFICANDO CONFIGURAÇÕES DE AUTENTICAÇÃO")
    print("=" * 60)
    
    from django.conf import settings
    
    print(f"AUTH_USER_MODEL: {getattr(settings, 'AUTH_USER_MODEL', 'Não definido')}")
    print(f"LOGIN_URL: {getattr(settings, 'LOGIN_URL', 'Não definido')}")
    print(f"LOGIN_REDIRECT_URL: {getattr(settings, 'LOGIN_REDIRECT_URL', 'Não definido')}")
    print()
    
    # Verificar se existe usuário admin
    try:
        admin_user = Usuario.objects.get(username='admin')
        print(f"Usuário admin encontrado: {admin_user.email}")
        print(f"Admin ativo: {admin_user.is_active}")
        print(f"Admin superuser: {admin_user.is_superuser}")
    except Usuario.DoesNotExist:
        print("❌ Usuário admin não encontrado!")
    print()

if __name__ == "__main__":
    verificar_usuarios()
    verificar_configuracao_auth()
    testar_login()
