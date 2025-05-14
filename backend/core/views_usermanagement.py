from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from .models import User, Department
from .serializers import UserTableSerializer, UserModalSerializer, DepartmentSerializer

@extend_schema_view(
    list=extend_schema(
        operation_id="list_users",
        summary="List all users",
        description="Returns a paginated list of users with basic information for displaying in the user management table. Supports searching and filtering by role and active status.",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search users by first name, last name, email, or username",
                required=False,
                type=OpenApiTypes.STR
            ),
            OpenApiParameter(
                name="role",
                description="Filter users by role (FINANCE_HEAD, FINANCE_OPERATOR)",
                required=False,
                type=OpenApiTypes.STR,
                enum=["FINANCE_HEAD", "FINANCE_OPERATOR"]
            ),
            OpenApiParameter(
                name="is_active",
                description="Filter users by active status (true/false)",
                required=False,
                type=OpenApiTypes.BOOL
            ),
        ],
        responses={
            200: UserTableSerializer(many=True),
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    ),
    create=extend_schema(
        operation_id="create_user",
        summary="Create a new user",
        description="Creates a new user with the provided information. A random secure password will be generated for the user.",
        request=UserModalSerializer,
        responses={
            201: UserModalSerializer,
            400: {"description": "Invalid data provided"},
            401: {"description": "Authentication credentials were not provided"}
        },
        examples=[
            OpenApiExample(
                "Valid User Creation",
                value={
                    "first_name": "John",
                    "last_name": "Doe",
                    "username": "johndoe",
                    "email": "john.doe@example.com",
                    "role": "FINANCE_OPERATOR",
                    "department_id": 1,
                    "is_active": True
                },
                request_only=True
            )
        ],
        tags=["User Management"]
    ),
    retrieve=extend_schema(
        operation_id="get_user",
        summary="Get user details",
        description="Returns detailed information about a specific user for display in the edit user modal.",
        responses={
            200: UserModalSerializer,
            404: {"description": "User not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    ),
    update=extend_schema(
        operation_id="update_user_full",
        summary="Update user (Full)",
        description="Updates all fields of a user. Requires all fields to be provided.",
        request=UserModalSerializer,
        responses={
            200: UserModalSerializer,
            400: {"description": "Invalid data provided"},
            404: {"description": "User not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    ),
    partial_update=extend_schema(
        operation_id="update_user_partial",
        summary="Update user (Partial)",
        description="Updates specific fields of a user. Only fields that need to be updated should be provided.",
        request=UserModalSerializer,
        responses={
            200: UserModalSerializer,
            400: {"description": "Invalid data provided"},
            404: {"description": "User not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        examples=[
            OpenApiExample(
                "Update User Role",
                value={
                    "role": "FINANCE_HEAD"
                },
                request_only=True
            ),
            OpenApiExample(
                "Update User Department",
                value={
                    "department_id": 2
                },
                request_only=True
            ),
            OpenApiExample(
                "Update User Status",
                value={
                    "is_active": False
                },
                request_only=True
            )
        ],
        tags=["User Management"]
    ),
    destroy=extend_schema(
        operation_id="delete_user",
        summary="Delete user",
        description="Permanently deletes a user. This action cannot be undone.",
        responses={
            204: {"description": "User successfully deleted"},
            404: {"description": "User not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    )
)
class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users in the system.
    Provides CRUD operations for user management.
    """
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all().order_by('first_name', 'last_name')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'username']
    
    def get_serializer_class(self):
        """
        Return different serializers based on the action.
        For list actions, return the table serializer.
        For create/retrieve/update actions, return the modal serializer.
        """
        if self.action == 'list':
            return UserTableSerializer
        return UserModalSerializer
    
    def list(self, request, *args, **kwargs):
        """
        List users with optional filtering and search.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Handle any additional filtering not covered by filter backends
        search = request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new user.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @extend_schema(
        operation_id="toggle_user_active",
        summary="Toggle user active status",
        description="Toggles the active status of a user (active to inactive or vice versa). Used by the activate/deactivate button in the UI.",
        responses={
            200: UserTableSerializer,
            404: {"description": "User not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    )
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """
        Toggle the is_active status of a user.
        This is a dedicated endpoint for the activate/deactivate button.
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        serializer = UserTableSerializer(user)
        return Response(serializer.data)
    
    @extend_schema(
        operation_id="get_user_roles",
        summary="Get user role options",
        description="Returns all available user roles for populating the role dropdown menu in the UI.",
        responses={
            200: {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "value": {"type": "string"},
                        "label": {"type": "string"}
                    }
                },
                "example": [
                    {"value": "FINANCE_HEAD", "label": "Finance Head"},
                    {"value": "FINANCE_OPERATOR", "label": "Finance Operator"}
                ]
            },
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["User Management"]
    )
    @action(detail=False, methods=['get'])
    def roles(self, request):
        """
        Return all available user roles.
        Useful for populating role dropdown in the UI.
        """
        roles = [{'value': code, 'label': label} for code, label in User.ROLE_CHOICES]
        return Response(roles)

@extend_schema_view(
    list=extend_schema(
        operation_id="list_departments",
        summary="List all departments",
        description="Returns a list of all active departments for populating the department dropdown menu in the user management UI.",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search departments by name or code",
                required=False,
                type=OpenApiTypes.STR
            )
        ],
        responses={
            200: DepartmentSerializer(many=True),
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["Departments"]
    ),
    retrieve=extend_schema(
        operation_id="get_department",
        summary="Get department details",
        description="Returns detailed information about a specific department.",
        responses={
            200: DepartmentSerializer,
            404: {"description": "Department not found"},
            401: {"description": "Authentication credentials were not provided"}
        },
        tags=["Departments"]
    )
)
class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for departments.
    Used to populate department dropdowns in user management.
    """
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.filter(is_active=True).order_by('name')
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']