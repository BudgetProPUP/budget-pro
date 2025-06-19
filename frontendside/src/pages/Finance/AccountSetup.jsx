import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, User, Mail, Briefcase, LogOut } from 'lucide-react';
import LOGOMAP from '../../assets/LOGOMAP.png';

// CSS Imports (organized by component)
import '../../components/Styles/Layout.css';       // Main layout styles
import '../../components/Header.css';              // Header components
import '../../components/Tables.css';              // Table styles

                
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
  const itemsPerPage = 5;
  const navigate = useNavigate();
  
  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  // Filter options
  const accountTypes = ['All', 'Assets', 'Liabilities', 'Expenses'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  // Original account data with your previous structure
  const [accounts] = useState([
    { id: 1, code: '1001', type: 'Assets', description: 'Accounts Receivable', active: true, accomplished: false, date: '-' },
    { id: 2, code: '1002', type: 'Assets', description: 'Cash on Hand', active: true, accomplished: false, date: '-' },
    { id: 3, code: '2000', type: 'Liabilities', description: 'Accounts Payable', active: true, accomplished: false, date: '-' },
    { id: 4, code: '3014', type: 'Assets', description: 'Office Equipment', active: true, accomplished: true, date: '05-11-25' },
    { id: 5, code: '5210', type: 'Expenses', description: 'Rent Expense', active: false, accomplished: true, date: '04-24-25' },
    { id: 6, code: '8200', type: 'Expenses', description: 'Rent Expense', active: false, accomplished: true, date: '04-24-25' },
    { id: 7, code: '8300', type: 'Expenses', description: 'Utilities Expense', active: true, accomplished: false, date: '-' },
    { id: 8, code: '8400', type: 'Expenses', description: 'Supplies Expense', active: true, accomplished: false, date: '-' },
  ]);

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

  // Filter accounts based on selected filters and search query
  const filteredAccounts = accounts.filter(account => {
    const matchesType = selectedAccountType === 'All' || account.type === selectedAccountType;
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'Active' && account.active) || 
                         (selectedStatus === 'Inactive' && !account.active);
    const matchesSearch = searchQuery === '' || 
                         account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Navigation functions
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

  // Handler functions
  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    setShowProfilePopup(false);
    navigate('/login', { replace: true });
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

  return (
    <div className="app-container">
      {/* Header Section */}
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
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>

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
                    onClick={() => handleNavigate('/finance/account-setup')}
                  >
                    Account Setup
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
                    Journal Entries
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
                    className="dropdown-item" 
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
        
        {/* Profile Section */}
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img 
                src={userProfile.avatar} 
                alt="User avatar" 
                className="avatar-img" 
              />
            </div>
            
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
                    <img 
                      src={userProfile.avatar} 
                      alt="Profile" 
                      className="profile-avatar-img" 
                    />
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
          <div className="top">
            <h2 
              style={{ 
                margin: 0, 
                fontSize: '29px', 
                fontWeight: 'bold', 
                color: '#007bff' 
              }}
            >
              Account Setup ({filteredAccounts.length})
            </h2>
            
            <div>
              <div className="filter-controls" style={{ 
  display: 'flex', 
  justifyContent: 'flex-end', // This pushes everything to the right
  alignItems: 'center',
  gap: '1rem',
  width: '100%'
}}></div>
            <input
                type="text"
                placeholder="Search accounts"
                value={searchQuery}
                onChange={handleSearch}
                className="search-account-input"
              />
              
              {/* Account Type Filter */}
              <div 
                className="filter-dropdown" 
                style={{ 
                  display: 'inline-block', 
                }}
              >
                <button 
                  className="filter-dropdown-btn" 
                  onClick={toggleAccountTypeFilter}
                >
                  <span>{selectedAccountType}</span>
                  <ChevronDown size={19} />
                </button>
                {showAccountTypeFilter && (
                  <div className="category-dropdown-menu">
                    {accountTypes.map((type) => (
                      <div
                        key={type}
                        className={`category-dropdown-item ${
                          selectedAccountType === type ? 'active' : ''
                        }`}
                        onClick={() => handleAccountTypeSelect(type)}
                      >
                        {type}
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
                  onClick={toggleStatusFilter}
                >
                  <span>Status: {selectedStatus}</span>
                  <ChevronDown size={15} />
                </button>
                {showStatusFilter && (
                  <div className="category-dropdown-menu">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`category-dropdown-item ${
                          selectedStatus === status ? 'active' : ''
                        }`}
                        onClick={() => handleStatusSelect(status)}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>             
            </div>
          </div>

          {/* Accounts Table - Using original data with new headers */}
          <table>
            <thead>
              <tr>
                <th>CODE</th>
                <th>TYPE</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACCOMPLISHED</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {currentAccounts.map((account) => (
                <tr
                  key={account.id}
                  onClick={() => handleAccountSelect(account.id)}
                  style={{ cursor: 'pointer' }}
                  className={selectedAccounts.includes(account.id) ? 'selected' : ''}
                >
                  <td style={{ color: '#3b82f6', fontWeight: '500' }}>
                    {account.code}
                  </td>
                  <td>{account.type}</td>
                  <td>{account.description}</td>
                  <td>
                    <span 
                      className={`status-badge ${
                        account.active ? 'active' : 'inactive'
                      }`}
                    >
                      {account.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`accomplished-badge ${
                        account.accomplished ? 'accomplished' : 'pending'
                      }`}
                    >
                      {account.accomplished ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{account.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
  );
};

export default AccountSetup;