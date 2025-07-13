"""
Comando para migrar dados existentes para o novo sistema de espécies
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from agronexus.models import EspecieAnimal, RacaAnimal, Animal


class Command(BaseCommand):
    help = 'Migra dados existentes para o novo sistema de espécies'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força a migração mesmo se já existirem dados',
        )
    
    def handle(self, *args, **options):
        self.stdout.write('Iniciando migração para sistema de espécies...')
        
        try:
            with transaction.atomic():
                # Criar espécies padrão
                self.criar_especies()
                
                # Criar raças padrão
                self.criar_racas()
                
                # Migrar animais existentes se necessário
                if options['force'] or not Animal.objects.filter(especie__isnull=False).exists():
                    self.migrar_animais()
                
            self.stdout.write(
                self.style.SUCCESS('Migração concluída com sucesso!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erro durante a migração: {str(e)}')
            )
            raise
    
    def criar_especies(self):
        """Cria espécies padrão"""
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
                'peso_ua_referencia': 500,
                'periodo_gestacao_dias': 330,
                'idade_primeira_cobertura_meses': 36,
            },
            {
                'nome': 'suino',
                'nome_display': 'Suíno',
                'peso_ua_referencia': 150,
                'periodo_gestacao_dias': 114,
                'idade_primeira_cobertura_meses': 8,
            },
        ]
        
        for especie_data in especies_data:
            especie, created = EspecieAnimal.objects.get_or_create(
                nome=especie_data['nome'],
                defaults=especie_data
            )
            if created:
                self.stdout.write(f"✓ Criada espécie: {especie.nome_display}")
            else:
                self.stdout.write(f"- Espécie já existe: {especie.nome_display}")
    
    def criar_racas(self):
        """Cria raças padrão para cada espécie"""
        racas_data = {
            'bovino': [
                'Nelore', 'Angus', 'Brahman', 'Gir', 'Guzerá', 
                'Tabapuã', 'Canchim', 'Brangus', 'Senepol',
                'Limousin', 'Charolês', 'Simental', 'Hereford'
            ],
            'caprino': [
                'Boer', 'Anglo Nubiana', 'Saanen', 'Parda Alpina',
                'Toggenburg', 'Canindé', 'Moxotó', 'Morada Nova',
                'Repartida', 'Azul', 'Marota'
            ],
            'ovino': [
                'Dorper', 'Santa Inês', 'Morada Nova', 'Somalis Brasileira',
                'Bergamácia', 'Ile de France', 'Suffolk', 'Texel',
                'Corriedale', 'Romney Marsh', 'Ideal'
            ],
            'equino': [
                'Mangalarga Marchador', 'Quarto de Milha', 'Crioulo',
                'Puro Sangue Inglês', 'Andaluz', 'Árabe'
            ],
            'suino': [
                'Landrace', 'Large White', 'Duroc', 'Pietrain',
                'Hampshire', 'Piau', 'Caruncho'
            ]
        }
        
        for especie_nome, racas in racas_data.items():
            try:
                especie = EspecieAnimal.objects.get(nome=especie_nome)
                for raca_nome in racas:
                    raca, created = RacaAnimal.objects.get_or_create(
                        especie=especie,
                        nome=raca_nome
                    )
                    if created:
                        self.stdout.write(f"  ✓ Criada raça: {raca}")
                
            except EspecieAnimal.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Espécie '{especie_nome}' não encontrada")
                )
    
    def migrar_animais(self):
        """Migra animais existentes para bovino como padrão"""
        try:
            especie_bovino = EspecieAnimal.objects.get(nome='bovino')
            animais_sem_especie = Animal.objects.filter(especie__isnull=True)
            
            if animais_sem_especie.exists():
                count = 0
                for animal in animais_sem_especie:
                    animal.especie = especie_bovino
                    animal.save()
                    count += 1
                
                self.stdout.write(
                    f"✓ {count} animais migrados para espécie Bovino"
                )
            else:
                self.stdout.write("- Nenhum animal precisa ser migrado")
                
        except EspecieAnimal.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("Espécie Bovino não encontrada! Execute primeiro a criação de espécies.")
            )
