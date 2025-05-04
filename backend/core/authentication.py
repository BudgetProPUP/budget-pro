from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrPhoneNumberBackend(ModelBackend):
    """
    Custom authentication backend that allows login with either email or phone number
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Check if username is actually an email from login form
        email = kwargs.get('email') or username
        phone_number = kwargs.get('phone_number') or username
        
        if email is None and phone_number is None:
            return None
        
        try:
            # Try to find the user by email or phone number
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    # If not found by email, try with phone number
                    user = User.objects.get(phone_number=username)
            else:
                user = User.objects.get(phone_number=phone_number)
                
            if user.check_password(password):
                return user
            return None
        except User.DoesNotExist:
            # Run the default password hasher to mitigate timing attacks
            User().set_password(password)
            return None