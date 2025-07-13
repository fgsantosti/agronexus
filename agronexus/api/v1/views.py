"""
AgroNexus - Sistema 
ViewSets para API REST
"""

from datetime import timedelta

from django.db.models import Avg, Count, F, Q, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from ...models import (AdministracaoMedicamento, Animal, AnimalManejo, Area,
                       CalendarioSanitario, CategoriaFinanceira,
                       ConfiguracaoSistema, ContaFinanceira,
                       DiagnosticoGestacao, EspecieAnimal, EstacaoMonta, HistoricoLoteAnimal,
                       HistoricoOcupacaoArea, Inseminacao,
                       LancamentoFinanceiro, Lote, Manejo, Medicamento, Parto,
                       Pesagem, Propriedade, ProtocoloIATF, RacaAnimal,
                       RelatorioPersonalizado, Usuario, Vacina, Vacinacao)
from ...permissions.base import IsOwnerOrReadOnly, PropriedadeOwnerPermission
from ...utils.filters import (AnimalFilter, AreaFilter,
                              CalendarioSanitarioFilter,
                              DiagnosticoGestacaoFilter, EstacaoMontaFilter,
                              InseminacaoFilter, LancamentoFinanceiroFilter,
                              LoteFilter, ManejoFilter, PartoFilter,
                              PesagemFilter, PropriedadeFilter,
                              VacinacaoFilter)
from .serializers import (AdministracaoMedicamentoSerializer, AnimalSerializer,
                          AreaSerializer, CalendarioSanitarioSerializer,
                          CategoriaFinanceiraSerializer,
                          ConfiguracaoSistemaSerializer,
                          ContaFinanceiraSerializer,
                          DiagnosticoGestacaoSerializer,
                          EspecieAnimalSerializer,
                          EstacaoMontaSerializer,
                          HistoricoLoteAnimalSerializer,
                          HistoricoOcupacaoAreaSerializer,
                          InseminacaoSerializer,
                          LancamentoFinanceiroSerializer, LoteSerializer,
                          ManejoSerializer, MedicamentoSerializer,
                          PartoSerializer, PesagemSerializer,
                          PropriedadeSerializer, ProtocoloIATFSerializer,
                          RacaAnimalSerializer,
                          RelatorioPersonalizadoSerializer, UsuarioSerializer,
                          VacinacaoSerializer, VacinaSerializer)


class BaseViewSet(viewsets.ModelViewSet):
    """ViewSet base com funcionalidades comuns"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_queryset(self):
        """Filtra registros por propriedade quando aplicável"""
        queryset = super().get_queryset()

        # Se o modelo tem propriedade, filtra por propriedades do usuário
        if hasattr(self.queryset.model, 'propriedade'):
            propriedades_usuario = Propriedade.objects.filter(
                proprietario=self.request.user
            )
            queryset = queryset.filter(propriedade__in=propriedades_usuario)

        return queryset

    def perform_create(self, serializer):
        """Associa o usuário atual ao criar registros"""
        # Se o modelo tem campo usuario, associa o usuário atual
        if hasattr(serializer.Meta.model, 'usuario'):
            serializer.save(usuario=self.request.user)
        else:
            serializer.save()


# ============================================================================
# VIEWSETS DE USUÁRIOS E PROPRIEDADES
# ============================================================================

class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para usuários"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['username', 'first_name', 'last_name', 'date_joined']
    ordering = ['-date_joined']

    def get_queryset(self):
        """Usuários podem ver apenas dados da sua propriedade"""
        if self.request.user.is_superuser:
            return self.queryset

        # Pega as propriedades do usuário atual
        propriedades = Propriedade.objects.filter(
            proprietario=self.request.user)

        # Retorna usuários das suas propriedades
        return self.queryset.filter(
            Q(propriedades__in=propriedades) | Q(id=self.request.user.id)
        ).distinct()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna dados do usuário atual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class PropriedadeViewSet(BaseViewSet):
    """ViewSet para propriedades"""
    queryset = Propriedade.objects.all()
    serializer_class = PropriedadeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filterset_class = PropriedadeFilter
    search_fields = ['nome', 'localizacao', 'inscricao_estadual']
    ordering_fields = ['nome', 'area_total_ha', 'data_criacao']
    ordering = ['nome']

    def get_queryset(self):
        """Usuários veem apenas suas propriedades"""
        return self.queryset.filter(proprietario=self.request.user).annotate(
            area_ocupada=Sum('areas__tamanho_ha'),
            total_animais=Count('animais', filter=Q(animais__status='ativo')),
            total_lotes=Count('lotes', filter=Q(lotes__ativo=True)),
            total_areas=Count('areas')
        )

    def perform_create(self, serializer):
        """Associa o usuário atual como proprietário"""
        serializer.save(proprietario=self.request.user)

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Dashboard com estatísticas da propriedade"""
        propriedade = self.get_object()

        # Estatísticas gerais
        total_animais = propriedade.animais.filter(status='ativo').count()
        total_lotes = propriedade.lotes.filter(ativo=True).count()
        total_areas = propriedade.areas.count()

        # Estatísticas por categoria
        por_categoria = propriedade.animais.filter(status='ativo').values(
            'categoria'
        ).annotate(total=Count('id'))

        # Estatísticas por sexo
        por_sexo = propriedade.animais.filter(status='ativo').values(
            'sexo'
        ).annotate(total=Count('id'))

        # Estatísticas financeiras (último mês)
        data_limite = timezone.now().date() - timedelta(days=30)
        receitas = propriedade.lancamentos_financeiros.filter(
            tipo='entrada',
            data_lancamento__gte=data_limite
        ).aggregate(total=Sum('valor'))['total'] or 0

        despesas = propriedade.lancamentos_financeiros.filter(
            tipo='saida',
            data_lancamento__gte=data_limite
        ).aggregate(total=Sum('valor'))['total'] or 0

        return Response({
            'estatisticas_gerais': {
                'total_animais': total_animais,
                'total_lotes': total_lotes,
                'total_areas': total_areas,
                'area_total_ha': propriedade.area_total_ha,
                'taxa_ocupacao_global': propriedade.get_taxa_ocupacao_global()
            },
            'distribuicao_animais': {
                'por_categoria': list(por_categoria),
                'por_sexo': list(por_sexo)
            },
            'financeiro_mensal': {
                'receitas': receitas,
                'despesas': despesas,
                'saldo': receitas - despesas
            }
        })


# ============================================================================
# VIEWSETS DE ÁREAS
# ============================================================================

class AreaViewSet(BaseViewSet):
    """ViewSet para áreas"""
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = AreaFilter
    search_fields = ['nome', 'tipo_forragem']
    ordering_fields = ['nome', 'tipo', 'tamanho_ha', 'status']
    ordering = ['nome']

    def get_queryset(self):
        return super().get_queryset().select_related('propriedade')

    @action(detail=True, methods=['post'])
    def ocupar(self, request, pk=None):
        """Ocupa uma área com um lote"""
        area = self.get_object()
        lote_id = request.data.get('lote_id')

        if not lote_id:
            return Response(
                {'error': 'ID do lote é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lote = Lote.objects.get(id=lote_id, propriedade=area.propriedade)
        except Lote.DoesNotExist:
            return Response(
                {'error': 'Lote não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verifica se a área já está ocupada
        if area.get_lote_atual():
            return Response(
                {'error': 'Área já está ocupada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Libera a área atual do lote
        if lote.area_atual:
            lote.area_atual.status = 'disponivel'
            lote.area_atual.save()

        # Ocupa a nova área
        lote.area_atual = area
        lote.save()

        area.status = 'em_uso'
        area.save()

        # Registra no histórico
        HistoricoOcupacaoArea.objects.create(
            lote=lote,
            area=area,
            data_entrada=timezone.now().date(),
            motivo_movimentacao=request.data.get(
                'motivo', 'Movimentação via API'),
            usuario=request.user
        )

        return Response({'message': 'Área ocupada com sucesso'})

    @action(detail=True, methods=['post'])
    def liberar(self, request, pk=None):
        """Libera uma área"""
        area = self.get_object()
        lote_atual = area.get_lote_atual()

        if not lote_atual:
            return Response(
                {'error': 'Área não está ocupada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Finaliza o histórico atual
        historico = HistoricoOcupacaoArea.objects.filter(
            area=area,
            data_saida__isnull=True
        ).first()

        if historico:
            historico.data_saida = timezone.now().date()
            historico.motivo_movimentacao = request.data.get(
                'motivo', 'Liberação via API')
            historico.save()

        # Libera a área
        lote_atual.area_atual = None
        lote_atual.save()

        area.status = 'disponivel'
        area.save()

        return Response({'message': 'Área liberada com sucesso'})


# ============================================================================
# VIEWSETS DE ESPÉCIES E RAÇAS
# ============================================================================

class EspecieAnimalViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para espécies de animais (apenas leitura)"""
    queryset = EspecieAnimal.objects.filter(ativo=True)
    serializer_class = EspecieAnimalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome', 'nome_display']
    ordering_fields = ['nome', 'nome_display']
    ordering = ['nome']

    @action(detail=True, methods=['get'])
    def racas(self, request, pk=None):
        """Retorna todas as raças de uma espécie"""
        especie = self.get_object()
        racas = especie.racas.filter(ativo=True)
        serializer = RacaAnimalSerializer(racas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def categorias(self, request, pk=None):
        """Retorna as categorias disponíveis para uma espécie"""
        especie = self.get_object()
        categorias = especie.get_categorias()
        return Response(categorias)


class RacaAnimalViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para raças de animais (apenas leitura)"""
    queryset = RacaAnimal.objects.filter(ativo=True)
    serializer_class = RacaAnimalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['especie']
    search_fields = ['nome', 'origem']
    ordering_fields = ['nome', 'especie__nome']
    ordering = ['especie__nome', 'nome']


# ============================================================================
# VIEWSETS DE ANIMAIS E LOTES
# ============================================================================

class AnimalViewSet(BaseViewSet):
    """ViewSet para animais"""
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = AnimalFilter
    search_fields = ['identificacao_unica', 'nome_registro', 'raca']
    ordering_fields = ['identificacao_unica',
                       'data_nascimento', 'categoria', 'data_criacao']
    ordering = ['identificacao_unica']

    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'propriedade', 'lote_atual', 'pai', 'mae'
        )

        # Adiciona campos calculados
        for animal in queryset:
            animal.idade_dias = animal.get_idade_dias()
            animal.idade_meses = animal.get_idade_meses()
            animal.peso_atual = animal.get_peso_atual()
            animal.ua_value = animal.get_ua_value()

        return queryset

    @action(detail=True, methods=['get'])
    def historico_completo(self, request, pk=None):
        """Retorna histórico completo do animal"""
        animal = self.get_object()
        historico = animal.get_historico_completo()
        return Response(historico)

    @action(detail=True, methods=['get'])
    def evolucao_peso(self, request, pk=None):
        """Retorna evolução do peso do animal"""
        animal = self.get_object()
        pesagens = animal.pesagens.order_by('data_pesagem').values(
            'data_pesagem', 'peso_kg'
        )
        return Response(list(pesagens))

    @action(detail=True, methods=['post'])
    def trocar_lote(self, request, pk=None):
        """Troca o animal de lote"""
        animal = self.get_object()
        lote_id = request.data.get('lote_id')

        if not lote_id:
            return Response(
                {'error': 'ID do lote é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            novo_lote = Lote.objects.get(
                id=lote_id, propriedade=animal.propriedade)
        except Lote.DoesNotExist:
            return Response(
                {'error': 'Lote não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Registra saída do lote atual
        if animal.lote_atual:
            historico_atual = HistoricoLoteAnimal.objects.filter(
                animal=animal,
                lote=animal.lote_atual,
                data_saida__isnull=True
            ).first()

            if historico_atual:
                historico_atual.data_saida = timezone.now().date()
                historico_atual.motivo_movimentacao = request.data.get(
                    'motivo', 'Troca via API')
                historico_atual.save()

        # Registra entrada no novo lote
        HistoricoLoteAnimal.objects.create(
            animal=animal,
            lote=novo_lote,
            data_entrada=timezone.now().date(),
            motivo_movimentacao=request.data.get('motivo', 'Troca via API'),
            usuario=request.user
        )

        animal.lote_atual = novo_lote
        animal.save()

        return Response({'message': 'Animal movido com sucesso'})


class LoteViewSet(BaseViewSet):
    """ViewSet para lotes"""
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = LoteFilter
    search_fields = ['nome', 'descricao', 'criterio_agrupamento']
    ordering_fields = ['nome', 'data_criacao']
    ordering = ['nome']

    def get_queryset(self):
        queryset = super().get_queryset().select_related(
            'propriedade', 'area_atual'
        )

        # Adiciona campos calculados
        for lote in queryset:
            lote.total_animais = lote.get_total_animais()
            lote.total_ua = lote.get_total_ua()
            lote.peso_medio = lote.get_peso_medio()
            lote.gmd_medio = lote.get_gmd_medio()

        return queryset

    @action(detail=True, methods=['get'])
    def animais(self, request, pk=None):
        """Lista animais do lote"""
        lote = self.get_object()
        animais = lote.animais.filter(status='ativo')
        page = self.paginate_queryset(animais)

        if page is not None:
            serializer = AnimalSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = AnimalSerializer(animais, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def estatisticas(self, request, pk=None):
        """Estatísticas do lote"""
        lote = self.get_object()

        # Estatísticas básicas
        total_animais = lote.get_total_animais()
        total_ua = lote.get_total_ua()
        peso_medio = lote.get_peso_medio()
        gmd_medio = lote.get_gmd_medio()

        # Distribuição por categoria
        por_categoria = lote.animais.filter(status='ativo').values(
            'categoria'
        ).annotate(total=Count('id'))

        # Distribuição por sexo
        por_sexo = lote.animais.filter(status='ativo').values(
            'sexo'
        ).annotate(total=Count('id'))

        return Response({
            'basicas': {
                'total_animais': total_animais,
                'total_ua': total_ua,
                'peso_medio': peso_medio,
                'gmd_medio': gmd_medio
            },
            'distribuicao': {
                'por_categoria': list(por_categoria),
                'por_sexo': list(por_sexo)
            }
        })


# ============================================================================
# VIEWSETS DE MANEJO
# ============================================================================

class ManejoViewSet(BaseViewSet):
    """ViewSet para manejos"""
    queryset = Manejo.objects.all()
    serializer_class = ManejoSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = ManejoFilter
    search_fields = ['observacoes']
    ordering_fields = ['data_manejo', 'tipo', 'custo_total']
    ordering = ['-data_manejo']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'propriedade', 'lote', 'usuario'
        ).prefetch_related('animais')

    @action(detail=False, methods=['get'])
    def relatorio_custos(self, request):
        """Relatório de custos por período"""
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        queryset = self.get_queryset()

        if data_inicio:
            queryset = queryset.filter(data_manejo__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_manejo__lte=data_fim)

        # Agrupa por tipo de manejo
        custos_por_tipo = queryset.values('tipo').annotate(
            total_material=Sum('custo_material'),
            total_pessoal=Sum('custo_pessoal'),
            total_geral=Sum('custo_total'),
            quantidade=Count('id')
        )

        return Response(list(custos_por_tipo))


class PesagemViewSet(BaseViewSet):
    """ViewSet para pesagens"""
    queryset = Pesagem.objects.all()
    serializer_class = PesagemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PesagemFilter
    search_fields = ['equipamento_usado', 'observacoes']
    ordering_fields = ['data_pesagem', 'peso_kg']
    ordering = ['-data_pesagem']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'animal', 'manejo'
        ).filter(animal__propriedade__proprietario=self.request.user)

    @action(detail=False, methods=['get'])
    def evolucao_rebanho(self, request):
        """Evolução do peso médio do rebanho"""
        queryset = self.get_queryset()

        # Agrupa por mês
        evolucao = queryset.extra(
            select={'mes': "DATE_FORMAT(data_pesagem, '%%Y-%%m')"}
        ).values('mes').annotate(
            peso_medio=Avg('peso_kg'),
            total_pesagens=Count('id')
        ).order_by('mes')

        return Response(list(evolucao))


# ============================================================================
# VIEWSETS DE REPRODUÇÃO
# ============================================================================

class EstacaoMontaViewSet(BaseViewSet):
    """ViewSet para estações de monta"""
    queryset = EstacaoMonta.objects.all()
    serializer_class = EstacaoMontaSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = EstacaoMontaFilter
    search_fields = ['nome', 'observacoes']
    ordering_fields = ['nome', 'data_inicio', 'data_fim']
    ordering = ['-data_inicio']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'propriedade'
        ).prefetch_related('lotes_participantes')

    @action(detail=True, methods=['get'])
    def relatorio_reproducao(self, request, pk=None):
        """Relatório de reprodução da estação"""
        estacao = self.get_object()

        # Estatísticas gerais
        total_femeas = estacao.get_total_femeas()
        taxa_prenhez = estacao.get_taxa_prenhez()

        # Inseminações realizadas
        total_inseminacoes = estacao.inseminacoes.count()

        # Diagnósticos
        diagnosticos = estacao.inseminacoes.aggregate(
            positivos=Count('diagnosticos', filter=Q(
                diagnosticos__resultado='positivo')),
            negativos=Count('diagnosticos', filter=Q(
                diagnosticos__resultado='negativo')),
            inconclusivos=Count('diagnosticos', filter=Q(
                diagnosticos__resultado='inconclusivo'))
        )

        return Response({
            'estatisticas_gerais': {
                'total_femeas': total_femeas,
                'taxa_prenhez': taxa_prenhez,
                'total_inseminacoes': total_inseminacoes
            },
            'diagnosticos': diagnosticos
        })


class ProtocoloIATFViewSet(BaseViewSet):
    """ViewSet para protocolos IATF"""
    queryset = ProtocoloIATF.objects.all()
    serializer_class = ProtocoloIATFSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'duracao_dias']
    ordering = ['nome']


class InseminacaoViewSet(BaseViewSet):
    """ViewSet para inseminações"""
    queryset = Inseminacao.objects.all()
    serializer_class = InseminacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = InseminacaoFilter
    search_fields = ['semen_utilizado', 'observacoes']
    ordering_fields = ['data_inseminacao', 'tipo']
    ordering = ['-data_inseminacao']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'animal', 'manejo', 'reprodutor', 'protocolo_iatf', 'estacao_monta'
        ).filter(animal__propriedade__proprietario=self.request.user)


class DiagnosticoGestacaoViewSet(BaseViewSet):
    """ViewSet para diagnósticos de gestação"""
    queryset = DiagnosticoGestacao.objects.all()
    serializer_class = DiagnosticoGestacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = DiagnosticoGestacaoFilter
    search_fields = ['metodo', 'observacoes']
    ordering_fields = ['data_diagnostico', 'resultado']
    ordering = ['-data_diagnostico']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'inseminacao', 'manejo'
        ).filter(inseminacao__animal__propriedade__proprietario=self.request.user)


class PartoViewSet(BaseViewSet):
    """ViewSet para partos"""
    queryset = Parto.objects.all()
    serializer_class = PartoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PartoFilter
    search_fields = ['observacoes']
    ordering_fields = ['data_parto', 'resultado', 'peso_nascimento']
    ordering = ['-data_parto']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'mae', 'manejo', 'bezerro'
        ).filter(mae__propriedade__proprietario=self.request.user)


# ============================================================================
# VIEWSETS DE SANIDADE
# ============================================================================

class VacinaViewSet(viewsets.ModelViewSet):
    """ViewSet para vacinas"""
    queryset = Vacina.objects.all()
    serializer_class = VacinaSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['nome', 'fabricante', 'doencas_previne']
    ordering_fields = ['nome', 'fabricante']
    ordering = ['nome']

    def get_queryset(self):
        return self.queryset.filter(ativa=True)


class MedicamentoViewSet(viewsets.ModelViewSet):
    """ViewSet para medicamentos"""
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['nome', 'fabricante', 'principio_ativo']
    ordering_fields = ['nome', 'fabricante', 'tipo']
    ordering = ['nome']

    def get_queryset(self):
        return self.queryset.filter(ativo=True)


class VacinacaoViewSet(BaseViewSet):
    """ViewSet para vacinações"""
    queryset = Vacinacao.objects.all()
    serializer_class = VacinacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = VacinacaoFilter
    search_fields = ['lote_vacina', 'observacoes']
    ordering_fields = ['manejo__data_manejo', 'data_proxima_dose']
    ordering = ['-manejo__data_manejo']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'manejo', 'vacina'
        ).filter(manejo__propriedade__proprietario=self.request.user)


class AdministracaoMedicamentoViewSet(BaseViewSet):
    """ViewSet para administrações de medicamento"""
    queryset = AdministracaoMedicamento.objects.all()
    serializer_class = AdministracaoMedicamentoSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['dosagem_aplicada', 'motivo_aplicacao']
    ordering_fields = ['manejo__data_manejo', 'data_fim_carencia']
    ordering = ['-manejo__data_manejo']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'manejo', 'medicamento'
        ).filter(manejo__propriedade__proprietario=self.request.user)


class CalendarioSanitarioViewSet(BaseViewSet):
    """ViewSet para calendário sanitário"""
    queryset = CalendarioSanitario.objects.all()
    serializer_class = CalendarioSanitarioSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = CalendarioSanitarioFilter
    search_fields = ['descricao']
    ordering_fields = ['data_agendada', 'status', 'tipo_manejo']
    ordering = ['data_agendada']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'propriedade', 'vacina', 'medicamento', 'manejo_realizado', 'usuario'
        ).prefetch_related('animais_alvo', 'lotes_alvo')

    @action(detail=False, methods=['get'])
    def proximos_vencimentos(self, request):
        """Retorna próximos vencimentos"""
        dias_antecedencia = int(request.query_params.get('dias', 7))
        data_limite = timezone.now().date() + timedelta(days=dias_antecedencia)

        proximos = self.get_queryset().filter(
            data_agendada__lte=data_limite,
            status='agendado'
        )

        serializer = self.get_serializer(proximos, many=True)
        return Response(serializer.data)


# ============================================================================
# VIEWSETS FINANCEIROS
# ============================================================================

class ContaFinanceiraViewSet(BaseViewSet):
    """ViewSet para contas financeiras"""
    queryset = ContaFinanceira.objects.all()
    serializer_class = ContaFinanceiraSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    search_fields = ['nome', 'banco', 'agencia', 'conta']
    ordering_fields = ['nome', 'tipo', 'saldo_inicial']
    ordering = ['nome']

    def get_queryset(self):
        queryset = super().get_queryset().select_related('propriedade')

        # Adiciona saldo atual
        for conta in queryset:
            conta.saldo_atual = conta.get_saldo_atual()

        return queryset


class CategoriaFinanceiraViewSet(BaseViewSet):
    """ViewSet para categorias financeiras"""
    queryset = CategoriaFinanceira.objects.all()
    serializer_class = CategoriaFinanceiraSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'tipo']
    ordering = ['tipo', 'nome']

    def get_queryset(self):
        return super().get_queryset().filter(ativa=True)


class LancamentoFinanceiroViewSet(BaseViewSet):
    """ViewSet para lançamentos financeiros"""
    queryset = LancamentoFinanceiro.objects.all()
    serializer_class = LancamentoFinanceiroSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    filterset_class = LancamentoFinanceiroFilter
    search_fields = ['descricao', 'observacoes']
    ordering_fields = ['data_lancamento', 'valor', 'tipo']
    ordering = ['-data_lancamento']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'propriedade', 'categoria', 'conta_origem', 'conta_destino',
            'manejo_relacionado', 'animal_relacionado', 'usuario'
        )

    @action(detail=False, methods=['get'])
    def fluxo_caixa(self, request):
        """Fluxo de caixa por período"""
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        queryset = self.get_queryset()

        if data_inicio:
            queryset = queryset.filter(data_lancamento__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_lancamento__lte=data_fim)

        # Agrupa por mês
        fluxo = queryset.extra(
            select={'mes': "DATE_FORMAT(data_lancamento, '%%Y-%%m')"}
        ).values('mes').annotate(
            entradas=Sum('valor', filter=Q(tipo='entrada')),
            saidas=Sum('valor', filter=Q(tipo='saida')),
            saldo=Sum('valor', filter=Q(tipo='entrada')) -
            Sum('valor', filter=Q(tipo='saida'))
        ).order_by('mes')

        return Response(list(fluxo))


# ============================================================================
# VIEWSETS DE CONFIGURAÇÃO
# ============================================================================

class RelatorioPersonalizadoViewSet(BaseViewSet):
    """ViewSet para relatórios personalizados"""
    queryset = RelatorioPersonalizado.objects.all()
    serializer_class = RelatorioPersonalizadoSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]
    search_fields = ['nome']
    ordering_fields = ['nome', 'tipo', 'data_criacao']
    ordering = ['nome']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'propriedade', 'usuario'
        ).filter(
            Q(usuario=self.request.user) | Q(publico=True)
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ConfiguracaoSistemaViewSet(BaseViewSet):
    """ViewSet para configurações do sistema"""
    queryset = ConfiguracaoSistema.objects.all()
    serializer_class = ConfiguracaoSistemaSerializer
    permission_classes = [
        permissions.IsAuthenticated, PropriedadeOwnerPermission]

    def get_queryset(self):
        return super().get_queryset().select_related('propriedade')


# ============================================================================
# VIEWSETS DE HISTÓRICO
# ============================================================================

class HistoricoLoteAnimalViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para histórico de lotes-animal"""
    queryset = HistoricoLoteAnimal.objects.all()
    serializer_class = HistoricoLoteAnimalSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['motivo_movimentacao']
    ordering_fields = ['data_entrada', 'data_saida']
    ordering = ['-data_entrada']

    def get_queryset(self):
        return self.queryset.select_related(
            'animal', 'lote', 'usuario'
        ).filter(animal__propriedade__proprietario=self.request.user)


class HistoricoOcupacaoAreaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para histórico de ocupação de áreas"""
    queryset = HistoricoOcupacaoArea.objects.all()
    serializer_class = HistoricoOcupacaoAreaSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['motivo_movimentacao']
    ordering_fields = ['data_entrada', 'data_saida']
    ordering = ['-data_entrada']

    def get_queryset(self):
        return self.queryset.select_related(
            'lote', 'area', 'usuario'
        ).filter(area__propriedade__proprietario=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()

        # Adiciona período de ocupação
        for historico in queryset:
            historico.periodo_ocupacao = historico.get_periodo_ocupacao()

        return queryset
