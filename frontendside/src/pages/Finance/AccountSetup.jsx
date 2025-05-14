import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, Filter } from 'lucide-react';
import './AccountSetup.css';

function AccountSetup() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  // Sample account data matching the UI in the image
  const accounts = [
    { id: 1, code: '0001', type: 'Assets (Current)', description: 'Cash and Cash Equivalents', active: true, accomplished: true },
    { id: 2, code: '0002', type: 'Assets (Current)', description: 'Accounts Receivable', active: true, accomplished: false },
    { id: 3, code: '0003', type: 'Assets (Noncurrent)', description: 'Accounts Receivable', active: true, accomplished: true },
    { id: 4, code: '0004', type: 'Liabilities (Current)', description: 'Accounts Receivable', active: true, accomplished: false },
    { id: 5, code: '0005', type: 'Expenses', description: 'Cash and Cash Equivalents', active: true, accomplished: false },
    { id: 6, code: '0006', type: 'Equity', description: 'Accounts Receivable', active: true, accomplished: true },
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

  const handleAccountSelect = (id) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(accountId => accountId !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const handleCreateAccount = () => {
    navigate('/finance/create-account');
  };

  const handleEditAccount = () => {
    if (selectedAccounts.length === 1) {
      navigate(`/finance/edit-account/${selectedAccounts[0]}`);
    } else {
      alert('Please select exactly one account to edit');
    }
  };

  const handleDeleteAccount = () => {
    if (selectedAccounts.length > 0) {
      // In a real application, you would call an API to delete the accounts
      alert(`Deleting accounts: ${selectedAccounts.join(', ')}`);
      setSelectedAccounts([]);
    } else {
      alert('Please select at least one account to delete');
    }
  };

  const handleExportData = () => {
    // In a real application, you would generate and download a file
    alert('Exporting account data');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <div 
              className="nav-item"
              onClick={() => handleNavigate('/dashboard')}
            >
              Dashboard
            </div>
            
            {/* Budget Dropdown */}
            <div className="dropdown-container">
              <div 
                className="nav-item dropdown-toggle active"
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={16} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
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
                  <div 
                    className="dropdown-item active" 
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
              <div 
                className="nav-item dropdown-toggle"
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={16} />
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
            
            {/* User Management */}
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
            <img src="/api/placeholder/32/32" alt="User avatar" className="avatar-img" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="account-setup-main">
        <h2 className="page-title">Account Setup</h2>
        
        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by project or budget" 
              className="search-input" 
            />
            <Search size={18} className="search-icon" />
          </div>
          <button className="filter-button">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Account Table */}
        <div className="account-table-container">
          <table className="accounts-table">
            <thead>
              <tr className="header-row">
                <th>Account Code</th>
                <th>Account Type</th>
                <th>Account Description</th>
                <th>Active</th>
                <th>Accomplished</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.code}</td>
                  <td>{account.type}</td>
                  <td>{account.description}</td>
                  <td>
                    <div className={`status-pill ${account.active ? 'active' : 'inactive'}`}>
                      {account.active ? 'Yes' : 'No'}
                    </div>
                  </td>
                  <td>
                    <div className={`status-pill ${account.accomplished ? 'accomplished' : 'not-accomplished'}`}>
                      {account.accomplished ? 'Yes' : 'No'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AccountSetup;