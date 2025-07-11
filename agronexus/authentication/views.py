"""
AgroNexus - Sistema 
Sistema de autenticação com JWT
"""

from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)

from ..api.v1.serializers import UsuarioSerializer
from ..models import Propriedade, Usuario


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View customizada para obter tokens JWT
    """

    @extend_schema(
        operation_id='auth_login',
        summary='Fazer login',
        description='Autentica o usuário e retorna tokens JWT',
        tags=['Autenticação']
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Adiciona dados do usuário à resposta
            user = authenticate(
                username=request.data.get('username'),
                password=request.data.get('password')
            )

            if user:
                # Atualiza último login
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])

                # Adiciona dados do usuário
                serializer = UsuarioSerializer(user)
                response.data['user'] = serializer.data

                # Adiciona informações de propriedades
                propriedades = Propriedade.objects.filter(proprietario=user)
                response.data['propriedades'] = [
                    {
                        'id': prop.id,
                        'nome': prop.nome,
                        'ativa': prop.ativa
                    }
                    for prop in propriedades
                ]

        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    View customizada para renovar tokens JWT
    """

    @extend_schema(
        operation_id='auth_refresh',
        summary='Renovar token',
        description='Renova o token de acesso usando o refresh token',
        tags=['Autenticação']
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    """
    View para logout (blacklist do refresh token)
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id='auth_logout',
        summary='Fazer logout',
        description='Faz logout do usuário e invalida o refresh token',
        tags=['Autenticação']
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')

            if not refresh_token:
                return Response(
                    {'error': 'Refresh token é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Blacklist do token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': 'Logout realizado com sucesso'},
                status=status.HTTP_205_RESET_CONTENT
            )

        except Exception as e:
            return Response(
                {'error': 'Token inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(APIView):
    """
    View para registro de novos usuários
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        operation_id='auth_register',
        summary='Registrar usuário',
        description='Registra um novo usuário no sistema',
        tags=['Autenticação']
    )
    def post(self, request):
        # Validação dos dados obrigatórios
        required_fields = ['username', 'email',
                           'password', 'first_name', 'last_name']
        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': f'Campo {field} é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Verifica se o username já existe
        if Usuario.objects.filter(username=request.data['username']).exists():
            return Response(
                {'error': 'Nome de usuário já existe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verifica se o email já existe
        if Usuario.objects.filter(email=request.data['email']).exists():
            return Response(
                {'error': 'Email já está em uso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validação da senha
        try:
            validate_password(request.data['password'])
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cria o usuário
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Gera tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Usuário criado com sucesso',
                'user': serializer.data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    View para alteração de senha
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id='auth_change_password',
        summary='Alterar senha',
        description='Altera a senha do usuário autenticado',
        tags=['Autenticação']
    )
    def post(self, request):
        user = request.user

        # Validação dos dados
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Senha atual e nova senha são obrigatórias'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verifica senha atual
        if not user.check_password(old_password):
            return Response(
                {'error': 'Senha atual incorreta'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Valida nova senha
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Altera a senha
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Senha alterada com sucesso'},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    """
    View para perfil do usuário
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id='auth_profile',
        summary='Perfil do usuário',
        description='Retorna dados do perfil do usuário autenticado',
        tags=['Autenticação']
    )
    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        operation_id='auth_update_profile',
        summary='Atualizar perfil',
        description='Atualiza dados do perfil do usuário autenticado',
        tags=['Autenticação']
    )
    def put(self, request):
        serializer = UsuarioSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckTokenView(APIView):
    """
    View para verificar se o token é válido
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id='auth_check_token',
        summary='Verificar token',
        description='Verifica se o token de acesso é válido',
        tags=['Autenticação']
    )
    def get(self, request):
        return Response({
            'valid': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'perfil': request.user.perfil,
                'ativo': request.user.ativo,
            }
        })


# Views funcionais para compatibilidade

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    View funcional para login
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username e password são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user:
        if not user.ativo:
            return Response(
                {'error': 'Usuário inativo'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Atualiza último login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        # Gera tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UsuarioSerializer(user).data
        })

    return Response(
        {'error': 'Credenciais inválidas'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    View funcional para logout
    """
    try:
        refresh_token = request.data.get('refresh_token')

        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response(
            {'message': 'Logout realizado com sucesso'},
            status=status.HTTP_205_RESET_CONTENT
        )

    except Exception:
        return Response(
            {'error': 'Erro ao fazer logout'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info_view(request):
    """
    View funcional para informações do usuário
    """
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)


# Middleware customizado para logging de autenticação
class AuthenticationLoggingMiddleware:
    """
    Middleware para logging de tentativas de autenticação
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Processa requisições de login
        if request.path.startswith('/api/auth/login/'):
            # Log da tentativa de login
            username = request.POST.get(
                'username') or request.data.get('username')
            if username:
                print(f"Tentativa de login para usuário: {username}")

        response = self.get_response(request)
        return response
