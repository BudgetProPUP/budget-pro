import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './LedgerView.css';

const LedgerView = () => {
  // Navigation state
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Sample data for the ledger
  const [transactions, setTransactions] = useState([
    { 
      reference: 'EX-001', 
      date: '05-12-2025', 
      category: 'Miscellaneous', 
      description: 'Internet Bill', 
      amount: '₱8,300',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'AS-001', 
      date: '05-03-2025', 
      category: 'Equipment & Maintenance', 
      description: 'Company Laptops', 
      amount: '₱250,000',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'AS-002', 
      date: '04-27-2025', 
      category: 'Equipment & Maintenance', 
      description: 'Office Printer', 
      amount: '₱12,500',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'EX-002', 
      date: '04-12-2025', 
      category: 'Miscellaneous', 
      description: 'Internet Bill', 
      amount: '₱9,200',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'AS-003', 
      date: '03-20-2025', 
      category: 'Professional Services', 
      description: 'Cloud Hosting', 
      amount: '₱5,800',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'PR-001', 
      date: '03-15-2025', 
      category: 'Training & Development', 
      description: 'Website Redesign', 
      amount: '₱45,000',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'VC-001', 
      date: '03-10-2025', 
      category: 'Professional Services', 
      description: 'Annual Software License', 
      amount: '₱65,000',
      type: 'Operational Expenditure'
    },
  ]);

  // State for UI elements
  const [, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    transactionType: ''
  });

  // Filtered transactions based on search and filters
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Filter options - Updated with new categories
  const categoryOptions = [
    'Travel',
    'Office Supplies',
    'Utilities',
    'Marketing & Advertising',
    'Professional Services',
    'Training & Development',
    'Equipment & Maintenance',
    'Miscellaneous'
  ];

  useEffect(() => {
    // Update current date/time
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container') && !event.target.closest('.filter-dropdown')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowCategoryDropdown(false);
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to filter transactions when search term or active filters change
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(transaction => 
        transaction.reference.toLowerCase().includes(term) ||
        transaction.description.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.amount.toLowerCase().includes(term) ||
        transaction.date.toLowerCase().includes(term) ||
        transaction.type.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (activeFilters.category) {
      result = result.filter(transaction => 
        transaction.category === activeFilters.category
      );
    }
    
    // Apply transaction type filter
    if (activeFilters.transactionType) {
      result = result.filter(transaction => 
        transaction.type === activeFilters.transactionType
      );
    }
    
    setFilteredTransactions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, activeFilters, transactions]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category selection from dropdown
  const handleCategoryChange = (category) => {
    setActiveFilters(prev => ({
      ...prev,
      category: category
    }));
    setShowCategoryDropdown(false);
  };

  // Pagination logic
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Navigation dropdown handlers
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowCategoryDropdown(false);
    setShowProfilePopup(false);
  };

  // Updated logout function with navigation to login screen
  const handleLogout = () => {
    try {
      // Clear any stored authentication data
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('userSession');
      // localStorage.removeItem('userProfile');
      
      // Clear session storage
      // sessionStorage.clear();
      
      // Close the profile popup
      setShowProfilePopup(false);
      
      // Navigate to login screen
      navigate('/login', { replace: true });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error clearing storage
      navigate('/login', { replace: true });
    }
  };

  // Handle export button click
  const handleExport = () => {
    alert('Exporting data...');
    // Implementation for exporting data
  };

  return (
    <div className="app-container">
      {/* Header - Using Dashboard Nav Structure */}
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
                    className="dropdown-item active"
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
        
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img src={userProfile.avatar} alt="User avatar" className="avatar-img" />
            </div>
            
            {/* Profile Popup */}
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

      {/* Main Content */}
      <div className="page">
        <div className="container">
          {/* Header Section with Title and Controls - Matching Account Setup */}
          <div className="top">
            <h2 
              style={{ 
              margin: 0, 
              fontSize: '29px', 
             fontWeight: 'bold', 
             color:'#242424',
              }}
            >
              Ledger View 
            </h2>
            
            <div>
              <div className="filter-controls" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', // This pushes everything to the right
                alignItems: 'center',
                gap: '1rem',
                width: '100%'
              }}>
              </div>
              <input
                type="text"
                placeholder="Search Transactions"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-account-input"
              />
              
              <div className="filter-dropdown">
                <button 
                  className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                  onClick={toggleCategoryDropdown}
                >
                  <span>{activeFilters.category || 'All Categories'}</span>
                  <ChevronDown size={14} />
                </button>
                {showCategoryDropdown && (
                  <div className="category-dropdown-menu">
                    <div
                      className={`category-dropdown-item ${activeFilters.category === '' ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('')}
                    >
                      All Categories
                    </div>
                    {categoryOptions.map((category, index) => (
                      <div
                        key={index}
                        className={`category-dropdown-item ${activeFilters.category === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="filter-dropdown-btn" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                    <th style={{ width: '12%' }}>REFERENCE</th>
                    <th style={{ width: '15%' }}>DATE</th>
                    <th style={{ width: '19%' }}>CATEGORY</th>
                    <th style={{ width: '17%' }}>DESCRIPTION</th>
                    <th style={{ width: '17%' }}>ACCOUNT</th>
                    <th style={{ width: '10%' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.reference}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '2rem' }}>
                    No transactions match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
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

export default LedgerView;