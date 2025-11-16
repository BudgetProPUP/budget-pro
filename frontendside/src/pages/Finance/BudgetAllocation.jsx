import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut, Bell, Settings, X } from 'lucide-react';
import LOGOMAP from '../../assets/MAP.jpg';
import './BudgetAllocation.css';

// Import ManageProfile component
import ManageProfile from './ManageProfile';

// Pagination Component (copied from LedgerView)
const Pagination = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pageButton ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(i)}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: i === currentPage ? '#007bff' : 'white',
            color: i === currentPage ? 'white' : 'black',
            cursor: 'pointer',
            borderRadius: '4px',
            minWidth: '40px',
            outline: 'none'
          }}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="paginationContainer" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginTop: '20px',
      padding: '10px 0'
    }}>
      {/* Left Side: Page Size Selector */}
      <div className="pageSizeSelector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="pageSize" style={{ fontSize: '14px' }}>Show</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ 
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            outline: 'none'
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '14px' }}>items per page</span>
      </div>

      {/* Right Side: Page Navigation */}
      <div className="pageNavigation" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white', 
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: currentPage === totalPages ? '#f0f0f0' : 'white', 
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

function BudgetAllocation() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showManageProfile, setShowManageProfile] = useState(false); // New state for ManageProfile
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Function to format date as YYYY-MM-DD for input type="date"
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initial form state with current date - REMOVED transactionType field
  const [journalForm, setJournalForm] = useState({
    entryId: 'System generated ID',
    date: formatDateForInput(new Date()),
    category: '',
    account: '',
    description: '',
    amount: ''
  });

  // Sample journal entries data
  const journalEntries = useMemo(() => [
    { id: 'EX-001', date: '05-12-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Internet Bill', amount: 'P8,300' },
    { id: 'AS-001', date: '05-03-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Company Laptops', amount: 'P250,000' },
    { id: 'LI-001', date: '04-21-2025', category: 'Miscellaneous', account: 'Liabilities', description: 'Office Rent', amount: 'P45,000' },
    { id: 'EX-002', date: '04-15-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Electricity Bill', amount: 'P12,750' },
    { id: 'AS-002', date: '04-10-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Office Furniture', amount: 'P85,000' },
    { id: 'EX-003', date: '04-05-2025', category: 'Travel', account: 'Expenses', description: 'Business Trip', amount: 'P15,000' },
    { id: 'EX-004', date: '03-28-2025', category: 'Office Supplies', account: 'Expenses', description: 'Stationery', amount: 'P5,500' },
    { id: 'EX-005', date: '03-20-2025', category: 'Utilities', account: 'Expenses', description: 'Water Bill', amount: 'P3,200' },
  ], []);

  // Category options - Updated with new categories
  const categoryOptions = [
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container') && !event.target.closest('.filter-dropdown')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowCategoryDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter journal entries based on search query and selected category
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.date.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || entry.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, journalEntries]);

  // Pagination logic - Updated to use pageSize state (from LedgerView)
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);

  // Navigation dropdown handlers
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  // New function to handle Manage Profile click
  const handleManageProfile = () => {
    setShowManageProfile(true);
    setShowProfileDropdown(false);
  };

  // New function to close Manage Profile
  const handleCloseManageProfile = () => {
    setShowManageProfile(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  // Updated logout function with navigation to login screen
  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      setShowProfileDropdown(false);
      navigate('/login', { replace: true });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };
  
  const openAddJournalModal = () => {
    setJournalForm({
      ...journalForm,
      date: formatDateForInput(new Date()),
      amount: '' // Reset amount when opening modal
    });
    setShowAddJournalModal(true);
  };
  
  const closeAddJournalModal = () => {
    setShowAddJournalModal(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Allow typing any amount and format as peso
      if (value === '') {
        setJournalForm({
          ...journalForm,
          [name]: ''
        });
      } else {
        // Remove any existing peso symbol and format properly
        const cleanValue = value.replace('₱', '').replace(/,/g, '');
        
        // Only allow numbers and decimal point
        const numericValue = cleanValue.replace(/[^\d.]/g, '');
        
        // Format as peso currency with comma separators
        const formattedValue = `₱${numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        
        setJournalForm({
          ...journalForm,
          [name]: formattedValue
        });
      }
    } else {
      setJournalForm({
        ...journalForm,
        [name]: value
      });
    }
  };

  // Clear amount field
  const clearAmount = () => {
    setJournalForm({
      ...journalForm,
      amount: ''
    });
  };

  // Date and time for Navbar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
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

  return (
    <div className="app-container" style={{ minWidth: '1200px', overflowY: 'auto', height: '100vh' }}>
      {/* Navigation Bar - Preserved as is */}
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
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: 'none' }}
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
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-allocation')}>
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
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: 'none' }}
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
            {/* Timestamp/Date */}
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
                onMouseDown={(e) => e.preventDefault()}
                style={{ position: 'relative', cursor: 'pointer', outline: 'none' }}
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
                    <button 
                      className="clear-all-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ outline: 'none' }}
                    >
                      Clear All
                    </button>
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
                      <button 
                        className="notification-delete" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
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
                      <button 
                        className="notification-delete" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', outline: 'none' }}
              >
                <img src={userProfile.avatar} alt="User avatar" className="profile-image" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
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
                  <div 
                    className="dropdown-item" 
                    onClick={handleManageProfile} // Updated to use new function
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <User size={16} style={{ marginRight: '8px' }} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div 
                      className="dropdown-item" 
                      style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Settings size={16} style={{ marginRight: '8px' }} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div 
                    className="dropdown-item" 
                    onClick={handleLogout} 
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Updated with LedgerView table and pagination layout */}
      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Conditionally render either BudgetAllocation content or ManageProfile */}
        {showManageProfile ? (
          <ManageProfile 
            onClose={handleCloseManageProfile} 
            userProfile={userProfile}
          />
        ) : (
          /* Page Container for everything - Updated with LedgerView styling */
          <div className="ledger-container" style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(80vh - 100px)'
          }}>
            {/* Header Section with Title and Controls - Updated with LedgerView layout */}
            <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="page-title">
                Budget Adjustment 
              </h2>
              
              <div className="controls-container" style={{ display: 'flex', gap: '10px' }}>
                {/* Search Bar - Updated with LedgerView functionality */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-account-input"
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                {/* Category Filter - Updated with LedgerView functionality */}
                <div className="filter-dropdown" style={{ position: 'relative' }}>
                  <button 
                    className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                    onClick={toggleCategoryDropdown}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      backgroundColor: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      outline: 'none'
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
                      zIndex: 1000
                    }}>
                      {categoryOptions.map((category) => (
                        <div
                          key={category}
                          className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(category)}
                          onMouseDown={(e) => e.preventDefault()}
                          style={{ 
                            padding: '8px 12px', 
                            cursor: 'pointer', 
                            backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white',
                            outline: 'none'
                          }}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button className="add-journal-button" onClick={openAddJournalModal} style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  cursor: 'pointer',
                  outline: 'none'
                }}>
                  Modify Budget
                </button>
              </div>
            </div>

            {/* Separator line between title and table - From LedgerView */}
            <div style={{
              height: '1px',
              backgroundColor: '#e0e0e0',
              marginBottom: '20px'
            }}></div>

            {/* Journal Entries Table - Updated with LedgerView table layout (no scroll) */}
            <div style={{ 
              flex: '0 0 auto',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <table className="ledger-table" style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      width: '12%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>TICKET ID</th>
                    <th style={{ 
                      width: '15%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>DATE</th>
                    <th style={{ 
                      width: '21%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>CATEGORY</th>
                    <th style={{ 
                      width: '13%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>ACCOUNT</th>
                    <th style={{ 
                      width: '17%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>DESCRIPTION</th>
                    <th style={{ 
                      width: '10%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        className={index % 2 === 1 ? 'alternate-row' : ''} 
                        style={{ 
                          backgroundColor: index % 2 === 1 ? '#F8F8F8' : '#FFFFFF', 
                          color: '#0C0C0C',
                          height: '50px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fcfcfc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 1 ? '#F8F8F8' : '#FFFFFF';
                        }}
                      >
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.id}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.date}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.category}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.account}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.description}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{entry.amount}</td>
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
                        {searchTerm || selectedCategory !== 'All Categories' 
                          ? 'No budget allocation entries match your search criteria.' 
                          : 'No budget allocation entries found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* New Pagination Component from LedgerView */}
            {filteredEntries.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredEntries.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1); // Reset to first page when page size changes
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </div>
        )}
      </div>

      {/* Add Journal Modal - REMOVED Transaction Type field completely */}
      {showAddJournalModal && (
        <div className="modal-overlay" style={{
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
          <div className="modal-container" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="modal-content" style={{ padding: '24px' }}>
              <h3 className="modal-title" style={{ 
                margin: '0 0 20px 0', 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: '#0C0C0C'
              }}>Modify Budget Entry</h3>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="entryId" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>Entry ID (System generated)</label>
                <input 
                  type="text" 
                  id="entryId" 
                  name="entryId" 
                  value={journalForm.entryId} 
                  disabled 
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
                <span className="helper-text" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>System generated ID</span>
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="date" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>Date</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={journalForm.date} 
                  onChange={handleInputChange} 
                  className="form-control"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
                <span className="helper-text" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>Automatically generated</span>
              </div>
              
              {/* Category Dropdown */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="category" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>Category</label>
                <div className="select-wrapper" style={{ position: 'relative' }}>
                  <select 
                    id="category" 
                    name="category" 
                    value={journalForm.category} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      appearance: 'none',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a category</option>
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Travel">Travel</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Training & Development">Training & Development</option>
                    <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                  <ChevronDown size={16} style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#666'
                  }} />
                </div>
              </div>
              
              {/* Account Dropdown */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="account" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>Account</label>
                <div className="select-wrapper" style={{ position: 'relative' }}>
                  <select 
                    id="account" 
                    name="account" 
                    value={journalForm.account} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      appearance: 'none',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select an Account</option>
                    <option value="asset">Assets</option>
                    <option value="expense">Expenses</option>
                    <option value="liability">Liabilities</option>
                    <option value="revenue">Revenue</option>
                    <option value="equity">Equity</option>
                  </select>
                  <ChevronDown size={16} style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#666'
                  }} />
                </div>
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
                  placeholder="Type here..." 
                  value={journalForm.description} 
                  onChange={handleInputChange} 
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>
              
              {/* REMOVED: Transaction Type Dropdown Section */}
              
              {/* Amount Input with Clear Button - REMOVED HELPER TEXT */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="amount" style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    id="amount" 
                    name="amount" 
                    placeholder="₱0.00" 
                    value={journalForm.amount} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '8px 40px 8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                  {journalForm.amount && (
                    <button
                      type="button"
                      onClick={clearAmount}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: 'none'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <X size={16} color="#666" />
                    </button>
                  )}
                </div>
                {/* REMOVED: The helper text that was here */}
              </div>
              
              {/* Modal Actions */}
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <div className="button-row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-cancel" 
                    onClick={closeAddJournalModal}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      backgroundColor: '#f8f9fa', 
                      color: '#333', 
                      cursor: 'pointer',
                      minWidth: '80px',
                      outline: 'none'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-save"
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      cursor: 'pointer',
                      minWidth: '80px',
                      outline: 'none'
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetAllocation;