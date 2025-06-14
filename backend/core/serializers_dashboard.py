from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import *
from drf_spectacular.utils import extend_schema_field



class TotalBudgetSerializer(serializers.Serializer):
    fiscal_year = serializers.CharField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage_allocated = serializers.FloatField()
    
class DashboardBudgetSummarySerializer(serializers.Serializer):
    fiscal_year = serializers.CharField()
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage_used = serializers.FloatField()
    remaining_percentage = serializers.FloatField()
    available_for_allocation = serializers.BooleanField()
    
class MonthlyBudgetActualSerializer(serializers.Serializer):
    """
    Serializer for monthly budget vs actual data.
    This doesn't tie to a specific model but returns computed data.
    """
    month = serializers.IntegerField()
    month_name = serializers.CharField()
    budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    actual = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    class Meta:
        fields = ['month', 'month_name', 'budget', 'actual']
        
class ProjectStatusSerializer(serializers.Serializer):
    """
    Serializer for the project table in the dashboard.
    """
    project_id = serializers.IntegerField()
    project_name = serializers.CharField()
    budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    status = serializers.CharField()
    progress = serializers.FloatField()
    
class DepartmentBudgetStatusSerializer(serializers.Serializer):
    """
    Serializer for the department budget vs actual element
    """
    department_id = serializers.IntegerField()
    department_name = serializers.CharField()
    budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage_used = serializers.FloatField()
    
class CategoryAllocationSerializer(serializers.ModelSerializer):
    total_allocated = serializers.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'total_allocated']