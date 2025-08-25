from django.shortcuts import render
from django.db.models import Count
from .models import Propriedade, Animal, Lote, Usuario
from datetime import datetime

def home_view(request):
    """
    View para a página inicial do sistema AgroNexus
    """
    # Coletando estatísticas do sistema
    stats = {
        'propriedades': Propriedade.objects.count(),
        'animais': Animal.objects.count(),
        'lotes': Lote.objects.count(),
        'usuarios': Usuario.objects.count(),
    }
    
    context = {
        'stats': stats,
        'current_year': datetime.now().year,
    }
    
    return render(request, 'home.html', context)
