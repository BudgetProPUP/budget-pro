import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import './JournalEntry.css';

function JournalEntry() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of journal entries per page
  const navigate = useNavigate();

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
    { id: 'EX-001', date: '05-12-2025', category: 'Expenses', description: 'Internet Bill', amount: 'P8,300' },
    { id: 'AS-001', date: '05-03-2025', category: 'Assets', description: 'Company Laptops', amount: 'P250,000' },
    { id: 'LI-001', date: '04-21-2025', category: 'Liabilities', description: 'Office Rent', amount: 'P45,000' },
    { id: 'EX-002', date: '04-15-2025', category: 'Expenses', description: 'Electricity Bill', amount: 'P12,750' },
    { id: 'AS-002', date: '04-10-2025', category: 'Assets', description: 'Office Furniture', amount: 'P85,000' },
    { id: 'LI-002', date: '03-25-2025', category: 'Liabilities', description: 'Equipment Lease', amount: 'P35,000' },
  ];

  // Get unique categories for the filter dropdown
  const categories = ['All Categories', ...new Set(journalEntries.map(entry => entry.category))];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter journal entries based on search query and selected category
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.id.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setShowCategoryDropdown(false);
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
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
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/ledger-view')}
                  >
                    Ledger View
                  </div>
                  <div
                    className="dropdown-item active"
                    onClick={() => handleNavigate('/finance/journal-entry')}
                  >
                    Journal Entries
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

            {/* User Management - Simple Navigation Item */}
            <div
              className="nav-item"
              onClick={() => handleNavigate('/finance/user-management')}
            >
              User Management
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
                <th style={{ width: '15%' }}>Reference</th>
                <th style={{ width: '15%' }}>Date</th>
                <th style={{ width: '20%' }}>Category</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.date}</td>
                  <td>{entry.category}</td>
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