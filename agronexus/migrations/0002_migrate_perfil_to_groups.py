"""
Migração para migrar dados do campo perfil para grupos
"""
from django.contrib.auth.models import Group
from django.db import migrations


def migrate_perfil_to_groups(apps, schema_editor):
    """Migra os dados do campo perfil para grupos do Django"""
    Usuario = apps.get_model('agronexus', 'Usuario')

    # Mapear perfis para grupos
    perfil_map = {
        'proprietario': 'Proprietário',
        'gerente': 'Gerente',
        'funcionario': 'Funcionário',
        'veterinario': 'Veterinário',
    }

    # Criar os grupos se não existirem
    for grupo_name in perfil_map.values():
        Group.objects.get_or_create(name=grupo_name)

    # Migrar usuários
    for usuario in Usuario.objects.all():
        if hasattr(usuario, 'perfil') and usuario.perfil:
            grupo_name = perfil_map.get(usuario.perfil)
            if grupo_name:
                grupo, _ = Group.objects.get_or_create(name=grupo_name)
                usuario.groups.add(grupo)


def reverse_migrate_groups_to_perfil(apps, schema_editor):
    """Reverter a migração (opcional)"""
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('agronexus', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            migrate_perfil_to_groups,
            reverse_migrate_groups_to_perfil
        ),
    ]
