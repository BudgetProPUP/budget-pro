from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from decimal import Decimal
import calendar

from core.models import FiscalYear, Expense, Forecast, ForecastDataPoint

class Command(BaseCommand):
    help = 'Generates and stores budget forecasts based on historical expense data.'

    def handle(self, *args, **options):
        self.stdout.write("Starting forecast generation process...")

        today = timezone.now().date()
        active_fiscal_year = FiscalYear.objects.filter(start_date__lte=today, end_date__gte=today, is_active=True).first()

        if not active_fiscal_year:
            self.stdout.write(self.style.WARNING("No active fiscal year found. Skipping forecast generation."))
            return

        try:
            with transaction.atomic():
                # --- Forecasting Logic (from view) ---
                current_month_num = today.month
                
                historical_expenses = Expense.objects.filter(
                    status='APPROVED',
                    budget_allocation__fiscal_year=active_fiscal_year,
                    date__lt=today.replace(day=1)
                )

                first_expense = historical_expenses.order_by('date').first()
                if not first_expense:
                    self.stdout.write(self.style.WARNING(f"No historical expense data for {active_fiscal_year.name}. Cannot generate forecast."))
                    return

                start_date_for_avg = max(first_expense.date, active_fiscal_year.start_date)
                num_past_months = (today.year - start_date_for_avg.year) * 12 + (today.month - start_date_for_avg.month)

                if num_past_months <= 0:
                    self.stdout.write(self.style.WARNING("Not enough historical data (less than one full month). Skipping."))
                    return

                total_historical_spent = historical_expenses.aggregate(total=Coalesce(Sum('amount'), Decimal('0.0')))['total']
                average_monthly_expense = total_historical_spent / num_past_months

                # --- Store the Forecast (US-011) ---
                # Create a new parent Forecast record for this run
                new_forecast = Forecast.objects.create(fiscal_year=active_fiscal_year)
                
                last_known_cumulative_spend = total_historical_spent
                
                for month_num in range(current_month_num, 13):
                    # Cumulative logic
                    months_into_future = month_num - current_month_num + 1
                    forecast_value = last_known_cumulative_spend + (average_monthly_expense * months_into_future)
                    
                    ForecastDataPoint.objects.create(
                        forecast=new_forecast,
                        month=month_num,
                        month_name=calendar.month_name[month_num],
                        forecasted_value=round(forecast_value, 2)
                    )
            
            self.stdout.write(self.style.SUCCESS(f"Successfully generated and stored new forecast for {active_fiscal_year.name}."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred during forecast generation: {e}"))
            
            
# TODO:
# Areas for improvement: Seasonality not considered (consider calculating monthly average per month from historical years rather than one overall average)
# No Confidence intervals (Forecast shows single line, but real forecasting includes case sccenarios)
# Ignores current month partial data ( filter excludes the current month entirely.)
# Division by Zero risk ( num_past_months <= 0, if corrupted to 0, gets division error)
# No Trending or Growth Adjustment (Organizations rarely spend at exactly the same rate. You might want to detect if spending is accelerating or decelerating.
# Doesn't Handle Mid-Year Fiscal Years (loop for month_num in range(current_month_num, 13) would miss months 1-6 of a fiscal year starting in July.)
# Instead of one overall average, use a 3-month or 6-month moving average for more responsive forecasting: