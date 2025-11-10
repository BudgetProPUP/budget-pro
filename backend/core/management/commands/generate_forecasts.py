from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from decimal import Decimal
import calendar
from collections import defaultdict
from core.models import FiscalYear, Expense, Forecast, ForecastDataPoint


class Command(BaseCommand):
    help = 'Generates and stores budget forecasts based on historical expense data.'

    def handle(self, *args, **options):
        self.stdout.write("Starting forecast generation process...")

        today = timezone.now().date()
        active_fiscal_year = FiscalYear.objects.filter(
            start_date__lte=today, end_date__gte=today, is_active=True).first()

        if not active_fiscal_year:
            self.stdout.write(self.style.WARNING(
                "No active fiscal year found. Skipping forecast generation."))
            return

        try:
            with transaction.atomic():
                # --- MODIFICATION START: Reworked Forecasting Logic for US-009 ---

                # 1. Get ALL historical expenses, regardless of fiscal year, to build a seasonal model.
                historical_expenses = Expense.objects.filter(
                    status='APPROVED',
                    # Use data up to the start of the current month
                    date__lt=today.replace(day=1)
                ).order_by('date')

                if not historical_expenses.exists():
                    self.stdout.write(self.style.WARNING(
                        f"No historical expense data found. Cannot generate forecast for {active_fiscal_year.name}."))
                    return

                # 2. Calculate average spending for each month of the year (Seasonal Data)
                monthly_spend_data = defaultdict(
                    lambda: {'total': Decimal('0.0'), 'count': 0})
                for expense in historical_expenses:
                    month = expense.date.month
                    monthly_spend_data[month]['total'] += expense.amount

                # To get the count of unique months in the history
                unique_months = historical_expenses.dates('date', 'month')
                for month_date in unique_months:
                    month = month_date.month
                    # Count how many years of data we have for this month
                    num_years_for_month = historical_expenses.filter(
                        date__month=month).dates('date', 'year').count()
                    monthly_spend_data[month]['count'] = num_years_for_month

                monthly_averages = {}
                for month, data in monthly_spend_data.items():
                    if data['count'] > 0:
                        monthly_averages[month] = data['total'] / data['count']

                # 3. Calculate a fallback: the overall average monthly spend
                total_historical_spent = sum(
                    data['total'] for data in monthly_spend_data.values())
                total_months_of_data = len(unique_months)

                if total_months_of_data == 0:
                    self.stdout.write(self.style.WARNING(
                        "Not enough historical data to calculate an overall average. Skipping."))
                    return

                overall_average_monthly_expense = total_historical_spent / total_months_of_data

                # 4. Generate the forecast for the CURRENT fiscal year's future months
                new_forecast = Forecast.objects.create(
                    # MODIFICATION: Updated algorithm name
                    fiscal_year=active_fiscal_year, algorithm_used='SEASONAL_CUMULATIVE')

                current_month_num = today.month

                self.stdout.write(
                    f"Generating forecast from month {current_month_num} onwards.")

                # MODIFICATION START: Implement cumulative forecasting

                # Get the actual total spent in the current year up to the beginning of the current month.
                # This is the starting point for our cumulative forecast.
                cumulative_spend_so_far = Expense.objects.filter(
                    status='APPROVED',
                    budget_allocation__fiscal_year=active_fiscal_year,
                    date__lt=today.replace(day=1)
                ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.0')))['total']

                self.stdout.write(
                    f"  - Starting cumulative spend: {cumulative_spend_so_far}")

                # This variable will track the running total for the forecast
                running_forecast_total = cumulative_spend_so_far

                for month_num in range(1, 13):
                    # We only create data points for current and future months
                    if month_num < current_month_num:
                        continue

                    # Use the specific monthly average if available, otherwise use the fallback
                    monthly_forecast_value = monthly_averages.get(
                        month_num, overall_average_monthly_expense)

                    # Add this month's forecast to the running total
                    running_forecast_total += monthly_forecast_value

                    ForecastDataPoint.objects.create(
                        forecast=new_forecast,
                        month=month_num,
                        month_name=calendar.month_name[month_num],
                        # Store the CUMULATIVE value
                        forecasted_value=round(running_forecast_total, 2)
                    )
                    self.stdout.write(
                        f"  - Forecast for {calendar.month_name[month_num]}: {round(running_forecast_total, 2)} (added {round(monthly_forecast_value, 2)})")

            self.stdout.write(self.style.SUCCESS(
                f"Successfully generated and stored new forecast for {active_fiscal_year.name}."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f"An error occurred during forecast generation: {e}"))

# TODO:
# Potential issues to double-check:
# Division by Zero:
# The current month (November in this case) is excluded from the historical data:
# This ensures that partial data for the current month does not skew the forecast. However, if the current month's data is complete, it might be worth including it.
# Mid-Year Fiscal Years:
#The loop for generating forecasts assumes a calendar year (January to December). If the fiscal year starts mid-year (e.g., July), the logic might need adjustment to handle months outside the current year.