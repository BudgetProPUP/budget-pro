import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProposalHistory.css';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ProposalHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Sample data for demonstration
  const [proposals, setProposals] = useState([
    {
      id: 'FP-2025-042',
      title: 'IT Infrastructure Upgrade',
      lastModified: 'Apr 01, 2025',
      modifiedBy: 'J. Thompson',
      status: 'approved'
    },
    {
      id: 'FP-2025-042',
      title: 'Facility Expansion Plan',
      lastModified: 'March 30, 2025',
      modifiedBy: 'J. Thompson',
      status: 'rejected'
    },
    {
      id: 'FP-2025-042',
      title: 'Supply Chain optimization',
      lastModified: 'March 28, 2025',
      modifiedBy: 'J. Thompson',
      status: 'approved'
    },
    {
      id: 'FP-2025-042',
      title: 'IT Budget',
      lastModified: 'March 8, 2025',
      modifiedBy: 'J. Thompson',
      status: 'approved'
    },
    {
      id: 'FP-2025-042',
      title: 'IT Budget',
      lastModified: 'Feb 25, 2025',
      modifiedBy: 'J. Thompson',
      status: 'approved'
    },
    {
      id: 'FP-2025-042',
      title: 'IT Budget',
      lastModified: 'Feb 8, 2025',
      modifiedBy: 'J. Thompson',
      status: 'approved'
    }
  ]);

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  {/* Budget Items */}
                  <h4 className="dropdown-category">Budget</h4>
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/budget-proposal')}
                  >
                    Budget Proposal
                  </div>
                 
                  <div 
                    className="dropdown-item active" 
                    onClick={() => handleNavigate('/finance/proposal-history')}
                  >
                    Proposal History
                  </div>

                  {/* Account Items */}
                  <h4 className="dropdown-category">Account</h4>
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/account-setup')}
                  >
                    Account Setup
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/ledger-view')}
                  >
                    Ledger View
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/journal-entry')}
                  >
                    Journal Entries
                  </div>
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleExpenseDropdown}>
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/expense-tracking')}
                  >
                    Expense Tracking
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('/finance/expense-history')}
                  >
                    Expense History
                  </div>
                </div>
              )}
            </div>
            
            {/* User Management - Simple Navigation Item */}
            <div 
              className="nav-item"
              onClick={() => handleNavigate('/finance/user-management')}
            >
              User Management
            </div>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-avatar">
            <img src="/api/placeholder/36/36" alt="User avatar" className="avatar-img" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="proposal-history-container">
        <div className="proposal-header">
          <h2>Proposal History</h2>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-item">
            <span className="filter-label">Filter by Account Type</span>
            <ChevronRight size={16} />
          </div>
          <div className="filter-item department-filter">
            <span>Department</span>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Table */}
        <div className="proposal-table-container">
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Proposal ID</th>
                <th>Title</th>
                <th>Last Modified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal, index) => (
                <tr key={index}>
                  <td>{proposal.id}</td>
                  <td>{proposal.title}</td>
                  <td>
                    <div>{proposal.lastModified}</div>
                    <div className="modified-by">by {proposal.modifiedBy}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status === 'approved' ? 'Approved' : 
                       proposal.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProposalHistory;