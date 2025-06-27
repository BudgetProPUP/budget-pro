import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Finance/LoginPage';
import ForgotPasswordPage from './pages/Finance/ForgotPasswordPage'; // This path is now correct
import ResetPasswordPage from './pages/Finance/ResetPasswordPage';
import Dashboard from './pages/Finance/Dashboard';
import LedgerView from './pages/Finance/LedgerView';
import JournalEntry from './pages/Finance/JournalEntry';
import BudgetProposal from './pages/Finance/BudgetProposal';
import ProposalHistory from './pages/Finance/ProposalHistory';
import ExpenseTracking from './pages/Finance/ExpenseTracking';
import ExpenseHistory from './pages/Finance/ExpenseHistory';
import BudgetVarianceReport from './pages/Finance/BudgetVarianceReport';

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  return (
    <Routes>
       <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* ADDED: Route for the reset password link from the email */}
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/finance/ledger-view" element={<ProtectedRoute><LedgerView /></ProtectedRoute>} />
      <Route path="/finance/journal-entry" element={<ProtectedRoute><JournalEntry /></ProtectedRoute>} />
      <Route path="/finance/budget-proposal" element={<ProtectedRoute><BudgetProposal /></ProtectedRoute>} />
      <Route path="/finance/proposal-history" element={<ProtectedRoute><ProposalHistory /></ProtectedRoute>} />
      <Route path="/finance/expense-tracking" element={<ProtectedRoute><ExpenseTracking /></ProtectedRoute>} />
      <Route path="/finance/expense-history" element={<ProtectedRoute><ExpenseHistory /></ProtectedRoute>} />
      <Route path="/finance/budget-variance-report" element={<ProtectedRoute><BudgetVarianceReport /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;