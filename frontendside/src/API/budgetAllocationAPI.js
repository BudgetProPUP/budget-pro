import budgetApi from './budgetAPI';

/**
 * Fetches a paginated and filtered list of budget adjustments (journal entries).
 * @param {object} params - Query parameters.
 */
export const getBudgetAdjustments = (params) => {
  // MODIFICATION START: Point to the correct, existing URL for Journal Entries
  return budgetApi.get('/journal-entries/', { params });
  // MODIFICATION END
};

/**
 * Creates a new journal entry for a budget adjustment
 * @param {object} data - The data for the new journal entry from the modal
 */
export const createJournalEntry = (data) => {
  // This points to the existing view for creating journal entries
  return budgetApi.post('/journal-entries/create/', data);
};