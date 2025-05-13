import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X, ChevronDown as ChevronDownIcon } from 'lucide-react';
import './JournalEntry.css';

function JournalEntry() {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const navigate = useNavigate();
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
    { id: '0001', date: '04/01/2025', description: 'Office Supplies payment', totalAmount: '₱50,000.00', status: 'Posted' },
    { id: '0002', date: '03/08/2024', description: 'Monthly Depreciation', totalAmount: '₱50,000.00', status: 'Posted' },
    { id: '0003', date: '03/26/2024', description: 'Office Supplies Payment', totalAmount: '₱50,000.00', status: 'Posted' },
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
      <header className="dashboard-header">
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

      {/* Main Content */}
      <main className="main-content">
        <h2 className="page-title">Journal Entries</h2>
        
        {/* Search and Add Journal */}
        <div className="actions-container">
          <div className="search-box">
            <input type="text" placeholder="Search by project or budget" />
            <button className="search-button">
              <Search size={16} />
            </button>
          </div>

          <button className="add-journal-button" onClick={openAddJournalModal}>Add Journal</button>
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
                      <option value="office-supplies">Office Supplies</option>
                      <option value="utilities">Utilities</option>
                      <option value="depreciation">Depreciation</option>
                    </select>
                    <ChevronDownIcon size={16} className="select-icon" />
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
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="expense">Expense</option>
                      <option value="revenue">Revenue</option>
                    </select>
                    <ChevronDownIcon size={16} className="select-icon" />
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
                    <ChevronDownIcon size={16} className="select-icon" />
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
                  <button className="btn-cancel" onClick={closeAddJournalModal}>Cancel</button>
                  <button className="btn-save">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journal Entry Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.id}</td>
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>{entry.totalAmount}</td>
                  <td>
                    <span className="status-badge">{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default JournalEntry;