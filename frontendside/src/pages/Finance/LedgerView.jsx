import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut, Filter, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './LedgerView.css';

const LedgerView = () => {
  // Sample data for the ledger
  const [transactions] = useState([
    { 
      reference: 'EX-001', 
      date: '05-12-2025', 
      category: 'Expenses', 
      description: 'Internet Bill', 
      amount: '₱8,300',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'AS-001', 
      date: '05-03-2025', 
      category: 'Assets', 
      description: 'Company Laptops', 
      amount: '₱250,000',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'AS-002', 
      date: '04-27-2025', 
      category: 'Assets', 
      description: 'Office Printer', 
      amount: '₱12,500',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'EX-002', 
      date: '04-12-2025', 
      category: 'Expenses', 
      description: 'Internet Bill', 
      amount: '₱9,200',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'AS-003', 
      date: '03-20-2025', 
      category: 'Assets', 
      description: 'Cloud Hosting', 
      amount: '₱5,800',
      type: 'Operational Expenditure' 
    },
    { 
      reference: 'PR-001', 
      date: '03-15-2025', 
      category: 'Projects', 
      description: 'Website Redesign', 
      amount: '₱45,000',
      type: 'Capital Expenditure' 
    },
    { 
      reference: 'VC-001', 
      date: '03-10-2025', 
      category: 'Vendor & Contracts', 
      description: 'Annual Software License', 
      amount: '₱65,000',
      type: 'Operational Expenditure'
    },
    { 
      reference: 'TR-001', 
      date: '02-28-2025', 
      category: 'Transaction Types', 
      description: 'Department Transfer', 
      amount: '₱120,000',
      type: 'Transfers' 
    },
  ]);

  // State for navigation and UI elements
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);
  
  // New state for tracking active filters
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    transactionType: ''
  });

  // Filtered transactions based on search and filters
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Filter options from the provided image
  const categoryOptions = ['Expenses', 'Assets', 'Projects', 'Vendor & Contracts', 'Transaction Types'];
  const transactionTypeOptions = ['Capital Expenditure', 'Operational Expenditure', 'Transfers'];

  useEffect(() => {
    // Update current date/time
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
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

  // Format time with AM/PM
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  // Format date for display
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter selection
  const handleCategoryFilter = (category) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
    setShowCategoryDropdown(false);
  };

  const handleTransactionTypeFilter = (type) => {
    setActiveFilters(prev => ({
      ...prev,
      transactionType: prev.transactionType === type ? '' : type
    }));
    setShowTransactionDropdown(false);
  };

  // Remove a specific filter
  const removeFilter = (filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      category: '',
      transactionType: ''
    });
    setSearchTerm('');
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredTransactions.length / 5);
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate paginated transactions to display
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle export button click
  const handleExport = () => {
    alert('Exporting data...');
    // Implementation for exporting data
  };

  // Example usage of handleExport
  const exportData = () => {
    handleExport();
  };

  // Navigation dropdown toggles
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showFilterDropdown) setShowFilterDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showFilterDropdown) setShowFilterDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showFilterDropdown) setShowFilterDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowTransactionDropdown(false);
  };

  const toggleTransactionDropdown = () => {
    setShowTransactionDropdown(!showTransactionDropdown);
    setShowCategoryDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="ledger-container">
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
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown">
              <button 
                className="dropdown-toggle"
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
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>
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
        
        {/* Time and Date Display */}
        <div className="header-datetime">
          <span className="formatted-date">{formattedDate}</span>
          <span className="formatted-time">{formattedTime}</span>
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
      
    <div className="search-filter-container">
  {/* Search Bar - Left side */}
  <div className="search-bar">
    <input 
      type="text" 
      placeholder="Search Transactions" 
      value={searchTerm}
      onChange={handleSearchChange}
    />
    <button className="search-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  </div>
  
  {/* Filter Options - Right side */}
  <div className="filter-group-container">
    {/* Filter by Button */}
    <div className="filter-button-container">
      <button className="filter-btn blue-btn">
        <Filter size={16} className="filter-icon" />
        Filter by:
      </button>
    </div>
    
    {/* Category Dropdown Button */}
    <div className="filter-dropdown">
      <button 
        className="filter-btn category-btn"
        onClick={toggleCategoryDropdown}
        aria-expanded={showCategoryDropdown}
      >
        Category <ChevronDown size={14} />
      </button>
      
      {showCategoryDropdown && (
        <div className="filter-dropdown-menu open">
          {categoryOptions.map((category, index) => (
            <div 
              key={`category-${index}`} 
              className={`filter-option ${activeFilters.category === category ? 'selected' : ''}`}
              onClick={() => handleCategoryFilter(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
    </div>
    
    {/* Transactions Dropdown Button */}
    <div className="filter-dropdown">
      <button 
        className="filter-btn transaction-btn"
        onClick={toggleTransactionDropdown}
        aria-expanded={showTransactionDropdown}
      >
        Transactions <ChevronDown size={14} />
      </button>
      
      {showTransactionDropdown && (
        <div className="filter-dropdown-menu open">
          {transactionTypeOptions.map((type, index) => (
            <div 
              key={`type-${index}`} 
              className={`filter-option ${activeFilters.transactionType === type ? 'selected' : ''}`}
              onClick={() => handleTransactionTypeFilter(type)}
            >
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
    
    {/* Export Button */}
    <button className="export-button" onClick={exportData}>
      Export
    </button>
  </div>
            
      {/* Active Filters Display */}
      {(activeFilters.category || activeFilters.transactionType) && (
        <div className="active-filters">
          {activeFilters.category && (
            <div className="filter-tag">
              Category: {activeFilters.category}
              <span className="filter-tag-remove" onClick={() => removeFilter('category')}>
                <X size={10} />
              </span>
            </div>
          )}
          
          {activeFilters.transactionType && (
            <div className="filter-tag">
              Type: {activeFilters.transactionType}
              <span className="filter-tag-remove" onClick={() => removeFilter('transactionType')}>
                <X size={10} />
              </span>
            </div>
          )}
          
          {(activeFilters.category && activeFilters.transactionType) && (
            <div className="filter-tag" onClick={clearAllFilters}>
              Clear All
            </div>
          )}
        </div>
      )}
      
      <div className="ledger-view-container">
        <h2>Ledger View</h2>
        
        <div className="ledger-table">
          <div className="ledger-header">
            <div className="header-cell">Reference</div>
            <div className="header-cell">Date</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Description</div>
            <div className="header-cell">Type</div>
            <div className="header-cell">Amount</div>
          </div>
          
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction, index) => (
              <div key={index} className={`ledger-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
                <div className="cell">{transaction.reference}</div>
                <div className="cell">{transaction.date}</div>
                <div className="cell">{transaction.category}</div>
                <div className="cell">{transaction.description}</div>
                <div className="cell">{transaction.type}</div>
                <div className="cell amount">{transaction.amount}</div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No transactions match your search criteria.</p>
            </div>
          )}
        </div>
        
        <div className="pagination">
          <button 
            className="pagination-button prev" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            &lt; Prev
          </button>
          
          <div className="page-number">{currentPage}</div>
          
          <button 
            className="pagination-button next" 
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(filteredTransactions.length / itemsPerPage)}
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
export default LedgerView;