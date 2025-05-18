import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProposalHistory.css';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ProposalHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [proposals] = useState([
    {
      id: 'FP-2025-042',
      title: 'IT Infrastructure Upgrade',
      lastModified: '04-12-2025',
      modifiedBy: 'J.Thompson',
      status: 'approved',
    },
    {
      id: 'FP-2025-942',
      title: 'Facility Expansion Plan',
      lastModified: '04-12-2025',
      modifiedBy: 'A.Williams',
      status: 'approved',
    },
    {
      id: 'FP-2025-128',
      title: 'DevOps Certification',
      lastModified: '03-25-2025',
      modifiedBy: 'L.Chen',
      status: 'rejected',
    },
    {
      id: 'FP-2025-367',
      title: 'IT Budget',
      lastModified: '02-14-2025',
      modifiedBy: 'K.Thomas',
      status: 'approved',
    },
    {
      id: 'FP-2025-002',
      title: 'Server Racks',
      lastModified: '01-25-2025',
      modifiedBy: 'A.Ford',
      status: 'approved',
    },
    {
      id: 'FP-2024-042',
      title: 'Company Laptops',
      lastModified: '12-12-2024',
      modifiedBy: 'A.Ford',
      status: 'approved',
    },
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
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>

          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>

            {/* Budget Dropdown */}
            <div className="dropdown">
              <button
                className="dropdown-toggle"
                onClick={toggleBudgetDropdown}
                aria-haspopup="true"
                aria-expanded={showBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </button>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Budget</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item active" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  <div className="dropdown-header">Account</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>
                    Account Setup
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Journal Entries
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="dropdown">
              <button
                className="dropdown-toggle"
                onClick={toggleExpenseDropdown}
                aria-haspopup="true"
                aria-expanded={showExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </button>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-tracking')}>
                    Expense Tracking
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>
                    Expense History
                  </div>
                </div>
              )}
            </div>

            {/* User Management */}
            <div className="nav-link" onClick={() => handleNavigate('/finance/user-management')}>
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