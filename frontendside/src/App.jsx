import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Finance/LoginPage';
import Dashboard from './pages/Finance/Dashboard';
import AccountSetup from './pages/Finance/AccountSetup';
import LedgerView from './pages/Finance/LedgerView';
import JournalEntry from './pages/Finance/JournalEntry';
import BudgetProposal from './pages/Finance/BudgetProposal';
import ProposalHistory from './pages/Finance/ProposalHistory';
import ExpenseTracking from './pages/Finance/ExpenseTracking';
import ExpenseHistory from './pages/Finance/ExpenseHistory';
import UserManagement from './pages/Finance/User Management';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route - Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Existing Finance Routes */}
        <Route path="/finance/account-setup" element={<AccountSetup />} />
        <Route path="/finance/ledger-view" element={<LedgerView />} />
        <Route path="/finance/journal-entry" element={<JournalEntry />} />
        <Route path="/finance/budget-proposal" element={<BudgetProposal />} />

        {/* New Finance Routes */}
        <Route path="/finance/proposal-history" element={<ProposalHistory />} />
        <Route path="/finance/expense-tracking" element={<ExpenseTracking />} />
        <Route path="/finance/expense-history" element={<ExpenseHistory />} />
        <Route path="/finance/user-management" element={<UserManagement />} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

         {/* Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;