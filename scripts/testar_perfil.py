#!/usr/bin/env python
"""
Script para testar endpoint de perfil do usuário
"""
import requests
import json

# Configurações
BASE_URL = "http://localhost:8001"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
PROFILE_URL = f"{BASE_URL}/api/auth/profile/"

def test_profile_endpoint():
    print("=" * 60)
    print("TESTANDO ENDPOINT DE PERFIL")
    print("=" * 60)
    
    # 1. Fazer login para obter token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print(f"1. Fazendo login em: {LOGIN_URL}")
    try:
        response = requests.post(LOGIN_URL, json=login_data, headers={'Content-Type': 'application/json'})
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            login_response = response.json()
            access_token = login_response.get('access')
            print(f"   ✅ Token obtido: {access_token[:50]}...")
            
            # 2. Testar endpoint de perfil
            print(f"\n2. Testando perfil em: {PROFILE_URL}")
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            profile_response = requests.get(PROFILE_URL, headers=headers)
            print(f"   Status: {profile_response.status_code}")
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print("   ✅ Dados do perfil:")
                print(json.dumps(profile_data, indent=2, ensure_ascii=False))
            else:
                print("   ❌ Erro ao obter perfil:")
                print(f"   Resposta: {profile_response.text}")
        else:
            print("   ❌ Erro no login:")
            print(f"   Resposta: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Erro: {e}")

if __name__ == "__main__":
    test_profile_endpoint()
