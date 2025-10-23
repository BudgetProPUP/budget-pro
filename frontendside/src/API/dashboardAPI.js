// 1. Import the correctly named budgetApi instance
import budgetApi from './budgetAPI'; 

/**
 * Fetches the main budget summary cards data.
 */
export const getBudgetSummary = () => {
    // 2. Use 'budgetApi' for all calls
    return budgetApi.get('/dashboard/budget-summary/');
};

/**
 * Fetches the data for the Money Flow chart (Budget vs Actual).
 * @param {number} fiscalYearId - The ID of the fiscal year.
 */
export const getMoneyFlowData = (fiscalYearId) => {
    // Use 'budgetApi'
    return budgetApi.get('/dashboard/overall-monthly-flow/', {
        params: { fiscal_year_id: fiscalYearId }
    });
};

/**
 * Fetches the budget forecast data.
 * @param {number} fiscalYearId - The ID of the fiscal year.
 */
export const getForecastData = (fiscalYearId) => {
    // Use 'budgetApi'
    return budgetApi.get('/dashboard/forecast/', {
        params: { fiscal_year_id: fiscalYearId }
    });
};

/**
 * Fetches data for the Budget per Category pie chart.
 */
export const getCategoryBudgetData = () => {
    // Use 'budgetApi'
    return budgetApi.get('/dashboard/category-budget-status/');
};

/**
 * Fetches data for the "View Details" section of the budget per category module.
 */
export const getDepartmentBudgetData = () => {
    // Use 'budgetApi'
    return budgetApi.get('/dashboard/department-status/');
};

/**
 * Fetches the list of projects for the dashboard table.
 * @param {number} page - The page number for pagination.
 */
export const getProjectStatusList = (page = 1) => {
    // Use 'budgetApi'
    return budgetApi.get('/dashboard/project-status/', {
        params: { page }
    });
};

/**
 * Fetches detailed information for a single project.
 * @param {number} projectId - The ID of the project.
 */
export const getProjectDetails = (projectId) => {
    // Use 'budgetApi'
    return budgetApi.get(`/dashboard/projects/${projectId}/`);
};