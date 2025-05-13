from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers_password_reset import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer
from .models import UserActivityLog


class PasswordResetRequestView(APIView):
    """
    API endpoint for requesting a password reset
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Password Reset"],
        summary="Request password reset email",
        description="Sends a password reset email to the specified address if an account exists",
        request=PasswordResetRequestSerializer,
        responses={
            200: OpenApiResponse(
                description="Password reset email sent",
                response=inline_serializer(
                    name='PasswordResetRequestResponse',
                    fields={
                        'detail': serializers.CharField()
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Success Response',
                        value={'detail': 'Password reset email has been sent.'},
                        status_codes=['200']
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid input",
                response=inline_serializer(
                    name='PasswordResetRequestError',
                    fields={
                        'email': serializers.ListField(child=serializers.CharField())
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Email Error',
                        value={'email': ['This field is required.']},
                        status_codes=['400']
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Example Request',
                value={'email': 'user@example.com'},
                request_only=True
            )
        ]
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Return success regardless of whether the email exists
            # This prevents revealing which emails are associated with accounts
            return Response(
                {"detail": "Password reset email has been sent."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    API endpoint for confirming a password reset
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Password Reset"],
        summary="Confirm password reset",
        description="Confirms a password reset using the token and UID from the email link",
        request=inline_serializer(
            name='PasswordResetConfirmRequest',
            fields={
                'password': serializers.CharField(help_text="New password"),
                'token': serializers.CharField(help_text="Token from the reset link"),
                'uid': serializers.CharField(help_text="User ID encoded in the reset link")
            }
        ),
        responses={
            200: OpenApiResponse(
                description="Password reset successful",
                response=inline_serializer(
                    name='PasswordResetConfirmResponse',
                    fields={
                        'detail': serializers.CharField()
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Success Response',
                        value={'detail': 'Password has been reset successfully.'},
                        status_codes=['200']
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid input",
                response=inline_serializer(
                    name='PasswordResetConfirmError',
                    fields={
                        'password': serializers.ListField(child=serializers.CharField(), required=False),
                        'token': serializers.ListField(child=serializers.CharField(), required=False),
                        'uid': serializers.ListField(child=serializers.CharField(), required=False)
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Token Error',
                        value={'token': ['Invalid or expired token']},
                        status_codes=['400']
                    ),
                    OpenApiExample(
                        'UID Error',
                        value={'uid': ['Invalid user ID']},
                        status_codes=['400']
                    ),
                    OpenApiExample(
                        'Password Error',
                        value={'password': [
                            'Ensure this field has at least 8 characters.']},
                        status_codes=['400']
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Example Request',
                value={
                    'password': 'new_secure_password123',
                    'token': 'b13k8-a672de3f6a8c3f5e80d43542',
                    'uid': 'MQ'
                },
                request_only=True
            )
        ]
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Log the password reset
            UserActivityLog.objects.create(
                user=user,
                log_type='UPDATE',
                action='Password reset',
                status='SUCCESS',
                details={'method': 'reset',
                         'ip_address': self._get_client_ip(request)}
            )

            return Response(
                {"detail": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordChangeView(APIView):
    """
    API endpoint for authenticated users to change their password
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Password Reset"],
        summary="Change password (authenticated users)",
        description="Allows authenticated users to change their password by providing current and new password",
        request=inline_serializer(
            name='PasswordChangeRequest',
            fields={
                'current_password': serializers.CharField(help_text="Current password"),
                'new_password': serializers.CharField(help_text="New password (min 8 characters)")
            }
        ),
        responses={
            200: OpenApiResponse(
                description="Password changed successfully",
                response=inline_serializer(
                    name='PasswordChangeResponse',
                    fields={
                        'detail': serializers.CharField()
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Success Response',
                        value={'detail': 'Password changed successfully.'},
                        status_codes=['200']
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid input",
                response=inline_serializer(
                    name='PasswordChangeError',
                    fields={
                        'current_password': serializers.ListField(child=serializers.CharField(), required=False),
                        'new_password': serializers.ListField(child=serializers.CharField(), required=False)
                    }
                ),
                examples=[
                    OpenApiExample(
                        'Current Password Error',
                        value={'current_password': [
                            'Current password is incorrect']},
                        status_codes=['400']
                    ),
                    OpenApiExample(
                        'New Password Error',
                        value={'new_password': [
                            'Ensure this field has at least 8 characters.']},
                        status_codes=['400']
                    )
                ]
            ),
            401: OpenApiResponse(
                description="Unauthorized - Authentication required",
                examples=[
                    OpenApiExample(
                        'Unauthorized',
                        value={
                            'detail': 'Authentication credentials were not provided.'},
                        status_codes=['401']
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Example Request',
                value={
                    'current_password': 'current_password123',
                    'new_password': 'new_secure_password456'
                },
                request_only=True
            )
        ]
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()

            # Log the password change
            UserActivityLog.objects.create(
                user=user,
                log_type='UPDATE',
                action='Password change',
                status='SUCCESS',
                details={'method': 'change',
                         'ip_address': self._get_client_ip(request)}
            )

            return Response(
                {"detail": "Password changed successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
