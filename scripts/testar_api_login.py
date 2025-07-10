#!/usr/bin/env python
"""
Script para testar a API JWT do frontend
"""
import os
import sys
import django
import requests
import json

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

BASE_URL = "http://localhost:8001"

def testar_login_api():
    """Testa login via API JWT"""
    print("=" * 60)
    print("TESTANDO LOGIN VIA API JWT")
    print("=" * 60)
    
    credenciais_teste = [
        {
            'username': 'admin',
            'password': 'admin123',
            'label': 'Admin com username'
        },
        {
            'username': 'admin@agronexus.com',
            'password': 'admin123',
            'label': 'Admin com email'
        },
        {
            'username': 'proprietario1',
            'password': '123456',
            'label': 'Proprietario1 com username'
        },
        {
            'username': 'proprietario1@fazenda.com',
            'password': '123456',
            'label': 'Proprietario1 com email'
        },
        {
            'username': 'gerente1@fazenda.com',
            'password': '123456',
            'label': 'Gerente1 com email'
        }
    ]
    
    for cred in credenciais_teste:
        print(f"Testando: {cred['label']}")
        print(f"  Username/Email: {cred['username']}")
        print(f"  Password: {cred['password']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/auth/login/",
                json={
                    'username': cred['username'],
                    'password': cred['password']
                },
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ LOGIN SUCESSO!")
                print(f"  Access Token: {data.get('access', 'N/A')[:20]}...")
                print(f"  Refresh Token: {data.get('refresh', 'N/A')[:20]}...")
                
                if 'user' in data:
                    user_data = data['user']
                    print(f"  Usuário: {user_data.get('username')} ({user_data.get('email')})")
                    print(f"  Perfil: {user_data.get('perfil')}")
                
                if 'propriedades' in data:
                    print(f"  Propriedades: {len(data['propriedades'])}")
                    
            else:
                print(f"  ❌ LOGIN FALHOU")
                try:
                    error_data = response.json()
                    print(f"  Erro: {error_data}")
                except:
                    print(f"  Resposta: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"  ❌ ERRO DE CONEXÃO: {e}")
        
        print()

def testar_urls_disponiveis():
    """Testa se as URLs estão disponíveis"""
    print("=" * 60)
    print("TESTANDO URLS DISPONÍVEIS")
    print("=" * 60)
    
    urls_teste = [
        "/api/auth/login/",
        "/api/auth/refresh/", 
        "/api/auth/verify/",
        "/api/",
        "/api/v1/",
        "/admin/"
    ]
    
    for url in urls_teste:
        try:
            response = requests.get(f"{BASE_URL}{url}", timeout=5)
            print(f"{url} - Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"{url} - ERRO: {e}")
    
    print()

def verificar_servidor():
    """Verifica se o servidor está rodando"""
    print("=" * 60)
    print("VERIFICANDO SERVIDOR")
    print("=" * 60)
    
    try:
        response = requests.get(BASE_URL, timeout=5)
        print(f"Servidor Django: ✅ Rodando (Status: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"Servidor Django: ❌ Não acessível - {e}")
    
    print()

if __name__ == "__main__":
    verificar_servidor()
    testar_urls_disponiveis()
    testar_login_api()
