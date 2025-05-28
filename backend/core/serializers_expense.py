from core.models import Account, BudgetAllocation, BudgetProposal, Expense, ExpenseCategory, Project
from rest_framework import serializers 
from django.db.models import Sum
from django.utils import timezone

class ExpenseHistorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['date', 'description', 'category_name', 'amount']
        
class ExpenseTrackingSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'date', 'description', 'category_name', 'amount', 'status']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    account_code = serializers.CharField(write_only=True)
    category_code = serializers.CharField(write_only=True)

    class Meta:
        model = Expense
        fields = [
            'project_id', 'account_code', 'category_code',
            'amount', 'date', 'description', 'vendor', 'receipt'
        ]
        extra_kwargs = {
            'project': {'required': True},
            'account': {'required': True},
            'category': {'required': True},
            'amount': {'required': True},
            'date': {'required': True},
        }

    def validate(self, data):
        project_id = data.get('project_id')
        account_code = data.get('account_code')

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project_id': 'Project not found'})

        # New validation: Prevent expenses on completed projects
        today = timezone.now().date()
        if project.status == 'COMPLETED' or today > project.end_date:
            raise serializers.ValidationError(
                {'project_id': 'Cannot create expense for completed project'}
            )
    
        try:
            account = Account.objects.get(code=account_code)
        except Account.DoesNotExist:
            raise serializers.ValidationError({'account_code': 'Account not found'})

        # Check if there is a budget allocation for this project and account
        try:
            allocation = BudgetAllocation.objects.get(project=project, account=account, is_active=True)
        except BudgetAllocation.DoesNotExist:
            raise serializers.ValidationError({'non_field_errors': 'No active budget allocation for this project and account'})

        # Check sufficient funds
        if data['amount'] > allocation.get_remaining_budget():
            raise serializers.ValidationError({'amount': 'Insufficient funds in allocation'})

        return data

    def create(self, validated_data):
        project = Project.objects.get(id=validated_data.pop('project_id'))
        account = Account.objects.get(code=validated_data.pop('account_code'))
        category = ExpenseCategory.objects.get(code=validated_data.pop('category_code'))
        allocation = BudgetAllocation.objects.get(project=project, account=account, is_active=True)

        expense = Expense.objects.create(
            project=project,
            budget_allocation=allocation,
            account=account,
            department=project.department,
            category=category,
            submitted_by=self.context['request'].user,
            status='SUBMITTED',
            **validated_data
        )
        return expense
    
    
    
class ExpenseCategoryDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['code', 'name']
        
class BudgetAllocationCreateSerializer(serializers.ModelSerializer):
    proposal_id = serializers.IntegerField(write_only=True)
    account_code = serializers.CharField(write_only=True)
    funding_source_code = serializers.CharField(write_only=True)

    class Meta:
        model = BudgetAllocation
        fields = [
            'proposal_id', 'account_code', 'funding_source_code',
            'amount', 'description'
        ]
        extra_kwargs = {
            'amount': {'required': True},
            'description': {'required': True}
        }

    def validate(self, data):
        # Validate proposal exists and is approved
        try:
            proposal = BudgetProposal.objects.get(id=data['proposal_id'], status='APPROVED')
        except BudgetProposal.DoesNotExist:
            raise serializers.ValidationError({'proposal_id': 'Approved proposal not found'})

        # Validate accounts
        try:
            account = Account.objects.get(code=data['account_code'])
            funding_source = Account.objects.get(code=data['funding_source_code'])
        except Account.DoesNotExist:
            raise serializers.ValidationError('Invalid account code provided')

        # Check funding source balance
        if funding_source.balance < data['amount']:
            raise serializers.ValidationError({'funding_source_code': 'Insufficient funds in source account'})

        # Check for existing allocation
        if BudgetAllocation.objects.filter(proposal=proposal, account=account).exists():
            raise serializers.ValidationError('Allocation for this account already exists')

        data.update({
            'proposal': proposal,
            'account': account,
            'funding_source': funding_source,
            'project': proposal.project,
            'department': proposal.department,
            'fiscal_year': proposal.fiscal_year
        })
        return data

    def create(self, validated_data):
        return BudgetAllocation.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )