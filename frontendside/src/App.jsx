import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/Finance/LoginPage';
import ForgotPasswordPage from './pages/Finance/ForgotPasswordPage'; // Import the ForgotPassword component
import Dashboard from './pages/Finance/Dashboard';
import LedgerView from './pages/Finance/LedgerView';
import BudgetAllocation from './pages/Finance/BudgetAllocation';
import BudgetProposal from './pages/Finance/BudgetProposal';
import ProposalHistory from './pages/Finance/ProposalHistory';
import ExpenseTracking from './pages/Finance/ExpenseTracking';
import ExpenseHistory from './pages/Finance/ExpenseHistory';
import BudgetVarianceReport from './pages/Finance/BudgetVarianceReport';
import { useAuth } from './context/AuthContext'; // Import the custom hook
import ResetPasswordPage from './pages/ResetPasswordPage'; // Correct path


function App() {
  const { isAuthenticated, loading } = useAuth(); 
 
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <Routes>
        {/* Default route: redirect root */}
        <Route 
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/ledger-view" 
          element={isAuthenticated ? <LedgerView /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/budget-allocation" 
          element={isAuthenticated ? <BudgetAllocation /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/budget-proposal" 
          element={isAuthenticated ? <BudgetProposal /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/proposal-history" 
          element={isAuthenticated ? <ProposalHistory /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/expense-tracking" 
          element={isAuthenticated ? <ExpenseTracking /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/expense-history" 
          element={isAuthenticated ? <ExpenseHistory /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/finance/budget-variance-report" 
          element={isAuthenticated ? <BudgetVarianceReport /> : <Navigate to="/login" replace />} 
        />
      </Routes>
  );
}

export default App;