# File: CapstoneBP/auth_service/users/management/commands/auth_seeder.py
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta # Explicitly import timedelta
import random

# Import models from the 'users' app within 'auth_service'
from users.models import UserActivityLog, LoginAttempt # Assuming User model is fetched by get_user_model()

User = get_user_model() # This will get your auth_service.users.User model

# Configuration for Seeder
MAX_LOGIN_ATTEMPTS_TO_KEEP = 200  # Max old login attempts to retain before adding new ones
MAX_ACTIVITY_LOGS_TO_KEEP = 500   # Max old activity logs to retain

class Command(BaseCommand):
    help = 'Seed auth_service database with initial users and related auth data.'

    TEMP_DEPARTMENTS = [
        {'id': 1, 'name': 'Finance Department', 'code': 'FIN'},
        {'id': 2, 'name': 'Human Resources', 'code': 'HR'},
        {'id': 3, 'name': 'Information Technology', 'code': 'IT'},
        {'id': 4, 'name': 'Operations', 'code': 'OPS'},
        {'id': 5, 'name': 'Marketing', 'code': 'MKT'},
    ]

    def get_temp_department_info(self, code): # Renamed for clarity
        for dept in self.TEMP_DEPARTMENTS:
            if dept['code'] == code:
                return dept
        self.stdout.write(self.style.WARNING(f"Department code '{code}' not found in TEMP_DEPARTMENTS. User will have no department info."))
        return {'id': None, 'name': None} # Return a dict with None values to prevent KeyErrors

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting auth_service database seeding...'))

        self.create_users()
        self.prune_and_create_login_attempts()
        self.prune_and_create_user_activity_logs()

        self.stdout.write(self.style.SUCCESS('Auth_service database seeding completed successfully!'))

    def create_users(self):
        self.stdout.write('Creating/verifying users...')

        finance_dept = self.get_temp_department_info('FIN')
        it_dept = self.get_temp_department_info('IT')
        ops_dept = self.get_temp_department_info('OPS')
        mkt_dept = self.get_temp_department_info('MKT')
        hr_dept = self.get_temp_department_info('HR') # Added HR department retrieval

        users_data = [
            {
                'email': 'admin@example.com', 'username': 'admin_auth',
                'password': 'adminpassword123', 'first_name': 'AuthAdmin', 'last_name': 'User',
                'role': 'ADMIN',
                'department_id': finance_dept['id'], 'department_name': finance_dept['name'],
                'is_staff': True, 'is_superuser': True, 'phone_number': '+639000000000' # Standardized phone format
            },
            {
                'email': 'finance_head@example.com', 'username': 'finance_head_auth',
                'password': 'password123', 'first_name': 'Finance', 'last_name': 'Head',
                'role': 'FINANCE_HEAD',
                'department_id': finance_dept['id'], 'department_name': finance_dept['name'],
                'is_staff': True, 'phone_number': '+639171234567'
            },
            {
                'email': 'it_user@example.com', 'username': 'it_user_auth',
                'password': 'password123', 'first_name': 'IT', 'last_name': 'Support',
                'role': 'ADMIN', # Assuming IT support might have admin rights in auth service
                'department_id': it_dept['id'], 'department_name': it_dept['name'],
                'phone_number': '+639171234568'
            },
            {
                'email': 'ops_user@example.com', 'username': 'ops_user_auth',
                'password': 'password123', 'first_name': 'Operations', 'last_name': 'Staff',
                'role': 'USER', # More realistic role for general staff
                'department_id': ops_dept['id'], 'department_name': ops_dept['name'],
                'phone_number': '+639171111111',
            },
            {
                'email': 'adibentulan@gmail.com', 'username': 'adi123',
                'password': 'StrongPassword!123', 'first_name': 'Eldrin', 'last_name': 'Adi',
                'role': 'ADMIN', # Example, adjust role as needed
                'department_id': it_dept['id'], 'department_name': it_dept['name'],
                'phone_number': '+639179876542', # Ensure phone is unique if model enforces it
            },
            {
                'email': 'mkt_user@example.com', 'username': 'mkt_user_auth',
                'password': 'password123', 'first_name': 'Marketing', 'last_name': 'Specialist',
                'role': 'USER',
                'department_id': mkt_dept['id'], 'department_name': mkt_dept['name'],
                'phone_number': '+639172222222',
            },
            { # Added HR user example
                'email': 'hr_user@example.com', 'username': 'hr_user_auth',
                'password': 'password123', 'first_name': 'HR', 'last_name': 'Manager',
                'role': 'USER', # Or specific HR role if defined
                'department_id': hr_dept['id'], 'department_name': hr_dept['name'],
                'phone_number': '+639173333333',
            },
        ]

        created_count = 0
        updated_count = 0
        for user_data in users_data:
            try:
                user, created = User.objects.update_or_create(
                    email__iexact=user_data['email'].lower(), # Case-insensitive email lookup
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
                    user.set_password(user_data['password']) # Set password only for new users
                    user.save()
                    created_count += 1
                    self.stdout.write(f"Created user: {user.email}")
                else:
                    # Optional: Update existing user's details if needed, e.g., role or name.
                    # Be cautious about overriding passwords of existing users unless intended.
                    # For this seeder, we'll assume if user exists, password is managed elsewhere.
                    updated_count +=1
                    # self.stdout.write(f"User already exists, verified/updated: {user.email}") # Less verbose
            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f"Error creating/updating user {user_data.get('email', 'N/A')} (possibly due to unique username conflict '{user_data.get('username', 'N/A')}'): {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Unexpected error for user {user_data.get('email', 'N/A')}: {e}"))


        self.stdout.write(self.style.SUCCESS(f'Processed {len(users_data)} users ({created_count} created, {updated_count} existing/updated).'))

    def prune_and_create_login_attempts(self):
        self.stdout.write('Pruning old login attempts and creating new sample ones...')
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.WARNING('No users found to create login attempts for.'))
            return

        # Prune old attempts if count exceeds MAX_LOGIN_ATTEMPTS_TO_KEEP
        current_attempts_count = LoginAttempt.objects.count()
        if current_attempts_count > MAX_LOGIN_ATTEMPTS_TO_KEEP:
            ids_to_delete = LoginAttempt.objects.order_by('timestamp').values_list('id', flat=True)[:current_attempts_count - MAX_LOGIN_ATTEMPTS_TO_KEEP]
            LoginAttempt.objects.filter(id__in=list(ids_to_delete)).delete()
            self.stdout.write(self.style.WARNING(f'Pruned {len(ids_to_delete)} old login attempts.'))

        new_attempts_data = []
        for i in range(20): # Create 20 new attempts
            user = random.choice(users) if random.random() < 0.8 else None
            success = random.choices([True, False], weights=[0.7, 0.3], k=1)[0]
            username_input_val = user.email if user and success else (user.email if user and not success and random.random() < 0.5 else f"failed_user{i}@example.com")

            new_attempts_data.append(LoginAttempt(
                user=user if success else (user if random.random() < 0.7 else None),
                username_input=username_input_val,
                ip_address=f"192.168.1.{random.randint(10, 200)}",
                user_agent=random.choice(["Mozilla/5.0 (Windows NT 10.0)", "PostmanRuntime/7.30.0", "curl/7.74.0"]),
                success=success,
                timestamp=timezone.now() - timedelta(minutes=random.randint(1, 60*24*3)) # Within last 3 days
            ))
        LoginAttempt.objects.bulk_create(new_attempts_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(new_attempts_data)} new login attempts.'))

    def prune_and_create_user_activity_logs(self):
        self.stdout.write('Pruning old activity logs and creating new sample ones (auth-specific)...')
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.WARNING('No users found to create activity logs for.'))
            return

        # Prune old logs
        current_logs_count = UserActivityLog.objects.count()
        if current_logs_count > MAX_ACTIVITY_LOGS_TO_KEEP:
            ids_to_delete = UserActivityLog.objects.order_by('timestamp').values_list('id', flat=True)[:current_logs_count - MAX_ACTIVITY_LOGS_TO_KEEP]
            UserActivityLog.objects.filter(id__in=list(ids_to_delete)).delete()
            self.stdout.write(self.style.WARNING(f'Pruned {len(ids_to_delete)} old user activity logs.'))

        log_types_auth = [
            ('LOGIN', 'User logged in successfully.', 'SUCCESS'),
            ('LOGIN', 'Failed login attempt.', 'FAILED'),
            ('LOGOUT', 'User logged out.', 'SUCCESS'),
            ('PROFILE_UPDATE', 'User updated their profile.', 'SUCCESS'),
            ('PASSWORD_CHANGE', 'User changed their password.', 'SUCCESS'),
            ('PASSWORD_RESET_REQUEST', 'Password reset requested.', 'ATTEMPTED'),
            ('USER_CREATE_ADMIN', 'Admin created a new user.', 'SUCCESS'), # Example admin action
        ]
        new_logs_data = []
        for _ in range(30): # Create 30 new auth-related logs
            user_for_log = random.choice(users)
            log_type, action_template, status = random.choice(log_types_auth)
            
            # Make action text more specific
            if log_type == 'LOGIN' and status == 'FAILED':
                action_text = f"Failed login attempt for {user_for_log.username if random.random() > 0.3 else 'unknown_user'}."
            elif log_type == 'USER_CREATE_ADMIN':
                admin_user = next((u for u in users if u.role == 'ADMIN'), user_for_log) # Prefer admin if available
                created_user = random.choice(users)
                action_text = f"Admin {admin_user.username} created user {created_user.username}."
                user_for_log = admin_user # Log this action as performed by the admin
            else:
                action_text = action_template.replace("User", user_for_log.username)


            new_logs_data.append(UserActivityLog(
                user=user_for_log,
                log_type=log_type,
                action=action_text,
                status=status,
                details={'ip_address': f"10.0.{random.randint(1,5)}.{random.randint(1,254)}"} if 'login' in log_type.lower() else {'source': 'seeder'},
                timestamp=timezone.now() - timedelta(hours=random.randint(1, 72))
            ))
        UserActivityLog.objects.bulk_create(new_logs_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(new_logs_data)} new user activity logs.'))