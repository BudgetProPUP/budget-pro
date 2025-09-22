import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, User, LogOut, Bell, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './ExpenseHistory.css'; 

const ExpenseHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

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

  // Sample data
  const [transactions] = useState([
    {
      id: 1,
      date: '04-12-2025',
      description: 'Website Redesign Project',
      category: 'Training & Development',
      amount: '₱50,000.00',
      projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.',
      projectDescription: 'Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and enhanced e-commerce capabilities to boost customer engagement and sales conversion.',
      costElements: [
        { type: 'Hardware', description: 'Workstations, Servers, Testing Devices', cost: '₱25,000.00' },
        { type: 'Software', description: 'Design Tools, Development Platforms, Licenses', cost: '₱25,000.00' }
      ],
      dueDate: 'April 30, 2025'
    },
    {
      id: 2,
      date: '03-20-2025',
      description: 'Software Subscription',
      category: 'Professional Services',
      amount: '₱15,750.00',
      projectSummary: 'Annual subscription for productivity software suite.',
      projectDescription: 'Renewal of organization-wide productivity software licenses including project management tools, communication platforms, and development environments.',
      costElements: [
        { type: 'Software', description: 'Annual Software License', cost: '₱15,750.00' }
      ],
      dueDate: 'March 31, 2025'
    },
    {
      id: 3,
      date: '03-15-2025',
      description: 'Cloud Hosting',
      category: 'Professional Services',
      amount: '₱25,500.00',
      projectSummary: 'Monthly cloud infrastructure costs for all company applications.',
      projectDescription: 'Cloud hosting services including compute instances, database services, storage, and networking components to support our application ecosystem.',
      costElements: [
        { type: 'Service', description: 'Cloud Platform Services', cost: '₱25,500.00' }
      ],
      dueDate: 'March 20, 2025'
    },
    {
      id: 4,
      date: '02-25-2025',
      description: 'Company Laptops',
      category: 'Equipment & Maintenance',
      amount: '₱480,000.00',
      projectSummary: 'Purchase of new laptops for the engineering team.',
      projectDescription: 'Replacement of outdated hardware with high-performance laptops for the development and design teams to improve productivity.',
      costElements: [
        { type: 'Hardware', description: 'Development Laptops (15 units)', cost: '₱400,000.00' },
        { type: 'Software', description: 'Required OS and Software Licenses', cost: '₱80,000.00' }
      ],
      dueDate: 'February 28, 2025'
    },
    {
      id: 5,
      date: '01-25-2025',
      description: 'Office Printers',
      category: 'Equipment & Maintenance',
      amount: '₱180,000.00',
      projectSummary: 'Acquisition of networked printers for all departments.',
      projectDescription: 'Purchase of high-capacity networked printers to replace aging equipment and reduce maintenance costs.',
      costElements: [
        { type: 'Hardware', description: 'Networked Printers (6 units)', cost: '₱150,000.00' },
        { type: 'Supplies', description: 'Initial Supply of Consumables', cost: '₱30,000.00' }
      ],
      dueDate: 'January 30, 2025'
    },
    {
      id: 6,
      date: '12-19-2024',
      description: 'AI Workshop Series',
      category: 'Training & Development',
      amount: '₱25,000.00',
      projectSummary: 'Training program for staff on AI technologies and applications.',
      projectDescription: 'Series of workshops designed to upskill technical and non-technical staff on artificial intelligence concepts, tools, and practical applications.',
      costElements: [
        { type: 'Service', description: 'External Trainers', cost: '₱15,000.00' },
        { type: 'Materials', description: 'Training Materials and Resources', cost: '₱10,000.00' }
      ],
      dueDate: 'December 31, 2024'
    }
  ]);

  // Categories for dropdown
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

  // Filter transactions based on search query and selected category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Navigation functions
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
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowCategoryDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      navigate('/login', { replace: true });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
  };

  const handleBackToList = () => {
    setSelectedExpense(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
          {!selectedExpense ? (
            <>
              {/* Header Section with Title and Controls - Now inside ledger container */}
              <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="page-title">
                  Expense History 
                </h2>
                
                <div className="controls-container" style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search expenses..."
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
                        {categories.map((category, index) => (
                          <div
                            key={index}
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
                      }}>DATE</th>
                      <th style={{ 
                        width: '35%', 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6',
                        height: '50px',
                        verticalAlign: 'middle',
                        backgroundColor: '#f8f9fa'
                      }}>DESCRIPTION</th>
                      <th style={{ 
                        width: '20%', 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6',
                        height: '50px',
                        verticalAlign: 'middle',
                        backgroundColor: '#f8f9fa'
                      }}>CATEGORY</th>
                      <th style={{ 
                        width: '15%', 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6',
                        height: '50px',
                        verticalAlign: 'middle',
                        backgroundColor: '#f8f9fa'
                      }}>AMOUNT</th>
                      <th style={{ 
                        width: '15%', 
                        padding: '0.75rem', 
                        textAlign: 'center', 
                        borderBottom: '2px solid #dee2e6',
                        height: '50px',
                        verticalAlign: 'middle',
                        backgroundColor: '#f8f9fa'
                      }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction, index) => (
                        <tr 
                          key={transaction.id} 
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
                          }}>{transaction.date}</td>
                          <td style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid #dee2e6',
                            verticalAlign: 'middle'
                          }}>{transaction.description}</td>
                          <td style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid #dee2e6',
                            verticalAlign: 'middle'
                          }}>{transaction.category}</td>
                          <td style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid #dee2e6',
                            verticalAlign: 'middle'
                          }}>{transaction.amount}</td>
                          <td style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid #dee2e6',
                            verticalAlign: 'middle',
                            textAlign: 'center'
                          }}>
                            <button 
                              className="view-btn"
                              onClick={() => handleViewExpense(transaction)}
                              style={{ 
                                padding: '5px 10px', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-results" style={{ 
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
            </>
          ) : (
            <div className="budget-proposal-view" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              overflow: 'hidden'
            }}>
              <button className="back-button" onClick={handleBackToList} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '8px 12px', 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '20px',
                alignSelf: 'flex-start'
              }}>
                <ArrowLeft size={16} />
                <span>Back to Expenses</span>
              </button>

              <div style={{ 
                flex: 1, 
                overflow: 'auto',
                paddingRight: '10px'
              }}>
                <div className="proposal-header" style={{ marginBottom: '20px' }}>
                  <h3 className="proposal-title" style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{selectedExpense.description}</h3>
                  <div className="proposal-date" style={{ color: '#6c757d' }}>Due Date: {selectedExpense.dueDate}</div>
                </div>

                <div className="proposal-section" style={{ marginBottom: '20px' }}>
                  <h4 className="section-label" style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '0.9rem', 
                    color: '#6c757d', 
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>PROJECT SUMMARY</h4>
                  <p className="section-content" style={{ margin: 0, lineHeight: '1.5' }}>{selectedExpense.projectSummary}</p>
                </div>

                <div className="proposal-section" style={{ marginBottom: '20px' }}>
                  <h4 className="section-label" style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '0.9rem', 
                    color: '#6c757d', 
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>PROJECT DESCRIPTION</h4>
                  <p className="section-content" style={{ margin: 0, lineHeight: '1.5' }}>{selectedExpense.projectDescription}</p>
                </div>

                <div className="proposal-section">
                  <h4 className="section-label" style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '0.9rem', 
                    color: '#6c757d', 
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>COST ELEMENTS</h4>
                  <div className="cost-table" style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div className="cost-header" style={{ 
                      display: 'flex', 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px 15px',
                      fontWeight: '600',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <div className="cost-type-header" style={{ flex: '1' }}>TYPE</div>
                      <div className="cost-desc-header" style={{ flex: '2' }}>DESCRIPTION</div>
                      <div className="cost-amount-header" style={{ flex: '1', textAlign: 'right' }}>ESTIMATED COST</div>
                    </div>
                    {selectedExpense.costElements.map((cost, idx) => (
                      <div className="cost-row" key={idx} style={{ 
                        display: 'flex', 
                        padding: '10px 15px',
                        borderBottom: idx < selectedExpense.costElements.length - 1 ? '1px solid #dee2e6' : 'none'
                      }}>
                        <div className="cost-type" style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                          <span className="cost-bullet" style={{ 
                            width: '8px', 
                            height: '8px', 
                            backgroundColor: '#007bff', 
                            borderRadius: '50%', 
                            marginRight: '10px' 
                          }}></span>
                          {cost.type}
                        </div>
                        <div className="cost-description" style={{ flex: '2' }}>{cost.description}</div>
                        <div className="cost-amount" style={{ flex: '1', textAlign: 'right' }}>{cost.cost}</div>
                      </div>
                    ))}
                    <div className="cost-row total" style={{ 
                      display: 'flex', 
                      padding: '10px 15px',
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      <div className="cost-type" style={{ flex: '1' }}></div>
                      <div className="cost-description" style={{ flex: '2' }}>TOTAL</div>
                      <div className="cost-amount" style={{ flex: '1', textAlign: 'right' }}>{selectedExpense.amount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistory;