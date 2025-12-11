from decimal import Decimal
from core.models import Account, BudgetAllocation, Expense, ExpenseCategory, Project
from rest_framework import serializers 
from django.db.models import Sum
from django.utils import timezone

# MODIFICATION START
class ExpenseMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for incoming expense creation requests from other services (AMS, HDS).
    """
    # Write-only fields that the external service will provide
    ticket_id = serializers.CharField(write_only=True, source='transaction_id', required=True)
    project_id = serializers.IntegerField(write_only=True, required=True)
    account_code = serializers.CharField(write_only=True, required=True)
    category_code = serializers.CharField(write_only=True, required=True)
    submitted_by_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Expense
        fields = [
            'ticket_id', 'project_id', 'account_code', 'category_code', 'submitted_by_name',
            'amount', 'date', 'description', 'vendor', 'notes'
        ]

    def create(self, validated_data):
        try:
            project = Project.objects.get(id=validated_data['project_id'])
            account = Account.objects.get(code=validated_data['account_code'])
            category = ExpenseCategory.objects.get(code=validated_data['category_code'])
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project_id': 'Project not found.'})
        except Account.DoesNotExist:
            raise serializers.ValidationError({'account_code': 'Account not found.'})
        except ExpenseCategory.DoesNotExist:
            raise serializers.ValidationError({'category_code': 'Expense category not found.'})

        # Find a valid budget allocation for this project
        allocation = BudgetAllocation.objects.filter(project=project, is_active=True).first()
        if not allocation:
            raise serializers.ValidationError(f'No active budget allocation found for project "{project.name}".')

        expense = Expense.objects.create(
            transaction_id=validated_data['transaction_id'],
            project=project,
            account=account,
            category=category,
            department=project.department,
            budget_allocation=allocation,
            amount=validated_data['amount'],
            date=validated_data['date'],
            description=validated_data['description'],
            vendor=validated_data['vendor'],
            notes=validated_data.get('notes', ''),
            submitted_by_username=validated_data['submitted_by_name'],
            status='SUBMITTED' # Expenses from external systems come in as submitted
        )
        return expense
# MODIFICATION END


class ExpenseHistorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'date', 'description', 'category_name', 'amount']
        
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
        # CORRECT LOGIC: An expense is "Accomplish ed" if its underlying account is marked as such.
        return "Yes" if obj.account.accomplished else "No"

class ExpenseDetailForModalSerializer(serializers.ModelSerializer):
    """
    Serializer to get the proposal_id from an expense,
    which is needed by the frontend to fetch the full proposal details.
    """
    proposal_id = serializers.IntegerField(source='project.budget_proposal.id', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'proposal_id']
        
# MODIFICATION START
class ExpenseCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    account_code = serializers.CharField(write_only=True)
    category_code = serializers.CharField(write_only=True)

    class Meta:
        model = Expense
        fields = [
            'project_id', 'account_code', 'category_code', # Input fields
            'amount', 'date', 'description', 'vendor', 'receipt', # Model fields
        ]
        extra_kwargs = {
            'amount': {'required': True},
            'date': {'required': True},
            'description': {'required': True},
            'vendor': {'required': True},      
        }


    def validate(self, data):
        project_id = data.get('project_id')
        account_code = data.get('account_code')
        expense_amount = data.get('amount')
        user = self.context['request'].user
        department_id = getattr(user, 'department_id', None)

        if not department_id:
            raise serializers.ValidationError("Authenticated user is not associated with a department.")

        try:
            # Ensure the project exists and belongs to the user's department
            project = Project.objects.get(id=project_id, department_id=department_id)
            data['project_obj'] = project
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project_id': "Project not found or you don't have permission for it."})

        # Basic validation for other codes
        try:
            account = Account.objects.get(code=account_code, is_active=True)
            data['account_obj'] = account
        except Account.DoesNotExist:
            raise serializers.ValidationError({'account_code': 'Active account not found.'})
        
        try:
            category = ExpenseCategory.objects.get(code=data.get('category_code'), is_active=True)
            data['category_obj'] = category
        except ExpenseCategory.DoesNotExist:
            raise serializers.ValidationError({'category_code': 'Active expense category not found.'})

        # --- CORRECTED VALIDATION LOGIC ---
        # 1. Find all active allocations for the specified project.
        allocations = BudgetAllocation.objects.filter(project=project, is_active=True)
        if not allocations.exists():
            raise serializers.ValidationError(
                {'project_id': f'No active budget allocations found for project "{project.name}". Cannot submit expense.'}
            )

        # 2. Calculate the project's total budget and total spent so far.
        project_total_budget = allocations.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        project_total_spent = Expense.objects.filter(project=project, status='APPROVED').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        project_remaining_budget = project_total_budget - project_total_spent

        # 3. Check if the new expense amount exceeds the project's remaining budget.
        if expense_amount > project_remaining_budget:
            raise serializers.ValidationError(
                {'amount': f'Insufficient funds for this project. Remaining budget is ₱{project_remaining_budget:,.2f}'}
            )
        
        # 4. We still need to associate the expense with one specific allocation.
        #    We will pick the first one found. A more advanced system might let the user choose.
        data['allocation_obj'] = allocations.first()
        # --- END OF CORRECTED LOGIC ---

        return data

    def create(self, validated_data):
        project = validated_data.pop('project_obj')
        account = validated_data.pop('account_obj')
        category = validated_data.pop('category_obj')
        allocation = validated_data.pop('allocation_obj')

        # Pop write-only fields so they aren't passed to the model's create method
        validated_data.pop('project_id', None)
        validated_data.pop('account_code', None)
        validated_data.pop('category_code', None)

        request_user = self.context['request'].user

        expense = Expense.objects.create(
            project=project,
            budget_allocation=allocation,
            account=account,
            department=project.department, # Expense department is the same as the project's department
            category=category,
            submitted_by_user_id=request_user.id,
            submitted_by_username=getattr(request_user, 'username', 'N/A'),
            status='SUBMITTED', # Default status on creation
            **validated_data
        )
        return expense
# MODIFICATION END
    
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
    
    
class ExpenseDetailSerializer(serializers.ModelSerializer):
    """
    Provides a detailed view of a single expense record, including related
    project, account, and category information. Used for the 'View' modal
    on the Expense History page.
    """
    project_name = serializers.CharField(source='project.name', read_only=True, default=None)
    account_details = serializers.CharField(source='account.__str__', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    # Use SerializerMethodField to handle cases where receipt might not exist
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            'id',
            'transaction_id',
            'date',
            'amount',
            'description',
            'vendor',
            'status',
            'notes',
            'receipt_url',
            'project_name',
            'account_details',
            'category_name',
            'department_name',
            'submitted_by_username',
            'submitted_at',
            'approved_by_username',
            'approved_at',
        ]
    
    def get_receipt_url(self, obj):
        if obj.receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt.url)
        return None

class ExpenseCategoryDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['code', 'name']