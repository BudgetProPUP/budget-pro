from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from rest_framework import generics, filters, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from core.permissions import IsBMSFinanceHead, IsBMSUser, IsTrustedService
from core.models import BudgetAllocation, Department, Expense, ExpenseCategory, FiscalYear
from .serializers_expense import BudgetAllocationCreateSerializer, ExpenseCategoryDropdownSerializer, ExpenseCreateSerializer, ExpenseDetailForModalSerializer, ExpenseDetailSerializer, ExpenseHistorySerializer, ExpenseReviewSerializer, ExpenseTrackingSerializer, ExpenseTrackingSummarySerializer, ExpenseMessageSerializer
from core.pagination import FiveResultsSetPagination, StandardResultsSetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics, filters, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum, Q
from django.db.models.functions import Coalesce
from core.service_authentication import APIKeyAuthentication

#ExpenseTrackingView, ExpenseCreateView, and ExpenseDetailView classes consolidated to ExpenseViewSet
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
    permission_classes = [IsBMSUser]
    pagination_class = FiveResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    # MODIFICATION START: Add category__name and date to the search fields
    search_fields = ['description', 'vendor', 'category__name']
    # MODIFICATION END
    filterset_fields = ['category__code']

    def get_queryset(self):
        user = self.request.user
        base_queryset = Expense.objects.filter(status='APPROVED')

        user_roles = getattr(user, 'roles', {})
        bms_role = user_roles.get('bms')

        if bms_role == 'ADMIN':
            queryset = base_queryset
        else:
            department_id = getattr(user, 'department_id', None)
            if department_id:
                queryset = base_queryset.filter(department_id=department_id)
            else:
                queryset = Expense.objects.none()

        # MODIFICATION START: Add custom search logic for dates
        search_term = self.request.query_params.get('search', None)
        if search_term:
            # Check if the search term can be parsed as a date
            try:
                # Attempt to parse the date in YYYY-MM-DD format
                search_date = datetime.strptime(search_term, '%Y-%m-%d').date()
                # If it's a date, filter the date field exactly
                queryset = queryset.filter(date=search_date)
            except ValueError:
                # If it's not a date, proceed with the regular text search on other fields
                pass  # The SearchFilter will handle this
        # MODIFICATION END

        return queryset.order_by('-date')

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


# class ExpenseTrackingView(generics.ListAPIView):
#     serializer_class = ExpenseTrackingSerializer
#     # --- MODIFICATION START ---
#     permission_classes = [IsBMSUser]
#     # --- MODIFICATION END ---
#     pagination_class = FiveResultsSetPagination
#     filter_backends = [filters.SearchFilter]

#     # MODIFIED: Expanded the search fields to include reference number and type
#     search_fields = [
#         'description',
#         'vendor',
#         'transaction_id',  # For "REF NO." column
#         'account__account_type__name',  # For "TYPE" column
#         'status',  # For "STATUS" column
#         'date',  # MODIFICATION: Added date field for exact string matching
#     ]

#     def get_queryset(self):
#         # --- MODIFICATION START ---
#         # Replaced old logic with new role-based data isolation.
#         user = self.request.user
#         # Tracking view shows all statuses, so we start with all expenses.
#         base_queryset = Expense.objects.all()

#         user_roles = getattr(user, 'roles', {})
#         bms_role = user_roles.get('bms')

#         if bms_role == 'ADMIN':
#             # Admins see all expenses from all departments.
#             queryset = base_queryset
#         else:  # For any other valid BMS user (e.g., FINANCE_HEAD)
#             # Users are restricted to their department's expenses.
#             department_id = getattr(user, 'department_id', None)
#             if department_id:
#                 queryset = base_queryset.filter(department_id=department_id)
#             else:
#                 # If a user has no department, they see nothing.
#                 queryset = Expense.objects.none()

#         # --- APPLY UI FILTERS ---
#         category_code = self.request.query_params.get('category__code')
#         if category_code:
#             queryset = queryset.filter(category__code=category_code)
            
#         department_filter_id = self.request.query_params.get('department')
#         if department_filter_id:
#             queryset = queryset.filter(department_id=department_filter_id)

#         date_filter = self.request.query_params.get('date_filter')
#         start_date, end_date = get_date_range_from_filter(date_filter)
#         if start_date and end_date:
#             queryset = queryset.filter(date__range=(start_date, end_date))

#         return queryset.order_by('-date')

#     @extend_schema(
#         tags=['Expense Tracking Page'],
#         summary="Get expense tracking data",
#         description="Paginated list of expenses with filters for category and date range. The search parameter now looks in the 'REF NO.', 'TYPE', 'DESCRIPTION', and vendor fields.",  # MODIFIED: Updated description
#         parameters=[
#             OpenApiParameter(
#                 # MODIFIED: Updated description
#                 name="search", description="Search by Ref No, Type, Description, or Vendor", required=False, type=str),
#             OpenApiParameter(
#                 name="category__code", description="Filter by category code", required=False, type=str),
#             OpenApiParameter(
#                 name="department", description="Filter by department ID", required=False, type=int),
#             OpenApiParameter(
#                 name="date_filter", description="Time range: this_month, last_month, last_3_months, this_year, all_time", required=False, type=str),
#         ],
#         responses={200: ExpenseTrackingSerializer(many=True)}
#     )
#     def get(self, request, *args, **kwargs):
#         return super().get(request, *args, **kwargs)
    
# MODIFICATION START: The ExpenseViewSet replaces the individual views below.
class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Expense operations in the UI.
    Covers listing (Expense Tracking), creating (Submit Expense),
    and marking expenses as accomplished.
    """
    permission_classes = [IsBMSUser]
    pagination_class = FiveResultsSetPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        'description', 'vendor', 'transaction_id', 
        'account__account_type__name', 'status', 'date'
    ]
    # MODIFICATION START: Add category__classification to filterset_fields
    filterset_fields = ['category__code', 'department', 'category__classification']
    # MODIFICATION END
    # Needed for file uploads in the 'create' action
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        base_queryset = Expense.objects.all()
        user_roles = getattr(user, 'roles', {})
        bms_role = user_roles.get('bms')

        if bms_role == 'ADMIN':
            queryset = base_queryset
        else:
            department_id = getattr(user, 'department_id', None)
            if department_id:
                queryset = base_queryset.filter(department_id=department_id)
            else:
                queryset = Expense.objects.none()

        return queryset.order_by('-date')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseTrackingSerializer
        if self.action == 'create':
            return ExpenseCreateSerializer
        # For retrieve, update, etc.
        return ExpenseDetailSerializer

    @extend_schema(
        tags=['Expense Tracking Page'],
        summary="List expenses for tracking",
        description="Paginated list of expenses with filters for category, department, and date range. The search parameter looks in the 'REF NO.', 'TYPE', 'DESCRIPTION', and vendor fields.",
        parameters=[
            OpenApiParameter(name="search", description="Search by Ref No, Type, Description, or Vendor", required=False, type=str),
            OpenApiParameter(name="category__code", description="Filter by category code", required=False, type=str),
            OpenApiParameter(name="department", description="Filter by department ID", required=False, type=int),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Expense Tracking Page'],
        summary="Submit a new expense request",
        description="Submit an expense with one or more attachments (e.g., receipts, invoices). The system validates against available, unlocked budget allocations for the project.",
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        expense = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response({'success': 'Expense submitted', 'id': expense.id}, status=status.HTTP_201_CREATED, headers=headers)

    # MODIFICATION START: Add review action for approving/rejecting expenses
    @extend_schema(
        tags=['Expense Tracking Page Actions'],
        summary="Review an expense (Finance Manager)",
        description="Allows a Finance Manager to approve or reject a submitted expense.",
        request=ExpenseReviewSerializer,
        responses={
            200: ExpenseDetailSerializer,
            400: OpenApiResponse(description="Invalid request (e.g., expense not in 'SUBMITTED' state)."),
            403: OpenApiResponse(description="Permission denied.")
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[IsBMSFinanceHead])
    def review(self, request, pk=None):
        expense = self.get_object()

        # Ensure the expense is in a reviewable state
        if expense.status != 'SUBMITTED':
            return Response(
                {"error": f"This expense is already in '{expense.status}' status and cannot be reviewed again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ExpenseReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes')
        reviewer = request.user

        with transaction.atomic():
            expense.status = new_status
            if notes:
                # Prepend the review notes to any existing notes
                expense.notes = f"Review Note ({reviewer.username} on {timezone.now().strftime('%Y-%m-%d')}): {notes}\n---\n{expense.notes or ''}"

            if new_status == 'APPROVED':
                expense.approved_by_user_id = reviewer.id
                expense.approved_by_username = reviewer.username
                expense.approved_at = timezone.now()

            # The post_save signal will handle Journal Entry creation upon this save
            expense.save()

        # Return the full, updated expense details
        response_serializer = ExpenseDetailSerializer(expense, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    # MODIFICATION END

    @extend_schema(
        tags=['Expense Tracking Page Actions'],
        summary="Mark an expense as accomplished (Finance Manager)",
        description="Allows a Finance Manager to verify a manual expense entry. Sets the 'is_accomplished' flag to true.",
        request=None,
        responses={
            200: ExpenseTrackingSerializer,
            403: OpenApiResponse(description="You do not have permission to perform this action."),
            400: OpenApiResponse(description="Expense cannot be marked as accomplished (e.g., not approved yet).")
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[IsBMSFinanceHead])
    def mark_as_accomplished(self, request, pk=None):
        expense = self.get_object()

        if expense.status != 'APPROVED':
            return Response(
                {"error": "Only approved expenses can be marked as accomplished."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if expense.is_accomplished:
            return Response(
                {"message": "Expense is already marked as accomplished."},
                status=status.HTTP_200_OK
            )

        expense.is_accomplished = True
        expense.save(update_fields=['is_accomplished'])

        serializer = ExpenseTrackingSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(
    tags=['Expense Tracking Page'],
    summary="Get summary data for expense tracking cards",
    description="Returns the remaining budget and total expenses for the current month for the user's department.",
    responses={200: ExpenseTrackingSummarySerializer}
)
class ExpenseTrackingSummaryView(APIView):
    permission_classes = [IsBMSUser]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'department_id'):
            return Response({"error": "User has no associated department."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department = Department.objects.get(id=user.department_id)
        except Department.DoesNotExist:
            return Response({"error": "Department not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        active_fiscal_year = FiscalYear.objects.filter(
            start_date__lte=today, end_date__gte=today, is_active=True).first()
        if not active_fiscal_year:
            return Response({"error": "No active fiscal year found."}, status=status.HTTP_404_NOT_FOUND)

        # NOTE: The summary calculations (budget remaining, expenses this month) are based on 'APPROVED'
        # expenses only. Newly submitted expenses will not affect these totals until they are approved.

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


# class ExpenseCreateView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]  
#     @extend_schema(
#         tags=['Expense Tracking Page'],
#         request=ExpenseCreateSerializer,
#         summary="Submit a new expense request",
#         description="Submit an expense tied to a project and account with optional pdf/image. The system validates budget availability. Valid Category Codes: # Level 1 (parent): 'OPS', 'CAP', 'HRM'. # Level 2 (Child): 'OPS-UTIL', 'OPS-RENT', 'OPS-SUP', 'CAP-IT', 'CAP-FAC', 'HRM-SAL', 'HRM-BEN', 'HRM-TRN'. # Level 3 (Grandchild): 'HRM-TRN-INT', 'HRM-TRN-EXT', 'CAP-IT-HW', 'CAP-IT-SW'",
#         examples=[
#             OpenApiExample(
#                 name="Add Expense",
#                 value={
#                     "project_id": 1,
#                     "account_code": "5100",
#                     "category_code": "CAP-IT-HW",
#                     "amount": "120000.00",
#                     "date": "2025-05-21",
#                     "description": "Phase 1 carpet installation",
#                     "vendor": "Vendor A"
#                 },
#                 request_only=True
#             )
#         ],
#         responses={201: serializers.SerializerMethodField()}
#     )
#     def post(self, request):
#         # DRF merges request.POST and request.FILES into request.data when using MultiPartParser
#         serializer = ExpenseCreateSerializer(
#             data=request.data, context={'request': request})
#         if serializer.is_valid():
#             expense = serializer.save()
#             return Response({'success': 'Expense submitted', 'id': expense.id}, status=201)
#         return Response(serializer.errors, status=400)

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


# @extend_schema(
#     tags=['Expense History Page'],
#     # MODIFIED: Updated summary and description for clarity
#     summary="Get the parent proposal ID for a single expense",
#     description="Returns the project and budget_proposal ID for a given expense ID. This is used by the frontend to fetch the full proposal details for the 'View' modal.",
#     # MODIFIED: Response schema is now correct
#     responses={200: ExpenseDetailForModalSerializer}
# )
# class ExpenseDetailView(generics.RetrieveAPIView):
    # --- MODIFICATION START ---
    permission_classes = [IsBMSUser]
    # This serializer is fine for its purpose
    serializer_class = ExpenseDetailForModalSerializer

    def get_queryset(self):
        """
        Implements data isolation for viewing expense details.
        An ADMIN can see any expense.
        Other users can only see expenses within their own department.
        """
        user = self.request.user
        user_roles = getattr(user, 'roles', {})
        bms_role = user_roles.get('bms')

        base_queryset = Expense.objects.select_related(
            'project__budget_proposal')

        if bms_role == 'ADMIN':
            return base_queryset.all()

        department_id = getattr(user, 'department_id', None)
        if department_id:
            return base_queryset.filter(department_id=department_id)

        return Expense.objects.none()
    # --- MODIFICATION END ---

    # MODIFICATION START

@extend_schema(
    tags=['Expense History Page'],
    summary="Get the parent proposal ID for a single expense",
    description="Returns the project and budget_proposal ID for a given expense ID. This is used by the frontend to fetch the full proposal details for the 'View' modal.",
    responses={200: ExpenseDetailForModalSerializer}
)
class ExpenseDetailViewForModal(generics.RetrieveAPIView):
    permission_classes = [IsBMSUser]
    serializer_class = ExpenseDetailForModalSerializer

    def get_queryset(self):
        """
        Implements data isolation for viewing expense details.
        An ADMIN can see any expense.
        Other users can only see expenses within their own department.
        """
        user = self.request.user
        user_roles = getattr(user, 'roles', {})
        bms_role = user_roles.get('bms')

        base_queryset = Expense.objects.select_related(
            'project__budget_proposal')

        if bms_role == 'ADMIN':
            return base_queryset.all()

        department_id = getattr(user, 'department_id', None)
        if department_id:
            return base_queryset.filter(department_id=department_id)

        return Expense.objects.none()
    
class ExternalExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EXTERNAL services (e.g., AMS, HDS) to create Expense records.
    This endpoint is protected by API Key Authentication.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseMessageSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [IsTrustedService]
    http_method_names = ['post']


# MODIFICATION START: New view for Expense History detail page
@extend_schema(
    tags=['Expense History Page'],
    summary="Get full details for a single historical expense",
    description="Returns all details for an approved expense, including project info, attachments, and status.",
    responses={200: ExpenseDetailSerializer}
)
class ExpenseHistoryDetailView(generics.RetrieveAPIView):
    permission_classes = [IsBMSUser]
    serializer_class = ExpenseDetailSerializer

    def get_queryset(self):
        user = self.request.user
        # History is only for approved expenses
        base_queryset = Expense.objects.filter(status='APPROVED')
        user_roles = getattr(user, 'roles', {})
        bms_role = user_roles.get('bms')

        if bms_role == 'ADMIN':
            return base_queryset.all()

        department_id = getattr(user, 'department_id', None)
        if department_id:
            return base_queryset.filter(department_id=department_id)

        return Expense.objects.none()
# MODIFICATION END