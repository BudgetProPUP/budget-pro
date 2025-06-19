from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url
import re

# Base directory for the auth_service
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / '.env')  # Load .env from auth_service folder

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Railway public domain
RAILWAY_PUBLIC_DOMAIN = os.getenv('RAILWAY_PUBLIC_DOMAIN')
if RAILWAY_PUBLIC_DOMAIN:
    # Remove http(s):// prefix if present
    clean_domain = re.sub(r'^https?://', '', RAILWAY_PUBLIC_DOMAIN)
    ALLOWED_HOSTS.append(clean_domain)

# For Railway internal networking and health checks
if os.getenv('RAILWAY_ENVIRONMENT'): # General check if running in a Railway environment
    ALLOWED_HOSTS.extend([
        'auth_service.railway.internal', # Your specific service's internal CNAME
        '.railway.internal',             # Wildcard for other internal Railway hosts
        '.railway.app',                  # Common TLD for Railway app URLs
        '.up.railway.app',               # Another common TLD pattern
    ])

# Remove duplicates and sort for consistency
ALLOWED_HOSTS = sorted(list(set(ALLOWED_HOSTS)))

print(f"DEBUG: Final ALLOWED_HOSTS in settings.py: {ALLOWED_HOSTS}")

# Railway static URL
RAILWAY_STATIC_URL = os.getenv('RAILWAY_STATIC_URL')
if RAILWAY_STATIC_URL:
    hostname = RAILWAY_STATIC_URL.replace('https://', '').replace('http://', '')
    ALLOWED_HOSTS.append(hostname)

# Railway's internal service domain pattern
import re
railway_service_url = os.getenv('RAILWAY_SERVICE_URL')
if railway_service_url:
    hostname = railway_service_url.replace('https://', '').replace('http://', '')
    ALLOWED_HOSTS.append(hostname)

# Allow Railway's internal domains (wildcard for Railway's internal networking)
if os.getenv('RAILWAY_ENVIRONMENT'):  # Check if running on Railway
    ALLOWED_HOSTS.extend([
        '.railway.app',  # All Railway subdomains
        '.up.railway.app',  # Railway's app domains
    ])

# For production, might need:
# ALLOWED_HOSTS.append('your-custom-domain.com')
    
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',
    'pwned_passwords_django',    # For pwned password validation

    'users', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Add 'DIRS': [os.path.join(BASE_DIR.parent, 'users', 'templates')] if you have templates in app
        'DIRS': [os.path.join(BASE_DIR.parent, 'users', 'templates')], # For password reset email template
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True  # Explicitly enable SSL for Railway
                              # dj_database_url will handle this for psycopg2
        )
    }
else:
    # Fallback to local .env settings for AUTH_DB_*
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('AUTH_DB_NAME'),
            'USER': os.getenv('AUTH_DB_USER'),
            'PASSWORD': os.getenv('AUTH_DB_PASSWORD'),
            'HOST': os.getenv('AUTH_DB_HOST', 'localhost'),
            'PORT': os.getenv('AUTH_DB_PORT', '5432'),
        }
    }

AUTH_USER_MODEL = 'users.User' # Points to User model in the 'users' app

AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailOrPhoneNumberBackend',
    'django.contrib.auth.backends.ModelBackend',
]


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'users.password_validators.CustomPasswordValidator', # Make sure path is correct
        'OPTIONS': {'min_length': 8, 'max_length': 64}
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'pwned_passwords_django.validators.PwnedPasswordsValidator'},
]

PASSWORD_HASHERS = [
    'users.hashers.CustomArgon2PasswordHasher', # Make sure path is correct
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - Add deployed frontend and budget_service URLs
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Local frontend
    os.getenv('FRONTEND_URL'), # Deployed frontend
    os.getenv('BUDGET_SERVICE_PUBLIC_URL') # Public URL of budget_service
]
CORS_ALLOWED_ORIGINS = [origin for origin in CORS_ALLOWED_ORIGINS if origin] 

CORS_ALLOW_ALL_ORIGINS = DEBUG # For development - restrict in production
CORS_ALLOW_CREDENTIALS = True


# Email Configuration (copied from monolith, uses .env)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
FRONTEND_URL = os.getenv('FRONTEND_URL') # Used by django-rest-passwordreset

# JWT Settings (copied from monolith)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=4),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False, # Important: last_login update is handled by LoginView logic
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY, # Uses the project's SECRET_KEY
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    # Add 'VERIFYING_KEY': None, if you switch to RS256 later
    # Add other claims you want in the token, e.g., role
    'CLAIMS_SERIALIZER': 'users.serializers.MyTokenObtainPairSerializer.get_token', # If you want to add custom claims to token
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [ 
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [ # Add JSONRenderer if not default
        'rest_framework.renderers.JSONRenderer',
        # 'rest_framework.renderers.BrowsableAPIRenderer', # Optional for dev
    ],
    # Add rate limiting if using django-ratelimit globally
    # 'DEFAULT_THROTTLE_CLASSES': [
    #     'rest_framework.throttling.AnonRateThrottle',
    #     'rest_framework.throttling.UserRateThrottle'
    # ],
    # 'DEFAULT_THROTTLE_RATES': {
    #     'anon': '100/day',
    #     'user': '1000/day'
    # }
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Auth Service API",
    "DESCRIPTION": "Authentication and User Management API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    'SWAGGER_UI_SETTINGS': {'defaultModelsExpandDepth': -1},
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/auth/', # Important: Prefix for auth service
}

# For django-ratelimit (if we use its decorators)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
RATELIMIT_USE_CACHE = 'default'


STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR.parent, 'staticfiles_auth')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# For UserActivityLog (if you decide to keep it simple in auth service for auth events)
# LOGGING configuration can be added here