from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from django.db.models import Q 
from .models import Department, FiscalYear, BudgetAllocation, Expense
from .serializers import DepartmentBudgetSerializer

class DepartmentBudgetView(views.APIView):
    """
    API endpoint that returns department budget allocation information
    """
    
    @extend_schema(
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
                value=[
                    {
                        "id": 1,
                        "name": "Human Resources",
                        "code": "HR",
                        "total_budget": "500000.00", 
                        "total_spent": "320000.00",
                        "remaining_budget": "180000.00",
                        "percentage_used": 64.0
                    }
                ],
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
        
        # Get active departments with budget allocations for the fiscal year
        departments = Department.objects.filter(
            is_active=True,
            budgetallocation__fiscal_year=fiscal_year,
            budgetallocation__is_active=True
        ).distinct()
        
        # Annotate departments with budget information
        departments = departments.annotate(
            total_budget=Coalesce(
                Sum('budgetallocation__amount', 
                    filter=Q(budgetallocation__fiscal_year_id=fiscal_year.id)),  # Use Q object and =
                0,
                output_field=DecimalField()
            ),
            total_spent=Coalesce(
                Sum('budgetallocation__expense__amount', 
                    filter=Q(budgetallocation__fiscal_year_id=fiscal_year.id) & 
                    Q(budgetallocation__expense__status='APPROVED')),  # Use Q objects with &
                0,
                output_field=DecimalField()
            )
        )
        
        # Calculate remaining budget and percentage used
        for dept in departments:
            dept.remaining_budget = dept.total_budget - dept.total_spent
            dept.percentage_used = (dept.total_spent / dept.total_budget * 100) if dept.total_budget > 0 else 0
        
        serializer = DepartmentBudgetSerializer(departments, many=True)
        return Response(serializer.data)