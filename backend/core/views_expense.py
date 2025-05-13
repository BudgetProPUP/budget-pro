from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone

from .models import ExpenseCategory, FiscalYear, Expense, BudgetAllocation
from .serializers import TopCategorySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expense_dashboard_data(request):
    # Get current fiscal year
    fiscal_year = FiscalYear.objects.filter(
        start_date__lte=timezone.now().date(),
        end_date__gte=timezone.now().date(),
        is_active=True
    ).first()
    
    # Get user's department
    department = request.user.department
    
    # Get top expense category
    top_category_data = ExpenseCategory.get_top_category_with_percentage(
        fiscal_year=fiscal_year,
        department=department
    )
    
    # Format top category data for serialization
    if top_category_data:
        top_category_info = {
            'name': top_category_data['category'].name,
            'amount': top_category_data['amount'],
            'percentage': top_category_data['percentage']
        }
    else:
        top_category_info = {
            'name': 'No Data',
            'amount': 0,
            'percentage': 0
        }
    
    # Serialize the top category data
    serializer = TopCategorySerializer(top_category_info)
    
    # Calculate total expenses this month
    today = timezone.now()
    month_expenses_query = Expense.objects.filter(
        status='APPROVED',
        date__year=today.year,
        date__month=today.month
    )
    
    if department:
        month_expenses_query = month_expenses_query.filter(department=department)
    
    total_expenses_this_month = month_expenses_query.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Calculate budget remaining
    total_budget = 0
    total_spent = 0
    
    if fiscal_year and department:
        # Get all budget allocations for this department in this fiscal year
        allocations = BudgetAllocation.objects.filter(
            fiscal_year=fiscal_year,
            department=department,
            is_active=True
        )
        
        # Calculate total allocated budget
        total_budget = allocations.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate total spent (approved expenses)
        total_spent = Expense.objects.filter(
            budget_allocation__in=allocations,
            status='APPROVED'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
    
    # Calculate budget remaining
    budget_remaining = total_budget - total_spent
    budget_remaining_percentage = (budget_remaining / total_budget * 100) if total_budget > 0 else 0
    
    # Calculate pending approvals
    pending_query = Expense.objects.filter(status='SUBMITTED')
    
    if department:
        pending_query = pending_query.filter(department=department)
    
    pending_approvals = pending_query.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Return the complete dashboard data
    return Response({
        'top_category': serializer.data,
        'total_expenses_this_month': total_expenses_this_month,
        'budget_remaining': budget_remaining,
        'budget_remaining_percentage': budget_remaining_percentage,
        'pending_approvals': pending_approvals
    })