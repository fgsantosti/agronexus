"""
Backend de autenticação customizado para permitir login com email ou username
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Backend que permite autenticação com email ou username
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if username is None or password is None:
            return None
        
        try:
            # Tentar primeiro com username
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                # Se não encontrar, tentar com email
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                # Se não encontrar nem por username nem por email, retornar None
                return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
