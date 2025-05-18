import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search, Filter, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import './AccountSetup.css';

function AccountSetup() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountTypeFilter, setShowAccountTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const navigate = useNavigate();
  
  // Account type options
  const accountTypes = ['All', 'Assets', 'Liabilities', 'Expenses'];
  
  // Status filter options
  const statusOptions = ['All', 'Active', 'Inactive'];

  // Sample account data matching the UI in the image
  const accounts = [
    { id: 1, code: '1001', type: 'Assets', description: 'Accounts Receivable', active: true, accomplished: false, date: '-' },
    { id: 2, code: '1001', type: 'Assets', description: 'Accounts Receivable', active: true, accomplished: false, date: '-' },
    { id: 3, code: '2000', type: 'Liabilities', description: 'Accounts Receivable', active: true, accomplished: false, date: '-' },
    { id: 4, code: '3014', type: 'Assets', description: 'Accounts Receivable', active: true, accomplished: true, date: '05-11-25' },
    { id: 5, code: '5210', type: 'Expenses', description: 'Rent Expense', active: true, accomplished: true, date: '04-24-25' },
    { id: 6, code: '1002', type: 'Assets', description: 'Cash', active: true, accomplished: false, date: '-' },
    { id: 7, code: '2001', type: 'Liabilities', description: 'Accounts Payable', active: true, accomplished: false, date: '-' },
    { id: 8, code: '3015', type: 'Assets', description: 'Inventory', active: false, accomplished: true, date: '05-11-25' },
    { id: 9, code: '5211', type: 'Expenses', description: 'Utilities Expense', active: false, accomplished: true, date: '04-24-25' },
  ];

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleAccountTypeFilter = () => {
    setShowAccountTypeFilter(!showAccountTypeFilter);
    if (showStatusFilter) setShowStatusFilter(false);
  };

  const toggleStatusFilter = () => {
    setShowStatusFilter(!showStatusFilter);
    if (showAccountTypeFilter) setShowAccountTypeFilter(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleAccountSelect = (id) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(accountId => accountId !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Duplicate declaration removed

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAccountTypeSelect = (type) => {
    setSelectedAccountType(type);
    setShowAccountTypeFilter(false);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusFilter(false);
  };

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter(account => {
    const matchesType = selectedAccountType === 'All' || account.type === selectedAccountType;
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'Active' && account.active) ||
      (selectedStatus === 'Inactive' && !account.active);
    
    return matchesType && matchesStatus;
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>
          
          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div 
              className="nav-link"
              onClick={() => handleNavigate('/dashboard')}
            >
              Dashboard
            </div>
            
            {/* Budget Dropdown */}
            <div className="dropdown">
              <button 
                className="dropdown-toggle active"
                onClick={toggleBudgetDropdown}
                aria-haspopup="true"
                aria-expanded={showBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </button>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Budget</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  
                  <div className="dropdown-header">Account</div>
                  <div className="dropdown-item active" onClick={() => handleNavigate('/finance/account-setup')}>
                    Account Setup
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Journal Entries
                  </div>
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown">
              <button 
                className="dropdown-toggle"
                onClick={toggleExpenseDropdown}
                aria-haspopup="true"
                aria-expanded={showExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </button>
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
            
            {/* User Management */}
            <div className="nav-link" onClick={() => handleNavigate('/finance/user-management')}>
              User Management
            </div>
          </nav>
        </div>
        
        {/* User Profile */}
        <div className="user-profile dropdown">
          <button 
            className="avatar-button"
            onClick={toggleProfileDropdown}
            aria-haspopup="true"
            aria-expanded={showProfileDropdown}
          >
            <img src="/api/placeholder/32/32" alt="User avatar" />
          </button>
          {showProfileDropdown && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={11} className="icon" /> Logout
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="account-setup-main">
        {/* Search Bar */}
        <div className="search-filter-container"></div>
        {/* Search Bar and Filter Controls */}
        <div className="search-filter-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by project or budget" 
              className="search-input" 
            />
            <Search size={18} className="search-icon" />
          </div>
          <div className="filter-controls">
            <button className="filter-button">
              <Filter size={16} />
              Filter by:
            </button>
            <div className="filter-dropdown">
              <button className="filter-option">
                Account Type <ChevronDown size={16} />
              </button>
            </div>
            <div className="filter-dropdown">
              <button className="filter-option">
                Date <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Account Table Card */}
        <div className="account-card">
          <div className="account-card-header">
            <h2 className="account-card-title">Account Setup</h2>
          </div>
          
          {/* Account Table */}
          <div className="account-table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Type</th>
                  <th>Account Title</th>
                  <th>Status</th>
                  <th>Accomplished</th>
                  <th>Accomplishment Date</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.code}</td>
                    <td>{account.type}</td>
                    <td>{account.description}</td>
                    <td>
                      <div className={`status-pill ${account.active ? 'active' : 'inactive'}`}>
                        {account.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div className={`status-pill ${account.accomplished ? 'accomplished' : 'not-accomplished'}`}>
                        {account.accomplished ? 'Yes' : 'No'}
                      </div>
                    </td>
                    <td>{account.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              className="pagination-button prev" 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="pagination-numbers">
              <button className="pagination-number active">1</button>
            </div>
            <button 
              className="pagination-button next" 
              onClick={goToNextPage}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="filter-controls">
            <button className="filter-button">
              <Filter size={16} />
              Filter by:
            </button>
            
            {/* Account Type Filter */}
            <div className="filter-dropdown">
              <button 
                className="filter-option"
                onClick={toggleAccountTypeFilter}
                aria-haspopup="true"
                aria-expanded={showAccountTypeFilter}
              >
                Account Type: {selectedAccountType} <ChevronDown size={16} />
              </button>
              {showAccountTypeFilter && (
                <div className="filter-dropdown-menu scrollable-menu">
                  {accountTypes.map((type, index) => (
                    <div 
                      key={index} 
                      className={`filter-item ${selectedAccountType === type ? 'active' : ''}`}
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
              <button 
                className="filter-option"
                onClick={toggleStatusFilter}
                aria-haspopup="true"
                aria-expanded={showStatusFilter}
              >
                Status: {selectedStatus} <ChevronDown size={16} />
              </button>
              {showStatusFilter && (
                <div className="filter-dropdown-menu scrollable-menu">
                  {statusOptions.map((status, index) => (
                    <div 
                      key={index} 
                      className={`filter-item ${selectedStatus === status ? 'active' : ''}`}
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

        {/* Account Table Card */}
        <div className="account-card">
          <div className="account-card-header">
            <h2 className="account-card-title">Account Setup</h2>
            <div className="filter-badges">
              {selectedAccountType !== 'All' && (
                <div className="filter-badge">
                  Type: {selectedAccountType}
                  <button 
                    className="badge-remove"
                    onClick={() => setSelectedAccountType('All')}
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedStatus !== 'All' && (
                <div className="filter-badge">
                  Status: {selectedStatus}
                  <button 
                    className="badge-remove"
                    onClick={() => setSelectedStatus('All')}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Table */}
          <div className="account-table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Type</th>
                  <th>Account Title</th>
                  <th>Status</th>
                  <th>Accomplished</th>
                  <th>Accomplishment Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} onClick={() => handleAccountSelect(account.id)}>
                    <td>{account.code}</td>
                    <td>{account.type}</td>
                    <td>{account.description}</td>
                    <td>
                      <div className={`status-pill ${account.active ? 'active' : 'inactive'}`}>
                        {account.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div className={`status-pill ${account.accomplished ? 'accomplished' : 'not-accomplished'}`}>
                        {account.accomplished ? 'Yes' : 'No'}
                      </div>
                    </td>
                    <td>{account.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              className="pagination-button prev" 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="pagination-numbers">
              <button className="pagination-number active">1</button>
            </div>
            <button 
              className="pagination-button next" 
              onClick={goToNextPage}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountSetup;