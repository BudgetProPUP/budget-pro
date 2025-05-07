import React, { useState } from 'react';
import './ExpenseHistory.css';
import { Search, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ExpenseHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Sample data that matches your screenshot
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Product Sales Revenue',
      amount: '₱50,000.00',
      balance: '₱40,000.00'
    },
    {
      id: 2,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Software Subscription',
      amount: '₱40,000.00',
      balance: '₱60,000.00'
    },
    {
      id: 3,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Product Sales Revenue',
      amount: '₱50,000.00',
      balance: '₱60,000.00'
    },
    {
      id: 4,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Utility Payment',
      amount: '₱40,000.00',
      balance: '₱60,000.00'
    },
    {
      id: 5,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Client Payment',
      amount: '₱90,000.00',
      balance: '₱10,000.00'
    },
    {
      id: 6,
      postingDate: '07/11/2023',
      transactionDate: '07/11/2023',
      description: 'Product Sales Revenue',
      amount: '₱50,000.00',
      balance: '₱50,000.00'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.amount.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="dashboard-container">
      {/* Header - Copied from Dashboard.jsx */}
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
              <div className="nav-item dropdown-toggle active" onClick={toggleExpenseDropdown}>
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
                    className="dropdown-item active" 
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

      <div className="content-container">
        <h2 className="page-title">Expense History</h2>
        
        <div className="controls-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by project or budget"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>
          
          <button className="filter-btn">
            <span>Filter</span>
          </button>
        </div>
        
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Posting Date</th>
                <th>Transaction Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.postingDate}</td>
                  <td>{transaction.transactionDate}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistory;