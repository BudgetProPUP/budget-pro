import React, { useState } from 'react';
import { Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  // Navigation state and functions
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Expense data
  const [expenses, setExpenses] = useState([
    { 
      id: 1, 
      date: '04-12-2025', 
      description: 'Website Redesign Project', 
      category: 'IT Team', 
      amount: 50000.00,
    },
    { 
      id: 2, 
      date: '03-15-2025', 
      description: 'Cloud Hosting', 
      category: 'DevOps', 
      amount: 12500.00,
    },
    { 
      id: 3, 
      date: '02-25-2025', 
      description: 'Company Laptops', 
      category: 'Hardware', 
      amount: 450000.00,
    },
    { 
      id: 4, 
      date: '12-19-2024', 
      description: 'AI Workshop Series', 
      category: 'IT', 
      amount: 25000.00,
    },
  ]);

  // Budget data
  const BUDGET_REMAINING = 3326025.75;
  const TOTAL_EXPENSES = 800025.75;
  const currentDate = 'May 12, 2025 at 1:06pm';
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // Popup states
  const [showAddExpensePopup, setShowAddExpensePopup] = useState(false);
  const [showAddBudgetPopup, setShowAddBudgetPopup] = useState(false);
  
  // Form states
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  });
  
  const [newBudget, setNewBudget] = useState({
    amount: ''
  });
  
  // Expense functions
  const openAddExpensePopup = () => setShowAddExpensePopup(true);
  
  const closeAddExpensePopup = () => {
    setShowAddExpensePopup(false);
    setNewExpense({
      description: '',
      amount: '',
      date: '',
      category: ''
    });
  };
  
  // Budget functions
  const openAddBudgetPopup = () => setShowAddBudgetPopup(true);
  
  const closeAddBudgetPopup = () => {
    setShowAddBudgetPopup(false);
    setNewBudget({ amount: '' });
  };
  
  const handleBudgetInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget({
      ...newBudget,
      [name]: value
    });
  };
  
  const handleSaveBudget = () => {
    console.log('New budget amount:', newBudget.amount);
    closeAddBudgetPopup();
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
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
    <div className="app-container expanded-view">
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
                  <h4 className="dropdown-category">Budget</h4>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>

                  <h4 className="dropdown-category">Account</h4>
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
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle active" onClick={toggleExpenseDropdown}>
                Expense <ChevronDown size={14} />
              </div>
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
            <div className="nav-item" onClick={() => handleNavigate('/finance/user-management')}>
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

      <div className="page-content-wrapper expanded-content">
        <div className="expense-tracking-container wide-view">
          {/* Action Bar */}
          <div className="action-bar">
            <div className="search-container expanded-search">
              <div className="search-bar">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by project or budget"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="filters">
                <button className="filter-btn">
                  <span>Filter by:</span>
                </button>
                <button className="category-btn">
                  <span>Category</span>
                  <ChevronDown size={14} />
                </button>
                <button className="date-btn">
                  <span>Date</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            
            <button className="filter-btn add-expense-btn" onClick={openAddExpensePopup}>
              + Add Expense
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards horizontal">
            <div className="summary-card budget-card" onClick={openAddBudgetPopup}>
              <div className="budget-amount">
                <span className="currency">₱</span>{BUDGET_REMAINING.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="budget-label">Budget Remaining</div>
              <div className="budget-date">As of now: {currentDate}</div>
            </div>
            
            <div className="summary-card expense-card">
              <div className="expense-amount">
                <span className="currency">₱</span>{TOTAL_EXPENSES.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="expense-label">Total Expenses</div>
              <div className="expense-period">This month</div>
            </div>
          </div>

          {/* Expense Table Section */}
          <div className="expense-section">
            <div className="section-header">
              <h2>Expense Tracking</h2>
              <div className="code-indicator">
                <span className="code-icon">&lt;/&gt;</span>
              </div>
            </div>
            
            <div className="expense-table-container">
              <table className="expense-table wide">
                <thead>
                  <tr>
                    <th className="header-cell date-cell">Date</th>
                    <th className="header-cell desc-cell">Description</th>
                    <th className="header-cell category-cell">Category</th>
                    <th className="header-cell amount-cell">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr className="table-row" key={expense.id}>
                      <td className="table-cell date-cell">{expense.date}</td>
                      <td className="table-cell desc-cell">{expense.description}</td>
                      <td className="table-cell category-cell">{expense.category}</td>
                      <td className="table-cell amount-cell">₱{expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                  <tr className="table-row empty-row">
                    <td className="table-cell" colSpan="3"></td>
                    <td className="table-cell">₱0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <button className="pagination-btn prev-btn">
                &lt; Prev
              </button>
              <div className="page-numbers">
                <button className="page-number active">1</button>
              </div>
              <button className="pagination-btn next-btn">
                Next &gt;
              </button>
            </div>
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
              <div></div>
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

      {/* Add Budget Popup */}
      {showAddBudgetPopup && (
        <div className="popup-overlay">
          <div className="popup-container add-budget-popup">
            <div className="popup-header">
              <div className="popup-back" onClick={closeAddBudgetPopup}>
                <ArrowLeft size={20} />
              </div>
              <div className="popup-title">Add Budget</div>
              <div></div>
            </div>
            
            <div className="popup-content">
              <div className="budget-date-display">
                {currentDate}
              </div>
              
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="text" 
                  placeholder="₱0.00"
                  name="amount"
                  value={newBudget.amount}
                  onChange={handleBudgetInputChange}
                />
              </div>
              
              <button className="save-budget-btn" onClick={handleSaveBudget}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;