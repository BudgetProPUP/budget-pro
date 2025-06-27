from decimal import Decimal
from .models import (
    Account, AccountType, BudgetAllocation, BudgetProposal, BudgetProposalItem, Department,
    FiscalYear, JournalEntry, JournalEntryLine, ProposalComment, ProposalHistory
)
from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone
from django.core.validators import MinValueValidator


class BudgetProposalSummarySerializer(serializers.Serializer):
    total_proposals = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)


class BudgetProposalListSerializer(serializers.ModelSerializer):
    submitted_by = serializers.CharField(
        source='submitted_by_name', read_only=True)
    amount = serializers.SerializerMethodField()
    reference = serializers.CharField(source='external_system_id', read_only=True)
    
    # MODIFIED: Change source back to 'title' to match the model field.
    # The frontend will use 'proposal.title'.
    subject = serializers.CharField(source='title', read_only=True)
    
    category = serializers.SerializerMethodField()

    class Meta:
        model = BudgetProposal
        # MODIFIED: The key here should be 'title', not 'subject', to match the model.
        # The frontend will map this to the "Subject" column.
        fields = [
            'id', 'reference', 'subject', 'title', 'category', 'submitted_by',
            'amount', 'status'
        ]

    def get_amount(self, obj):
        return obj.items.aggregate(total=Sum('estimated_cost'))['total'] or 0

    def get_category(self, obj):
        first_item = obj.items.first()
        if first_item and first_item.account and first_item.account.account_type:
            return first_item.account.account_type.name
        return "Uncategorized"

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
    user_username = serializers.CharField(read_only=True)

    class Meta:
        model = ProposalComment
        fields = ['id', 'user_id', 'user_username', 'comment', 'created_at']


class BudgetProposalDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.name', read_only=True)
    items = BudgetProposalItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()
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
            'latest_review_comment',
        ]

    def get_total_cost(self, obj): return obj.items.aggregate(
        total=Sum('estimated_cost'))['total'] or 0

    def get_last_reviewed_at(self, obj):
        if obj.status == 'APPROVED':
            return obj.approval_date
        elif obj.status == 'REJECTED':
            return obj.rejection_date
        return None

    def get_latest_review_comment(self, obj):
        review_history = obj.history.filter(
            action__in=['APPROVED', 'REJECTED']).order_by('-action_at').first()
        if not review_history:
            return None
        comment = obj.comments.filter(user_username=review_history.action_by_name,
                                      created_at__gte=review_history.action_at).order_by('created_at').first()
        return ProposalCommentSerializer(comment, context=self.context).data if comment else None


class ProposalHistorySerializer(serializers.ModelSerializer):
    # ADDED: Proposal ID (external) for the history table
    proposal_id = serializers.CharField(
        source='proposal.external_system_id', read_only=True)
    # RENAMED: from proposal_title to proposal to match UI
    proposal = serializers.CharField(
        source='proposal.title', read_only=True)
    # RENAMED: from action_by_name to match UI
    last_modified_by = serializers.CharField(
        source='action_by_name', read_only=True)
    # RENAMED: from action_at to match UI
    last_modified = serializers.DateTimeField(source='action_at', read_only=True)
    # RENAMED: from new_status to match UI
    status = serializers.CharField(source='new_status', read_only=True)

    class Meta:
        model = ProposalHistory
        fields = ['id', 'proposal_id', 'proposal',
                  'last_modified', 'last_modified_by', 'status']
        
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
    # RENAMED to reference_id to be clearer for the frontend
    reference_id = serializers.CharField(
        source='journal_entry.entry_id', read_only=True)
    date = serializers.DateField(source='journal_entry.date', read_only=True)
    category = serializers.CharField(
        source='journal_entry.category', read_only=True)
    # CORRECTED: Use the description from the line item itself for more detail
    description = serializers.CharField(read_only=True)
    # ADDED: Include the account name as required by the UI
    account = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        # UPDATED: Matched fields to the new UI columns
        fields = ['reference_id', 'date', 'category', 'description', 'account', 'amount']


class JournalEntryListSerializer(serializers.ModelSerializer):
    """
    Serializer for Journal Entry Page listing view
    """
    created_by_username = serializers.CharField(read_only=True)

    class Meta:
        model = JournalEntry
        fields = ['entry_id', 'date', 'category', 'description',
                  'total_amount', 'created_by_username']


class JournalEntryLineInputSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    transaction_type = serializers.ChoiceField(choices=['DEBIT', 'CREDIT'])
    journal_transaction_type = serializers.ChoiceField(
        choices=['CAPITAL_EXPENDITURE', 'OPERATIONAL_EXPENDITURE', 'TRANSFER'])
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class JournalEntryCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    category = serializers.ChoiceField(
        choices=[c[0] for c in JournalEntry._meta.get_field('category').choices])
    description = serializers.CharField()
    lines = JournalEntryLineInputSerializer(many=True)

    def validate_lines(self, value):  # Fine
        if len(value) < 2:
            raise serializers.ValidationError(
                "At least 2 journal lines are required (e.g., 1 debit and 1 credit).")
        return value

    def create(self, validated_data):
        # user = self.context['request'].user # OLD
        # In budget_service, request.user will be populated by JWTAuthentication
        # It will have attributes like id, username, role from the JWT.
        request_user = self.context['request'].user

        lines_data = validated_data.pop('lines')
        total_amount = sum(line['amount'] if line['transaction_type']
                           == 'DEBIT' else -line['amount'] for line in lines_data)

        entry = JournalEntry.objects.create(
            # created_by=user, # OLD
            created_by_user_id=request_user.id,  # NEW - from JWT
            # NEW - from JWT (ensure 'username' claim exists)
            created_by_username=getattr(request_user, 'username', 'N/A'),
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
        queryset=Account.objects.filter(is_active=True))

    class Meta:
        model = BudgetProposalItem
        fields = ['id', 'cost_element', 'description',
                  'estimated_cost', 'account', 'notes']
        read_only_fields = ['id']


class BudgetProposalMessageSerializer(serializers.ModelSerializer):
    department_input = serializers.CharField(  # Changed from 'department' to 'department_input'
        write_only=True,
        required=True,
        source='department',  # Payload key is 'department'
        help_text="Department ID (integer) or Department Code (string, e.g., 'FIN'). Required."
    )
    department_details = DepartmentDropdownSerializer(
        source='department', read_only=True)

    fiscal_year = serializers.PrimaryKeyRelatedField(
        queryset=FiscalYear.objects.filter(is_active=True, is_locked=False),
        required=True
    )
    items = BudgetProposalItemCreateSerializer(many=True, allow_empty=False)

    # Field for input from payload, named 'ticket_id'
    ticket_id = serializers.CharField(
        max_length=100,
        write_only=True,  # Only for input
        required=True,   # This field must be in the payload
        help_text="The unique ticket ID from the originating external system."
    )
    # Field for output, maps to model's 'external_system_id'
    external_system_id = serializers.CharField(read_only=True)

    class Meta:
        model = BudgetProposal
        fields = [
            'id', 'title', 'project_summary', 'project_description', 'performance_notes',
            'department_details',  # For output
            'department_input',   # For input (maps to 'department' in payload)
            'fiscal_year', 'submitted_by_name', 'status',
            'performance_start_date', 'performance_end_date',
            'external_system_id',  # For output (model's value)
            'ticket_id',          # For input (payload key)
            'document', 'items',
            'submitted_at', 'last_modified', 'sync_status', 'last_sync_timestamp',
            'approved_by_name', 'approval_date', 'rejected_by_name', 'rejection_date'
        ]
        read_only_fields = [
            # external_system_id is read_only because it's populated from ticket_id
            'id', 'department_details', 'external_system_id',
            'submitted_at', 'last_modified', 'sync_status',
            'last_sync_timestamp', 'approved_by_name', 'approval_date',
            'rejected_by_name', 'rejection_date'
        ]

    # Validates the 'department' payload key (via source)
    def validate_department_input(self, value):
        try:
            if isinstance(value, int) or (isinstance(value, str) and value.isdigit()):
                department_obj = Department.objects.get(
                    pk=int(value), is_active=True)
            elif isinstance(value, str):
                department_obj = Department.objects.get(
                    code__iexact=value, is_active=True)
            else:
                raise serializers.ValidationError(
                    "Department input must be an integer ID or a string code.")
        except Department.DoesNotExist:
            raise serializers.ValidationError(
                f"Active department with identifier '{value}' not found.")
        except ValueError:
            raise serializers.ValidationError(
                "Invalid department ID format if sending an integer ID.")
        return department_obj

    def create(self, validated_data):
        # This comes from 'department_input' due to source
        department_obj = validated_data.pop('department')
        items_data = validated_data.pop('items')
        # Pop 'ticket_id' from validated_data and assign it to 'external_system_id' for the model
        ticket_id_value = validated_data.pop('ticket_id')
        validated_data['external_system_id'] = ticket_id_value

        # Assign the actual Department instance
        validated_data['department'] = department_obj
        validated_data['status'] = 'SUBMITTED'
        validated_data.setdefault('submitted_at', timezone.now())
        validated_data['sync_status'] = 'SYNCED'
        validated_data['last_sync_timestamp'] = timezone.now()
        
        validated_data.pop('approved_by_name', None)
        validated_data.pop('approval_date', None)
        validated_data.pop('rejected_by_name', None)
        validated_data.pop('rejection_date', None)
        
        proposal = BudgetProposal.objects.create(**validated_data)
        for item_data in items_data:
            BudgetProposalItem.objects.create(proposal=proposal, **item_data)

        ProposalHistory.objects.create(
            proposal=proposal,
            action='SUBMITTED', # Reflects that it arrived as submitted
            action_by_name=proposal.submitted_by_name or "System (External Message)",
            new_status=proposal.status,
            comments=f"Proposal received from external system (ID={proposal.external_system_id}) for department {department_obj.name}."
        )
        return proposal

    def update(self, instance, validated_data):
        department_obj = validated_data.pop('department', None)
        if department_obj:
            instance.department = department_obj

        items_data = validated_data.pop('items', None)

        # Handle ticket_id mapping to external_system_id for updates
        ticket_id_value = validated_data.pop('ticket_id', None)
        if ticket_id_value:
            instance.external_system_id = ticket_id_value  # Update model's field

        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        instance.last_modified = timezone.now()
        instance.sync_status = 'SYNCED'
        instance.last_sync_timestamp = timezone.now()
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_dict in items_data:
                BudgetProposalItem.objects.create(
                    proposal=instance, **item_dict)
            ProposalHistory.objects.create(
                proposal=instance, action='UPDATED',
                action_by_name=instance.submitted_by_name or "System (External Message)",
                new_status=instance.status,
                comments=f"Proposal items updated via external system (ID={instance.external_system_id})."
            )
        return instance


# For the review action in BudgetProposalViewSet
class ProposalReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    comment = serializers.CharField(
        required=False, allow_blank=True, max_length=1000)

    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError("Invalid status for review.")
        return value
    
class ProposalReviewBudgetOverviewSerializer(serializers.Serializer):
    """
    Serializer for the budget overview section in the proposal review modal.
    """
    total_department_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    currently_allocated = serializers.DecimalField(max_digits=15, decimal_places=2)
    available_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    budget_after_proposal = serializers.DecimalField(max_digits=15, decimal_places=2)

class BudgetAdjustmentSerializer(serializers.Serializer):
    """
    Serializer for creating a budget adjustment. This modifies a budget allocation
    and creates a corresponding journal entry for audit purposes.
    """
    date = serializers.DateField()
    description = serializers.CharField(max_length=255)
    
    # The allocation to be modified
    source_allocation_id = serializers.IntegerField()
    # The allocation receiving the funds (optional, for transfers)
    destination_allocation_id = serializers.IntegerField(required=False, allow_null=True)
    
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    # An account to represent the source of funds for an increase,
    # or the destination for a decrease (e.g., a general reserve account)
    offsetting_account_id = serializers.IntegerField()

    def validate(self, data):
        source_id = data.get('source_allocation_id')
        dest_id = data.get('destination_allocation_id')

        if source_id == dest_id and dest_id is not None:
            raise serializers.ValidationError("Source and destination allocations cannot be the same.")
        
        try:
            BudgetAllocation.objects.get(id=source_id, is_active=True)
        except BudgetAllocation.DoesNotExist:
            raise serializers.ValidationError({"source_allocation_id": "Active source allocation not found."})

        if dest_id:
            try:
                BudgetAllocation.objects.get(id=dest_id, is_active=True)
            except BudgetAllocation.DoesNotExist:
                raise serializers.ValidationError({"destination_allocation_id": "Active destination allocation not found."})
        
        try:
            Account.objects.get(id=data.get('offsetting_account_id'), is_active=True)
        except Account.DoesNotExist:
             raise serializers.ValidationError({"offsetting_account_id": "Active offsetting account not found."})

        return data


class ExpenseCategoryVarianceSerializer(serializers.Serializer):
    category = serializers.CharField()
    code = serializers.CharField()
    level = serializers.IntegerField()
    budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    actual = serializers.DecimalField(max_digits=15, decimal_places=2)
    available = serializers.DecimalField(max_digits=15, decimal_places=2)
    children = serializers.ListField(child=serializers.DictField())
