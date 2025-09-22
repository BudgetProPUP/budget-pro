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

    def create_expense_categories(self):
        self.stdout.write('Creating expense categories...')
        
        # Define the categories based on your UI mockups and common business needs
        categories_data = [
            {'code': 'TRAIN', 'name': 'Training and Development', 'level': 1},
            {'code': 'PROF_SERV', 'name': 'Professional Services', 'level': 1},
            {'code': 'EQUIP', 'name': 'Equipment and Maintenance', 'level': 1},
            {'code': 'TRAVEL', 'name': 'Travel', 'level': 1},
            {'code': 'OFFICE', 'name': 'Office Supplies', 'level': 1},
            {'code': 'UTIL', 'name': 'Utilities', 'level': 1},
            {'code': 'MKTG', 'name': 'Marketing & Advertising', 'level': 1},
            {'code': 'MISC', 'name': 'Miscellaneous', 'level': 1},
        ]

        created_categories = []
        for cat_data in categories_data:
            # Use update_or_create to ensure this is idempotent and safe to run multiple times
            category, created = ExpenseCategory.objects.update_or_create(
                code=cat_data['code'],
                defaults={'name': cat_data['name'], 'level': cat_data['level'], 'is_active': True}
            )
            created_categories.append(category)

        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_categories)} expense categories.'))
        return created_categories


    def create_budget_proposals(self, departments, fiscal_years): # MODIFIED: removed users param
        self.stdout.write('Creating budget proposals...')
        current_year = datetime.now().year
        current_fy = next((fy for fy in fiscal_years if fy.name == f'FY {current_year}'), fiscal_years[0])
        proposals = []
        # MODIFIED: Changed range(2) to range(32) to create 160 proposals (5 depts * 32 proposals)
        for i, department in enumerate(departments):
            for j in range(32): # Create 32 proposals per department
                sim_submitter = random.choice(SIMULATED_USERS) # Get a simulated user
                proposal_data = {
                    'title': f"{department.name} Initiative #{j+1} FY{current_year}",
                    'project_summary': f"Summary for {department.name} initiative #{j+1}",
                    'project_description': f"Detailed description for {department.name} initiative #{j+1}",
                    'department': department,
                    'fiscal_year': current_fy,
                    'submitted_by_name': sim_submitter['full_name'], # UPDATED
                    'performance_start_date': current_fy.start_date + timedelta(days=12*j),
                    'performance_end_date': current_fy.start_date + timedelta(days=12*(j+1)-1),
                    'external_system_id': f"EXT-{department.code}-{current_year}-{j+1:03d}",
                    'status': random.choice(['SUBMITTED', 'APPROVED', 'APPROVED', 'REJECTED']), # Skew towards approved
                }
                if proposal_data['status'] == 'APPROVED':
                    sim_approver = random.choice(SIMULATED_USERS)
                    proposal_data['approved_by_name'] = sim_approver['full_name']
                    proposal_data['approval_date'] = timezone.now() - timedelta(days=random.randint(1,30))
                
                if proposal_data['status'] == 'REJECTED':
                    sim_rejector = random.choice(SIMULATED_USERS)
                    proposal_data['rejected_by_name'] = sim_rejector['full_name']
                    proposal_data['rejection_date'] = timezone.now() - timedelta(days=random.randint(1,30))

                proposal, _ = BudgetProposal.objects.update_or_create(
                    external_system_id=proposal_data['external_system_id'], # Use a unique field
                    defaults=proposal_data
                )
                proposals.append(proposal)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(proposals)} budget proposals'))
        return proposals

    def create_budget_proposal_items(self, proposals, accounts): # IDEMPOTENT
        self.stdout.write('Creating budget proposal items...')
        items_created = 0
        expense_accounts = [acc for acc in accounts if acc.account_type.name == 'Expense'] or accounts
        for proposal in proposals:
            if proposal.items.exists():                                             # IDEMPOTENCY: Skip if items already exist for this proposal.
                continue

            for _ in range(random.randint(1,3)):
                account = random.choice(expense_accounts)
                BudgetProposalItem.objects.create(                                  # This is now safe due to the check above.
                    proposal=proposal, cost_element=f"CE-{random.randint(100,999)}",
                    description=f"{account.name} for {proposal.title[:20]}",
                    estimated_cost=Decimal(random.randint(1000, 50000)),
                    account=account
                )
                items_created +=1
        self.stdout.write(self.style.SUCCESS(f'Created {items_created} budget proposal items'))


    def create_projects(self, departments, proposals): # No change needed here
        self.stdout.write('Creating projects...')
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


    def create_budget_allocations(self, projects, accounts, sim_creator_user, categories):
        self.stdout.write('Creating budget allocations...')
        allocations_created = 0
        if not projects or not categories:
            self.stdout.write(self.style.WARNING("Skipping budget allocation creation due to missing projects or categories."))
            return []

        for project in projects:
            # Ensure the project is linked to a proposal with items
            if not hasattr(project, 'budget_proposal') or not project.budget_proposal.items.exists():
                continue

            # Iterate through each item in the approved proposal to create a specific allocation line
            for item in project.budget_proposal.items.all():
                chosen_category = random.choice(categories)

                # IDEMPOTENCY: Use a logical key (project, account, category) to prevent duplicates.
                # This creates multiple, distinct allocation lines for a single project.
                alloc, created = BudgetAllocation.objects.update_or_create(
                    project=project,
                    account=item.account,
                    category=chosen_category,
                    defaults={
                        'fiscal_year': project.budget_proposal.fiscal_year,
                        'department': project.department,
                        'proposal': project.budget_proposal,
                        'created_by_name': sim_creator_user['full_name'],
                        'amount': item.estimated_cost,  # Allocate the cost from the proposal item
                        'is_active': True
                    }
                )
                if created:
                    allocations_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created/Updated {allocations_created} budget allocations. (Existing ones were skipped)'))
        # Return all relevant allocations for subsequent seeder steps
        return list(BudgetAllocation.objects.filter(project__in=projects))

    def create_budget_transfers(self, fiscal_years, allocations): # IDEMPOTENT
        self.stdout.write('Creating budget transfers...')
        if BudgetTransfer.objects.exists():                                         # IDEMPOTENCY: Skip if any transfers exist.
            self.stdout.write(self.style.SUCCESS('Budget transfers already exist, skipping creation.'))
            return list(BudgetTransfer.objects.all())
        
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
            transfer = BudgetTransfer.objects.create(**transfer_data)
            transfers.append(transfer)
        self.stdout.write(self.style.SUCCESS(f'Created {len(transfers)} budget transfers'))
        return transfers

    def create_journal_entries(self): # IDEMPOTENT
        self.stdout.write('Creating journal entries...')
        entries = []
        for i in range(10):
            sim_creator = random.choice(SIMULATED_USERS)
            deterministic_desc = f"JE for {sim_creator['department_code']} - Seeded Entry #{i+1}" # IDEMPOTENCY: Create a stable key.
            entry, _ = JournalEntry.objects.get_or_create(
                description=deterministic_desc,                                     # IDEMPOTENCY: Use the stable key.
                defaults={
                    'category': random.choice(['EXPENSES', 'ASSETS']),
                    'date': timezone.now() - timedelta(days=random.randint(1, 90)),
                    'total_amount': Decimal(0), # Will be updated by lines
                    'status': 'POSTED',
                    'created_by_user_id': sim_creator['id'],
                    'created_by_username': sim_creator['username']
                }
            )
            entries.append(entry)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(entries)} journal entries'))
        return entries

    def create_journal_entry_lines(self, journal_entries, accounts): # IDEMPOTENT
        self.stdout.write('Creating journal entry lines...')
        if not accounts: return
        for entry in journal_entries:
            if entry.lines.exists():                                                # IDEMPOTENCY: Skip if lines already exist for this entry.
                continue

            debit_total = Decimal(0)
            credit_total = Decimal(0)
            num_lines = random.randint(2,4)
            for i in range(num_lines):
                amount = Decimal(random.randint(100, 10000))
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

                if amount <=0: amount = Decimal(random.randint(100,1000))

                JournalEntryLine.objects.create(
                    journal_entry=entry, account=random.choice(accounts),
                    transaction_type=tran_type,
                    journal_transaction_type=random.choice(['OPERATIONAL_EXPENDITURE', 'CAPITAL_EXPENDITURE']),
                    amount=amount, description=entry.description
                )
                if tran_type == 'DEBIT': debit_total += amount
                else: credit_total += amount
            entry.total_amount = debit_total
            entry.save()
        self.stdout.write(self.style.SUCCESS(f'Added lines to {len(journal_entries)} journal entries'))


    def create_expenses(self, departments, accounts, budget_allocations, expense_categories): # IDEMPOTENT
        self.stdout.write('Creating expenses...')
        expenses_list = []
        if not budget_allocations:
            self.stdout.write(self.style.WARNING("No budget allocations to create expenses for. Skipping expense creation."))
            return []
        if not SIMULATED_USERS:
            self.stdout.write(self.style.ERROR("SIMULATED_USERS list is empty. Cannot create expenses."))
            return []

        for i in range(50): # Create 50 expenses
            alloc = random.choice(budget_allocations)
            department_users = [u for u in SIMULATED_USERS if u['department_code'] == alloc.department.code]
            sim_submitter = random.choice(department_users) if department_users else random.choice(SIMULATED_USERS)

            status = random.choice(['SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'])
            deterministic_desc = f"Expense for {alloc.project.name[:20]} - Seeded Item #{i+1}" # IDEMPOTENCY: Create a stable key.
            
            defaults = {
                'budget_allocation': alloc, 'account': alloc.account, 'department': alloc.department,
                'date': timezone.now() - timedelta(days=random.randint(1, 60)),
                'amount': Decimal(random.randint(100, int(alloc.amount / 20) if alloc.amount > 2000 else 100)),
                'vendor': random.choice(['Vendor X', 'Vendor Y', 'Vendor Z']),
                'submitted_by_user_id': sim_submitter['id'],
                'submitted_by_username': sim_submitter['username'],
                'status': status,
                'category': random.choice(expense_categories) if expense_categories else None
            }
            if status == 'APPROVED':
                sim_approver = random.choice([u for u in SIMULATED_USERS if u['username'] in ['admin_auth', 'finance_head_auth']])
                defaults['approved_by_user_id'] = sim_approver['id']
                defaults['approved_by_username'] = sim_approver['username']
                defaults['approved_at'] = timezone.now()
            
            expense_obj, _ = Expense.objects.get_or_create(
                project=alloc.project,                                              # IDEMPOTENCY: Use a compound key.
                description=deterministic_desc,                                     # IDEMPOTENCY: Use a compound key.
                defaults=defaults
            )
            expenses_list.append(expense_obj)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(expenses_list)} expenses'))
        return expenses_list

    def create_proposal_history(self, proposals): # IDEMPOTENT
        self.stdout.write('Creating proposal history...')
        for proposal in proposals:
            sim_actor = random.choice(SIMULATED_USERS)
            
            # Check if SUBMITTED history already exists
            if not ProposalHistory.objects.filter(proposal=proposal, action='SUBMITTED').exists():
                ProposalHistory.objects.create(
                    proposal=proposal, 
                    action='SUBMITTED',
                    action_by_name=proposal.submitted_by_name or sim_actor['full_name'],
                    new_status='SUBMITTED', 
                    comments="Initial submission."
                )
            
            # Check if approval/rejection history already exists
            if proposal.status in ['APPROVED', 'REJECTED']:
                if not ProposalHistory.objects.filter(proposal=proposal, action=proposal.status).exists():
                    ProposalHistory.objects.create(
                        proposal=proposal, 
                        action=proposal.status,
                        action_by_name=proposal.approved_by_name or proposal.rejected_by_name or sim_actor['full_name'],
                        previous_status='SUBMITTED', 
                        new_status=proposal.status,
                        comments=f"Proposal {proposal.status.lower()}."
                    )
        self.stdout.write(self.style.SUCCESS(f'Created proposal history entries for {len(proposals)} proposals.'))


    def create_proposal_comments(self, proposals): # IDEMPOTENT
        self.stdout.write('Creating proposal comments...')
        comments_created = 0
        for proposal in proposals:
            if proposal.comments.exists():                                          # IDEMPOTENCY: Skip if comments already exist.
                continue
                
            for _ in range(random.randint(0, 2)):
                sim_commenter = random.choice(SIMULATED_USERS)
                ProposalComment.objects.create(
                    proposal=proposal,
                    user_id=sim_commenter['id'],
                    user_username=sim_commenter['username'],
                    comment=random.choice(["Looks good.", "Needs clarification on item X.", "Consider alternatives."])
                )
                comments_created += 1
        self.stdout.write(self.style.SUCCESS(f'Created {comments_created} new proposal comments.'))


    def create_risk_metrics(self, projects): # IDEMPOTENT
        self.stdout.write('Creating risk metrics...')
        metrics = []
        if not projects: return
        for project in projects:
            sim_updater = random.choice(SIMULATED_USERS)
            for risk_type in ['BUDGET', 'TIMELINE']:
                RiskMetric.objects.update_or_create(                                # IDEMPOTENCY: Use update_or_create with the model's unique_together key.
                    project=project, risk_type=risk_type,
                    defaults={
                        'risk_level': random.randint(20, 80),
                        'description': f"{risk_type} assessment details.",
                        'updated_by_user_id': sim_updater['id'],
                        'updated_by_username': sim_updater['username']
                    }
                )
                metrics.append(project)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated risk metrics for {len(projects)} projects.'))


    def create_dashboard_metrics(self, fiscal_years, departments): # IDEMPOTENT
        self.stdout.write('Creating dashboard metrics...')
        metrics = []
        if not fiscal_years or not departments: return
        current_fy = next((fy for fy in fiscal_years if fy.is_active), fiscal_years[0])
        for dept in departments:
            DashboardMetric.objects.update_or_create(                               # IDEMPOTENCY: Use update_or_create with a logical unique key.
                metric_type='BUDGET_UTILIZATION', department=dept, fiscal_year=current_fy,
                defaults={'value': random.uniform(50,90), 'status': 'NORMAL'}
            )
            metrics.append(dept)
        self.stdout.write(self.style.SUCCESS(f'Created/Updated dashboard metrics for {len(metrics)} departments.'))


    def create_user_activity_logs(self): # IDEMPOTENT
        self.stdout.write('Creating budget_service activity logs...')
        if UserActivityLog.objects.exists():                                        # IDEMPOTENCY: Skip if any logs exist.
            self.stdout.write(self.style.SUCCESS('User activity logs already exist, skipping creation.'))
            return
            
        logs = []
        # MODIFIED: Mapped log types to valid choices from the UserActivityLog model
        log_actions_budget = [
            ('CREATE', 'SUCCESS'), 
            ('UPDATE', 'SUCCESS'),
            ('CREATE', 'SUCCESS'), 
            ('UPDATE', 'SUCCESS'), # Approval is an update to the record
            ('EXPORT', 'SUCCESS'),
            ('ERROR', 'FAILED') # Add some error logs
        ]
        log_action_descriptions = [
            "Proposal created", "Proposal status updated",
            "Expense submitted", "Expense approved",
            "Report exported to Excel", "Failed to connect to external service"
        ]

        for i in range(30): # Create some budget-specific logs
            sim_user = random.choice(SIMULATED_USERS)
            log_type, status = random.choice(log_actions_budget)
            action_desc = log_action_descriptions[i % len(log_action_descriptions)]

            UserActivityLog.objects.create(
                user_id=sim_user['id'],
                user_username=sim_user['username'],
                log_type=log_type,
                action=f"{action_desc} by {sim_user['username']}",
                status=status,
                details={'ip_address': f"10.0.0.{random.randint(1,100)}"}
            )
            logs.append(sim_user)
        self.stdout.write(self.style.SUCCESS(f'Created {len(logs)} budget_service activity logs.'))