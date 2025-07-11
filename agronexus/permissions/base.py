"""
AgroNexus - Sistema Fertili
Permissões customizadas para API REST
"""

from django.core.exceptions import ObjectDoesNotExist
from rest_framework import permissions

from ..models import Propriedade


def get_user_groups(user):
    """
    Retorna os nomes dos grupos aos quais o usuário pertence.
    """
    if not user.is_authenticated:
        return []

    return list(user.groups.values_list('name', flat=True))


def user_has_group(user, group_name):
    """
    Verifica se o usuário pertence ao grupo especificado.
    """
    if not user.is_authenticated:
        return False

    return user.groups.filter(name=group_name).exists()


def user_has_any_group(user, group_names):
    """
    Verifica se o usuário pertence a qualquer um dos grupos especificados.
    """
    if not user.is_authenticated:
        return False

    return user.groups.filter(name__in=group_names).exists()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permissão que permite apenas aos proprietários do objeto editá-lo.
    """

    def has_object_permission(self, request, view, obj):
        # Permissões de leitura são permitidas para qualquer request,
        # então sempre permitimos requisições GET, HEAD ou OPTIONS.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Permissões de escrita são apenas para o proprietário do objeto.
        if hasattr(obj, 'proprietario'):
            return obj.proprietario == request.user
        elif hasattr(obj, 'usuario'):
            return obj.usuario == request.user

        return False


class PropriedadeOwnerPermission(permissions.BasePermission):
    """
    Permissão para objetos relacionados a propriedades.
    Permite acesso apenas aos proprietários da propriedade.
    """

    def has_permission(self, request, view):
        # Usuário deve estar autenticado
        if not request.user.is_authenticated:
            return False

        # Superusuários têm acesso total
        if request.user.is_superuser:
            return True

        # Para criação, verifica se o usuário tem propriedades
        if view.action == 'create':
            return Propriedade.objects.filter(proprietario=request.user).exists()

        return True

    def has_object_permission(self, request, view, obj):
        # Superusuários têm acesso total
        if request.user.is_superuser:
            return True

        # Verifica se o objeto pertence a uma propriedade do usuário
        if hasattr(obj, 'propriedade'):
            return obj.propriedade.proprietario == request.user

        # Para modelos que não têm propriedade direta, mas têm relacionamentos
        if hasattr(obj, 'animal') and hasattr(obj.animal, 'propriedade'):
            return obj.animal.propriedade.proprietario == request.user

        if hasattr(obj, 'manejo') and hasattr(obj.manejo, 'propriedade'):
            return obj.manejo.propriedade.proprietario == request.user

        if hasattr(obj, 'inseminacao') and hasattr(obj.inseminacao, 'animal'):
            return obj.inseminacao.animal.propriedade.proprietario == request.user

        if hasattr(obj, 'mae') and hasattr(obj.mae, 'propriedade'):
            return obj.mae.propriedade.proprietario == request.user

        if hasattr(obj, 'lote') and hasattr(obj.lote, 'propriedade'):
            return obj.lote.propriedade.proprietario == request.user

        if hasattr(obj, 'area') and hasattr(obj.area, 'propriedade'):
            return obj.area.propriedade.proprietario == request.user

        return False


class VeterinarioPermission(permissions.BasePermission):
    """
    Permissão especial para veterinários.
    Permite acesso a dados sanitários e reprodutivos.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            user_has_any_group(request.user,
                               ['Veterinário', 'Proprietário', 'Gerente'])
        )

    def has_object_permission(self, request, view, obj):
        # Veterinários podem acessar dados de todas as propriedades
        if user_has_group(request.user, 'Veterinário'):
            return True

        # Outros grupos seguem a regra padrão
        return PropriedadeOwnerPermission().has_object_permission(
            request, view, obj
        )


class GerentePermission(permissions.BasePermission):
    """
    Permissão para gerentes.
    Permite acesso de leitura e escrita limitada.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            user_has_any_group(request.user,
                               ['Gerente', 'Proprietário'])
        )

    def has_object_permission(self, request, view, obj):
        # Gerentes podem modificar dados operacionais, mas não financeiros
        if user_has_group(request.user, 'Gerente'):
            # Verifica se é um modelo financeiro
            financial_models = [
                'LancamentoFinanceiro', 'ContaFinanceira',
                'CategoriaFinanceira'
            ]

            if obj.__class__.__name__ in financial_models:
                # Apenas leitura para dados financeiros
                return request.method in permissions.SAFE_METHODS

        # Proprietários têm acesso total
        return PropriedadeOwnerPermission().has_object_permission(
            request, view, obj
        )


class FuncionarioPermission(permissions.BasePermission):
    """
    Permissão para funcionários.
    Permite apenas operações básicas de manejo.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Funcionários podem apenas registrar manejos e pesagens
        if user_has_group(request.user, 'Funcionário'):
            allowed_models = ['Manejo', 'Pesagem', 'Animal']

            if obj.__class__.__name__ in allowed_models:
                return PropriedadeOwnerPermission().has_object_permission(
                    request, view, obj
                )
            else:
                # Apenas leitura para outros modelos
                return request.method in permissions.SAFE_METHODS

        # Outros grupos seguem regras mais permissivas
        return True


class ReadOnlyPermission(permissions.BasePermission):
    """
    Permissão somente leitura.
    """

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS


class DynamicPermission(permissions.BasePermission):
    """
    Permissão dinâmica baseada nos grupos do usuário.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Mapeamento de grupos para permissões
        allowed_groups = [
            'Proprietário', 'Gerente', 'Veterinário', 'Funcionário'
        ]

        return user_has_any_group(request.user, allowed_groups)

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusuários têm acesso total
        if request.user.is_superuser:
            return True

        # Aplica permissões específicas por grupo
        if user_has_group(request.user, 'Proprietário'):
            return PropriedadeOwnerPermission().has_object_permission(
                request, view, obj
            )

        elif user_has_group(request.user, 'Gerente'):
            return GerentePermission().has_object_permission(
                request, view, obj
            )

        elif user_has_group(request.user, 'Veterinário'):
            return VeterinarioPermission().has_object_permission(
                request, view, obj
            )

        elif user_has_group(request.user, 'Funcionário'):
            return FuncionarioPermission().has_object_permission(
                request, view, obj
            )

        return False


class CalendarioSanitarioPermission(permissions.BasePermission):
    """
    Permissão específica para calendário sanitário.
    Veterinários podem criar/editar, outros apenas visualizar.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Leitura permitida para todos
        if request.method in permissions.SAFE_METHODS:
            return PropriedadeOwnerPermission().has_object_permission(
                request, view, obj
            )

        # Escrita apenas para veterinários e proprietários
        if user_has_any_group(request.user,
                              ['Veterinário', 'Proprietário']):
            return PropriedadeOwnerPermission().has_object_permission(
                request, view, obj
            )

        return False


class RelatorioPermission(permissions.BasePermission):
    """
    Permissão para relatórios.
    Todos podem criar relatórios, mas apenas o criador pode editá-los.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Leitura permitida para relatórios públicos ou próprios
        if request.method in permissions.SAFE_METHODS:
            return (
                obj.publico or
                obj.usuario == request.user or
                obj.propriedade.proprietario == request.user
            )

        # Escrita apenas para o criador do relatório
        return obj.usuario == request.user


class HistoricoPermission(permissions.BasePermission):
    """
    Permissão para históricos.
    Apenas leitura, não permite modificação.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.method in permissions.SAFE_METHODS
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.method in permissions.SAFE_METHODS and
            PropriedadeOwnerPermission().has_object_permission(
                request, view, obj
            )
        )


# Decorator para aplicar permissões baseadas no grupo
def apply_group_permissions(view_class):
    """
    Decorator que aplica permissões baseadas nos grupos do usuário.
    """
    original_get_permissions = view_class.get_permissions

    def get_permissions(self):
        """
        Aplica permissões baseadas nos grupos do usuário.
        """
        permissions = original_get_permissions(self)

        # Adiciona permissão dinâmica baseada nos grupos
        if (hasattr(self.request, 'user') and
                self.request.user.is_authenticated):
            permissions.append(DynamicPermission())

        return permissions

    view_class.get_permissions = get_permissions
    return view_class


# Mixin para ViewSets com permissões dinâmicas
class DynamicPermissionMixin:
    """
    Mixin que adiciona permissões dinâmicas baseadas nos grupos do usuário.
    """

    def get_permissions(self):
        """
        Retorna permissões baseadas na ação e grupos do usuário.
        """
        permissions = super().get_permissions()

        # Adiciona permissão dinâmica
        if (hasattr(self.request, 'user') and
                self.request.user.is_authenticated):
            permissions.append(DynamicPermission())

        # Permissões específicas por ação
        action_permissions = {
            'create': [permissions.IsAuthenticated],
            'update': [PropriedadeOwnerPermission],
            'partial_update': [PropriedadeOwnerPermission],
            'destroy': [PropriedadeOwnerPermission],
            'list': [permissions.IsAuthenticated],
            'retrieve': [permissions.IsAuthenticated],
        }

        if self.action in action_permissions:
            permissions.extend([p() for p in action_permissions[self.action]])

        return permissions
