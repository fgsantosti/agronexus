"""
AgroNexus - Sistema Fertili
URLs da API v1
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api.v1.views import (
    UsuarioViewSet,
    PropriedadeViewSet,
    AreaViewSet,
    AnimalViewSet,
    LoteViewSet,
    ManejoViewSet,
    PesagemViewSet,
    EstacaoMontaViewSet,
    ProtocoloIATFViewSet,
    InseminacaoViewSet,
    DiagnosticoGestacaoViewSet,
    PartoViewSet,
    VacinaViewSet,
    MedicamentoViewSet,
    VacinacaoViewSet,
    AdministracaoMedicamentoViewSet,
    CalendarioSanitarioViewSet,
    ContaFinanceiraViewSet,
    CategoriaFinanceiraViewSet,
    LancamentoFinanceiroViewSet,
    RelatorioPersonalizadoViewSet,
    ConfiguracaoSistemaViewSet,
    HistoricoLoteAnimalViewSet,
    HistoricoOcupacaoAreaViewSet,
)

# Configuração do router
router = DefaultRouter()

# Registra todos os ViewSets
router.register(r'usuarios', UsuarioViewSet)
router.register(r'propriedades', PropriedadeViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'animais', AnimalViewSet)
router.register(r'lotes', LoteViewSet)
router.register(r'manejos', ManejoViewSet)
router.register(r'pesagens', PesagemViewSet)
router.register(r'estacoes-monta', EstacaoMontaViewSet)
router.register(r'protocolos-iatf', ProtocoloIATFViewSet)
router.register(r'inseminacoes', InseminacaoViewSet)
router.register(r'diagnosticos-gestacao', DiagnosticoGestacaoViewSet)
router.register(r'partos', PartoViewSet)
router.register(r'vacinas', VacinaViewSet)
router.register(r'medicamentos', MedicamentoViewSet)
router.register(r'vacinacoes', VacinacaoViewSet)
router.register(r'administracoes-medicamento', AdministracaoMedicamentoViewSet)
router.register(r'calendario-sanitario', CalendarioSanitarioViewSet)
router.register(r'contas-financeiras', ContaFinanceiraViewSet)
router.register(r'categorias-financeiras', CategoriaFinanceiraViewSet)
router.register(r'lancamentos-financeiros', LancamentoFinanceiroViewSet)
router.register(r'relatorios-personalizados', RelatorioPersonalizadoViewSet)
router.register(r'configuracoes-sistema', ConfiguracaoSistemaViewSet)
router.register(r'historico-lote-animal', HistoricoLoteAnimalViewSet)
router.register(r'historico-ocupacao-area', HistoricoOcupacaoAreaViewSet)

urlpatterns = [
    # API v1 endpoints
    path('v1/', include(router.urls)),
]
