"""
Migração customizada para adicionar espécies e raças
"""
from django.db import migrations, models
from django.db.models import deletion
import uuid


def criar_especies_iniciais(apps, schema_editor):
    """Cria as espécies iniciais"""
    EspecieAnimal = apps.get_model('agronexus', 'EspecieAnimal')
    
    especies_data = [
        {
            'id': 1,
            'nome': 'bovino',
            'nome_display': 'Bovino',
            'peso_ua_referencia': 450,
            'periodo_gestacao_dias': 285,
            'idade_primeira_cobertura_meses': 24,
        },
        {
            'id': 2,
            'nome': 'caprino',
            'nome_display': 'Caprino',
            'peso_ua_referencia': 45,
            'periodo_gestacao_dias': 150,
            'idade_primeira_cobertura_meses': 12,
        },
        {
            'id': 3,
            'nome': 'ovino',
            'nome_display': 'Ovino',
            'peso_ua_referencia': 45,
            'periodo_gestacao_dias': 150,
            'idade_primeira_cobertura_meses': 12,
        },
    ]
    
    for dados in especies_data:
        EspecieAnimal.objects.get_or_create(
            id=dados['id'],
            defaults=dados
        )


def reverter_especies(apps, schema_editor):
    """Remove as espécies criadas"""
    EspecieAnimal = apps.get_model('agronexus', 'EspecieAnimal')
    EspecieAnimal.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('agronexus', '0003_merge_20250711_1046'),
    ]

    operations = [
        # Primeiro cria a tabela de espécies
        migrations.CreateModel(
            name='EspecieAnimal',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome', models.CharField(choices=[('bovino', 'Bovino'), ('caprino', 'Caprino'), ('ovino', 'Ovino'), ('equino', 'Equino'), ('suino', 'Suíno')], max_length=20, unique=True)),
                ('nome_display', models.CharField(max_length=50)),
                ('peso_ua_referencia', models.DecimalField(decimal_places=2, default=450, help_text='Peso de referência para 1 UA em kg', max_digits=6)),
                ('periodo_gestacao_dias', models.IntegerField(default=285, help_text='Período de gestação em dias')),
                ('idade_primeira_cobertura_meses', models.IntegerField(default=24, help_text='Idade recomendada para primeira cobertura')),
                ('ativo', models.BooleanField(default=True)),
                ('data_criacao', models.DateTimeField(auto_now_add=True)),
                ('data_atualizacao', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Espécie Animal',
                'verbose_name_plural': 'Espécies Animais',
                'db_table': 'especies_animais',
                'ordering': ['nome'],
            },
        ),
        
        # Depois cria a tabela de raças
        migrations.CreateModel(
            name='RacaAnimal',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nome', models.CharField(max_length=100)),
                ('origem', models.CharField(blank=True, max_length=100)),
                ('caracteristicas', models.TextField(blank=True)),
                ('peso_medio_adulto_kg', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('ativo', models.BooleanField(default=True)),
                ('data_criacao', models.DateTimeField(auto_now_add=True)),
                ('data_atualizacao', models.DateTimeField(auto_now=True)),
                ('especie', models.ForeignKey(on_delete=deletion.CASCADE, related_name='racas', to='agronexus.especieanimal')),
            ],
            options={
                'verbose_name': 'Raça Animal',
                'verbose_name_plural': 'Raças Animais',
                'db_table': 'racas_animais',
                'ordering': ['especie', 'nome'],
            },
        ),
        
        # Cria as espécies iniciais
        migrations.RunPython(
            criar_especies_iniciais,
            reverter_especies
        ),
        
        # Adiciona o campo espécie na tabela Animal
        migrations.AddField(
            model_name='animal',
            name='especie',
            field=models.ForeignKey(default=1, on_delete=deletion.CASCADE, related_name='animais', to='agronexus.especieanimal'),
        ),
        
        # Modifica o campo raça para usar ForeignKey
        migrations.RemoveField(
            model_name='animal',
            name='raca',
        ),
        migrations.AddField(
            model_name='animal',
            name='raca',
            field=models.ForeignKey(blank=True, null=True, on_delete=deletion.SET_NULL, related_name='animais', to='agronexus.racaanimal'),
        ),
        
        # Adiciona constraints
        migrations.AlterUniqueTogether(
            name='racaanimal',
            unique_together={('especie', 'nome')},
        ),
    ]
