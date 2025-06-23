// src/pages/AccountSetup.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, User, Mail, Briefcase, LogOut, Loader2 } from 'lucide-react';
import LOGOMAP from '../../assets/MAP.jpg';
import axios from 'axios';
import PropTypes from 'prop-types';

// CSS Import
import '../../components/Styles/Layout.css';
import '../../components/Header.css';
import '../../components/Tables.css';

const AccountSetup = () => {
  // State management
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAccountTypeFilter, setShowAccountTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);

  // --- API ENDPOINTS ---
  // API_BASE_URL: Lists accounts for the Account Setup page.
  // FISCAL_YEARS_URL: Lists available fiscal years for selection.
  const API_BASE_URL = 'https://budget-pro.onrender.com/api/accounts/setup/';
  const FISCAL_YEARS_URL = 'https://budget-pro.onrender.com/api/dropdowns/fiscal-years/';

  // User profile data (Replace with dynamic data later)
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Filter options
  const accountTypes = ['All', 'Assets', 'Liabilities', 'Expenses'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    setShowProfilePopup(false);
    navigate('/login', { replace: true });
  };

  // --- FISCAL YEAR EXPLANATION ---
  // Fiscal years are 12-month periods (e.g., 2024, 2025) used for budgeting.
  // All account data is tied to a specific fiscal year.
  // The dropdown below lets the user pick which fiscal year to view/edit.
  // The selected fiscal year is required for all account API requests.

  // Fetch fiscal years from API
  const fetchFiscalYears = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleLogout();
        return;
      }

      // GET /api/dropdowns/fiscal-years/ returns [{id, name}, ...]
      const response = await axios.get(FISCAL_YEARS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Set fiscal years for dropdown, default to year with id=2 if present, else first year
      if (response.data && response.data.length > 0) {
        setFiscalYears(response.data);
        const hardcodedYearExists = response.data.some(year => year.id === 2);
        setSelectedFiscalYear(hardcodedYearExists ? 2 : response.data[0].id);
      } else {
        setFiscalYears(response.data || []);
        if (response.data && response.data.length > 0) {
          const hardcodedYearExists = response.data.some(year => year.id === 2);
          setSelectedFiscalYear(hardcodedYearExists ? 2 : response.data[0].id);
        } else {
           setError("No fiscal years found. Please configure them in the system.");
           setLoading(false);
        }
      }
    } catch (err) {
      // 401 = not logged in, force logout
      // Other errors: show error message
      console.error('Error fetching fiscal years:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to load fiscal years. Please try again.");
        setLoading(false);
      }
    }
  };

  // --- ACCOUNT SETUP API EXPLANATION ---
  // This fetches the list of accounts for the selected fiscal year.
  // Required param: fiscal_year_id (from dropdown)
  // Optional params: search, type, status, page, page_size
  // Example: GET /api/accounts/setup/?fiscal_year_id=2&type=assets&status=active&page=1&page_size=5

  // Fetch accounts from API
  const fetchAccounts = async (fiscalYearId) => {
    if (!fiscalYearId) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleLogout();
        return;
      }
      // Query params: fiscal_year_id, page, page_size, search, type, status
      const response = await axios.get(API_BASE_URL, {
        params: {
          fiscal_year_id: fiscalYearId,
          page: currentPage,
          page_size: itemsPerPage,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedAccountType !== 'All' && { type: selectedAccountType.toLowerCase() }),
          ...(selectedStatus !== 'All' && { status: selectedStatus.toLowerCase() })
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      // API returns paginated results: { count, results: [ ...accounts ] }
      // Each account: code, name, account_type, is_active, accomplished, accomplishment_date
      const transformedAccounts = response.data.results.map(account => ({
        id: account.id,
        code: account.code || 'N/A',
        account_type: account.account_type || 'Unknown',
        name: account.name || 'No description',
        accountlabel: account.accountlabel || '',
        is_active: account.is_active || false,
        is_accomplished: account.accomplished || false,
        accomplishment_date: account.accomplishment_date || '-'
      }));

      setAccounts(transformedAccounts);
      setTotalCount(response.data.count);

    } catch (err) {
      // 401 = not logged in, force logout
      // Other errors: show error message
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication required. Please login again.');
          handleLogout();
        } else {
          setError(`Server error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to fetch accounts');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- FRONTEND DEV NOTES ---
  // 1. Always require a fiscal year selection before fetching accounts.
  // 2. Pass all filters (search, type, status) as query params to the API.
  // 3. All API requests require an Authorization header with a JWT token.
  // 4. Handle loading and error states for both fiscal year and account fetches.
  // 5. Use the API Docs link for full endpoint details and try-it-out.

  // Effect to fetch fiscal years ONCE on component mount
  useEffect(() => {
    fetchFiscalYears();
  }, []);

  // Effect to fetch accounts whenever a dependency changes, but only if selectedFiscalYear is not null
  useEffect(() => {
    if (selectedFiscalYear) {
      fetchAccounts(selectedFiscalYear);
    }
  }, [currentPage, searchQuery, selectedAccountType, selectedStatus, selectedFiscalYear]);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler functions
  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  const handleAccountSelect = (id) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(accountId => accountId !== id) : [...prev, id]
    );
  };

  const handleAccountTypeSelect = (type) => {
    setSelectedAccountType(type);
    setShowAccountTypeFilter(false);
    setCurrentPage(1);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusFilter(false);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFiscalYearChange = (year) => {
    setSelectedFiscalYear(year);
    setCurrentPage(1);
  };

  // Pagination functions
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Toggle functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    setShowBudgetDropdown(false);
    setShowProfilePopup(false);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  const toggleAccountTypeFilter = () => {
    setShowAccountTypeFilter(!showAccountTypeFilter);
    setShowStatusFilter(false);
  };

  const toggleStatusFilter = () => {
    setShowStatusFilter(!showStatusFilter);
    setShowAccountTypeFilter(false);
  };

  //more robust loading state for the initial load
  if (loading && fiscalYears.length === 0) {
    return (
      <div className="app-container">
        <header className="app-header">
          {/* Header content can be minimal here or a placeholder */}
        </header>
        <div className="page">
          <div className="container">
            <div className="loading-overlay">
              <Loader2 className="spinner" size={48} />
              <p>Loading initial data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          {/* Header content can be minimal here or a placeholder */}
        </header>
        <div className="page">
          <div className="container">
            <div className="error-container">
              <h3>Error Loading Page</h3>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <button onClick={() => window.location.reload()} className="retry-btn">
                  Reload Page
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div 
                className={`nav-item ${showBudgetDropdown ? 'active' : ''}`} 
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>
                    Account Setup
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Journal Entries
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
                className={`nav-item ${showExpenseDropdown ? 'active' : ''}`} 
                onClick={toggleExpenseDropdown}
              >
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
          </nav>
        </div>
        
        {/* Profile Section */}
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
                      <span className="profile-field-value profile-email">
                        {userProfile.email}
                      </span>
                    </div>
                    
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Briefcase size={16} className="profile-field-icon" />
                        <span className="profile-field-label">Role:</span>
                      </div>
                      <span className="profile-field-value profile-role">
                        {userProfile.role}
                      </span>
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

      {/* Main Content */}
      <div className="page">
        <div className="container">
          {/* Header Section with Title and Controls */}
          <div className="top-section">
            <div className="title-container">
              <h2 className="page-title">Account Setup</h2>
              
              {/* Fiscal Year Selector */}
              {fiscalYears.length > 0 && selectedFiscalYear && (
                <div className="fiscal-year-selector">
                  {/* This dropdown lets the user pick which fiscal year to view accounts for */}
                  <label htmlFor="fiscal-year">Fiscal Year:</label>
                  <select
                    id="fiscal-year"
                    value={selectedFiscalYear}
                    onChange={(e) => handleFiscalYearChange(Number(e.target.value))}
                    className="fiscal-year-dropdown"
                  >
                    {fiscalYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="controls-container">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              
              {/* Account Type Filter */}
              <div className="filter-dropdown">
                <button className="filter-dropdown-btn" onClick={toggleAccountTypeFilter}>
                  <span>{selectedAccountType}</span>
                  <ChevronDown size={16} />
                </button>
                {showAccountTypeFilter && (
                  <div className="dropdown-menu">
                    {accountTypes.map((type) => (
                      <div
                        key={type}
                        className={`dropdown-item ${selectedAccountType === type ? 'active' : ''}`}
                        onClick={() => handleAccountTypeSelect(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Status Filter */}
              <div className="filter-dropdown">
                <button className="filter-dropdown-btn" onClick={toggleStatusFilter}>
                  <span>Status: {selectedStatus}</span>
                  <ChevronDown size={16} />
                </button>
                {showStatusFilter && (
                  <div className="dropdown-menu">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`dropdown-item ${selectedStatus === status ? 'active' : ''}`}
                        onClick={() => handleStatusSelect(status)}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Documentation Link */}
              {/* This button links to the full OpenAPI docs for all endpoints */}
              <a 
                href="https://budget-pro.onrender.com/api/docs/"
                target="_blank" 
                rel="noopener noreferrer"
                className="api-docs-btn"
              >
                API Docs
              </a>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>ACCOUNT CODE</th>
                  <th style={{ width: '15%' }}>ACCOUNT TYPE</th>
                  <th style={{ width: '25%' }}>ACCOUNT NAME</th>
                  <th style={{ width: '15%' }}>ACCOUNT LABEL</th>
                  <th style={{ width: '15%' }}>STATUS</th>
                  <th style={{ width: '15%' }}>ACCOMPLISHMENT DATE</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <tr
                      key={account.id}
                      onClick={() => handleAccountSelect(account.id)}
                      className={`account-row ${selectedAccounts.includes(account.id) ? 'selected' : ''}`}
                    >
                      <td className="account-code">{account.code}</td>
                      <td>{account.account_type}</td>
                      <td className="account-description">{account.name}</td>
                      <td>{account.accountlabel}</td>
                      <td>
                        <span className={`status-badge ${account.is_active ? 'active' : 'inactive'}`}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{account.accomplishment_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results-row">
                    <td colSpan="6">
                      {loading ? (
                        <div className="loading-row">
                          <Loader2 className="spinner" size={20} />
                          <span>Loading accounts...</span>
                        </div>
                      ) : (
                        'No accounts found matching your criteria'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} accounts
              </div>
              
              <div className="pagination-controls">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AccountSetup.propTypes = {
  //Add prop types if needed
};

export default AccountSetup;