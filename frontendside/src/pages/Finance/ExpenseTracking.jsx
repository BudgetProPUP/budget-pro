import React, { useState } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState('All Time');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    projectSummary: '',
    dueDate: ''
  });
  const itemsPerPage = 5; // Number of transactions per page
  const navigate = useNavigate();

  // Sample data for expense tracking
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: '04-12-2025',
      description: 'Website Redesign Project',
      category: 'IT Team',
      amount: '₱50,000.00',
      status: 'pending',
      projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project.',
      dueDate: 'April 30, 2025'
    },
    {
      id: 2,
      date: '03-20-2025',
      description: 'Software Subscription',
      category: 'Software',
      amount: '₱15,750.00',
      status: 'approved',
      projectSummary: 'Annual subscription for productivity software suite.',
      dueDate: 'March 31, 2025'
    },
    {
      id: 3,
      date: '03-15-2025',
      description: 'Cloud Hosting',
      category: 'DevOps',
      amount: '₱12,500.00',
      status: 'paid',
      projectSummary: 'Monthly cloud infrastructure costs for all company applications.',
      dueDate: 'March 20, 2025'
    },
    {
      id: 4,
      date: '02-25-2025',
      description: 'Company Laptops',
      category: 'Hardware',
      amount: '₱450,000.00',
      status: 'approved',
      projectSummary: 'Purchase of new laptops for the engineering team.',
      dueDate: 'February 28, 2025'
    },
    {
      id: 5,
      date: '01-25-2025',
      description: 'Office Printers',
      category: 'Hardware',
      amount: '₱180,000.00',
      status: 'paid',
      projectSummary: 'Acquisition of networked printers for all departments.',
      dueDate: 'January 30, 2025'
    },
    {
      id: 6,
      date: '12-19-2024',
      description: 'AI Workshop Series',
      category: 'IT',
      amount: '₱25,000.00',
      status: 'rejected',
      projectSummary: 'Training program for staff on AI technologies and applications.',
      dueDate: 'December 31, 2024'
    }
  ]);

  // Budget summary data
  const budgetData = {
    remaining: '₱3,326,025.75',
    expensesThisMonth: '₱800,025.75'
  };

  // Get unique categories for the filter dropdown
  const categories = ['All Categories', ...new Set(expenses.map(t => t.category))];
  
  // Date filter options
  const dateOptions = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'This Year'];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter expenses based on search query, selected category, and date
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || expense.category === selectedCategory;
    // In a real app, you would implement date filtering logic here
    const matchesDate = true; // Simplified for now
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDateDropdown) setShowDateDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDateDropdown) setShowDateDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showDateDropdown) setShowDateDropdown(false);
  };

  const toggleDateDropdown = () => {
    setShowDateDropdown(!showDateDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setShowCategoryDropdown(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
    setShowDateDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleCloseModal = () => {
    setShowAddExpenseModal(false);
    // Reset form
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      projectSummary: '',
      dueDate: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    
    // Format date to match the existing format
    const dateParts = newExpense.date.split('-');
    const formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`;
    
    // Add new expense to the list
    const newExpenseEntry = {
      id: expenses.length + 1,
      date: formattedDate,
      description: newExpense.description,
      category: newExpense.category,
      amount: `₱${parseFloat(newExpense.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      status: 'pending',
      projectSummary: newExpense.projectSummary,
      dueDate: newExpense.dueDate
    };
    
    setExpenses([newExpenseEntry, ...expenses]);
    handleCloseModal();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-logo">BUDGETPRO</h1>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>

            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-item ${showBudgetDropdown ? 'active' : ''}`} 
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
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
            <div className="nav-dropdown">
              <div 
                className={`nav-item ${showExpenseDropdown ? 'active' : ''}`} 
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item active"
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

      <div className="content-container">
        <h2 className="page-title">Expense Tracking</h2>

        {/* Search and Filters - Moved to the top */}
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

          <div className="filter-controls">
            {/* Category Filter */}
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleCategoryDropdown}>
                <span>Category</span>
                <ChevronDown size={14} />
              </button>
              {showCategoryDropdown && (
                <div className="category-dropdown-menu">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleDateDropdown}>
                <span>Date</span>
                <ChevronDown size={14} />
              </button>
              {showDateDropdown && (
                <div className="category-dropdown-menu">
                  {dateOptions.map((date, index) => (
                    <div
                      key={index}
                      className={`category-dropdown-item ${selectedDate === date ? 'active' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Expense Button */}
            <button className="add-expense-btn" onClick={handleAddExpense}>
              <Plus size={16} />
              <span>Add Budget</span>
            </button>
          </div>
        </div>
        
        {/* Budget Summary Cards - Moved below the search/filter controls */}
        <div className="budget-summary">
          <div className="budget-card">
            <div className="budget-card-label">
              <p>As of now: May 12, 2025 at 1:05pm</p>
            </div>
            <div className="budget-card-amount">{budgetData.remaining}</div>
            <div className="budget-card-footer">Budget Remaining</div>
          </div>

          <div className="budget-card">
            <div className="budget-card-label">
              <p>This month</p>
            </div>
            <div className="budget-card-amount">{budgetData.expensesThisMonth}</div>
            <div className="budget-card-footer">Total Expenses</div>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Date</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '20%' }}>Category</th>
                <th style={{ width: '25%', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td style={{ textAlign: 'right' }}>{expense.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* Pagination */}
          <div className="pagination-controls">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Budget</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmitExpense}>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input 
                    type="text" 
                    id="description" 
                    name="description"
                    value={newExpense.description}
                    onChange={handleInputChange}
                    placeholder="Enter expense description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select 
                    id="category" 
                    name="category"
                    value={newExpense.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat !== 'All Categories').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="amount">Amount (₱)</label>
                    <input 
                      type="number" 
                      id="amount" 
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input 
                      type="date" 
                      id="date" 
                      name="date"
                      value={newExpense.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>


                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="submit-btn">Add Budget</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;