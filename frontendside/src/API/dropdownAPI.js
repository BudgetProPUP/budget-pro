import budgetApi from './budgetAPI';

export const getAccountTypes = () => {
    return budgetApi.get('/dropdowns/account-types/');
};

/**
 * Fetches choices for journal entry fields like category.
 */
export const getJournalChoices = () => {
    return budgetApi.get('/dropdowns/journal-choices/');
};


export const getAccounts = () => {
    return budgetApi.get('/dropdowns/accounts/');
};