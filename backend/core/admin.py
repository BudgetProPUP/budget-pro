from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# Register your models here.


from .models import (
    User, Department, AccountType, Account, FiscalYear,
    BudgetProposal, BudgetProposalItem, BudgetAllocation,
    BudgetTransfer, JournalEntry, JournalEntryLine, Expense,
    ProposalHistory, ProposalComment, TransactionAudit,
    Project, ProjectMilestone, DashboardMetric, RiskMetric,
    UserActivityLog, LoginAttempt
)

# Create a custom admin class for the User model that extends Django's UserAdmin
# Allows for customizing how users are displayed and edited in the admin interface
class CustomUserAdmin(UserAdmin):
    model = User  # Specify which model this admin class is for
    
    # Define which fields to show in the users list view
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff')
    
    # Define how fields are grouped when editing an existing user
    # Each tuple contains a section name and a dictionary with the fields for that section
    fieldsets = (
        # Main user credentials section
        (None, {'fields': ('email', 'username', 'password')}),
        
        # Personal information section
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'department')}),
        
        # User permissions section
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        
        # Timestamps section
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    # Define fields to show when adding a new user
    # This is separate from fieldsets because when adding a user, you need password1/password2 fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),  # CSS class for styling
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_staff')}
        ),
    )
    
    # Fields that can't be edited (auto-populated)
    readonly_fields = ('created_at', 'updated_at')

# Register all models with the Django admin site
# Makes it available in the Django admin interface

# Register User with our custom admin class for enhanced control
admin.site.register(User, CustomUserAdmin)

# Register all other models with the default ModelAdmin class
# Basic CRUD functionality in the admin interface
admin.site.register(Department)
admin.site.register(AccountType)
admin.site.register(Account)
admin.site.register(FiscalYear)
admin.site.register(BudgetProposal)
admin.site.register(BudgetProposalItem)
admin.site.register(BudgetAllocation)
admin.site.register(BudgetTransfer)
admin.site.register(JournalEntry)
admin.site.register(JournalEntryLine)
admin.site.register(Expense)
admin.site.register(ProposalHistory)
admin.site.register(ProposalComment)
admin.site.register(TransactionAudit)
admin.site.register(Project)
admin.site.register(ProjectMilestone)
admin.site.register(DashboardMetric)
admin.site.register(RiskMetric)
admin.site.register(UserActivityLog)
admin.site.register(LoginAttempt)