import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import './LedgerView.css';

function LedgerView() {
  const [currentDate] = useState(new Date('2025-04-14T10:45:00'));
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();

  // Format date and time
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  // Sample transactions data
  const transactions = [
    { reference: 'INV-4321', date: '04/01/2025', description: 'Office Supplies payment', balance: '₱50,000.00' },
    { reference: 'CHK-188', date: '03/08/2024', description: 'Monthly Depreciation', balance: '₱50,000.00' },
    { reference: 'INV-4356', date: '03/26/2024', description: 'Office Supplies Payment', balance: '₱40,000.00' },
    { reference: 'INV-4321', date: '03/26/2024', description: 'Office Supplies Payment', balance: '₱40,000.00' },
    { reference: 'INV-4321', date: '03/26/2024', description: 'Office Supplies Payment', balance: '₱40,000.00' },
  ];

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
    <div className="ledger-view-container">
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
                    className="dropdown-item" 
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
      <main className="ledger-view-main">
        {/* Timestamp */}
        <div className="dashboard-timestamp">
          <div className="timestamp-container">
            <p>{formattedDate} | {formattedTime}</p>
          </div>
        </div>
        
        <h1 className="page-title">Ledger View</h1>

        {/* Search and Filter */}
        <div className="search-filter-container">
          <div className="search-box">
            <input type="text" placeholder="Search Transactions" />
            <button className="search-button">
              <Search size={18} />
            </button>
          </div>

          <div className="filter-container">
            <span>Category: </span>
            <span className="filter-value">All Categories</span>
            <ChevronRight size={16} />
          </div>

          <button className="export-button">Export</button>
        </div>

        {/* Ledger Table */}
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Description</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.reference}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-controls">
          <button className="pagination-btn"><ChevronLeft size={16} /></button>
          <button className="pagination-btn"><ChevronRight size={16} /></button>
        </div>
      </main>
    </div>
  );
}

export default LedgerView;