"""
Comando para configurar grupos e permissões do AgroNexus
"""
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Configura grupos e permissões do sistema AgroNexus'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Configurando grupos e permissões do AgroNexus...')

        # Criar os grupos
        self.create_groups()

        # Configurar permissões
        self.configure_permissions()

        self.stdout.write(
            self.style.SUCCESS(
                '✅ Grupos e permissões configurados com sucesso!')
        )

    def create_groups(self):
        """Cria os grupos do sistema"""
        grupos = [
            'Proprietário',
            'Gerente',
            'Funcionário',
            'Veterinário'
        ]

        for grupo_nome in grupos:
            grupo, created = Group.objects.get_or_create(name=grupo_nome)
            if created:
                self.stdout.write(f'✅ Grupo "{grupo_nome}" criado')
            else:
                self.stdout.write(f'ℹ️  Grupo "{grupo_nome}" já existe')

    def get_permissions_by_codename(self, codenames):
        """Busca permissões pelos codenames"""
        permissions = []
        for codename in codenames:
            try:
                perm = Permission.objects.get(codename=codename)
                permissions.append(perm)
            except Permission.DoesNotExist:
                self.stdout.write(f'⚠️  Permissão não encontrada: {codename}')
        return permissions

    def get_agronexus_permissions(self):
        """Retorna apenas as permissões do app AgroNexus"""
        # Buscar ContentType do app agronexus
        agronexus_ct = ContentType.objects.filter(app_label='agronexus')
        agronexus_permissions = Permission.objects.filter(
            content_type__in=agronexus_ct)
        return agronexus_permissions

    def configure_permissions(self):
        """Configura as permissões para cada grupo"""
        try:
            # Obter os grupos
            proprietario = Group.objects.get(name='Proprietário')
            gerente = Group.objects.get(name='Gerente')
            funcionario = Group.objects.get(name='Funcionário')
            veterinario = Group.objects.get(name='Veterinário')

            # PROPRIETÁRIO - Acesso total apenas às funcionalidades do AgroNexus
            self.stdout.write('🔧 Configurando permissões do Proprietário...')
            agronexus_permissions = self.get_agronexus_permissions()
            proprietario.permissions.set(agronexus_permissions)
            self.stdout.write(
                f'✅ Proprietário: {proprietario.permissions.count()} permissões atribuídas')

            # GERENTE - Permissões administrativas amplas
            self.stdout.write('🔧 Configurando permissões do Gerente...')
            gerente_codenames = [
                # Usuários - pode visualizar e editar, mas não deletar
                'view_usuario', 'add_usuario', 'change_usuario',

                # Propriedades - acesso total exceto deletar
                'view_propriedade', 'add_propriedade', 'change_propriedade',

                # Áreas - acesso total
                'view_area', 'add_area', 'change_area', 'delete_area',

                # Animais - acesso total
                'view_animal', 'add_animal', 'change_animal', 'delete_animal',

                # Lotes - acesso total
                'view_lote', 'add_lote', 'change_lote', 'delete_lote',

                # Manejos - acesso total
                'view_manejo', 'add_manejo', 'change_manejo', 'delete_manejo',
                'view_animalmanejo', 'add_animalmanejo', 'change_animalmanejo', 'delete_animalmanejo',

                # Pesagens - acesso total
                'view_pesagem', 'add_pesagem', 'change_pesagem', 'delete_pesagem',

                # Reprodução - acesso total
                'view_estacaomonta', 'add_estacaomonta', 'change_estacaomonta', 'delete_estacaomonta',
                'view_protocoloiatf', 'add_protocoloiatf', 'change_protocoloiatf', 'delete_protocoloiatf',
                'view_inseminacao', 'add_inseminacao', 'change_inseminacao', 'delete_inseminacao',
                'view_diagnosticogestacao', 'add_diagnosticogestacao', 'change_diagnosticogestacao', 'delete_diagnosticogestacao',
                'view_parto', 'add_parto', 'change_parto', 'delete_parto',

                # Sanidade - acesso total
                'view_vacina', 'add_vacina', 'change_vacina', 'delete_vacina',
                'view_medicamento', 'add_medicamento', 'change_medicamento', 'delete_medicamento',
                'view_vacinacao', 'add_vacinacao', 'change_vacinacao', 'delete_vacinacao',
                'view_administracaomedicamento', 'add_administracaomedicamento', 'change_administracaomedicamento', 'delete_administracaomedicamento',
                'view_calendariosanitario', 'add_calendariosanitario', 'change_calendariosanitario', 'delete_calendariosanitario',

                # Financeiro - acesso total
                'view_contafinanceira', 'add_contafinanceira', 'change_contafinanceira', 'delete_contafinanceira',
                'view_categoriafinanceira', 'add_categoriafinanceira', 'change_categoriafinanceira', 'delete_categoriafinanceira',
                'view_lancamentofinanceiro', 'add_lancamentofinanceiro', 'change_lancamentofinanceiro', 'delete_lancamentofinanceiro',

                # Relatórios - acesso total
                'view_relatoriopersonalizado', 'add_relatoriopersonalizado', 'change_relatoriopersonalizado', 'delete_relatoriopersonalizado',

                # Históricos - acesso total
                'view_historicoocupacaoarea', 'add_historicoocupacaoarea', 'change_historicoocupacaoarea', 'delete_historicoocupacaoarea',

                # Configurações - apenas visualizar
                'view_configuracaosistema', 'change_configuracaosistema',
            ]
            gerente_perms = self.get_permissions_by_codename(gerente_codenames)
            gerente.permissions.set(gerente_perms)
            self.stdout.write(
                f'✅ Gerente: {gerente.permissions.count()} permissões atribuídas')

            # FUNCIONÁRIO - Permissões operacionais básicas
            self.stdout.write('🔧 Configurando permissões do Funcionário...')
            funcionario_codenames = [
                # Visualizar propriedades e áreas
                'view_propriedade', 'view_area',

                # Animais - pode visualizar, adicionar e editar
                'view_animal', 'add_animal', 'change_animal',

                # Lotes - pode visualizar, adicionar e editar
                'view_lote', 'add_lote', 'change_lote',

                # Manejos - pode visualizar, adicionar e editar
                'view_manejo', 'add_manejo', 'change_manejo',
                'view_animalmanejo', 'add_animalmanejo', 'change_animalmanejo',

                # Pesagens - acesso total
                'view_pesagem', 'add_pesagem', 'change_pesagem', 'delete_pesagem',

                # Reprodução básica - apenas visualizar e registrar
                'view_estacaomonta', 'view_protocoloiatf', 'view_inseminacao', 'view_diagnosticogestacao',
                'view_parto', 'add_parto', 'change_parto',

                # Sanidade básica - apenas visualizar e aplicar
                'view_vacina', 'view_medicamento', 'view_vacinacao', 'add_vacinacao',
                'view_administracaomedicamento', 'add_administracaomedicamento',
                'view_calendariosanitario',

                # Históricos - pode visualizar e adicionar
                'view_historicoocupacaoarea', 'add_historicoocupacaoarea',

                # Relatórios - apenas visualizar
                'view_relatoriopersonalizado',
            ]
            funcionario_perms = self.get_permissions_by_codename(
                funcionario_codenames)
            funcionario.permissions.set(funcionario_perms)
            self.stdout.write(
                f'✅ Funcionário: {funcionario.permissions.count()} permissões atribuídas')

            # VETERINÁRIO - Foco em sanidade e reprodução
            self.stdout.write('🔧 Configurando permissões do Veterinário...')
            veterinario_codenames = [
                # Visualizar propriedades e áreas
                'view_propriedade', 'view_area',

                # Animais - acesso total para diagnóstico
                'view_animal', 'add_animal', 'change_animal',

                # Lotes - visualizar para contexto sanitário
                'view_lote',

                # Manejos - especializado em sanidade
                'view_manejo', 'add_manejo', 'change_manejo',
                'view_animalmanejo', 'add_animalmanejo', 'change_animalmanejo',

                # Pesagens - para acompanhamento
                'view_pesagem', 'add_pesagem', 'change_pesagem',

                # Reprodução - acesso total
                'view_estacaomonta', 'add_estacaomonta', 'change_estacaomonta', 'delete_estacaomonta',
                'view_protocoloiatf', 'add_protocoloiatf', 'change_protocoloiatf', 'delete_protocoloiatf',
                'view_inseminacao', 'add_inseminacao', 'change_inseminacao', 'delete_inseminacao',
                'view_diagnosticogestacao', 'add_diagnosticogestacao', 'change_diagnosticogestacao', 'delete_diagnosticogestacao',
                'view_parto', 'add_parto', 'change_parto', 'delete_parto',

                # Sanidade - acesso total
                'view_vacina', 'add_vacina', 'change_vacina', 'delete_vacina',
                'view_medicamento', 'add_medicamento', 'change_medicamento', 'delete_medicamento',
                'view_vacinacao', 'add_vacinacao', 'change_vacinacao', 'delete_vacinacao',
                'view_administracaomedicamento', 'add_administracaomedicamento', 'change_administracaomedicamento', 'delete_administracaomedicamento',
                'view_calendariosanitario', 'add_calendariosanitario', 'change_calendariosanitario', 'delete_calendariosanitario',

                # Históricos - para acompanhamento
                'view_historicoocupacaoarea',

                # Relatórios - criar relatórios veterinários
                'view_relatoriopersonalizado', 'add_relatoriopersonalizado', 'change_relatoriopersonalizado',
            ]
            veterinario_perms = self.get_permissions_by_codename(
                veterinario_codenames)
            veterinario.permissions.set(veterinario_perms)
            self.stdout.write(
                f'✅ Veterinário: {veterinario.permissions.count()} permissões atribuídas')

            self.stdout.write('✅ Permissões configuradas com sucesso!')

        except Group.DoesNotExist as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro: Grupo não encontrado - {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro ao configurar permissões: {e}')
            )

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Remove todos os grupos antes de criar novos',
        )

        if hasattr(parser, 'reset') and parser.reset:
            self.stdout.write('🗑️  Removendo grupos existentes...')
            Group.objects.filter(
                name__in=['Proprietário', 'Gerente',
                          'Funcionário', 'Veterinário']
            ).delete()
