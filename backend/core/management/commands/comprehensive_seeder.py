# File: backend/core/management/commands/comprehensive_seeder.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from datetime import datetime, timedelta
import random
from random import choice
from decimal import Decimal

# REMOVE: from django.contrib.auth import get_user_model
# User = get_user_model() # REMOVE - User model is not local

# Import models from the current app (backend/core)
from core.models import (
    Department, AccountType, Account, FiscalYear, BudgetProposal, BudgetProposalItem,
    BudgetAllocation, BudgetTransfer, JournalEntry, JournalEntryLine,
    ExpenseCategory, Expense, Document, ProposalHistory, ProposalComment,
    TransactionAudit, Project, RiskMetric, DashboardMetric, UserActivityLog
)

# --- SIMULATED USER DATA (as if from auth_service) ---
# These IDs and names should correspond to users you expect to be in auth_service
# For seeding purposes, we'll define them here.


SIMULATED_USERS = [
    {'id': 1, 'username': 'admin_auth', 'full_name': 'AuthAdmin User', 'department_code': 'FIN'},
    {'id': 2, 'username': 'finance_head_auth', 'full_name': 'Finance Head', 'department_code': 'FIN'},
    {'id': 3, 'username': 'it_user_auth', 'full_name': 'IT Support', 'department_code': 'IT'},
    {'id': 4, 'username': 'ops_user_auth', 'full_name': 'Operations Staff', 'department_code': 'OPS'},
    {'id': 5, 'username': 'adi123', 'full_name': 'Eldrin Adi', 'department_code': 'IT'},
    {'id': 6, 'username': 'mkt_user_auth', 'full_name': 'Marketing Specialist', 'department_code': 'MKT'},
    {'id': 7, 'username': 'hr_user_auth', 'full_name': 'HR Staff', 'department_code': 'HR'}, # ADDED HR USER
]

# Helper to get a simulated user
def get_simulated_user(username=None, role_hint=None): # role_hint not used yet, but could be
    if username:
        for u in SIMULATED_USERS:
            if u['username'] == username:
                return u
    return random.choice(SIMULATED_USERS) # Fallback to random

class Command(BaseCommand):
    help = 'Seed budget_service database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Starting budget_service database seeding process...')

        try:
            with transaction.atomic():
                # Get a default simulated admin user for 'created_by' fields if no specific user
                sim_admin_user = get_simulated_user(username='admin_auth')

                departments = self.create_departments() # This is fine, Department is local
                
                # REMOVE: admin_user, users = self.create_users(departments)
                # We now use SIMULATED_USERS

                account_types = self.create_account_types() # Fine, AccountType is local
                accounts = self.create_accounts(account_types, sim_admin_user) # Pass simulated user info
                fiscal_years = self.create_fiscal_years() # Fine

                expense_categories = self.create_expense_categories() # Fine
                
                # Pass simulated users list (or a way to get them) to functions needing user info
                budget_proposals = self.create_budget_proposals(departments, fiscal_years)
                self.create_budget_proposal_items(budget_proposals, accounts) # Fine
                projects = self.create_projects(departments, budget_proposals) # Fine
                
                budget_allocations = self.create_budget_allocations(
                    projects, accounts, sim_admin_user, expense_categories
                )
                self.create_budget_transfers(fiscal_years, budget_allocations)
                
                journal_entries = self.create_journal_entries()
                self.create_journal_entry_lines(journal_entries, accounts) # Fine
                
                expenses = self.create_expenses(
                    departments, accounts, budget_allocations, expense_categories
                )

                # self.create_documents(budget_proposals, expenses, departments) # Pass simulated users if needed
                self.create_proposal_history(budget_proposals)
                self.create_proposal_comments(budget_proposals)

                self.create_risk_metrics(projects)
                self.create_dashboard_metrics(fiscal_years, departments) # Fine

                self.create_user_activity_logs() # For budget_service activities

                self.stdout.write(self.style.SUCCESS('Successfully seeded budget_service database!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding budget_service database: {str(e)}'))
            raise e

    def create_departments(self): # No change needed here
        self.stdout.write('Creating departments...')
        # ... (your existing department creation logic)
        departments_data = [
            {'name': 'Finance Department', 'code': 'FIN', 'description': 'Handles financial operations and budget management'},
            {'name': 'Human Resources', 'code': 'HR', 'description': 'Manages personnel, hiring and organizational development'},
            {'name': 'Information Technology', 'code': 'IT', 'description': 'Maintains IT infrastructure and develops software solutions'},
            {'name': 'Operations', 'code': 'OPS', 'description': 'Handles day-to-day operational activities'},
            {'name': 'Marketing', 'code': 'MKT', 'description': 'Manages promotional activities and brand development'}
        ]
        created_departments = []
        for dept_data in departments_data:
            dept, created = Department.objects.update_or_create(code=dept_data['code'], defaults=dept_data)
            created_departments.append(dept)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_departments)} departments'))
        return created_departments

    # REMOVE: def create_users(self, departments): ...

    def create_account_types(self): # No change needed here
        self.stdout.write('Creating account types...')
        # ... (your existing account type creation logic)
        account_types_data = [
            {'name': 'Asset', 'description': 'Resources owned by the company'},
            {'name': 'Liability', 'description': 'Obligations owed by the company'},
            {'name': 'Equity', 'description': 'Ownership interest in the company'},
            {'name': 'Revenue', 'description': 'Income earned from operations'},
            {'name': 'Expense', 'description': 'Costs incurred in operations'}
        ]
        created_types = []
        for type_data in account_types_data:
            acct_type, _ = AccountType.objects.update_or_create(name=type_data['name'], defaults=type_data)
            created_types.append(acct_type)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_types)} account types'))
        return created_types

    def create_accounts(self, account_types, sim_creator_user): # MODIFIED: takes simulated creator
        self.stdout.write('Creating accounts...')
        acct_type_dict = {acct.name: acct for acct in account_types}
        parent_accounts_data = [
            {'code': '1000', 'name': 'Assets', 'account_type': acct_type_dict['Asset']},
            {'code': '5000', 'name': 'Expenses', 'account_type': acct_type_dict['Expense']},
            # ... (other parent accounts as in your original)
        ]
        created_parents = []
        for acct_data in parent_accounts_data:
            account, _ = Account.objects.update_or_create(
                code=acct_data['code'],
                defaults={
                    'name': acct_data['name'],
                    'description': acct_data.get('description', ''),
                    'account_type': acct_data['account_type'],
                    'parent_account': None,
                    'created_by_user_id': sim_creator_user['id'],         # UPDATED
                    'created_by_username': sim_creator_user['username'], # UPDATED
                    'is_active': True,
                    'accomplished': False,
                    'accomplishment_date': None
                }
            )
            created_parents.append(account)
        
        parent_dict = {acct.code: acct for acct in created_parents}
        child_accounts_data = [
            {'code': '1100', 'name': 'Cash and Cash Equivalents', 'account_type': acct_type_dict['Asset'], 'parent_account': parent_dict.get('1000')},
            {'code': '5100', 'name': 'Salaries and Wages', 'account_type': acct_type_dict['Expense'], 'parent_account': parent_dict.get('5000')},
            # ... (other child accounts)
        ]
        created_children = []
        for acct_data in child_accounts_data:
            if not acct_data.get('parent_account'): continue # Skip if parent not found
            account, _ = Account.objects.update_or_create(
                code=acct_data['code'],
                defaults={
                    'name': acct_data['name'],
                    'description': acct_data.get('description', ''),
                    'account_type': acct_data['account_type'],
                    'parent_account': acct_data['parent_account'],
                    'created_by_user_id': sim_creator_user['id'],         # UPDATED
                    'created_by_username': sim_creator_user['username'], # UPDATED
                    'is_active': True, 'accomplished': False
                }
            )
            created_children.append(account)
        all_accounts = created_parents + created_children
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(all_accounts)} accounts'))
        return all_accounts

    def create_fiscal_years(self): # No change needed here
        self.stdout.write('Creating fiscal years...')
        # ... (your existing fiscal year creation logic)
        current_year = datetime.now().year
        fiscal_years_data = [
            {'name': f'FY {current_year-1}', 'start_date': datetime(current_year-1, 1, 1).date(), 'end_date': datetime(current_year-1, 12, 31).date(), 'is_active': False, 'is_locked': True},
            {'name': f'FY {current_year}', 'start_date': datetime(current_year, 1, 1).date(), 'end_date': datetime(current_year, 12, 31).date(), 'is_active': True, 'is_locked': False},
            {'name': f'FY {current_year+1}', 'start_date': datetime(current_year+1, 1, 1).date(), 'end_date': datetime(current_year+1, 12, 31).date(), 'is_active': False, 'is_locked': False},
        ]
        created_years = []
        for year_data in fiscal_years_data:
            fy, _ = FiscalYear.objects.update_or_create(name=year_data['name'], defaults=year_data)
            created_years.append(fy)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_years)} fiscal years'))
        return created_years

    def create_expense_categories(self): # No change needed here
        self.stdout.write('Creating expense categories...')
        # ... (your existing expense category creation logic) ...
        # (Ensure this logic is self-contained and doesn't rely on User model directly)
        # For brevity, assuming your hierarchical creation logic is correct.
        # Just ensure no direct User FKs are attempted to be set.
        # Example simplified:
        ExpenseCategory.objects.update_or_create(code='EXPENSE', defaults={'name': 'General Expenses', 'level': 1})
        # ... add more as per your original seeder ...
        return list(ExpenseCategory.objects.all())


    def create_budget_proposals(self, departments, fiscal_years): # MODIFIED: removed users param
        self.stdout.write('Creating budget proposals...')
        current_year = datetime.now().year
        current_fy = next((fy for fy in fiscal_years if fy.name == f'FY {current_year}'), fiscal_years[0])
        proposals = []
        for i, department in enumerate(departments):
            for j in range(2): # Create 2 proposals per department
                sim_submitter = random.choice(SIMULATED_USERS) # Get a simulated user
                proposal_data = {
                    'title': f"{department.name} Q{j+1} Initiative {current_year}",
                    'project_summary': f"Summary for {department.name} Q{j+1}",
                    'project_description': f"Detailed description for {department.name} Q{j+1}",
                    'department': department,
                    'fiscal_year': current_fy,
                    'submitted_by_name': sim_submitter['full_name'], # UPDATED
                    'performance_start_date': current_fy.start_date + timedelta(days=90*j),
                    'performance_end_date': current_fy.start_date + timedelta(days=90*(j+1)-1),
                    'external_system_id': f"EXT-{department.code}-{current_year}-Q{j+1}-{i}",
                    'status': random.choice(['SUBMITTED', 'APPROVED']), # Assuming proposals are already approved or submitted
                    # approved_by_name, rejected_by_name will be set by review actions if applicable
                }
                if proposal_data['status'] == 'APPROVED':
                    sim_approver = random.choice(SIMULATED_USERS)
                    proposal_data['approved_by_name'] = sim_approver['full_name']
                    proposal_data['approval_date'] = timezone.now()

                proposal, _ = BudgetProposal.objects.update_or_create(
                    external_system_id=proposal_data['external_system_id'], # Use a unique field
                    defaults=proposal_data
                )
                proposals.append(proposal)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(proposals)} budget proposals'))
        return proposals

    def create_budget_proposal_items(self, proposals, accounts): # No change needed here
        self.stdout.write('Creating budget proposal items...')
        # ... (your existing item creation logic, it uses proposal and account which are local) ...
        items_created = 0
        expense_accounts = [acc for acc in accounts if acc.account_type.name == 'Expense'] or accounts
        for proposal in proposals:
            for _ in range(random.randint(1,3)):
                account = random.choice(expense_accounts)
                BudgetProposalItem.objects.create(
                    proposal=proposal, cost_element=f"CE-{random.randint(100,999)}",
                    description=f"{account.name} for {proposal.title[:20]}",
                    estimated_cost=Decimal(random.randint(1000, 50000)),
                    account=account
                )
                items_created +=1
        self.stdout.write(self.style.SUCCESS(f'Created {items_created} budget proposal items'))


    def create_projects(self, departments, proposals): # No change needed here
        self.stdout.write('Creating projects...')
        # ... (your existing project creation logic, it uses department and proposal which are local) ...
        projects = []
        for proposal in proposals:
            if proposal.status == 'APPROVED': # Only create projects for approved proposals
                project, _ = Project.objects.get_or_create(
                    budget_proposal=proposal,
                    defaults={
                        'name': proposal.title.replace("Budget", "Project"),
                        'description': proposal.project_summary,
                        'start_date': proposal.performance_start_date,
                        'end_date': proposal.performance_end_date,
                        'department': proposal.department,
                        'status': 'PLANNING'
                    }
                )
                projects.append(project)
        self.stdout.write(self.style.SUCCESS(f'Created {len(projects)} projects'))
        return projects


    def create_budget_allocations(self, projects, accounts, sim_creator_user, categories): # MODIFIED: takes simulated creator
        self.stdout.write('Creating budget allocations...')
        allocations = []
        expense_accounts = [acc for acc in accounts if acc.account_type.name == 'Expense'] or accounts
        if not projects: return []
        for project in projects:
            if not project.budget_proposal: continue # Should not happen if created from proposal
            total_proposal_cost = project.budget_proposal.items.aggregate(Sum('estimated_cost'))['estimated_cost__sum'] or Decimal(0)
            if total_proposal_cost > 0:
                alloc, _ = BudgetAllocation.objects.get_or_create(
                    project=project,
                    defaults={
                        'fiscal_year': project.budget_proposal.fiscal_year,
                        'department': project.department,
                        'category': random.choice(categories) if categories else None,
                        'account': random.choice(expense_accounts), # Simplified account choice
                        'proposal': project.budget_proposal,
                        'created_by_name': sim_creator_user['full_name'], # UPDATED
                        'amount': total_proposal_cost,
                        'is_active': True
                    }
                )
                allocations.append(alloc)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(allocations)} budget allocations'))
        return allocations

    def create_budget_transfers(self, fiscal_years, allocations): # MODIFIED: removed users param
        self.stdout.write('Creating budget transfers...')
        transfers = []
        if len(allocations) < 2: return []
        for _ in range(min(3, len(allocations) // 2)):
            source_alloc, dest_alloc = random.sample(allocations, 2)
            sim_transferer = random.choice(SIMULATED_USERS)
            transfer_data = {
                'fiscal_year': source_alloc.fiscal_year,
                'source_allocation': source_alloc,
                'destination_allocation': dest_alloc,
                'transferred_by_user_id': sim_transferer['id'],       # UPDATED
                'transferred_by_username': sim_transferer['username'],# UPDATED
                'amount': Decimal(random.randint(1000, int(source_alloc.amount / 10) if source_alloc.amount > 10000 else 1000)),
                'reason': f"Reallocation from {source_alloc.project.name[:20]} to {dest_alloc.project.name[:20]}",
                'status': random.choice(['PENDING', 'APPROVED', 'REJECTED'])
            }
            if transfer_data['status'] == 'APPROVED':
                sim_approver = random.choice(SIMULATED_USERS)
                transfer_data['approved_by_user_id'] = sim_approver['id']
                transfer_data['approved_by_username'] = sim_approver['username']
                transfer_data['approval_date'] = timezone.now()
            # ... (similar for rejected_by if needed) ...
            transfer = BudgetTransfer.objects.create(**transfer_data)
            transfers.append(transfer)
        self.stdout.write(self.style.SUCCESS(f'Created {len(transfers)} budget transfers'))
        return transfers

    def create_journal_entries(self): # MODIFIED: removed users param
        self.stdout.write('Creating journal entries...')
        entries = []
        for _ in range(10):
            sim_creator = random.choice(SIMULATED_USERS)
            entry = JournalEntry.objects.create(
                category=random.choice(['EXPENSES', 'ASSETS']),
                description=f"JE for {sim_creator['department_code']}",
                date=timezone.now() - timedelta(days=random.randint(1, 90)),
                total_amount=Decimal(0), # Will be updated by lines
                status='POSTED',
                created_by_user_id=sim_creator['id'],         # UPDATED
                created_by_username=sim_creator['username']  # UPDATED
            )
            entries.append(entry)
        self.stdout.write(self.style.SUCCESS(f'Created {len(entries)} journal entries'))
        return entries

    def create_journal_entry_lines(self, journal_entries, accounts): # No change needed here
        self.stdout.write('Creating journal entry lines...')
        # ... (your existing logic is fine as it uses local journal_entries and accounts) ...
        if not accounts: return
        for entry in journal_entries:
            debit_total = Decimal(0)
            credit_total = Decimal(0)
            num_lines = random.randint(2,4)
            for i in range(num_lines):
                amount = Decimal(random.randint(100, 10000))
                # Try to balance debits and credits roughly for the last line
                if i == num_lines -1 : # last line
                    if debit_total > credit_total:
                        tran_type = 'CREDIT'
                        amount = debit_total - credit_total
                    elif credit_total > debit_total:
                        tran_type = 'DEBIT'
                        amount = credit_total - debit_total
                    else: # amounts are equal, make one more random line
                        tran_type = random.choice(['DEBIT', 'CREDIT'])
                else:
                    tran_type = random.choice(['DEBIT', 'CREDIT'])

                if amount <=0: amount = Decimal(random.randint(100,1000)) # ensure positive amount

                JournalEntryLine.objects.create(
                    journal_entry=entry, account=random.choice(accounts),
                    transaction_type=tran_type,
                    journal_transaction_type=random.choice(['OPERATIONAL_EXPENDITURE', 'CAPITAL_EXPENDITURE']),
                    amount=amount, description=entry.description
                )
                if tran_type == 'DEBIT': debit_total += amount
                else: credit_total += amount
            entry.total_amount = debit_total # In accounting, total of a JE is usually sum of debits (or credits)
            entry.save()
        self.stdout.write(self.style.SUCCESS(f'Added lines to {len(journal_entries)} journal entries'))


    def create_expenses(self, departments, accounts, budget_allocations, expense_categories):
        self.stdout.write('Creating expenses...')
        expenses_list = []
        if not budget_allocations:
            self.stdout.write(self.style.WARNING("No budget allocations to create expenses for. Skipping expense creation."))
            return []
        if not SIMULATED_USERS: # Should not happen if SIMULATED_USERS is defined
            self.stdout.write(self.style.ERROR("SIMULATED_USERS list is empty. Cannot create expenses."))
            return []

        for i in range(50): # Create 50 expenses
            alloc = random.choice(budget_allocations)
            
            # Find users in the same department as the allocation
            department_users = [u for u in SIMULATED_USERS if u['department_code'] == alloc.department.code]
            
            sim_submitter = None
            if department_users:
                # If users exist for that department, pick one randomly
                sim_submitter = random.choice(department_users)
            else:
                # Fallback: If no user is found for that specific department, pick any random user
                self.stdout.write(self.style.WARNING(
                    f"No simulated user found for department {alloc.department.code}. Picking a random user for expense submission."
                ))
                sim_submitter = random.choice(SIMULATED_USERS) 
                # Or use a specific default user:
                # sim_submitter = get_simulated_user(username='admin_auth') # Example default

            if not sim_submitter: # Should not happen if SIMULATED_USERS is not empty
                self.stdout.write(self.style.ERROR("Could not select a simulated submitter. Skipping this expense."))
                continue

            status = random.choice(['SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'])
            expense_data = {
                'project': alloc.project,
                'budget_allocation': alloc,
                'account': alloc.account,
                'department': alloc.department,
                'date': timezone.now() - timedelta(days=random.randint(1, 60)),
                'amount': Decimal(random.randint(100, int(alloc.amount / 20) if alloc.amount > 2000 else 100)),
                'description': f"Expense for {alloc.project.name[:20]}",
                'vendor': random.choice(['Vendor X', 'Vendor Y', 'Vendor Z']),
                'submitted_by_user_id': sim_submitter['id'],         # UPDATED
                'submitted_by_username': sim_submitter['username'], # UPDATED
                'status': status,
                'category': random.choice(expense_categories) if expense_categories else None
            }
            if status == 'APPROVED':
                sim_approver = random.choice([u for u in SIMULATED_USERS if u['username'] in ['admin_auth', 'finance_head_auth']])
                expense_data['approved_by_user_id'] = sim_approver['id']     # UPDATED
                expense_data['approved_by_username'] = sim_approver['username'] # UPDATED
                expense_data['approved_at'] = timezone.now()
            
            expense_obj = Expense.objects.create(**expense_data) # Use a different variable name
            expenses_list.append(expense_obj)
        self.stdout.write(self.style.SUCCESS(f'Created {len(expenses_list)} expenses'))
        return expenses_list

    # create_documents needs to be adapted if you uncomment it.
    # def create_documents(self, budget_proposals, expenses, departments):
    #     sim_uploader = random.choice(SIMULATED_USERS)
    #     # ... use sim_uploader['id'] and sim_uploader['username'] for uploaded_by_user_id etc.

    def create_proposal_history(self, proposals): # MODIFIED: removed users param
        self.stdout.write('Creating proposal history...')
        actions = []
        for proposal in proposals:
            sim_actor = random.choice(SIMULATED_USERS)
            # Create a few history entries for each proposal
            ProposalHistory.objects.create(
                proposal=proposal, action='SUBMITTED', action_by_name=proposal.submitted_by_name or sim_actor['full_name'],
                new_status='SUBMITTED', comments="Initial submission."
            )
            if proposal.status in ['APPROVED', 'REJECTED']:
                ProposalHistory.objects.create(
                    proposal=proposal, action=proposal.status, action_by_name=proposal.approved_by_name or proposal.rejected_by_name or sim_actor['full_name'],
                    previous_status='SUBMITTED', new_status=proposal.status, comments=f"Proposal {proposal.status.lower()}."
                )
        self.stdout.write(self.style.SUCCESS(f'Created proposal history entries for {len(proposals)} proposals.'))


    def create_proposal_comments(self, proposals): # MODIFIED: removed users param
        self.stdout.write('Creating proposal comments...')
        comments = []
        for proposal in proposals:
            for _ in range(random.randint(0, 2)):
                sim_commenter = random.choice(SIMULATED_USERS)
                ProposalComment.objects.create(
                    proposal=proposal,
                    user_id=sim_commenter['id'],             # UPDATED
                    user_username=sim_commenter['username'], # UPDATED
                    comment=random.choice(["Looks good.", "Needs clarification on item X.", "Consider alternatives."])
                )
                comments.append(proposal) # just to count
        self.stdout.write(self.style.SUCCESS(f'Created comments for {len(comments)} proposals.'))


    def create_risk_metrics(self, projects): # MODIFIED: removed users param
        self.stdout.write('Creating risk metrics...')
        metrics = []
        if not projects: return
        for project in projects:
            sim_updater = random.choice(SIMULATED_USERS)
            for risk_type in ['BUDGET', 'TIMELINE']:
                RiskMetric.objects.create(
                    project=project, risk_type=risk_type,
                    risk_level=random.randint(20, 80),
                    description=f"{risk_type} assessment details.",
                    updated_by_user_id=sim_updater['id'],         # UPDATED
                    updated_by_username=sim_updater['username']  # UPDATED
                )
                metrics.append(project) # just to count
        self.stdout.write(self.style.SUCCESS(f'Created risk metrics for {len(metrics)} projects.'))


    def create_dashboard_metrics(self, fiscal_years, departments): # No change needed here
        self.stdout.write('Creating dashboard metrics...')
        # ... (your existing logic, it doesn't directly use User model) ...
        # (Ensure this logic is self-contained and doesn't rely on User model directly)
        metrics = []
        if not fiscal_years or not departments: return
        current_fy = next((fy for fy in fiscal_years if fy.is_active), fiscal_years[0])
        for dept in departments:
            DashboardMetric.objects.create(
                metric_type='BUDGET_UTILIZATION', value=random.uniform(50,90), department=dept, fiscal_year=current_fy, status='NORMAL'
            )
            metrics.append(dept)
        self.stdout.write(self.style.SUCCESS(f'Created dashboard metrics for {len(metrics)} departments.'))


    def create_user_activity_logs(self): # MODIFIED: removed users param, uses SIMULATED_USERS
        self.stdout.write('Creating budget_service activity logs...')
        logs = []
        log_actions_budget = [
            ('PROPOSAL_CREATE', 'SUCCESS'), ('PROPOSAL_UPDATE', 'SUCCESS'),
            ('EXPENSE_CREATE', 'SUCCESS'), ('EXPENSE_APPROVE', 'SUCCESS'),
            ('REPORT_EXPORT', 'SUCCESS')
        ]
        for _ in range(30): # Create some budget-specific logs
            sim_user = random.choice(SIMULATED_USERS)
            log_type, status = random.choice(log_actions_budget)
            UserActivityLog.objects.create(
                user_id=sim_user['id'],                 # UPDATED
                user_username=sim_user['username'],     # UPDATED
                log_type=log_type,
                action=f"{log_type} action performed in budget_service by {sim_user['username']}",
                status=status,
                details={'ip_address': f"10.0.0.{random.randint(1,100)}"} # Example detail
            )
            logs.append(sim_user) # Just to count
        self.stdout.write(self.style.SUCCESS(f'Created {len(logs)} budget_service activity logs.'))