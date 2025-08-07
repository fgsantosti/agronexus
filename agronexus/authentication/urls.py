"""
AgroNexus - Sistema 
URLs de autenticação
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (ChangePasswordView, CheckTokenView,
                    CustomTokenObtainPairView, CustomTokenRefreshView,
                    LogoutView, RegisterView, UserProfileView, login_view,
                    logout_view, user_info_view, RegistroPublicoView)

urlpatterns = [
    # JWT Token endpoints
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Authentication endpoints
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('registro/', RegistroPublicoView.as_view(), name='registro_publico'),  # Novo endpoint
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('check-token/', CheckTokenView.as_view(), name='check_token'),

    # Functional endpoints (for compatibility)
    path('login/func/', login_view, name='login_func'),
    path('logout/func/', logout_view, name='logout_func'),
    path('user-info/', user_info_view, name='user_info'),
]
