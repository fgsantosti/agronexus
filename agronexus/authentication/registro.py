"""
AgroNexus - Sistema 
View para registro público de usuários
"""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..api.v1.serializers import UsuarioSerializer
from ..models import Usuario


class RegistroPublicoView(APIView):
    """
    View para registro público de novos usuários - sem necessidade de autenticação
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        operation_id='registro_usuario_publico',
        summary='Registrar novo usuário',
        description='''
        Endpoint público para registro de novos usuários no sistema AgroNexus.
        Não requer autenticação prévia. Retorna tokens JWT após criação bem-sucedida.
        ''',
        tags=['Autenticação'],
        request=UsuarioSerializer,
        responses={
            201: OpenApiResponse(
                description='Usuário criado com sucesso',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {'type': 'string'},
                        'user_id': {'type': 'integer'},
                        'username': {'type': 'string'},
                        'tokens': {
                            'type': 'object',
                            'properties': {
                                'access': {'type': 'string'},
                                'refresh': {'type': 'string'}
                            }
                        }
                    }
                }
            ),
            400: OpenApiResponse(description='Dados inválidos')
        }
    )
    def post(self, request):
        """
        Registra um novo usuário no sistema
        """
        # Campos obrigatórios
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        
        # Validação de campos obrigatórios
        missing_fields = []
        for field in required_fields:
            if not request.data.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            return Response(
                {
                    'error': 'Campos obrigatórios ausentes',
                    'missing_fields': missing_fields,
                    'required_fields': required_fields
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar duplicação de username
        if Usuario.objects.filter(username=request.data['username']).exists():
            return Response(
                {'error': 'Nome de usuário já existe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar duplicação de email
        if Usuario.objects.filter(email=request.data['email']).exists():
            return Response(
                {'error': 'Email já está em uso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar duplicação de CPF (se fornecido)
        if request.data.get('cpf'):
            if Usuario.objects.filter(cpf=request.data['cpf']).exists():
                return Response(
                    {'error': 'CPF já está em uso'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validação da senha usando validadores do Django
        try:
            validate_password(request.data['password'])
        except ValidationError as e:
            return Response(
                {
                    'error': 'Senha inválida',
                    'details': list(e.messages)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Preparar dados para criação
            user_data = {
                'username': request.data['username'],
                'email': request.data['email'],
                'first_name': request.data['first_name'],
                'last_name': request.data['last_name'],
                'password': request.data['password'],
                'password_confirm': request.data['password']  # Para validação do serializer
            }
            
            # Campos opcionais
            optional_fields = ['telefone', 'cpf', 'data_nascimento']
            for field in optional_fields:
                if request.data.get(field):
                    user_data[field] = request.data[field]

            # Usar serializer para criar usuário
            serializer = UsuarioSerializer(data=user_data)
            
            if serializer.is_valid():
                # Criar o usuário
                user = serializer.save()
                
                # Gerar tokens JWT
                refresh = RefreshToken.for_user(user)
                
                # Resposta de sucesso
                return Response({
                    'message': 'Usuário criado com sucesso',
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    }
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    'error': 'Dados inválidos',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {
                    'error': 'Erro interno do servidor',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
