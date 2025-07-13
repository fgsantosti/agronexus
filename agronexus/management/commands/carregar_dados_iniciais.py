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
            '--especies',
            nargs='+',
            help='Carregar apenas espécies específicas (bovino, caprino, ovino, equino, suino)',
        )
    
    def handle(self, *args, **options):
        self.stdout.write('Carregando dados iniciais...')
        
        especies_para_carregar = options.get('especies', None)
        
        try:
            with transaction.atomic():
                self.carregar_especies(especies_para_carregar)
                self.carregar_racas(especies_para_carregar)
                
            self.stdout.write(
                self.style.SUCCESS('Dados iniciais carregados com sucesso!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erro ao carregar dados: {str(e)}')
            )
            raise
    
    def carregar_especies(self, filtro_especies=None):
        """Carrega todas as espécies ou apenas as especificadas"""
        dados_especies = {
            'bovino': {
                'nome_display': 'Bovino',
                'peso_ua_referencia': 450,
                'periodo_gestacao_dias': 285,
                'idade_primeira_cobertura_meses': 24,
            },
            'caprino': {
                'nome_display': 'Caprino',
                'peso_ua_referencia': 45,
                'periodo_gestacao_dias': 150,
                'idade_primeira_cobertura_meses': 12,
            },
            'ovino': {
                'nome_display': 'Ovino',
                'peso_ua_referencia': 45,
                'periodo_gestacao_dias': 150,
                'idade_primeira_cobertura_meses': 12,
            },
            'equino': {
                'nome_display': 'Equino',
                'peso_ua_referencia': 500,
                'periodo_gestacao_dias': 330,
                'idade_primeira_cobertura_meses': 36,
            },
            'suino': {
                'nome_display': 'Suíno',
                'peso_ua_referencia': 150,
                'periodo_gestacao_dias': 114,
                'idade_primeira_cobertura_meses': 8,
            },
        }
        
        especies_a_criar = dados_especies
        if filtro_especies:
            especies_a_criar = {k: v for k, v in dados_especies.items() if k in filtro_especies}
        
        for nome, dados in especies_a_criar.items():
            especie, created = EspecieAnimal.objects.get_or_create(
                nome=nome,
                defaults=dados
            )
            
            if created:
                self.stdout.write(f"✓ Espécie criada: {especie.nome_display}")
            else:
                # Atualiza dados se necessário
                updated = False
                for campo, valor in dados.items():
                    if getattr(especie, campo) != valor:
                        setattr(especie, campo, valor)
                        updated = True
                
                if updated:
                    especie.save()
                    self.stdout.write(f"✓ Espécie atualizada: {especie.nome_display}")
                else:
                    self.stdout.write(f"- Espécie já existe: {especie.nome_display}")
    
    def carregar_racas(self, filtro_especies=None):
        """Carrega raças para as espécies"""
        dados_racas = {
            'bovino': {
                'Nelore': {'origem': 'Índia', 'peso_medio_adulto_kg': 450},
                'Angus': {'origem': 'Escócia', 'peso_medio_adulto_kg': 550},
                'Brahman': {'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 500},
                'Gir': {'origem': 'Índia', 'peso_medio_adulto_kg': 400},
                'Guzerá': {'origem': 'Índia', 'peso_medio_adulto_kg': 480},
                'Tabapuã': {'origem': 'Brasil', 'peso_medio_adulto_kg': 460},
                'Canchim': {'origem': 'Brasil', 'peso_medio_adulto_kg': 520},
                'Brangus': {'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 530},
                'Senepol': {'origem': 'Ilhas Virgens', 'peso_medio_adulto_kg': 470},
                'Limousin': {'origem': 'França', 'peso_medio_adulto_kg': 580},
                'Charolês': {'origem': 'França', 'peso_medio_adulto_kg': 600},
                'Simental': {'origem': 'Suíça', 'peso_medio_adulto_kg': 590},
                'Hereford': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 540},
            },
            'caprino': {
                'Boer': {'origem': 'África do Sul', 'peso_medio_adulto_kg': 60},
                'Anglo Nubiana': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 55},
                'Saanen': {'origem': 'Suíça', 'peso_medio_adulto_kg': 50},
                'Parda Alpina': {'origem': 'França', 'peso_medio_adulto_kg': 52},
                'Toggenburg': {'origem': 'Suíça', 'peso_medio_adulto_kg': 48},
                'Canindé': {'origem': 'Brasil', 'peso_medio_adulto_kg': 35},
                'Moxotó': {'origem': 'Brasil', 'peso_medio_adulto_kg': 30},
                'Morada Nova': {'origem': 'Brasil', 'peso_medio_adulto_kg': 32},
                'Repartida': {'origem': 'Brasil', 'peso_medio_adulto_kg': 28},
                'Azul': {'origem': 'Brasil', 'peso_medio_adulto_kg': 25},
                'Marota': {'origem': 'Brasil', 'peso_medio_adulto_kg': 30},
            },
            'ovino': {
                'Dorper': {'origem': 'África do Sul', 'peso_medio_adulto_kg': 65},
                'Santa Inês': {'origem': 'Brasil', 'peso_medio_adulto_kg': 55},
                'Morada Nova': {'origem': 'Brasil', 'peso_medio_adulto_kg': 45},
                'Somalis Brasileira': {'origem': 'Brasil', 'peso_medio_adulto_kg': 40},
                'Bergamácia': {'origem': 'França', 'peso_medio_adulto_kg': 70},
                'Ile de France': {'origem': 'França', 'peso_medio_adulto_kg': 75},
                'Suffolk': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 80},
                'Texel': {'origem': 'Holanda', 'peso_medio_adulto_kg': 85},
                'Corriedale': {'origem': 'Nova Zelândia', 'peso_medio_adulto_kg': 60},
                'Romney Marsh': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 70},
                'Ideal': {'origem': 'Uruguai', 'peso_medio_adulto_kg': 58},
            },
            'equino': {
                'Mangalarga Marchador': {'origem': 'Brasil', 'peso_medio_adulto_kg': 450},
                'Quarto de Milha': {'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 500},
                'Crioulo': {'origem': 'América do Sul', 'peso_medio_adulto_kg': 420},
                'Puro Sangue Inglês': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 480},
                'Andaluz': {'origem': 'Espanha', 'peso_medio_adulto_kg': 460},
                'Árabe': {'origem': 'Península Arábica', 'peso_medio_adulto_kg': 440},
            },
            'suino': {
                'Landrace': {'origem': 'Dinamarca', 'peso_medio_adulto_kg': 250},
                'Large White': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 280},
                'Duroc': {'origem': 'Estados Unidos', 'peso_medio_adulto_kg': 270},
                'Pietrain': {'origem': 'Bélgica', 'peso_medio_adulto_kg': 240},
                'Hampshire': {'origem': 'Inglaterra', 'peso_medio_adulto_kg': 260},
                'Piau': {'origem': 'Brasil', 'peso_medio_adulto_kg': 180},
                'Caruncho': {'origem': 'Brasil', 'peso_medio_adulto_kg': 170},
            }
        }
        
        especies_a_processar = dados_racas
        if filtro_especies:
            especies_a_processar = {k: v for k, v in dados_racas.items() if k in filtro_especies}
        
        for especie_nome, racas in especies_a_processar.items():
            try:
                especie = EspecieAnimal.objects.get(nome=especie_nome)
                
                for raca_nome, dados_raca in racas.items():
                    raca, created = RacaAnimal.objects.get_or_create(
                        especie=especie,
                        nome=raca_nome,
                        defaults=dados_raca
                    )
                    
                    if created:
                        self.stdout.write(f"  ✓ Raça criada: {raca}")
                    else:
                        # Atualiza dados se necessário
                        updated = False
                        for campo, valor in dados_raca.items():
                            if getattr(raca, campo) != valor:
                                setattr(raca, campo, valor)
                                updated = True
                        
                        if updated:
                            raca.save()
                            self.stdout.write(f"  ✓ Raça atualizada: {raca}")
                
            except EspecieAnimal.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Espécie '{especie_nome}' não encontrada")
                )
