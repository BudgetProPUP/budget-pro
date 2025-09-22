from django.db.models.signals import post_save
from django.dispatch import receiver
from backend.core.models import Expense, TransactionAudit


@receiver(post_save, sender=Expense)
def expense_audit_log(sender, instance: Expense, created: bool, **kwargs): # Added type hints for clarity
    """Create audit entry when an Expense is created or updated."""
    
    action = 'CREATED' if created else 'UPDATED'
    
    # Determine the relevant user for this audit event based on the Expense instance
    audit_user_id = None
    audit_user_username = None

    # Logic to determine which user context is most relevant for the audit:
    # - If the expense was just approved, the approver is key.
    # If it was just created/submitted, the submitter is key.
    # For other updates, it might be the submitter or a system action.

    if instance.status == 'APPROVED' and instance.approved_by_user_id:
        # If the action leading to this save was an approval, use the approver's details.
        # This assumes that when an expense is approved, approved_by_user_id/username are set.
        audit_user_id = instance.approved_by_user_id
        audit_user_username = instance.approved_by_username
    elif instance.submitted_by_user_id:
        # For creation or general updates where an approver isn't yet involved or isn't the primary actor.
        audit_user_id = instance.submitted_by_user_id
        audit_user_username = instance.submitted_by_username
    else:
        # Fallback: If no user context can be clearly determined from the Expense instance.
        # This might happen if an expense is updated by a system process without a user context.
        # Log this with a special system user ID or skip the audit.
        print(f"Warning: Could not determine user context for auditing Expense ID {instance.id}. Action: {action}.")
        # To avoid creating an audit entry without a user, return here:
        # return
        # Or, assign a system/placeholder if that's the rule:
        # audit_user_id = 0 # Example placeholder for system
        # audit_user_username = "System"
        if not (audit_user_id or audit_user_username): # If still no user, skip
             print(f"Skipping audit for Expense ID {instance.id} due to missing user context for action: {action}.")
             return


    # Create transaction audit record
    TransactionAudit.objects.create(
        transaction_type='EXPENSE',
        transaction_id_ref=instance.id,  # Correct: Uses the PK of the Expense instance
        user_id=audit_user_id,
        user_username=audit_user_username,
        action=action,
        details={
            'amount': str(instance.amount),
            'description': instance.description,
            'status': instance.status,
            'department_id': instance.department_id, # Assumes department is a local FK
            'budget_allocation_id': instance.budget_allocation_id, # Assumes budget_allocation is local FK
            'project_id': instance.project_id if instance.project else None,
            'vendor': instance.vendor,
        }
    )
    print(f"Audit log created for Expense ID {instance.id}, Action: {action}, User: {audit_user_username or audit_user_id}")