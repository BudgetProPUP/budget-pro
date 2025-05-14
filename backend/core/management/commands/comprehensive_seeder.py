from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from core.models import (
    Department, AccountType, Account, FiscalYear, BudgetProposal, BudgetProposalItem,
    BudgetAllocation, BudgetTransfer, JournalEntry, JournalEntryLine,
    ExpenseCategory, Expense, Document, ProposalHistory, ProposalComment,
    TransactionAudit, Project, RiskMetric, DashboardMetric, UserActivityLog
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial data for testing and development'

    def handle(self, *args, **options):
        self.stdout.write('Starting database seeding process...')
        
        try:
            with transaction.atomic():
                # Create in order of dependencies
                departments = self.create_departments()
                admin_user, users = self.create_users(departments)
                account_types = self.create_account_types()
                accounts = self.create_accounts(account_types, admin_user)
                fiscal_years = self.create_fiscal_years()
                
                # Budget related objects
                expense_categories = self.create_expense_categories()
                budget_proposals = self.create_budget_proposals(departments, fiscal_years, users)
                self.create_budget_proposal_items(budget_proposals, accounts)
                budget_allocations = self.create_budget_allocations(fiscal_years, departments, accounts, admin_user)
                self.create_budget_transfers(fiscal_years, budget_allocations, users)
                
                # Financial transactions
                journal_entries = self.create_journal_entries(users)
                self.create_journal_entry_lines(journal_entries, accounts)
                expenses = self.create_expenses(departments, accounts, budget_allocations, users, expense_categories)
                
                # Supporting documents and history
                self.create_documents(budget_proposals, expenses, users, departments)
                self.create_proposal_history(budget_proposals, users)
                self.create_proposal_comments(budget_proposals, users)
                
                # Projects and metrics
                projects = self.create_projects(departments, budget_proposals)
                self.create_risk_metrics(projects, users)
                self.create_dashboard_metrics(fiscal_years, departments)
                
                # Activity logs
                self.create_user_activity_logs(users)
                
                self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding database: {str(e)}'))
            raise e

    def create_departments(self):
        self.stdout.write('Creating departments...')
        departments = [
            {
                'name': 'Finance Department',
                'code': 'FIN',
                'description': 'Handles financial operations and budget management'
            },
            {
                'name': 'Human Resources',
                'code': 'HR',
                'description': 'Manages personnel, hiring and organizational development'
            },
            {
                'name': 'Information Technology',
                'code': 'IT',
                'description': 'Maintains IT infrastructure and develops software solutions'
            },
            {
                'name': 'Operations',
                'code': 'OPS',
                'description': 'Handles day-to-day operational activities'
            },
            {
                'name': 'Marketing',
                'code': 'MKT',
                'description': 'Manages promotional activities and brand development'
            }
        ]
        
        created_departments = []
        for dept_data in departments:
            dept, created = Department.objects.update_or_create(
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'description': dept_data['description'],
                    'is_active': True
                }
            )
            created_departments.append(dept)
            action = 'Created' if created else 'Updated'
            self.stdout.write(f"{action} department: {dept.name}")
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_departments)} departments'))
        return created_departments

    def create_users(self, departments):
        self.stdout.write('Creating/verifying users...')
        
        # Find departments by code
        dept_dict = {dept.code: dept for dept in departments}
        finance_dept = dept_dict.get('FIN')
        it_dept = dept_dict.get('IT')
        hr_dept = dept_dict.get('HR')
        ops_dept = dept_dict.get('OPS')
        mkt_dept = dept_dict.get('MKT')
        
        # Create or retrieve admin user
        admin_user, admin_created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'FINANCE_HEAD',
                'department': finance_dept,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if admin_created:  # If created new user
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        else:
            # Update existing admin user
            admin_user.role = 'FINANCE_HEAD'  # Ensure role is valid
            admin_user.save()
            self.stdout.write('Updated admin user')
        
        # Create test users
        test_users = [
            {
                'email': 'finance_head@example.com',
                'username': 'finance_head',
                'password': 'password123',
                'first_name': 'Finance',
                'last_name': 'Head',
                'role': 'FINANCE_HEAD',
                'department': finance_dept,
                'phone_number': '09171234567',   
                'is_staff': True,
            },
            {
                'email': 'finance_operator@example.com',
                'username': 'finance_operator',
                'password': 'password123456789',
                'first_name': 'Finance',
                'last_name': 'Operator',
                'role': 'FINANCE_OPERATOR',
                'department': finance_dept,
                'phone_number': '09179876543',
            },
            {
                'email': 'adibentulan@gmail.com',
                'username': 'adi123',
                'password': 'password123',
                'first_name': 'Finance',
                'last_name': 'Operator',
                'role': 'FINANCE_OPERATOR',
                'department': finance_dept,
                'phone_number': '09179876542',
            },
            {
                'email': 'it_operator@example.com',
                'username': 'it_operator',
                'password': 'password123',
                'first_name': 'IT',
                'last_name': 'Operator',
                'role': 'FINANCE_OPERATOR',  # Update role to valid choice
                'department': it_dept,
            },
            {
                'email': 'hr_approver@example.com',
                'username': 'hr_approver',
                'password': 'password123',
                'first_name': 'HR',
                'last_name': 'Approver',
                'role': 'FINANCE_OPERATOR',  # Update from 'APPROVER' to valid role
                'department': hr_dept,
                'phone_number': '09178889999',
            },
            # Additional users for other departments
            {
                'email': 'ops_head@example.com',
                'username': 'ops_head',
                'password': 'password123',
                'first_name': 'Operations',
                'last_name': 'Head',
                'role': 'FINANCE_HEAD',
                'department': ops_dept,
                'phone_number': '09171111111',
            },
            {
                'email': 'mkt_operator@example.com',
                'username': 'mkt_operator',
                'password': 'password123',
                'first_name': 'Marketing',
                'last_name': 'Operator',
                'role': 'FINANCE_OPERATOR',
                'department': mkt_dept,
                'phone_number': '09172222222',
            },
        ]
        
        created_users = []
        for user_data in test_users:
            user, created = User.objects.update_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['username'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'department': user_data['department'],
                    'is_staff': user_data.get('is_staff', False),
                    'phone_number': user_data.get('phone_number'),
                }
            )
            
            if created:  # Only set password for newly created users
                user.set_password(user_data['password'])
                user.save()
            
            created_users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_users)} test users'))
        return admin_user, created_users

    def create_account_types(self):
        self.stdout.write('Creating account types...')
        account_types = [
            {'name': 'Asset', 'description': 'Resources owned by the company'},
            {'name': 'Liability', 'description': 'Obligations owed by the company'},
            {'name': 'Equity', 'description': 'Ownership interest in the company'},
            {'name': 'Revenue', 'description': 'Income earned from operations'},
            {'name': 'Expense', 'description': 'Costs incurred in operations'}
        ]
        
        created_types = []
        for type_data in account_types:
            acct_type, created = AccountType.objects.update_or_create(
                name=type_data['name'],
                defaults={
                    'description': type_data['description'],
                    'is_active': True
                }
            )
            created_types.append(acct_type)
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_types)} account types'))
        return created_types

    def create_accounts(self, account_types, created_by):
        self.stdout.write('Creating accounts...')
        
        # Get account types by name for easier reference
        acct_type_dict = {acct.name: acct for acct in account_types}
        
        # Create parent accounts first
        parent_accounts = [
            {
                'code': '1000',
                'name': 'Assets',
                'description': 'All company assets',
                'account_type': acct_type_dict['Asset'],
                'parent_account': None
            },
            {
                'code': '2000',
                'name': 'Liabilities',
                'description': 'All company liabilities',
                'account_type': acct_type_dict['Liability'],
                'parent_account': None
            },
            {
                'code': '3000',
                'name': 'Equity',
                'description': 'All company equity',
                'account_type': acct_type_dict['Equity'],
                'parent_account': None
            },
            {
                'code': '4000',
                'name': 'Revenue',
                'description': 'All company revenue',
                'account_type': acct_type_dict['Revenue'],
                'parent_account': None
            },
            {
                'code': '5000',
                'name': 'Expenses',
                'description': 'All company expenses',
                'account_type': acct_type_dict['Expense'],
                'parent_account': None
            }
        ]
        
        created_parents = []
        for acct_data in parent_accounts:
            account, created = Account.objects.update_or_create(
                code=acct_data['code'],
                defaults={
                    'name': acct_data['name'],
                    'description': acct_data['description'],
                    'account_type': acct_data['account_type'],
                    'parent_account': None,
                    'created_by': created_by,
                    'is_active': True
                }
            )
            created_parents.append(account)
        
        # Create parent account dictionary for easier reference
        parent_dict = {acct.code: acct for acct in created_parents}
        
        # Create child accounts
        child_accounts = [
            # Asset child accounts
            {
                'code': '1100',
                'name': 'Cash and Cash Equivalents',
                'description': 'Cash on hand and in bank',
                'account_type': acct_type_dict['Asset'],
                'parent_account': parent_dict['1000']
            },
            {
                'code': '1200',
                'name': 'Accounts Receivable',
                'description': 'Amounts owed to the company',
                'account_type': acct_type_dict['Asset'],
                'parent_account': parent_dict['1000']
            },
            {
                'code': '1300',
                'name': 'Inventory',
                'description': 'Items held for sale',
                'account_type': acct_type_dict['Asset'],
                'parent_account': parent_dict['1000']
            },
            {
                'code': '1400',
                'name': 'Fixed Assets',
                'description': 'Long-term tangible assets',
                'account_type': acct_type_dict['Asset'],
                'parent_account': parent_dict['1000']
            },
            
            # Liability child accounts
            {
                'code': '2100',
                'name': 'Accounts Payable',
                'description': 'Amounts owed by the company',
                'account_type': acct_type_dict['Liability'],
                'parent_account': parent_dict['2000']
            },
            {
                'code': '2200',
                'name': 'Accrued Expenses',
                'description': 'Expenses incurred but not yet paid',
                'account_type': acct_type_dict['Liability'],
                'parent_account': parent_dict['2000']
            },
            
            # Expense child accounts
            {
                'code': '5100',
                'name': 'Salaries and Wages',
                'description': 'Employee compensation',
                'account_type': acct_type_dict['Expense'],
                'parent_account': parent_dict['5000']
            },
            {
                'code': '5200',
                'name': 'Office Supplies',
                'description': 'Office consumables',
                'account_type': acct_type_dict['Expense'],
                'parent_account': parent_dict['5000']
            },
            {
                'code': '5300',
                'name': 'Travel and Entertainment',
                'description': 'Business travel expenses',
                'account_type': acct_type_dict['Expense'],
                'parent_account': parent_dict['5000']
            },
            {
                'code': '5400',
                'name': 'IT Equipment',
                'description': 'Technology purchases',
                'account_type': acct_type_dict['Expense'],
                'parent_account': parent_dict['5000']
            },
            {
                'code': '5500',
                'name': 'Professional Development',
                'description': 'Training and education expenses',
                'account_type': acct_type_dict['Expense'],
                'parent_account': parent_dict['5000']
            }
        ]
        
        created_children = []
        for acct_data in child_accounts:
            account, created = Account.objects.update_or_create(
                code=acct_data['code'],
                defaults={
                    'name': acct_data['name'],
                    'description': acct_data['description'],
                    'account_type': acct_data['account_type'],
                    'parent_account': acct_data['parent_account'],
                    'created_by': created_by,
                    'is_active': True
                }
            )
            created_children.append(account)
        
        all_accounts = created_parents + created_children
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(all_accounts)} accounts'))
        return all_accounts

    def create_fiscal_years(self):
        self.stdout.write('Creating fiscal years...')
        
        # Current year and surrounding years
        current_year = datetime.now().year
        fiscal_years = [
            {
                'name': f'FY {current_year-1}',
                'start_date': datetime(current_year-1, 1, 1).date(),
                'end_date': datetime(current_year-1, 12, 31).date(),
                'is_active': False,
                'is_locked': True
            },
            {
                'name': f'FY {current_year}',
                'start_date': datetime(current_year, 1, 1).date(),
                'end_date': datetime(current_year, 12, 31).date(),
                'is_active': True,
                'is_locked': False
            },
            {
                'name': f'FY {current_year+1}',
                'start_date': datetime(current_year+1, 1, 1).date(),
                'end_date': datetime(current_year+1, 12, 31).date(),
                'is_active': False,
                'is_locked': False
            }
        ]
        
        created_years = []
        for year_data in fiscal_years:
            fiscal_year, created = FiscalYear.objects.update_or_create(
                name=year_data['name'],
                defaults={
                    'start_date': year_data['start_date'],
                    'end_date': year_data['end_date'],
                    'is_active': year_data['is_active'],
                    'is_locked': year_data['is_locked']
                }
            )
            created_years.append(fiscal_year)
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_years)} fiscal years'))
        return created_years

    def create_expense_categories(self):
        self.stdout.write('Creating expense categories...')
        
        # Create parent categories (level 1)
        parent_categories = [
            {
                'code': 'OPS',
                'name': 'Operations',
                'description': 'Day-to-day operating expenses',
                'parent_category': None,
                'level': 1
            },
            {
                'code': 'CAP',
                'name': 'Capital Expenditures',
                'description': 'Long-term asset investments',
                'parent_category': None,
                'level': 1
            },
            {
                'code': 'HRM',
                'name': 'Human Resources',
                'description': 'Employee-related expenses',
                'parent_category': None,
                'level': 1
            }
        ]
        
        created_parents = []
        for cat_data in parent_categories:
            category, created = ExpenseCategory.objects.update_or_create(
                code=cat_data['code'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent_category': None,
                    'level': cat_data['level'],
                    'is_active': True
                }
            )
            created_parents.append(category)
        
        # Create mapping for easier reference
        parent_dict = {cat.code: cat for cat in created_parents}
        
        # Create child categories (level 2)
        child_categories = [
            # Operations subcategories
            {
                'code': 'OPS-UTIL',
                'name': 'Utilities',
                'description': 'Electricity, water, internet, etc.',
                'parent_category': parent_dict['OPS'],
                'level': 2
            },
            {
                'code': 'OPS-RENT',
                'name': 'Rent',
                'description': 'Office space and equipment rental',
                'parent_category': parent_dict['OPS'],
                'level': 2
            },
            {
                'code': 'OPS-SUP',
                'name': 'Office Supplies',
                'description': 'Consumable office materials',
                'parent_category': parent_dict['OPS'],
                'level': 2
            },
            
            # Capital expenditure subcategories
            {
                'code': 'CAP-IT',
                'name': 'IT Equipment',
                'description': 'Computer hardware and software',
                'parent_category': parent_dict['CAP'],
                'level': 2
            },
            {
                'code': 'CAP-FAC',
                'name': 'Facilities',
                'description': 'Building and major improvements',
                'parent_category': parent_dict['CAP'],
                'level': 2
            },
            
            # HR subcategories
            {
                'code': 'HRM-SAL',
                'name': 'Salaries',
                'description': 'Base employee compensation',
                'parent_category': parent_dict['HRM'],
                'level': 2
            },
            {
                'code': 'HRM-BEN',
                'name': 'Benefits',
                'description': 'Health insurance, retirement, etc.',
                'parent_category': parent_dict['HRM'],
                'level': 2
            },
            {
                'code': 'HRM-TRN',
                'name': 'Training',
                'description': 'Employee education and development',
                'parent_category': parent_dict['HRM'],
                'level': 2
            }
        ]
        
        created_children = []
        for cat_data in child_categories:
            category, created = ExpenseCategory.objects.update_or_create(
                code=cat_data['code'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent_category': cat_data['parent_category'],
                    'level': cat_data['level'],
                    'is_active': True
                }
            )
            created_children.append(category)
        
        # Create level 3 categories (grandchildren)
        child_dict = {cat.code: cat for cat in created_children}
        
        grandchild_categories = [
            {
                'code': 'HRM-TRN-INT',
                'name': 'Internal Training',
                'description': 'In-house training programs',
                'parent_category': child_dict['HRM-TRN'],
                'level': 3
            },
            {
                'code': 'HRM-TRN-EXT',
                'name': 'External Training',
                'description': 'Third-party training and conferences',
                'parent_category': child_dict['HRM-TRN'],
                'level': 3
            },
            {
                'code': 'CAP-IT-HW',
                'name': 'Hardware',
                'description': 'Physical computing equipment',
                'parent_category': child_dict['CAP-IT'],
                'level': 3
            },
            {
                'code': 'CAP-IT-SW',
                'name': 'Software',
                'description': 'Computer programs and licenses',
                'parent_category': child_dict['CAP-IT'],
                'level': 3
            }
        ]
        
        created_grandchildren = []
        for cat_data in grandchild_categories:
            category, created = ExpenseCategory.objects.update_or_create(
                code=cat_data['code'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'parent_category': cat_data['parent_category'],
                    'level': cat_data['level'],
                    'is_active': True
                }
            )
            created_grandchildren.append(category)
        
        all_categories = created_parents + created_children + created_grandchildren
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(all_categories)} expense categories'))
        return all_categories

    def create_budget_proposals(self, departments, fiscal_years, users):
        self.stdout.write('Creating budget proposals...')
        
        # Get the current fiscal year
        current_year = datetime.now().year
        current_fy = next((fy for fy in fiscal_years if fy.name == f'FY {current_year}'), fiscal_years[0])
        
        # Get a finance user to be the submitter
        finance_user = next((user for user in users if user.department and user.department.code == 'FIN'), users[0])
        
        # Create proposals for each department
        proposals = []
        statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
        
        for i, department in enumerate(departments):
            # Create multiple proposals for each department with different statuses
            for j, status in enumerate(statuses):
                start_date = current_fy.start_date + timedelta(days=30*j)
                end_date = start_date + timedelta(days=90)  # 3-month performance period
                
                # Create a unique external system ID
                external_id = f"EXT-{department.code}-{current_year}-{i+1}{j+1}"
                
                proposal_data = {
                    'title': f"{department.name} {['Q1', 'Q2', 'Q3', 'Q4'][j % 4]} Budget {random.choice(['Initiative', 'Plan', 'Project'])}",
                    'project_summary': f"Budget proposal for {department.name} {['Q1', 'Q2', 'Q3', 'Q4'][j % 4]} operations",
                    'project_description': f"This budget covers all planned activities for {department.name} during {['Q1', 'Q2', 'Q3', 'Q4'][j % 4]} including staffing, equipment, and operational expenses.",
                    'department': department,
                    'fiscal_year': current_fy,
                    'submitted_by': finance_user,
                    'status': status,
                    'performance_start_date': start_date,
                    'performance_end_date': end_date,
                    'submitted_at': timezone.now() if status != 'DRAFT' else None,
                    'external_system_id': external_id,
                    'sync_status': random.choice(['SYNCED', 'PENDING', 'FAILED']),
                }
                
                # Add approval/rejection info for relevant statuses
                if status == 'APPROVED':
                    proposal_data['approved_by'] = users[0]  # Admin user
                    proposal_data['approval_date'] = timezone.now() - timedelta(days=random.randint(1, 10))
                elif status == 'REJECTED':
                    proposal_data['rejected_by'] = users[0]  # Admin user
                    proposal_data['rejection_date'] = timezone.now() - timedelta(days=random.randint(1, 10))
                
                proposal, created = BudgetProposal.objects.update_or_create(
                    title=proposal_data['title'],
                    department=proposal_data['department'],
                    fiscal_year=proposal_data['fiscal_year'],
                    defaults=proposal_data
                )
                
                proposals.append(proposal)
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(proposals)} budget proposals'))
        return proposals
        
    def create_budget_proposal_items(self, proposals, accounts):
        self.stdout.write('Creating budget proposal items...')
        
        # Get expense accounts
        expense_accounts = [acc for acc in accounts if acc.account_type.name == 'Expense']
        if not expense_accounts:
            expense_accounts = accounts  # Fallback
        
        items_created = 0
        
        # For each proposal in DRAFT, SUBMITTED, or UNDER_REVIEW status, create items
        for proposal in proposals:
            if proposal.status in ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED']:
                # Number of items for this proposal (3-7)
                num_items = random.randint(3, 7)
                
                for i in range(num_items):
                    account = random.choice(expense_accounts)
                    cost_element = f"CE-{random.randint(1000, 9999)}"
                    
                    # Generate cost that makes sense for the account
                    if 'Salaries' in account.name:
                        cost = Decimal(random.randint(500000, 2000000))
                    elif 'Equipment' in account.name:
                        cost = Decimal(random.randint(50000, 500000))
                    else:
                        cost = Decimal(random.randint(10000, 100000))
                    
                    item, created = BudgetProposalItem.objects.update_or_create(
                        proposal=proposal,
                        cost_element=cost_element,
                        defaults={
                            'description': f"{account.name} expenses for {proposal.department.name}",
                            'estimated_cost': cost,
                            'account': account,
                            'notes': f"Based on {proposal.fiscal_year.name} projections"
                        }
                    )
                    
                    items_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {items_created} budget proposal items'))
        
    def create_budget_allocations(self, fiscal_years, departments, accounts, created_by):
        self.stdout.write('Creating budget allocations...')
        
        # Get current fiscal year and expense accounts
        current_fy = next(fy for fy in fiscal_years if fy.is_active)
        expense_accounts = [acc for acc in accounts if acc.account_type.name == 'Expense']
        
        allocations = []
        for department in departments:
            for account in expense_accounts[:3]:  # Allocate to first 3 expense accounts
                # Check for existing allocation
                alloc, created = BudgetAllocation.objects.get_or_create(
                    fiscal_year=current_fy,
                    department=department,
                    account=account,
                    defaults={
                        'amount': Decimal(random.randint(100000, 5000000)),
                        'created_by': created_by,
                        'is_active': True
                    }
                )
                allocations.append(alloc)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(allocations)} budget allocations'))
        return allocations

    def create_budget_transfers(self, fiscal_years, allocations, users):
        self.stdout.write('Creating budget transfers...')
        
        transfers = []
        current_fy = next(fy for fy in fiscal_years if fy.is_active)
        
        for _ in range(10):  # Create 10 transfers
            source = random.choice(allocations)
            dest = random.choice([a for a in allocations if a != source])
            
            transfer = BudgetTransfer.objects.create(
                fiscal_year=current_fy,
                source_allocation=source,
                destination_allocation=dest,
                transferred_by=random.choice(users),
                amount=Decimal(random.randint(10000, 100000)),
                reason=f"Budget reallocation between {source.department} and {dest.department}",
                status=random.choice(['PENDING', 'APPROVED', 'REJECTED'])
            )
            transfers.append(transfer)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(transfers)} budget transfers'))
        return transfers

    def create_journal_entries(self, users):
        self.stdout.write('Creating journal entries...')
        
        entries = []
        for _ in range(20):  # Create 20 journal entries
            entry = JournalEntry.objects.create(
                category=random.choice(['EXPENSES', 'ASSETS', 'PROJECTS']),
                description=f"Journal entry for {random.choice(['month-end', 'adjustment', 'reconciliation'])}",
                date=datetime.now() - timedelta(days=random.randint(1, 365)),
                total_amount=Decimal(0),  # Will be updated by lines
                status='POSTED',
                created_by=random.choice(users)
            )
            entries.append(entry)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(entries)} journal entries'))
        return entries

    def create_journal_entry_lines(self, journal_entries, accounts):
        self.stdout.write('Creating journal entry lines...')
        
        for entry in journal_entries:
            total = Decimal(0)
            # Create 2-4 lines per entry
            for _ in range(random.randint(2, 4)):
                amount = Decimal(random.randint(1000, 100000))
                line = JournalEntryLine.objects.create(
                    journal_entry=entry,
                    account=random.choice(accounts),
                    description=f"Journal line for {entry.description}",
                    transaction_type=random.choice(['DEBIT', 'CREDIT']),
                    journal_transaction_type=random.choice(['OPERATIONAL_EXPENDITURE', 'CAPITAL_EXPENDITURE']),
                    amount=amount
                )
                if line.transaction_type == 'DEBIT':
                    total += amount
                else:
                    total -= amount
            
            # Update entry total and save
            entry.total_amount = abs(total)
            entry.save()
        
        self.stdout.write(self.style.SUCCESS(f'Added lines to {len(journal_entries)} journal entries'))

    def create_expenses(self, departments, accounts, allocations, users, categories):
        self.stdout.write('Creating expenses...')
        
        expenses = []
        statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
        
        for i in range(100):  # Create 100 expenses
            alloc = random.choice(allocations)
            # Generate a unique transaction_id
            transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d')}-{i+1:04d}"
            
            expense = Expense.objects.create(
                transaction_id=transaction_id,  # Add this line to set a unique transaction_id
                date=datetime.now() - timedelta(days=random.randint(1, 90)),
                amount=Decimal(random.randint(1000, 50000)),
                description=f"Expense for {alloc.department.name} - {random.choice(['supplies', 'services', 'equipment'])}",
                vendor=random.choice(['Vendor A', 'Vendor B', 'Vendor C']),
                account=alloc.account,
                department=alloc.department,
                budget_allocation=alloc,
                submitted_by=random.choice(users),
                status=random.choice(statuses),
                category=random.choice(categories)
            )
            if expense.status == 'APPROVED':
                expense.approved_by = random.choice([u for u in users if u.role == 'FINANCE_HEAD'])
                expense.approved_at = timezone.now()
                expense.save()
            expenses.append(expense)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(expenses)} expenses'))
        return expenses

    def create_documents(self, proposals, expenses, users, departments):
        self.stdout.write('Creating documents...')
        
        documents = []
        for proposal in proposals:
            if random.random() < 0.7:  # 70% chance to add doc to proposal
                doc = Document.objects.create(
                    name=f"Proposal Document - {proposal.title}",
                    document_type='PROPOSAL',
                    uploaded_by=proposal.submitted_by,
                    department=proposal.department,
                    proposal=proposal,
                    file=f"documents/proposal_{proposal.id}.pdf"
                )
                documents.append(doc)
        
        for expense in expenses:
            if random.random() < 0.5:  # 50% chance to add receipt
                doc = Document.objects.create(
                    name=f"Receipt for {expense.description}",
                    document_type='RECEIPT',
                    uploaded_by=expense.submitted_by,
                    department=expense.department,
                    expense=expense,
                    file=f"receipts/expense_{expense.id}.pdf"
                )
                documents.append(doc)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(documents)} documents'))
        return documents

    def create_proposal_history(self, proposals, users):
        self.stdout.write('Creating proposal history...')
        
        actions = []
        for proposal in proposals:
            # Create initial creation entry
            actions.append(ProposalHistory(
                proposal=proposal,
                action='CREATED',
                action_by=proposal.submitted_by,
                previous_status=None,
                new_status='DRAFT'
            ))
            
            # Simulate status changes
            if proposal.status != 'DRAFT':
                actions.append(ProposalHistory(
                    proposal=proposal,
                    action='SUBMITTED',
                    action_by=proposal.submitted_by,
                    previous_status='DRAFT',
                    new_status=proposal.status
                ))
                
            if proposal.status in ['APPROVED', 'REJECTED']:
                actions.append(ProposalHistory(
                    proposal=proposal,
                    action=proposal.status,
                    action_by=users[0],  # Admin user
                    previous_status='UNDER_REVIEW',
                    new_status=proposal.status
                ))
        
        ProposalHistory.objects.bulk_create(actions)
        self.stdout.write(self.style.SUCCESS(f'Created {len(actions)} proposal history entries'))

    def create_proposal_comments(self, proposals, users):
        self.stdout.write('Creating proposal comments...')
        
        comments = []
        for proposal in proposals:
            for _ in range(random.randint(0, 3)):  # 0-3 comments per proposal
                comments.append(ProposalComment(
                    proposal=proposal,
                    user=random.choice(users),
                    comment=random.choice([
                        "Need more details in section 3",
                        "Budget numbers look reasonable",
                        "Please clarify the timeline",
                        "Approved pending final review"
                    ])
                ))
        
        ProposalComment.objects.bulk_create(comments)
        self.stdout.write(self.style.SUCCESS(f'Created {len(comments)} proposal comments'))

    def create_projects(self, departments, proposals):
        self.stdout.write('Creating projects...')
        
        projects = []
        status_weights = [('PLANNING', 2), ('IN_PROGRESS', 5), ('COMPLETED', 2), ('ON_HOLD', 1)]
        statuses = [s[0] for s in status_weights for _ in range(s[1])]
        
        for dept in departments:
            for _ in range(3):  # 3 projects per department
                proposal = random.choice([p for p in proposals if p.department == dept])
                project = Project.objects.create(
                    name=f"{dept.code} {random.choice(['Automation', 'Optimization', 'Renewal'])} Project",
                    description=f"{dept.name} strategic initiative",
                    start_date=datetime.now() - timedelta(days=random.randint(30, 180)),
                    end_date=datetime.now() + timedelta(days=random.randint(90, 365)),
                    department=dept,
                    budget_proposal=proposal,
                    status=random.choice(statuses)
                )
                projects.append(project)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(projects)} projects'))
        return projects

    def create_risk_metrics(self, projects, users):
        self.stdout.write('Creating risk metrics...')
        
        metrics = []
        for project in projects:
            for risk_type in ['BUDGET', 'TIMELINE', 'RESOURCES']:
                metrics.append(RiskMetric(
                    project=project,
                    risk_type=risk_type,
                    risk_level=random.randint(0, 100),
                    description=f"{risk_type} risk assessment",
                    updated_by=random.choice(users)
                ))
        
        RiskMetric.objects.bulk_create(metrics)
        self.stdout.write(self.style.SUCCESS(f'Created {len(metrics)} risk metrics'))

    def create_dashboard_metrics(self, fiscal_years, departments):
        self.stdout.write('Creating dashboard metrics...')
        
        metrics = []
        current_fy = next(fy for fy in fiscal_years if fy.is_active)
        
        for dept in departments:
            # Budget utilization metric
            metrics.append(DashboardMetric(
                metric_type='BUDGET_UTILIZATION',
                value=random.uniform(60, 95),
                percentage=random.uniform(60, 95),
                status='WARNING' if random.random() < 0.3 else 'NORMAL',
                fiscal_year=current_fy,
                department=dept
            ))
            
            # Project completion metric
            metrics.append(DashboardMetric(
                metric_type='PROJECT_COMPLETION',
                value=random.uniform(30, 100),
                percentage=random.uniform(30, 100),
                status='ON_TRACK' if random.random() < 0.7 else 'DELAYED',
                fiscal_year=current_fy,
                department=dept
            ))
        
        DashboardMetric.objects.bulk_create(metrics)
        self.stdout.write(self.style.SUCCESS(f'Created {len(metrics)} dashboard metrics'))

    def create_user_activity_logs(self, users):
        self.stdout.write('Creating user activity logs...')
        
        logs = []
        actions = [
            ('LOGIN', 'SUCCESS', 20),
            ('EXPORT', 'SUCCESS', 5),
            ('CREATE', 'SUCCESS', 15),
            ('UPDATE', 'SUCCESS', 25),
            ('ERROR', 'FAILED', 3)
        ]
        
        for _ in range(100):  # Create 100 log entries
            user = random.choice(users)
            log_type, status = random.choices(
                [a[:2] for a in actions],
                weights=[a[2] for a in actions]
            )[0]
            
            logs.append(UserActivityLog(
                user=user,
                log_type=log_type,
                action=f"{log_type} action performed",
                status=status,
                details={'ip': f"192.168.1.{random.randint(1, 255)}"} if log_type == 'LOGIN' else None
            ))
        
        UserActivityLog.objects.bulk_create(logs)
        self.stdout.write(self.style.SUCCESS(f'Created {len(logs)} user activity logs'))