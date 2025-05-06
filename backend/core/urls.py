from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView #,TokenObtainPairView

from .views import (
    LoginView,
    LogoutView,
    UserProfileView,
    LoginAttemptsView
)
from .views_password_reset import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView
)

urlpatterns = [
    # Add your URL patterns here
    
    # Authentication endpoints
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password reset endpoints
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password/change/', PasswordChangeView.as_view(), name='password_change'),
    
    # User management
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/login-attempts/', LoginAttemptsView.as_view(), name='login_attempts'),
]