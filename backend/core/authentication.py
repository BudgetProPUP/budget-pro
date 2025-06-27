# backend/core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth.models import AnonymousUser
from .auth_client import auth_client
import jwt
from django.conf import settings

class CustomUser:
    """Mock user object with auth service data"""
    def __init__(self, user_data):
        self.id = user_data.get('id')
        self.email = user_data.get('email')
        self.username = user_data.get('username') # ADDED: Good practice to have username
        self.first_name = user_data.get('first_name', '')
        self.last_name = user_data.get('last_name', '')
        self.is_active = user_data.get('is_active', True)
        self.is_staff = user_data.get('is_staff', False)
        self.is_superuser = user_data.get('is_superuser', False)
        self.role = user_data.get('role', 'Finance')
        
        # --- THIS IS THE CRITICAL FIX ---
        # Correctly map the department info from the auth_service payload
        self.department_id = user_data.get('department_id')
        self.department_name = user_data.get('department_name')
        # REMOVED: self.department = user_data.get('department', '')
    
    @property
    def is_authenticated(self): # MODIFIED: Changed to a property for better compatibility
        return True
    
    def __str__(self):
        return self.email

class MicroserviceJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that validates users via auth service"""
    
    def get_user(self, validated_token):
        """Get user from auth service instead of local database"""
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken('Token does not contain user_id')
            
            # Get user from auth service
            user_data = auth_client.get_user_info(user_id)
            if not user_data:
                raise InvalidToken('User not found in auth service')
            
            return CustomUser(user_data)
            
        except Exception as e:
            raise InvalidToken(f'Invalid user: {str(e)}')