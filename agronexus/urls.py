"""
AgroNexus - Sistema 
URLs da API v1
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api.v1.views import (AdministracaoMedicamentoViewSet, AnimalViewSet,
                           AreaViewSet, CalendarioSanitarioViewSet,
                           CategoriaFinanceiraViewSet,
                           ConfiguracaoSistemaViewSet, ContaFinanceiraViewSet,
                           DiagnosticoGestacaoViewSet, EspecieAnimalViewSet,
                           EstacaoMontaViewSet,
                           HistoricoLoteAnimalViewSet,
                           HistoricoOcupacaoAreaViewSet, InseminacaoViewSet,
                           LancamentoFinanceiroViewSet, LoteViewSet,
                           ManejoViewSet, MedicamentoViewSet, PartoViewSet,
                           PesagemViewSet, PropriedadeViewSet,
                           ProtocoloIATFViewSet, RacaAnimalViewSet,
                           RelatorioPersonalizadoViewSet,
                           UsuarioViewSet, VacinacaoViewSet, VacinaViewSet)

# Configuração do router
router = DefaultRouter()

# Registra todos os ViewSets
router.register(r'usuarios', UsuarioViewSet)
router.register(r'propriedades', PropriedadeViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'especies', EspecieAnimalViewSet)
router.register(r'racas', RacaAnimalViewSet)
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
    path('', include(router.urls)),
]
