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
    today = timezone.now().date()

    # Get current fiscal year
    fiscal_year = FiscalYear.objects.filter(
        start_date__lte=today,
        end_date__gte=today,
        is_active=True
    ).first()

    department = request.user.department
    top_category_info = {'name': 'No Data', 'amount': 0, 'percentage': 0}

    # Get top expense category via updated logic
    if fiscal_year and department:
        top_category_data = ExpenseCategory.get_top_category_with_percentage(
            fiscal_year=fiscal_year,
            department=department
        )
        if top_category_data:
            top_category_info = {
                'name': top_category_data['category'].name,
                'amount': top_category_data['amount'],
                'percentage': top_category_data['percentage']
            }

    # Serialize top category
    serializer = TopCategorySerializer(top_category_info)

    # Get total expenses this month, filtered through department
    month_expenses = Expense.objects.filter(
        status='APPROVED',
        date__year=today.year,
        date__month=today.month,
        budget_allocation__project__budget_proposal__department=department
    )
    total_expenses_this_month = month_expenses.aggregate(total=Sum('amount'))['total'] or 0

    # Calculate budget and spending from allocations tied to the department via project → proposal
    total_budget = 0
    total_spent = 0

    if fiscal_year and department:
        allocations = BudgetAllocation.objects.filter(
            is_active=True,
            project__budget_proposal__department=department,
            project__budget_proposal__fiscal_year=fiscal_year
        )

        total_budget = allocations.aggregate(total=Sum('amount'))['total'] or 0
        total_spent = Expense.objects.filter(
            status='APPROVED',
            budget_allocation__in=allocations
        ).aggregate(total=Sum('amount'))['total'] or 0

    budget_remaining = total_budget - total_spent
    budget_remaining_percentage = (budget_remaining / total_budget * 100) if total_budget > 0 else 0

    # Pending approvals
    pending_approvals = Expense.objects.filter(
        status='SUBMITTED',
        budget_allocation__project__budget_proposal__department=department
    ).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'top_category': serializer.data,
        'total_expenses_this_month': total_expenses_this_month,
        'budget_remaining': budget_remaining,
        'budget_remaining_percentage': budget_remaining_percentage,
        'pending_approvals': pending_approvals
    })
