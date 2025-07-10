#!/usr/bin/env python
"""
Script para testar a integração completa frontend-backend
"""
import requests
import json

def test_integration():
    print("=" * 60)
    print("TESTE DE INTEGRAÇÃO FRONTEND-BACKEND")
    print("=" * 60)
    
    # Testar backend na porta 8001
    backend_url = "http://localhost:8001/api/auth/login/"
    frontend_url = "http://localhost:3000"
    
    print("🔍 1. Testando Backend API...")
    try:
        response = requests.post(backend_url, json={
            "username": "admin",
            "password": "admin123"
        }, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Backend funcionando!")
            print(f"   - Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"   - Usuário: {data.get('user', {}).get('username', 'N/A')}")
            print(f"   - Email: {data.get('user', {}).get('email', 'N/A')}")
            print(f"   - Perfil: {data.get('user', {}).get('perfil', 'N/A')}")
        else:
            print(f"   ❌ Backend com erro: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Erro ao testar backend: {e}")
    
    print("\n🌐 2. Testando Frontend...")
    try:
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend carregando!")
            print(f"   - Status: {response.status_code}")
        else:
            print(f"   ❌ Frontend com erro: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro ao acessar frontend: {e}")
    
    print("\n📋 3. Credenciais de teste disponíveis:")
    credenciais = [
        ("admin", "admin123", "Administrador"),
        ("proprietario1", "123456", "Proprietário"),
        ("gerente1", "123456", "Gerente"),
        ("funcionario1", "123456", "Funcionário"),
    ]
    
    for username, password, tipo in credenciais:
        print(f"   - {tipo}: {username} / {password}")
    
    print("\n🔧 4. URLs importantes:")
    print(f"   - Frontend: {frontend_url}")
    print(f"   - Backend API: http://localhost:8001/api/")
    print(f"   - Django Admin: http://localhost:8001/admin/")
    print(f"   - API Docs: http://localhost:8001/api/docs/")
    
    print("\n✨ 5. Teste manual:")
    print("   1. Acesse o frontend em http://localhost:3000")
    print("   2. Use qualquer uma das credenciais acima")
    print("   3. Verifique se o login funciona e redireciona para o dashboard")

if __name__ == "__main__":
    test_integration()
