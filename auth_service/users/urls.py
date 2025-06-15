# File: CapstoneBP/auth_service/users/urls.py
from django.urls import path
from .views import (
    LoginView, LogoutView, UserProfileView, CustomTokenRefreshView, LoginAttemptsView,
    PasswordResetRequestView, PasswordResetConfirmView, PasswordChangeView
)

app_name = 'users_auth' # Namespace for the app

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),

    # Password management endpoints
    path('password/request-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),

    # User profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # Security endpoint
    path('login-attempts/', LoginAttemptsView.as_view(), name='login_attempts'),
]