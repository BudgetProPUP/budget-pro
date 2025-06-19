"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
print("DEBUG: wsgi.py - Top of file reached") # Add this line

from django.core.wsgi import get_wsgi_application

print("DEBUG: wsgi.py - About to set DJANGO_SETTINGS_MODULE") # Add this line
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
print(f"DEBUG: wsgi.py - DJANGO_SETTINGS_MODULE is set to: {os.environ.get('DJANGO_SETTINGS_MODULE')}") # Add this line

print("DEBUG: wsgi.py - About to call get_wsgi_application()") # Add this line
try:
    application = get_wsgi_application()
    print("DEBUG: wsgi.py - get_wsgi_application() called successfully") # Add this line
except Exception as e:
    print(f"DEBUG: wsgi.py - ERROR calling get_wsgi_application(): {str(e)}") # Add this line
    # Optionally, re-raise to see if Gunicorn logs it, or exit to make it obvious
    # import sys
    # sys.exit(1) # This will crash the worker explicitly if an error occurs here
    raise # Re-raise the exception

print("DEBUG: wsgi.py - WSGI application object created") # Add this line