from decimal import Decimal
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from django.db.models import Subquery, OuterRef

from core.pagination import ProjectStatusPagination, StandardResultsSetPagination
from .models import Department, FiscalYear, BudgetAllocation, Expense, Project
from .serializers import DepartmentBudgetSerializer
from .serializers_dashboard import DashboardBudgetSummarySerializer, DepartmentBudgetStatusSerializer, ProjectStatusSerializer, TotalBudgetSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers_dashboard import MonthlyBudgetActualSerializer
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, action
import calendar
from decimal import Decimal
from django.utils import timezone


class DepartmentBudgetView(views.APIView):
    """
    API endpoint that returns department budget allocation information
    """

    @extend_schema(
        tags=["Dashboard"],
        summary="Get department budget allocations",
        description="Returns budget allocation information for all active departments in the specified fiscal year",
        parameters=[
            OpenApiParameter(
                name="fiscal_year_id",
                description="ID of the fiscal year to get budget allocations for",
                required=True,
                type=int
            ),
        ],
        responses={
            200: DepartmentBudgetSerializer(many=True),
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            404: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        examples=[
            OpenApiExample(
                "Example Response",
                value=[{
                    "id": 1,
                    "name": "Human Resources",
                    "code": "HR",
                    "total_budget": "500000.00",
                    "total_spent": "320000.00",
                    "remaining_budget": "180000.00",
                    "percentage_used": 64.0
                }],
                response_only=True,
            )
        ]
    )
    def get(self, request):
        fiscal_year_id = request.query_params.get('fiscal_year_id')

        if not fiscal_year_id:
            return Response({"error": "fiscal_year_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            fiscal_year = FiscalYear.objects.get(id=fiscal_year_id)
        except FiscalYear.DoesNotExist:
            return Response({"error": "Fiscal year not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get all departments with active allocations via projects & proposals
        departments = Department.objects.filter(
            is_active=True,
            budgetproposal__project__budget__is_active=True,
            budgetproposal__fiscal_year=fiscal_year
        ).distinct()

        # Subquery for total budget allocation per department
        budget_subquery = BudgetAllocation.objects.filter(
            project__budget_proposal__department=OuterRef('pk'),
            project__budget_proposal__fiscal_year=fiscal_year,
            is_active=True
        ).values('project__budget_proposal__department').annotate(
            total=Sum('amount')
        ).values('total')

        # Subquery for total approved expenses per department
        expense_subquery = Expense.objects.filter(
            budget_allocation__project__budget_proposal__department=OuterRef(
                'pk'),
            budget_allocation__project__budget_proposal__fiscal_year=fiscal_year,
            status='APPROVED'
        ).values('budget_allocation__project__budget_proposal__department').annotate(
            total=Sum('amount')
        ).values('total')

        departments = departments.annotate(
            total_budget=Coalesce(Subquery(budget_subquery),
                                  0, output_field=DecimalField()),
            total_spent=Coalesce(Subquery(expense_subquery),
                                 0, output_field=DecimalField())
        )

        for dept in departments:
            dept.remaining_budget = dept.total_budget - dept.total_spent
            dept.percentage_used = round(
                (dept.total_spent / dept.total_budget * 100), 2
            ) if dept.total_budget > 0 else 0

        serializer = DepartmentBudgetSerializer(departments, many=True)
        return Response(serializer.data)


@extend_schema(
    tags=["Dashboard"],
    summary="Get dashboard budget summary",
    description="Returns total, spent, and remaining budget for the active fiscal year.",
    responses={200: DashboardBudgetSummarySerializer},
    examples=[
        OpenApiExample(
            "Dashboard Budget Summary Example",
            value={
                "fiscal_year": "FY2025",
                "total_budget": "12500000.00",
                "total_spent": "4500000.00",
                "remaining_budget": "8000000.00",
                "remaining_percentage": 64.0,
                "percentage_used": 46.0,
                "available_for_allocation": True

            },
            response_only=True
        )
    ]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_budget_summary(request):

    today = timezone.now().date()
    fiscal_year = FiscalYear.objects.filter(
        start_date__lte=today,
        end_date__gte=today,
        is_active=True
    ).first()

    if not fiscal_year:
        return Response({"detail": "No active fiscal year found."}, status=404)

    allocations = BudgetAllocation.objects.filter(
        is_active=True,
        fiscal_year=fiscal_year
    )
    total_budget = allocations.aggregate(total=Sum('amount'))['total'] or 0

    total_spent = Expense.objects.filter(
        budget_allocation__in=allocations,
        status='APPROVED'
    ).aggregate(total=Sum('amount'))['total'] or 0

    remaining_budget = total_budget - total_spent
    remaining_percentage = (
        remaining_budget / total_budget * 100) if total_budget > 0 else 0
    percentage_used = Decimal('100.00') - remaining_percentage

    # Serializer
    serializer = DashboardBudgetSummarySerializer({
        "fiscal_year": fiscal_year.name,
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining_budget": remaining_budget,
        "remaining_percentage": round(remaining_percentage, 2),
        "percentage_used": round(percentage_used, 2),
        "available_for_allocation": True  # placeholder — can be made dynamic later
    })

    return Response(serializer.data)


class MonthlyBudgetActualViewSet(viewsets.ViewSet):
    """
    ViewSet for retrieving monthly budget vs actual data
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Dashboard'],
        summary="Monthly Budget vs Actual (by department)",
        description="Returns monthly budget and actual expenses for a given department and fiscal year.",
        parameters=[
            OpenApiParameter(name='department_id', type=int, required=True),
            OpenApiParameter(name='fiscal_year_id', type=int, required=True),
            OpenApiParameter(name='project_id', type=int, required=False),
        ],
        responses={200: MonthlyBudgetActualSerializer(many=True)},
        examples=[
            OpenApiExample(
                "Monthly Budget Example",
                value=[
                    {"month": 1, "month_name": "January",
                     "budget": "50000.00", "actual": "42000.00"},
                    {"month": 2, "month_name": "February",
                     "budget": "50000.00", "actual": "31000.00"},
                ],
                response_only=True
            )
        ]
    )
    def list(self, request):
        """
        Get monthly budget vs actual data for a specific department and fiscal year.

        Query parameters:
        - department_id: ID of the department
        - fiscal_year_id: ID of the fiscal year 
        - project_id: Optional - filter by specific project
        """
        # Get parameters
        department_id = request.query_params.get('department_id')
        fiscal_year_id = request.query_params.get('fiscal_year_id')
        project_id = request.query_params.get('project_id')

        # Validate required parameters
        if not department_id or not fiscal_year_id:
            return Response(
                {"error": "department_id and fiscal_year_id are required parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            department = Department.objects.get(id=department_id)
            fiscal_year = FiscalYear.objects.get(id=fiscal_year_id)
        except (Department.DoesNotExist, FiscalYear.DoesNotExist):
            return Response(
                {"error": "Department or fiscal year not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Base query for budget allocations
        budget_query = BudgetAllocation.objects.filter(
            department=department,
            fiscal_year=fiscal_year,
            is_active=True
        )

        # Apply project filter if specified
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
                budget_query = budget_query.filter(project=project)
            except Project.DoesNotExist:
                return Response(
                    {"error": "Project not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Get total budget
        total_budget = budget_query.aggregate(
            total=Sum('amount'))['total'] or 0

        # Calculate monthly data
        monthly_data = self._calculate_monthly_data(
            department, fiscal_year, total_budget, project_id
        )

        serializer = MonthlyBudgetActualSerializer(monthly_data, many=True)
        return Response(serializer.data)

    def _calculate_monthly_data(self, department, fiscal_year, total_budget, project_id=None):
        """
        Calculate budget and actual expenses by month.

        This method distributes the annual budget across months based on fiscal year
        duration and retrieves actual expenses by month.
        """
        result = []

        # Get start and end months within this fiscal year
        start_month = fiscal_year.start_date.month
        start_year = fiscal_year.start_date.year
        end_month = fiscal_year.end_date.month
        end_year = fiscal_year.end_date.year

        # Calculate total months in fiscal year
        total_months = (end_year - start_year) * 12 + \
            (end_month - start_month) + 1

        # If total months is zero (invalid fiscal year), return empty result
        if total_months <= 0:
            return result

        # Distribute budget evenly across months (simple approach)
        monthly_budget = total_budget / total_months

        # For each month in the fiscal year
        current_year = start_year
        current_month = start_month

        for _ in range(total_months):
            # Base query for expenses in this month
            expense_query = Expense.objects.filter(
                department=department,
                status='APPROVED',
                date__year=current_year,
                date__month=current_month,
                budget_allocation__fiscal_year=fiscal_year
            )

            # Apply project filter if specified
            if project_id:
                expense_query = expense_query.filter(project_id=project_id)

            # Get actual expenses for this month
            actual_expenses = expense_query.aggregate(
                total=Sum('amount'))['total'] or 0

            # Add to result
            result.append({
                'month': current_month,
                'month_name': calendar.month_name[current_month],
                'budget': monthly_budget,
                'actual': actual_expenses
            })

            # Move to next month
            if current_month == 12:
                current_month = 1
                current_year += 1
            else:
                current_month += 1

        return result

    @extend_schema(

        summary="Monthly Budget vs Actual (Project-Based)",
        description=(
            "Returns a monthly breakdown of budget vs actual expenses for a specific project. "
            "Distributes the total project budget across its duration (based on start and end dates) "
            "and aggregates approved expenses by month."
        ),
        parameters=[
            OpenApiParameter(
                name='project_id',
                type=int,
                required=True,
                description='The ID of the project to retrieve budget vs actual data for.'
            )
        ],
        responses={
            200: OpenApiResponse(
                response=MonthlyBudgetActualSerializer(many=True),
                description='Monthly budget vs actual data for the specified project.'
            ),
            400: OpenApiResponse(
                description='Missing or invalid project_id parameter',
                response=OpenApiExample(
                    'Missing project_id',
                    value={"error": "project_id is required"},
                    response_only=True,
                    status_codes=["400"]
                )
            ),
            404: OpenApiResponse(
                description='Project or allocation not found',
                response=OpenApiExample(
                    'Project not found',
                    value={"error": "Project not found"},
                    response_only=True,
                    status_codes=["404"]
                )
            )
        },
        examples=[
            OpenApiExample(
                'Successful Response Example',
                value=[
                    {"month": 1, "month_name": "January",
                        "budget": "50000.00", "actual": "42000.00"},
                    {"month": 2, "month_name": "February",
                        "budget": "50000.00", "actual": "31000.00"}
                ],
                response_only=True,
                status_codes=["200"]
            )
        ],
        tags=['Dashboard'],
    )
    @action(detail=False, methods=['get'])
    def project_distribution(self, request):
        """
        Alternative calculation based on project start/end dates to 
        distribute budget more intelligently across months.

        This is an enhanced version that considers project timelines.
        """
        # Get parameters
        project_id = request.query_params.get('project_id')

        if not project_id:
            return Response(
                {"error": "project_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get budget allocation for this project
        try:
            budget_allocation = BudgetAllocation.objects.get(
                project=project,
                is_active=True
            )
        except BudgetAllocation.DoesNotExist:
            return Response(
                {"error": "No active budget allocation found for this project"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate monthly data based on project timeline
        monthly_data = self._calculate_project_monthly_data(
            project, budget_allocation
        )

        serializer = MonthlyBudgetActualSerializer(monthly_data, many=True)
        return Response(serializer.data)

    def _calculate_project_monthly_data(self, project, budget_allocation):
        """
        Calculate budget and actual expenses by month based on project timeline.

        This distributes the budget according to project duration rather than 
        fiscal year, which is likely more accurate for project-specific views.
        """
        result = []

        # Get project start and end months
        start_month = project.start_date.month
        start_year = project.start_date.year
        end_month = project.end_date.month
        end_year = project.end_date.year

        # Calculate total months in project
        total_months = (end_year - start_year) * 12 + \
            (end_month - start_month) + 1

        # If total months is zero (invalid project dates), return empty result
        if total_months <= 0:
            return result

        # Distribute budget evenly across months
        monthly_budget = budget_allocation.amount / Decimal(total_months)

        # For each month in the project
        current_year = start_year
        current_month = start_month

        for _ in range(total_months):
            # Get actual expenses for this month
            actual_expenses = Expense.objects.filter(
                project=project,
                status='APPROVED',
                date__year=current_year,
                date__month=current_month
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Add to result
            result.append({
                'month': current_month,
                'month_name': calendar.month_name[current_month],
                'budget': monthly_budget,
                'actual': actual_expenses
            })

            # Move to next month
            if current_month == 12:
                current_month = 1
                current_year += 1
            else:
                current_month += 1

        return result


@extend_schema(
    summary="Project Table List",
    description="Returns a paginated list of all projects in the current fiscal year with budget, spending, remaining, and progress info.",
    parameters=[
        OpenApiParameter(
            name='page',
            type=int,
            description='Page number',
            required=False
        ),
        OpenApiParameter(
            name='page_size',
            type=int,
            description='Number of results per page (max 100)',
            required=False
        ),
    ],
    responses={200: ProjectStatusSerializer(many=True)},
    tags=["Dashboard"],
    examples=[
        OpenApiExample(
            "Project Status Example",
            value={
                "count": 15,
                "next": "http://api.example.org/projects/?page=2",
                "previous": None,
                "results": [
                    {
                        "project_id": 1,
                        "project_name": "HR Automation",
                        "budget": "1000000.00",
                        "spent": "600000.00",
                        "remaining": "400000.00",
                        "status": "Ongoing",
                        "progress": 60.0
                    },
                    {
                        "project_id": 2,
                        "project_name": "IT Infrastructure Upgrade",
                        "budget": "2500000.00",
                        "spent": "1200000.00",
                        "remaining": "1300000.00",
                        "status": "Ongoing",
                        "progress": 48.0
                    }
                ]
            },
            response_only=True
        )
    ]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_status_list(request):
    paginator = ProjectStatusPagination()

    today = timezone.now().date()

    fiscal_year = FiscalYear.objects.filter(
        start_date__lte=today,
        end_date__gte=today,
        is_active=True
    ).first()

    if not fiscal_year:
        return Response({"detail": "No active fiscal year found."}, status=404)

    allocations = BudgetAllocation.objects.filter(
        fiscal_year=fiscal_year,
        is_active=True
    ).select_related('project')

    project_data = []

    for alloc in allocations:
        expenses = Expense.objects.filter(
            budget_allocation=alloc,
            status='APPROVED'
        )

        spent = expenses.aggregate(total=Sum('amount'))['total'] or 0
        budget = alloc.amount
        remaining = budget - spent
        progress = (spent / budget * 100) if budget > 0 else 0

        project_data.append({
            "project_id": alloc.project.id,
            "project_name": alloc.project.name,
            "budget": budget,
            "spent": spent,
            "remaining": remaining,
            "status": alloc.project.status,
            "progress": round(progress, 2)
        })

    # Apply pagination
    page = paginator.paginate_queryset(project_data, request)

    # Serialize the paginated results
    serializer = ProjectStatusSerializer(page, many=True)

    # Return the paginated response
    return paginator.get_paginated_response(serializer.data)


@extend_schema(
    summary="Department Budget vs Actual",
    description="Returns all departments' budget allocations, spending, and usage percentage for the active fiscal year. This is for the fourth element of the dashboard",
    responses={200: DepartmentBudgetStatusSerializer(many=True)},
    tags=["Dashboard"],
    examples=[
        OpenApiExample(
            "Example Response",
            value=[
                {
                    "department_id": 1,
                    "department_name": "IT Department",
                    "budget": "3000000.00",
                    "spent": "2100000.00",
                    "percentage_used": 70.0
                },
                {
                    "department_id": 2,
                    "department_name": "HR Department",
                    "budget": "2000000.00",
                    "spent": "500000.00",
                    "percentage_used": 25.0
                }
            ],
            response_only=True
        )
    ]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_department_budget_status(request):
    today = timezone.now().date()

    fiscal_year = FiscalYear.objects.filter(
        start_date__lte=today,
        end_date__gte=today,
        is_active=True
    ).first()

    if not fiscal_year:
        return Response({"detail": "No active fiscal year found."}, status=404)

    departments = Department.objects.filter(is_active=True)
    result = []

    for dept in departments:
        allocations = BudgetAllocation.objects.filter(
            is_active=True,
            fiscal_year=fiscal_year,
            project__budget_proposal__department=dept
        )

        budget = allocations.aggregate(total=Sum('amount'))['total'] or 0

        spent = Expense.objects.filter(
            status='APPROVED',
            budget_allocation__in=allocations
        ).aggregate(total=Sum('amount'))['total'] or 0

        percent_used = (spent / budget * 100) if budget > 0 else 0

        result.append({
            "department_id": dept.id,
            "department_name": dept.name,
            "budget": budget,
            "spent": spent,
            "percentage_used": round(percent_used, 2)
        })

    serializer = DepartmentBudgetStatusSerializer(result, many=True)
    return Response(serializer.data)
