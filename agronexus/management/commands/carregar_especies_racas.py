"""
Comando para carregar dados iniciais de espécies e raças
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from agronexus.models import EspecieAnimal, RacaAnimal


class Command(BaseCommand):
    help = 'Carrega dados iniciais de espécies e raças de animais'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpar',
            action='store_true',
            help='Remove todas as espécies e raças antes de criar',
        )

    def handle(self, *args, **options):
        if options['limpar']:
            self.stdout.write("Removendo espécies e raças existentes...")
            RacaAnimal.objects.all().delete()
            EspecieAnimal.objects.all().delete()

        self.stdout.write("Carregando espécies e raças...")

        with transaction.atomic():
            # Dados das espécies
            especies_data = [
                {
                    'nome': 'bovino',
                    'nome_display': 'Bovino',
                    'peso_ua_referencia': 450,
                    'periodo_gestacao_dias': 285,
                    'idade_primeira_cobertura_meses': 24,
                },
                {
                    'nome': 'caprino',
                    'nome_display': 'Caprino',
                    'peso_ua_referencia': 45,
                    'periodo_gestacao_dias': 150,
                    'idade_primeira_cobertura_meses': 12,
                },
                {
                    'nome': 'ovino',
                    'nome_display': 'Ovino',
                    'peso_ua_referencia': 45,
                    'periodo_gestacao_dias': 150,
                    'idade_primeira_cobertura_meses': 12,
                },
                {
                    'nome': 'equino',
                    'nome_display': 'Equino',
                    'peso_ua_referencia': 400,
                    'periodo_gestacao_dias': 340,
                    'idade_primeira_cobertura_meses': 36,
                },
                {
                    'nome': 'suino',
                    'nome_display': 'Suíno',
                    'peso_ua_referencia': 50,
                    'periodo_gestacao_dias': 114,
                    'idade_primeira_cobertura_meses': 8,
                },
            ]

            # Criar espécies
            especies_criadas = {}
            for especie_data in especies_data:
                especie, created = EspecieAnimal.objects.get_or_create(
                    nome=especie_data['nome'],
                    defaults=especie_data
                )
                especies_criadas[especie.nome] = especie
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Criada espécie: {especie.nome_display}")
                    )
                else:
                    self.stdout.write(f"  Espécie já existe: {especie.nome_display}")

            # Dados das raças por espécie
            racas_data = {
                'bovino': [
                    {'nome': 'Nelore', 'origem': 'Índia', 'peso_medio_adulto_kg': 500},
                    {'nome': 'Angus', 'origem': 'Escócia', 'peso_medio_adulto_kg': 550},
                    {'nome': 'Brahman', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 600},
                    {'nome': 'Gir', 'origem': 'Índia', 'peso_medio_adulto_kg': 450},
                    {'nome': 'Guzerá', 'origem': 'Índia', 'peso_medio_adulto_kg': 500},
                    {'nome': 'Tabapuã', 'origem': 'Brasil', 'peso_medio_adulto_kg': 480},
                    {'nome': 'Canchim', 'origem': 'Brasil', 'peso_medio_adulto_kg': 520},
                    {'nome': 'Brangus', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 530},
                    {'nome': 'Senepol', 'origem': 'Ilhas Virgens', 'peso_medio_adulto_kg': 480},
                    {'nome': 'Simmental', 'origem': 'Suíça', 'peso_medio_adulto_kg': 650},
                    {'nome': 'Charolês', 'origem': 'França', 'peso_medio_adulto_kg': 700},
                    {'nome': 'Limousin', 'origem': 'França', 'peso_medio_adulto_kg': 600},
                ],
                'caprino': [
                    {'nome': 'Boer', 'origem': 'África do Sul', 'peso_medio_adulto_kg': 70},
                    {'nome': 'Anglo Nubiana', 'origem': 'Inglaterra/Egito', 'peso_medio_adulto_kg': 65},
                    {'nome': 'Saanen', 'origem': 'Suíça', 'peso_medio_adulto_kg': 60},
                    {'nome': 'Parda Alpina', 'origem': 'França', 'peso_medio_adulto_kg': 55},
                    {'nome': 'Toggenburg', 'origem': 'Suíça', 'peso_medio_adulto_kg': 50},
                    {'nome': 'Canindé', 'origem': 'Brasil', 'peso_medio_adulto_kg': 45},
                    {'nome': 'Moxotó', 'origem': 'Brasil', 'peso_medio_adulto_kg': 40},
                    {'nome': 'Morada Nova', 'origem': 'Brasil', 'peso_medio_adulto_kg': 35},
                    {'nome': 'Alpina Britânica', 'origem': 'Reino Unido', 'peso_medio_adulto_kg': 58},
                    {'nome': 'LaMancha', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 52},
                ],
                'ovino': [
                    {'nome': 'Dorper', 'origem': 'África do Sul', 'peso_medio_adulto_kg': 70},
                    {'nome': 'Santa Inês', 'origem': 'Brasil', 'peso_medio_adulto_kg': 60},
                    {'nome': 'Morada Nova', 'origem': 'Brasil', 'peso_medio_adulto_kg': 45},
                    {'nome': 'Somalis Brasileira', 'origem': 'Brasil', 'peso_medio_adulto_kg': 50},
                    {'nome': 'Bergamácia', 'origem': 'França', 'peso_medio_adulto_kg': 65},
                    {'nome': 'Ile de France', 'origem': 'França', 'peso_medio_adulto_kg': 80},
                    {'nome': 'Suffolk', 'origem': 'Inglaterra', 'peso_medio_adulto_kg': 85},
                    {'nome': 'Texel', 'origem': 'França', 'peso_medio_adulto_kg': 75},
                    {'nome': 'Hampshire Down', 'origem': 'Inglaterra', 'peso_medio_adulto_kg': 70},
                    {'nome': 'Poll Dorset', 'origem': 'Austrália', 'peso_medio_adulto_kg': 75},
                ],
                'equino': [
                    {'nome': 'Mangalarga Marchador', 'origem': 'Brasil', 'peso_medio_adulto_kg': 400},
                    {'nome': 'Quarto de Milha', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 450},
                    {'nome': 'Puro Sangue Inglês', 'origem': 'Inglaterra', 'peso_medio_adulto_kg': 500},
                    {'nome': 'Crioulo', 'origem': 'Brasil', 'peso_medio_adulto_kg': 380},
                    {'nome': 'Appaloosa', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 430},
                    {'nome': 'Paint Horse', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 440},
                    {'nome': 'Árabe', 'origem': 'Península Arábica', 'peso_medio_adulto_kg': 420},
                ],
                'suino': [
                    {'nome': 'Landrace', 'origem': 'Dinamarca', 'peso_medio_adulto_kg': 250},
                    {'nome': 'Large White', 'origem': 'Inglaterra', 'peso_medio_adulto_kg': 280},
                    {'nome': 'Duroc', 'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 300},
                    {'nome': 'Hampshire', 'origem': 'Inglaterra', 'peso_medio_adulto_kg': 270},
                    {'nome': 'Pietrain', 'origem': 'Bélgica', 'peso_medio_adulto_kg': 250},
                    {'nome': 'Piau', 'origem': 'Brasil', 'peso_medio_adulto_kg': 180},
                    {'nome': 'Caruncho', 'origem': 'Brasil', 'peso_medio_adulto_kg': 150},
                ],
            }

            # Criar raças
            total_racas_criadas = 0
            for especie_nome, racas in racas_data.items():
                if especie_nome in especies_criadas:
                    especie = especies_criadas[especie_nome]
                    for raca_data in racas:
                        raca_data['especie'] = especie
                        raca, created = RacaAnimal.objects.get_or_create(
                            especie=especie,
                            nome=raca_data['nome'],
                            defaults=raca_data
                        )
                        
                        if created:
                            total_racas_criadas += 1
                            self.stdout.write(f"  ✓ Criada raça: {raca}")

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n🎉 Concluído! Criadas {len(especies_criadas)} espécies e {total_racas_criadas} raças."
                )
            )

            # Estatísticas finais
            self.stdout.write("\n📊 Estatísticas:")
            for especie in EspecieAnimal.objects.all():
                total_racas = especie.racas.count()
                self.stdout.write(f"  {especie.nome_display}: {total_racas} raças")
