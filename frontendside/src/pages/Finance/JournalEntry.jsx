import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut, Bell, Settings } from 'lucide-react';
import LOGOMAP from '../../assets/MAP.jpg';
import './JournalEntry.css';

function JournalEntry() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const itemsPerPage = 5; // Number of journal entries per page
  const navigate = useNavigate();

  // User profile data (same as Dashboard)
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

  // Initial form state with current date
  const [journalForm, setJournalForm] = useState({
    entryId: 'System generated ID',
    date: formatDateForInput(new Date()),
    category: '',
    account: '',
    description: '',
    transactionType: '',
    amount: ''
  });

  // Sample journal entries data
  const journalEntries = [
    { id: 'EX-001', date: '05-12-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Internet Bill', amount: 'P8,300' },
    { id: 'AS-001', date: '05-03-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Company Laptops', amount: 'P250,000' },
    { id: 'LI-001', date: '04-21-2025', category: 'Miscellaneous', account: 'Liabilities', description: 'Office Rent', amount: 'P45,000' },
    { id: 'EX-002', date: '04-15-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Electricity Bill', amount: 'P12,750' },
    { id: 'AS-002', date: '04-10-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Office Furniture', amount: 'P85,000' },
    { id: 'EX-003', date: '04-05-2025', category: 'Travel', account: 'Expenses', description: 'Business Trip', amount: 'P15,000' },
    { id: 'EX-004', date: '03-28-2025', category: 'Office Supplies', account: 'Expenses', description: 'Stationery', amount: 'P5,500' },
    { id: 'EX-005', date: '03-20-2025', category: 'Utilities', account: 'Expenses', description: 'Water Bill', amount: 'P3,200' },
  ];

  // Get unique categories for the filter dropdown
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter journal entries based on search query and selected category
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
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
      // Clear any stored authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Close the profile popup
      setShowProfileDropdown(false);
      
      // Navigate to login screen
      navigate('/login', { replace: true });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error clearing storage
      navigate('/login', { replace: true });
    }
  };
  
  const openAddJournalModal = () => {
    // Set the current date when opening the modal
    setJournalForm({
      ...journalForm,
      date: formatDateForInput(new Date())
    });
    setShowAddJournalModal(true);
  };
  
  const closeAddJournalModal = () => {
    setShowAddJournalModal(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJournalForm({
      ...journalForm,
      [name]: value
    });
  };

  // Date and time for Navbar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    // Update current date/time
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

            {/* Profile Dropdown */}
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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

      {/* Main Content - Updated to place everything inside the ledger container */}
      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Container for everything - All elements now inside the ledger container */}
        <div className="ledger-container" style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 100px)'
        }}>
          {/* Header Section with Title and Controls - Now inside ledger container */}
          <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title">
              Budget Adjustment 
            </h2>
            
            <div className="controls-container" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search by reference, description or category"
                value={searchQuery}
                onChange={handleSearch}
                className="search-account-input"
                style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              
              {/* Category Filter */}
              <div className="filter-dropdown" style={{ position: 'relative' }}>
                <button 
                  className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                  onClick={toggleCategoryDropdown}
                  style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
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
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(category)}
                        style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white' }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="add-journal-button" onClick={openAddJournalModal} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
                Modify Budget
              </button>
            </div>
          </div>

          {/* Separator line between title and table */}
          <div style={{
            height: '1px',
            backgroundColor: '#e0e0e0',
            marginBottom: '20px'
          }}></div>

          {/* Journal Entries Table - Made scrollable */}
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
                    width: '12%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>REFERENCE</th>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>DATE</th>
                  <th style={{ 
                    width: '19%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>CATEGORY</th>
                  <th style={{ 
                    width: '17%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>ACCOUNT</th>
                  <th style={{ 
                    width: '17%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>DESCRIPTION</th>
                  <th style={{ 
                    width: '10%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: 'f8f9fa'
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
                      }}>{entry.id}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{entry.date}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{entry.category}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid ',
                        verticalAlign: 'middle'
                      }}>{entry.account}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{entry.description}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
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
                      No journal entries match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls - Preserved as is */}
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

      {/* Add Journal Modal */}
      {showAddJournalModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <h3 className="modal-title">Modify Budget Entry</h3>
              
              <div className="form-group">
                <label htmlFor="entryId">Entry ID (System generated)</label>
                <input 
                  type="text" 
                  id="entryId" 
                  name="entryId" 
                  value={journalForm.entryId} 
                  disabled 
                  className="form-control"
                />
                <span className="helper-text">System generated ID</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={journalForm.date} 
                  onChange={handleInputChange} 
                  className="form-control"
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <span className="helper-text">Automatically generated</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <div className="select-wrapper">
                  <select 
                    id="category" 
                    name="category" 
                    value={journalForm.category} 
                    onChange={handleInputChange} 
                    className="form-control"
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
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="account">Account</label>
                <div className="select-wrapper">
                  <select 
                    id="account" 
                    name="account" 
                    value={journalForm.account} 
                    onChange={handleInputChange} 
                    className="form-control"
                  >
                    <option value="">Select an Account</option>
                    <option value="asset">Assets</option>
                    <option value="expense">Expenses</option>
                    <option value="liability">Liabilities</option>
                    <option value="revenue">Revenue</option>
                    <option value="equity">Equity</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  placeholder="Type here..." 
                  value={journalForm.description} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="transactionType">Transaction type</label>
                <div className="select-wrapper">
                  <select 
                    id="transactionType" 
                    name="transactionType" 
                    value={journalForm.transactionType} 
                    onChange={handleInputChange} 
                    className="form-control"
                  >
                    <option value="">Select transaction type</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input 
                  type="text" 
                  id="amount" 
                  name="amount" 
                  placeholder="₱0.00" 
                  value={journalForm.amount} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              
              <div className="modal-actions">
                <div className="button-row">
                  <button className="btn-cancel" onClick={closeAddJournalModal}>Cancel</button>
                  <button className="btn-save">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalEntry;