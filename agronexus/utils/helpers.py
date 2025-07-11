"""
AgroNexus - Sistema 
Utilitários diversos para o sistema
"""

import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone


def generate_unique_id():
    """Gera um ID único"""
    return str(uuid.uuid4())


def format_currency(value, currency='BRL'):
    """Formata valores monetários"""
    if value is None:
        return "R$ 0,00"

    if currency == 'BRL':
        return f"R$ {value:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    return f"{currency} {value:,.2f}"


def format_date(date_obj, format_str='%d/%m/%Y'):
    """Formata datas"""
    if date_obj is None:
        return ""

    if isinstance(date_obj, str):
        return date_obj

    return date_obj.strftime(format_str)


def format_datetime(datetime_obj, format_str='%d/%m/%Y %H:%M'):
    """Formata data e hora"""
    if datetime_obj is None:
        return ""

    if isinstance(datetime_obj, str):
        return datetime_obj

    return datetime_obj.strftime(format_str)


def calculate_age_in_days(birth_date, end_date=None):
    """Calcula idade em dias"""
    if end_date is None:
        end_date = timezone.now().date()

    if isinstance(birth_date, str):
        birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()

    return (end_date - birth_date).days


def calculate_age_in_months(birth_date, end_date=None):
    """Calcula idade em meses"""
    days = calculate_age_in_days(birth_date, end_date)
    return days // 30


def calculate_gmd(peso_inicial, peso_final, data_inicial, data_final):
    """Calcula GMD (Ganho Médio Diário)"""
    if peso_inicial is None or peso_final is None:
        return None

    if isinstance(data_inicial, str):
        data_inicial = datetime.strptime(data_inicial, '%Y-%m-%d').date()
    if isinstance(data_final, str):
        data_final = datetime.strptime(data_final, '%Y-%m-%d').date()

    diferenca_dias = (data_final - data_inicial).days

    if diferenca_dias <= 0:
        return None

    diferenca_peso = peso_final - peso_inicial
    return diferenca_peso / diferenca_dias


def calculate_ua_value(peso_kg, peso_referencia=450):
    """Calcula valor em UA (Unidade Animal)"""
    if peso_kg is None:
        return 0

    return float(peso_kg) / float(peso_referencia)


def calculate_stocking_rate(total_ua, area_ha):
    """Calcula taxa de lotação (UA/ha)"""
    if area_ha is None or area_ha <= 0:
        return 0

    return total_ua / float(area_ha)


def validate_cpf(cpf):
    """Valida CPF"""
    # Remove caracteres não numéricos
    cpf = ''.join(filter(str.isdigit, str(cpf)))

    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False

    # Verifica se todos os dígitos são iguais
    if cpf == cpf[0] * 11:
        return False

    # Calcula primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    # Calcula segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    # Verifica se os dígitos calculados conferem
    return cpf[9] == str(digito1) and cpf[10] == str(digito2)


def validate_cnpj(cnpj):
    """Valida CNPJ"""
    # Remove caracteres não numéricos
    cnpj = ''.join(filter(str.isdigit, str(cnpj)))

    # Verifica se tem 14 dígitos
    if len(cnpj) != 14:
        return False

    # Verifica se todos os dígitos são iguais
    if cnpj == cnpj[0] * 14:
        return False

    # Calcula primeiro dígito verificador
    multiplicadores1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * multiplicadores1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    # Calcula segundo dígito verificador
    multiplicadores2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * multiplicadores2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    # Verifica se os dígitos calculados conferem
    return cnpj[12] == str(digito1) and cnpj[13] == str(digito2)


def parse_coordinates(coord_string):
    """Parseia coordenadas GPS"""
    if not coord_string:
        return None

    try:
        # Tenta parsear como JSON
        return json.loads(coord_string)
    except:
        # Tenta parsear como string simples "lat,lng"
        try:
            parts = coord_string.split(',')
            return {
                'latitude': float(parts[0].strip()),
                'longitude': float(parts[1].strip())
            }
        except:
            return None


def calculate_distance(coord1, coord2):
    """Calcula distância entre duas coordenadas (em km)"""
    from math import asin, cos, radians, sin, sqrt

    if not coord1 or not coord2:
        return None

    # Converte para radianos
    lat1, lng1 = radians(coord1['latitude']), radians(coord1['longitude'])
    lat2, lng2 = radians(coord2['latitude']), radians(coord2['longitude'])

    # Fórmula de Haversine
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * asin(sqrt(a))

    # Raio da Terra em km
    r = 6371

    return c * r


def generate_report_data(queryset, fields, aggregations=None):
    """Gera dados para relatórios"""
    data = []

    for obj in queryset:
        row = {}
        for field in fields:
            if '.' in field:
                # Campo relacionado
                parts = field.split('.')
                value = obj
                for part in parts:
                    if hasattr(value, part):
                        value = getattr(value, part)
                    else:
                        value = None
                        break
                row[field] = value
            else:
                # Campo direto
                row[field] = getattr(obj, field, None)

        data.append(row)

    # Adiciona agregações se especificadas
    if aggregations:
        summary = {}
        for agg_name, agg_func in aggregations.items():
            if agg_func == 'count':
                summary[agg_name] = queryset.count()
            elif agg_func == 'sum':
                field = agg_name.replace('_sum', '')
                summary[agg_name] = queryset.aggregate(
                    total=Sum(field)
                )['total'] or 0
            elif agg_func == 'avg':
                field = agg_name.replace('_avg', '')
                summary[agg_name] = queryset.aggregate(
                    media=Avg(field)
                )['media'] or 0

        data.append({'summary': summary})

    return data


def export_to_csv(data, filename):
    """Exporta dados para CSV"""
    import csv
    from io import StringIO

    output = StringIO()

    if data:
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    return output.getvalue()


def export_to_excel(data, filename):
    """Exporta dados para Excel"""
    from io import BytesIO

    import pandas as pd

    output = BytesIO()

    if data:
        df = pd.DataFrame(data)
        df.to_excel(output, index=False, sheet_name='Dados')

    output.seek(0)
    return output.getvalue()


def create_backup_filename(model_name, user_id=None):
    """Cria nome de arquivo para backup"""
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')

    if user_id:
        return f"backup_{model_name}_{user_id}_{timestamp}.json"
    else:
        return f"backup_{model_name}_{timestamp}.json"


def serialize_for_backup(obj):
    """Serializa objeto para backup"""
    from django.core import serializers

    return serializers.serialize('json', [obj])


def deserialize_from_backup(data):
    """Deserializa dados de backup"""
    from django.core import serializers

    return list(serializers.deserialize('json', data))


class DateRangeHelper:
    """Helper para trabalhar com períodos de datas"""

    @staticmethod
    def get_current_month():
        """Retorna primeiro e último dia do mês atual"""
        hoje = timezone.now().date()
        primeiro_dia = hoje.replace(day=1)
        if hoje.month == 12:
            ultimo_dia = hoje.replace(
                year=hoje.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            ultimo_dia = hoje.replace(
                month=hoje.month + 1, day=1) - timedelta(days=1)

        return primeiro_dia, ultimo_dia

    @staticmethod
    def get_current_year():
        """Retorna primeiro e último dia do ano atual"""
        hoje = timezone.now().date()
        primeiro_dia = hoje.replace(month=1, day=1)
        ultimo_dia = hoje.replace(month=12, day=31)

        return primeiro_dia, ultimo_dia

    @staticmethod
    def get_last_n_days(n):
        """Retorna período dos últimos N dias"""
        fim = timezone.now().date()
        inicio = fim - timedelta(days=n)

        return inicio, fim

    @staticmethod
    def get_quarter(year, quarter):
        """Retorna primeiro e último dia do trimestre"""
        if quarter == 1:
            inicio = datetime(year, 1, 1).date()
            fim = datetime(year, 3, 31).date()
        elif quarter == 2:
            inicio = datetime(year, 4, 1).date()
            fim = datetime(year, 6, 30).date()
        elif quarter == 3:
            inicio = datetime(year, 7, 1).date()
            fim = datetime(year, 9, 30).date()
        else:  # quarter == 4
            inicio = datetime(year, 10, 1).date()
            fim = datetime(year, 12, 31).date()

        return inicio, fim


class StatisticsHelper:
    """Helper para cálculos estatísticos"""

    @staticmethod
    def calculate_percentile(values, percentile):
        """Calcula percentil de uma lista de valores"""
        if not values:
            return None

        values = sorted(values)
        n = len(values)
        index = (percentile / 100) * (n - 1)

        if index.is_integer():
            return values[int(index)]
        else:
            lower = values[int(index)]
            upper = values[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))

    @staticmethod
    def calculate_standard_deviation(values):
        """Calcula desvio padrão"""
        if not values or len(values) < 2:
            return None

        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return variance ** 0.5

    @staticmethod
    def calculate_growth_rate(initial_value, final_value, periods):
        """Calcula taxa de crescimento"""
        if initial_value <= 0 or final_value <= 0 or periods <= 0:
            return None

        return ((final_value / initial_value) ** (1 / periods) - 1) * 100


class ValidationHelper:
    """Helper para validações"""

    @staticmethod
    def validate_positive_number(value, field_name):
        """Valida se um número é positivo"""
        if value is None:
            return None

        if value <= 0:
            raise ValueError(f"{field_name} deve ser um número positivo")

        return value

    @staticmethod
    def validate_date_range(start_date, end_date):
        """Valida se o período de datas é válido"""
        if start_date and end_date:
            if start_date > end_date:
                raise ValueError("Data inicial deve ser anterior à data final")

        return True

    @staticmethod
    def validate_email(email):
        """Valida formato de email"""
        import re

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_phone(phone):
        """Valida formato de telefone"""
        import re

        # Remove caracteres não numéricos
        phone = ''.join(filter(str.isdigit, str(phone)))

        # Verifica se tem 10 ou 11 dígitos
        return len(phone) in [10, 11]
