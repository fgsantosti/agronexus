
"""
Sistema  - Models Django
Sistema de gestão pecuária completo com módulos integrados
Data: 2025-07-09
"""

import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

# ============================================================================
# USUÁRIOS E AUTENTICAÇÃO
# ============================================================================


class Usuario(AbstractUser):
    """
    Usuário do sistema com perfis baseados em Groups do Django
    """
    telefone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f"{self.get_full_name()} ({self.perfil_principal})"

    @property
    def perfil_principal(self):
        """Retorna o grupo principal do usuário"""
        grupo = self.groups.first()
        return grupo.name if grupo else 'Sem perfil'

    @property
    def perfis(self):
        """Retorna todos os perfis (grupos) do usuário"""
        return [grupo.name for grupo in self.groups.all()]

    @property
    def is_proprietario(self):
        return self.groups.filter(name='Proprietário').exists()

    @property
    def is_gerente(self):
        return self.groups.filter(name='Gerente').exists()

    @property
    def is_funcionario(self):
        return self.groups.filter(name='Funcionário').exists()

    @property
    def is_veterinario(self):
        return self.groups.filter(name='Veterinário').exists()

    def has_perfil(self, perfil_nome):
        """Verifica se o usuário tem um perfil específico"""
        return self.groups.filter(name=perfil_nome).exists()

    def add_perfil(self, perfil_nome):
        """Adiciona um perfil ao usuário"""
        try:
            from django.contrib.auth.models import Group
            grupo = Group.objects.get(name=perfil_nome)
            self.groups.add(grupo)
            return True
        except Group.DoesNotExist:
            return False

    def remove_perfil(self, perfil_nome):
        """Remove um perfil do usuário"""
        try:
            from django.contrib.auth.models import Group
            grupo = Group.objects.get(name=perfil_nome)
            self.groups.remove(grupo)
            return True
        except Group.DoesNotExist:
            return False


# ============================================================================
# PROPRIEDADES E ÁREAS
# ============================================================================

class Propriedade(models.Model):
    """
    Propriedade rural - uma fazenda
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=200)
    proprietario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='propriedades')
    localizacao = models.TextField(
        help_text="Endereço completo da propriedade")
    area_total_ha = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    coordenadas_gps = models.JSONField(
        blank=True, null=True, help_text="Coordenadas geográficas da propriedade")
    inscricao_estadual = models.CharField(max_length=50, blank=True)
    cnpj_cpf = models.CharField(max_length=18, blank=True)
    ativa = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'propriedades'
        verbose_name = 'Propriedade'
        verbose_name_plural = 'Propriedades'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    def get_area_ocupada(self):
        """Retorna a área total ocupada por todas as áreas da propriedade"""
        return self.areas.aggregate(total=models.Sum('tamanho_ha'))['total'] or 0

    def get_taxa_ocupacao_global(self):
        """Calcula a taxa de ocupação global da propriedade em UA/ha"""
        total_ua = sum(lote.get_total_ua()
                       for lote in self.lotes.filter(ativo=True))
        if self.area_total_ha > 0:
            return total_ua / float(self.area_total_ha)
        return 0


class Area(models.Model):
    """
    Área/Piquete/Baia dentro de uma propriedade
    """
    STATUS_CHOICES = [
        ('em_uso', 'Em Uso'),
        ('descanso', 'Em Descanso'),
        ('degradada', 'Degradada'),
        ('reforma', 'Em Reforma'),
        ('disponivel', 'Disponível'),
    ]

    TIPO_CHOICES = [
        ('piquete', 'Piquete'),
        ('baia', 'Baia'),
        ('curral', 'Curral'),
        ('apartacao', 'Apartação'),
        ('enfermaria', 'Enfermaria'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='areas')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(
        max_length=20, choices=TIPO_CHOICES, default='piquete')
    tamanho_ha = models.DecimalField(
        max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    tipo_forragem = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='disponivel')
    coordenadas_poligono = models.JSONField(
        blank=True, null=True, help_text="Coordenadas do polígono da área")
    observacoes = models.TextField(blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'areas'
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['propriedade', 'nome']
        unique_together = ['propriedade', 'nome']

    def __str__(self):
        return f"{self.propriedade.nome} - {self.nome}"

    def get_lote_atual(self):
        """Retorna o lote que está ocupando esta área atualmente"""
        return self.lotes.filter(ativo=True).first()

    def get_taxa_ocupacao_atual(self):
        """Calcula a taxa de ocupação atual da área em UA/ha"""
        lote_atual = self.get_lote_atual()
        if lote_atual and self.tamanho_ha > 0:
            return lote_atual.get_total_ua() / float(self.tamanho_ha)
        return 0

    def get_periodo_ocupacao_atual(self):
        """Retorna há quantos dias a área está ocupada"""
        historico = self.historico_ocupacao.filter(
            data_saida__isnull=True).first()
        if historico:
            return (timezone.now().date() - historico.data_entrada).days
        return 0


# ============================================================================
# ESPÉCIES E RAÇAS
# ============================================================================

class EspecieAnimal(models.Model):
    """
    Espécies de animais suportadas pelo sistema
    """
    ESPECIES_CHOICES = [
        ('bovino', 'Bovino'),
        ('caprino', 'Caprino'),
        ('ovino', 'Ovino'),
        ('equino', 'Equino'),
        ('suino', 'Suíno'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(
        max_length=20, choices=ESPECIES_CHOICES, unique=True)
    nome_display = models.CharField(max_length=50)
    peso_ua_referencia = models.DecimalField(
        max_digits=6, decimal_places=2, default=450,
        help_text="Peso de referência para 1 UA em kg"
    )
    periodo_gestacao_dias = models.IntegerField(
        default=285, help_text="Período de gestação em dias"
    )
    idade_primeira_cobertura_meses = models.IntegerField(
        default=24, help_text="Idade recomendada para primeira cobertura"
    )
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'especies_animais'
        verbose_name = 'Espécie Animal'
        verbose_name_plural = 'Espécies Animais'
        ordering = ['nome']

    def __str__(self):
        return self.nome_display

    def get_categorias(self):
        """Retorna categorias disponíveis para esta espécie"""
        categorias_por_especie = {
            'bovino': [
                ('bezerro', 'Bezerro'),
                ('bezerra', 'Bezerra'),
                ('novilho', 'Novilho'),
                ('novilha', 'Novilha'),
                ('touro', 'Touro'),
                ('vaca', 'Vaca'),
            ],
            'caprino': [
                ('cabrito', 'Cabrito'),
                ('cabrita', 'Cabrita'),
                ('bode_jovem', 'Bode Jovem'),
                ('cabra_jovem', 'Cabra Jovem'),
                ('bode', 'Bode'),
                ('cabra', 'Cabra'),
            ],
            'ovino': [
                ('cordeiro', 'Cordeiro'),
                ('cordeira', 'Cordeira'),
                ('carneiro_jovem', 'Carneiro Jovem'),
                ('ovelha_jovem', 'Ovelha Jovem'),
                ('carneiro', 'Carneiro'),
                ('ovelha', 'Ovelha'),
            ],
        }
        return categorias_por_especie.get(self.nome, [])


class RacaAnimal(models.Model):
    """
    Raças disponíveis por espécie
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    especie = models.ForeignKey(
        EspecieAnimal, on_delete=models.CASCADE, related_name='racas'
    )
    nome = models.CharField(max_length=100)
    origem = models.CharField(max_length=100, blank=True)
    caracteristicas = models.TextField(blank=True)
    peso_medio_adulto_kg = models.DecimalField(
        max_digits=6, decimal_places=2, blank=True, null=True
    )
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'racas_animais'
        verbose_name = 'Raça Animal'
        verbose_name_plural = 'Raças Animais'
        ordering = ['especie', 'nome']
        unique_together = ['especie', 'nome']

    def __str__(self):
        return f"{self.especie.nome_display} - {self.nome}"


# ============================================================================
# ANIMAIS E LOTES
# ============================================================================

class Animal(models.Model):
    """
    Animal individual do rebanho
    """
    SEXO_CHOICES = [
        ('M', 'Macho'),
        ('F', 'Fêmea'),
    ]

    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('vendido', 'Vendido'),
        ('morto', 'Morto'),
        ('descartado', 'Descartado'),
    ]

    CATEGORIA_CHOICES = [
        ('bezerro', 'Bezerro'),
        ('bezerra', 'Bezerra'),
        ('novilho', 'Novilho'),
        ('novilha', 'Novilha'),
        ('touro', 'Touro'),
        ('vaca', 'Vaca'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Espécie e raça
    especie = models.ForeignKey(
        EspecieAnimal, on_delete=models.CASCADE,
        related_name='animais'
    )
    raca = models.ForeignKey(
        RacaAnimal, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='animais'
    )

    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='animais')
    identificacao_unica = models.CharField(
        max_length=50, help_text="Brinco, chip, etc.")
    nome_registro = models.CharField(max_length=100, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    data_nascimento = models.DateField()
    categoria = models.CharField(max_length=20)  # Removido choices fixos
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='ativo')

    # Genealogia
    pai = models.ForeignKey('self', on_delete=models.SET_NULL,
                            null=True, blank=True, related_name='filhos_pai')
    mae = models.ForeignKey('self', on_delete=models.SET_NULL,
                            null=True, blank=True, related_name='filhos_mae')

    # Dados de compra
    data_compra = models.DateField(blank=True, null=True)
    valor_compra = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)
    origem = models.CharField(max_length=200, blank=True)

    # Dados de venda
    data_venda = models.DateField(blank=True, null=True)
    valor_venda = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)
    destino = models.CharField(max_length=200, blank=True)

    # Dados de morte
    data_morte = models.DateField(blank=True, null=True)
    causa_morte = models.TextField(blank=True)

    # Lote atual
    lote_atual = models.ForeignKey(
        'Lote', on_delete=models.SET_NULL, null=True, blank=True, related_name='animais')

    # Metadados
    fotos_evolucao = models.JSONField(
        default=list, blank=True, help_text="Lista de URLs das fotos com datas")
    observacoes = models.TextField(blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'animais'
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['identificacao_unica']
        unique_together = ['propriedade', 'identificacao_unica']

    def __str__(self):
        return f"{self.identificacao_unica} - {self.nome_registro or 'Sem nome'}"

    def clean(self):
        """Validações customizadas"""
        if self.pai and self.pai.sexo != 'M':
            raise ValidationError('O pai deve ser do sexo masculino')
        if self.mae and self.mae.sexo != 'F':
            raise ValidationError('A mãe deve ser do sexo feminino')
        if self.data_nascimento and self.data_nascimento > timezone.now().date():
            raise ValidationError('Data de nascimento não pode ser futura')

        # Validações de espécie
        if self.pai and self.pai.especie != self.especie:
            raise ValidationError('O pai deve ser da mesma espécie')
        if self.mae and self.mae.especie != self.especie:
            raise ValidationError('A mãe deve ser da mesma espécie')

        # Validar categoria por espécie
        if self.categoria:
            categorias_validas = [cat[0]
                                  for cat in self.get_categorias_disponiveis()]
            if self.categoria not in categorias_validas:
                raise ValidationError(
                    f'Categoria "{self.categoria}" não é válida para {self.especie.nome_display}')

        # Validar raça por espécie
        if self.raca and self.raca.especie != self.especie:
            raise ValidationError(
                'A raça deve pertencer à espécie selecionada')

    def get_idade_dias(self):
        """Retorna a idade do animal em dias"""
        if self.status == 'morto' and self.data_morte:
            return (self.data_morte - self.data_nascimento).days
        return (timezone.now().date() - self.data_nascimento).days

    def get_idade_meses(self):
        """Retorna a idade do animal em meses"""
        return self.get_idade_dias() // 30

    def get_peso_atual(self):
        """Retorna o peso mais recente do animal"""
        ultima_pesagem = self.pesagens.order_by('-data_pesagem').first()
        return ultima_pesagem.peso_kg if ultima_pesagem else None

    def get_ua_value(self):
        """Calcula o valor em UA baseado na espécie"""
        peso = self.get_peso_atual()
        if peso:
            return float(peso) / float(self.especie.peso_ua_referencia)

        # Valores padrão por espécie se não houver pesagem
        valores_padrao = {
            'bovino': 0.5,
            'caprino': 0.1,
            'ovino': 0.1,
            'equino': 0.8,
            'suino': 0.3,
        }
        return valores_padrao.get(self.especie.nome, 0.5)

    def get_categorias_disponiveis(self):
        """Retorna categorias baseadas na espécie"""
        return self.especie.get_categorias()

    def get_periodo_gestacao(self):
        """Retorna o período de gestação para a espécie"""
        return self.especie.periodo_gestacao_dias

    def get_idade_primeira_cobertura(self):
        """Retorna a idade recomendada para primeira cobertura"""
        return self.especie.idade_primeira_cobertura_meses

    def get_gmd_periodo(self, dias=30):
        """Calcula o GMD (Ganho Médio Diário) dos últimos X dias"""
        data_limite = timezone.now().date() - timedelta(days=dias)
        pesagens = self.pesagens.filter(
            data_pesagem__gte=data_limite).order_by('data_pesagem')

        if pesagens.count() >= 2:
            primeira = pesagens.first()
            ultima = pesagens.last()
            diferenca_peso = ultima.peso_kg - primeira.peso_kg
            diferenca_dias = (ultima.data_pesagem - primeira.data_pesagem).days
            if diferenca_dias > 0:
                return diferenca_peso / diferenca_dias
        return None

    def get_historico_completo(self):
        """Retorna um histórico completo de todos os manejos do animal"""
        from django.db.models import Q

        historico = []

        # Pesagens
        for pesagem in self.pesagens.all():
            historico.append({
                'data': pesagem.data_pesagem,
                'tipo': 'Pesagem',
                'detalhes': f"{pesagem.peso_kg}kg",
                'objeto': pesagem
            })

        # Manejos
        for manejo in self.manejos.all():
            historico.append({
                'data': manejo.data_manejo,
                'tipo': manejo.get_tipo_display(),
                'detalhes': manejo.observacoes,
                'objeto': manejo
            })

        return sorted(historico, key=lambda x: x['data'], reverse=True)


class Lote(models.Model):
    """
    Agrupamento de animais para manejo
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='lotes')
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    criterio_agrupamento = models.CharField(
        max_length=200, blank=True, help_text="Ex: Bezerros desmamados em 2025")
    area_atual = models.ForeignKey(
        Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='lotes')

    # Características do lote
    APTIDAO_CHOICES = [
        ('corte', 'Corte'),
        ('leite', 'Leite'),
        ('dupla_aptidao', 'Dupla Aptidão'),
    ]

    FINALIDADE_CHOICES = [
        ('cria', 'Cria'),
        ('recria', 'Recria'),
        ('engorda', 'Engorda'),
    ]

    SISTEMA_CRIACAO_CHOICES = [
        ('intensivo', 'Intensivo'),
        ('extensivo', 'Extensivo'),
        ('semi_extensivo', 'Semi-Extensivo'),
    ]

    aptidao = models.CharField(
        max_length=20, choices=APTIDAO_CHOICES, blank=True,
        help_text="Aptidão predominante do lote")
    finalidade = models.CharField(
        max_length=20, choices=FINALIDADE_CHOICES, blank=True,
        help_text="Finalidade do lote na propriedade")
    sistema_criacao = models.CharField(
        max_length=20, choices=SISTEMA_CRIACAO_CHOICES, blank=True,
        help_text="Sistema de criação utilizado para o lote")

    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lotes'
        verbose_name = 'Lote'
        verbose_name_plural = 'Lotes'
        ordering = ['propriedade', 'nome']
        unique_together = ['propriedade', 'nome']

    def __str__(self):
        return f"{self.propriedade.nome} - {self.nome}"

    def get_total_animais(self):
        """Retorna o total de animais ativos no lote"""
        return self.animais.filter(status='ativo').count()

    def get_total_ua(self):
        """Retorna o total de UA (Unidades Animais) do lote"""
        return sum(animal.get_ua_value() for animal in self.animais.filter(status='ativo'))

    def get_peso_medio(self):
        """Calcula o peso médio dos animais do lote"""
        animais_com_peso = [animal for animal in self.animais.filter(
            status='ativo') if animal.get_peso_atual()]
        if animais_com_peso:
            return sum(animal.get_peso_atual() for animal in animais_com_peso) / len(animais_com_peso)
        return None

    def get_gmd_medio(self, dias=30):
        """Calcula o GMD médio do lote"""
        gmds = [animal.get_gmd_periodo(
            dias) for animal in self.animais.filter(status='ativo')]
        gmds_validos = [gmd for gmd in gmds if gmd is not None]
        if gmds_validos:
            return sum(gmds_validos) / len(gmds_validos)
        return None


class HistoricoLoteAnimal(models.Model):
    """
    Histórico de movimentação de animais entre lotes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(
        Animal, on_delete=models.CASCADE, related_name='historico_lotes')
    lote = models.ForeignKey(
        Lote, on_delete=models.CASCADE, related_name='historico_animais')
    data_entrada = models.DateField()
    data_saida = models.DateField(blank=True, null=True)
    motivo_movimentacao = models.CharField(max_length=200, blank=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'historico_lote_animal'
        verbose_name = 'Histórico Lote-Animal'
        verbose_name_plural = 'Históricos Lote-Animal'
        ordering = ['-data_entrada']

    def __str__(self):
        return f"{self.animal} -> {self.lote} ({self.data_entrada})"


class HistoricoOcupacaoArea(models.Model):
    """
    Histórico de ocupação de áreas por lotes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lote = models.ForeignKey(
        Lote, on_delete=models.CASCADE, related_name='historico_areas')
    area = models.ForeignKey(
        Area, on_delete=models.CASCADE, related_name='historico_ocupacao')
    data_entrada = models.DateField()
    data_saida = models.DateField(blank=True, null=True)
    motivo_movimentacao = models.CharField(max_length=200, blank=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'historico_ocupacao_area'
        verbose_name = 'Histórico Ocupação Área'
        verbose_name_plural = 'Históricos Ocupação Área'
        ordering = ['-data_entrada']

    def __str__(self):
        return f"{self.lote} -> {self.area} ({self.data_entrada})"

    def get_periodo_ocupacao(self):
        """Retorna o período de ocupação em dias"""
        data_fim = self.data_saida or timezone.now().date()
        return (data_fim - self.data_entrada).days


# ============================================================================
# MANEJOS
# ============================================================================

class Manejo(models.Model):
    """
    Classe base para todos os tipos de manejo
    """
    TIPO_CHOICES = [
        ('pesagem', 'Pesagem'),
        ('vacinacao', 'Vacinação'),
        ('medicamento', 'Administração de Medicamento'),
        ('inseminacao', 'Inseminação'),
        ('diagnostico', 'Diagnóstico de Gestação'),
        ('parto', 'Parto'),
        ('desmame', 'Desmame'),
        ('marcacao', 'Marcação'),
        ('descorna', 'Descorna'),
        ('castração', 'Castração'),
        ('outro', 'Outro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='manejos')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    data_manejo = models.DateField()
    animais = models.ManyToManyField(
        Animal, related_name='manejos', through='AnimalManejo')
    lote = models.ForeignKey(
        Lote, on_delete=models.SET_NULL, null=True, blank=True, related_name='manejos')

    # Custos
    custo_material = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    custo_pessoal = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    custo_total = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)

    observacoes = models.TextField(blank=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'manejos'
        verbose_name = 'Manejo'
        verbose_name_plural = 'Manejos'
        ordering = ['-data_manejo']

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.data_manejo}"

    def save(self, *args, **kwargs):
        """Calcula o custo total automaticamente"""
        self.custo_total = self.custo_material + self.custo_pessoal
        super().save(*args, **kwargs)

    def get_total_animais(self):
        """Retorna o total de animais envolvidos no manejo"""
        return self.animais.count()


class AnimalManejo(models.Model):
    """
    Tabela de junção entre Animal e Manejo com dados específicos
    """
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE)
    manejo = models.ForeignKey(Manejo, on_delete=models.CASCADE)
    observacoes_especificas = models.TextField(blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'animal_manejo'
        unique_together = ['animal', 'manejo']

    def __str__(self):
        return f"{self.animal} - {self.manejo}"


class Pesagem(models.Model):
    """
    Registro de pesagem de animais
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(
        Animal, on_delete=models.CASCADE, related_name='pesagens')
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='pesagem')
    peso_kg = models.DecimalField(
        max_digits=6, decimal_places=2, validators=[MinValueValidator(0)])
    data_pesagem = models.DateField()
    equipamento_usado = models.CharField(max_length=100, blank=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'pesagens'
        verbose_name = 'Pesagem'
        verbose_name_plural = 'Pesagens'
        ordering = ['-data_pesagem']

    def __str__(self):
        return f"{self.animal} - {self.peso_kg}kg ({self.data_pesagem})"

    def get_gmd_anterior(self):
        """Calcula o GMD em relação à pesagem anterior"""
        pesagem_anterior = Pesagem.objects.filter(
            animal=self.animal,
            data_pesagem__lt=self.data_pesagem
        ).order_by('-data_pesagem').first()

        if pesagem_anterior:
            diferenca_peso = self.peso_kg - pesagem_anterior.peso_kg
            diferenca_dias = (self.data_pesagem -
                              pesagem_anterior.data_pesagem).days
            if diferenca_dias > 0:
                return diferenca_peso / diferenca_dias
        return None


# ============================================================================
# REPRODUÇÃO
# ============================================================================

class EstacaoMonta(models.Model):
    """
    Período de estação de monta
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='estacoes_monta')
    nome = models.CharField(max_length=100)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    lotes_participantes = models.ManyToManyField(
        Lote, related_name='estacoes_monta')
    observacoes = models.TextField(blank=True)
    ativa = models.BooleanField(default=True)

    class Meta:
        db_table = 'estacoes_monta'
        verbose_name = 'Estação de Monta'
        verbose_name_plural = 'Estações de Monta'
        ordering = ['-data_inicio']

    def __str__(self):
        return f"{self.nome} ({self.data_inicio} - {self.data_fim})"

    def get_total_femeas(self):
        """Retorna o total de fêmeas participantes"""
        total = 0
        for lote in self.lotes_participantes.all():
            total += lote.animais.filter(sexo='F', status='ativo').count()
        return total

    def get_taxa_prenhez(self):
        """Calcula a taxa de prenhez da estação"""
        total_femeas = self.get_total_femeas()
        if total_femeas == 0:
            return 0

        diagnosticos_positivos = DiagnosticoGestacao.objects.filter(
            inseminacao__estacao_monta=self,
            resultado='positivo'
        ).count()

        return (diagnosticos_positivos / total_femeas) * 100


class ProtocoloIATF(models.Model):
    """
    Protocolo de Inseminação Artificial em Tempo Fixo
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='protocolos_iatf')
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    duracao_dias = models.IntegerField(validators=[MinValueValidator(1)])
    passos_protocolo = models.JSONField(
        help_text="Lista de passos com dias e procedimentos")
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'protocolos_iatf'
        verbose_name = 'Protocolo IATF'
        verbose_name_plural = 'Protocolos IATF'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Inseminacao(models.Model):
    """
    Registro de inseminação
    """
    TIPO_CHOICES = [
        ('natural', 'Monta Natural'),
        ('ia', 'Inseminação Artificial'),
        ('iatf', 'IATF'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(
        Animal, on_delete=models.CASCADE, related_name='inseminacoes')
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='inseminacao')
    data_inseminacao = models.DateField()
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    reprodutor = models.ForeignKey(
        Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='cobertura_realizadas')
    semen_utilizado = models.CharField(
        max_length=200, blank=True, help_text="Identificação do sêmen")
    protocolo_iatf = models.ForeignKey(
        ProtocoloIATF, on_delete=models.SET_NULL, null=True, blank=True)
    estacao_monta = models.ForeignKey(
        EstacaoMonta, on_delete=models.SET_NULL, null=True, blank=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'inseminacoes'
        verbose_name = 'Inseminação'
        verbose_name_plural = 'Inseminações'
        ordering = ['-data_inseminacao']

    def __str__(self):
        return f"{self.animal} - {self.get_tipo_display()} ({self.data_inseminacao})"

    def get_data_diagnostico_prevista(self):
        """Calcula a data prevista para diagnóstico de gestação (30-45 dias)"""
        return self.data_inseminacao + timedelta(days=35)


class DiagnosticoGestacao(models.Model):
    """
    Diagnóstico de gestação
    """
    RESULTADO_CHOICES = [
        ('positivo', 'Positivo'),
        ('negativo', 'Negativo'),
        ('inconclusivo', 'Inconclusivo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inseminacao = models.ForeignKey(
        Inseminacao, on_delete=models.CASCADE, related_name='diagnosticos')
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='diagnostico_gestacao')
    data_diagnostico = models.DateField()
    resultado = models.CharField(max_length=15, choices=RESULTADO_CHOICES)
    metodo = models.CharField(
        max_length=100, blank=True, help_text="Ultrassom, palpação, etc.")
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'diagnosticos_gestacao'
        verbose_name = 'Diagnóstico de Gestação'
        verbose_name_plural = 'Diagnósticos de Gestação'
        ordering = ['-data_diagnostico']

    def __str__(self):
        return f"{self.inseminacao.animal} - {self.get_resultado_display()} ({self.data_diagnostico})"

    def get_data_parto_prevista(self):
        """Calcula a data prevista do parto baseada na espécie"""
        if self.resultado == 'positivo':
            dias_gestacao = self.inseminacao.animal.especie.periodo_gestacao_dias
            return self.inseminacao.data_inseminacao + timedelta(days=dias_gestacao)
        return None


class Parto(models.Model):
    """
    Registro de parto
    """
    RESULTADO_CHOICES = [
        ('nascido_vivo', 'Nascido Vivo'),
        ('aborto', 'Aborto'),
        ('natimorto', 'Natimorto'),
    ]

    DIFICULDADE_CHOICES = [
        ('normal', 'Normal'),
        ('assistido', 'Assistido'),
        ('cesariana', 'Cesariana'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mae = models.ForeignKey(
        Animal, on_delete=models.CASCADE, related_name='partos')
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='parto')
    data_parto = models.DateField()
    resultado = models.CharField(max_length=15, choices=RESULTADO_CHOICES)
    dificuldade = models.CharField(
        max_length=15, choices=DIFICULDADE_CHOICES, default='normal')

    # Suporte para múltiplos nascimentos (caprinos/ovinos)
    numero_filhotes = models.IntegerField(default=1)
    filhotes = models.ManyToManyField(
        Animal, related_name='parto_origem', blank=True
    )

    # Mantido para compatibilidade com bovinos (um filhote)
    bezerro = models.ForeignKey(
        Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='parto_origem_unico')
    peso_nascimento = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'partos'
        verbose_name = 'Parto'
        verbose_name_plural = 'Partos'
        ordering = ['-data_parto']

    def __str__(self):
        return f"{self.mae} - {self.get_resultado_display()} ({self.data_parto})"


# ============================================================================
# SANIDADE
# ============================================================================

class Vacina(models.Model):
    """
    Cadastro de vacinas disponíveis
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=200)
    fabricante = models.CharField(max_length=100)
    doencas_previne = models.TextField(
        help_text="Doenças que a vacina previne")
    dose_ml = models.DecimalField(max_digits=5, decimal_places=2)
    via_aplicacao = models.CharField(
        max_length=50, help_text="Subcutânea, intramuscular, etc.")
    intervalo_doses_dias = models.IntegerField(blank=True, null=True)
    periodo_carencia_dias = models.IntegerField(default=0)
    ativa = models.BooleanField(default=True)

    class Meta:
        db_table = 'vacinas'
        verbose_name = 'Vacina'
        verbose_name_plural = 'Vacinas'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.fabricante}"


class Medicamento(models.Model):
    """
    Cadastro de medicamentos disponíveis
    """
    TIPO_CHOICES = [
        ('antibiotico', 'Antibiótico'),
        ('antiparasitario', 'Antiparasitário'),
        ('anti_inflamatorio', 'Anti-inflamatório'),
        ('vitamina', 'Vitamina/Suplemento'),
        ('hormonio', 'Hormônio'),
        ('outro', 'Outro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=200)
    fabricante = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    principio_ativo = models.CharField(max_length=200)
    concentracao = models.CharField(max_length=100)
    via_aplicacao = models.CharField(max_length=50)
    dosagem_padrao = models.CharField(max_length=100, help_text="Ex: 1ml/50kg")
    periodo_carencia_dias = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = 'medicamentos'
        verbose_name = 'Medicamento'
        verbose_name_plural = 'Medicamentos'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.fabricante}"


class Vacinacao(models.Model):
    """
    Registro de vacinação
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='vacinacao')
    vacina = models.ForeignKey(Vacina, on_delete=models.CASCADE)
    dose_aplicada = models.DecimalField(max_digits=5, decimal_places=2)
    lote_vacina = models.CharField(max_length=50, blank=True)
    data_vencimento = models.DateField(blank=True, null=True)
    data_proxima_dose = models.DateField(blank=True, null=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'vacinacoes'
        verbose_name = 'Vacinação'
        verbose_name_plural = 'Vacinações'
        ordering = ['-manejo__data_manejo']

    def __str__(self):
        return f"{self.vacina.nome} - {self.manejo.data_manejo}"


class AdministracaoMedicamento(models.Model):
    """
    Registro de administração de medicamento
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    manejo = models.OneToOneField(
        Manejo, on_delete=models.CASCADE, related_name='administracao_medicamento')
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE)
    dosagem_aplicada = models.CharField(max_length=100)
    via_administracao = models.CharField(max_length=50)
    motivo_aplicacao = models.TextField()
    data_fim_carencia = models.DateField()
    observacoes = models.TextField(blank=True)

    class Meta:
        db_table = 'administracoes_medicamento'
        verbose_name = 'Administração de Medicamento'
        verbose_name_plural = 'Administrações de Medicamento'
        ordering = ['-manejo__data_manejo']

    def __str__(self):
        return f"{self.medicamento.nome} - {self.manejo.data_manejo}"

    def save(self, *args, **kwargs):
        """Calcula automaticamente a data fim da carência"""
        if not self.data_fim_carencia:
            self.data_fim_carencia = self.manejo.data_manejo + \
                timedelta(days=self.medicamento.periodo_carencia_dias)
        super().save(*args, **kwargs)


class CalendarioSanitario(models.Model):
    """
    Agendamento de manejos sanitários futuros
    """
    STATUS_CHOICES = [
        ('agendado', 'Agendado'),
        ('realizado', 'Realizado'),
        ('cancelado', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='calendario_sanitario')
    data_agendada = models.DateField()
    tipo_manejo = models.CharField(max_length=20, choices=Manejo.TIPO_CHOICES)
    animais_alvo = models.ManyToManyField(Animal, blank=True)
    lotes_alvo = models.ManyToManyField(Lote, blank=True)
    vacina = models.ForeignKey(
        Vacina, on_delete=models.SET_NULL, null=True, blank=True)
    medicamento = models.ForeignKey(
        Medicamento, on_delete=models.SET_NULL, null=True, blank=True)
    descricao = models.TextField()
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='agendado')
    manejo_realizado = models.ForeignKey(
        Manejo, on_delete=models.SET_NULL, null=True, blank=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'calendario_sanitario'
        verbose_name = 'Calendário Sanitário'
        verbose_name_plural = 'Calendários Sanitários'
        ordering = ['data_agendada']

    def __str__(self):
        return f"{self.get_tipo_manejo_display()} - {self.data_agendada}"


# ============================================================================
# FINANCEIRO
# ============================================================================

class ContaFinanceira(models.Model):
    """
    Contas financeiras da propriedade
    """
    TIPO_CHOICES = [
        ('conta_corrente', 'Conta Corrente'),
        ('poupanca', 'Poupança'),
        ('caixa', 'Caixa'),
        ('investimento', 'Investimento'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='contas_financeiras')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    banco = models.CharField(max_length=100, blank=True)
    agencia = models.CharField(max_length=20, blank=True)
    conta = models.CharField(max_length=20, blank=True)
    saldo_inicial = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    ativa = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contas_financeiras'
        verbose_name = 'Conta Financeira'
        verbose_name_plural = 'Contas Financeiras'
        ordering = ['propriedade', 'nome']

    def __str__(self):
        return f"{self.propriedade.nome} - {self.nome}"

    def get_saldo_atual(self):
        """Calcula o saldo atual da conta"""
        entradas = self.lancamentos_entrada.aggregate(
            total=models.Sum('valor'))['total'] or 0
        saidas = self.lancamentos_saida.aggregate(
            total=models.Sum('valor'))['total'] or 0
        return self.saldo_inicial + entradas - saidas


class CategoriaFinanceira(models.Model):
    """
    Categorias para classificação dos lançamentos financeiros
    """
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='categorias_financeiras')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    descricao = models.TextField(blank=True)
    ativa = models.BooleanField(default=True)

    class Meta:
        db_table = 'categorias_financeiras'
        verbose_name = 'Categoria Financeira'
        verbose_name_plural = 'Categorias Financeiras'
        ordering = ['tipo', 'nome']
        unique_together = ['propriedade', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"


class LancamentoFinanceiro(models.Model):
    """
    Lançamentos financeiros (entradas, saídas, transferências)
    """
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
        ('transferencia', 'Transferência'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='lancamentos_financeiros')
    data_lancamento = models.DateField()
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    valor = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    descricao = models.CharField(max_length=200)
    categoria = models.ForeignKey(
        CategoriaFinanceira, on_delete=models.SET_NULL, null=True, blank=True)

    # Contas envolvidas
    conta_origem = models.ForeignKey(
        ContaFinanceira, on_delete=models.CASCADE, related_name='lancamentos_saida')
    conta_destino = models.ForeignKey(
        ContaFinanceira, on_delete=models.SET_NULL, null=True, blank=True, related_name='lancamentos_entrada')

    # Relacionamentos com outras entidades
    manejo_relacionado = models.ForeignKey(
        Manejo, on_delete=models.SET_NULL, null=True, blank=True, related_name='lancamentos_financeiros')
    animal_relacionado = models.ForeignKey(
        Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='lancamentos_financeiros')

    # Metadados
    observacoes = models.TextField(blank=True)
    comprovante = models.FileField(
        upload_to='comprovantes/', blank=True, null=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lancamentos_financeiros'
        verbose_name = 'Lançamento Financeiro'
        verbose_name_plural = 'Lançamentos Financeiros'
        ordering = ['-data_lancamento']

    def __str__(self):
        return f"{self.get_tipo_display()} - R$ {self.valor} ({self.data_lancamento})"

    def clean(self):
        """Validações customizadas"""
        if self.tipo == 'transferencia' and not self.conta_destino:
            raise ValidationError('Transferências devem ter conta de destino')
        if self.tipo != 'transferencia' and self.conta_destino:
            raise ValidationError(
                'Apenas transferências podem ter conta de destino')


# ============================================================================
# RELATÓRIOS E DASHBOARDS
# ============================================================================

class RelatorioPersonalizado(models.Model):
    """
    Relatórios personalizados salvos pelo usuário
    """
    TIPO_CHOICES = [
        ('rebanho', 'Rebanho'),
        ('financeiro', 'Financeiro'),
        ('reproducao', 'Reprodução'),
        ('sanidade', 'Sanidade'),
        ('pastagem', 'Pastagem'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.ForeignKey(
        Propriedade, on_delete=models.CASCADE, related_name='relatorios')
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='relatorios')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    filtros = models.JSONField(help_text="Filtros aplicados ao relatório")
    colunas = models.JSONField(help_text="Colunas selecionadas para exibição")
    publico = models.BooleanField(
        default=False, help_text="Visível para outros usuários da propriedade")
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'relatorios_personalizados'
        verbose_name = 'Relatório Personalizado'
        verbose_name_plural = 'Relatórios Personalizados'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.get_tipo_display()}"


class ConfiguracaoSistema(models.Model):
    """
    Configurações gerais do sistema por propriedade
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    propriedade = models.OneToOneField(
        Propriedade, on_delete=models.CASCADE, related_name='configuracao')

    # Configurações de peso e medidas
    peso_ua_referencia = models.DecimalField(
        max_digits=6, decimal_places=2, default=450, help_text="Peso de referência para 1 UA em kg")
    dias_gmd_padrao = models.IntegerField(
        default=30, help_text="Período padrão para cálculo de GMD")

    # Configurações reprodutivas
    dias_diagnostico_gestacao = models.IntegerField(
        default=35, help_text="Dias após IA para diagnóstico")
    dias_gestacao = models.IntegerField(
        default=285, help_text="Período de gestação em dias")

    # Configurações de notificações
    notificar_calendario_sanitario = models.BooleanField(default=True)
    dias_antecedencia_notificacao = models.IntegerField(default=7)

    # Configurações financeiras
    moeda = models.CharField(max_length=10, default='BRL')

    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'configuracoes_sistema'
        verbose_name = 'Configuração do Sistema'
        verbose_name_plural = 'Configurações do Sistema'

    def __str__(self):
        return f"Configurações - {self.propriedade.nome}"
