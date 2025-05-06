import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([
    { 
      id: 1, 
      date: '01-25-25', 
      description: 'Software Subscription', 
      category: 'Software', 
      amount: 1500.00,
    },
    { 
      id: 2, 
      date: '01-25-25', 
      description: 'Software Subscription', 
      category: 'Software', 
      amount: 1500.00,
    },
    { 
      id: 3, 
      date: '01-25-25', 
      description: 'Software Subscription', 
      category: 'Software', 
      amount: 1500.00,
    },
  ]);

  // Additional state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for dropdown menus
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Add expense popup state
  const [showAddExpensePopup, setShowAddExpensePopup] = useState(false);
  
  // Form data state
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  });
  
  // Budget and statistics data
  const totalExpenses = 100025.75;
  const budgetRemaining = 100025.75;
  const percentRemaining = 38;
  const pendingApprovals = 1;
  const pendingAmount = 23830.45;
  const topCategory = 'Laptop';
  const topCategoryAmount = 49000.45;
  const topCategoryPercentage = 34;

  // Navigation functions
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
  
  // Add expense functions
  const openAddExpensePopup = () => {
    setShowAddExpensePopup(true);
  };
  
  const closeAddExpensePopup = () => {
    setShowAddExpensePopup(false);
    // Reset form data
    setNewExpense({
      description: '',
      amount: '',
      date: '',
      category: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    // Add the new expense to the list
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    const formattedExpense = {
      id: newId,
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount) || 0
    };
    
    setExpenses([...expenses, formattedExpense]);
    closeAddExpensePopup();
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
      
      <div className="page-content-wrapper">
        <div className="expense-tracking-container">
          <div className="expense-header">
            <h1>Expense Tracking</h1>
            <div className="expense-actions">
              <button className="add-expense-btn" onClick={openAddExpensePopup}>Add Expense</button>
            </div>
          </div>
          
          <div className="filters-container">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search by project or budget"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" size={18} />
            </div>
            
            <div className="filters">
              <div className="filter">
                <span>Sort by</span>
                <ChevronDown size={16} />
              </div>
              <div className="filter">
                <span>Date Range</span>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-header">Total Expenses</div>
              <div className="stats-amount">₱{totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              <div className="stats-subtitle">This month</div>
            </div>
            
            <div className="stats-card">
              <div className="stats-header">Budget Remaining</div>
              <div className="stats-amount">₱{budgetRemaining.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              <div className="stats-subtitle">{percentRemaining}% remaining</div>
            </div>
            
            <div className="stats-card">
              <div className="stats-header">Pending Approvals</div>
              <div className="stats-amount">{pendingApprovals}</div>
              <div className="stats-subtitle">₱{pendingAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
            
            <div className="stats-card">
              <div className="stats-header">Top Category</div>
              <div className="stats-amount">{topCategory}</div>
              <div className="stats-subtitle">₱{topCategoryAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} ({topCategoryPercentage}%)</div>
            </div>
          </div>

          <div className="expenses-table">
            <div className="table-header">
              <div className="header-cell">Date</div>
              <div className="header-cell">Description</div>
              <div className="header-cell">Category</div>
              <div className="header-cell">Amount</div>
            </div>
            
            {expenses.map((expense) => (
              <div className="table-row" key={expense.id}>
                <div className="table-cell">{expense.date}</div>
                <div className="table-cell">{expense.description}</div>
                <div className="table-cell">
                  <span className="category-tag">{expense.category}</span>
                </div>
                <div className="table-cell amount">₱{expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add Expense Popup */}
      {showAddExpensePopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <div className="popup-back" onClick={closeAddExpensePopup}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="popup-title">Add Expense</div>
              <div></div> {/* Empty div for flexbox spacing */}
            </div>
            
            <div className="popup-content">
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  placeholder="Type here" 
                  name="description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Amount</label>
                  <input 
                    type="text" 
                    placeholder="Type here" 
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group half">
                  <label>Date</label>
                  <input 
                    type="text" 
                    placeholder="Type here" 
                    name="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  placeholder="Type here" 
                  name="category"
                  value={newExpense.category}
                  onChange={handleInputChange}
                />
              </div>
              
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;