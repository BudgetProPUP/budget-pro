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


const ITEMS_PER_PAGE = 5;
const API_BASE_URL = 'https://budget-pro.onrender.com/api/accounts/setup/';
const FISCAL_YEARS_URL = 'https://budget-pro.onrender.com/api/dropdowns/fiscal-years/';

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
  
  const navigate = useNavigate();

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
//
// --- HOW FISCAL YEAR ID IS DETERMINED ---
// When fetching fiscal years from the API (/api/dropdowns/fiscal-years/), 
// each year has an 'id' and a 'name' (e.g., [{id: 2, name: "2025"}, ...]).
// In this app, fiscal_year_id = 2 means "FY 2025" because the backend 
// database assigned id=2 to the 2025 fiscal year record.
// This mapping is determined by the backend when fiscal years are created.
// So, whenever you select "2025" in the dropdown, the value sent to the API 
// is 2 (the id), not the year string.
// If you want to know which id maps to which year, check the API response 
// from /api/dropdowns/fiscal-years/.
//
// Example API response:
//   [ { "id": 1, "name": "2024" }, { "id": 2, "name": "2025" } ]
// Here, "2025" is id=2, so fiscal_year_id=2 means FY 2025.


  // Fetch fiscal years from API
  const fetchFiscalYears = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleLogout();
        return;
      }
      const response = await axios.get(FISCAL_YEARS_URL, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (response.data && response.data.length > 0) {
        setFiscalYears(response.data);
        const hardcodedYearExists = response.data.some(year => year.id === 2);
        setSelectedFiscalYear(hardcodedYearExists ? 2 : response.data[0].id);
      } else {
        setError("No fiscal years found. Please configure them in the system.");
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching fiscal years:', err);
      if (err.response?.status === 401) handleLogout();
      else {
        setError("Failed to load fiscal years. Please try again.");
        setLoading(false);
      }
    }
  };

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
      const response = await axios.get(API_BASE_URL, {
        params: {
          fiscal_year_id: fiscalYearId,
          page: currentPage,
          page_size: ITEMS_PER_PAGE, 
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

  // Effect to fetch fiscal years ONCE on component mount
  useEffect(() => {
    fetchFiscalYears();
  }, []);

  // Effect to fetch accounts whenever a dependency changes
  useEffect(() => {
    if (selectedFiscalYear) {
      fetchAccounts(selectedFiscalYear);
    }
  }, [currentPage, searchQuery, selectedAccountType, selectedStatus, selectedFiscalYear]);

  // Effect to close dropdowns when clicking outside
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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

  if (loading && fiscalYears.length === 0) {
    return (
      <div className="app-container">
        <header className="app-header" />
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
        <header className="app-header" />
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
            <div className="nav-dropdown">
              <div className={`nav-item ${showBudgetDropdown ? 'active' : ''}`} onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>Budget Proposal</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>Proposal History</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>Account Setup</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>Ledger View</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>Journal Entries</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>Budget Variance Report</div>
                </div>
              )}
            </div>
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
                  <button className="profile-back-btn" onClick={() => setShowProfilePopup(false)}><ArrowLeft size={20} /></button>
                  <h3 className="profile-popup-title">Profile</h3>
                </div>
                <div className="profile-popup-content">
                  <div className="profile-avatar-large"><img src={userProfile.avatar} alt="Profile" className="profile-avatar-img" /></div>
                  <div className="profile-info">
                    <div className="profile-field">
                      <div className="profile-field-header"><User size={16} className="profile-field-icon" /><span className="profile-field-label">Name:</span></div>
                      <span className="profile-field-value">{userProfile.name}</span>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header"><Mail size={16} className="profile-field-icon" /><span className="profile-field-label">E-mail:</span></div>
                      <span className="profile-field-value profile-email">{userProfile.email}</span>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header"><Briefcase size={16} className="profile-field-icon" /><span className="profile-field-label">Role:</span></div>
                      <span className="profile-field-value profile-role">{userProfile.role}</span>
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /> Log Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="page">
        <div className="container">
          <div className="top-section">
            <div className="title-container">
              <h2 className="page-title">Account Setup</h2>
              {fiscalYears.length > 0 && selectedFiscalYear && (
                <div className="fiscal-year-selector">
                  <label htmlFor="fiscal-year">Fiscal Year:</label>
                  <select id="fiscal-year" value={selectedFiscalYear} onChange={(e) => handleFiscalYearChange(Number(e.target.value))} className="fiscal-year-dropdown">
                    {fiscalYears.map(year => (<option key={year.id} value={year.id}>{year.name}</option>))}
                  </select>
                </div>
              )}
            </div>
            <div className="controls-container">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search accounts..." value={searchQuery} onChange={handleSearch} className="search-input" />
              </div>
              <div className="filter-dropdown">
                <button className="filter-dropdown-btn" onClick={toggleAccountTypeFilter}>
                  <span>{selectedAccountType}</span><ChevronDown size={16} />
                </button>
                {showAccountTypeFilter && (
                  <div className="dropdown-menu">
                    {accountTypes.map((type) => (<div key={type} className={`dropdown-item ${selectedAccountType === type ? 'active' : ''}`} onClick={() => handleAccountTypeSelect(type)}>{type}</div>))}
                  </div>
                )}
              </div>
              <div className="filter-dropdown">
                <button className="filter-dropdown-btn" onClick={toggleStatusFilter}>
                  <span>Status: {selectedStatus}</span><ChevronDown size={16} />
                </button>
                {showStatusFilter && (
                  <div className="dropdown-menu">
                    {statusOptions.map((status) => (<div key={status} className={`dropdown-item ${selectedStatus === status ? 'active' : ''}`} onClick={() => handleStatusSelect(status)}>{status}</div>))}
                  </div>
                )}
              </div>
              <a href="https://budget-pro.onrender.com/api/docs/" target="_blank" rel="noopener noreferrer" className="api-docs-btn">API Docs</a>
            </div>
          </div>

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
                    <tr key={account.id} onClick={() => handleAccountSelect(account.id)} className={`account-row ${selectedAccounts.includes(account.id) ? 'selected' : ''}`}>
                      <td className="account-code">{account.code}</td>
                      <td>{account.account_type}</td>
                      <td className="account-description">{account.name}</td>
                      <td>{account.accountlabel}</td>
                      <td><span className={`status-badge ${account.is_active ? 'active' : 'inactive'}`}>{account.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>{account.accomplishment_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results-row">
                    <td colSpan="6">
                      {loading ? (<div className="loading-row"><Loader2 className="spinner" size={20} /><span>Loading accounts...</span></div>) : ('No accounts found matching your criteria')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} accounts
              </div>
              <div className="pagination-controls">
                <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn"><ChevronLeft size={16} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (<button key={pageNum} onClick={() => paginate(pageNum)} className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}>{pageNum}</button>);
                })}
                <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AccountSetup.propTypes = {};

export default AccountSetup;