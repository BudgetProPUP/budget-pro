from decimal import Decimal
import json
from django.db.models import Sum, Q, DecimalField
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiTypes, OpenApiExample
from rest_framework.views import APIView
from rest_framework import viewsets
import csv
from .serializers import FiscalYearSerializer
from .models import Account, AccountType, BudgetProposal, Department, ExpenseCategory, FiscalYear, BudgetAllocation, Expense, JournalEntry, JournalEntryLine, Project
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, action
from decimal import Decimal
from django.utils import timezone
from .pagination import StandardResultsSetPagination
from .serializers_budget import (
    AccountDropdownSerializer,
    AccountSetupSerializer,
    AccountTypeDropdownSerializer,
    BudgetProposalListSerializer,
    BudgetProposalSerializer,
    BudgetProposalSummarySerializer,
    BudgetProposalDetailSerializer,
    DepartmentDropdownSerializer,
    ExpenseCategoryVarianceSerializer,
    JournalEntryCreateSerializer,
    JournalEntryListSerializer,
    LedgerViewSerializer,
    ProposalHistorySerializer
)
import openpyxl
from openpyxl.utils import get_column_letter # Converts column index (integer) to its Excel letter (e.g., 1 -> 'A')
from openpyxl.styles import Font, PatternFill # styling

@extend_schema(
    tags=['Budget Proposal Page'],
    summary="List budget proposals with filters",
    description="Returns paginated list of budget proposals. Filters by department, status, or search.",
    parameters=[
        OpenApiParameter(
            name="department", description="Filter by department code", required=False, type=str),
        OpenApiParameter(
            name="status", description="Filter by proposal status", required=False, type=str),
        OpenApiParameter(
            name="search", description="Search by title or ID", required=False, type=str),
    ],
    responses={200: BudgetProposalListSerializer(many=True)}
)
class BudgetProposalListView(generics.ListAPIView):
    serializer_class = BudgetProposalListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = BudgetProposal.objects.all()
        department = self.request.query_params.get('department')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if department:
            queryset = queryset.filter(department__code=department)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            # Change from Q(external_id__icontains=search) to:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(external_system_id__icontains=search)  # Correct field name
            )

        return queryset


class BudgetProposalSummaryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetProposalSummarySerializer

    @extend_schema(
        tags=['Budget Proposal Page'],
        summary="Get summary of budget proposals for the three cards in budget-proposal",
        description="Returns total number of proposals, number of pending approvals, and total approved budget.",
        responses={200: BudgetProposalSummarySerializer}
    )
    def get(self, request):
        total = BudgetProposal.objects.count()
        pending = BudgetProposal.objects.filter(status='PENDING').count()

        # Corrected aggregation using the related items
        total_budget = BudgetProposal.objects.aggregate(
            total=Sum('items__estimated_cost')  # Use the related items field
        )['total'] or 0

        return Response({
            'total_proposals': total,
            'pending_approvals': pending,
            'total_budget': total_budget
        })


class BudgetProposalDetailView(generics.RetrieveAPIView):
    queryset = BudgetProposal.objects.all()
    serializer_class = BudgetProposalDetailSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Budget Proposal Page'],
        summary="Retrieve full details of a proposal",
        description="Returns details including items and estimated costs.",
        responses={200: BudgetProposalDetailSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(
    tags=['Proposal History Page'],
    summary="List proposals history",
    description="Returns filtered and paginated proposal history list.",
    parameters=[
            OpenApiParameter(
                name="search", description="Search by title or external ID", required=False, type=str),
            OpenApiParameter(
                name="department", description="Filter by department ID", required=False, type=int),
            OpenApiParameter(
                name="status", description="Filter by proposal status", required=False, type=str),
            OpenApiParameter(
                name="account_type", description="Filter by account type (from line items)", required=False, type=str),
    ],
    responses={200: ProposalHistorySerializer(many=True)}
)
class ProposalHistoryView(generics.ListAPIView):
    serializer_class = ProposalHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = BudgetProposal.objects.prefetch_related(
            'items__account__account_type').all()

        search = self.request.query_params.get('search')
        department_id = self.request.query_params.get('department')
        status = self.request.query_params.get('status')
        account_type = self.request.query_params.get('account_type')

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(
                external_system_id__icontains=search))

        if department_id:
            qs = qs.filter(department_id=department_id)

        if status:
            qs = qs.filter(status=status)

        if account_type:
            qs = qs.filter(
                items__account__account_type__name__iexact=account_type).distinct()

        return qs.order_by('-last_modified')


@extend_schema(
    tags=['Account Setup Page'],
    summary="List account setup with accomplishment status",
    parameters=[
            OpenApiParameter(
                name="fiscal_year_id", description="Fiscal year to check accomplishment status for", required=True, type=int),
            OpenApiParameter(
                name="search", description="Search by code or title", required=False, type=str),
            OpenApiParameter(
                name="type", description="Filter by account type name", required=False, type=str),
            OpenApiParameter(
                name="status", description="Filter by active status", required=False, type=str),
    ],
    responses={200: AccountSetupSerializer(many=True)}
)
class AccountSetupListView(generics.ListAPIView):
    serializer_class = AccountSetupSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    queryset = Account.objects.select_related(
        'account_type').prefetch_related('allocations')

    @extend_schema(
        summary="List account setup with accomplishment status",
        parameters=[
            OpenApiParameter(
                name="fiscal_year_id", description="Fiscal year to check accomplishment status for", required=True, type=int),
            OpenApiParameter(
                name="search", description="Search by code or title", required=False, type=str),
            OpenApiParameter(
                name="type", description="Filter by account type name", required=False, type=str),
            OpenApiParameter(
                name="status", description="Filter by active status", required=False, type=str),
        ],
        responses={200: AccountSetupSerializer(many=True)}
    )
    def get_queryset(self):
        qs = self.queryset

        # Optional filters
        search = self.request.query_params.get('search')
        acc_type = self.request.query_params.get('type')
        status = self.request.query_params.get('status')

        if search:
            qs = qs.filter(Q(code__icontains=search) |
                           Q(name__icontains=search))
        if acc_type:
            qs = qs.filter(account_type__name__iexact=acc_type)
        if status:
            if status.lower() == 'active':
                qs = qs.filter(is_active=True)
            elif status.lower() == 'inactive':
                qs = qs.filter(is_active=False)

        return qs.order_by('code')

    def list(self, request, *args, **kwargs):
        fiscal_year_id = request.query_params.get('fiscal_year_id')
        if not fiscal_year_id:
            return Response({"error": "fiscal_year_id is required"}, status=400)

        try:
            fiscal_year = FiscalYear.objects.get(id=fiscal_year_id)
        except FiscalYear.DoesNotExist:
            return Response({"error": "Fiscal year not found"}, status=404)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        serializer = self.get_serializer(page, many=True, context={
                                         'fiscal_year': fiscal_year})
        return self.get_paginated_response(serializer.data)


@extend_schema(
    tags=['Fiscal Year Dropdown'],
    summary="For Fiscal Year values in a dropdown"
)
class FiscalYearDropdownView(generics.ListAPIView):
    queryset = FiscalYear.objects.all().order_by('-start_date')
    serializer_class = FiscalYearSerializer
    permission_classes = [IsAuthenticated]


@extend_schema(
    tags=['Ledger View'],
    summary="Get ledger view",
    parameters=[
            OpenApiParameter(
                name="search", description="Search by description or category", required=False, type=str),
            OpenApiParameter(
                name="category", description="Filter by category (e.g., EXPENSES)", required=False, type=str),
            OpenApiParameter(
                name="transaction_type", description="Filter by transaction type", required=False, type=str),
    ],
    responses={200: LedgerViewSerializer(many=True)}
)
class LedgerViewList(generics.ListAPIView):
    serializer_class = LedgerViewSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = JournalEntryLine.objects.select_related('journal_entry')

        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        transaction_type = self.request.query_params.get('transaction_type')

        if search:
            queryset = queryset.filter(
                Q(journal_entry__description__icontains=search) |
                Q(journal_entry__category__icontains=search)
            )

        if category:
            queryset = queryset.filter(
                journal_entry__category__iexact=category)

        if transaction_type:
            queryset = queryset.filter(
                journal_transaction_type__iexact=transaction_type)

        return queryset.order_by('-journal_entry__date')

    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)


@extend_schema(
    tags=['Ledger View'],
    summary="Export ledger entries as CSV",
    description="Exports filtered ledger entries in CSV format. Uses same filters as the ledger list view.",
    parameters=[
        OpenApiParameter(
            name="search", description="Search by description or category", required=False, type=str),
        OpenApiParameter(
            name="category", description="Filter by category (e.g., EXPENSES)", required=False, type=str),
        OpenApiParameter(name="transaction_type",
                         description="Filter by transaction type", required=False, type=str),
    ],
    responses={
        200: OpenApiResponse(
            description='CSV file attachment',
            response=OpenApiTypes.BINARY
        )
    }
)
class LedgerExportView(APIView):
    permission_classes = [IsAuthenticated]
    """
    A GET request to /ledger/export/ will trigger the file download.
    Can attach filters as query parameters: search=, category=, transaction_type=
    The response is a standard Content-Disposition: attachment with CSV format.
    """

    def get(self, request):
        # Optional filters
        search = request.query_params.get('search')
        category = request.query_params.get('category')
        transaction_type = request.query_params.get('transaction_type')

        # Base query
        queryset = JournalEntryLine.objects.select_related('journal_entry')

        if search:
            queryset = queryset.filter(
                Q(journal_entry__description__icontains=search) |
                Q(journal_entry__category__icontains=search)
            )
        if category:
            queryset = queryset.filter(
                journal_entry__category__iexact=category)
        if transaction_type:
            queryset = queryset.filter(
                journal_transaction_type__iexact=transaction_type)

        # CSV response set up - Use standard UTF-8 encoding without BOM
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ledger_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Reference', 'Date', 'Category',
            'Transaction Type', 'Description', 'Amount (PHP)'
        ])

        for line in queryset.order_by('-journal_entry__date'):
            # Clean description and fix encoding
            clean_description = line.journal_entry.description.replace(
                '–', '-')  # en-dash replaced with regular dash
            clean_description = clean_description.replace('\n', ' ').strip()

            # Format amount with thousands separator
            formatted_amount = "{:,.2f}".format(line.amount)

            writer.writerow([
                line.journal_entry.entry_id,
                line.journal_entry.date.strftime('%Y-%m-%d'),
                line.journal_entry.category,
                line.get_journal_transaction_type_display(),
                clean_description,
                formatted_amount
            ])

        return response

# Views of the Journal Entry page


@extend_schema(
    tags=['Journal Entry Page'],
    summary="List Journal Entries",
    parameters=[
            OpenApiParameter(
                "search", str, description="Search by description or reference"),
            OpenApiParameter(
                "category", str, description="Filter by category (e.g., EXPENSES, ASSETS)")
    ],
    responses={200: JournalEntryListSerializer(many=True)}
)
class JournalEntryListView(generics.ListAPIView):
    serializer_class = JournalEntryListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = JournalEntry.objects.all()

        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')

        if search:
            qs = qs.filter(Q(description__icontains=search)
                           | Q(entry_id__icontains=search))

        if category:
            qs = qs.filter(category__iexact=category)

        return qs.order_by('-date')

    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)


@extend_schema(
    tags=['Journal Entry Page'],
    summary="Create a Journal Entry. Make sure to also have two lines (DEBIT,CREDIT)",
    request=JournalEntryCreateSerializer,
    responses={201: OpenApiResponse(
        description="Journal entry created successfully")}
)
# View for Journal Entry Creating
class JournalEntryCreateView(generics.CreateAPIView):
    serializer_class = JournalEntryCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


@extend_schema(
    tags=['Account Dropdown'],
    summary="List Active Accounts",
    description="Returns a list of active accounts for use in journal entry forms or dropdowns.",
    responses={200: OpenApiResponse(
        response=AccountDropdownSerializer(many=True))}
)
class AccountDropdownView(generics.ListAPIView):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = AccountDropdownSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(
    tags=['Journal/Ledger Category Dropdown'],
    methods=['GET'],
    summary="Get Journal Dropdown Choices",
    description="Returns valid options for journal entry categories, transaction types, and journal transaction types.",
    responses={
        200: OpenApiResponse(
            response={
                "categories": ["EXPENSES", "ASSETS", "PROJECTS", "VENDOR_CONTRACTS"],
                "transaction_types": ["DEBIT", "CREDIT"],
                "journal_transaction_types": ["CAPITAL_EXPENDITURE", "OPERATIONAL_EXPENDITURE", "TRANSFER"]
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def journal_choices(request):
    categories = [c[0]
                  for c in JournalEntry._meta.get_field('category').choices]
    transaction_types = [c[0] for c in JournalEntryLine._meta.get_field(
        'transaction_type').choices]
    journal_types = [c[0] for c in JournalEntryLine._meta.get_field(
        'journal_transaction_type').choices]

    return Response({
        "categories": categories,
        "transaction_types": transaction_types,
        "journal_transaction_types": journal_types
    })


@extend_schema(
    tags=['Department Dropdowns'],
    summary="List Departments",
    description="Returns a list of departments for use in filters or dropdowns.",
    responses={200: DepartmentDropdownSerializer(many=True)}
)
class DepartmentDropdownView(generics.ListAPIView):
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentDropdownSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(
    tags=['Account Dropdowns'],
    summary="List Account Types",
    description="Returns all account types for filtering or dropdowns.",
    responses={200: AccountTypeDropdownSerializer(many=True)}
)
class AccountTypeDropdownView(generics.ListAPIView):
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeDropdownSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class BudgetProposalViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides `list`, `retrieve`, `create`, and `update` for BudgetProposal.
    """

    queryset = BudgetProposal.objects.filter(
        is_deleted=False).order_by('-created_at')
    serializer_class = BudgetProposalSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=BudgetProposalSerializer,
        responses={
            201: OpenApiResponse(
                response=BudgetProposalSerializer,
                description="BudgetProposal successfully created"
            ),
            400: OpenApiResponse(description="Validation errors"),
            401: OpenApiResponse(description="Authentication credentials were not provided or invalid"),
        },
        description="""
        Create a new BudgetProposal (and its nested BudgetProposalItem rows) in one call.
        
        The external system must supply:
        1. `title`, `project_summary`, `project_description`, `performance_notes`
        2. `department` (existing Department ID)
        3. `fiscal_year` (existing FiscalYear ID)
        4. `submitted_by_name` (string)
        5. `status`: must be either `"SUBMITTED"`, `"APPROVED"`, or `"REJECTED"`. If `"SUBMITTED"`, `submitted_at` is auto-populated.
        6. `performance_start_date`, `performance_end_date` (YYYY-MM-DD strings, with end > start).
        7. `external_system_id` (string, globally unique for each proposal from that system).
        8. `document` (optional file upload, e.g. Excel/PDF).
        9. `items`: an array of line items; each item is an object with keys:
           - `cost_element` (string)
           - `description` (string)
           - `estimated_cost` (decimal)
           - `account` (PK of existing Account)
           - `notes` (string, optional)
        """,

        examples=[
            OpenApiExample(
                name="Create Budget Proposal",
                value={
                    "title": "Project Alpha",
                    "project_summary": "Summary of Project Alpha",
                    "project_description": "Detailed description of Project Alpha",
                    "performance_notes": "This project will run during the last 2 quarters.",
                    "department": 1,
                    "fiscal_year": 2,
                    "submitted_by_name": "Jane Doe",
                    "status": "SUBMITTED",
                    "performance_start_date": "2025-06-01",
                    "performance_end_date": "2025-12-31",
                    "external_system_id": "EXT12345",
                    "items": [
                        {
                            "cost_element": "CE-4294",
                            "description": "Item description",
                            "estimated_cost": "555",
                            "account": 1,
                            "notes": "Additional notes"
                        }
                    ]
                },
                summary="Example budget proposal payload",
                description="A complete and valid payload for creating a budget proposal with one item."
            )
        ],

        tags=['External Budget Proposals']
    )
    def create(self, request, *args, **kwargs):
        # Manually parse JSON string if 'items' is a raw string in multipart/form-data
        if isinstance(request.data.get('items'), str):
            try:
                request.data._mutable = True  # allow parsing in QueryDict
                request.data['items'] = json.loads(request.data['items'])
            except json.JSONDecodeError:
                return Response(
                    {"items": [
                        "Invalid JSON format. Expected an array of objects."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().create(request, *args, **kwargs)

    @extend_schema(
        request=BudgetProposalSerializer,
        responses={
            200: OpenApiResponse(
                response=BudgetProposalSerializer,
                description="BudgetProposal successfully updated"
            ),
            400: OpenApiResponse(description="Validation errors"),
            401: OpenApiResponse(description="Authentication required"),
            404: OpenApiResponse(description="BudgetProposal not found"),
        },
        description="Update an existing BudgetProposal and/or its items in one call.",
        tags=['External Budget Proposals']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=BudgetProposalSerializer(many=True),
                description="List of BudgetProposals"
            ),
            401: OpenApiResponse(description="Authentication required"),
        },
        tags=['External Budget Proposals']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=BudgetProposalSerializer,
                description="Single BudgetProposal detail"
            ),
            401: OpenApiResponse(description="Authentication required"),
            404: OpenApiResponse(description="Not found"),
        },
        tags=['External Budget Proposals']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


'''
Function that exports the budget proposal to an Excel File

Example:
const handleExportProposal = async (proposalId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/budget-proposals/${proposalId}/export/`,
      {
        method: 'GET',
        headers: {
          // Add the Authorization header here
        },
      }
    );
'''
@extend_schema(
    tags=["Budget Proposal Export"],
    summary="Export a budget proposal to Excel",
    description="Exports the specified BudgetProposal and its items to an Excel file. Example:",
    responses={
        200: OpenApiResponse(description="XLSX file of the proposal"),
        404: OpenApiResponse(description="Proposal not found"),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])

def export_budget_proposal_excel(request, proposal_id):

    try:
        proposal = BudgetProposal.objects.prefetch_related('items', 'department').get(id=proposal_id)
    except BudgetProposal.DoesNotExist:
        return HttpResponse("Proposal not found", status=404)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Budget Proposal"

    # Header section
    header_labels = [
        "Title", "Project Summary", "Project Description",
        "Performance Start", "Performance End", "Performance Notes",
        "Department", "Submitted By", "Status"
    ]
    header_values = [
        proposal.title,
        proposal.project_summary,
        proposal.project_description,
        proposal.performance_start_date.strftime("%Y-%m-%d"),
        proposal.performance_end_date.strftime("%Y-%m-%d"),
        getattr(proposal, 'performance_notes', ''),
        proposal.department.name,
        proposal.submitted_by_name or "N/A",
        proposal.status
    ]
    for i, (label, value) in enumerate(zip(header_labels, header_values), start=1):
        ws.append([label, value])
        ws.cell(row=i, column=1).font = Font(bold=True)  # Bold the header label

    ws.append([])  # Blank row

    # able Header
    table_header = ["Account", "Cost Element", "Description", "Estimated Cost", "Notes"]
    ws.append(table_header)
    table_header_row = ws.max_row
    for col in range(1, len(table_header) + 1):
        ws.cell(row=table_header_row, column=col).font = Font(bold=True)

    # Line Items
    total_cost = 0
    for item in proposal.items.all():
        ws.append([
            item.account.name if item.account else "N/A",
            item.cost_element,
            item.description,
            float(item.estimated_cost),
            item.notes or ""
        ])
        total_cost += item.estimated_cost

    # Total Row
    ws.append([])
    total_row = ws.max_row + 1
    ws.append(["", "", "Total", float(total_cost)])

    # Bold "Total", "Estimated Cost" header, and the summed value
    ws.cell(row=table_header_row, column=4).font = Font(bold=True)  # "Estimated Cost" header
    ws.cell(row=table_header_row, column=5).font = Font(bold=True)  # "Notes" header
    ws.cell(row=total_row, column=3).font = Font(bold=True)         # "Total" label
    ws.cell(row=total_row, column=4).font = Font(bold=True)         # summed value

    # Bold all "Description" column cells (header and values)
    for row in range(table_header_row, ws.max_row + 1):
        ws.cell(row=row, column=3).font = Font(bold=True)

    # Auto size columns
    for col in ws.columns:
        max_length = max(len(str(cell.value)) for cell in col)
        ws.column_dimensions[get_column_letter(col[0].column)].width = max(max_length + 2, 12)

    response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    filename = f"budget_proposal_{proposal.id}.xlsx"
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    wb.save(response)

    return response

class BudgetVarianceReportView(APIView):
    permission_classes = [IsAuthenticated]
    '''
    View for budget variance report page
    '''
    @extend_schema(
        tags=["Budget Variance Reports"],
        summary="Budget Variance Report",
        description="The Budget Variance Report shows how budget allocations are utilized across hierarchical categories such as Income and Expense. For each category, it displays: Budget (total allocated from BudgetAllocation objects), Actual (total approved Expense entries), and Available (Budget minus Actual). A negative Available value indicates overspending. Categories are organized into levels: Level 1 (top-level like INCOME or EXPENSE), Level 2 (groups like DISCRETIONARY or OPERATIONS), and Level 3 (specific items like Cloud Hosting or Utilities). This report helps departments track financial performance and identify areas of over- or under-spending.",
        parameters=[
            OpenApiParameter(name="fiscal_year_id", required=True, type=int)
        ],
        responses={200: ExpenseCategoryVarianceSerializer(many=True)}
    )
    def get(self, request):
        fiscal_year_id = request.query_params.get('fiscal_year_id')
        if not fiscal_year_id:
            return Response({"error": "fiscal_year_id is required"}, status=400)

        try:
            fiscal_year = FiscalYear.objects.get(id=fiscal_year_id)
        except FiscalYear.DoesNotExist:
            return Response({"error": "Fiscal Year not found"}, status=404)

        top_categories = ExpenseCategory.objects.filter(level=1, is_active=True)

        def aggregate_node(category):
            # Direct values
            budget = BudgetAllocation.objects.filter(
                category=category, fiscal_year=fiscal_year, is_active=True
            ).aggregate(total=Coalesce(Sum('amount'), 0, output_field=DecimalField()))['total']

            actual = Expense.objects.filter(
                category=category,
                budget_allocation__fiscal_year=fiscal_year,
                status='APPROVED'
            ).aggregate(total=Coalesce(Sum('amount'), 0, output_field=DecimalField()))['total']

            available = budget - actual
            children = []

            for child in category.subcategories.all():
                children.append(aggregate_node(child))

            # Aggregate child totals if exists
            if children:
                child_budget = sum(c['budget'] for c in children)
                child_actual = sum(c['actual'] for c in children)
                child_available = child_budget - child_actual
                return {
                    "category": category.name,
                    "code": category.code,
                    "level": category.level,
                    "budget": round(child_budget, 2),
                    "actual": round(child_actual, 2),
                    "available": round(child_available, 2),
                    "children": children
                }
            else:
                return {
                    "category": category.name,
                    "code": category.code,
                    "level": category.level,
                    "budget": round(budget, 2),
                    "actual": round(actual, 2),
                    "available": round(available, 2),
                    "children": []
                }
        # Builds nested dictionariers, each representing top level expense categories, and its full budget/actual/available breakdown (and subcategories)
        result = [aggregate_node(cat) for cat in top_categories] # aggregate_node(cat) - recursive function that computes budget, actual, and available amounts for given category (and all its children if any)

        return Response(result)