# File: CapstoneBP/auth_service/users/authentication.py

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
import re
from django.core.exceptions import ValidationError

User = get_user_model()

class EmailOrPhoneNumberBackend(ModelBackend):
    """
    Custom authentication backend that allows login with either email or phone number.
    The primary identifier (email or phone) is expected to be passed as the 'username'
    parameter to this authenticate method by Django's auth framework.
    """
    def _is_valid_phone_format(self, phone_number_str):
        if not phone_number_str:
            return False
        # E.164 like format, e.g., +639123456789 (10 to 15 digits after +)
        pattern = r'^\+\d{10,15}$'
        return bool(re.match(pattern, phone_number_str))

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None: # Username (which is email_or_phone here) is required
            return None

        identifier = username # 'username' here is the email_or_phone from LoginSerializer
        user = None

        try:
            # Check if identifier looks like an email
            if '@' in identifier:
                try:
                    user = User.objects.get(email__iexact=identifier) # Case-insensitive email match
                except User.DoesNotExist:
                    pass # Try as phone if not found by email
            
            # If not found by email or doesn't look like an email, try as phone number
            if not user:
                if self._is_valid_phone_format(identifier):
                    try:
                        user = User.objects.get(phone_number=identifier)
                    except User.DoesNotExist:
                        return None # User not found by phone either
                else:
    
                    pass # Fall through, user is still None

            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist: # Should not be reached if using .get() with specific fields
            return None
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None