import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, User, Mail, Briefcase, LogOut, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './BudgetVarianceReport.css';

const BudgetVarianceReport = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
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
      {/* Header Section */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img src={LOGOMAP} alt="BudgetPro Logo" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div className={`nav-item ${showBudgetDropdown ? 'active' : ''}`} onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>Budget Proposal</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>Proposal History</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>Ledger View</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-allocation')}>Budget Allocation</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>Budget Variance Report</div>
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div className={`nav-item ${showExpenseDropdown ? 'active' : ''}`} onClick={toggleExpenseDropdown}>
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-tracking')}>Expense Tracking</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>Expense History</div>
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
            {showProfilePopup && (
              <div className="profile-popup">
                <div className="profile-popup-header">
                  <button className="profile-back-btn" onClick={() => setShowProfilePopup(false)}>
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="profile-popup-title">Profile</h3>
                </div>
                <div className="profile-popup-content">
                  <div className="profile-avatar-large">
                    <img src={userProfile.avatar} alt="Profile" className="profile-avatar-img" />
                  </div>
                  <div className="profile-link">
                    <span className="profile-link-text">My Profile</span>
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

      {/* Main Content Section */}
      <div className="content-container">
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