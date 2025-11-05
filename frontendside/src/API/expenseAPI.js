import budgetApi from './budgetAPI'; // Use the budget_service axios instance

/**
 * Fetches the summary cards for the Expense Tracking page.
 * (Total Expenses, Pending Approval, Budget Total)
 */
export const getExpenseSummary = () => {
    // URL comes from urls.py: name='expense-tracking-summary'
    return budgetApi.get('/expenses/tracking/summary/');
};

/**
 * Fetches the list of expenses for the main tracking table.
 * Supports pagination, search, and filtering.
 * @param {object} params - The query parameters.
 * @param {number} params.page - The page number.
 * @param {string} [params.search] - The search term.
 * @param {string} [params.category__code] - The category code to filter by.
 * @param {string} [params.date_filter] - The date range filter.
 */
export const getExpenseTrackingList = (params) => {
    return budgetApi.get('/expenses/tracking/', { params });
};

/**
 * Fetches the list of past, approved expenses for the history page
 * @param {object} params - The query parameter
 * @param {number} params.page - The page number
 * @param {string} [params.search] - The search term
 * @param {string} [params.category__code] - The category code to filter by
 */
export const getExpenseHistoryList = (params) => {
    return budgetApi.get('/expenses/history/', { params });
};

/**
 * Fetches the details for a single expense, primarily to find its parent proposal
 * Used for the "View" modal in Expense History.
 * @param {number} expenseId - The ID of the expense
 */
export const getExpenseDetailsForModal = (expenseId) => {
    // The <int:pk> in the URL corresponds to the expenseId
    return budgetApi.get(`/expenses/${expenseId}/`);
};

/**
 * Submits a new expense record.
 * @param {object} expenseData - The data for the new expense.
 */
export const createExpense = (expenseData) => {
    return budgetApi.post('/expenses/submit/', expenseData);
};

/**
 * Fetches the list of available expense categories for dropdowns.
 */
export const getExpenseCategories = () => {
    return budgetApi.get('/dropdowns/expense-categories/');
};

/**
 * Fetches the details for a single budget proposal.
 * Used for the "View" modal in Expense History.
 * @param {number} proposalId - The ID of the budget proposal.
 */
export const getProposalDetails = (proposalId) => {
    return budgetApi.get(`/budget-proposals/${proposalId}/`);
};


// Add other necessary functions, like fetching vendors or employees if they become dynamic