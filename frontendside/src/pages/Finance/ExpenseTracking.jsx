import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, FileText, User, Mail, Briefcase, LogOut, Bell, Settings, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [_selectedDate, setSelectedDate] = useState('All Time');
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
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update current date/time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Format date and time for display - Updated to include day of week
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && 
          !event.target.closest('.profile-container') &&
          !event.target.closest('.notification-container') &&
          !event.target.closest('.filter-dropdown')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setShowCategoryDropdown(false);
        setShowDateDropdown(false);
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

  // Budget summary data - Updated to match the BudgetProposal format
  const budgetData = {
    totalProposals: 6,
    pendingApproval: 3,
    budgetTotal: '₱3,326,025.75'
  };

  // Define categories directly instead of extracting from expenses
  const categories = [
    'All Categories',
    'Travel',
    'Office Supplies',
    'Utilities',
    'Marketing',
    'Professional Services',
    'Training & Development',
    'Maintenance',
    'Miscellaneous'
  ];
  
  // Date filter options
  const _dateOptions = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'This Year'];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filter expenses based on search query, selected category, and date
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || expense.category === selectedCategory;
    const matchesDate = true;
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

  // Navigation functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showDateDropdown) setShowDateDropdown(false);
  };

  const _toggleDateDropdown = () => {
    setShowDateDropdown(!showDateDropdown);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const _handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    setShowDateDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      setShowProfileDropdown(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
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
    
    const dateParts = newExpense.date.split('-');
    const formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`;
    
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
    <div className="app-container" style={{ minWidth: '1200px', overflowY: 'auto', height: '100vh' }}>
      {/* Navigation Bar - Preserved as requested */}
      <nav className="navbar" style={{ position: 'static', marginBottom: '20px' }}>
        <div className="navbar-content" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 20px',
          height: '60px'
        }}>
          {/* Logo and System Name */}
          <div className="navbar-brand" style={{
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            overflow: 'hidden',
            gap: '12px'
          }}>
            <div style={{
              height: '45px',
              width: '45px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff'
            }}>
              <img
                src={LOGOMAP}
                alt="System Logo"
                className="navbar-logo"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <span className="system-name" style={{
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--primary-color, #007bff)'
            }}>BudgetPro</span>
          </div>

          {/* Main Navigation Links */}
          <div className="navbar-links" style={{ display: 'flex', gap: '20px' }}>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showBudgetDropdown ? 'active' : ''}`}
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} className={`dropdown-arrow ${showBudgetDropdown ? 'rotated' : ''}`} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Budget Allocation
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showExpenseDropdown ? 'active' : ''}`}
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} className={`dropdown-arrow ${showExpenseDropdown ? 'rotated' : ''}`} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-tracking')}>
                    Expense Tracking
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>
                    Expense History
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Timestamp/Date - Updated format */}
            <div className="date-time-badge" style={{
              background: '#f3f4f6',
              borderRadius: '16px',
              padding: '4px 14px',
              fontSize: '0.95rem',
              color: '#007bff',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              {formattedDay}, {formattedDate} | {formattedTime}
            </div>

            {/* Notification Icon */}
            <div className="notification-container">
              <div 
                className="notification-icon"
                onClick={toggleNotifications}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <Bell size={20} />
                <span className="notification-badge" style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>3</span>
              </div>
              
              {showNotifications && (
                <div className="notification-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '300px',
                  zIndex: 1000
                }}>
                  <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3>Notifications</h3>
                    <button className="clear-all-btn">Clear All</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item" style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div className="notification-icon-wrapper" style={{ marginRight: '10px' }}>
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div className="notification-title" style={{ fontWeight: 'bold' }}>Budget Approved</div>
                        <div className="notification-message">Your Q3 budget has been approved</div>
                        <div className="notification-time" style={{ fontSize: '12px', color: '#666' }}>2 hours ago</div>
                      </div>
                      <button className="notification-delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div className="notification-item" style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div className="notification-icon-wrapper" style={{ marginRight: '10px' }}>
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div className="notification-title" style={{ fontWeight: 'bold' }}>Expense Report</div>
                        <div className="notification-message">New expense report needs review</div>
                        <div className="notification-time" style={{ fontSize: '12px', color: '#666' }}>5 hours ago</div>
                      </div>
                      <button className="notification-delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown - Removed arrow icon */}
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <img src={userProfile.avatar} alt="User avatar" className="profile-image" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                {/* Removed the ChevronDown icon */}
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '250px',
                  zIndex: 1000
                }}>
                  <div className="profile-info-section" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img src={userProfile.avatar} alt="Profile" className="profile-dropdown-image" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                    <div className="profile-details">
                      <div className="profile-name" style={{ fontWeight: 'bold' }}>{userProfile.name}</div>
                      <div className="profile-role-badge" style={{ backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', display: 'inline-block' }}>{userProfile.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                    <User size={16} style={{ marginRight: '8px' }} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                      <Settings size={16} style={{ marginRight: '8px' }} />
                      <span>User Management</span>
                  </div>
                  )}
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div className="dropdown-item" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container - Updated with BudgetProposal layout */}
      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Budget Summary Cards - Updated to match BudgetProposal format */}
        <div className="budget-summary" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Expenses</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.totalProposals}</div>
          </div>

          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Pending Approval</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.pendingApproval}</div>
          </div>

          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Budget Total</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.budgetTotal}</div>
          </div>
        </div>

        {/* Main Content - Updated with BudgetProposal layout */}
        <div className="ledger-container" style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 240px)'
        }}>
          {/* Header Section with Title and Controls */}
          <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0, fontSize: '29px', fontWeight: 'bold', color: '#0C0C0C' }}>
              Expense Tracking {/* Removed the count number */}
            </h2>
            
            <div className="controls-container" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="search-container" style={{ position: 'relative' }}>
                {/* Removed the Search icon */}
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-account-input"
                  style={{ 
                    padding: '8px 12px', /* Removed left padding for the icon */
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    width: '250px'
                  }}
                />
                {searchQuery && (
                  <X 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      cursor: 'pointer',
                      color: '#6b7280'
                    }} 
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
              
              {/* Added spacing between search bar and filter button */}
              <div style={{ width: '20px' }}></div>
              
              {/* Category Filter */}
              <div className="filter-dropdown" style={{ position: 'relative' }}>
                <button 
                  className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                  onClick={toggleCategoryDropdown}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    minWidth: '150px',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown size={14} />
                </button>
                {showCategoryDropdown && (
                  <div className="category-dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`category-dropdown-item ${
                          selectedCategory === category ? 'active' : ''
                        }`}
                        onClick={() => handleCategorySelect(category)}
                        style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer', 
                          backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white' 
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Removed the Date Filter button */}

              {/* Add Budget Button with white plus icon */}
              <button 
                className="add-budget-btn" 
                onClick={handleAddExpense}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary-color, #007bff)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '36px'
                }}
              >
                <Plus size={16} color="#FFFFFF" />
                Add Budget
              </button>
            </div>
          </div>

          {/* Separator line between title and table */}
          <div style={{
            height: '1px',
            backgroundColor: '#e0e0e0',
            marginBottom: '20px'
          }}></div>

          {/* Expenses Table - Made scrollable */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '4px'
          }}>
            <table className="ledger-table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>REF NO.</th>
                  <th style={{ 
                    width: '20%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>TYPE</th>
                  <th style={{ 
                    width: '25%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>DESCRIPTION</th>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>STATUS</th>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>ACCOMPLISHED</th>
                  <th style={{ 
                    width: '10%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense, index) => (
                    <tr
                      key={expense.id}
                      onClick={() => handleExpenseSelect(expense.id)}
                      className={`${index % 2 === 1 ? 'alternate-row' : ''} ${selectedExpenses.includes(expense.id) ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: index % 2 === 1 ? '#F8F8F8' : '#FFFFFF', 
                        color: '#0C0C0C',
                        height: '50px',
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D1D5DB'; // Gray 300
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 1 ? '#F8F8F8' : '#FFFFFF';
                      }}
                    >
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{expense.referenceNo}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid ',
                        verticalAlign: 'middle'
                      }}>
                        {expense.category.includes('Equipment') ? 'Assets' : 
                         expense.category.includes('Training') ? 'Expenses' : 'Liabilities'}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{expense.description}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>
                        <span 
                          className={`status-badge ${
                            (expense.status === 'approved' || expense.status === 'paid') ? 'active' : 'inactive'
                          }`}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: (expense.status === 'approved' || expense.status === 'paid') ? '#D1FAE5' : '#FEE2E2',
                            color: (expense.status === 'approved' || expense.status === 'paid') ? '#065F46' : '#991B1B'
                          }}
                        >
                          {(expense.status === 'approved' || expense.status === 'paid') ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>
                        <span 
                          className={`accomplished-badge ${
                            expense.accomplished ? 'accomplished' : 'pending'
                          }`}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: expense.accomplished ? '#D1FAE5' : '#FEF3C7',
                            color: expense.accomplished ? '#065F46' : '#92400E'
                          }}
                        >
                          {expense.accomplished ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{expense.accomplished ? expense.date : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results" style={{ 
                      padding: '20px', 
                      textAlign: 'center',
                      height: '50px',
                      verticalAlign: 'middle'
                    }}>
                      No expenses match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls - Preserved as requested */}
          {totalPages > 1 && (
            <div className="pagination" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '5px',
              marginTop: '20px',
              padding: '10px 0'
            }}>
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
                style={{ padding: '8px 12px', border: '1px solid #ccc', backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
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
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #ccc', 
                    backgroundColor: currentPage === index + 1 ? '#007bff' : 'white',
                    color: currentPage === index + 1 ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
                style={{ padding: '8px 12px', border: '1px solid #ccc', backgroundColor: currentPage === totalPages ? '#f0f0f0' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h3 style={{ margin: 0 }}>Add Budget</h3>
              <button className="modal-close-btn" onClick={handleCloseModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div className="modal-content" style={{ padding: '24px' }}>
              <form onSubmit={handleSubmitExpense} className="budget-form">
                <div className="form-section">
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="referenceNo" style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>Reference No.</label>
                    <input 
                      type="text" 
                      id="referenceNo" 
                      name="referenceNo"
                      value={newExpense.referenceNo}
                      onChange={handleInputChange}
                      placeholder="Enter reference number"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="description" style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>Description</label>
                    <input 
                      type="text" 
                      id="description" 
                      name="description"
                      value={newExpense.description}
                      onChange={handleInputChange}
                      placeholder="Enter budget description"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="category" style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>Category</label>
                    <select 
                      id="category" 
                      name="category"
                      value={newExpense.category}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select a category</option>
                      {categories.filter(cat => cat !== 'All Categories').map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row" style={{ 
                    display: 'flex', 
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="amount" style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: '500'
                      }}>Amount (₱)</label>
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
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="date" style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: '500'
                      }}>Date</label>
                      <input 
                        type="date" 
                        id="date" 
                        name="date"
                        value={newExpense.date}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-actions" style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px'
                  }}>
                    <button type="button" className="cancel-btn" onClick={handleCloseModal} style={{
                      padding: '8px 16px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}>Cancel</button>
                    <button type="submit" className="submit-btn" style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      cursor: 'pointer'
                    }}>Add Budget</button>
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