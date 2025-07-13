"""
AgroNexus - Sistema 
Serializers para API REST
"""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator

from ...models import (AdministracaoMedicamento, Animal, AnimalManejo, Area,
                       CalendarioSanitario, CategoriaFinanceira,
                       ConfiguracaoSistema, ContaFinanceira,
                       DiagnosticoGestacao, EspecieAnimal, EstacaoMonta, HistoricoLoteAnimal,
                       HistoricoOcupacaoArea, Inseminacao,
                       LancamentoFinanceiro, Lote, Manejo, Medicamento, Parto,
                       Pesagem, Propriedade, ProtocoloIATF, RacaAnimal,
                       RelatorioPersonalizado, Usuario, Vacina, Vacinacao)

# ============================================================================
# SERIALIZERS DE USUÁRIOS E AUTENTICAÇÃO
# ============================================================================


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para usuários com sistema de grupos"""
    password = serializers.CharField(
        write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    grupos = serializers.SerializerMethodField()
    perfil = serializers.CharField(source='perfil_principal', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm',
            'telefone', 'cpf', 'data_nascimento', 'ativo', 'date_joined', 'data_criacao',
            'grupos', 'perfil'
        ]
        read_only_fields = ['id', 'date_joined', 'data_criacao']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def get_grupos(self, obj):
        """Retorna os grupos do usuário"""
        return [grupo.name for grupo in obj.groups.all()]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de usuários com grupo"""
    password = serializers.CharField(
        write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    grupo = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm',
            'telefone', 'cpf', 'data_nascimento', 'ativo', 'grupo'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_grupo(self, value):
        """Valida se o grupo existe"""
        from django.contrib.auth.models import Group
        if not Group.objects.filter(name=value).exists():
            raise serializers.ValidationError(f'Grupo "{value}" não existe.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        grupo_nome = validated_data.pop('grupo')
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Adicionar ao grupo
        user.add_perfil(grupo_nome)

        return user


class UsuarioResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para usuários"""
    nome_completo = serializers.CharField(
        source='get_full_name', read_only=True)
    perfil = serializers.CharField(source='perfil_principal', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nome_completo', 'perfil', 'ativo']


# ============================================================================
# SERIALIZERS DE PROPRIEDADES E ÁREAS
# ============================================================================

class PropriedadeSerializer(serializers.ModelSerializer):
    """Serializer para propriedades"""
    proprietario = UsuarioResumoSerializer(read_only=True)
    area_ocupada = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True)
    taxa_ocupacao_global = serializers.DecimalField(
        max_digits=8, decimal_places=4, read_only=True)
    total_animais = serializers.IntegerField(read_only=True)
    total_lotes = serializers.IntegerField(read_only=True)
    total_areas = serializers.IntegerField(read_only=True)

    class Meta:
        model = Propriedade
        fields = [
            'id', 'nome', 'proprietario', 'localizacao', 'area_total_ha', 'coordenadas_gps',
            'inscricao_estadual', 'cnpj_cpf', 'ativa', 'data_criacao', 'area_ocupada',
            'taxa_ocupacao_global', 'total_animais', 'total_lotes', 'total_areas'
        ]
        read_only_fields = ['id', 'data_criacao']


class PropriedadeResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para propriedades"""

    class Meta:
        model = Propriedade
        fields = ['id', 'nome', 'area_total_ha', 'ativa']


class AreaSerializer(serializers.ModelSerializer):
    """Serializer para áreas"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    lote_atual = serializers.StringRelatedField(read_only=True)
    taxa_ocupacao_atual = serializers.DecimalField(
        max_digits=8, decimal_places=4, read_only=True)
    periodo_ocupacao_atual = serializers.IntegerField(read_only=True)

    class Meta:
        model = Area
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'tipo', 'tamanho_ha', 'tipo_forragem',
            'status', 'coordenadas_poligono', 'observacoes', 'data_criacao', 'lote_atual',
            'taxa_ocupacao_atual', 'periodo_ocupacao_atual'
        ]
        read_only_fields = ['id', 'data_criacao']
        validators = [
            UniqueTogetherValidator(
                queryset=Area.objects.all(),
                fields=['propriedade_id', 'nome']
            )
        ]


class AreaResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para áreas"""

    class Meta:
        model = Area
        fields = ['id', 'nome', 'tipo', 'tamanho_ha', 'status']


# ============================================================================
# SERIALIZERS DE ESPÉCIES E RAÇAS
# ============================================================================

class EspecieAnimalSerializer(serializers.ModelSerializer):
    """Serializer para espécies de animais"""
    total_animais = serializers.SerializerMethodField()
    total_racas = serializers.SerializerMethodField()
    categorias_disponiveis = serializers.SerializerMethodField()

    class Meta:
        model = EspecieAnimal
        fields = [
            'id', 'nome', 'nome_display', 'peso_ua_referencia', 
            'periodo_gestacao_dias', 'idade_primeira_cobertura_meses',
            'ativo', 'data_criacao', 'data_atualizacao',
            'total_animais', 'total_racas', 'categorias_disponiveis'
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']

    def get_total_animais(self, obj):
        """Retorna o total de animais desta espécie"""
        return obj.animais.filter(status='ativo').count()

    def get_total_racas(self, obj):
        """Retorna o total de raças desta espécie"""
        return obj.racas.filter(ativo=True).count()

    def get_categorias_disponiveis(self, obj):
        """Retorna as categorias disponíveis para esta espécie"""
        return obj.get_categorias()


class RacaAnimalSerializer(serializers.ModelSerializer):
    """Serializer para raças de animais"""
    especie = EspecieAnimalSerializer(read_only=True)
    especie_id = serializers.UUIDField(write_only=True)
    total_animais = serializers.SerializerMethodField()

    class Meta:
        model = RacaAnimal
        fields = [
            'id', 'especie', 'especie_id', 'nome', 'origem', 
            'caracteristicas', 'peso_medio_adulto_kg', 'ativo',
            'data_criacao', 'data_atualizacao', 'total_animais'
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']

    def get_total_animais(self, obj):
        """Retorna o total de animais desta raça"""
        return obj.animais.filter(status='ativo').count()


class RacaAnimalResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para raças de animais"""
    
    class Meta:
        model = RacaAnimal
        fields = ['id', 'nome', 'especie']


# ============================================================================
# SERIALIZERS DE ANIMAIS E LOTES
# ============================================================================

class AnimalSerializer(serializers.ModelSerializer):
    """Serializer para animais"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    especie = EspecieAnimalSerializer(read_only=True)
    especie_id = serializers.UUIDField(write_only=True)
    raca = RacaAnimalResumoSerializer(read_only=True)
    raca_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    lote_atual = serializers.StringRelatedField(read_only=True)
    lote_atual_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    pai = serializers.StringRelatedField(read_only=True)
    mae = serializers.StringRelatedField(read_only=True)
    idade_dias = serializers.IntegerField(read_only=True)
    idade_meses = serializers.IntegerField(read_only=True)
    peso_atual = serializers.DecimalField(
        max_digits=6, decimal_places=2, read_only=True)
    ua_value = serializers.DecimalField(
        max_digits=8, decimal_places=4, read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'propriedade', 'propriedade_id', 'identificacao_unica', 'nome_registro',
            'sexo', 'data_nascimento', 'especie', 'especie_id', 'raca', 'raca_id', 
            'categoria', 'status', 'pai', 'mae', 'data_compra', 'valor_compra', 'origem', 
            'data_venda', 'valor_venda', 'destino', 'data_morte', 'causa_morte', 
            'lote_atual', 'lote_atual_id', 'fotos_evolucao', 'observacoes', 
            'data_criacao', 'data_atualizacao', 'idade_dias', 'idade_meses',
            'peso_atual', 'ua_value'
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']
        validators = [
            UniqueTogetherValidator(
                queryset=Animal.objects.all(),
                fields=['propriedade_id', 'identificacao_unica']
            )
        ]


class AnimalResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para animais"""
    especie_nome = serializers.CharField(source='especie.nome_display', read_only=True)
    raca_nome = serializers.CharField(source='raca.nome', read_only=True)
    idade_meses = serializers.IntegerField(read_only=True)
    peso_atual = serializers.DecimalField(
        max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'identificacao_unica', 'nome_registro', 'sexo', 'categoria', 
            'especie_nome', 'raca_nome', 'idade_meses', 'peso_atual', 'status'
        ]


class LoteSerializer(serializers.ModelSerializer):
    """Serializer para lotes"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    area_atual = AreaResumoSerializer(read_only=True)
    area_atual_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    total_animais = serializers.IntegerField(read_only=True)
    total_ua = serializers.DecimalField(
        max_digits=8, decimal_places=4, read_only=True)
    peso_medio = serializers.DecimalField(
        max_digits=6, decimal_places=2, read_only=True)
    gmd_medio = serializers.DecimalField(
        max_digits=5, decimal_places=3, read_only=True)

    class Meta:
        model = Lote
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'descricao', 'criterio_agrupamento',
            'area_atual', 'area_atual_id', 'ativo', 'data_criacao', 'total_animais', 'total_ua',
            'peso_medio', 'gmd_medio'
        ]
        read_only_fields = ['id', 'data_criacao']
        validators = [
            UniqueTogetherValidator(
                queryset=Lote.objects.all(),
                fields=['propriedade_id', 'nome']
            )
        ]


class LoteResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para lotes"""
    total_animais = serializers.IntegerField(read_only=True)

    class Meta:
        model = Lote
        fields = ['id', 'nome', 'total_animais', 'ativo']


# ============================================================================
# SERIALIZERS DE MANEJOS
# ============================================================================

class ManejoSerializer(serializers.ModelSerializer):
    """Serializer para manejos"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    animais = AnimalResumoSerializer(many=True, read_only=True)
    animais_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    lote = LoteResumoSerializer(read_only=True)
    lote_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    usuario = UsuarioResumoSerializer(read_only=True)
    total_animais = serializers.IntegerField(read_only=True)

    class Meta:
        model = Manejo
        fields = [
            'id', 'propriedade', 'propriedade_id', 'tipo', 'data_manejo', 'animais', 'animais_ids',
            'lote', 'lote_id', 'custo_material', 'custo_pessoal', 'custo_total', 'observacoes',
            'usuario', 'data_criacao', 'total_animais'
        ]
        read_only_fields = ['id', 'custo_total', 'data_criacao']


class PesagemSerializer(serializers.ModelSerializer):
    """Serializer para pesagens"""
    animal = AnimalResumoSerializer(read_only=True)
    animal_id = serializers.UUIDField(write_only=True)
    manejo = ManejoSerializer(read_only=True)
    gmd_anterior = serializers.DecimalField(
        max_digits=5, decimal_places=3, read_only=True)

    class Meta:
        model = Pesagem
        fields = [
            'id', 'animal', 'animal_id', 'manejo', 'peso_kg', 'data_pesagem',
            'equipamento_usado', 'observacoes', 'gmd_anterior'
        ]
        read_only_fields = ['id']


# ============================================================================
# SERIALIZERS DE REPRODUÇÃO
# ============================================================================

class EstacaoMontaSerializer(serializers.ModelSerializer):
    """Serializer para estações de monta"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    lotes_participantes = LoteResumoSerializer(many=True, read_only=True)
    lotes_participantes_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    total_femeas = serializers.IntegerField(read_only=True)
    taxa_prenhez = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = EstacaoMonta
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'data_inicio', 'data_fim',
            'lotes_participantes', 'lotes_participantes_ids', 'observacoes', 'ativa',
            'total_femeas', 'taxa_prenhez'
        ]
        read_only_fields = ['id']


class ProtocoloIATFSerializer(serializers.ModelSerializer):
    """Serializer para protocolos IATF"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ProtocoloIATF
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'descricao', 'duracao_dias',
            'passos_protocolo', 'ativo', 'data_criacao'
        ]
        read_only_fields = ['id', 'data_criacao']


class InseminacaoSerializer(serializers.ModelSerializer):
    """Serializer para inseminações"""
    animal = AnimalResumoSerializer(read_only=True)
    animal_id = serializers.UUIDField(write_only=True)
    manejo = ManejoSerializer(read_only=True)
    reprodutor = AnimalResumoSerializer(read_only=True)
    reprodutor_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    protocolo_iatf = ProtocoloIATFSerializer(read_only=True)
    protocolo_iatf_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    estacao_monta = EstacaoMontaSerializer(read_only=True)
    estacao_monta_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    data_diagnostico_prevista = serializers.DateField(read_only=True)

    class Meta:
        model = Inseminacao
        fields = [
            'id', 'animal', 'animal_id', 'manejo', 'data_inseminacao', 'tipo',
            'reprodutor', 'reprodutor_id', 'semen_utilizado', 'protocolo_iatf',
            'protocolo_iatf_id', 'estacao_monta', 'estacao_monta_id', 'observacoes',
            'data_diagnostico_prevista'
        ]
        read_only_fields = ['id']


class DiagnosticoGestacaoSerializer(serializers.ModelSerializer):
    """Serializer para diagnósticos de gestação"""
    inseminacao = InseminacaoSerializer(read_only=True)
    inseminacao_id = serializers.UUIDField(write_only=True)
    manejo = ManejoSerializer(read_only=True)
    data_parto_prevista = serializers.DateField(read_only=True)

    class Meta:
        model = DiagnosticoGestacao
        fields = [
            'id', 'inseminacao', 'inseminacao_id', 'manejo', 'data_diagnostico',
            'resultado', 'metodo', 'observacoes', 'data_parto_prevista'
        ]
        read_only_fields = ['id']


class PartoSerializer(serializers.ModelSerializer):
    """Serializer para partos"""
    mae = AnimalResumoSerializer(read_only=True)
    mae_id = serializers.UUIDField(write_only=True)
    manejo = ManejoSerializer(read_only=True)
    bezerro = AnimalResumoSerializer(read_only=True)
    bezerro_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)

    class Meta:
        model = Parto
        fields = [
            'id', 'mae', 'mae_id', 'manejo', 'data_parto', 'resultado', 'dificuldade',
            'bezerro', 'bezerro_id', 'peso_nascimento', 'observacoes'
        ]
        read_only_fields = ['id']


# ============================================================================
# SERIALIZERS DE SANIDADE
# ============================================================================

class VacinaSerializer(serializers.ModelSerializer):
    """Serializer para vacinas"""

    class Meta:
        model = Vacina
        fields = [
            'id', 'nome', 'fabricante', 'doencas_previne', 'dose_ml', 'via_aplicacao',
            'intervalo_doses_dias', 'periodo_carencia_dias', 'ativa'
        ]
        read_only_fields = ['id']


class MedicamentoSerializer(serializers.ModelSerializer):
    """Serializer para medicamentos"""

    class Meta:
        model = Medicamento
        fields = [
            'id', 'nome', 'fabricante', 'tipo', 'principio_ativo', 'concentracao',
            'via_aplicacao', 'dosagem_padrao', 'periodo_carencia_dias', 'ativo'
        ]
        read_only_fields = ['id']


class VacinacaoSerializer(serializers.ModelSerializer):
    """Serializer para vacinações"""
    manejo = ManejoSerializer(read_only=True)
    vacina = VacinaSerializer(read_only=True)
    vacina_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Vacinacao
        fields = [
            'id', 'manejo', 'vacina', 'vacina_id', 'dose_aplicada', 'lote_vacina',
            'data_vencimento', 'data_proxima_dose', 'observacoes'
        ]
        read_only_fields = ['id']


class AdministracaoMedicamentoSerializer(serializers.ModelSerializer):
    """Serializer para administrações de medicamento"""
    manejo = ManejoSerializer(read_only=True)
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = AdministracaoMedicamento
        fields = [
            'id', 'manejo', 'medicamento', 'medicamento_id', 'dosagem_aplicada',
            'via_administracao', 'motivo_aplicacao', 'data_fim_carencia', 'observacoes'
        ]
        read_only_fields = ['id', 'data_fim_carencia']


class CalendarioSanitarioSerializer(serializers.ModelSerializer):
    """Serializer para calendário sanitário"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    animais_alvo = AnimalResumoSerializer(many=True, read_only=True)
    animais_alvo_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    lotes_alvo = LoteResumoSerializer(many=True, read_only=True)
    lotes_alvo_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    vacina = VacinaSerializer(read_only=True)
    vacina_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    manejo_realizado = ManejoSerializer(read_only=True)
    usuario = UsuarioResumoSerializer(read_only=True)

    class Meta:
        model = CalendarioSanitario
        fields = [
            'id', 'propriedade', 'propriedade_id', 'data_agendada', 'tipo_manejo',
            'animais_alvo', 'animais_alvo_ids', 'lotes_alvo', 'lotes_alvo_ids',
            'vacina', 'vacina_id', 'medicamento', 'medicamento_id', 'descricao',
            'status', 'manejo_realizado', 'usuario', 'data_criacao'
        ]
        read_only_fields = ['id', 'data_criacao']


# ============================================================================
# SERIALIZERS FINANCEIROS
# ============================================================================

class ContaFinanceiraSerializer(serializers.ModelSerializer):
    """Serializer para contas financeiras"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    saldo_atual = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ContaFinanceira
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'tipo', 'banco', 'agencia',
            'conta', 'saldo_inicial', 'saldo_atual', 'ativa', 'data_criacao'
        ]
        read_only_fields = ['id', 'data_criacao']


class CategoriaFinanceiraSerializer(serializers.ModelSerializer):
    """Serializer para categorias financeiras"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = CategoriaFinanceira
        fields = [
            'id', 'propriedade', 'propriedade_id', 'nome', 'tipo', 'descricao', 'ativa'
        ]
        read_only_fields = ['id']
        validators = [
            UniqueTogetherValidator(
                queryset=CategoriaFinanceira.objects.all(),
                fields=['propriedade_id', 'nome']
            )
        ]


class LancamentoFinanceiroSerializer(serializers.ModelSerializer):
    """Serializer para lançamentos financeiros"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    categoria = CategoriaFinanceiraSerializer(read_only=True)
    categoria_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    conta_origem = ContaFinanceiraSerializer(read_only=True)
    conta_origem_id = serializers.UUIDField(write_only=True)
    conta_destino = ContaFinanceiraSerializer(read_only=True)
    conta_destino_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    manejo_relacionado = ManejoSerializer(read_only=True)
    manejo_relacionado_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    animal_relacionado = AnimalResumoSerializer(read_only=True)
    animal_relacionado_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True)
    usuario = UsuarioResumoSerializer(read_only=True)

    class Meta:
        model = LancamentoFinanceiro
        fields = [
            'id', 'propriedade', 'propriedade_id', 'data_lancamento', 'tipo', 'valor',
            'descricao', 'categoria', 'categoria_id', 'conta_origem', 'conta_origem_id',
            'conta_destino', 'conta_destino_id', 'manejo_relacionado', 'manejo_relacionado_id',
            'animal_relacionado', 'animal_relacionado_id', 'observacoes', 'comprovante',
            'usuario', 'data_criacao'
        ]
        read_only_fields = ['id', 'data_criacao']


# ============================================================================
# SERIALIZERS DE RELATÓRIOS E CONFIGURAÇÕES
# ============================================================================

class RelatorioPersonalizadoSerializer(serializers.ModelSerializer):
    """Serializer para relatórios personalizados"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)
    usuario = UsuarioResumoSerializer(read_only=True)

    class Meta:
        model = RelatorioPersonalizado
        fields = [
            'id', 'propriedade', 'propriedade_id', 'usuario', 'nome', 'tipo',
            'filtros', 'colunas', 'publico', 'data_criacao', 'data_atualizacao'
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']


class ConfiguracaoSistemaSerializer(serializers.ModelSerializer):
    """Serializer para configurações do sistema"""
    propriedade = PropriedadeResumoSerializer(read_only=True)
    propriedade_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ConfiguracaoSistema
        fields = [
            'id', 'propriedade', 'propriedade_id', 'peso_ua_referencia', 'dias_gmd_padrao',
            'dias_diagnostico_gestacao', 'dias_gestacao', 'notificar_calendario_sanitario',
            'dias_antecedencia_notificacao', 'moeda', 'data_criacao', 'data_atualizacao'
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']


# ============================================================================
# SERIALIZERS DE HISTÓRICO
# ============================================================================

class HistoricoLoteAnimalSerializer(serializers.ModelSerializer):
    """Serializer para histórico de lotes-animal"""
    animal = AnimalResumoSerializer(read_only=True)
    lote = LoteResumoSerializer(read_only=True)
    usuario = UsuarioResumoSerializer(read_only=True)

    class Meta:
        model = HistoricoLoteAnimal
        fields = [
            'id', 'animal', 'lote', 'data_entrada', 'data_saida',
            'motivo_movimentacao', 'usuario'
        ]
        read_only_fields = ['id']


class HistoricoOcupacaoAreaSerializer(serializers.ModelSerializer):
    """Serializer para histórico de ocupação de áreas"""
    lote = LoteResumoSerializer(read_only=True)
    area = AreaResumoSerializer(read_only=True)
    usuario = UsuarioResumoSerializer(read_only=True)
    periodo_ocupacao = serializers.IntegerField(read_only=True)

    class Meta:
        model = HistoricoOcupacaoArea
        fields = [
            'id', 'lote', 'area', 'data_entrada', 'data_saida',
            'motivo_movimentacao', 'usuario', 'periodo_ocupacao'
        ]
        read_only_fields = ['id']
