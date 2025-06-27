from decimal import Decimal
from core.models import Account, BudgetAllocation, Expense, ExpenseCategory, Project
from rest_framework import serializers 
from django.db.models import Sum
from django.utils import timezone

class ExpenseHistorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['date', 'description', 'category_name', 'amount']
        
class ExpenseTrackingSerializer(serializers.ModelSerializer):
    # ADDED: Map model fields to the new UI column names
    reference_no = serializers.CharField(source='transaction_id', read_only=True)
    type = serializers.CharField(source='account.account_type.name', read_only=True)
    accomplished = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        # UPDATED: Fields to match the new UI table
        fields = ['id', 'reference_no', 'type', 'description', 'status', 'accomplished', 'date']

    def get_accomplished(self, obj):
        # An expense is considered "Accomplished" if it has been approved.
        return "Yes" if obj.status == 'APPROVED' else "No"


class ExpenseCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    account_code = serializers.CharField(write_only=True)
    category_code = serializers.CharField(write_only=True)

    class Meta:
        model = Expense
        fields = [
            'project_id', 'account_code', 'category_code', # Input fields
            'amount', 'date', 'description', 'vendor', 'receipt', # Model fields
            # submitted_by_user_id and submitted_by_username will be set in create
        ]
        # Removed extra_kwargs for project, account, category as they are handled via _id/_code
        # Retain for amount and date if they should always be required from payload
        extra_kwargs = {
            'amount': {'required': True},
            'date': {'required': True},
            'description': {'required': True}, # Make description required
            'vendor': {'required': True},      # Make vendor required
        }


    def validate(self, data):
        project_id = data.get('project_id')
        account_code = data.get('account_code')
        category_code = data.get('category_code') # Get category_code for validation

        try:
            project = Project.objects.get(id=project_id)
            data['project_obj'] = project # Store for use in create
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project_id': 'Project not found'})

        today = timezone.now().date()
        if project.status == 'COMPLETED' or (project.end_date and today > project.end_date): # Check project.end_date exists
            raise serializers.ValidationError({'project_id': 'Cannot create expense for completed or past-due project'})

        try:
            account = Account.objects.get(code=account_code, is_active=True) # Ensure account is active
            data['account_obj'] = account # Store for use in create
        except Account.DoesNotExist:
            raise serializers.ValidationError({'account_code': 'Active account not found'})

        try:
            category = ExpenseCategory.objects.get(code=category_code, is_active=True) # Ensure category is active
            data['category_obj'] = category # Store for use in create
        except ExpenseCategory.DoesNotExist:
            raise serializers.ValidationError({'category_code': 'Active expense category not found'})

        try:
            # Allocation check should consider the project's department as well for clarity
            allocation = BudgetAllocation.objects.get(
                project=project,
                # account=account, # Can also filter by account if allocation is that specific
                department=project.department, # Expenses are usually tied to the project's department allocation
                is_active=True
            )
            data['allocation_obj'] = allocation # Store for use in create
        except BudgetAllocation.DoesNotExist:
            raise serializers.ValidationError({'non_field_errors': f'No active budget allocation found for project "{project.name}" in department "{project.department.name}".'})
        except BudgetAllocation.MultipleObjectsReturned:
             raise serializers.ValidationError({'non_field_errors': f'Multiple active budget allocations found for project "{project.name}". Please review allocations.'})


        # Check sufficient funds using the fetched allocation
        # Ensure amount is a Decimal for comparison
        expense_amount = data.get('amount')
        if not isinstance(expense_amount, Decimal):
            try:
                expense_amount = Decimal(str(expense_amount))
            except:
                raise serializers.ValidationError({'amount': 'Invalid amount format.'})


        if expense_amount > allocation.get_remaining_budget():
            raise serializers.ValidationError({'amount': f'Insufficient funds. Remaining: {allocation.get_remaining_budget()}'})

        return data

    def create(self, validated_data):
        project = validated_data.pop('project_obj')
        account = validated_data.pop('account_obj')
        category = validated_data.pop('category_obj')
        allocation = validated_data.pop('allocation_obj')

        request_user = self.context['request'].user # User from JWT

        expense = Expense.objects.create(
            project=project,
            budget_allocation=allocation,
            account=account,
            department=project.department, # Expense department is same as project's department
            category=category,
            submitted_by_user_id=request_user.id, # UPDATED
            submitted_by_username=getattr(request_user, 'username', 'N/A'), # UPDATED
            status='SUBMITTED', # Default status on creation
            **validated_data # Contains amount, date, description, vendor, receipt
        )
        return expense
    
class BudgetAllocationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for the 'Add Budget' modal. Creates a new BudgetAllocation.
    """
    # The UI shows 'Reference No.', which should map to a Project for a new allocation.
    project_id = serializers.IntegerField(write_only=True)
    # The UI shows 'Category', which maps to an ExpenseCategory.
    category_id = serializers.IntegerField(write_only=True)
    # We need an account to associate the allocation with.
    account_id = serializers.IntegerField(write_only=True)
    # Description field from the modal
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = BudgetAllocation
        fields = [
            'project_id', 'category_id', 'account_id', 'amount', 'description'
        ]

    def validate_project_id(self, value):
        if not Project.objects.filter(id=value).exists():
            raise serializers.ValidationError("Project not found.")
        return value

    def validate_category_id(self, value):
        if not ExpenseCategory.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Active expense category not found.")
        return value
    
    def validate_account_id(self, value):
        if not Account.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Active account not found.")
        return value

    def create(self, validated_data):
        project = Project.objects.get(id=validated_data['project_id'])
        user = self.context['request'].user
        
        # Create the new budget allocation
        allocation = BudgetAllocation.objects.create(
            project=project,
            category_id=validated_data['category_id'],
            account_id=validated_data['account_id'],
            amount=validated_data['amount'],
            # Inherit key properties from the project
            fiscal_year=project.budget_proposal.fiscal_year,
            department=project.department,
            proposal=project.budget_proposal,
            # Set creator and active status
            created_by_name=getattr(user, 'username', 'N/A'),
            is_active=True
        )
        # Note: The 'description' from the modal is not a field on BudgetAllocation.
        # It could be logged or added to a 'notes' field if one were added to the model.
        return allocation

class ExpenseTrackingSummarySerializer(serializers.Serializer):
    """
    Serializer for the summary cards on the Expense Tracking page.
    """
    budget_remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses_this_month = serializers.DecimalField(max_digits=15, decimal_places=2)
    
class ExpenseCategoryDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['code', 'name']