import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, FileText, User, Mail, Briefcase, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';

// CSS Imports (organized by component) - matching Account Setup
import '../../components/Styles/Layout.css';       // Main layout styles
import '../../components/Header.css';              // Header components
import '../../components/Tables.css';              // Table styles
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState('All Time');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    referenceNo: '',
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    projectSummary: '',
    dueDate: ''
  });
  const itemsPerPage = 5; // Number of transactions per page
  const navigate = useNavigate();

  // User profile data - Same as Dashboard
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Close dropdowns when clicking outside - Same as Dashboard
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample data for expense tracking
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      referenceNo: 'REF-001',
      date: '04-12-2025',
      description: 'Website Redesign Project',
      category: 'Training & Development',
      amount: '₱50,000.00',
      status: 'pending',
      accomplished: false,
      projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project.',
      dueDate: 'April 30, 2025'
    },
    {
      id: 2,
      referenceNo: 'REF-002',
      date: '03-20-2025',
      description: 'Software Subscription',
      category: 'Professional Services',
      amount: '₱15,750.00',
      status: 'approved',
      accomplished: true,
      projectSummary: 'Annual subscription for productivity software suite.',
      dueDate: 'March 31, 2025'
    },
    {
      id: 3,
      referenceNo: 'REF-003',
      date: '03-15-2025',
      description: 'Cloud Hosting',
      category: 'Professional Services',
      amount: '₱12,500.00',
      status: 'paid',
      accomplished: true,
      projectSummary: 'Monthly cloud infrastructure costs for all company applications.',
      dueDate: 'March 20, 2025'
    },
    {
      id: 4,
      referenceNo: 'REF-004',
      date: '02-25-2025',
      description: 'Company Laptops',
      category: 'Equipment & Maintenance',
      amount: '₱450,000.00',
      status: 'approved',
      accomplished: true,
      projectSummary: 'Purchase of new laptops for the engineering team.',
      dueDate: 'February 28, 2025'
    },
    {
      id: 5,
      referenceNo: 'REF-005',
      date: '01-25-2025',
      description: 'Office Printers',
      category: 'Equipment & Maintenance',
      amount: '₱180,000.00',
      status: 'paid',
      accomplished: true,
      projectSummary: 'Acquisition of networked printers for all departments.',
      dueDate: 'January 30, 2025'
    },
    {
      id: 6,
      referenceNo: 'REF-006',
      date: '12-19-2024',
      description: 'AI Workshop Series',
      category: 'Training & Development',
      amount: '₱25,000.00',
      status: 'rejected',
      accomplished: false,
      projectSummary: 'Training program for staff on AI technologies and applications.',
      dueDate: 'December 31, 2024'
    }
  ]);

  // Budget summary data
  const budgetData = {
    remaining: <span style={{ color: '#0d6efd' }}>₱3,326,025.75</span>,
    expensesThisMonth: <span style={{ color: '#0d6efd' }}>₱800,025.75</span>
  };

  // Define categories directly instead of extracting from expenses
  const categories = [
    'All Categories',
    'Travel', 
    'Office Supplies', 
    'Utilities', 
    'Marketing & Advertising', 
    'Professional Services', 
    'Training & Development', 
    'Equipment & Maintenance', 
    'Miscellaneous'
  ];
  
  // Date filter options
  const dateOptions = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'This Year'];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter expenses based on search query, selected category, and date
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Navigation functions - Updated to match Dashboard
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showDateDropdown) setShowDateDropdown(false);
  };

  const toggleDateDropdown = () => {
    setShowDateDropdown(!showDateDropdown);
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
    setShowProfilePopup(false);
  };

  // Updated logout function with navigation to login screen - Same as Dashboard
  const handleLogout = () => {
    try {
      // Clear any stored authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Close the profile popup
      setShowProfilePopup(false);
      
      // Navigate to login screen
      navigate('/login', { replace: true });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error clearing storage
      navigate('/login', { replace: true });
    }
  };

  const handleExpenseSelect = (id) => {
    setSelectedExpenses(prev => 
      prev.includes(id) ? prev.filter(expenseId => expenseId !== id) : [...prev, id]
    );
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleCloseModal = () => {
    setShowAddExpenseModal(false);
    // Reset form
    setNewExpense({
      referenceNo: '',
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
      referenceNo: newExpense.referenceNo,
      date: formattedDate,
      description: newExpense.description,
      category: newExpense.category,
      amount: `₱${parseFloat(newExpense.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      status: 'pending',
      accomplished: false,
      projectSummary: newExpense.projectSummary,
      dueDate: newExpense.dueDate
    };
    
    setExpenses([newExpenseEntry, ...expenses]);
    handleCloseModal();
  };

  return (
    <div className="app-container">
      {/* Header - Copied from Dashboard */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img 
              src={LOGOMAP} 
              alt="BudgetPro Logo" 
              className="logo-image"
            />
          </div>
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
                    onClick={() => handleNavigate('/finance/ledger-view')}
                  >
                    Ledger View
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/journal-entry')}
                  >
                    Budget Allocation
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/budget-variance-report')}
                  >
                    Budget Variance Report
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
          </nav>
        </div>
        
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img src={userProfile.avatar} alt="User avatar" className="avatar-img" />
            </div>
            
            {/* Profile Popup - Same as Account Setup */}
            {showProfilePopup && (
              <div className="profile-popup">
                <div className="profile-popup-header">
                  <button 
                    className="profile-back-btn"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="profile-popup-title">Profile</h3>
                </div>
                
                <div className="profile-popup-content">
                  <div className="profile-avatar-large">
                    <img src={userProfile.avatar} alt="Profile" className="profile-avatar-img" />
                  </div>
                  
                  <div className="profile-info">
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <User size={16} className="profile-field-icon" />
                        <span className="profile-field-label">Name:</span>
                      </div>
                      <span className="profile-field-value">{userProfile.name}</span>
                    </div>
                    
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Mail size={16} className="profile-field-icon" />
                        <span className="profile-field-label">E-mail:</span>
                      </div>
                      <span className="profile-field-value profile-email">{userProfile.email}</span>
                    </div>
                    
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Briefcase size={16} className="profile-field-icon" />
                        <span className="profile-field-label">Role:</span>
                      </div>
                      <span className="profile-field-value profile-role">{userProfile.role}</span>
                    </div>
                  </div>
                  
                  <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="content-container">
        {/* Budget Summary Cards - Moved to top of content */}
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

        {/* Main Content - Using Account Setup structure */}
        <div className="page">
          <div className="container">
            {/* Header Section with Title and Controls - Same as Account Setup */}
            <div className="top">
              <h2 
                style={{ 
                  margin: 0, 
                  fontSize: '29px', 
                  fontWeight: 'bold', 
                  color: '#242424',
                }}
              >
                Expense Tracking 
              </h2>
              
              <div className="header-controls">
                <div className="filter-controls" style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%'
                }}>
                  <input
                    type="text"
                    placeholder="Search expenses"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-account-input"
                    style={{ 
                      width: '350px',
                      minWidth: '300px',
                      maxWidth: '380px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '25px',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      transition: 'all 0.2s ease-in-out',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  
                  {/* Category Filter */}
                  <div 
                    className="filter-dropdown" 
                    style={{ 
                      display: 'inline-block', 
                    }}
                  >
                    <button 
                      className="filter-dropdown-btn" 
                      onClick={toggleCategoryDropdown}
                    >
                      <span>{selectedCategory}</span>
                      <ChevronDown size={19} />
                    </button>
                    {showCategoryDropdown && (
                      <div className="category-dropdown-menu">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className={`category-dropdown-item ${
                              selectedCategory === category ? 'active' : ''
                            }`}
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Status Filter */}
                  <div 
                    className="filter-dropdown" 
                    style={{ 
                      display: 'inline-block', 
                      position: 'relative' 
                    }}
                  >
                    <button 
                      className="filter-dropdown-btn" 
                      onClick={toggleDateDropdown}
                    >
                      <span>Status: {selectedDate}</span>
                      <ChevronDown size={15} />
                    </button>
                    {showDateDropdown && (
                      <div className="category-dropdown-menu">
                        {dateOptions.map((date) => (
                          <div
                            key={date}
                            className={`category-dropdown-item ${
                              selectedDate === date ? 'active' : ''
                            }`}
                            onClick={() => handleDateSelect(date)}
                          >
                            {date}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Budget Button */}
                  <button 
                    className="add-budget-btn" 
                    onClick={handleAddExpense}
                  >
                    <Plus size={16} />
                    Add Budget
                  </button>
                </div>
              </div>
            </div>

            {/* Table - Using Account Setup table structure and styling */}
            <table>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>REF NO.</th>
                  <th style={{ width: '20%' }}>TYPE</th>
                  <th style={{ width: '25%' }}>DESCRIPTION</th>
                  <th style={{ width: '15%' }}>STATUS</th>
                  <th style={{ width: '15%' }}>ACCOMPLISHED</th>
                  <th style={{ width: '10%' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => handleExpenseSelect(expense.id)}
                    style={{ cursor: 'pointer' }}
                    className={selectedExpenses.includes(expense.id) ? 'selected' : ''}
                  >
                    <td>{expense.referenceNo}</td>
                    <td>
                      {expense.category.includes('Equipment') ? 'Assets' : 
                       expense.category.includes('Training') ? 'Expenses' : 'Liabilities'}
                    </td>
                    <td>{expense.description}</td>
                    <td>
                      <span 
                        className={`status-badge ${
                          (expense.status === 'approved' || expense.status === 'paid') ? 'active' : 'inactive'
                        }`}
                      >
                        {(expense.status === 'approved' || expense.status === 'paid') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`accomplished-badge ${
                          expense.accomplished ? 'accomplished' : 'pending'
                        }`}
                      >
                        {expense.accomplished ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{expense.accomplished ? expense.date : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination - Same as Account Setup */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-btn ${
                      currentPage === index + 1 ? 'active' : ''
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
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
              <form onSubmit={handleSubmitExpense} className="budget-form">
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="referenceNo">Reference No.</label>
                    <input 
                      type="text" 
                      id="referenceNo" 
                      name="referenceNo"
                      value={newExpense.referenceNo}
                      onChange={handleInputChange}
                      placeholder="Enter reference number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input 
                      type="text" 
                      id="description" 
                      name="description"
                      value={newExpense.description}
                      onChange={handleInputChange}
                      placeholder="Enter budget description"
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