import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, User, Mail, Briefcase, LogOut, Download, Bell, Settings } from 'lucide-react';
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
  const now = new Date();
  const formattedDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Close dropdowns when clicking outside
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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowProfilePopup(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowNotifications(false);
    setShowProfilePopup(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      setShowProfilePopup(false);
      navigate('/login', { replace: true });
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
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
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
          <div className="navbar-links">
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
                <div className="dropdown-menu">
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
          </div>

          {/* User Controls */}
          <div className="navbar-controls">
            {/* Timestamp/Date */}
            <div className="date-time-badge" style={{
              marginRight: '16px',
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
              >
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </div>
              
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="clear-all-btn">Clear All</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-icon-wrapper">
                        <Bell size={16} />
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Budget Approved</div>
                        <div className="notification-message">Your Q3 budget has been approved</div>
                        <div className="notification-time">2 hours ago</div>
                      </div>
                      <button className="notification-delete">&times;</button>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon-wrapper">
                        <Bell size={16} />
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Expense Report</div>
                        <div className="notification-message">New expense report needs review</div>
                        <div className="notification-time">5 hours ago</div>
                      </div>
                      <button className="notification-delete">&times;</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container">
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
              >
                <img src={userProfile.avatar} alt="User avatar" className="profile-image" />
                <ChevronDown size={14} className={`dropdown-arrow ${showProfileDropdown ? 'rotated' : ''}`} />
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-info-section">
                    <img src={userProfile.avatar} alt="Profile" className="profile-dropdown-image" />
                    <div className="profile-details">
                      <div className="profile-name">{userProfile.name}</div>
                      <div className="profile-role-badge">{userProfile.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item">
                    <User size={16} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div className="dropdown-item">
                      <Settings size={16} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Section */}
      <div className="content-container">
        {/* Report Background Container */}
        <div className="report-background-container">
          {/* Report Header with Title, Date, and Controls */}
          <div className="report-header">
            <div className="report-title-container">
              <h2 className="report-title">Budget Variance Report</h2>
              <div className="report-date-display">
                {months[selectedMonth - 1].label} {selectedYear}
              </div>
            </div>
            <div className="report-controls">
              <div className="date-selection">
                <select 
                  className="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <select 
                  className="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button className="export-button" onClick={handleExport}>
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          {/* Report Table */}
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th className="category-header">CATEGORY</th>
                  <th className="budget-header">BUDGET</th>
                  <th className="actual-header">ACTUAL</th>
                  <th className="available-header">AVAILABLE</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.map((item) => (
                  <tr key={item.id} className={`
                    ${item.isHeader ? 'header-row' : ''} 
                    ${item.isSubcategory ? 'subcategory-row' : ''} 
                    ${item.indent ? 'indent-row' : ''}
                  `}>
                    <td className="category-cell">
                      <div className="category-content">
                        <span className="category-name">{item.category}</span>
                        {item.percentage && (
                          <span className="percentage-badge">{item.percentage}</span>
                        )}
                      </div>
                    </td>
                    <td className="budget-cell">{item.budget}</td>
                    <td className="actual-cell">{item.actual}</td>
                    <td className={`available-cell ${item.isPositive ? 'positive' : 'negative'}`}>
                      {item.available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetVarianceReport;