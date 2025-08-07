#!/usr/bin/env python
"""
Script para criar dados fictícios para teste do sistema AgroNexus
"""
import os
import sys
import django
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from agronexus.models import (
    Usuario, Propriedade, Area, Animal, Lote, Manejo, AnimalManejo,
    Pesagem, Vacinacao, Medicamento, Inseminacao, DiagnosticoGestacao,
    Parto, LancamentoFinanceiro, CalendarioSanitario, Vacina,
    HistoricoLoteAnimal, HistoricoOcupacaoArea, AdministracaoMedicamento,
    ContaFinanceira, CategoriaFinanceira, EspecieAnimal, RacaAnimal
)
from django.contrib.auth.models import Group

# Dados fictícios para usar
NOMES_PROPRIEDADES = [
    "Fazenda São João", "Sítio Esperança", "Fazenda Vista Alegre",
    "Rancho do Sul", "Fazenda Primavera", "Estância Bela Vista",
    "Fazenda Três Irmãos", "Sítio Recanto Verde", "Fazenda Ouro Branco",
    "Rancho Santa Fé"
]

RACAS_BOVINOS = [
    "Nelore", "Angus", "Hereford", "Brahman", "Senepol", "Simmental",
    "Charolês", "Limousin", "Gir", "Guzerá", "Tabapuã", "Canchim"
]

NOMES_AREAS = [
    "Piquete 1", "Piquete 2", "Piquete 3", "Pasto Alto", "Pasto Baixo",
    "Curral Principal", "Baia 1", "Baia 2", "Enfermaria", "Apartação",
    "Piquete do Fundo", "Pasto da Sede", "Piquete Novo", "Área de Reserva"
]

TIPOS_FORRAGEM = [
    "Brachiaria Brizantha", "Brachiaria Decumbens", "Panicum Maximum",
    "Cynodon Dactylon", "Andropogon Gayanus", "Stylosanthes Guianensis",
    "Pennisetum Purpureum", "Panicum Coloratum"
]

NOMES_LOTES = [
    "Bezerros 2024", "Novilhas Solteiras", "Vacas Secas", "Vacas Prenhas",
    "Touros", "Novilhos Engorda", "Bezerras Desmamadas", "Animais Doentes",
    "Lote Especial", "Engorda Final"
]

MEDICAMENTOS = [
    "Ivermectina", "Closantel", "Vitamina ADE", "Antibiótico",
    "Anti-inflamatório", "Vermífugo", "Carrapaticida", "Moscacida"
]

VACINAS = [
    "Febre Aftosa", "Raiva", "Brucelose", "Botulismo", "Carbúnculo",
    "Clostridioses", "IBR/BVD", "Leptospirose"
]

def criar_grupos():
    """Cria os grupos de perfis necessários"""
    print("👥 Criando grupos de perfis...")
    
    perfis = ['Proprietário', 'Gerente', 'Funcionário', 'Veterinário']
    grupos_criados = []
    
    for perfil in perfis:
        grupo, created = Group.objects.get_or_create(name=perfil)
        grupos_criados.append(grupo)
        if created:
            print(f"   ✅ Grupo '{perfil}' criado")
        else:
            print(f"   ↪️  Grupo '{perfil}' já existe")
    
    return grupos_criados

def criar_superusuario():
    """Cria o superusuário admin"""
    print("👑 Criando superusuário...")
    
    if not Usuario.objects.filter(username='admin').exists():
        admin = Usuario.objects.create_superuser(
            username='admin',
            email='admin@agronexus.com',
            password='admin123',
            first_name='Administrador',
            last_name='Sistema',
            telefone='(11) 99999-9999',
            cpf='000.000.000-00'
        )
        print("   ✅ Superusuário 'admin' criado")
        return admin
    else:
        admin = Usuario.objects.get(username='admin')
        print("   ↪️  Superusuário 'admin' já existe")
        return admin

def criar_especies_e_racas():
    """Cria espécies e raças de animais"""
    print("🐄 Criando espécies e raças...")
    
    # Criar espécie bovina se não existir
    especie_bovino, created = EspecieAnimal.objects.get_or_create(
        nome='bovino',
        defaults={
            'nome_display': 'Bovino',
            'peso_ua_referencia': 450,
            'periodo_gestacao_dias': 285,
            'idade_primeira_cobertura_meses': 24
        }
    )
    
    # Criar raças bovinas
    racas_bovinas = [
        "Nelore", "Angus", "Hereford", "Brahman", "Senepol", "Simmental",
        "Charolês", "Limousin", "Gir", "Guzerá", "Tabapuã", "Canchim"
    ]
    
    racas_criadas = []
    for nome_raca in racas_bovinas:
        raca, created = RacaAnimal.objects.get_or_create(
            especie=especie_bovino,
            nome=nome_raca,
            defaults={
                'origem': 'Brasil',
                'caracteristicas': f'Raça {nome_raca} com características específicas'
            }
        )
        racas_criadas.append(raca)
        if created:
            print(f"   ✅ Raça {nome_raca} criada")
        else:
            print(f"   ↪️  Raça {nome_raca} já existe")
    
    print(f"✅ Espécie e {len(racas_criadas)} raças processadas")
    return especie_bovino, racas_criadas

def criar_usuarios():
    """Cria usuários fictícios"""
    print("📤 Criando usuários...")
    
    usuarios = []
    
    # Buscar grupos
    grupo_proprietario = Group.objects.get(name='Proprietário')
    grupo_gerente = Group.objects.get(name='Gerente')
    grupo_funcionario = Group.objects.get(name='Funcionário')
    grupo_veterinario = Group.objects.get(name='Veterinário')
    
    # Proprietários
    for i in range(3):
        username = f"proprietario{i+1}"
        if not Usuario.objects.filter(username=username).exists():
            usuario = Usuario.objects.create_user(
                username=username,
                email=f"proprietario{i+1}@fazenda.com",
                password="123456",
                first_name=f"João{i+1}",
                last_name=f"Silva{i+1}",
                telefone=f"(11) 9999-{1000+i:04d}",
                cpf=f"123.456.789-{10+i:02d}",
                data_nascimento=date(1970+i, 1, 15)
            )
            usuario.groups.add(grupo_proprietario)
            usuarios.append(usuario)
        else:
            usuario = Usuario.objects.get(username=username)
            if not usuario.groups.filter(name='Proprietário').exists():
                usuario.groups.add(grupo_proprietario)
            usuarios.append(usuario)
    
    # Gerentes
    for i in range(2):
        username = f"gerente{i+1}"
        if not Usuario.objects.filter(username=username).exists():
            usuario = Usuario.objects.create_user(
                username=username,
                email=f"gerente{i+1}@fazenda.com",
                password="123456",
                first_name=f"Maria{i+1}",
                last_name=f"Santos{i+1}",
                telefone=f"(11) 8888-{1000+i:04d}",
                cpf=f"987.654.321-{10+i:02d}",
                data_nascimento=date(1980+i, 3, 20)
            )
            usuario.groups.add(grupo_gerente)
            usuarios.append(usuario)
        else:
            usuario = Usuario.objects.get(username=username)
            if not usuario.groups.filter(name='Gerente').exists():
                usuario.groups.add(grupo_gerente)
            usuarios.append(usuario)
    
    # Funcionários
    for i in range(5):
        username = f"funcionario{i+1}"
        if not Usuario.objects.filter(username=username).exists():
            usuario = Usuario.objects.create_user(
                username=username,
                email=f"funcionario{i+1}@fazenda.com",
                password="123456",
                first_name=f"Pedro{i+1}",
                last_name=f"Costa{i+1}",
                telefone=f"(11) 7777-{1000+i:04d}",
                cpf=f"456.789.123-{10+i:02d}",
                data_nascimento=date(1985+i, 6, 10)
            )
            usuario.groups.add(grupo_funcionario)
            usuarios.append(usuario)
        else:
            usuario = Usuario.objects.get(username=username)
            if not usuario.groups.filter(name='Funcionário').exists():
                usuario.groups.add(grupo_funcionario)
            usuarios.append(usuario)
    
    # Veterinários
    for i in range(2):
        username = f"veterinario{i+1}"
        if not Usuario.objects.filter(username=username).exists():
            usuario = Usuario.objects.create_user(
                username=username,
                email=f"veterinario{i+1}@fazenda.com",
                password="123456",
                first_name=f"Ana{i+1}",
                last_name=f"Oliveira{i+1}",
                telefone=f"(11) 6666-{1000+i:04d}",
                cpf=f"789.123.456-{10+i:02d}",
                data_nascimento=date(1982+i, 9, 5)
            )
            usuario.groups.add(grupo_veterinario)
            usuarios.append(usuario)
        else:
            usuario = Usuario.objects.get(username=username)
            if not usuario.groups.filter(name='Veterinário').exists():
                usuario.groups.add(grupo_veterinario)
            usuarios.append(usuario)
    
    print(f"✅ {len(usuarios)} usuários processados")
    return usuarios

def criar_propriedades(usuarios):
    """Cria propriedades fictícias"""
    print("🏠 Criando propriedades...")
    
    propriedades = []
    proprietarios = [u for u in usuarios if u.groups.filter(name='Proprietário').exists()]
    
    for i, proprietario in enumerate(proprietarios):
        for j in range(2):  # 2 propriedades por proprietário
            propriedade = Propriedade.objects.create(
                nome=NOMES_PROPRIEDADES[i*2 + j],
                proprietario=proprietario,
                localizacao=f"Estrada Rural {i+1}, Km {j+5}, Cidade Fictícia - SP",
                area_total_ha=Decimal(str(random.randint(100, 2000))),
                coordenadas_gps={
                    "latitude": -23.0 + random.uniform(-2, 2),
                    "longitude": -47.0 + random.uniform(-2, 2)
                },
                inscricao_estadual=f"12345678{i:03d}",
                cnpj_cpf=f"12.345.678/0001-{10+i:02d}"
            )
            propriedades.append(propriedade)
    
    print(f"✅ {len(propriedades)} propriedades criadas")
    return propriedades

def criar_areas(propriedades):
    """Cria áreas/piquetes fictícios"""
    print("🌱 Criando áreas...")
    
    areas = []
    
    for propriedade in propriedades:
        num_areas = random.randint(8, 15)
        area_disponivel = float(propriedade.area_total_ha) * 0.8  # 80% da área total
        
        for i in range(num_areas):
            tamanho = random.uniform(5, area_disponivel/num_areas * 2)
            tipo = random.choice(['piquete', 'baia', 'curral']) if i < 3 else 'piquete'
            
            area = Area.objects.create(
                propriedade=propriedade,
                nome=f"{NOMES_AREAS[i % len(NOMES_AREAS)]}-{i+1:02d}",
                tipo=tipo,
                tamanho_ha=Decimal(str(round(tamanho, 2))),
                tipo_forragem=random.choice(TIPOS_FORRAGEM),
                status=random.choice(['disponivel', 'em_uso', 'descanso']),
                coordenadas_poligono={
                    "pontos": [
                        {"lat": -23.0 + random.uniform(-0.1, 0.1), "lng": -47.0 + random.uniform(-0.1, 0.1)},
                        {"lat": -23.0 + random.uniform(-0.1, 0.1), "lng": -47.0 + random.uniform(-0.1, 0.1)},
                        {"lat": -23.0 + random.uniform(-0.1, 0.1), "lng": -47.0 + random.uniform(-0.1, 0.1)},
                        {"lat": -23.0 + random.uniform(-0.1, 0.1), "lng": -47.0 + random.uniform(-0.1, 0.1)},
                    ]
                },
                observacoes=f"Área com forragem em boas condições" if i % 3 == 0 else ""
            )
            areas.append(area)
    
    print(f"✅ {len(areas)} áreas criadas")
    return areas

def criar_lotes(propriedades, areas):
    """Cria lotes fictícios"""
    print("🐄 Criando lotes...")
    
    lotes = []
    
    for propriedade in propriedades:
        areas_propriedade = [a for a in areas if a.propriedade == propriedade]
        num_lotes = random.randint(4, 8)
        
        for i in range(num_lotes):
            area_atual = random.choice(areas_propriedade) if areas_propriedade else None
            
            lote = Lote.objects.create(
                propriedade=propriedade,
                nome=f"{NOMES_LOTES[i % len(NOMES_LOTES)]}-{i+1:02d}",
                descricao=f"Lote de {NOMES_LOTES[i % len(NOMES_LOTES)].lower()}",
                criterio_agrupamento=f"Agrupamento por {random.choice(['idade', 'peso', 'categoria', 'estado reprodutivo'])}",
                area_atual=area_atual,
                ativo=True
            )
            lotes.append(lote)
    
    print(f"✅ {len(lotes)} lotes criados")
    return lotes

def criar_animais(propriedades, lotes, especie_bovino, racas_bovinas):
    """Cria animais fictícios"""
    print("🐂 Criando animais...")
    
    animais = []
    
    for propriedade in propriedades:
        lotes_propriedade = [l for l in lotes if l.propriedade == propriedade]
        num_animais = random.randint(80, 200)
        
        for i in range(num_animais):
            sexo = random.choice(['M', 'F'])
            idade_dias = random.randint(90, 3650)  # 3 meses a 10 anos
            data_nascimento = date.today() - timedelta(days=idade_dias)
            
            # Determinar categoria baseada na idade e sexo
            if idade_dias < 365:  # Menos de 1 ano
                categoria = 'bezerro' if sexo == 'M' else 'bezerra'
            elif idade_dias < 730:  # 1-2 anos
                categoria = 'novilho' if sexo == 'M' else 'novilha'
            else:  # Mais de 2 anos
                categoria = 'touro' if sexo == 'M' else 'vaca'
            
            animal = Animal.objects.create(
                propriedade=propriedade,
                especie=especie_bovino,
                identificacao_unica=f"{propriedade.nome[:3].upper()}{i+1:04d}-{random.randint(1000, 9999)}",
                nome_registro=f"Animal {i+1}" if i % 5 == 0 else "",
                sexo=sexo,
                data_nascimento=data_nascimento,
                raca=random.choice(racas_bovinas),
                categoria=categoria,
                status='ativo',
                data_compra=data_nascimento + timedelta(days=random.randint(0, 30)) if random.random() < 0.3 else None,
                valor_compra=Decimal(str(random.randint(800, 3000))) if random.random() < 0.3 else None,
                origem=f"Fazenda {random.choice(['A', 'B', 'C'])}" if random.random() < 0.3 else "",
                lote_atual=random.choice(lotes_propriedade) if lotes_propriedade else None,
                observacoes=f"Animal de boa qualidade genética" if i % 10 == 0 else ""
            )
            animais.append(animal)
    
    print(f"✅ {len(animais)} animais criados")
    return animais

def criar_pesagens(animais, usuarios):
    """Cria pesagens fictícias"""
    print("⚖️ Criando pesagens...")
    
    pesagens = []
    funcionarios = [u for u in usuarios if u.groups.filter(name__in=['Funcionário', 'Gerente']).exists()]
    
    for animal in animais:
        # Criar 2-3 pesagens para cada animal
        num_pesagens = random.randint(2, 3)
        peso_inicial = random.randint(150, 300)  # Peso inicial baseado na categoria
        
        for i in range(num_pesagens):
            data_pesagem = animal.data_nascimento + timedelta(days=random.randint(30, 365*2))
            if data_pesagem > date.today():
                continue
                
            # Simular crescimento do animal
            peso_atual = peso_inicial + (i * random.randint(20, 50))
            
            # Criar primeiro o manejo de pesagem
            manejo = Manejo.objects.create(
                propriedade=animal.propriedade,
                tipo='pesagem',
                data_manejo=data_pesagem,
                custo_material=Decimal('0'),
                custo_pessoal=Decimal('50'),
                observacoes=f"Pesagem de rotina do animal {animal.identificacao_unica}",
                usuario=random.choice(funcionarios) if funcionarios else None
            )
            
            # Criar a pesagem
            pesagem = Pesagem.objects.create(
                animal=animal,
                manejo=manejo,
                data_pesagem=data_pesagem,
                peso_kg=Decimal(str(peso_atual)),
                equipamento_usado=random.choice(['Balança Digital', 'Balança Mecânica', 'Fita Torácica']),
                observacoes=f"Pesagem de rotina"
            )
            
            # Associar o animal ao manejo
            AnimalManejo.objects.create(
                animal=animal,
                manejo=manejo,
                observacoes_especificas=f"Pesagem: {peso_atual}kg"
            )
            
            pesagens.append(pesagem)
    
    print(f"✅ {len(pesagens)} pesagens criadas")
    return pesagens

def criar_manejos(animais, lotes, usuarios):
    """Cria manejos fictícios"""
    print("🏥 Criando manejos...")
    
    manejos = []
    funcionarios = [u for u in usuarios if u.groups.filter(name__in=['Funcionário', 'Gerente', 'Veterinário']).exists()]
    
    # Criar manejos variados
    for _ in range(100):  # 100 manejos aleatórios
        tipo = random.choice(['vacinacao', 'medicamento', 'pesagem', 'outro'])
        data_manejo = date.today() - timedelta(days=random.randint(0, 365))
        
        # Selecionar animais aleatórios
        animais_manejo = random.sample(animais, random.randint(1, min(20, len(animais))))
        lote = random.choice(lotes)
        
        manejo = Manejo.objects.create(
            propriedade=lote.propriedade,
            tipo=tipo,
            data_manejo=data_manejo,
            lote=lote,
            custo_material=Decimal(str(random.randint(50, 500))),
            custo_pessoal=Decimal(str(random.randint(100, 300))),
            observacoes=f"Manejo de {tipo} realizado",
            usuario=random.choice(funcionarios) if funcionarios else None
        )
        
        # Adicionar animais ao manejo
        for animal in animais_manejo:
            AnimalManejo.objects.create(
                animal=animal,
                manejo=manejo,
                observacoes_especificas=f"Aplicado em {animal.identificacao_unica}"
            )
        
        manejos.append(manejo)
    
    print(f"✅ {len(manejos)} manejos criados")
    return manejos

def criar_vacinacoes(animais, usuarios):
    """Cria vacinações fictícias"""
    print("💉 Criando vacinações...")
    
    # Primeiro criar as vacinas
    vacinas = []
    
    for nome_vacina in VACINAS:
        if not Vacina.objects.filter(nome=nome_vacina).exists():
            vacina = Vacina.objects.create(
                nome=nome_vacina,
                fabricante=random.choice(['Zoetis', 'Boehringer', 'MSD', 'Ourofino']),
                doencas_previne=f"Prevenção de {nome_vacina}",
                dose_ml=Decimal(str(random.uniform(2.0, 5.0))),
                via_aplicacao=random.choice(['Subcutânea', 'Intramuscular']),
                intervalo_doses_dias=random.randint(21, 30),
                periodo_carencia_dias=random.randint(0, 30),
                ativa=True
            )
            vacinas.append(vacina)
        else:
            vacina = Vacina.objects.get(nome=nome_vacina)
            vacinas.append(vacina)
    
    vacinacoes = []
    veterinarios = [u for u in usuarios if u.groups.filter(name__in=['Veterinário', 'Funcionário']).exists()]
    
    for _ in range(50):  # 50 vacinações
        animais_vacinacao = random.sample(animais, random.randint(5, 30))
        propriedade = animais_vacinacao[0].propriedade
        
        # Selecionar uma vacina aleatória
        vacina = random.choice(vacinas)
        
        # Criar o manejo de vacinação
        manejo = Manejo.objects.create(
            propriedade=propriedade,
            tipo='vacinacao',
            data_manejo=date.today() - timedelta(days=random.randint(0, 365)),
            custo_material=Decimal(str(random.randint(100, 500))),
            custo_pessoal=Decimal(str(random.randint(50, 200))),
            observacoes=f"Vacinação preventiva com {vacina.nome}",
            usuario=random.choice(veterinarios) if veterinarios else None
        )
        
        # Criar a vacinação
        vacinacao = Vacinacao.objects.create(
            manejo=manejo,
            vacina=vacina,
            dose_aplicada=vacina.dose_ml,
            lote_vacina=f"LOTE{random.randint(1000, 9999)}",
            data_vencimento=date.today() + timedelta(days=random.randint(180, 365)),
            data_proxima_dose=manejo.data_manejo + timedelta(days=vacina.intervalo_doses_dias or 30),
            observacoes=f"Vacinação aplicada em {len(animais_vacinacao)} animais"
        )
        
        # Associar animais
        for animal in animais_vacinacao:
            AnimalManejo.objects.create(
                animal=animal,
                manejo=manejo,
                observacoes_especificas=f"Vacinado contra {vacina.nome}"
            )
        
        vacinacoes.append(vacinacao)
    
    print(f"✅ {len(vacinacoes)} vacinações criadas")
    return vacinacoes

def criar_lancamentos_financeiros(propriedades, usuarios):
    """Cria lançamentos financeiros fictícios"""
    print("💰 Criando lançamentos financeiros...")
    
    lancamentos = []
    
    # Primeiro criar algumas contas financeiras
    contas = []
    for propriedade in propriedades:
        conta_principal = ContaFinanceira.objects.create(
            propriedade=propriedade,
            nome="Conta Principal",
            tipo="corrente",
            saldo_inicial=Decimal(str(random.randint(10000, 100000))),
            ativa=True
        )
        contas.append(conta_principal)
    
    # Criar algumas categorias financeiras
    categorias = []
    for propriedade in propriedades:
        for cat_nome in ['Venda de Animais', 'Medicamentos', 'Ração', 'Combustível', 'Mão de Obra']:
            categoria = CategoriaFinanceira.objects.create(
                propriedade=propriedade,
                nome=cat_nome,
                tipo='entrada' if cat_nome == 'Venda de Animais' else 'saida'
            )
            categorias.append(categoria)
    
    # Criar lançamentos
    for propriedade in propriedades:
        contas_propriedade = [c for c in contas if c.propriedade == propriedade]
        categorias_propriedade = [c for c in categorias if c.propriedade == propriedade]
        
        if not contas_propriedade:
            continue
            
        conta_principal = contas_propriedade[0]
        
        # Entradas
        for _ in range(random.randint(10, 25)):
            categoria = random.choice([c for c in categorias_propriedade if c.tipo == 'entrada'])
            lancamento = LancamentoFinanceiro.objects.create(
                propriedade=propriedade,
                data_lancamento=date.today() - timedelta(days=random.randint(0, 365)),
                tipo='entrada',
                valor=Decimal(str(random.randint(1000, 50000))),
                descricao=f"Receita de {categoria.nome.lower()}",
                categoria=categoria,
                conta_origem=conta_principal,
                observacoes="Lançamento de teste"
            )
            lancamentos.append(lancamento)
        
        # Saídas
        for _ in range(random.randint(15, 30)):
            categoria = random.choice([c for c in categorias_propriedade if c.tipo == 'saida'])
            lancamento = LancamentoFinanceiro.objects.create(
                propriedade=propriedade,
                data_lancamento=date.today() - timedelta(days=random.randint(0, 365)),
                tipo='saida',
                valor=Decimal(str(random.randint(100, 10000))),
                descricao=f"Despesa com {categoria.nome.lower()}",
                categoria=categoria,
                conta_origem=conta_principal,
                observacoes="Lançamento de teste"
            )
            lancamentos.append(lancamento)
    
    print(f"✅ {len(lancamentos)} lançamentos financeiros criados")
    return lancamentos

@transaction.atomic
def main():
    """Função principal para criar todos os dados"""
    print("🚀 Iniciando criação de dados de teste para AgroNexus...")
    print("=" * 60)
    
    # Verificar se já existem dados
    if Usuario.objects.filter(groups__name='Proprietário').exists():
        resposta = input("⚠️  Já existem dados no sistema. Continuar? (s/N): ")
        if resposta.lower() != 's':
            print("❌ Operação cancelada")
            return
    
    try:
        # Criar dados em ordem de dependência
        admin = criar_superusuario()
        grupos = criar_grupos()
        especie_bovino, racas_bovinas = criar_especies_e_racas()
        usuarios = criar_usuarios()
        propriedades = criar_propriedades(usuarios)
        areas = criar_areas(propriedades)
        lotes = criar_lotes(propriedades, areas)
        animais = criar_animais(propriedades, lotes, especie_bovino, racas_bovinas)
        pesagens = criar_pesagens(animais, usuarios)
        manejos = criar_manejos(animais, lotes, usuarios)
        vacinacoes = criar_vacinacoes(animais, usuarios)
        lancamentos = criar_lancamentos_financeiros(propriedades, usuarios)
        
        print("=" * 60)
        print("✅ DADOS CRIADOS COM SUCESSO!")
        print("=" * 60)
        print(f"� Superusuário: 1 (admin)")
        print(f"�👥 Usuários: {len(usuarios)}")
        print(f"🏠 Propriedades: {len(propriedades)}")
        print(f"🌱 Áreas: {len(areas)}")
        print(f"🐄 Lotes: {len(lotes)}")
        print(f"🐂 Animais: {len(animais)}")
        print(f"⚖️  Pesagens: {len(pesagens)}")
        print(f"🏥 Manejos: {len(manejos)}")
        print(f"💉 Vacinações: {len(vacinacoes)}")
        print(f"💰 Lançamentos Financeiros: {len(lancamentos)}")
        print("=" * 60)
        print("🔑 CREDENCIAIS DE ACESSO:")
        print("Admin: admin / admin123")
        print("Proprietários: proprietario1, proprietario2, proprietario3 / 123456")
        print("Gerentes: gerente1, gerente2 / 123456")
        print("Funcionários: funcionario1 a funcionario5 / 123456")
        print("Veterinários: veterinario1, veterinario2 / 123456")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erro ao criar dados: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
