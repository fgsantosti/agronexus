"""
AgroNexus - Sistema Fertili
Filtros para API REST
"""

import django_filters
from django import forms
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from ..models import (
    Propriedade, Area, Animal, Lote, Manejo, Pesagem, EstacaoMonta,
    ProtocoloIATF, Inseminacao, DiagnosticoGestacao, Parto, Vacina,
    Medicamento, Vacinacao, CalendarioSanitario, LancamentoFinanceiro,
    CategoriaFinanceira, ContaFinanceira
)


class PropriedadeFilter(django_filters.FilterSet):
    """Filtro para propriedades"""
    nome = django_filters.CharFilter(lookup_expr='icontains')
    area_total_min = django_filters.NumberFilter(field_name='area_total_ha', lookup_expr='gte')
    area_total_max = django_filters.NumberFilter(field_name='area_total_ha', lookup_expr='lte')
    ativa = django_filters.BooleanFilter()
    
    class Meta:
        model = Propriedade
        fields = ['nome', 'ativa']


class AreaFilter(django_filters.FilterSet):
    """Filtro para áreas"""
    nome = django_filters.CharFilter(lookup_expr='icontains')
    tipo = django_filters.ChoiceFilter(choices=Area.TIPO_CHOICES)
    status = django_filters.ChoiceFilter(choices=Area.STATUS_CHOICES)
    tamanho_min = django_filters.NumberFilter(field_name='tamanho_ha', lookup_expr='gte')
    tamanho_max = django_filters.NumberFilter(field_name='tamanho_ha', lookup_expr='lte')
    tipo_forragem = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Area
        fields = ['propriedade', 'tipo', 'status']


class AnimalFilter(django_filters.FilterSet):
    """Filtro para animais"""
    identificacao = django_filters.CharFilter(field_name='identificacao_unica', lookup_expr='icontains')
    nome = django_filters.CharFilter(field_name='nome_registro', lookup_expr='icontains')
    sexo = django_filters.ChoiceFilter(choices=Animal.SEXO_CHOICES)
    categoria = django_filters.ChoiceFilter(choices=Animal.CATEGORIA_CHOICES)
    status = django_filters.ChoiceFilter(choices=Animal.STATUS_CHOICES)
    raca = django_filters.CharFilter(lookup_expr='icontains')
    
    # Filtros por idade
    idade_min_meses = django_filters.NumberFilter(method='filter_idade_min_meses')
    idade_max_meses = django_filters.NumberFilter(method='filter_idade_max_meses')
    
    # Filtros por data
    nascimento_inicio = django_filters.DateFilter(field_name='data_nascimento', lookup_expr='gte')
    nascimento_fim = django_filters.DateFilter(field_name='data_nascimento', lookup_expr='lte')
    
    # Filtros por valor
    valor_compra_min = django_filters.NumberFilter(field_name='valor_compra', lookup_expr='gte')
    valor_compra_max = django_filters.NumberFilter(field_name='valor_compra', lookup_expr='lte')
    
    # Filtros relacionados
    lote = django_filters.ModelChoiceFilter(field_name='lote_atual', queryset=Lote.objects.all())
    sem_lote = django_filters.BooleanFilter(method='filter_sem_lote')
    
    class Meta:
        model = Animal
        fields = ['propriedade', 'sexo', 'categoria', 'status', 'lote_atual']
    
    def filter_idade_min_meses(self, queryset, name, value):
        """Filtra animais com idade mínima em meses"""
        if value is not None:
            data_limite = timezone.now().date() - timedelta(days=value * 30)
            return queryset.filter(data_nascimento__lte=data_limite)
        return queryset
    
    def filter_idade_max_meses(self, queryset, name, value):
        """Filtra animais com idade máxima em meses"""
        if value is not None:
            data_limite = timezone.now().date() - timedelta(days=value * 30)
            return queryset.filter(data_nascimento__gte=data_limite)
        return queryset
    
    def filter_sem_lote(self, queryset, name, value):
        """Filtra animais sem lote"""
        if value:
            return queryset.filter(lote_atual__isnull=True)
        return queryset


class LoteFilter(django_filters.FilterSet):
    """Filtro para lotes"""
    nome = django_filters.CharFilter(lookup_expr='icontains')
    descricao = django_filters.CharFilter(lookup_expr='icontains')
    criterio = django_filters.CharFilter(field_name='criterio_agrupamento', lookup_expr='icontains')
    ativo = django_filters.BooleanFilter()
    area = django_filters.ModelChoiceFilter(field_name='area_atual', queryset=Area.objects.all())
    sem_area = django_filters.BooleanFilter(method='filter_sem_area')
    
    class Meta:
        model = Lote
        fields = ['propriedade', 'ativo', 'area_atual']
    
    def filter_sem_area(self, queryset, name, value):
        """Filtra lotes sem área"""
        if value:
            return queryset.filter(area_atual__isnull=True)
        return queryset


class ManejoFilter(django_filters.FilterSet):
    """Filtro para manejos"""
    tipo = django_filters.ChoiceFilter(choices=Manejo.TIPO_CHOICES)
    data_inicio = django_filters.DateFilter(field_name='data_manejo', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_manejo', lookup_expr='lte')
    
    # Filtros por custo
    custo_min = django_filters.NumberFilter(field_name='custo_total', lookup_expr='gte')
    custo_max = django_filters.NumberFilter(field_name='custo_total', lookup_expr='lte')
    
    # Filtros relacionados
    lote = django_filters.ModelChoiceFilter(queryset=Lote.objects.all())
    usuario = django_filters.CharFilter(field_name='usuario__username', lookup_expr='icontains')
    
    class Meta:
        model = Manejo
        fields = ['propriedade', 'tipo', 'lote', 'usuario']


class PesagemFilter(django_filters.FilterSet):
    """Filtro para pesagens"""
    data_inicio = django_filters.DateFilter(field_name='data_pesagem', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_pesagem', lookup_expr='lte')
    
    # Filtros por peso
    peso_min = django_filters.NumberFilter(field_name='peso_kg', lookup_expr='gte')
    peso_max = django_filters.NumberFilter(field_name='peso_kg', lookup_expr='lte')
    
    # Filtros relacionados
    animal = django_filters.ModelChoiceFilter(queryset=Animal.objects.all())
    equipamento = django_filters.CharFilter(field_name='equipamento_usado', lookup_expr='icontains')
    
    class Meta:
        model = Pesagem
        fields = ['animal', 'data_pesagem']


class EstacaoMontaFilter(django_filters.FilterSet):
    """Filtro para estações de monta"""
    nome = django_filters.CharFilter(lookup_expr='icontains')
    ativa = django_filters.BooleanFilter()
    
    # Filtros por data
    inicio_periodo = django_filters.DateFilter(field_name='data_inicio', lookup_expr='gte')
    fim_periodo = django_filters.DateFilter(field_name='data_fim', lookup_expr='lte')
    
    # Filtro por período atual
    periodo_atual = django_filters.BooleanFilter(method='filter_periodo_atual')
    
    class Meta:
        model = EstacaoMonta
        fields = ['propriedade', 'ativa']
    
    def filter_periodo_atual(self, queryset, name, value):
        """Filtra estações de monta ativas no período atual"""
        if value:
            hoje = timezone.now().date()
            return queryset.filter(
                data_inicio__lte=hoje,
                data_fim__gte=hoje
            )
        return queryset


class InseminacaoFilter(django_filters.FilterSet):
    """Filtro para inseminações"""
    tipo = django_filters.ChoiceFilter(choices=Inseminacao.TIPO_CHOICES)
    data_inicio = django_filters.DateFilter(field_name='data_inseminacao', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_inseminacao', lookup_expr='lte')
    
    # Filtros relacionados
    animal = django_filters.ModelChoiceFilter(queryset=Animal.objects.all())
    reprodutor = django_filters.ModelChoiceFilter(queryset=Animal.objects.all())
    estacao_monta = django_filters.ModelChoiceFilter(queryset=EstacaoMonta.objects.all())
    protocolo_iatf = django_filters.ModelChoiceFilter(queryset=ProtocoloIATF.objects.all())
    
    # Filtro por sêmen
    semen = django_filters.CharFilter(field_name='semen_utilizado', lookup_expr='icontains')
    
    class Meta:
        model = Inseminacao
        fields = ['animal', 'tipo', 'reprodutor', 'estacao_monta', 'protocolo_iatf']


class DiagnosticoGestacaoFilter(django_filters.FilterSet):
    """Filtro para diagnósticos de gestação"""
    resultado = django_filters.ChoiceFilter(choices=DiagnosticoGestacao.RESULTADO_CHOICES)
    data_inicio = django_filters.DateFilter(field_name='data_diagnostico', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_diagnostico', lookup_expr='lte')
    metodo = django_filters.CharFilter(lookup_expr='icontains')
    
    # Filtros relacionados
    animal = django_filters.ModelChoiceFilter(field_name='inseminacao__animal', queryset=Animal.objects.all())
    estacao_monta = django_filters.ModelChoiceFilter(field_name='inseminacao__estacao_monta', queryset=EstacaoMonta.objects.all())
    
    class Meta:
        model = DiagnosticoGestacao
        fields = ['resultado', 'metodo']


class PartoFilter(django_filters.FilterSet):
    """Filtro para partos"""
    resultado = django_filters.ChoiceFilter(choices=Parto.RESULTADO_CHOICES)
    dificuldade = django_filters.ChoiceFilter(choices=Parto.DIFICULDADE_CHOICES)
    data_inicio = django_filters.DateFilter(field_name='data_parto', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_parto', lookup_expr='lte')
    
    # Filtros por peso
    peso_min = django_filters.NumberFilter(field_name='peso_nascimento', lookup_expr='gte')
    peso_max = django_filters.NumberFilter(field_name='peso_nascimento', lookup_expr='lte')
    
    # Filtros relacionados
    mae = django_filters.ModelChoiceFilter(queryset=Animal.objects.all())
    bezerro = django_filters.ModelChoiceFilter(queryset=Animal.objects.all())
    
    class Meta:
        model = Parto
        fields = ['mae', 'resultado', 'dificuldade', 'bezerro']


class VacinacaoFilter(django_filters.FilterSet):
    """Filtro para vacinações"""
    data_inicio = django_filters.DateFilter(field_name='manejo__data_manejo', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='manejo__data_manejo', lookup_expr='lte')
    
    # Filtros relacionados
    vacina = django_filters.ModelChoiceFilter(queryset=Vacina.objects.all())
    lote_vacina = django_filters.CharFilter(lookup_expr='icontains')
    
    # Filtro por próxima dose
    proxima_dose = django_filters.DateFilter(field_name='data_proxima_dose', lookup_expr='lte')
    
    class Meta:
        model = Vacinacao
        fields = ['vacina', 'lote_vacina']


class CalendarioSanitarioFilter(django_filters.FilterSet):
    """Filtro para calendário sanitário"""
    status = django_filters.ChoiceFilter(choices=CalendarioSanitario.STATUS_CHOICES)
    tipo_manejo = django_filters.ChoiceFilter(choices=Manejo.TIPO_CHOICES)
    
    # Filtros por data
    data_inicio = django_filters.DateFilter(field_name='data_agendada', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_agendada', lookup_expr='lte')
    
    # Filtros relacionados
    vacina = django_filters.ModelChoiceFilter(queryset=Vacina.objects.all())
    medicamento = django_filters.ModelChoiceFilter(queryset=Medicamento.objects.all())
    
    # Filtros especiais
    vencimentos_proximos = django_filters.NumberFilter(method='filter_vencimentos_proximos')
    
    class Meta:
        model = CalendarioSanitario
        fields = ['propriedade', 'status', 'tipo_manejo', 'vacina', 'medicamento']
    
    def filter_vencimentos_proximos(self, queryset, name, value):
        """Filtra itens que vencem nos próximos X dias"""
        if value is not None:
            data_limite = timezone.now().date() + timedelta(days=value)
            return queryset.filter(
                data_agendada__lte=data_limite,
                status='agendado'
            )
        return queryset


class LancamentoFinanceiroFilter(django_filters.FilterSet):
    """Filtro para lançamentos financeiros"""
    tipo = django_filters.ChoiceFilter(choices=LancamentoFinanceiro.TIPO_CHOICES)
    data_inicio = django_filters.DateFilter(field_name='data_lancamento', lookup_expr='gte')
    data_fim = django_filters.DateFilter(field_name='data_lancamento', lookup_expr='lte')
    
    # Filtros por valor
    valor_min = django_filters.NumberFilter(field_name='valor', lookup_expr='gte')
    valor_max = django_filters.NumberFilter(field_name='valor', lookup_expr='lte')
    
    # Filtros relacionados
    categoria = django_filters.ModelChoiceFilter(queryset=CategoriaFinanceira.objects.all())
    conta_origem = django_filters.ModelChoiceFilter(queryset=ContaFinanceira.objects.all())
    conta_destino = django_filters.ModelChoiceFilter(queryset=ContaFinanceira.objects.all())
    
    # Filtros de texto
    descricao = django_filters.CharFilter(lookup_expr='icontains')
    observacoes = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = LancamentoFinanceiro
        fields = ['propriedade', 'tipo', 'categoria', 'conta_origem', 'conta_destino']


# Filtros personalizados para relatórios
class RelatorioRebanhoFilter(django_filters.FilterSet):
    """Filtro especializado para relatórios de rebanho"""
    # Filtros básicos
    propriedade = django_filters.ModelChoiceFilter(queryset=Propriedade.objects.all())
    sexo = django_filters.ChoiceFilter(choices=Animal.SEXO_CHOICES)
    categoria = django_filters.ChoiceFilter(choices=Animal.CATEGORIA_CHOICES)
    status = django_filters.ChoiceFilter(choices=Animal.STATUS_CHOICES)
    
    # Filtros por idade
    idade_min = django_filters.NumberFilter(method='filter_idade_min')
    idade_max = django_filters.NumberFilter(method='filter_idade_max')
    
    # Filtros por peso
    peso_min = django_filters.NumberFilter(method='filter_peso_min')
    peso_max = django_filters.NumberFilter(method='filter_peso_max')
    
    # Filtros por GMD
    gmd_min = django_filters.NumberFilter(method='filter_gmd_min')
    gmd_max = django_filters.NumberFilter(method='filter_gmd_max')
    
    # Filtros por localização
    lote = django_filters.ModelChoiceFilter(field_name='lote_atual', queryset=Lote.objects.all())
    area = django_filters.ModelChoiceFilter(field_name='lote_atual__area_atual', queryset=Area.objects.all())
    
    class Meta:
        model = Animal
        fields = ['propriedade', 'sexo', 'categoria', 'status', 'lote_atual']
    
    def filter_idade_min(self, queryset, name, value):
        """Filtra por idade mínima em meses"""
        if value is not None:
            data_limite = timezone.now().date() - timedelta(days=value * 30)
            return queryset.filter(data_nascimento__lte=data_limite)
        return queryset
    
    def filter_idade_max(self, queryset, name, value):
        """Filtra por idade máxima em meses"""
        if value is not None:
            data_limite = timezone.now().date() - timedelta(days=value * 30)
            return queryset.filter(data_nascimento__gte=data_limite)
        return queryset
    
    def filter_peso_min(self, queryset, name, value):
        """Filtra por peso mínimo"""
        if value is not None:
            # Filtra animais com peso atual >= value
            animais_com_peso = []
            for animal in queryset:
                peso_atual = animal.get_peso_atual()
                if peso_atual and peso_atual >= value:
                    animais_com_peso.append(animal.id)
            return queryset.filter(id__in=animais_com_peso)
        return queryset
    
    def filter_peso_max(self, queryset, name, value):
        """Filtra por peso máximo"""
        if value is not None:
            # Filtra animais com peso atual <= value
            animais_com_peso = []
            for animal in queryset:
                peso_atual = animal.get_peso_atual()
                if peso_atual and peso_atual <= value:
                    animais_com_peso.append(animal.id)
            return queryset.filter(id__in=animais_com_peso)
        return queryset
    
    def filter_gmd_min(self, queryset, name, value):
        """Filtra por GMD mínimo"""
        if value is not None:
            animais_com_gmd = []
            for animal in queryset:
                gmd = animal.get_gmd_periodo()
                if gmd and gmd >= value:
                    animais_com_gmd.append(animal.id)
            return queryset.filter(id__in=animais_com_gmd)
        return queryset
    
    def filter_gmd_max(self, queryset, name, value):
        """Filtra por GMD máximo"""
        if value is not None:
            animais_com_gmd = []
            for animal in queryset:
                gmd = animal.get_gmd_periodo()
                if gmd and gmd <= value:
                    animais_com_gmd.append(animal.id)
            return queryset.filter(id__in=animais_com_gmd)
        return queryset
