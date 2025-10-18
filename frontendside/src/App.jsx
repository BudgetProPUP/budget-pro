import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    // Temporary Fix, Redo later
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
        {/* <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        /> */}
        <Route 
          path="/dashboard" 
          element={<Dashboard />} 
        />

        <Route 
          path="/finance/ledger-view" 
          element={<LedgerView />} 
        />

        <Route 
          path="/finance/budget-allocation" 
          element={<BudgetAllocation />} 
        />

        <Route 
          path="/finance/budget-proposal" 
          element={<BudgetProposal />} 
        />

        <Route 
          path="/finance/proposal-history" 
          element={<ProposalHistory />} 
        />

        <Route 
          path="/finance/expense-tracking" 
          element={<ExpenseTracking />} 
        />

        <Route 
          path="/finance/expense-history" 
          element={<ExpenseHistory />} 
        />

        <Route 
          path="/finance/budget-variance-report" 
          element={<BudgetVarianceReport />} 
        />
      </Routes>
    </Router>
  );
}

export default App;