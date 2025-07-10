"""
AgroNexus - Sistema Fertili
Tarefas Celery para processamento assíncrono
"""

from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum, Q
from datetime import timedelta, date
import json
import logging
import os

from .models import (
    CalendarioSanitario, Animal, Pesagem, Manejo, LancamentoFinanceiro,
    Propriedade, Usuario, ConfiguracaoSistema
)
from .utils.helpers import (
    generate_report_data, export_to_excel, create_backup_filename,
    serialize_for_backup
)

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def verificar_calendario_sanitario(self):
    """
    Verifica itens do calendário sanitário que estão vencendo
    """
    try:
        hoje = timezone.now().date()
        
        # Busca configurações para cada propriedade
        propriedades = Propriedade.objects.filter(ativa=True)
        
        total_notificacoes = 0
        
        for propriedade in propriedades:
            try:
                config = propriedade.configuracao
                dias_antecedencia = config.dias_antecedencia_notificacao
                notificar = config.notificar_calendario_sanitario
            except ConfiguracaoSistema.DoesNotExist:
                dias_antecedencia = 7
                notificar = True
            
            if not notificar:
                continue
            
            # Busca itens vencendo
            data_limite = hoje + timedelta(days=dias_antecedencia)
            
            itens_vencendo = CalendarioSanitario.objects.filter(
                propriedade=propriedade,
                data_agendada__lte=data_limite,
                data_agendada__gte=hoje,
                status='agendado'
            )
            
            if itens_vencendo.exists():
                # Envia notificação para o proprietário
                enviar_notificacao_calendario.delay(
                    propriedade.id,
                    list(itens_vencendo.values_list('id', flat=True))
                )
                total_notificacoes += itens_vencendo.count()
        
        logger.info(f"Verificação de calendário concluída. {total_notificacoes} notificações enviadas.")
        
        return {
            'status': 'success',
            'total_notificacoes': total_notificacoes,
            'data_verificacao': hoje.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro na verificação do calendário sanitário: {str(e)}")
        raise


@shared_task(bind=True)
def enviar_notificacao_calendario(self, propriedade_id, itens_ids):
    """
    Envia notificação por email sobre itens do calendário sanitário
    """
    try:
        propriedade = Propriedade.objects.get(id=propriedade_id)
        itens = CalendarioSanitario.objects.filter(id__in=itens_ids)
        
        # Monta o conteúdo do email
        assunto = f"Calendário Sanitário - {propriedade.nome}"
        
        mensagem = f"""
        Olá {propriedade.proprietario.get_full_name()},
        
        Os seguintes itens do calendário sanitário estão próximos do vencimento:
        
        """
        
        for item in itens:
            mensagem += f"- {item.get_tipo_manejo_display()}: {item.data_agendada.strftime('%d/%m/%Y')}\n"
            mensagem += f"  Descrição: {item.descricao}\n\n"
        
        mensagem += """
        Acesse o sistema para mais detalhes.
        
        Atenciosamente,
        Sistema AgroNexus
        """
        
        # Envia email
        send_mail(
            assunto,
            mensagem,
            'noreply@agronexus.com',
            [propriedade.proprietario.email],
            fail_silently=False,
        )
        
        logger.info(f"Notificação enviada para {propriedade.proprietario.email}")
        
        return {
            'status': 'success',
            'propriedade': propriedade.nome,
            'email': propriedade.proprietario.email,
            'itens_count': len(itens_ids)
        }
        
    except Exception as e:
        logger.error(f"Erro ao enviar notificação: {str(e)}")
        raise


@shared_task(bind=True)
def backup_automatico(self):
    """
    Realiza backup automático dos dados
    """
    try:
        hoje = timezone.now().date()
        backup_data = {
            'data_backup': hoje.isoformat(),
            'versao': '1.0',
            'dados': {}
        }
        
        # Modelos para backup
        models_to_backup = [
            ('propriedades', Propriedade),
            ('animais', Animal),
            ('manejos', Manejo),
            ('pesagens', Pesagem),
            ('lancamentos_financeiros', LancamentoFinanceiro),
        ]
        
        for model_name, model_class in models_to_backup:
            objects = model_class.objects.all()
            backup_data['dados'][model_name] = [
                serialize_for_backup(obj) for obj in objects
            ]
        
        # Salva backup
        backup_filename = create_backup_filename('sistema_completo')
        backup_path = os.path.join('media', 'backups', backup_filename)
        
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        
        with open(backup_path, 'w') as f:
            json.dump(backup_data, f, indent=2)
        
        logger.info(f"Backup criado: {backup_filename}")
        
        return {
            'status': 'success',
            'backup_file': backup_filename,
            'data_backup': hoje.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro no backup automático: {str(e)}")
        raise


@shared_task(bind=True)
def gerar_relatorio_semanal(self):
    """
    Gera relatório semanal para todas as propriedades
    """
    try:
        hoje = timezone.now().date()
        semana_passada = hoje - timedelta(days=7)
        
        propriedades = Propriedade.objects.filter(ativa=True)
        relatorios_gerados = 0
        
        for propriedade in propriedades:
            relatorio = gerar_relatorio_propriedade(propriedade, semana_passada, hoje)
            
            if relatorio:
                # Envia relatório por email
                enviar_relatorio_semanal.delay(
                    propriedade.id,
                    relatorio
                )
                relatorios_gerados += 1
        
        logger.info(f"Relatórios semanais gerados: {relatorios_gerados}")
        
        return {
            'status': 'success',
            'relatorios_gerados': relatorios_gerados,
            'periodo': f"{semana_passada} a {hoje}"
        }
        
    except Exception as e:
        logger.error(f"Erro na geração de relatórios semanais: {str(e)}")
        raise


@shared_task(bind=True)
def enviar_relatorio_semanal(self, propriedade_id, relatorio_data):
    """
    Envia relatório semanal por email
    """
    try:
        propriedade = Propriedade.objects.get(id=propriedade_id)
        
        # Cria arquivo Excel
        excel_data = export_to_excel(relatorio_data, 'relatorio_semanal')
        
        # Envia email com anexo
        # TODO: Implementar envio com anexo
        
        logger.info(f"Relatório semanal enviado para {propriedade.nome}")
        
        return {
            'status': 'success',
            'propriedade': propriedade.nome
        }
        
    except Exception as e:
        logger.error(f"Erro ao enviar relatório semanal: {str(e)}")
        raise


@shared_task(bind=True)
def limpar_logs_antigos(self):
    """
    Remove logs antigos do sistema
    """
    try:
        hoje = timezone.now().date()
        data_limite = hoje - timedelta(days=30)
        
        # TODO: Implementar limpeza de logs
        
        logger.info("Limpeza de logs concluída")
        
        return {
            'status': 'success',
            'data_limite': data_limite.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro na limpeza de logs: {str(e)}")
        raise


@shared_task(bind=True)
def calcular_indices_zootecnicos(self, propriedade_id):
    """
    Calcula índices zootécnicos para uma propriedade
    """
    try:
        propriedade = Propriedade.objects.get(id=propriedade_id)
        hoje = timezone.now().date()
        
        # Calcula diversos índices
        indices = {
            'data_calculo': hoje.isoformat(),
            'propriedade': propriedade.nome,
            'indices': {}
        }
        
        # Taxa de natalidade
        total_femeas = propriedade.animais.filter(
            sexo='F',
            status='ativo',
            categoria__in=['vaca', 'novilha']
        ).count()
        
        nascimentos_ano = propriedade.animais.filter(
            data_nascimento__year=hoje.year,
            status='ativo'
        ).count()
        
        if total_femeas > 0:
            indices['indices']['taxa_natalidade'] = (nascimentos_ano / total_femeas) * 100
        
        # Taxa de mortalidade
        total_animais = propriedade.animais.filter(status='ativo').count()
        mortes_ano = propriedade.animais.filter(
            data_morte__year=hoje.year,
            status='morto'
        ).count()
        
        if total_animais > 0:
            indices['indices']['taxa_mortalidade'] = (mortes_ano / total_animais) * 100
        
        # GMD médio do rebanho
        pesagens_recentes = Pesagem.objects.filter(
            animal__propriedade=propriedade,
            data_pesagem__gte=hoje - timedelta(days=30)
        )
        
        if pesagens_recentes.exists():
            gmds = []
            for pesagem in pesagens_recentes:
                gmd = pesagem.get_gmd_anterior()
                if gmd:
                    gmds.append(gmd)
            
            if gmds:
                indices['indices']['gmd_medio'] = sum(gmds) / len(gmds)
        
        logger.info(f"Índices calculados para {propriedade.nome}")
        
        return indices
        
    except Exception as e:
        logger.error(f"Erro no cálculo de índices: {str(e)}")
        raise


@shared_task(bind=True)
def processar_lote_pesagens(self, pesagens_ids):
    """
    Processa um lote de pesagens
    """
    try:
        pesagens = Pesagem.objects.filter(id__in=pesagens_ids)
        processadas = 0
        
        for pesagem in pesagens:
            # Atualiza categoria do animal baseado no peso
            animal = pesagem.animal
            peso = pesagem.peso_kg
            
            # Lógica para atualizar categoria baseado no peso
            if animal.sexo == 'M':
                if peso >= 500:
                    animal.categoria = 'touro'
                elif peso >= 300:
                    animal.categoria = 'novilho'
                else:
                    animal.categoria = 'bezerro'
            else:  # Fêmea
                if peso >= 400:
                    animal.categoria = 'vaca'
                elif peso >= 250:
                    animal.categoria = 'novilha'
                else:
                    animal.categoria = 'bezerra'
            
            animal.save()
            processadas += 1
        
        logger.info(f"Processadas {processadas} pesagens")
        
        return {
            'status': 'success',
            'processadas': processadas
        }
        
    except Exception as e:
        logger.error(f"Erro no processamento de pesagens: {str(e)}")
        raise


@shared_task(bind=True)
def exportar_dados_propriedade(self, propriedade_id, formato='excel'):
    """
    Exporta dados completos de uma propriedade
    """
    try:
        propriedade = Propriedade.objects.get(id=propriedade_id)
        
        # Coleta dados
        dados = {
            'animais': list(propriedade.animais.all().values()),
            'manejos': list(propriedade.manejos.all().values()),
            'pesagens': list(Pesagem.objects.filter(
                animal__propriedade=propriedade
            ).values()),
            'financeiro': list(propriedade.lancamentos_financeiros.all().values()),
        }
        
        # Exporta no formato solicitado
        if formato == 'excel':
            arquivo = export_to_excel(dados, f'dados_{propriedade.nome}')
        else:
            arquivo = json.dumps(dados, indent=2)
        
        # Salva arquivo
        filename = f'export_{propriedade.nome}_{timezone.now().strftime("%Y%m%d_%H%M%S")}.{formato}'
        filepath = os.path.join('media', 'exports', filename)
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb' if formato == 'excel' else 'w') as f:
            f.write(arquivo)
        
        logger.info(f"Dados exportados: {filename}")
        
        return {
            'status': 'success',
            'arquivo': filename,
            'propriedade': propriedade.nome
        }
        
    except Exception as e:
        logger.error(f"Erro na exportação: {str(e)}")
        raise


def gerar_relatorio_propriedade(propriedade, data_inicio, data_fim):
    """
    Gera dados de relatório para uma propriedade
    """
    try:
        # Estatísticas gerais
        total_animais = propriedade.animais.filter(status='ativo').count()
        
        # Manejos do período
        manejos = propriedade.manejos.filter(
            data_manejo__range=[data_inicio, data_fim]
        )
        
        # Pesagens do período
        pesagens = Pesagem.objects.filter(
            animal__propriedade=propriedade,
            data_pesagem__range=[data_inicio, data_fim]
        )
        
        # Lançamentos financeiros
        lancamentos = propriedade.lancamentos_financeiros.filter(
            data_lancamento__range=[data_inicio, data_fim]
        )
        
        relatorio = {
            'propriedade': propriedade.nome,
            'periodo': f"{data_inicio} a {data_fim}",
            'estatisticas': {
                'total_animais': total_animais,
                'total_manejos': manejos.count(),
                'total_pesagens': pesagens.count(),
                'total_receitas': lancamentos.filter(tipo='entrada').aggregate(
                    total=Sum('valor')
                )['total'] or 0,
                'total_despesas': lancamentos.filter(tipo='saida').aggregate(
                    total=Sum('valor')
                )['total'] or 0,
            },
            'manejos_por_tipo': list(manejos.values('tipo').annotate(
                total=Count('id')
            )),
            'peso_medio': pesagens.aggregate(
                media=Sum('peso_kg')
            )['media'] or 0,
        }
        
        return relatorio
        
    except Exception as e:
        logger.error(f"Erro na geração do relatório: {str(e)}")
        return None
