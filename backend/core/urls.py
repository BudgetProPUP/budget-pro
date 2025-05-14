from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views_usermanagement import UserManagementViewSet, DepartmentViewSet
from . import views_expense, views_dashboard #,TokenObtainPairView

from .views import (
    LoginView,
    LogoutView,
    UserProfileView,
    LoginAttemptsView,
    CustomTokenRefreshView
)
from .views_password_reset import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView
)

user_management_router = DefaultRouter()
user_management_router.register(r'users', UserManagementViewSet, basename='user-management')
user_management_router.register(r'departments', DepartmentViewSet, basename='department')


urlpatterns = [
    # Authentication endpoints
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    
    # Password reset endpoints
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password/change/', PasswordChangeView.as_view(), name='password_change'),
    
    # User management
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Security endpoint
    path('auth/login-attempts/', LoginAttemptsView.as_view(), name='login_attempts'),
    
    #path('api/expenses/dashboard/', views_expense.get_expense_dashboard_data, name='expense-dashboard'),
    
    # Department and user management endpoints
    path('user-management/', include(user_management_router.urls)),
    
    # API endpoints for dashboard elements
    path('department-budget/', views_dashboard.DepartmentBudgetView.as_view(), name='department-budget'),
]