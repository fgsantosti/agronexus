# Correções Aplicadas no Setup do AgroNexus

## Problemas Identificados e Soluções

### 1. Erro do Superusuário
**Problema**: O script original tentava usar `User.objects` do Django padrão, mas o projeto usa um modelo customizado `Usuario`.

**Erro**:
```
AttributeError: Manager isn't available; 'auth.User' has been swapped for 'agronexus.Usuario'
```

**Solução**: Alterado para usar `Usuario` do modelo customizado:
```python
from agronexus.models import Usuario
Usuario.objects.create_superuser('admin', 'admin@admin.com', 'admin123')
```

### 2. Conflito no Diretório de Testes
**Problema**: Existia um diretório `agronexus/tests/` que conflitava com o arquivo `tests.py`, causando erro de importação.

**Erro**:
```
ImportError: 'tests' module incorrectly imported from '/root/agronexus/agronexus/tests'. 
Expected '/root/agronexus/agronexus'. Is this module globally installed?
```

**Solução**: Removido o diretório `tests/` conflitante, mantendo apenas `tests.py`.

### 3. Warning de Diretório Static
**Problema**: O diretório `static/` não existia, causando warning.

**Warning**:
```
(staticfiles.W004) The directory '/root/agronexus/static' in the STATICFILES_DIRS setting does not exist.
```

**Solução**: Criado o diretório `static/` na raiz do projeto.

## Arquivos Criados/Modificados

### 1. `setup.sh` (original corrigido)
- Corrigida a criação do superusuário para usar modelo customizado
- Adicionadas verificações de ambiente
- Melhorada a robustez do script

### 2. `setup-simple.sh` (novo script)
- Script simplificado e mais robusto
- Melhor tratamento de erros
- Comandos organizados de forma mais clara
- Verificações de pré-requisitos

### 3. `.env` (arquivo de configuração)
- Criado arquivo de configuração básico
- Variáveis de ambiente padrão para desenvolvimento

### 4. `static/` (diretório)
- Criado diretório para arquivos estáticos
- Remove o warning do Django

## Como Usar

### Script Principal (Recomendado)
```bash
./setup-simple.sh
```

### Script Original (Corrigido)
```bash
./setup.sh
```

### Comandos Manuais
Se preferir executar passo a passo:

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Verificar sistema
python manage.py check

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Criar superusuário (se necessário)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

## Credenciais Padrão

- **Usuário**: admin
- **Email**: admin@admin.com  
- **Senha**: admin123

## URLs Importantes

- API Docs (Swagger): http://localhost:8000/api/docs/
- API Docs (ReDoc): http://localhost:8000/api/redoc/
- Admin Django: http://localhost:8000/admin/
