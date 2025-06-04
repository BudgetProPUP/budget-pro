import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Finance/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Finance/Dashboard';
import AccountSetup from './pages/Finance/AccountSetup';
import LedgerView from './pages/Finance/LedgerView';
import JournalEntry from './pages/Finance/JournalEntry';
import BudgetProposal from './pages/Finance/BudgetProposal';
import ProposalHistory from './pages/Finance/ProposalHistory';
import ExpenseTracking from './pages/Finance/ExpenseTracking';
import ExpenseHistory from './pages/Finance/ExpenseHistory';
import BudgetVarianceReport from './pages/Finance/BudgetVarianceReport';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Separate component for app content that uses AuthProvider
const AppContent = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/finance/account-setup"
          element={<ProtectedRoute><AccountSetup /></ProtectedRoute>}
        />
        <Route
          path="/finance/ledger-view"
          element={<ProtectedRoute><LedgerView /></ProtectedRoute>}
        />
        <Route
          path="/finance/journal-entry"
          element={<ProtectedRoute><JournalEntry /></ProtectedRoute>}
        />
        <Route
          path="/finance/budget-proposal"
          element={<ProtectedRoute><BudgetProposal /></ProtectedRoute>}
        />
        <Route
          path="/finance/proposal-history"
          element={<ProtectedRoute><ProposalHistory /></ProtectedRoute>}
        />
        <Route
          path="/finance/expense-tracking"
          element={<ProtectedRoute><ExpenseTracking /></ProtectedRoute>}
        />
        <Route
          path="/finance/expense-history"
          element={<ProtectedRoute><ExpenseHistory /></ProtectedRoute>}
        />
        <Route
          path="/finance/budget-variance-report"
          element={<ProtectedRoute><BudgetVarianceReport /></ProtectedRoute>}
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;