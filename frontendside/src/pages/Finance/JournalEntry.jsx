import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut } from 'lucide-react';
import LOGOMAP from '../../assets/LOGOMAP.png';
import './JournalEntry.css';

function JournalEntry() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of journal entries per page
  const navigate = useNavigate();

  // User profile data (same as Dashboard)
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Initial form state
  const [journalForm, setJournalForm] = useState({
    entryId: 'System generated ID',
    date: '',
    category: '',
    account: '',
    description: '',
    transactionType: '',
    amount: ''
  });

  // Sample journal entries data
  const journalEntries = [
    { id: 'EX-001', date: '05-12-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Internet Bill', amount: 'P8,300' },
    { id: 'AS-001', date: '05-03-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Company Laptops', amount: 'P250,000' },
    { id: 'LI-001', date: '04-21-2025', category: 'Miscellaneous', account: 'Liabilities', description: 'Office Rent', amount: 'P45,000' },
    { id: 'EX-002', date: '04-15-2025', category: 'Miscellaneous', account: 'Expenses', description: 'Electricity Bill', amount: 'P12,750' },
    { id: 'AS-002', date: '04-10-2025', category: 'Equipment & Maintenance', account: 'Assets', description: 'Office Furniture', amount: 'P85,000' },
  ];

  // Get unique categories for the filter dropdown
  const categories = [
    'All Categories', 
    ...new Set(journalEntries.map(entry => entry.category)),
    'Travel',
    'Office Supplies',
    'Utilities',
    'Marketing & Advertising',
    'Professional Services',
    'Training & Development',
  ];

  // Close dropdowns when clicking outside (same as Dashboard)
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter journal entries based on search query and selected category
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setShowCategoryDropdown(false);
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  // Updated logout function with navigation to login screen (same as Dashboard)
  const handleLogout = () => {
    try {
      // Clear any stored authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      
      // Clear session storage
      sessionStorage.clear();
      
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
  
  const openAddJournalModal = () => {
    setShowAddJournalModal(true);
  };
  
  const closeAddJournalModal = () => {
    setShowAddJournalModal(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJournalForm({
      ...journalForm,
      [name]: value
    });
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

      <div className="content-container">
        <h2 className="page-title">Journal Entries</h2>

        <div className="controls-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by reference, description or category"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>

          <div className="filter-controls">
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleCategoryDropdown}>
                <span>{selectedCategory}</span>
                <ChevronDown size={14} />
              </button>
              {showCategoryDropdown && (
                <div className="category-dropdown-menu">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button className="add-journal-button" onClick={openAddJournalModal}>
              Add Journal
            </button>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Reference</th>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '12%' }}>Category</th>
                <th style={{ width: '12%' }}>Account</th>
                <th style={{ width: '12%' }}>Description</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.date}</td>
                  <td>{entry.category}</td>
                  <td>{entry.account}</td>
                  <td>{entry.description}</td>
                  <td style={{ textAlign: 'right' }}>{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
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

      {/* Add Journal Modal */}
      {showAddJournalModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <h3 className="modal-title">Add Journal Entry</h3>
              
              <div className="form-group">
                <label htmlFor="entryId">Entry ID (System generated)</label>
                <input 
                  type="text" 
                  id="entryId" 
                  name="entryId" 
                  value={journalForm.entryId} 
                  disabled 
                  className="form-control"
                />
                <span className="helper-text">System generated ID</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={journalForm.date} 
                  onChange={handleInputChange} 
                  className="form-control"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <div className="select-wrapper">
                  <select 
                    id="category" 
                    name="category" 
                    value={journalForm.category} 
                    onChange={handleInputChange} 
                    className="form-control"
                  >
                    <option value="">Select a category</option>
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Travel">Travel</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Training & Development">Training & Development</option>
                    <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="account">Account</label>
                <div className="select-wrapper">
                  <select 
                    id="account" 
                    name="account" 
                    value={journalForm.account} 
                    onChange={handleInputChange} 
                    className="form-control"
                  >
                    <option value="">Select an Account</option>
                    <option value="asset">Assets</option>
                    <option value="expense">Expenses</option>
                    <option value="liability">Liabilities</option>
                    <option value="revenue">Revenue</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  placeholder="Type here..." 
                  value={journalForm.description} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="transactionType">Transaction type</label>
                <div className="select-wrapper">
                  <select 
                    id="transactionType" 
                    name="transactionType" 
                    value={journalForm.transactionType} 
                    onChange={handleInputChange} 
                    className="form-control"
                  >
                    <option value="">Select transaction type</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input 
                  type="text" 
                  id="amount" 
                  name="amount" 
                  placeholder="₱0.00" 
                  value={journalForm.amount} 
                  onChange={handleInputChange} 
                  className="form-control"
                />
              </div>
              
              <div className="modal-actions">
                <div className="button-row">
                  <button className="btn-cancel" onClick={closeAddJournalModal}>Cancel</button>
                  <button className="btn-save">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalEntry;