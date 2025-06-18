from .models import (
    Account, AccountType, BudgetProposal, BudgetProposalItem, Department,
    FiscalYear, JournalEntry, JournalEntryLine, ProposalComment, ProposalHistory
)
from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone


class BudgetProposalSummarySerializer(serializers.Serializer):
    total_proposals = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)


class BudgetProposalListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.name', read_only=True)

    class Meta:
        model = BudgetProposal
        fields = [
            'id', 'external_system_id', 'title', 'department_name',
            'submitted_by_name', 'status', 'created_at', 'performance_notes',
        ]

    def get_total_cost(self, obj):
        return obj.items.aggregate(total=Sum('estimated_cost'))['total'] or 0


class BudgetProposalItemSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)

    class Meta:
        model = BudgetProposalItem
        fields = ['cost_element', 'description',
                  'estimated_cost', 'account_code']


# For creating a comment
class ProposalCommentCreateSerializer(serializers.Serializer):
    comment = serializers.CharField(max_length=1000)


class ProposalCommentSerializer(serializers.ModelSerializer):
    # user_name = serializers.CharField(source='user.get_full_name', read_only=True) # OLD
    user_username = serializers.CharField(read_only=True)  # NEW

    class Meta:
        model = ProposalComment
        fields = ['id', 'user_id', 'user_username', 'comment',
                  'created_at']  # Display user_id and user_username


class BudgetProposalDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.name', read_only=True)
    items = BudgetProposalItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()
    # Uses updated ProposalCommentSerializer
    comments = ProposalCommentSerializer(many=True, read_only=True)
    last_reviewed_at = serializers.SerializerMethodField()
    latest_review_comment = serializers.SerializerMethodField()

    class Meta:
        model = BudgetProposal
        fields = [
            'id', 'external_system_id', 'title', 'project_summary', 'project_description',
            'performance_notes', 'submitted_by_name', 'status', 'department_name',
            'fiscal_year', 'performance_start_date', 'performance_end_date',
            'items', 'total_cost', 'document', 'comments', 'last_reviewed_at',
            'approved_by_name', 'approval_date', 'rejected_by_name', 'rejection_date',
            'latest_review_comment',  # <-- Add this
        ]

    def get_total_cost(self, obj):
        return obj.items.aggregate(total=Sum('estimated_cost'))['total'] or 0

    def get_last_reviewed_at(self, obj):
        if obj.status == 'APPROVED':
            return obj.approval_date
        elif obj.status == 'REJECTED':
            return obj.rejection_date
        return None

    def get_latest_review_comment(self, obj):
        # Find the latest APPROVED or REJECTED action in ProposalHistory
        review_history = obj.history.filter(
            action__in=['APPROVED', 'REJECTED']
        ).order_by('-action_at').first()
        if not review_history:
            return None

        # Find the latest comment by the same user, after or at the review time
        comment = obj.comments.filter(
            user_username=review_history.action_by_name,
            created_at__gte=review_history.action_at
        ).order_by('created_at').first()
        if comment:
            return ProposalCommentSerializer(comment).data
        return None


class ProposalHistorySerializer(serializers.ModelSerializer):
    proposal_title = serializers.CharField(source='proposal.title', read_only=True)
    department_name = serializers.CharField(source='proposal.department.name', read_only=True)
    last_modified_by = serializers.CharField(source='action_by_name', read_only=True)

    class Meta:
        model = ProposalHistory
        fields = [
            'id',
            'proposal_title',
            'department_name',
            'action',
            'last_modified_by',  # This is action_by_name
            'action_at',
            'previous_status',
            'new_status',
            'comments',
        ]


class AccountSetupSerializer(serializers.ModelSerializer):
    account_type = serializers.CharField(source='account_type.name')
    accomplished = serializers.SerializerMethodField()
    accomplishment_date = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'code',
            'name',
            'account_type',
            'is_active',
            'accomplished',
            'accomplishment_date'
        ]

    def get_fiscal_year(self):
        return self.context.get('fiscal_year')

    def get_accomplished(self, obj):
        fiscal_year = self.get_fiscal_year()
        if not fiscal_year:
            return False
        return obj.allocations.filter(
            is_active=True,
            fiscal_year=fiscal_year
        ).exists()

    def get_accomplishment_date(self, obj):
        fiscal_year = self.get_fiscal_year()
        if not fiscal_year:
            return None
        alloc = obj.allocations.filter(
            is_active=True,
            fiscal_year=fiscal_year
        ).order_by('created_at').first()
        return alloc.created_at if alloc else None


class LedgerViewSerializer(serializers.ModelSerializer):
    reference = serializers.CharField(
        source='journal_entry.entry_id', read_only=True)
    date = serializers.DateField(source='journal_entry.date', read_only=True)
    category = serializers.CharField(
        source='journal_entry.category', read_only=True)
    description = serializers.CharField(
        source='journal_entry.description', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = ['reference', 'date', 'category', 'description', 'amount']


class JournalEntryListSerializer(serializers.ModelSerializer):
    """
    Serializer for Journal Entry Page listing view
    """
    created_by_username = serializers.CharField(read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = ['entry_id', 'date', 'category', 'description', 'total_amount', 'created_by_username']



class JournalEntryLineInputSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    transaction_type = serializers.ChoiceField(choices=['DEBIT', 'CREDIT'])
    journal_transaction_type = serializers.ChoiceField(
        choices=['CAPITAL_EXPENDITURE', 'OPERATIONAL_EXPENDITURE', 'TRANSFER'])
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class JournalEntryCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    category = serializers.ChoiceField(choices=[c[0] for c in JournalEntry._meta.get_field('category').choices])
    description = serializers.CharField()
    lines = JournalEntryLineInputSerializer(many=True)

    def validate_lines(self, value): # Fine
        if len(value) < 2:
            raise serializers.ValidationError("At least 2 journal lines are required (e.g., 1 debit and 1 credit).")
        return value

    def create(self, validated_data):
        # user = self.context['request'].user # OLD
        # In budget_service, request.user will be populated by JWTAuthentication
        # It will have attributes like id, username, role from the JWT.
        request_user = self.context['request'].user
        
        lines_data = validated_data.pop('lines')
        total_amount = sum(line['amount'] if line['transaction_type'] == 'DEBIT' else -line['amount'] for line in lines_data)

        entry = JournalEntry.objects.create(
            # created_by=user, # OLD
            created_by_user_id=request_user.id, # NEW - from JWT
            created_by_username=getattr(request_user, 'username', 'N/A'), # NEW - from JWT (ensure 'username' claim exists)
            total_amount=abs(total_amount),
            **validated_data
        )
        for line_data in lines_data:
            account = Account.objects.get(id=line_data['account_id'])
            JournalEntryLine.objects.create(
                journal_entry=entry, account=account,
                transaction_type=line_data['transaction_type'],
                journal_transaction_type=line_data['journal_transaction_type'],
                amount=line_data['amount'],
                description=validated_data['description'] 
            )
        return entry


class AccountDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'account_type']


class DepartmentDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code']


class AccountTypeDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'name', 'description']


class BudgetProposalItemCreateSerializer(serializers.ModelSerializer):
    account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_active=True),
        help_text="ID of an active Account."
    )
    class Meta:
        model = BudgetProposalItem
        fields = ['id', 'cost_element', 'description', 'estimated_cost', 'account', 'notes']
        read_only_fields = ['id']


class BudgetProposalMessageSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        help_text="ID of an active Department."
    )
    fiscal_year = serializers.PrimaryKeyRelatedField(
        queryset=FiscalYear.objects.filter(is_active=True, is_locked=False),
        help_text="ID of an unlocked FiscalYear."
    )
    items = BudgetProposalItemCreateSerializer(many=True) # Use the create/update item serializer

    class Meta:
        model = BudgetProposal
        fields = [
            'id', 'title', 'project_summary', 'project_description', 'performance_notes',
            'department', 'fiscal_year', 'submitted_by_name', # Name comes from message
            'status', # Status comes from message
            'performance_start_date', 'performance_end_date', 'external_system_id',
            'document', # Path or handle as file upload if ViewSet handles multipart
            'items',
            # Read-only fields populated by the system or during creation logic
            'submitted_at', 'last_modified', 'sync_status', 'last_sync_timestamp',
            'approved_by_name', 'approval_date', 'rejected_by_name', 'rejection_date'
        ]
        read_only_fields = [
            'id', 'submitted_at', 'last_modified', 'sync_status', 'last_sync_timestamp',
            'approved_by_name', 'approval_date', 'rejected_by_name', 'rejection_date'
        ]
        # `document` field might need special handling if it's a file path from the message
        # vs. an actual file upload if this ViewSet is hit directly with multipart/form-data.
        # For MQ, 'document' would likely be a URL or a reference.

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one line item is required.")
        return value

    def validate(self, data):
        start, end = data.get('performance_start_date'), data.get('performance_end_date')
        if start and end and end <= start:
            raise serializers.ValidationError(
                {'performance_end_date': "Must be after performance_start_date."}
            )
        # Add other top-level validations if needed
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Set system-managed fields
        validated_data.setdefault('submitted_at', timezone.now()) # If not provided
        validated_data['sync_status'] = 'SYNCED' # Assume data from external is synced
        validated_data['last_sync_timestamp'] = timezone.now()
        # approved_by_name, etc., are not set on creation from external system

        proposal = BudgetProposal.objects.create(**validated_data)
        for item_data in items_data:
            BudgetProposalItem.objects.create(proposal=proposal, **item_data)
        
        ProposalHistory.objects.create(
            proposal=proposal, action='CREATED', # Or 'SUBMITTED' if status is SUBMITTED
            action_by_name=proposal.submitted_by_name or "System (External Message)",
            new_status=proposal.status,
            comments=f"Proposal created via external system (ID={proposal.external_system_id})."
        )
        return proposal

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None) # Items are optional on update

        # Update proposal fields
        instance.title = validated_data.get('title', instance.title)
        instance.project_summary = validated_data.get('project_summary', instance.project_summary)
        # ... update other fields similarly ...
        instance.status = validated_data.get('status', instance.status) # Allow status update from external
        instance.last_modified = timezone.now()
        instance.sync_status = 'SYNCED' # Mark as synced after update
        instance.last_sync_timestamp = timezone.now()
        instance.save()

        if items_data is not None: # If items are provided, replace them
            instance.items.all().delete()
            for item_data in items_data:
                BudgetProposalItem.objects.create(proposal=instance, **item_data)
        
        ProposalHistory.objects.create(
            proposal=instance, action='UPDATED',
            action_by_name=instance.submitted_by_name or "System (External Message)",
            new_status=instance.status,
            comments=f"Proposal updated via external system (ID={instance.external_system_id})."
        )
        return instance

class ProposalReviewSerializer(serializers.Serializer): # For the review action in BudgetProposalViewSet
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED']) # Removed 'PENDING' as it's for review
    comment = serializers.CharField(required=False, allow_blank=True, max_length=1000)

    def validate_status(self, value): 
        if value not in ['APPROVED', 'REJECTED']: # Stricter choices for review action
            raise serializers.ValidationError("Invalid status for review. Must be APPROVED or REJECTED.")
        return value


class ExpenseCategoryVarianceSerializer(serializers.Serializer):
    category = serializers.CharField()
    code = serializers.CharField()
    level = serializers.IntegerField()
    budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    actual = serializers.DecimalField(max_digits=15, decimal_places=2)
    available = serializers.DecimalField(max_digits=15, decimal_places=2)
    children = serializers.ListField(child=serializers.DictField())
