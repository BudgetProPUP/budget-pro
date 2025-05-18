import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import './JournalEntry.css';

function JournalEntry() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
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
  ];

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
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
    <div className="journal-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  {/* Budget Items */}
                  <h4 className="dropdown-category">Budget</h4>
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

                  {/* Account Items */}
                  <h4 className="dropdown-category">Account</h4>
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
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleExpenseDropdown}>
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
            
            {/* User Management */}
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

      {/* Main Content */}
      <main className="main-content">
        <div className="journal-interface">
          {/* Search and Filters Row */}
          <div className="actions-container">
            <div className="search-box">
              <input type="text" placeholder="Search by project or budget" className="search-input" />
              <button className="search-button">
                <Search size={16} />
              </button>
            </div>
            
            <div className="filter-actions">
              <div className="filter-group">
                <button className="filter-button">
                  <span>Filter by:</span>
                </button>
                
                <div className="dropdown-filter">
                  <select className="filter-select">
                    <option value="">Code</option>
                    <option value="expenses">Expenses</option>
                    <option value="assets">Assets</option>
                  </select>
                </div>
                
                <div className="dropdown-filter">
                  <select className="filter-select">
                    <option value="">Category</option>
                    <option value="expenses">Expenses</option>
                    <option value="assets">Assets</option>
                  </select>
                </div>
              </div>
              
              <button className="add-journal-button" onClick={openAddJournalModal}>
                Add Journal
              </button>
            </div>
          </div>
          
          {/* Journal Entries Card */}
          <div className="journal-card">
            <div className="journal-header">
              <h2>Journal Entries</h2>
            </div>
            
            {/* Journal Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.id}</td>
                      <td>{entry.date}</td>
                      <td>{entry.category}</td>
                      <td>{entry.description}</td>
                      <td>{entry.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

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
                    <option value="expenses">Expenses</option>
                    <option value="assets">Assets</option>
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