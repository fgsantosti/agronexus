"""
AgroNexus - Sistema Fertili
Configuração do Django Admin
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import (AdministracaoMedicamento, Animal, AnimalManejo, Area,
                     CalendarioSanitario, CategoriaFinanceira,
                     ConfiguracaoSistema, ContaFinanceira, DiagnosticoGestacao,
                     EstacaoMonta, HistoricoLoteAnimal, HistoricoOcupacaoArea,
                     Inseminacao, LancamentoFinanceiro, Lote, Manejo,
                     Medicamento, Parto, Pesagem, Propriedade, ProtocoloIATF,
                     RelatorioPersonalizado, Usuario, Vacina, Vacinacao)


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """Admin para usuários com sistema de grupos"""
    list_display = ['username', 'email', 'first_name',
                    'last_name', 'get_perfil_display', 'ativo', 'date_joined']
    list_filter = ['ativo', 'date_joined', 'groups']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'cpf']
    ordering = ['username']

    def get_perfil_display(self, obj):
        """Exibe os grupos do usuário"""
        grupos = obj.groups.all()
        if grupos:
            return ', '.join([grupo.name for grupo in grupos])
        return 'Sem perfil'
    get_perfil_display.short_description = 'Perfil'

    fieldsets = UserAdmin.fieldsets + (
        ('Dados Adicionais', {
            'fields': ('telefone', 'cpf', 'data_nascimento', 'ativo')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dados Adicionais', {
            'fields': ('telefone', 'cpf', 'data_nascimento', 'ativo')
        }),
    )


@admin.register(Propriedade)
class PropriedadeAdmin(admin.ModelAdmin):
    """Admin para propriedades"""
    list_display = ['nome', 'proprietario', 'area_total_ha',
                    'get_total_animais', 'ativa', 'data_criacao']
    list_filter = ['ativa', 'data_criacao']
    search_fields = ['nome', 'proprietario__username',
                     'inscricao_estadual', 'cnpj_cpf']
    ordering = ['nome']
    readonly_fields = ['id', 'data_criacao']

    fieldsets = [
        ('Informações Básicas', {
            'fields': ('nome', 'proprietario', 'localizacao', 'area_total_ha')
        }),
        ('Documentação', {
            'fields': ('inscricao_estadual', 'cnpj_cpf')
        }),
        ('Localização', {
            'fields': ('coordenadas_gps',)
        }),
        ('Status', {
            'fields': ('ativa',)
        }),
        ('Metadados', {
            'fields': ('id', 'data_criacao'),
            'classes': ('collapse',)
        })
    ]

    def get_total_animais(self, obj):
        return obj.animais.filter(status='ativo').count()
    get_total_animais.short_description = 'Total Animais'


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    """Admin para áreas"""
    list_display = ['nome', 'propriedade', 'tipo',
                    'tamanho_ha', 'status', 'get_lote_atual']
    list_filter = ['tipo', 'status', 'propriedade']
    search_fields = ['nome', 'propriedade__nome', 'tipo_forragem']
    ordering = ['propriedade', 'nome']
    readonly_fields = ['id', 'data_criacao']

    def get_lote_atual(self, obj):
        lote = obj.get_lote_atual()
        if lote:
            url = reverse('admin:agronexus_lote_change', args=[lote.id])
            return format_html('<a href="{}">{}</a>', url, lote.nome)
        return '-'
    get_lote_atual.short_description = 'Lote Atual'


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    """Admin para animais"""
    list_display = ['identificacao_unica', 'nome_registro',
                    'propriedade', 'sexo', 'categoria', 'status', 'get_idade_meses']
    list_filter = ['sexo', 'categoria', 'status', 'propriedade', 'raca']
    search_fields = ['identificacao_unica',
                     'nome_registro', 'propriedade__nome']
    ordering = ['propriedade', 'identificacao_unica']
    readonly_fields = ['id', 'data_criacao',
                       'data_atualizacao', 'get_idade_dias', 'get_peso_atual']

    fieldsets = [
        ('Identificação', {
            'fields': ('identificacao_unica', 'nome_registro', 'propriedade')
        }),
        ('Características', {
            'fields': ('sexo', 'data_nascimento', 'raca', 'categoria', 'status')
        }),
        ('Genealogia', {
            'fields': ('pai', 'mae')
        }),
        ('Dados Comerciais', {
            'fields': ('data_compra', 'valor_compra', 'origem', 'data_venda', 'valor_venda', 'destino')
        }),
        ('Dados de Morte', {
            'fields': ('data_morte', 'causa_morte'),
            'classes': ('collapse',)
        }),
        ('Localização', {
            'fields': ('lote_atual',)
        }),
        ('Observações', {
            'fields': ('observacoes', 'fotos_evolucao')
        }),
        ('Metadados', {
            'fields': ('id', 'data_criacao', 'data_atualizacao', 'get_idade_dias', 'get_peso_atual'),
            'classes': ('collapse',)
        })
    ]

    def get_idade_meses(self, obj):
        return obj.get_idade_meses()
    get_idade_meses.short_description = 'Idade (meses)'

    def get_peso_atual(self, obj):
        peso = obj.get_peso_atual()
        return f"{peso} kg" if peso else '-'
    get_peso_atual.short_description = 'Peso Atual'


@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):
    """Admin para lotes"""
    list_display = ['nome', 'propriedade', 'get_total_animais',
                    'area_atual', 'ativo', 'data_criacao']
    list_filter = ['ativo', 'propriedade', 'data_criacao']
    search_fields = ['nome', 'propriedade__nome', 'descricao']
    ordering = ['propriedade', 'nome']
    readonly_fields = ['id', 'data_criacao',
                       'get_total_animais', 'get_total_ua']

    def get_total_animais(self, obj):
        return obj.get_total_animais()
    get_total_animais.short_description = 'Total Animais'

    def get_total_ua(self, obj):
        return f"{obj.get_total_ua():.2f}"
    get_total_ua.short_description = 'Total UA'


@admin.register(Manejo)
class ManejoAdmin(admin.ModelAdmin):
    """Admin para manejos"""
    list_display = ['tipo', 'data_manejo', 'propriedade',
                    'get_total_animais', 'custo_total', 'usuario']
    list_filter = ['tipo', 'data_manejo', 'propriedade', 'usuario']
    search_fields = ['observacoes', 'propriedade__nome']
    ordering = ['-data_manejo']
    readonly_fields = ['id', 'data_criacao', 'custo_total']

    def get_total_animais(self, obj):
        return obj.get_total_animais()
    get_total_animais.short_description = 'Total Animais'


@admin.register(Pesagem)
class PesagemAdmin(admin.ModelAdmin):
    """Admin para pesagens"""
    list_display = ['animal', 'peso_kg', 'data_pesagem', 'get_gmd_anterior']
    list_filter = ['data_pesagem', 'animal__propriedade']
    search_fields = ['animal__identificacao_unica', 'observacoes']
    ordering = ['-data_pesagem']
    readonly_fields = ['id', 'get_gmd_anterior']

    def get_gmd_anterior(self, obj):
        gmd = obj.get_gmd_anterior()
        return f"{gmd:.3f} kg/dia" if gmd else '-'
    get_gmd_anterior.short_description = 'GMD Anterior'


@admin.register(EstacaoMonta)
class EstacaoMontaAdmin(admin.ModelAdmin):
    """Admin para estações de monta"""
    list_display = ['nome', 'propriedade', 'data_inicio',
                    'data_fim', 'get_total_femeas', 'ativa']
    list_filter = ['ativa', 'propriedade', 'data_inicio']
    search_fields = ['nome', 'propriedade__nome']
    ordering = ['-data_inicio']
    readonly_fields = ['id', 'get_total_femeas', 'get_taxa_prenhez']

    def get_total_femeas(self, obj):
        return obj.get_total_femeas()
    get_total_femeas.short_description = 'Total Fêmeas'

    def get_taxa_prenhez(self, obj):
        return f"{obj.get_taxa_prenhez():.1f}%"
    get_taxa_prenhez.short_description = 'Taxa Prenhez'


@admin.register(ProtocoloIATF)
class ProtocoloIATFAdmin(admin.ModelAdmin):
    """Admin para protocolos IATF"""
    list_display = ['nome', 'propriedade',
                    'duracao_dias', 'ativo', 'data_criacao']
    list_filter = ['ativo', 'propriedade', 'duracao_dias']
    search_fields = ['nome', 'descricao']
    ordering = ['nome']
    readonly_fields = ['id', 'data_criacao']


@admin.register(Inseminacao)
class InseminacaoAdmin(admin.ModelAdmin):
    """Admin para inseminações"""
    list_display = ['animal', 'tipo', 'data_inseminacao',
                    'reprodutor', 'estacao_monta']
    list_filter = ['tipo', 'data_inseminacao', 'estacao_monta']
    search_fields = ['animal__identificacao_unica', 'semen_utilizado']
    ordering = ['-data_inseminacao']
    readonly_fields = ['id', 'get_data_diagnostico_prevista']

    def get_data_diagnostico_prevista(self, obj):
        return obj.get_data_diagnostico_prevista()
    get_data_diagnostico_prevista.short_description = 'Data Diagnóstico Prevista'


@admin.register(DiagnosticoGestacao)
class DiagnosticoGestacaoAdmin(admin.ModelAdmin):
    """Admin para diagnósticos de gestação"""
    list_display = ['get_animal', 'data_diagnostico', 'resultado', 'metodo']
    list_filter = ['resultado', 'data_diagnostico', 'metodo']
    search_fields = ['inseminacao__animal__identificacao_unica']
    ordering = ['-data_diagnostico']
    readonly_fields = ['id', 'get_data_parto_prevista']

    def get_animal(self, obj):
        return obj.inseminacao.animal
    get_animal.short_description = 'Animal'

    def get_data_parto_prevista(self, obj):
        return obj.get_data_parto_prevista()
    get_data_parto_prevista.short_description = 'Data Parto Prevista'


@admin.register(Parto)
class PartoAdmin(admin.ModelAdmin):
    """Admin para partos"""
    list_display = ['mae', 'data_parto', 'resultado',
                    'dificuldade', 'bezerro', 'peso_nascimento']
    list_filter = ['resultado', 'dificuldade', 'data_parto']
    search_fields = ['mae__identificacao_unica',
                     'bezerro__identificacao_unica']
    ordering = ['-data_parto']
    readonly_fields = ['id']


@admin.register(Vacina)
class VacinaAdmin(admin.ModelAdmin):
    """Admin para vacinas"""
    list_display = ['nome', 'fabricante', 'dose_ml',
                    'via_aplicacao', 'periodo_carencia_dias', 'ativa']
    list_filter = ['ativa', 'fabricante', 'via_aplicacao']
    search_fields = ['nome', 'fabricante', 'doencas_previne']
    ordering = ['nome']
    readonly_fields = ['id']


@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    """Admin para medicamentos"""
    list_display = ['nome', 'fabricante', 'tipo',
                    'principio_ativo', 'periodo_carencia_dias', 'ativo']
    list_filter = ['ativo', 'fabricante', 'tipo']
    search_fields = ['nome', 'fabricante', 'principio_ativo']
    ordering = ['nome']
    readonly_fields = ['id']


@admin.register(Vacinacao)
class VacinacaoAdmin(admin.ModelAdmin):
    """Admin para vacinações"""
    list_display = ['vacina', 'get_data_manejo',
                    'dose_aplicada', 'data_proxima_dose']
    list_filter = ['vacina', 'manejo__data_manejo']
    search_fields = ['vacina__nome', 'lote_vacina']
    ordering = ['-manejo__data_manejo']
    readonly_fields = ['id']

    def get_data_manejo(self, obj):
        return obj.manejo.data_manejo
    get_data_manejo.short_description = 'Data Manejo'


@admin.register(AdministracaoMedicamento)
class AdministracaoMedicamentoAdmin(admin.ModelAdmin):
    """Admin para administrações de medicamento"""
    list_display = ['medicamento', 'get_data_manejo',
                    'dosagem_aplicada', 'data_fim_carencia']
    list_filter = ['medicamento', 'manejo__data_manejo']
    search_fields = ['medicamento__nome', 'motivo_aplicacao']
    ordering = ['-manejo__data_manejo']
    readonly_fields = ['id', 'data_fim_carencia']

    def get_data_manejo(self, obj):
        return obj.manejo.data_manejo
    get_data_manejo.short_description = 'Data Manejo'


@admin.register(CalendarioSanitario)
class CalendarioSanitarioAdmin(admin.ModelAdmin):
    """Admin para calendário sanitário"""
    list_display = ['get_tipo_manejo_display',
                    'data_agendada', 'propriedade', 'status', 'usuario']
    list_filter = ['status', 'tipo_manejo', 'data_agendada', 'propriedade']
    search_fields = ['descricao', 'propriedade__nome']
    ordering = ['data_agendada']
    readonly_fields = ['id', 'data_criacao']


@admin.register(ContaFinanceira)
class ContaFinanceiraAdmin(admin.ModelAdmin):
    """Admin para contas financeiras"""
    list_display = ['nome', 'propriedade', 'tipo',
                    'banco', 'get_saldo_atual', 'ativa']
    list_filter = ['tipo', 'ativa', 'propriedade']
    search_fields = ['nome', 'banco', 'agencia', 'conta']
    ordering = ['propriedade', 'nome']
    readonly_fields = ['id', 'data_criacao', 'get_saldo_atual']

    def get_saldo_atual(self, obj):
        return f"R$ {obj.get_saldo_atual():,.2f}"
    get_saldo_atual.short_description = 'Saldo Atual'


@admin.register(CategoriaFinanceira)
class CategoriaFinanceiraAdmin(admin.ModelAdmin):
    """Admin para categorias financeiras"""
    list_display = ['nome', 'propriedade', 'tipo', 'ativa']
    list_filter = ['tipo', 'ativa', 'propriedade']
    search_fields = ['nome', 'descricao']
    ordering = ['propriedade', 'tipo', 'nome']
    readonly_fields = ['id']


@admin.register(LancamentoFinanceiro)
class LancamentoFinanceiroAdmin(admin.ModelAdmin):
    """Admin para lançamentos financeiros"""
    list_display = ['data_lancamento', 'tipo', 'valor',
                    'descricao', 'categoria', 'conta_origem', 'usuario']
    list_filter = ['tipo', 'data_lancamento', 'categoria', 'propriedade']
    search_fields = ['descricao', 'observacoes']
    ordering = ['-data_lancamento']
    readonly_fields = ['id', 'data_criacao']


@admin.register(RelatorioPersonalizado)
class RelatorioPersonalizadoAdmin(admin.ModelAdmin):
    """Admin para relatórios personalizados"""
    list_display = ['nome', 'propriedade',
                    'usuario', 'tipo', 'publico', 'data_criacao']
    list_filter = ['tipo', 'publico', 'propriedade', 'usuario']
    search_fields = ['nome', 'propriedade__nome']
    ordering = ['-data_criacao']
    readonly_fields = ['id', 'data_criacao', 'data_atualizacao']


@admin.register(ConfiguracaoSistema)
class ConfiguracaoSistemaAdmin(admin.ModelAdmin):
    """Admin para configurações do sistema"""
    list_display = ['propriedade', 'peso_ua_referencia',
                    'dias_gmd_padrao', 'moeda']
    list_filter = ['propriedade', 'moeda']
    search_fields = ['propriedade__nome']
    ordering = ['propriedade']
    readonly_fields = ['id', 'data_criacao', 'data_atualizacao']


# Inline admins para relacionamentos
class AnimalInline(admin.TabularInline):
    model = Animal
    extra = 0
    fields = ['identificacao_unica', 'nome_registro',
              'sexo', 'categoria', 'status']
    readonly_fields = ['identificacao_unica']


class AreaInline(admin.TabularInline):
    model = Area
    extra = 0
    fields = ['nome', 'tipo', 'tamanho_ha', 'status']


class LoteInline(admin.TabularInline):
    model = Lote
    extra = 0
    fields = ['nome', 'descricao', 'ativo']


# Adiciona inlines aos admins principais
PropriedadeAdmin.inlines = [AreaInline, LoteInline]
LoteAdmin.inlines = [AnimalInline]

# Customização do admin site
admin.site.site_header = 'AgroNexus - Sistema Fertili'
admin.site.site_title = 'AgroNexus Admin'
admin.site.index_title = 'Administração do Sistema'
