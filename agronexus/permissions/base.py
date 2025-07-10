"""
AgroNexus - Sistema Fertili
Permissões customizadas para API REST
"""

from rest_framework import permissions
from django.core.exceptions import ObjectDoesNotExist

from ..models import Propriedade


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
            request.user.perfil in ['veterinario', 'proprietario', 'gerente']
        )
    
    def has_object_permission(self, request, view, obj):
        # Veterinários podem acessar dados de todas as propriedades
        if request.user.perfil == 'veterinario':
            return True
        
        # Outros perfis seguem a regra padrão
        return PropriedadeOwnerPermission().has_object_permission(request, view, obj)


class GerentePermission(permissions.BasePermission):
    """
    Permissão para gerentes.
    Permite acesso de leitura e escrita limitada.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.perfil in ['gerente', 'proprietario']
        )
    
    def has_object_permission(self, request, view, obj):
        # Gerentes podem modificar dados operacionais, mas não financeiros
        if request.user.perfil == 'gerente':
            # Verifica se é um modelo financeiro
            financial_models = [
                'LancamentoFinanceiro', 'ContaFinanceira', 'CategoriaFinanceira'
            ]
            
            if obj.__class__.__name__ in financial_models:
                # Apenas leitura para dados financeiros
                return request.method in permissions.SAFE_METHODS
        
        # Proprietários têm acesso total
        return PropriedadeOwnerPermission().has_object_permission(request, view, obj)


class FuncionarioPermission(permissions.BasePermission):
    """
    Permissão para funcionários.
    Permite apenas operações básicas de manejo.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Funcionários podem apenas registrar manejos e pesagens
        if request.user.perfil == 'funcionario':
            allowed_models = ['Manejo', 'Pesagem', 'Animal']
            
            if obj.__class__.__name__ in allowed_models:
                return PropriedadeOwnerPermission().has_object_permission(request, view, obj)
            else:
                # Apenas leitura para outros modelos
                return request.method in permissions.SAFE_METHODS
        
        # Outros perfis seguem regras mais permissivas
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
    Permissão dinâmica baseada no perfil do usuário.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Mapeamento de perfis para permissões
        permission_map = {
            'proprietario': True,
            'gerente': True,
            'veterinario': True,
            'funcionario': True,
        }
        
        return permission_map.get(request.user.perfil, False)
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Superusuários têm acesso total
        if request.user.is_superuser:
            return True
        
        # Aplica permissões específicas por perfil
        if request.user.perfil == 'proprietario':
            return PropriedadeOwnerPermission().has_object_permission(request, view, obj)
        
        elif request.user.perfil == 'gerente':
            return GerentePermission().has_object_permission(request, view, obj)
        
        elif request.user.perfil == 'veterinario':
            return VeterinarioPermission().has_object_permission(request, view, obj)
        
        elif request.user.perfil == 'funcionario':
            return FuncionarioPermission().has_object_permission(request, view, obj)
        
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
            return PropriedadeOwnerPermission().has_object_permission(request, view, obj)
        
        # Escrita apenas para veterinários e proprietários
        if request.user.perfil in ['veterinario', 'proprietario']:
            return PropriedadeOwnerPermission().has_object_permission(request, view, obj)
        
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
            PropriedadeOwnerPermission().has_object_permission(request, view, obj)
        )


# Decorator para aplicar permissões baseadas no perfil
def apply_profile_permissions(view_class):
    """
    Decorator que aplica permissões baseadas no perfil do usuário.
    """
    original_get_permissions = view_class.get_permissions
    
    def get_permissions(self):
        """
        Aplica permissões baseadas no perfil do usuário.
        """
        permissions = original_get_permissions(self)
        
        # Adiciona permissão dinâmica baseada no perfil
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            permissions.append(DynamicPermission())
        
        return permissions
    
    view_class.get_permissions = get_permissions
    return view_class


# Mixin para ViewSets com permissões dinâmicas
class DynamicPermissionMixin:
    """
    Mixin que adiciona permissões dinâmicas baseadas no perfil do usuário.
    """
    
    def get_permissions(self):
        """
        Retorna permissões baseadas na ação e perfil do usuário.
        """
        permissions = super().get_permissions()
        
        # Adiciona permissão dinâmica
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
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
