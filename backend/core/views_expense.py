from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.models import BudgetAllocation, Department, Expense, ExpenseCategory, FiscalYear
from .serializers_expense import BudgetAllocationCreateSerializer, ExpenseCategoryDropdownSerializer, ExpenseCreateSerializer, ExpenseHistorySerializer, ExpenseTrackingSerializer, ExpenseTrackingSummarySerializer
from core.pagination import FiveResultsSetPagination, StandardResultsSetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.db.models.functions import Coalesce

def get_date_range_from_filter(filter_value):
    today = timezone.now().date()
    if filter_value == 'this_month':
        return today.replace(day=1), today
    elif filter_value == 'last_month':
        first = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        last = first.replace(day=28) + timedelta(days=4)
        return first, last.replace(day=1) - timedelta(days=1)
    elif filter_value == 'last_3_months':
        return today - timedelta(days=90), today
    elif filter_value == 'this_year':
        return today.replace(month=1, day=1), today
    return None, None  # 'all_time'


class ExpenseHistoryView(generics.ListAPIView):
    serializer_class = ExpenseHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['description', 'vendor']
    filterset_fields = ['category__code']

    def get_queryset(self):
        user = self.request.user # This is CustomUser or TokenUser
        
        # User must have department_id from JWT to filter by department
        if not hasattr(user, 'department_id') or user.department_id is None:
            # Handle case where user might not have a department_id (e.g., superadmin not tied to a dept)
            # Option 1: Return no expenses
            # return Expense.objects.none()
            # Option 2: Return all approved expenses (if admin/finance head role allows)
            if hasattr(user, 'role') and user.role in ['ADMIN', 'FINANCE_HEAD']:
                 return Expense.objects.filter(status='APPROVED').order_by('-date')
            return Expense.objects.none() # Default to no expenses if no department and not privileged

        try:
            # Fetch the actual Department object using the department_id from the user (JWT)
            user_department = Department.objects.get(id=user.department_id)
            return Expense.objects.filter(
                department=user_department, # Filter by the Department instance
                status='APPROVED'
            ).order_by('-date')
        except Department.DoesNotExist:
            # Log this? Department ID in JWT doesn't match any local Department.
            return Expense.objects.none() # Or handle as an error

    @extend_schema(
        tags=['Expense History Page'],
        summary="Get expense history",
        description="Returns a paginated list of approved expenses filtered by category or search query.",
        parameters=[
            OpenApiParameter(name="search", location=OpenApiParameter.QUERY,
                             description="Search by description or vendor", required=False, type=str),
            OpenApiParameter(name="category__code", location=OpenApiParameter.QUERY,
                             description="Filter by expense category code", required=False, type=str),
            OpenApiParameter(name="page", location=OpenApiParameter.QUERY,
                             description="Page number", required=False, type=int),
        ],
        responses={200: ExpenseHistorySerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ExpenseTrackingView(generics.ListAPIView):
    serializer_class = ExpenseTrackingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FiveResultsSetPagination
    filter_backends = [filters.SearchFilter]
    
    # MODIFIED: Expanded the search fields to include reference number and type
    search_fields = [
        'description', 
        'vendor', 
        'transaction_id',  # For "REF NO." column
        'account__account_type__name' # For "TYPE" column
    ]

    def get_queryset(self):
        user = self.request.user # This is CustomUser or TokenUser
        
        if not hasattr(user, 'department_id') or user.department_id is None:
            if hasattr(user, 'role') and user.role in ['ADMIN', 'FINANCE_HEAD']:
                queryset = Expense.objects.all() # Admin/Finance Head sees all initially
            else:
                return Expense.objects.none()
        else:
            try:
                user_department = Department.objects.get(id=user.department_id)
                queryset = Expense.objects.filter(department=user_department)
            except Department.DoesNotExist:
                return Expense.objects.none()

        category_code = self.request.query_params.get('category__code')
        if category_code:
            queryset = queryset.filter(category__code=category_code)

        date_filter = self.request.query_params.get('date_filter')
        start_date, end_date = get_date_range_from_filter(date_filter)
        if start_date and end_date:
            queryset = queryset.filter(date__range=(start_date, end_date))

        return queryset.order_by('-date')

    @extend_schema(
        tags=['Expense Tracking Page'],
        summary="Get expense tracking data",
        description="Paginated list of expenses with filters for category and date range. The search parameter now looks in the 'REF NO.', 'TYPE', 'DESCRIPTION', and vendor fields.", # MODIFIED: Updated description
        parameters=[
            OpenApiParameter(
                name="search", description="Search by Ref No, Type, Description, or Vendor", required=False, type=str), # MODIFIED: Updated description
            OpenApiParameter(
                name="category__code", description="Filter by category code", required=False, type=str),
            OpenApiParameter(
                name="date_filter", description="Time range: this_month, last_month, last_3_months, this_year, all_time", required=False, type=str),
        ],
        responses={200: ExpenseTrackingSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(
    tags=['Expense Tracking Page'],
    summary="Get summary data for expense tracking cards",
    description="Returns the remaining budget and total expenses for the current month for the user's department.",
    responses={200: ExpenseTrackingSummarySerializer}
)
class ExpenseTrackingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'department_id'):
            return Response({"error": "User has no associated department."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            department = Department.objects.get(id=user.department_id)
        except Department.DoesNotExist:
            return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        active_fiscal_year = FiscalYear.objects.filter(start_date__lte=today, end_date__gte=today, is_active=True).first()
        if not active_fiscal_year:
            return Response({"error": "No active fiscal year found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Calculate Budget Remaining for the department
        total_budget = BudgetAllocation.objects.filter(
            department=department, fiscal_year=active_fiscal_year, is_active=True
        ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.0')))['total']
        
        total_spent = Expense.objects.filter(
            department=department, budget_allocation__fiscal_year=active_fiscal_year, status='APPROVED'
        ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.0')))['total']

        budget_remaining = total_budget - total_spent

        # 2. Calculate Total Expenses This Month for the department
        total_expenses_this_month = Expense.objects.filter(
            department=department,
            status='APPROVED',
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.0')))['total']

        data = {
            'budget_remaining': budget_remaining,
            'total_expenses_this_month': total_expenses_this_month
        }
        serializer = ExpenseTrackingSummarySerializer(data)
        return Response(serializer.data)


@extend_schema(
    tags=['Expense Tracking Page'],
    summary="Add a new budget allocation (Add Budget Modal)",
    description="Creates a new budget allocation for a specific project.",
    request=BudgetAllocationCreateSerializer,
    responses={201: BudgetAllocationCreateSerializer}
)
class BudgetAllocationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetAllocationCreateSerializer

    def perform_create(self, serializer):
        # The serializer's create method handles the logic
        serializer.save(context={'request': self.request})
class ExpenseCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Expense Tracking Page'],
        request=ExpenseCreateSerializer,
        summary="Submit a new expense request",
        description="Submit an expense tied to a project and account with optional pdf/image. The system validates budget availability. Valid Category Codes: # Level 1 (parent): 'OPS', 'CAP', 'HRM'. # Level 2 (Child): 'OPS-UTIL', 'OPS-RENT', 'OPS-SUP', 'CAP-IT', 'CAP-FAC', 'HRM-SAL', 'HRM-BEN', 'HRM-TRN'. # Level 3 (Grandchild): 'HRM-TRN-INT', 'HRM-TRN-EXT', 'CAP-IT-HW', 'CAP-IT-SW'",
        examples=[
            OpenApiExample(
                name="Add Expense",
                value={
                    "project_id": 1,
                    "account_code": "5100",
                    "category_code": "CAP-IT-HW",
                    "amount": "120000.00",
                    "date": "2025-05-21",
                    "description": "Phase 1 carpet installation",
                    "vendor": "Vendor A"
                },
                request_only=True
            )
        ],
        responses={201: serializers.SerializerMethodField()}
    )
    def post(self, request):
        serializer = ExpenseCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            expense = serializer.save()
            return Response({'success': 'Expense submitted', 'id': expense.id}, status=201)
        return Response(serializer.errors, status=400)
@extend_schema(
    tags=['Expense Category Dropdowns'],
    summary="List Expense Categories",
    description="Returns all active expense categories for dropdown selection.",
    responses={200: ExpenseCategoryDropdownSerializer(many=True)}
)
class ExpenseCategoryDropdownView(generics.ListAPIView):
    serializer_class = ExpenseCategoryDropdownSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ExpenseCategory.objects.filter(is_active=True).order_by('code')

    @extend_schema(parameters=[])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)