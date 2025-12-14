from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import datetime
import random
import calendar
from decimal import Decimal

# Import models
from core.models import (
    Department, AccountType, Account, FiscalYear, BudgetProposal, BudgetProposalItem,
    BudgetAllocation, ExpenseCategory, Expense, Project, ProjectFiscalYear
)

# ... (SIMULATED_USERS, DEPARTMENTS_CONFIG, CATEGORY_TREE - KEEP SAME) ...
SIMULATED_USERS = [
    {'id': 1, 'username': 'admin_auth', 'full_name': 'AuthAdmin User', 'dept': 'FIN', 'role': 'ADMIN'},
    {'id': 2, 'username': 'finance_head_auth', 'full_name': 'Finance Head', 'dept': 'FIN', 'role': 'FINANCE_HEAD'},
    {'id': 3, 'username': 'it_user_auth', 'full_name': 'IT Support', 'dept': 'IT', 'role': 'ADMIN'}, 
    {'id': 4, 'username': 'ops_user_auth', 'full_name': 'Operations Staff', 'dept': 'OPS', 'role': 'GENERAL_USER'},
    {'id': 5, 'username': 'adi123', 'full_name': 'Eldrin Adi', 'dept': 'IT', 'role': 'ADMIN'}, 
    {'id': 6, 'username': 'mkt_user_auth', 'full_name': 'Marketing Specialist', 'dept': 'MKT', 'role': 'GENERAL_USER'},
    {'id': 7, 'username': 'hr_user_auth', 'full_name': 'HR Manager', 'dept': 'HR', 'role': 'GENERAL_USER'},
    {'id': 8, 'username': 'sales_user', 'full_name': 'Sales Manager', 'dept': 'SALES', 'role': 'GENERAL_USER'}, 
    {'id': 9, 'username': 'logistics_user', 'full_name': 'Logistics Manager', 'dept': 'LOG', 'role': 'GENERAL_USER'},
    {'id': 10, 'username': 'merch_user', 'full_name': 'Merch Planner', 'dept': 'MERCH', 'role': 'GENERAL_USER'},
]

DEPARTMENTS_CONFIG = [
    {'code': 'MERCH', 'name': 'Merchandising / Merchandise Planning'},
    {'code': 'SALES', 'name': 'Sales / Store Operations'},
    {'code': 'MKT', 'name': 'Marketing / Marketing Communications'},
    {'code': 'OPS', 'name': 'Operations Department'},
    {'code': 'IT', 'name': 'IT Application & Data'},
    {'code': 'LOG', 'name': 'Logistics Management'},
    {'code': 'HR', 'name': 'Human Resources'},
    {'code': 'FIN', 'name': 'Finance Department'}, 
]

CATEGORY_TREE = {
    'MERCH': [
        ('Product Range Planning', 'OPEX'),
        ('Buying Costs', 'MIXED'),
        ('Market Research', 'OPEX'),
        ('Inventory Handling Fees', 'OPEX'),
        ('Supplier Coordination', 'OPEX'),
        ('Seasonal Planning Tools', 'CAPEX'),
        ('Training', 'OPEX'),
        ('Travel', 'OPEX'),
        ('Software Subscription', 'OPEX'),
    ],
    'SALES': [
        ('Store Consumables', 'OPEX'),
        ('POS Maintenance', 'OPEX'),
        ('Store Repairs', 'MIXED'),
        ('Sales Incentives', 'OPEX'),
        ('Uniforms', 'MIXED'),
        ('Store Opening Expenses', 'CAPEX'),
        ('Store Supplies', 'OPEX'),
        ('Utilities', 'OPEX'),
    ],
    'MKT': [
        ('Campaign Budget', 'OPEX'),
        ('Branding Materials', 'MIXED'),
        ('Digital Ads', 'OPEX'),
        ('Social Media Management', 'OPEX'),
        ('Events Budget', 'OPEX'),
        ('Influencer Fees', 'OPEX'),
        ('Photography/Videography', 'MIXED'),
    ],
    'OPS': [
        ('Equipment Maintenance', 'OPEX'),
        ('Fleet/Vehicle Expenses', 'MIXED'),
        ('Operational Supplies', 'OPEX'),
        ('Business Permits', 'OPEX'),
        ('Facility Utilities', 'OPEX'),
        ('Compliance Costs', 'OPEX'),
    ],
    'IT': [
        ('Server Hosting', 'OPEX'),
        ('Software Licenses', 'MIXED'),
        ('Cloud Subscriptions', 'OPEX'),
        ('Hardware Purchases', 'CAPEX'),
        ('Data Tools', 'MIXED'),
        ('Cybersecurity Costs', 'OPEX'),
        ('API Subscription Fees', 'OPEX'),
        ('Domain Renewals', 'OPEX'),
    ],
    'LOG': [
        ('Shipping Costs', 'OPEX'),
        ('Warehouse Equipment', 'CAPEX'),
        ('Transport & Fuel', 'OPEX'),
        ('Freight Fees', 'OPEX'),
        ('Vendor Delivery Charges', 'OPEX'),
        ('Storage Fees', 'OPEX'),
        ('Packaging Materials', 'OPEX'),
        ('Safety Gear', 'MIXED'),
    ],
    'HR': [
        ('Recruitment Expenses', 'OPEX'),
        ('Job Posting Fees', 'OPEX'),
        ('Employee Engagement Activities', 'OPEX'),
        ('Training & Workshops', 'OPEX'),
        ('Medical & Wellness Programs', 'OPEX'),
        ('Background Checks', 'OPEX'),
        ('HR Systems/Payroll Software', 'MIXED'),
    ],
    'FIN': [
        ('Professional Services', 'OPEX'), 
        ('Audit Fees', 'OPEX'),
    ]
}

def calendar_month_name(number):
    return calendar.month_name[number]

class Command(BaseCommand):
    help = 'Controlled, idempotent seeder for BMS.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting CONTROLLED seeding process...'))

        try:
            with transaction.atomic():
                # Verify DB is clean or print what exists
                current_cats = ExpenseCategory.objects.count()
                self.stdout.write(f"Current Category Count before run: {current_cats}")

                fiscal_years = self.seed_fiscal_years()
                departments = self.seed_departments()
                accounts = self.seed_accounts()
                
                categories = self.seed_categories(departments)
                self.stdout.write(f"Categories seeded map keys: {list(categories.keys())}")
                
                projects = self.seed_proposals_and_projects(departments, fiscal_years, accounts, categories)
                self.stdout.write(f"Projects created: {len(projects)}")
                
                allocations = self.seed_allocations(projects, categories, fiscal_years)
                self.stdout.write(f"Allocations created: {len(allocations)}")
                
                self.seed_expenses(allocations, fiscal_years)

                self.stdout.write(self.style.SUCCESS('Successfully seeded database with controlled data.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Seeding Failed: {str(e)}'))
            import traceback
            traceback.print_exc()

    def seed_fiscal_years(self):
        self.stdout.write("Seeding Fiscal Years...")
        fys = {}
        # Explicitly seed 2023, 2024, 2025
        for year in [2023, 2024, 2025]:
            name = f"FY {year}"
            is_active = (year == datetime.now().year)
            is_locked = (year < datetime.now().year)
            
            fy, _ = FiscalYear.objects.update_or_create(
                name=name,
                defaults={
                    'start_date': datetime(year, 1, 1).date(),
                    'end_date': datetime(year, 12, 31).date(),
                    'is_active': is_active,
                    'is_locked': is_locked
                }
            )
            fys[year] = fy
        return fys

    def seed_departments(self):
        self.stdout.write("Seeding Departments...")
        dept_map = {}
        for d in DEPARTMENTS_CONFIG:
            dept, _ = Department.objects.update_or_create(
                code=d['code'],
                defaults={'name': d['name'], 'is_active': True}
            )
            dept_map[d['code']] = dept
        return dept_map

    def seed_accounts(self):
        self.stdout.write("Seeding Accounts...")
        asset_type, _ = AccountType.objects.get_or_create(name='Asset')
        expense_type, _ = AccountType.objects.get_or_create(name='Expense')
        liability_type, _ = AccountType.objects.get_or_create(name='Liability') # NEW
        
        creator_id = 1
        creator_name = 'admin_auth'

        acc_map = {}
        
        # 1. Cash / Bank (Asset)
        acc_cash, _ = Account.objects.update_or_create(
            code='1010', 
            defaults={'name': 'Cash in Bank', 'account_type': asset_type, 'created_by_user_id': creator_id, 'created_by_username': creator_name}
        )
        acc_map['CASH'] = acc_cash

        # 2. Accounts Payable (Liability)
        acc_payable, _ = Account.objects.update_or_create(
            code='2010', 
            defaults={'name': 'Accounts Payable', 'account_type': liability_type, 'created_by_user_id': creator_id, 'created_by_username': creator_name}
        )
        acc_map['PAYABLE'] = acc_payable

        # 3. General Asset
        acc_asset, _ = Account.objects.update_or_create(
            code='1500', 
            defaults={'name': 'Property, Plant & Equipment', 'account_type': asset_type, 'created_by_user_id': creator_id, 'created_by_username': creator_name}
        )
        acc_map['ASSET'] = acc_asset

        # 4. General Expense
        acc_expense, _ = Account.objects.update_or_create(
            code='5000', 
            defaults={'name': 'General Expenses', 'account_type': expense_type, 'created_by_user_id': creator_id, 'created_by_username': creator_name}
        )
        acc_map['EXPENSE'] = acc_expense
        
        return acc_map

    def seed_categories(self, departments):
        self.stdout.write("Seeding Categories (The Tree)...")
        cat_map = {}

        # 1. Root Categories
        root_capex, _ = ExpenseCategory.objects.update_or_create(
            code='CAPEX', defaults={'name': 'Capital Expenditure', 'level': 1, 'classification': 'CAPEX'}
        )
        root_opex, _ = ExpenseCategory.objects.update_or_create(
            code='OPEX', defaults={'name': 'Operational Expenditure', 'level': 1, 'classification': 'OPEX'}
        )

        # 2. Sub-Categories
        for dept_code, items in CATEGORY_TREE.items():
            for item_name, classification in items:
                slug = item_name.upper().replace(' ', '-').replace('/', '-')[:15]
                code = f"{dept_code}-{slug}"
                parent = root_capex if classification == 'CAPEX' else root_opex
                
                cat, created = ExpenseCategory.objects.update_or_create(
                    code=code,
                    defaults={
                        'name': item_name,
                        'level': 2,
                        'parent_category': parent,
                        'classification': classification
                    }
                )
                if created:
                    print(f"  Created Category: {code}")
                
                if dept_code not in cat_map: cat_map[dept_code] = []
                cat_map[dept_code].append(cat)
        return cat_map

    def seed_proposals_and_projects(self, departments, fiscal_years, accounts, categories):
        self.stdout.write("Seeding Proposals and Projects...")
        projects = []
        
        # ENSURE 2023, 2024, 2025 are all processed
        for year in [2023, 2024, 2025]:
            fy = fiscal_years[year]
            for dept_code, dept_obj in departments.items():
                user = next((u for u in SIMULATED_USERS if u['dept'] == dept_code), SIMULATED_USERS[0])
                finance_head = SIMULATED_USERS[1]
                dept_cats = categories.get(dept_code, [])
                if not dept_cats: continue

                # Seed 5 proposals per department
                for i in range(1, 6):
                    cat = random.choice(dept_cats)
                    # Force more APPROVED status for historical years to ensure projects/allocations exist
                    if year < 2025:
                        status = 'APPROVED'
                    else:
                        status = random.choice(['APPROVED', 'APPROVED', 'SUBMITTED', 'REJECTED'])
                    
                    ticket_id = f"TKT-{dept_code}-{year}-{i:03d}"
                    amount = Decimal(str(random.randint(5000, 500000)))
                    # Set logical submission date: early January for that year
                    submission_date = datetime(year, 1, random.randint(5, 14), random.randint(8, 17), random.randint(0, 59))
                    
                    proposal, created = BudgetProposal.objects.update_or_create(
                        external_system_id=ticket_id,
                        defaults={
                            'title': f"{cat.name} Request {year} #{i}",
                            'department': dept_obj,
                            'fiscal_year': fy,
                            'project_summary': f"Request for {cat.name} to support operations.",
                            'project_description': f"Detailed description for {cat.name}. Validated by {user['full_name']}.",
                            'submitted_by_name': user['full_name'],
                            'status': status,
                            'performance_start_date': datetime(year, 1, 15).date(),
                            'performance_end_date': datetime(year, 12, 15).date(),
                            'sync_status': 'SYNCED',
                            'finance_operator_name': finance_head['full_name'] if status != 'SUBMITTED' else '',
                            'submitted_at': timezone.make_aware(submission_date),
                        }
                    )

                    if created or not proposal.items.exists():
                        BudgetProposalItem.objects.create(
                            proposal=proposal,
                            # MODIFICATION START: Populate the new Category field
                            category=cat, 
                            # MODIFICATION END
                            cost_element=cat.name,
                            description=f"Specific item for {cat.name}",
                            estimated_cost=amount,
                            account=accounts['ASSET'] if cat.classification == 'CAPEX' else accounts['EXPENSE']
                        )

                    if status == 'APPROVED':
                        proposal.approved_by_name = finance_head['full_name']
                        proposal.approval_date = datetime(year, 1, 20)
                        proposal.save()

                        project, _ = Project.objects.update_or_create(
                            budget_proposal=proposal,
                            defaults={
                                'name': proposal.title,
                                'description': proposal.project_description,
                                'start_date': proposal.performance_start_date,
                                'end_date': proposal.performance_end_date,
                                'department': dept_obj,
                                'status': 'IN_PROGRESS' if year == 2025 else 'COMPLETED',
                                'completion_percentage': random.randint(10, 90)
                            }
                        )
                        ProjectFiscalYear.objects.get_or_create(project=project, fiscal_year=fy)
                        projects.append(project)
                    elif status == 'REJECTED':
                        proposal.rejected_by_name = finance_head['full_name']
                        proposal.rejection_date = datetime(year, 1, 25)
                        proposal.save()
        return projects

    def seed_allocations(self, projects, categories, fiscal_years):
        self.stdout.write("Seeding Budget Allocations...")
        allocations = []
        finance_head = SIMULATED_USERS[1]

        for project in projects:
            item = project.budget_proposal.items.first()
            if not item: continue
            
            cat_name = item.cost_element
            category = None
            for dept_cats in categories.values():
                for c in dept_cats:
                    if c.name == cat_name:
                        category = c
                        break
                if category: break
            
            if not category: continue

            allocation, created = BudgetAllocation.objects.update_or_create(
                project=project,
                defaults={
                    'fiscal_year': project.budget_proposal.fiscal_year,
                    'department': project.department,
                    'category': category,
                    'account': item.account,
                    'proposal': project.budget_proposal,
                    'amount': item.estimated_cost,
                    'created_by_name': finance_head['full_name'],
                    'is_active': True,
                    'is_locked': False
                }
            )
            allocations.append(allocation)
        return allocations

    def seed_expenses(self, allocations, fiscal_years):
        self.stdout.write("Seeding Historical Expenses...")

        current_month = datetime.now().month
        current_year = datetime.now().year

        created_count = 0
        
        # Explicit counter to guarantee uniqueness
        global_txn_counter = 0

        for alloc in allocations:
            year = alloc.fiscal_year.start_date.year

            # Determine month range
            # For 2023 and 2024, go up to 12. For 2025, go to current month.
            end_month = 12 if year < current_year else current_month

            for month in range(1, end_month + 1):

                # REDUCED SKIP PROBABILITY: Ensure more data for 2023/2024
                # 0.3 means 30% chance to skip, 70% chance to create.
                skip_threshold = 0.3 
                if random.random() < skip_threshold:
                    continue

                # Use a fixed day to make the record deterministic
                day = random.randint(1, 28)
                expense_date = datetime(year, month, day).date()

                # Pick users
                user = next(
                    (u for u in SIMULATED_USERS if u['dept'] == alloc.department.code),
                    SIMULATED_USERS[0]
                )
                finance_head = SIMULATED_USERS[1]

                # Calculate a safe amount
                amount = alloc.amount * Decimal(str(random.uniform(0.01, 0.05)))

                # Ensure we don't overspend
                if alloc.get_remaining_budget() < amount:
                    continue

                global_txn_counter += 1
                # Format: TXN-YYYYMM-COUNTER (e.g., TXN-202301-00001)
                # Guaranteed unique across all years
                txn_id = f"TXN-{year}{month:02d}-{global_txn_counter:05d}"

                # Use update_or_create to avoid unique violations on re-runs
                Expense.objects.update_or_create(
                    transaction_id=txn_id,
                    defaults={
                        'project': alloc.project,
                        'budget_allocation': alloc,
                        'account': alloc.account,
                        'department': alloc.department,
                        'category': alloc.category,
                        'date': expense_date,
                        'amount': amount,
                        'description': f"Purchase for {alloc.project.name} - {calendar_month_name(month)}",
                        'vendor': random.choice(['Supplier A', 'Vendor B', 'Service Corp', 'Logistics Inc']),
                        'status': 'APPROVED',
                        'submitted_by_user_id': user['id'],
                        'submitted_by_username': user['username'],
                        'submitted_at': timezone.make_aware(datetime(year, month, day, 9, 0, 0)),
                        'approved_by_user_id': finance_head['id'],
                        'approved_by_username': finance_head['username'],
                        'approved_at': timezone.make_aware(datetime(year, month, day, 14, 0, 0)),
                        'is_accomplished': True
                    }
                )

                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Generated {created_count} expense records.")
        )