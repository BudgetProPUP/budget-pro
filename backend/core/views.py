from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from rest_framework import status, generics  # , permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny  # TODO Remove Later
from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, OpenApiParameter, inline_serializer
from core.pagination import StandardResultsSetPagination
from core.permissions import IsFinanceHead, IsAdmin
from .serializers_budget import LedgerViewSerializer
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited
from django.utils.decorators import method_decorator
# from django.utils import timezone
import logging
from .serializers import UserSerializer, LoginSerializer, LoginAttemptSerializer, ValidProjectAccountSerializer
from .models import BudgetAllocation, JournalEntryLine, LoginAttempt, UserActivityLog
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
User = get_user_model()

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def healthcheck_view(request):
    """Simple health check endpoint for Railway deployment"""
    try:
        logger.info("Health check endpoint accessed")
        return JsonResponse({
            "status": "ok",
            "message": "Service is healthy"
        }, status=200)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JsonResponse({
            "status": "error", 
            "message": str(e)
        }, status=500)


def ratelimit_handler(request, exception): # Not yet hooked up
    """Custom handler for rate limit exceeded"""
    return JsonResponse({
        'error': 'Rate limit exceeded. Please try again later.',
        'detail': 'Too many requests from your IP address.'
    }, status=429)

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class LoginView(APIView):
    permission_classes = [AllowAny]            # ← Allows unauthenticated
    authentication_classes = []                # ← Disable auth checks here
    @extend_schema(
        request=LoginSerializer,
        tags=['Authentication'],
        description='User login endpoint, authenticate users via email/phone and password.',
        responses={
            200: OpenApiResponse(
                description='Successful login response',
                response=inline_serializer(
                    name='SuccessfulLoginResponse',  
                    fields={
                        'refresh': serializers.CharField(),
                        'access': serializers.CharField(),
                        'user': UserSerializer()
                    }
                ),

            ),
            400: OpenApiResponse(
                response=inline_serializer(
                    name='LoginErrorResponse',
                    fields={
                        'error': serializers.DictField(
                            child=serializers.ListField(
                                child=serializers.CharField())
                        )
                    }
                ),

                description='Invalid credentials or validation error',
                examples=[
                    OpenApiExample(
                        'Invalid Credentials',
                        value={
                            "error": {
                                "non_field_errors": ["Invalid credentials"]
                            }
                        },
                        status_codes=['400']
                    ),
                    OpenApiExample(
                        'Missing Credentials',
                        value={
                            "error": {
                                "email": ["This field is required"],
                                "password": ["This field is required"]
                            }
                        },
                        status_codes=['400']
                    )
                ]
            ),
            429: OpenApiResponse(
                description='Rate limit exceeded',
                response=inline_serializer(
                    name='RateLimitResponse',
                    fields={
                        'error': serializers.CharField(),
                        'detail': serializers.CharField()
                    }
                )
            )
        },
        examples=[
            OpenApiExample(
                'Login Example',
                summary='Email login',
                description='Authenticate using email and password',
                value={
                    'email': 'user@example.com',
                    'password': 'password123'
                },
                request_only=True
            ),
            OpenApiExample(
                'Login Example with phone number',
                summary='Phone login',
                description='Authenticate using phone number and password',
                value={
                    'phone_number': '+1234567890',
                    'password': 'password'
                },
                request_only=True
            )
        ]
    )
    def post(self, request):

        # Get client info for logging
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        serializer = LoginSerializer(
            data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Create JWT tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

            # Log successful login attempt
            LoginAttempt.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                success=True
            )

            # Log user activity
            UserActivityLog.objects.create(
                user=user,
                log_type='LOGIN',
                action='User logged in',
                status='SUCCESS',
                details={
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'role': user.role,
                    'department': user.department.name if user.department else None
                }
            )

            return Response({
                'refresh': tokens['refresh'],
                'access': tokens['access'],
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK, headers={'X-Success': 'true'})
        else:
            # Try to find user by email for failed login attempt
            email = request.data.get('email', '')
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = None

            # Log failed login attempt
            LoginAttempt.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                success=False
            )

            # If there's a user, log their failed attempt
            if user:
                UserActivityLog.objects.create(
                    user=user,
                    log_type='LOGIN',
                    action='Failed login attempt',
                    status='FAILED',
                    details={
                        'ip_address': ip_address,
                        'user_agent': user_agent,
                        
                    }
                )

            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        required=True, help_text="Refresh token to blacklist")


class LogoutResponseSerializer(serializers.Serializer):
    success = serializers.CharField(help_text="Logout status message")


class LogoutErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Error message")


@method_decorator(ratelimit(key='user', rate='10/m', method='POST', block=True), name='post')
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        tags=['Authentication'],
        description='User logout endpoint, blacklists the refresh token.',
        responses={
            200: LogoutResponseSerializer,
            400: LogoutErrorSerializer,
            429: OpenApiResponse(
                description='Rate limit exceeded',
                response=inline_serializer(
                    name='LogoutRateLimitResponse',
                    fields={
                        'error': serializers.CharField(),
                        'detail': serializers.CharField()
                    }
                )
            )
        },
        examples=[
            OpenApiExample(
                'Logout Request Example',
                value={"refresh": "your_refresh_token_here"},
                request_only=True,
                status_codes=['200']
            ),
            OpenApiExample(
                'Logout Success Response',
                value={"success": "Logged out"},
                response_only=True,
                status_codes=['200']
            ),
            OpenApiExample(
                'Logout Error Response',
                value={"error": "Refresh token required"},
                response_only=True,
                status_codes=['400']
            )
        ]
    )
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


        # Log user activity
        UserActivityLog.objects.create(
            user=request.user,
            log_type='LOGIN',
            action='User logged out',
            status='SUCCESS',
            details={}
        )

        return Response({"success": "Logged out"}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        tags=['User Profile'],
        description='Retrieve authenticated user profile details',
        responses={
            200: UserSerializer,  # Directly reference the serializer
            401: inline_serializer(
                name='UnauthorizedError',
                fields={
                    'detail': serializers.CharField(),
                }
            ),
        },
        examples=[
            OpenApiExample(
                'Success Response',
                description='Response for authorized user',
                value={
                    "id": 1,
                    "email": "user@example.com",
                    "username": "user123",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "FINANCE_HEAD",
                    "department": {
                        "id": 1,
                        "name": "Finance",
                        "code": "FIN",
                        "description": "Finance Department"
                    },
                    "phone_number": "+1234567890",
                    "is_active": True,
                    "created_at": "2023-01-01T12:00:00Z",
                    "last_login": "2023-01-01T14:30:00Z"
                },
                response_only=True,
                status_codes=['200']
            ),
            OpenApiExample(
                'Unauthorized Example',
                description='Response for unauthorized access',
                value={
                    "detail": "Authentication credentials were not provided."
                },
                response_only=True,
                status_codes=['401']
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        # Log user activity
        UserActivityLog.objects.create(
            user=request.user,
            log_type='READ',
            action='User profile viewed',
            status='SUCCESS',
            details={}
        )

        return self.retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['User Profile'],
        description='Update authenticated user profile details',
        responses={
            200: UserSerializer,
            401: inline_serializer(
                name='UpdateUnauthorizedError',
                fields={
                    'detail': serializers.CharField(),
                }
            ),
        },
        examples=[
            OpenApiExample(
                'Update Success Response',
                description='Response after successful profile update',
                value={
                    "id": 1,
                    "email": "updated@example.com",
                    "username": "user123",
                    "first_name": "Updated",
                    "last_name": "User",
                    "role": "FINANCE_HEAD",
                    "department": {
                        "id": 1,
                        "name": "Finance",
                        "code": "FIN",
                        "description": "Finance Department"
                    },
                    "phone_number": "+9876543210",
                    "is_active": True,
                    "created_at": "2023-01-01T12:00:00Z",
                    "last_login": "2023-01-01T14:30:00Z"
                },
                response_only=True,
                status_codes=['200']
            ),
            OpenApiExample(
                'Update Unauthorized Example',
                description='Response for unauthorized access during update',
                value={
                    "detail": "Authentication credentials were not provided."
                },
                response_only=True,
                status_codes=['401']
            ),
        ]
    )
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)

        # Log user activity
        UserActivityLog.objects.create(
            user=request.user,
            log_type='UPDATE',
            action='User profile updated',
            status='SUCCESS',
            details={}
        )

        return response

    @extend_schema(
        tags=['User Profile'],
        description='Fully update user profile (all fields required).',
        request=UserSerializer,
        responses={
            200: UserSerializer,
            400: OpenApiResponse(
                description="Bad Request: Invalid data",
                response=inline_serializer(
                    name='ProfilePutValidationErrorResponse',  # Unique name
                    fields={'field_name': serializers.ListField(
                        child=serializers.CharField())}
                )
            )
        },
        examples=[
            OpenApiExample(
                'PUT Request Example',
                value={
                    "first_name": "Alice",
                    "last_name": "Smith",
                    "phone_number": "+1234567890",
                    "department_id": 2
                },
                request_only=True,
                status_codes=['200']
            )
        ]
    )
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @extend_schema(
        tags=['User Profile'],
        description='Partially update user profile (partial fields allowed).',
        request=UserSerializer,
        responses={
            200: UserSerializer,
            400: OpenApiResponse(
                description="Bad Request: Invalid data",
                response=inline_serializer(
                    name='ProfilePatchValidationErrorResponse',  # Unique name
                    fields={'field_name': serializers.ListField(
                        child=serializers.CharField())}
                )
            )
        },
        examples=[
            OpenApiExample(
                'PATCH Request Example',
                value={"phone_number": "+9876543210"},
                request_only=True,
                status_codes=['200']
            )
        ]
    )
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class LoginAttemptsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsFinanceHead | IsAdmin]
    serializer_class = LoginAttemptSerializer

    @extend_schema(
        tags=['Security'],
        operation_id='list_login_attempts',
        description='List all login attempts (visible only to Finance Heads).',
        responses={
            200: LoginAttemptSerializer(many=True),
            401: OpenApiResponse(
                description="Unauthorized: Authentication credentials were not provided",
                response=inline_serializer(
                    name='UnauthorizedResponse',
                    fields={'detail': serializers.CharField()}
                )
            ),
            403: OpenApiResponse(
                description="Forbidden: User lacks permission",
                response=inline_serializer(
                    name='ForbiddenResponse',
                    fields={'detail': serializers.CharField()}
                )
            )
        },
        examples=[
            OpenApiExample(
                'Success Example',
                value=[{
                    "id": 1,
                    "username": "user123",
                    "ip_address": "192.168.1.1",
                    "user_agent": "Mozilla/5.0",
                    "success": True,
                    "timestamp": "2023-01-01T12:00:00Z"
                }],
                response_only=True,
                status_codes=['200']
            ),
            OpenApiExample(
                'No Credentials Example',
                value=[{
                    "detail": "Authentication credentials were not provided."
                }],
                response_only=True,
                status_codes=['401']
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        # Only Finance Heads can see all login attempts
        user = self.request.user
        if user.role == 'FINANCE_HEAD':
            return LoginAttempt.objects.all().order_by('-timestamp')
        else:
            # Return an empty queryset instead of filtering by user
            # This will still return a 200 with empty list, so we need additional permission check
            return LoginAttempt.objects.none()


class CustomTokenRefreshView(TokenRefreshView):
    @extend_schema(
        tags=['Authentication'],
        description='Refresh an expired access token using a valid refresh token.',
        request=TokenRefreshSerializer,
        responses={
            200: OpenApiResponse(
                description="New access token",
                response=inline_serializer(
                    name='TokenRefreshResponse',
                    fields={'access': serializers.CharField()}
                )
            ),
            401: OpenApiResponse(
                description="Invalid or expired refresh token",
                response=inline_serializer(
                    name='TokenErrorResponse',
                    fields={'detail': serializers.CharField(
                    ), 'code': serializers.CharField()}
                )
            )
        },
        examples=[
            OpenApiExample(
                'Token Refresh Example',
                value={"refresh": "<your_refresh_token_here>"},
                request_only=True,
                status_codes=['200']
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ValidProjectAccountView(APIView):
    """
    API that returns valid projects and accounts with active budget allocations.
    """
    
    @extend_schema(
        tags=['Valid Projects and Accounts with Active Allocations'],
        summary="Get valid projects and accounts with active allocations",
        responses={200: ValidProjectAccountSerializer(many=True)},
    )
    def get(self, request):
        allocations = BudgetAllocation.objects.filter(is_active=True).select_related(
            'project', 'account', 'department', 'fiscal_year'
        )

        data = [
            {
                'project_id': a.project.id,
                'project_title': a.project.name,
                'account_id': a.account.id,
                'account_code': a.account.code,
                'account_title': a.account.name,
                'department_name': a.department.name,
                'fiscal_year_name': a.fiscal_year.name
            }
            for a in allocations
        ]

        return Response(data, status=status.HTTP_200_OK)