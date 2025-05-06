from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver


class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AccountType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('FINANCE_HEAD', 'Finance Head'),
        ('FINANCE_OPERATOR', 'Finance Operator'),
    ]

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255)
    success = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Successful" if self.success else "Failed"
        user_str = self.user.username if self.user else "Unknown"
        return f"{status} login attempt by {user_str} at {self.timestamp}"


class Account(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    account_type = models.ForeignKey(AccountType, on_delete=models.PROTECT)
    parent_account = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                      related_name='child_accounts')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class FiscalYear(models.Model):
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name='check_end_date_after_start_date'
            )
        ]


class BudgetProposal(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    SYNC_STATUS_CHOICES = [
    ('SYNCED', 'Synced'),
    ('FAILED', 'Failed'),
    ('PENDING', 'Pending'),
    ('RETRYING', 'Retrying'),
    ]
    

    title = models.CharField(max_length=200)
    project_summary = models.TextField()
    project_description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT)
    submitted_by = models.ForeignKey(User, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    performance_start_date = models.DateField()
    performance_end_date = models.DateField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    last_modified = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    
    external_system_id = models.CharField(max_length=100, unique=True, help_text="ID reference from the external help desk system")
    last_sync_timestamp = models.DateTimeField(null=True, blank=True, help_text="When this proposal was last synced with the external system")
    sync_status = models.CharField(
        max_length=50,
        choices=SYNC_STATUS_CHOICES,
        default='PENDING',  # Default to "Pending" until first sync
    )
    
    def __str__(self):
        return self.title

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(performance_end_date__gt=models.F('performance_start_date')),
                name='check_performance_end_date_after_start_date'
            )
        ]


class BudgetProposalItem(models.Model):
    proposal = models.ForeignKey(BudgetProposal, on_delete=models.CASCADE, related_name='items')
    cost_element = models.CharField(max_length=100)
    description = models.TextField()
    estimated_cost = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.cost_element} - {self.estimated_cost}"


class BudgetAllocation(models.Model):
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT)
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.department.name} - {self.account.name} - {self.amount}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['fiscal_year', 'department', 'account'],
                name='unique_budget_allocation'
            )
        ]


class BudgetTransfer(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT)
    source_allocation = models.ForeignKey(BudgetAllocation, on_delete=models.PROTECT, related_name='transfers_from')
    destination_allocation = models.ForeignKey(BudgetAllocation, on_delete=models.PROTECT, related_name='transfers_to')
    transferred_by = models.ForeignKey(User, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    reason = models.TextField()
    transferred_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"Transfer of {self.amount} from {self.source_allocation.department.name} to {self.destination_allocation.department.name}"


class JournalEntry(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('POSTED', 'Posted'),
    ]

    entry_id = models.CharField(max_length=50, unique=True, editable=False)
    category = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.entry_id} - {self.description}"

    def save(self, *args, **kwargs):
        if not self.entry_id:
            # Generate a unique entry ID format
            year = self.date.year
            last_entry = JournalEntry.objects.filter(entry_id__startswith=f'JE-{year}-').order_by('-entry_id').first()
            if last_entry:
                last_number = int(last_entry.entry_id.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.entry_id = f'JE-{year}-{new_number:05d}'
        super().save(*args, **kwargs)


class JournalEntryLine(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('DEBIT', 'Debit'),
        ('CREDIT', 'Credit'),
    ]

    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    description = models.TextField()
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.transaction_type} {self.amount} to {self.account.name}"


class Expense(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    transaction_id = models.CharField(max_length=50, unique=True, editable=False)
    date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField()
    vendor = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    budget_allocation = models.ForeignKey(BudgetAllocation, on_delete=models.PROTECT)
    submitted_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='submitted_expenses')
    approved_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='approved_expenses')
    submitted_at = models.DateTimeField(auto_now_add=True)
    posting_date = models.DateField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    def __str__(self):
        return f"{self.description} - {self.date}"


class ProposalHistory(models.Model):
    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('UPDATED', 'Updated'),
    ]

    proposal = models.ForeignKey(BudgetProposal, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    action_by = models.ForeignKey(User, on_delete=models.PROTECT)
    action_at = models.DateTimeField(auto_now_add=True)
    previous_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    comments = models.TextField(blank=True)

    def __str__(self):
        return f"{self.proposal.title} {self.action} by {self.action_by.username}"

    class Meta:
        ordering = ['-action_at']
        verbose_name_plural = "Proposal histories"


class ProposalComment(models.Model):
    proposal = models.ForeignKey(BudgetProposal, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.proposal.title} by {self.user.username}"


class TransactionAudit(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('JOURNAL_ENTRY', 'Journal Entry'),
        ('TRANSFER', 'Transfer'),
    ]

    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('DELETED', 'Deleted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_id = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()

    def __str__(self):
        return f"{self.transaction_type} {self.transaction_id} {self.action} by {self.user.username}"


class Project(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('IN_PROGRESS', 'In Progress'),
        ('ON_HOLD', 'On Hold'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    budget_proposal = models.ForeignKey(BudgetProposal, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name='check_project_end_date_after_start_date'
            )
        ]

    @property
    def completion_percentage(self):
        """Calculate overall project completion based on milestones"""
        milestones = self.milestones.all()
        if not milestones.exists():
            return 0
        
        total_milestones = milestones.count()
        completed_weight = sum(m.completion_percentage for m in milestones)
        return completed_weight / total_milestones
        
    


class ProjectMilestone(models.Model):
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('DELAYED', 'Delayed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    completion_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')

    def __str__(self):
        return f"{self.project.name} - {self.title}"


class DashboardMetric(models.Model):
    metric_type = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=50)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        dept_str = f" - {self.department.name}" if self.department else ""
        return f"{self.metric_type}{dept_str} - {self.fiscal_year.name}"
    
    
class RiskMetric(models.Model):
    RISK_TYPE_CHOICES = [
        ('BUDGET', 'Budget'),
        ('TIMELINE', 'Timeline'),
        ('RESOURCES', 'Resources'),
        ('QUALITY', 'Quality'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='risk_metrics')
    risk_type = models.CharField(max_length=20, choices=RISK_TYPE_CHOICES)
    risk_level = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT)
    
    class Meta:
        unique_together = ('project', 'risk_type')   
        
class UserActivityLog(models.Model):
    LOG_TYPE_CHOICES = [
        ('LOGIN', 'Login'),
        ('EXPORT', 'Export'),
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('PROCESS', 'Process'),
        ('ERROR', 'Error'),
    ]
    
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('IN_PROGRESS', 'In Progress'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPE_CHOICES)
    action = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    details = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"