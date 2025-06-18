# File: CapstoneBP/auth_service/users/management/commands/auth_seeder.py

from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone # For UserActivityLog if you add timestamps manually
import random

# Import models from the 'users' app within 'auth_service'
from users.models import UserActivityLog, LoginAttempt # Assuming User model is fetched by get_user_model()

User = get_user_model() # This will get your auth_service.users.User model

class Command(BaseCommand):
    help = 'Seed auth_service database with initial users and related auth data.'

    # Temporary department data for seeding users.
    # In a real microservice setup, Department data would come from another service
    # or be less structured here (just IDs and names).
    TEMP_DEPARTMENTS = [
        {'id': 1, 'name': 'Finance Department', 'code': 'FIN'},
        {'id': 2, 'name': 'Human Resources', 'code': 'HR'},
        {'id': 3, 'name': 'Information Technology', 'code': 'IT'},
        {'id': 4, 'name': 'Operations', 'code': 'OPS'},
        {'id': 5, 'name': 'Marketing', 'code': 'MKT'},
    ]

    def get_temp_department_by_code(self, code):
        for dept in self.TEMP_DEPARTMENTS:
            if dept['code'] == code:
                return dept
        return None # Should not happen if codes are correct

    @transaction.atomic # Ensure all operations are in a single transaction
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting auth_service database seeding...'))

        # 1. Create Users
        self.create_users()

        # 2. Create sample LoginAttempts
        self.create_login_attempts()

        # 3. Create sample UserActivityLogs (auth-specific)
        self.create_user_activity_logs()

        self.stdout.write(self.style.SUCCESS('Auth_service database seeding completed successfully!'))

    def create_users(self):
        self.stdout.write('Creating/verifying users...')

        finance_dept_info = self.get_temp_department_by_code('FIN')
        it_dept_info = self.get_temp_department_by_code('IT')
        # hr_dept_info = self.get_temp_department_by_code('HR')
        ops_dept_info = self.get_temp_department_by_code('OPS')
        mkt_dept_info = self.get_temp_department_by_code('MKT')

        users_data = [
            {
                'email': 'admin@example.com', 'username': 'admin_auth', # Ensure username is unique
                'password': 'adminpassword123', 'first_name': 'AuthAdmin', 'last_name': 'User',
                'role': 'ADMIN', # Use roles defined in auth_service.users.User
                'department_id': finance_dept_info['id'] if finance_dept_info else None,
                'department_name': finance_dept_info['name'] if finance_dept_info else None,
                'is_staff': True, 'is_superuser': True, 'phone_number': '09000000000'
            },
            {
                'email': 'finance_head@example.com', 'username': 'finance_head_auth',
                'password': 'password123', 'first_name': 'Finance', 'last_name': 'Head',
                'role': 'FINANCE_HEAD',
                'department_id': finance_dept_info['id'] if finance_dept_info else None,
                'department_name': finance_dept_info['name'] if finance_dept_info else None,
                'is_staff': True, 'phone_number': '09171234567'
            },
            {
                'email': 'it_user@example.com', 'username': 'it_user_auth',
                'password': 'password123', 'first_name': 'IT', 'last_name': 'Support',
                'role': 'ADMIN', # Or another role like 'USER' if you define it
                'department_id': it_dept_info['id'] if it_dept_info else None,
                'department_name': it_dept_info['name'] if it_dept_info else None,
                'phone_number': '09171234568'
            },
            {
                'email': 'ops_user@example.com', 'username': 'ops_user_auth',
                'password': 'password123', 'first_name': 'Operations', 'last_name': 'Staff',
                'role': 'FINANCE_HEAD', # Example, adjust as needed for auth roles
                'department_id': ops_dept_info['id'] if ops_dept_info else None,
                'department_name': ops_dept_info['name'] if ops_dept_info else None,
                'phone_number': '09171111111',
            },
            {
                'email': 'adibentulan@gmail.com',
                'username': 'adi123',
                'password': 'password123',
                'first_name': 'Eldrin',
                'last_name': 'Adi',
                'role': 'FINANCE_HEAD',
                'department_id': it_dept_info['id'] if it_dept_info else None,
                'department_name': it_dept_info['name'] if it_dept_info else None,
                'phone_number': '09179876542',
            },
            {
                'email': 'mkt_user@example.com', 'username': 'mkt_user_auth',
                'password': 'password123', 'first_name': 'Marketing', 'last_name': 'Specialist',
                'role': 'FINANCE_HEAD', # Example
                'department_id': mkt_dept_info['id'] if mkt_dept_info else None,
                'department_name': mkt_dept_info['name'] if mkt_dept_info else None,
                'phone_number': '09172222222',
            },
        ]

        created_count = 0
        for user_data in users_data:
            user, created = User.objects.update_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['username'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'department_id': user_data['department_id'],
                    'department_name': user_data['department_name'],
                    'is_staff': user_data.get('is_staff', False),
                    'is_superuser': user_data.get('is_superuser', False),
                    'is_active': True,
                    'phone_number': user_data.get('phone_number')
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                created_count += 1
                self.stdout.write(f"Created user: {user.email}")
            else:
                # Optionally update password if user exists but seeder has a new one
                # user.set_password(user_data['password'])
                # user.save()
                self.stdout.write(f"User already exists, updated: {user.email}")


        self.stdout.write(self.style.SUCCESS(f'Processed {len(users_data)} users ({created_count} created).'))
        return User.objects.all() # Return all users for other seeder functions

    def create_login_attempts(self):
        self.stdout.write('Creating sample login attempts...')
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.WARNING('No users found to create login attempts for.'))
            return

        attempts_data = []
        for i in range(20): # Create 20 attempts
            user = random.choice(users) if random.random() < 0.8 else None # 20% chance of attempt for non-existent user
            success = random.choices([True, False], weights=[0.7, 0.3], k=1)[0] # 70% success rate

            # If successful login for a known user, or any login for a non-existent user
            username_input_val = user.email if user and success else (user.email if user and not success and random.random() < 0.5 else f"test_user_fail{i}@example.com")


            attempts_data.append(LoginAttempt(
                user=user if success else (user if random.random() < 0.7 else None), # Link to user if successful or sometimes if failed for existing user
                username_input=username_input_val,
                ip_address=f"192.168.1.{random.randint(10, 200)}",
                user_agent=random.choice(["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "PostmanRuntime/7.29.0", "curl/7.68.0"]),
                success=success,
                timestamp=timezone.now() - timezone.timedelta(minutes=random.randint(1, 60*24*3)) # Within last 3 days
            ))
        LoginAttempt.objects.bulk_create(attempts_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(attempts_data)} login attempts.'))


    def create_user_activity_logs(self):
        self.stdout.write('Creating sample user activity logs (auth-specific)...')
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.WARNING('No users found to create activity logs for.'))
            return

        log_types_auth = [
            ('LOGIN', 'User logged in successfully.', 'SUCCESS'),
            ('LOGIN', 'Failed login attempt.', 'FAILED'),
            ('LOGOUT', 'User logged out.', 'SUCCESS'),
            ('PROFILE_UPDATE', 'User updated their profile.', 'SUCCESS'),
            ('PASSWORD_CHANGE', 'User changed their password.', 'SUCCESS'),
            ('PASSWORD_RESET_REQUEST', 'Password reset requested.', 'SUCCESS'), # or 'ATTEMPTED'
        ]
        logs_data = []
        for _ in range(50): # Create 50 auth-related logs
            user_for_log = random.choice(users)
            log_type, action_template, status = random.choice(log_types_auth)
            action_text = action_template # Could be made more dynamic if needed

            logs_data.append(UserActivityLog(
                user=user_for_log,
                log_type=log_type,
                action=action_text,
                status=status,
                details={'ip_address': f"192.168.0.{random.randint(1,100)}"} if 'login' in action_text.lower() else {},
                timestamp=timezone.now() - timezone.timedelta(hours=random.randint(1, 72)) # Within last 3 days
            ))
        UserActivityLog.objects.bulk_create(logs_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(logs_data)} user activity logs.'))