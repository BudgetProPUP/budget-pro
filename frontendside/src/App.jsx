import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/Finance/LoginPage';
import ForgotPasswordPage from './pages/Finance/ForgotPasswordPage'; // Import the ForgotPassword component
import Dashboard from './pages/Finance/Dashboard';
import LedgerView from './pages/Finance/LedgerView';
import JournalEntry from './pages/Finance/JournalEntry';
import BudgetProposal from './pages/Finance/BudgetProposal';
import ProposalHistory from './pages/Finance/ProposalHistory';
import ExpenseTracking from './pages/Finance/ExpenseTracking';
import ExpenseHistory from './pages/Finance/ExpenseHistory';
import BudgetVarianceReport from './pages/Finance/BudgetVarianceReport';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={
            <LoginPage 
              setIsAuthenticated={setIsAuthenticated} 
            />
          } 
        />
      {/* new public route for forgot password */}
        <Route 
          path="/forgot-password" 
          element={<ForgotPasswordPage />} 
        />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />


        <Route 
          path="/finance/ledger-view" 
          element={
            isAuthenticated ? (
              <LedgerView />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/journal-entry" 
          element={
            isAuthenticated ? (
              <JournalEntry />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/budget-proposal" 
          element={
            isAuthenticated ? (
              <BudgetProposal />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/proposal-history" 
          element={
            isAuthenticated ? (
              <ProposalHistory />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/expense-tracking" 
          element={
            isAuthenticated ? (
              <ExpenseTracking />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/expense-history" 
          element={
            isAuthenticated ? (
              <ExpenseHistory />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/finance/budget-variance-report" 
          element={
            isAuthenticated ? (
              <BudgetVarianceReport />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />

        {/* Catch-all route */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;