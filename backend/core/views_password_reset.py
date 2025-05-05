from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers_password_reset import (
    PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer
)
from .models import UserActivityLog


class PasswordResetRequestView(APIView):
    """
    API endpoint for requesting a password reset
    """
    permission_classes = [AllowAny]
    
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
                details={'method': 'reset', 'ip_address': self._get_client_ip(request)}
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
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            
            # Log the password change
            UserActivityLog.objects.create(
                user=user,
                log_type='UPDATE',
                action='Password change',
                status='SUCCESS',
                details={'method': 'change', 'ip_address': self._get_client_ip(request)}
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