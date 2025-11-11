import budgetApi from './budgetAPI';

export const getAccountTypes = () => {
    return budgetApi.get('/dropdowns/account-types/');
};