#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
AgroNexus - Sistema 
Script para gerar dados de teste
"""

from agronexus.models import *
import os
import random
import sys
from datetime import date, datetime, timedelta
from decimal import Decimal

import django
from faker import Faker

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()


# Configurar Faker para português
fake = Faker('pt_BR')

print("🎲 Gerando dados de teste para AgroNexus...")

# Limpar dados existentes (cuidado!)


def limpar_dados():
    confirm = input("⚠️  Deseja limpar todos os dados existentes? (s/N): ")
    if confirm.lower() == 's':
        print("🗑️  Limpando dados existentes...")
        Animal.objects.all().delete()
        Lote.objects.all().delete()
        Area.objects.all().delete()
        Propriedade.objects.all().delete()
        print("✅ Dados limpos!")

# Criar usuários de teste


def criar_usuarios():
    print("👥 Criando usuários de teste...")

    # Usuários já existem, vamos criar alguns adicionais
    usuarios = [
        {
            'username': 'gerente1',
            'email': 'gerente1@agronexus.com',
            'password': 'senha123',
            'first_name': 'João',
            'last_name': 'Silva',
            'perfil': 'gerente'
        },
        {
            'username': 'funcionario1',
            'email': 'funcionario1@agronexus.com',
            'password': 'senha123',
            'first_name': 'Maria',
            'last_name': 'Santos',
            'perfil': 'funcionario'
        },
        {
            'username': 'veterinario1',
            'email': 'veterinario1@agronexus.com',
            'password': 'senha123',
            'first_name': 'Dr. Carlos',
            'last_name': 'Oliveira',
            'perfil': 'veterinario'
        }
    ]

    for user_data in usuarios:
        if not Usuario.objects.filter(username=user_data['username']).exists():
            usuario = Usuario.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                perfil=user_data['perfil']
            )
            print(f"✅ Usuário criado: {usuario.username}")

# Criar propriedades


def criar_propriedades():
    print("🏠 Criando propriedades de teste...")

    proprietario = Usuario.objects.filter(is_superuser=True).first()

    propriedades = [
        {
            'nome': 'Fazenda Santa Maria',
            'localizacao': 'Zona Rural, Uberaba/MG',
            'area_total_ha': Decimal('2500.00'),
            'inscricao_estadual': '123456789',
            'cnpj_cpf': '12.345.678/0001-90'
        },
        {
            'nome': 'Sítio São João',
            'localizacao': 'Distrito de Peirópolis, Uberaba/MG',
            'area_total_ha': Decimal('850.50'),
            'inscricao_estadual': '987654321',
            'cnpj_cpf': '98.765.432/0001-10'
        }
    ]

    propriedades_criadas = []
    for prop_data in propriedades:
        propriedade = Propriedade.objects.create(
            proprietario=proprietario,
            **prop_data
        )
        propriedades_criadas.append(propriedade)
        print(f"✅ Propriedade criada: {propriedade.nome}")

    return propriedades_criadas

# Criar áreas


def criar_areas(propriedades):
    print("🌱 Criando áreas/piquetes...")

    areas_criadas = []
    for propriedade in propriedades:
        # Criar áreas para cada propriedade
        areas = [
            {'nome': 'Piquete A1', 'tipo': 'piquete', 'tamanho_ha': Decimal(
                '50.00'), 'tipo_forragem': 'Brachiaria brizantha'},
            {'nome': 'Piquete A2', 'tipo': 'piquete', 'tamanho_ha': Decimal(
                '45.50'), 'tipo_forragem': 'Brachiaria decumbens'},
            {'nome': 'Piquete B1', 'tipo': 'piquete', 'tamanho_ha': Decimal(
                '60.00'), 'tipo_forragem': 'Panicum maximum'},
            {'nome': 'Piquete B2', 'tipo': 'piquete', 'tamanho_ha': Decimal(
                '55.25'), 'tipo_forragem': 'Cynodon dactylon'},
            {'nome': 'Curral Central', 'tipo': 'curral',
                'tamanho_ha': Decimal('2.00'), 'tipo_forragem': ''},
            {'nome': 'Baia Maternidade', 'tipo': 'baia',
                'tamanho_ha': Decimal('1.50'), 'tipo_forragem': ''},
            {'nome': 'Apartação', 'tipo': 'apartacao',
                'tamanho_ha': Decimal('3.00'), 'tipo_forragem': ''},
            {'nome': 'Enfermaria', 'tipo': 'enfermaria',
                'tamanho_ha': Decimal('1.00'), 'tipo_forragem': ''},
        ]

        for area_data in areas:
            area = Area.objects.create(
                propriedade=propriedade,
                **area_data
            )
            areas_criadas.append(area)
            print(f"✅ Área criada: {area.nome} - {propriedade.nome}")

    return areas_criadas

# Criar lotes


def criar_lotes(propriedades, areas):
    print("🐄 Criando lotes de animais...")

    lotes_criados = []
    for propriedade in propriedades:
        lotes = [
            {
                'nome': 'Lote Vacas Lactantes',
                'descricao': 'Vacas em período de lactação',
                'criterio_agrupamento': 'Vacas com bezerros ao pé',
                'area_atual': random.choice([a for a in areas if a.propriedade == propriedade and a.tipo == 'piquete'])
            },
            {
                'nome': 'Lote Novilhas',
                'descricao': 'Novilhas de 18 a 24 meses',
                'criterio_agrupamento': 'Fêmeas jovens para reprodução',
                'area_atual': random.choice([a for a in areas if a.propriedade == propriedade and a.tipo == 'piquete'])
            },
            {
                'nome': 'Lote Bezerros',
                'descricao': 'Bezerros desmamados',
                'criterio_agrupamento': 'Machos até 12 meses',
                'area_atual': random.choice([a for a in areas if a.propriedade == propriedade and a.tipo == 'piquete'])
            }
        ]

        for lote_data in lotes:
            lote = Lote.objects.create(
                propriedade=propriedade,
                **lote_data
            )
            lotes_criados.append(lote)
            print(f"✅ Lote criado: {lote.nome} - {propriedade.nome}")

    return lotes_criados

# Criar animais


def criar_animais(propriedades, lotes):
    print("🐄 Criando animais...")

    racas = ['Nelore', 'Brahman', 'Gir', 'Guzerá',
             'Tabapuã', 'Angus', 'Hereford', 'Senepol']
    animais_criados = []

    for propriedade in propriedades:
        lotes_propriedade = [l for l in lotes if l.propriedade == propriedade]

        # Criar animais para cada lote
        for lote in lotes_propriedade:
            qtd_animais = random.randint(15, 30)

            for i in range(qtd_animais):
                # Determinar sexo baseado no lote
                if 'Vacas' in lote.nome or 'Novilhas' in lote.nome:
                    sexo = 'F'
                    if 'Vacas' in lote.nome:
                        categoria = 'vaca'
                    else:
                        categoria = 'novilha'
                else:
                    sexo = 'M'
                    categoria = 'bezerro' if 'Bezerros' in lote.nome else 'novilho'

                animal = Animal.objects.create(
                    propriedade=propriedade,
                    identificacao_unica=f"{propriedade.nome[:3].upper()}{random.randint(1000, 9999)}",
                    nome_registro=fake.first_name() if random.choice(
                        [True, False]) else '',
                    sexo=sexo,
                    data_nascimento=fake.date_between(
                        start_date='-5y', end_date='-6m'),
                    raca=random.choice(racas),
                    categoria=categoria,
                    lote_atual=lote
                )
                animais_criados.append(animal)

        print(
            f"✅ {len([a for a in animais_criados if a.propriedade == propriedade])} animais criados para {propriedade.nome}")

    return animais_criados

# Criar pesagens


def criar_pesagens(animais):
    print("⚖️  Criando pesagens...")

    for animal in animais:
        # Criar várias pesagens para cada animal
        num_pesagens = random.randint(3, 8)
        data_inicial = animal.data_nascimento + \
            timedelta(days=180)  # Primeira pesagem aos 6 meses

        peso_inicial = random.randint(
            80, 120) if animal.sexo == 'M' else random.randint(70, 100)

        for i in range(num_pesagens):
            data_pesagem = data_inicial + \
                timedelta(days=i * 60)  # Pesagem a cada 2 meses

            if data_pesagem > date.today():
                break

            # Simular ganho de peso
            peso_atual = peso_inicial + (i * random.randint(15, 35))

            # Criar manejo de pesagem
            manejo = Manejo.objects.create(
                propriedade=animal.propriedade,
                tipo='pesagem',
                data_manejo=data_pesagem,
                observacoes=f'Pesagem de rotina - {animal.identificacao_unica}'
            )

            # Adicionar animal ao manejo
            manejo.animais.add(animal)

            # Criar registro de pesagem
            pesagem = Pesagem.objects.create(
                animal=animal,
                manejo=manejo,
                peso_kg=Decimal(str(peso_atual)),
                data_pesagem=data_pesagem,
                equipamento_usado='Balança eletrônica'
            )

    print(f"✅ Pesagens criadas para {len(animais)} animais")

# Criar vacinas


def criar_vacinas():
    print("💉 Criando vacinas...")

    vacinas_data = [
        {
            'nome': 'Vacina Febre Aftosa',
            'fabricante': 'Laboratório Veterinário A',
            'doencas_previne': 'Febre Aftosa',
            'dose_ml': Decimal('3.0'),
            'via_aplicacao': 'Subcutânea',
            'intervalo_doses_dias': 180,
            'periodo_carencia_dias': 0
        },
        {
            'nome': 'Vacina Brucelose',
            'fabricante': 'Laboratório Veterinário B',
            'doencas_previne': 'Brucelose',
            'dose_ml': Decimal('2.0'),
            'via_aplicacao': 'Subcutânea',
            'intervalo_doses_dias': None,
            'periodo_carencia_dias': 60
        },
        {
            'nome': 'Vacina Raiva',
            'fabricante': 'Laboratório Veterinário C',
            'doencas_previne': 'Raiva',
            'dose_ml': Decimal('2.0'),
            'via_aplicacao': 'Intramuscular',
            'intervalo_doses_dias': 365,
            'periodo_carencia_dias': 21
        }
    ]

    vacinas_criadas = []
    for vacina_data in vacinas_data:
        vacina = Vacina.objects.create(**vacina_data)
        vacinas_criadas.append(vacina)
        print(f"✅ Vacina criada: {vacina.nome}")

    return vacinas_criadas

# Função principal


def gerar_dados_teste():
    print("🚀 Iniciando geração de dados de teste...")

    # Perguntar se deve limpar dados
    limpar_dados()

    # Criar dados
    criar_usuarios()
    propriedades = criar_propriedades()
    areas = criar_areas(propriedades)
    lotes = criar_lotes(propriedades, areas)
    animais = criar_animais(propriedades, lotes)
    criar_pesagens(animais)
    vacinas = criar_vacinas()

    print("\n✅ Dados de teste gerados com sucesso!")
    print(f"📊 Resumo:")
    print(f"   - {len(propriedades)} propriedades")
    print(f"   - {len(areas)} áreas")
    print(f"   - {len(lotes)} lotes")
    print(f"   - {len(animais)} animais")
    print(f"   - {Pesagem.objects.count()} pesagens")
    print(f"   - {len(vacinas)} vacinas")


if __name__ == "__main__":
    gerar_dados_teste()
