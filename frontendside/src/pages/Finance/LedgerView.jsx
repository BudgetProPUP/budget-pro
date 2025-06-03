import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './LedgerView.css';

const LedgerView = () => {
  // Navigation state
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const navigate = useNavigate();

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
  const [currentDate, setCurrentDate] = useState(new Date());
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
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  // Handle export button click
  const handleExport = () => {
    alert('Exporting data...');
    // Implementation for exporting data
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-logo">BUDGETPRO</h1>
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
          <div className="user-avatar">
            <img src="/api/placeholder/36/36" alt="User avatar" className="avatar-img" />
          </div>
        </div>
      </header>

      <div className="content-container">
        <h2 className="page-title">Ledger View</h2>

        <div className="controls-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Transactions"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>

          <div className="filter-controls">
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleCategoryDropdown}>
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
            
            <button className="export-button" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
                <tr>
                  <th style={{ width: '15%' }}>Reference</th>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '20%' }}>Description</th>
                  <th style={{ width: '15%' }}>Account</th> 
                  <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
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
                <td style={{ textAlign: 'right' }}>{transaction.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results">
                No transactions match your search criteria.
              </td>
            </tr>
          )}
</tbody>
          </table>
          
          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerView;