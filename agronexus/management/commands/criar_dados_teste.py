"""
Comando Django para criar dados fictícios para teste do sistema AgroNexus
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from agronexus.models import (Animal, AnimalManejo, Area, CategoriaFinanceira,
                              ContaFinanceira, LancamentoFinanceiro, Lote,
                              Manejo, Pesagem, Propriedade, Usuario, Vacina,
                              Vacinacao)


class Command(BaseCommand):
    help = 'Cria dados fictícios para teste do sistema AgroNexus'

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

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força a criação mesmo se já existirem dados',
        )
        parser.add_argument(
            '--usuarios',
            type=int,
            default=3,
            help='Número de usuários proprietários a criar (padrão: 3)',
        )
        parser.add_argument(
            '--animais',
            type=int,
            default=None,
            help='Número máximo de animais por propriedade (padrão: 80-200)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            "🚀 Iniciando criação de dados de teste para AgroNexus..."
        )
        self.stdout.write("=" * 60)

        # Verificar se já existem dados
        proprietarios = Usuario.objects.filter(groups__name='Proprietário')
        if proprietarios.exists() and not options['force']:
            self.stdout.write(
                self.style.WARNING(
                    "⚠️  Já existem dados no sistema. "
                    "Use --force para continuar"
                )
            )
            return

        try:
            with transaction.atomic():
                # Criar dados em ordem de dependência
                usuarios = self.criar_usuarios(options)
                propriedades = self.criar_propriedades(usuarios)
                areas = self.criar_areas(propriedades)
                lotes = self.criar_lotes(propriedades, areas)
                animais = self.criar_animais(propriedades, lotes, options)
                pesagens = self.criar_pesagens(animais, usuarios)
                manejos = self.criar_manejos(animais, lotes, usuarios)
                vacinacoes = self.criar_vacinacoes(animais, usuarios)
                lancamentos = self.criar_lancamentos_financeiros(
                    propriedades, usuarios
                )

                self.stdout.write("=" * 60)
                self.stdout.write(
                    self.style.SUCCESS("✅ DADOS CRIADOS COM SUCESSO!")
                )
                self.stdout.write("=" * 60)
                self.stdout.write(f"👥 Usuários: {len(usuarios)}")
                self.stdout.write(f"🏠 Propriedades: {len(propriedades)}")
                self.stdout.write(f"🌱 Áreas: {len(areas)}")
                self.stdout.write(f"🐄 Lotes: {len(lotes)}")
                self.stdout.write(f"🐂 Animais: {len(animais)}")
                self.stdout.write(f"⚖️  Pesagens: {len(pesagens)}")
                self.stdout.write(f"🏥 Manejos: {len(manejos)}")
                self.stdout.write(f"💉 Vacinações: {len(vacinacoes)}")
                self.stdout.write(
                    f"💰 Lançamentos Financeiros: {len(lancamentos)}"
                )
                self.stdout.write("=" * 60)
                self.stdout.write("🔑 CREDENCIAIS DE ACESSO:")
                self.stdout.write("Admin: admin / admin123")
                self.stdout.write(
                    "Proprietários: proprietario1, proprietario2, "
                    "proprietario3 / 123456"
                )
                self.stdout.write("Gerentes: gerente1, gerente2 / 123456")
                self.stdout.write(
                    "Funcionários: funcionario1 a funcionario5 / 123456"
                )
                self.stdout.write(
                    "Veterinários: veterinario1, veterinario2 / 123456"
                )
                self.stdout.write("=" * 60)

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erro ao criar dados: {str(e)}")
            )
            import traceback
            traceback.print_exc()

    def criar_usuarios(self, options):
        """Cria usuários fictícios"""
        self.stdout.write("📤 Criando usuários...")

        # Certificar que os grupos existem
        grupos_necessarios = [
            'Proprietário', 'Gerente', 'Funcionário', 'Veterinário'
        ]
        for nome_grupo in grupos_necessarios:
            Group.objects.get_or_create(name=nome_grupo)

        usuarios = []

        # Criar super usuário admin
        if not Usuario.objects.filter(username='admin').exists():
            admin = Usuario.objects.create_user(
                username='admin',
                email='admin@agronexus.com',
                password='admin123',
                first_name='Administrador',
                last_name='Sistema',
                is_staff=True,
                is_superuser=True,
                telefone='(11) 0000-0000',
                cpf='000.000.000-00',
                data_nascimento=date(1980, 1, 1)
            )
            usuarios.append(admin)
            self.stdout.write("✅ Super usuário 'admin' criado")
        else:
            admin = Usuario.objects.get(username='admin')
            usuarios.append(admin)
            self.stdout.write("✅ Super usuário 'admin' já existe")

        num_proprietarios = options.get('usuarios', 3)

        # Proprietários
        grupo_proprietario = Group.objects.get(name='Proprietário')
        for i in range(num_proprietarios):
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
                usuarios.append(usuario)

        # Gerentes
        grupo_gerente = Group.objects.get(name='Gerente')
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
                usuarios.append(usuario)

        # Funcionários
        grupo_funcionario = Group.objects.get(name='Funcionário')
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
                usuarios.append(usuario)

        # Veterinários
        grupo_veterinario = Group.objects.get(name='Veterinário')
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
                usuarios.append(usuario)

        self.stdout.write(f"✅ {len(usuarios)} usuários processados")
        return usuarios

    def criar_propriedades(self, usuarios):
        """Cria propriedades fictícias"""
        self.stdout.write("🏠 Criando propriedades...")

        propriedades = []
        proprietarios = [
            u for u in usuarios
            if u.groups.filter(name='Proprietário').exists()
        ]

        for i, proprietario in enumerate(proprietarios):
            for j in range(2):  # 2 propriedades por proprietário
                propriedade = Propriedade.objects.create(
                    nome=self.NOMES_PROPRIEDADES[i*2 + j],
                    proprietario=proprietario,
                    localizacao=(
                        f"Estrada Rural {i+1}, Km {j+5}, "
                        f"Cidade Fictícia - SP"
                    ),
                    area_total_ha=Decimal(str(random.randint(100, 2000))),
                    coordenadas_gps={
                        "latitude": -23.0 + random.uniform(-2, 2),
                        "longitude": -47.0 + random.uniform(-2, 2)
                    },
                    inscricao_estadual=f"12345678{i:03d}",
                    cnpj_cpf=f"12.345.678/0001-{10+i:02d}"
                )
                propriedades.append(propriedade)

        self.stdout.write(f"✅ {len(propriedades)} propriedades criadas")
        return propriedades

    def criar_areas(self, propriedades):
        """Cria áreas/piquetes fictícios"""
        self.stdout.write("🌱 Criando áreas...")

        areas = []

        for propriedade in propriedades:
            num_areas = random.randint(8, 15)
            # 80% da área total
            area_disponivel = float(propriedade.area_total_ha) * 0.8

            for i in range(num_areas):
                tamanho = random.uniform(5, area_disponivel/num_areas * 2)
                if i < 3:
                    tipo = random.choice(['piquete', 'baia', 'curral'])
                else:
                    tipo = 'piquete'

                area = Area.objects.create(
                    propriedade=propriedade,
                    nome=(
                        f"{self.NOMES_AREAS[i % len(self.NOMES_AREAS)]}"
                        f"-{i+1:02d}"
                    ),
                    tipo=tipo,
                    tamanho_ha=Decimal(str(round(tamanho, 2))),
                    tipo_forragem=random.choice(self.TIPOS_FORRAGEM),
                    status=random.choice(['disponivel', 'em_uso', 'descanso']),
                    coordenadas_poligono={
                        "pontos": [
                            {
                                "lat": -23.0 + random.uniform(-0.1, 0.1),
                                "lng": -47.0 + random.uniform(-0.1, 0.1)
                            },
                            {
                                "lat": -23.0 + random.uniform(-0.1, 0.1),
                                "lng": -47.0 + random.uniform(-0.1, 0.1)
                            },
                            {
                                "lat": -23.0 + random.uniform(-0.1, 0.1),
                                "lng": -47.0 + random.uniform(-0.1, 0.1)
                            },
                            {
                                "lat": -23.0 + random.uniform(-0.1, 0.1),
                                "lng": -47.0 + random.uniform(-0.1, 0.1)
                            },
                        ]
                    },
                    observacoes=(
                        "Área com forragem em boas condições" if i % 3 == 0
                        else ""
                    )
                )
                areas.append(area)

        self.stdout.write(f"✅ {len(areas)} áreas criadas")
        return areas

    def criar_lotes(self, propriedades, areas):
        """Cria lotes fictícios"""
        self.stdout.write("🐄 Criando lotes...")

        lotes = []

        for propriedade in propriedades:
            areas_propriedade = [
                a for a in areas if a.propriedade == propriedade
            ]
            num_lotes = random.randint(4, 8)

            for i in range(num_lotes):
                if areas_propriedade:
                    area_atual = random.choice(areas_propriedade)
                else:
                    area_atual = None

                lote = Lote.objects.create(
                    propriedade=propriedade,
                    nome=(
                        f"{self.NOMES_LOTES[i % len(self.NOMES_LOTES)]}"
                        f"-{i+1:02d}"
                    ),
                    descricao=(
                        f"Lote de "
                        f"{self.NOMES_LOTES[i % len(self.NOMES_LOTES)].lower()}"
                    ),
                    criterio_agrupamento=(
                        f"Agrupamento por "
                        f"{random.choice(['idade', 'peso', 'categoria'])}"
                    ),
                    area_atual=area_atual,
                    ativo=True
                )
                lotes.append(lote)

        self.stdout.write(f"✅ {len(lotes)} lotes criados")
        return lotes

    def criar_animais(self, propriedades, lotes, options):
        """Cria animais fictícios"""
        from agronexus.models import EspecieAnimal, RacaAnimal
        self.stdout.write("🐂 Criando animais...")

        animais = []
        max_animais = options.get('animais', None)

        # Buscar a espécie bovino
        try:
            especie_bovina = EspecieAnimal.objects.get(nome='bovino')
        except EspecieAnimal.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                "❌ Espécie 'bovino' não encontrada!"))
            return []

        racas_bovinos = list(RacaAnimal.objects.filter(
            especie=especie_bovina, nome__in=self.RACAS_BOVINOS))
        if not racas_bovinos:
            self.stdout.write(self.style.ERROR(
                "❌ Nenhuma raça bovina encontrada!"))
            return []

        for propriedade in propriedades:
            lotes_propriedade = [
                lote for lote in lotes if lote.propriedade == propriedade
            ]
            if max_animais:
                num_animais = max_animais
            else:
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

                # Dados opcionais condicionais
                if random.random() < 0.3:
                    data_compra = (
                        data_nascimento +
                        timedelta(days=random.randint(0, 30))
                    )
                    valor_compra = Decimal(str(random.randint(800, 3000)))
                    origem = f"Fazenda {random.choice(['A', 'B', 'C'])}"
                else:
                    data_compra = None
                    valor_compra = None
                    origem = ""

                raca = random.choice(racas_bovinos)

                animal = Animal.objects.create(
                    propriedade=propriedade,
                    especie=especie_bovina,
                    identificacao_unica=(
                        f"{propriedade.nome[:3].upper()}{i+1:04d}-"
                        f"{random.randint(1000, 9999)}"
                    ),
                    nome_registro=f"Animal {i+1}" if i % 5 == 0 else "",
                    sexo=sexo,
                    data_nascimento=data_nascimento,
                    raca=raca,
                    categoria=categoria,
                    status='ativo',
                    data_compra=data_compra,
                    valor_compra=valor_compra,
                    origem=origem,
                    lote_atual=(
                        random.choice(lotes_propriedade)
                        if lotes_propriedade else None
                    ),
                    observacoes=(
                        "Animal de boa qualidade genética" if i % 10 == 0
                        else ""
                    )
                )
                animais.append(animal)

        self.stdout.write(f"✅ {len(animais)} animais criados")
        return animais

    def criar_pesagens(self, animais, usuarios):
        """Cria pesagens fictícias"""
        self.stdout.write("⚖️ Criando pesagens...")

        pesagens = []
        funcionarios = [
            u for u in usuarios
            if u.groups.filter(name__in=['Funcionário', 'Gerente']).exists()
        ]

        for animal in animais:
            # Criar 2-3 pesagens para cada animal
            num_pesagens = random.randint(2, 3)
            # Peso inicial baseado na categoria
            peso_inicial = random.randint(150, 300)

            for i in range(num_pesagens):
                data_pesagem = (
                    animal.data_nascimento +
                    timedelta(days=random.randint(30, 365*2))
                )
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
                    observacoes=(
                        f"Pesagem de rotina do animal "
                        f"{animal.identificacao_unica}"
                    ),
                    usuario=(
                        random.choice(funcionarios) if funcionarios else None
                    )
                )

                # Criar a pesagem
                pesagem = Pesagem.objects.create(
                    animal=animal,
                    manejo=manejo,
                    data_pesagem=data_pesagem,
                    peso_kg=Decimal(str(peso_atual)),
                    equipamento_usado=random.choice([
                        'Balança Digital', 'Balança Mecânica', 'Fita Torácica'
                    ]),
                    observacoes="Pesagem de rotina"
                )

                # Associar o animal ao manejo
                AnimalManejo.objects.create(
                    animal=animal,
                    manejo=manejo,
                    observacoes_especificas=f"Pesagem: {peso_atual}kg"
                )

                pesagens.append(pesagem)

        self.stdout.write(f"✅ {len(pesagens)} pesagens criadas")
        return pesagens

    def criar_manejos(self, animais, lotes, usuarios):
        """Cria manejos fictícios"""
        self.stdout.write("🏥 Criando manejos...")

        manejos = []
        funcionarios = [
            u for u in usuarios
            if u.groups.filter(
                name__in=['Funcionário', 'Gerente', 'Veterinário']
            ).exists()
        ]

        # Criar manejos variados

        for _ in range(100):  # 100 manejos aleatórios
            tipo = random.choice([
                'vacinacao', 'medicamento', 'pesagem', 'outro'
            ])
            data_manejo = date.today() - timedelta(days=random.randint(0, 365))

            # Só cria manejo se houver animais
            if len(animais) == 0:
                continue

            n_animais = min(20, len(animais))
            if n_animais == 0:
                continue

            animais_manejo = random.sample(
                animais, random.randint(1, n_animais)
            )
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
                    observacoes_especificas=(
                        f"Aplicado em {animal.identificacao_unica}"
                    )
                )

            manejos.append(manejo)

        self.stdout.write(f"✅ {len(manejos)} manejos criados")
        return manejos

    def criar_vacinacoes(self, animais, usuarios):
        """Cria vacinações fictícias"""
        self.stdout.write("💉 Criando vacinações...")

        # Primeiro criar as vacinas
        vacinas = []

        for nome_vacina in self.VACINAS:
            if not Vacina.objects.filter(nome=nome_vacina).exists():
                vacina = Vacina.objects.create(
                    nome=nome_vacina,
                    fabricante=random.choice([
                        'Zoetis', 'Boehringer', 'MSD', 'Ourofino'
                    ]),
                    doencas_previne=f"Prevenção de {nome_vacina}",
                    dose_ml=Decimal(str(random.uniform(2.0, 5.0))),
                    via_aplicacao=random.choice([
                        'Subcutânea', 'Intramuscular'
                    ]),
                    intervalo_doses_dias=random.randint(21, 30),
                    periodo_carencia_dias=random.randint(0, 30),
                    ativa=True
                )
                vacinas.append(vacina)
            else:
                vacina = Vacina.objects.get(nome=nome_vacina)
                vacinas.append(vacina)

        vacinacoes = []
        veterinarios = [
            u for u in usuarios
            if u.groups.filter(
                name__in=['Veterinário', 'Funcionário']
            ).exists()
        ]

        for _ in range(50):  # 50 vacinações
            if len(animais) < 5:
                continue
            n_vacinacao = random.randint(5, min(30, len(animais)))
            animais_vacinacao = random.sample(animais, n_vacinacao)
            propriedade = animais_vacinacao[0].propriedade

            # Selecionar uma vacina aleatória
            vacina = random.choice(vacinas)

            # Criar o manejo de vacinação
            manejo = Manejo.objects.create(
                propriedade=propriedade,
                tipo='vacinacao',
                data_manejo=(
                    date.today() - timedelta(days=random.randint(0, 365))
                ),
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
                data_vencimento=(
                    date.today() + timedelta(days=random.randint(180, 365))
                ),
                data_proxima_dose=(
                    manejo.data_manejo +
                    timedelta(days=vacina.intervalo_doses_dias or 30)
                ),
                observacoes=(
                    f"Vacinação aplicada em {len(animais_vacinacao)} animais"
                )
            )

            # Associar animais
            for animal in animais_vacinacao:
                AnimalManejo.objects.create(
                    animal=animal,
                    manejo=manejo,
                    observacoes_especificas=f"Vacinado contra {vacina.nome}"
                )

            vacinacoes.append(vacinacao)

        self.stdout.write(f"✅ {len(vacinacoes)} vacinações criadas")
        return vacinacoes

    def criar_lancamentos_financeiros(self, propriedades, usuarios):
        """Cria lançamentos financeiros fictícios"""
        self.stdout.write("💰 Criando lançamentos financeiros...")

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
            contas_propriedade = [
                c for c in contas if c.propriedade == propriedade]
            categorias_propriedade = [
                c for c in categorias if c.propriedade == propriedade]

            if not contas_propriedade:
                continue

            conta_principal = contas_propriedade[0]

            # Entradas
            for _ in range(random.randint(10, 25)):
                categoria = random.choice(
                    [c for c in categorias_propriedade if c.tipo == 'entrada'])
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
                categoria = random.choice(
                    [c for c in categorias_propriedade if c.tipo == 'saida'])
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

        self.stdout.write(
            f"✅ {len(lancamentos)} lançamentos financeiros criados")
        return lancamentos
