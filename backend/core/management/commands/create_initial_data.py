import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from core.models import (
    User, Department, AccountType, Account, FiscalYear
)


class Command(BaseCommand):
    help = 'Creates initial data for the application'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data initialization...'))

        # Create departments
        self.create_departments()
        
        # Create account types and chart of accounts
        self.create_account_structure()
        
        # Create fiscal years
        self.create_fiscal_years()
        
        # Create admin and test users
        self.create_users()
        
        self.stdout.write(self.style.SUCCESS('Data initialization completed successfully'))
    
    def create_departments(self):
        self.stdout.write('Creating departments...')
        departments = [
            {'name': 'Finance', 'code': 'FIN', 'description': 'Finance Department'},
            {'name': 'Marketing', 'code': 'MKT', 'description': 'Marketing Department'},
            {'name': 'Human Resources', 'code': 'HR', 'description': 'Human Resources Department'},
            {'name': 'Information Technology', 'code': 'IT', 'description': 'IT Department'},
            {'name': 'Operations', 'code': 'OPS', 'description': 'Operations Department'},
            {'name': 'Sales', 'code': 'SLS', 'description': 'Sales Department'},
        ]
        
        for dept_data in departments:
            Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'description': dept_data['description'],
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(departments)} departments'))
    
    def create_account_structure(self):
        self.stdout.write('Creating account types and chart of accounts...')
        
        # Create account types
        account_types = [
            {'name': 'Assets (Current)', 'description': 'Current assets that are expected to be liquidated within one year'},
            {'name': 'Assets (Non-current)', 'description': 'Long-term assets not expected to be converted to cash in the short term'},
            {'name': 'Liabilities (Current)', 'description': 'Short-term liabilities due within one year'},
            {'name': 'Liabilities (Non-current)', 'description': 'Long-term liabilities not due within one year'},
            {'name': 'Equity', 'description': 'Ownership interest in the company'},
            {'name': 'Revenue', 'description': 'Income from business operations'},
            {'name': 'Expenses', 'description': 'Costs incurred during business operations'},
        ]
        
        created_types = {}
        for type_data in account_types:
            acct_type, created = AccountType.objects.get_or_create(
                name=type_data['name'],
                defaults={'description': type_data['description']}
            )
            created_types[type_data['name']] = acct_type
        
        # Make sure we have a finance user for created_by field
        finance_dept = Department.objects.get(code='FIN')
        admin_user, _ = User.objects.get_or_create(
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
        if _:  # If created new user
            admin_user.set_password('admin123')
            admin_user.save()
        
        # Create some sample accounts
        expense_type = created_types['Expenses']
        asset_type = created_types['Assets (Current)']
        
        # Create parent accounts first
        operating_expense, _ = Account.objects.get_or_create(
            code='EXP-OPER',
            defaults={
                'name': 'Operating Expenses',
                'description': 'Day-to-day expenses for business operations',
                'account_type': expense_type,
                'created_by': admin_user,
            }
        )
        
        it_expense, _ = Account.objects.get_or_create(
            code='EXP-IT',
            defaults={
                'name': 'IT Expenses',
                'description': 'Technology related expenses',
                'account_type': expense_type,
                'parent_account': operating_expense,
                'created_by': admin_user,
            }
        )
        
        # Create child accounts
        accounts = [
            {
                'code': 'EXP-IT-HW',
                'name': 'Hardware Expenses',
                'description': 'Computer hardware purchases and maintenance',
                'account_type': expense_type,
                'parent_account': it_expense,
            },
            {
                'code': 'EXP-IT-SW',
                'name': 'Software Expenses',
                'description': 'Software licenses and services',
                'account_type': expense_type,
                'parent_account': it_expense,
            },
            {
                'code': 'EXP-TRV',
                'name': 'Travel Expenses',
                'description': 'Business travel related expenses',
                'account_type': expense_type,
                'parent_account': operating_expense,
            },
            {
                'code': 'CASH',
                'name': 'Cash',
                'description': 'Cash on hand and in bank accounts',
                'account_type': asset_type,
                'parent_account': None,
            },
        ]
        
        for acct_data in accounts:
            Account.objects.get_or_create(
                code=acct_data['code'],
                defaults={
                    'name': acct_data['name'],
                    'description': acct_data['description'],
                    'account_type': acct_data['account_type'],
                    'parent_account': acct_data['parent_account'],
                    'created_by': admin_user,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created account structure with {len(accounts) + 2} accounts'))
    
    def create_fiscal_years(self):
        self.stdout.write('Creating fiscal years...')
        
        current_year = timezone.now().year
        fiscal_years = [
            {
                'name': f'FY {current_year}',
                'start_date': datetime(current_year, 1, 1).date(),
                'end_date': datetime(current_year, 12, 31).date(),
                'is_active': True,
                'is_locked': False,
            },
            {
                'name': f'FY {current_year + 1}',
                'start_date': datetime(current_year + 1, 1, 1).date(),
                'end_date': datetime(current_year + 1, 12, 31).date(),
                'is_active': False,
                'is_locked': False,
            },
        ]
        
        for fy_data in fiscal_years:
            FiscalYear.objects.get_or_create(
                name=fy_data['name'],
                defaults={
                    'start_date': fy_data['start_date'],
                    'end_date': fy_data['end_date'],
                    'is_active': fy_data['is_active'],
                    'is_locked': fy_data['is_locked'],
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(fiscal_years)} fiscal years'))
    
    def create_users(self):
        self.stdout.write('Creating users...')
        
        finance_dept = Department.objects.get(code='FIN')
        it_dept = Department.objects.get(code='IT')
        
        # Create superuser if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                email='admin@example.com',
                username='admin',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='FINANCE_HEAD',
                department=finance_dept,
            )
        
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
                'role': 'FINANCE_OPERATOR',
                'department': it_dept,
            },
        ]
        
        for user_data in test_users:
            if not User.objects.filter(email=user_data['email']).exists():
                user = User.objects.create_user(
                    email=user_data['email'],
                    username=user_data['username'],
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    role=user_data['role'],
                    department=user_data['department'],
                    is_staff=user_data.get('is_staff', False),
                    phone_number=user_data.get('phone_number'),  
                )
        
        self.stdout.write(self.style.SUCCESS(f'Created test users'))