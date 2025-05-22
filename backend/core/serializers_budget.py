from core.models import Account, AccountType, BudgetProposal, BudgetProposalItem, Department, FiscalYear, JournalEntry, JournalEntryLine, ProposalHistory
from rest_framework import serializers 
from django.db.models import Sum
from django.utils import timezone


class BudgetProposalSummarySerializer(serializers.Serializer):
    total_proposals = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)

class BudgetProposalListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = BudgetProposal
        fields = [
            'id',
            'external_system_id',
            'title',
            'department_name',
            'submitted_by_name',   
            'status',
            'created_at'
        ]
        
    def get_total_cost(self, obj):
        return obj.items.aggregate(total=Sum('estimated_cost'))['total'] or 0
        
class BudgetProposalItemSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)

    class Meta:
        model = BudgetProposalItem
        fields = ['cost_element', 'description', 'estimated_cost', 'account_code']


class BudgetProposalDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    items = BudgetProposalItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = BudgetProposal
        fields = [
            'id',
            'external_system_id',
            'title',
            'project_summary',
            'project_description',
            'submitted_by_name',
            'status',
            'department_name',
            'fiscal_year',
            'performance_start_date',
            'performance_end_date',
            'items',
            'total_cost',
            'document'  # Optional attachment
        ]

    def get_total_cost(self, obj):
        return obj.items.aggregate(total=Sum('estimated_cost'))['total'] or 0
    
class ProposalHistorySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    last_modified_by = serializers.CharField(source='submitted_by_name', read_only=True)

    class Meta:
        model = BudgetProposal
        fields = [
            'id',
            'external_system_id',
            'title',
            'department_name',
            'last_modified',
            'last_modified_by',
            'status'
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
    reference = serializers.CharField(source='journal_entry.entry_id', read_only=True)
    date = serializers.DateField(source='journal_entry.date', read_only=True)
    category = serializers.CharField(source='journal_entry.category', read_only=True)
    description = serializers.CharField(source='journal_entry.description', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = ['reference', 'date', 'category', 'description', 'amount']



class JournalEntryListSerializer(serializers.ModelSerializer):
    """
    Serializer for Journal Entry Page listing view
    """
    class Meta:
        model = JournalEntry
        fields = ['entry_id', 'date', 'category', 'description', 'total_amount']

# Serializers for Journal Entry creation
class JournalEntryLineInputSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    transaction_type = serializers.ChoiceField(choices=['DEBIT', 'CREDIT'])
    journal_transaction_type = serializers.ChoiceField(choices=['CAPITAL_EXPENDITURE', 'OPERATIONAL_EXPENDITURE', 'TRANSFER'])
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)

class JournalEntryCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    category = serializers.ChoiceField(choices=[c[0] for c in JournalEntry._meta.get_field('category').choices])
    description = serializers.CharField()
    lines = JournalEntryLineInputSerializer(many=True)

    def validate_lines(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("At least 2 journal lines are required (e.g., 1 debit and 1 credit).")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        lines = validated_data.pop('lines')

        # Calculate total_amount before creating the journal entry
        total_amount = 0
        for line in lines:
            if line['transaction_type'] == 'DEBIT':
                total_amount += line['amount']
            else:
                total_amount -= line['amount']

        # Create the journal entry with total_amount already set
        entry = JournalEntry.objects.create(
            created_by=user, 
            total_amount=abs(total_amount),  # Set total_amount on creation
            **validated_data
        )

        # Create the journal entry lines
        for line in lines:
            account = Account.objects.get(id=line['account_id'])
            JournalEntryLine.objects.create(
                journal_entry=entry,
                account=account,
                transaction_type=line['transaction_type'],
                journal_transaction_type=line['journal_transaction_type'],
                amount=line['amount'],
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


class BudgetProposalItemSerializer(serializers.ModelSerializer):
    """
    Serializer for each line item (cost element) attached to a BudgetProposal.
    """

    # We expect the external system to pass "account" as the numeric PK of an existing Account.
    account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.filter(is_active=True),
        help_text="ID of an active Account."
    )

    class Meta:
        model = BudgetProposalItem
        fields = [
            'id',
            'cost_element',
            'description',
            'estimated_cost',
            'account',
            'notes',
        ]
        read_only_fields = ['id']


class BudgetProposalSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating BudgetProposal, including nested items.
    """

    # The external system will supply department (PK), fiscal_year (PK).
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        help_text="ID of an active Department."
    )
    fiscal_year = serializers.PrimaryKeyRelatedField(
        queryset=FiscalYear.objects.filter(is_active=True, is_locked=False),
        help_text="ID of an unlocked FiscalYear."
    )

    # We embed a list of items. This must be a non-empty list on creation.
    items = BudgetProposalItemSerializer(
        many=True,
        write_only=True,
        help_text="List of cost elements (BudgetProposalItem) for this proposal."
    )

    # Expose read-only metadata:
    id = serializers.IntegerField(read_only=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    last_modified = serializers.DateTimeField(read_only=True)
    sync_status = serializers.CharField(read_only=True)
    last_sync_timestamp = serializers.DateTimeField(read_only=True)

    class Meta:
        model = BudgetProposal
        fields = [
            'id',
            'title',
            'project_summary',
            'project_description',
            'department',
            'fiscal_year',
            'submitted_by_name',
            'status',
            'performance_start_date',
            'performance_end_date',
            'external_system_id',
            'document',                # Optional FileField (e.g. an Excel sheet)
            'items',                   # Custom write‐only nested field
            # Read-only metadata:
            'submitted_at',
            'last_modified',
            'sync_status',
            'last_sync_timestamp',
        ]
        read_only_fields = [
            'submitted_at', 'last_modified',
            'sync_status', 'last_sync_timestamp',
        ]

    def validate(self, data):
        """
        Enforce business rules at serializer level:
        - performance_end_date > performance_start_date
        - status should be one of the allowed STATUS_CHOICES
        - external_system_id must be unique; DRF will normally catch that
        """
        start = data.get('performance_start_date')
        end = data.get('performance_end_date')
        if start and end and end <= start:
            raise serializers.ValidationError({
                'performance_end_date': "Must be after performance_start_date."
            })

        return data

    def create(self, validated_data):
        """
        Pop out 'items' data, create the BudgetProposal, then create each BudgetProposalItem.
        """
        items_data = validated_data.pop('items', [])

        # Mark the proposal as "SUBMITTED" and set submitted_at if not provided
        if validated_data.get('status') == 'SUBMITTED' and not validated_data.get('submitted_at'):
            validated_data['submitted_at'] = timezone.now()

        # Default sync_status: we assume the external system is already the source of truth, so mark as SYNCED.
        validated_data['sync_status'] = 'SYNCED'
        validated_data['last_sync_timestamp'] = timezone.now()

        proposal = BudgetProposal.objects.create(**validated_data)

        # Create each item, linking back to parent proposal
        for item_dict in items_data:
            BudgetProposalItem.objects.create(proposal=proposal, **item_dict)

        # Optionally, create a ProposalHistory entry automatically:
        ProposalHistory.objects.create(
            proposal=proposal,
            action='CREATED',
            action_by_name=None,      # We only have submitted_by_name, not a User instance; you could store None or a dummy user
            previous_status=None,
            new_status=proposal.status,
            comments=f"Proposal created via external system (ID={proposal.external_system_id})."
        )

        return proposal

    def update(self, instance, validated_data):
        """
        If you want to allow updates to a proposal, including editing items,
        you could implement nested updates here. For brevity, we only allow full Replacement of items:
        - Delete all old items
        - Create new items from payload
        """
        items_data = validated_data.pop('items', None)

        # Update top-level fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.last_modified = timezone.now()
        instance.save()

        if items_data is not None:
            # Delete existing items, then recreate
            instance.items.all().delete()
            for item_dict in items_data:
                BudgetProposalItem.objects.create(proposal=instance, **item_dict)

            # Optional: record this update in history
            ProposalHistory.objects.create(
                proposal=instance,
                action='UPDATED',
                action_by_name=None,
                previous_status=None,
                new_status=instance.status,
                comments="Proposal items replaced via external system update."
            )

        return instance