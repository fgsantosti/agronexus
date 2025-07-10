"""
AgroNexus - Sistema Fertili
Configuração do Celery
"""

import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('agronexus')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configurações adicionais
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    result_expires=3600,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutos
    task_soft_time_limit=25 * 60,  # 25 minutos
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Tarefas periódicas
app.conf.beat_schedule = {
    'verificar-calendario-sanitario': {
        'task': 'agronexus.tasks.verificar_calendario_sanitario',
        'schedule': 24 * 60 * 60,  # Diariamente
    },
    'backup-automatico': {
        'task': 'agronexus.tasks.backup_automatico',
        'schedule': 7 * 24 * 60 * 60,  # Semanalmente
    },
    'gerar-relatorio-semanal': {
        'task': 'agronexus.tasks.gerar_relatorio_semanal',
        'schedule': 7 * 24 * 60 * 60,  # Semanalmente
    },
    'limpar-logs-antigos': {
        'task': 'agronexus.tasks.limpar_logs_antigos',
        'schedule': 24 * 60 * 60,  # Diariamente
    },
}

app.conf.timezone = 'America/Sao_Paulo'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
