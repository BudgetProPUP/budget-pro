import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, User, Mail, Briefcase, LogOut, Download, Bell, Settings, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './BudgetVarianceReport.css';

const BudgetVarianceReport = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Months for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Budget data
  const budgetData = [
    {
      id: 1,
      category: 'INCOME',
      budget: '₱3,326,025.75',
      actual: '₱2,500,025.75',
      available: '₱500,000.00',
      isPositive: true,
      isHeader: true
    },
    {
      id: 2,
      category: 'PRIMARY INCOME',
      budget: '₱3,326,025.75',
      actual: '₱2,500,025.75',
      available: '₱500,000.00',
      isPositive: true,
      isSubcategory: true
    },
    {
      id: 3,
      category: 'Utilities',
      budget: '₱90,000',
      actual: '₱100,000',
      available: '₱10,000',
      isPositive: true,
      isSubcategory: true,
      indent: true
    },
    {
      id: 4,
      category: 'EXPENSE',
      budget: '₱2,326,025.75',
      actual: '₱1,500,025.75',
      available: '₱826,000',
      isPositive: true,
      isHeader: true
    },
    {
      id: 5,
      category: 'BILLS',
      budget: '₱250,000',
      actual: '₱0.00',
      available: '₱250,000',
      isPositive: true,
      percentage: '4% of budget',
      isSubcategory: true
    },
    {
      id: 6,
      category: 'Utilities',
      budget: '₱250,000',
      actual: '₱0.00',
      available: '₱250,000',
      isPositive: true,
      isSubcategory: true,
      indent: true
    },
    {
      id: 7,
      category: 'DISCRETIONARY',
      budget: '₱650,000',
      actual: '₱700,000',
      available: '₱50,000',
      isPositive: true,
      percentage: '15% of budget',
      isSubcategory: true
    },
    {
      id: 8,
      category: 'Cloud Hosting',
      budget: '₱100,000',
      actual: '₱150,000',
      available: '-₱50,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    },
    {
      id: 9,
      category: 'Software Subscription',
      budget: '₱250,000',
      actual: '₱550,000',
      available: '-₱250,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    },
    {
      id: 14,
      category: 'OPERATIONS',
      budget: '₱1,200,000',
      actual: '₱1,350,000',
      available: '-₱150,000',
      isPositive: false,
      percentage: '18% of budget',
      isSubcategory: true
    },
    {
      id: 15,
      category: 'Office Supplies',
      budget: '₱150,000',
      actual: '₱200,000',
      available: '-₱50,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    },
    {
      id: 16,
      category: 'Equipment',
      budget: '₱500,000',
      actual: '₱600,000',
      available: '-₱100,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    },
    {
      id: 17,
      category: 'Maintenance',
      budget: '₱300,000',
      actual: '₱300,000',
      available: '₱0.00',
      isPositive: true,
      isSubcategory: true,
      indent: true
    },
    {
      id: 18,
      category: 'Transportation',
      budget: '₱250,000',
      actual: '₱250,000',
      available: '₱0.00',
      isPositive: true,
      isSubcategory: true,
      indent: true
    }
  ];

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container') && !event.target.closest('.filter-dropdown')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfilePopup(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation dropdown handlers - Updated with LedgerView functionality
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
    if (showNotifications) setShowNotifications(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    try {
      setShowProfilePopup(false);
      setShowProfileDropdown(false);
      navigate('/login', { replace: true });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Category', 'Budget', 'Actual', 'Available'],
      ...budgetData.map(item => [
        item.category,
        item.budget,
        item.actual,
        item.available
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Budget_Variance_Report_${months[selectedMonth - 1].label}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container" style={{ minWidth: '1200px', overflowY: 'auto', height: '100vh' }}>
      {/* Navigation Bar - Updated with LedgerView's exact structure and functionality */}
      <nav className="navbar" style={{ position: 'static', marginBottom: '20px' }}>
        <div className="navbar-content" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 20px',
          height: '60px'
        }}>
          {/* Logo and System Name - Exact copy from LedgerView */}
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

          {/* Main Navigation Links - Exact copy from LedgerView */}
          <div className="navbar-links" style={{ display: 'flex', gap: '20px' }}>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {/* Budget Dropdown - Exact copy from LedgerView */}
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

            {/* Expense Dropdown - Exact copy from LedgerView */}
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

          {/* User Controls - Exact copy from LedgerView */}
          <div className="navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Timestamp/Date - Exact copy from LedgerView */}
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

            {/* Notification Icon - Exact copy from LedgerView */}
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

            {/* Profile Dropdown - Exact copy from LedgerView */}
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

      {/* Main Content - Preserved original BudgetVarianceReport layout with LedgerView container styling */}
      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Container using LedgerView's styling */}
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
          {/* Header Section with Title and Controls - Using LedgerView's layout structure */}
          <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title">
              Budget Variance Report
            </h2>
            
            <div className="controls-container" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="date-selection" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Month Select with ChevronDown icon on the right */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    style={{ 
                      padding: '8px 32px 8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      minWidth: '120px',
                      appearance: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      zIndex: 1,
                      color: '#666',
                      pointerEvents: 'none'
                    }} 
                  />
                </div>
                
                {/* Year Select with ChevronDown icon on the right */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ 
                      padding: '8px 32px 8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      minWidth: '100px',
                      appearance: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      zIndex: 1,
                      color: '#666',
                      pointerEvents: 'none'
                    }} 
                  />
                </div>
              </div>
              
              {/* Export Button - Styled like LedgerView buttons */}
              <button 
                className="export-button" 
                onClick={handleExport}
                onMouseDown={(e) => e.preventDefault()}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #007bff', 
                  borderRadius: '4px', 
                  backgroundColor: '#007bff',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <span style={{ color: 'white' }}>Export Report</span>
                <Download size={16} style={{ color: 'white' }} />
              </button>
            </div>
          </div>

          {/* Separator line between title and table - Matching LedgerView */}
          <div style={{
            height: '1px',
            backgroundColor: '#e0e0e0',
            marginBottom: '20px'
          }}></div>

          {/* Report Table Container - Made scrollable like LedgerView */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            position: 'relative'
          }}>
            {/* Custom scrollbar styling from LedgerView */}
            <style>
              {`
                .table-scroll-container::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .table-scroll-container::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
                }
                .table-scroll-container::-webkit-scrollbar-thumb {
                  background: #c1c1c1;
                  border-radius: 4px;
                }
                .table-scroll-container::-webkit-scrollbar-thumb:hover {
                  background: #a8a8a8;
                }
              `}
            </style>
            
            <div className="table-scroll-container" style={{
              height: '100%',
              overflow: 'auto'
            }}>
              <table className="report-table" style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                    <th style={{ 
                      width: '40%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      backgroundColor: '#f8f9fa'
                    }}>CATEGORY</th>
                    <th style={{ 
                      width: '20%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      backgroundColor: '#f8f9fa'
                    }}>BUDGET</th>
                    <th style={{ 
                      width: '20%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      backgroundColor: '#f8f9fa'
                    }}>ACTUAL</th>
                    <th style={{ 
                      width: '20%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      backgroundColor: '#f8f9fa'
                    }}>AVAILABLE</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map((item, index) => (
                    <tr 
                      key={item.id} 
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
                        paddingLeft: item.indent ? '2rem' : '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            fontWeight: item.isHeader ? 'bold' : 'normal',
                            fontSize: item.isHeader ? '1.1em' : '1em'
                          }}>
                            {item.category}
                          </span>
                          {item.percentage && (
                            <span style={{ 
                              fontSize: '0.8em', 
                              color: '#666',
                              backgroundColor: '#f0f0f0',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {item.percentage}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{item.budget}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{item.actual}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle',
                        color: item.isPositive ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>{item.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetVarianceReport;