from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

from .views_budget import AccountDropdownView, AccountSetupListView, BudgetProposalDetailView, BudgetProposalListView, BudgetProposalSummaryView, BudgetVarianceReportView, FiscalYearDropdownView, JournalEntryCreateView, JournalEntryListView, LedgerExportView, ProposalHistoryView, LedgerViewList, export_budget_proposal_excel, journal_choices, DepartmentDropdownView, AccountTypeDropdownView
from .views_usermanagement import UserManagementViewSet, DepartmentViewSet
from . import views_expense, views_dashboard  # ,TokenObtainPairView
from .views_dashboard import MonthlyBudgetActualViewSet, TopCategoryBudgetAllocationView
from .views import (
    LoginView,
    LogoutView,
    UserProfileView,
    LoginAttemptsView,
    CustomTokenRefreshView,
    ValidProjectAccountView,
    healthcheck_view
)

from .views_password_reset import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordChangeView
)
from core import views_budget


user_management_router = DefaultRouter()
user_management_router.register(
    r'users', UserManagementViewSet, basename='user-management')
user_management_router.register(
    r'departments', DepartmentViewSet, basename='department')
user_management_router.register(
    r'monthly-budget-actual', MonthlyBudgetActualViewSet, basename='monthly-budget-actual')

router = DefaultRouter()
router.register(r'external-budget-proposals', views_budget.BudgetProposalViewSet, basename='external-budget-proposals')
urlpatterns = [
     path('health/', healthcheck_view, name='healthcheck'),
     path('', include(router.urls)),
    # Authentication endpoints
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/',
         CustomTokenRefreshView.as_view(), name='token_refresh'),

    # Password reset endpoints
    path('auth/password/reset/', PasswordResetRequestView.as_view(),
         name='password_reset_request'),
    path('auth/password/reset/confirm/',
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password/change/',
         PasswordChangeView.as_view(), name='password_change'),

    # User management
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),

    # Security endpoint
    path('auth/login-attempts/', LoginAttemptsView.as_view(), name='login_attempts'),

    # path('api/expenses/dashboard/', views_expense.get_expense_dashboard_data, name='expense-dashboard'),

    # Department and user management endpoints
    path('user-management/', include(user_management_router.urls)),

    # API endpoints for dashboard elements
    path('department-budget/', views_dashboard.DepartmentBudgetView.as_view(),
         name='department-budget'),
    path('dashboard/project/', views_dashboard.get_project_status_list,
         name='project-table'),
    path('dashboard/budget-summary/', views_dashboard.get_dashboard_budget_summary,
         name='dashboard-budget-summary'),
    path('dashboard/department-actual/',
         views_dashboard.get_department_budget_status, name='dashboard-budget-summary'),

    # API endpoints for budget proposal page
    path('budget-proposals/', BudgetProposalListView.as_view(),
         name='budget-proposal-list'),
    path('budget-proposals/summary/', BudgetProposalSummaryView.as_view(),
         name='budget-proposal-summary'),
    path('budget-proposals/<int:pk>/', BudgetProposalDetailView.as_view(),
         name='budget-proposal-detail'),

    # API endpoints for proposal history page
    path('budget-proposals/history/',
         ProposalHistoryView.as_view(), name='proposal-history'),

    # API endpoints for account setup page
    path('accounts/setup/', AccountSetupListView.as_view(),
         name='account-setup-list'),

    # API endpoints for fiscal year dropdown
    path('dropdowns/fiscal-years/', FiscalYearDropdownView.as_view(),
         name='fiscal-year-dropdown'),

    path('ledger/', LedgerViewList.as_view(), name='ledger-view'),

    # API endpoint for the ledger file download
    path('ledger/export/', LedgerExportView.as_view(), name='ledger-export'),

    # API endpoint for the journal entry page
    path('journal-entries/', JournalEntryListView.as_view(),
         name='journal-entry-list'),
    path('journal-entries/create/', JournalEntryCreateView.as_view(),
         name='journal-entry-create'),


]

urlpatterns += [
    path('journal/accounts/', AccountDropdownView.as_view(),
         name='journal-account-dropdown'),
    path('journal/choices/', journal_choices, name='journal-choices'),
    # Dropdown endpoints for forms and filters
    path('journal/accounts/', AccountDropdownView.as_view(),
         name='journal-account-dropdown'),
    path('journal/choices/', journal_choices, name='journal-choices'),
    path('departments/', DepartmentDropdownView.as_view(),
         name='department-dropdown'),
    path('account-types/', AccountTypeDropdownView.as_view(),
         name='account-type-dropdown'),
    
    # API endpoint for the Expense pages
    path('expenses/history/', views_expense.ExpenseHistoryView.as_view(), name='expense-history'),
    path('expenses/tracking/', views_expense.ExpenseTrackingView.as_view(), name='expense-tracking'),
    path('expenses/submit/', views_expense.ExpenseCreateView.as_view(), name='submit-expense'),


    # API endpoint for quickly finding valid project with accounts and is active.
    path('expenses/valid-project-accounts/', ValidProjectAccountView.as_view(), name='valid-project-accounts'),
     
     # Dropdown endpoints for categories
    path('expense-categories/', views_expense.ExpenseCategoryDropdownView.as_view(), 
    name='expense-category-dropdown'),
]


# Added URLS
urlpatterns += [
    path('dashboard/top-category-allocations/', TopCategoryBudgetAllocationView.as_view(), name='top-category-allocations'),
    # For budget variance report page
    path('reports/budget-variance/', BudgetVarianceReportView.as_view(), name='budget-variance-report'),
]

# For budget proposal exporting ; GET /api/budget-proposals/{proposal_id}/export/

urlpatterns += [
    path('budget-proposals/<int:proposal_id>/export/', export_budget_proposal_excel, name='budget-proposal-export'),
]