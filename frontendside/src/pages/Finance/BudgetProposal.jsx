import React, { useState } from 'react';
import { ChevronDown, Search, ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './BudgetProposal.css';

const BudgetProposal = () => {
  // State management
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showNewProposalPopup, setShowNewProposalPopup] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const itemsPerPage = 5; // Number of proposals per page
  const navigate = useNavigate();

  // Date and time formatting
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Sample data
  const proposals = [
    { 
      id: 1, 
      subject: 'Website Redesign Project',
      department: 'IT', 
      amount: '₱50,000.00', 
      submittedBy: 'J.Tompson', 
      status: 'pending', 
      action: 'Review'
    },
    { 
      id: 2, 
      subject: 'Cybersecurity Upgrade',
      department: 'Security', 
      amount: '₱23,040.00', 
      submittedBy: 'A.Williams', 
      status: 'approved', 
      action: 'View'
    },
    { 
      id: 3, 
      subject: 'Cloud Storage Expansion',
      department: 'DevOps', 
      amount: '₱30,000.00', 
      submittedBy: 'L.Chen', 
      status: 'approved', 
      action: 'View'
    },
    { 
      id: 4, 
      subject: 'AR Retail Solution',
      department: 'IT', 
      amount: '₱47,079.00', 
      submittedBy: 'K.Thomas', 
      status: 'rejected', 
      action: 'Review'
    },
    { 
      id: 5, 
      subject: 'Training Program Development',
      department: 'HR', 
      amount: '₱35,600.00', 
      submittedBy: 'M.Johnson', 
      status: 'pending', 
      action: 'Review'
    },
    { 
      id: 6, 
      subject: 'Office Renovation',
      department: 'Facilities', 
      amount: '₱125,400.00', 
      submittedBy: 'R.Garcia', 
      status: 'pending', 
      action: 'Review'
    }
  ];

  // Get unique departments
  const departments = ['All Departments', ...new Set(proposals.map(p => p.department))];
  
  // Status options
  const statusOptions = ['All Status', 'pending', 'approved', 'rejected'];

  // Filter proposals based on search term, department and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           proposal.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
           proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'All Departments' || proposal.department === selectedDepartment;
    
    const matchesStatus = selectedStatus === 'All Status' || proposal.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Navigation functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
  };

  const toggleDepartmentDropdown = () => {
    setShowDepartmentDropdown(!showDepartmentDropdown);
    if (showStatusDropdown) setShowStatusDropdown(false);
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setShowDepartmentDropdown(false);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  // Proposal review functions
  const handleReviewClick = (proposal) => {
    setSelectedProposal(proposal);
    setReviewStatus(proposal.status);
    setReviewComment('');
    setShowReviewPopup(true);
  };

  const closeReviewPopup = () => {
    setShowReviewPopup(false);
    setSelectedProposal(null);
  };

  const handleStatusChange = (status) => {
    setReviewStatus(status);
    if (status === 'approved' || status === 'rejected') {
      setShowConfirmationPopup(true);
    }
  };

  const handleCommentClick = () => {
    setShowCommentPopup(true);
  };

  const closeCommentPopup = () => {
    setShowCommentPopup(false);
  };

  const closeConfirmationPopup = () => {
    setShowConfirmationPopup(false);
  };

  const handleSubmitComment = () => {
    console.log('Comment submitted:', reviewComment);
    closeCommentPopup();
  };

  const handleSubmitReview = () => {
    console.log('Review submitted:', {
      proposalId: selectedProposal?.id,
      newStatus: reviewStatus,
      comment: reviewComment
    });
    closeConfirmationPopup();
    closeReviewPopup();
  };

  // New proposal functions
  const handleNewProposal = () => {
    setShowNewProposalPopup(true);
  };

  const closeNewProposalPopup = () => {
    setShowNewProposalPopup(false);
  };

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

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
                    className="dropdown-item active"
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
        <h2 className="page-title">Budget Proposal</h2>
        
        {/* Search and Filter Controls */}
        <div className="controls-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by project or budget" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>

          <div className="filter-controls">
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleDepartmentDropdown}>
                <span>{selectedDepartment}</span>
                <ChevronDown size={14} />
              </button>
              {showDepartmentDropdown && (
                <div className="category-dropdown-menu">
                  {departments.map((department, index) => (
                    <div
                      key={index}
                      className={`category-dropdown-item ${selectedDepartment === department ? 'active' : ''}`}
                      onClick={() => handleDepartmentSelect(department)}
                    >
                      {department}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="filter-dropdown">
              <button className="filter-dropdown-btn" onClick={toggleStatusDropdown}>
                <span>{selectedStatus}</span>
                <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="category-dropdown-menu">
                  {statusOptions.map((status, index) => (
                    <div
                      key={index}
                      className={`category-dropdown-item ${selectedStatus === status ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(status)}
                    >
                      {status === 'pending' ? 'Pending' :
                       status === 'approved' ? 'Approved' :
                       status === 'rejected' ? 'Rejected' : status}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button className="blue-button add-proposal-btn" onClick={handleNewProposal}>
              <Plus size={16} /> New Proposal
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-content">
              <div className="card-title">Total Proposals</div>
              <div className="card-value">{proposals.length}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-content">
              <div className="card-title">Pending Approval</div>
              <div className="card-value">{pendingCount}</div>
            </div>
          </div>
          <div className="summary-card budget-total">
            <div className="card-content">
              <div className="card-title">Budget Total</div>
              <div className="card-value">₱3,326,025.75</div>
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Subject</th>
                <th style={{ width: '15%' }}>Department</th>
                <th style={{ width: '15%' }}>Submitted By</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProposals.map((proposal) => (
                <tr 
                  key={proposal.id} 
                  onClick={() => handleReviewClick(proposal)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{proposal.subject}</td>
                  <td>{proposal.department}</td>
                  <td>{proposal.submittedBy}</td>
                  <td style={{ textAlign: 'right' }}>{proposal.amount}</td>
                  <td>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status === 'pending' ? 'Pending' : 
                      proposal.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="blue-button action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewClick(proposal);
                      }}
                    >
                      {proposal.action}
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Review Popup */}
      {showReviewPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="review-popup">
            <div className="popup-header">
              <button className="back-button" onClick={closeReviewPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="proposal-title">Budget Proposal</h2>
              <div className="print-section">
                <a href="#" className="print-link">Print File</a>
              </div>
            </div>
            
            <div className="popup-content">
              <div className="proposal-project-title">
                <h3>{selectedProposal.subject}</h3>
                <span className="proposal-date">April 30, 2025</span>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-label">PROJECT SUMMARY</h4>
                <p className="section-content">
                  This budget proposal outlines the costs for the {selectedProposal.subject.toLowerCase()}.
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-label">COST ELEMENTS</h4>
                <div className="cost-table">
                  <div className="cost-header">
                    <div className="cost-type-header">TYPE</div>
                    <div className="cost-desc-header">DESCRIPTION</div>
                    <div className="cost-amount-header">ESTIMATED COST</div>
                  </div>
                  
                  <div className="cost-row">
                    <div className="cost-type">
                      <span className="cost-bullet"></span>
                      Hardware
                    </div>
                    <div className="cost-description">Required equipment</div>
                    <div className="cost-amount">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-row">
                    <div className="cost-type">
                      <span className="cost-bullet"></span>
                      Software
                    </div>
                    <div className="cost-description">Licenses and tools</div>
                    <div className="cost-amount">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-row total">
                    <div className="cost-type"></div>
                    <div className="cost-description">TOTAL</div>
                    <div className="cost-amount">{selectedProposal.amount}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="popup-footer">
              <div className="action-buttons">
                <button className="blue-button comment-btn" onClick={handleCommentClick}>
                  Comment
                </button>
                <button className="blue-button reject-btn" onClick={() => handleStatusChange('rejected')}>
                  Reject
                </button>
                <button className="blue-button approve-btn" onClick={() => handleStatusChange('approved')}>
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Popup */}
      {showCommentPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="comment-popup">
            <div className="comment-popup-header">
              <button className="back-button" onClick={closeCommentPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="approval-status-title">Approval Status</h2>
            </div>
            
            <div className="comment-popup-content">
              <div className="approval-info">
                <div className="status-indicator">
                  <span className={`status-dot ${selectedProposal.status}`}></span>
                  <span className="status-text">
                    {selectedProposal.status === 'pending' ? 'Pending Approval' : 
                     selectedProposal.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <div className="approval-date">May 18, 2025 • Finance Department</div>
              </div>
              
              <h3 className="proposal-name">{selectedProposal.subject}</h3>
              
              <ul className="proposal-details">
                <li>• {selectedProposal.amount}</li>
                <li>• Requested by: {selectedProposal.department} Department</li>
                <li>• Submitted by: {selectedProposal.submittedBy}</li>
              </ul>
              
              <div className="comment-section">
                <p className="comment-label">Comment:</p>
                <textarea 
                  className="comment-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter your comment here..."
                ></textarea>
              </div>
            </div>
            
            <div className="comment-popup-footer">
              <button className="blue-button save-btn" onClick={handleSubmitComment}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmationPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="confirmation-popup">
            <div className="confirmation-header">
              <button className="back-button" onClick={closeConfirmationPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="confirmation-title">
                {reviewStatus === 'approved' ? 'Approve Budget' : 'Reject Budget'}
              </h2>
            </div>
            
            <div className="confirmation-content">
              <div className="confirmation-icon-container">
                <div className={`confirmation-icon ${reviewStatus}`}>
                  {reviewStatus === 'approved' ? '✓' : '✕'}
                </div>
              </div>
              
              <h3 className="confirmation-message">
                {reviewStatus === 'approved' 
                  ? 'Are you sure you want to approve this budget proposal?' 
                  : 'Are you sure you want to reject this budget proposal?'}
              </h3>
              
              <div className="proposal-summary">
                <h4 className="proposal-name">{selectedProposal.subject}</h4>
                <ul className="proposal-details">
                  <li>• Budget Amount: {selectedProposal.amount}</li>
                  <li>• Department: {selectedProposal.department}</li>
                  <li>• Submitted by: {selectedProposal.submittedBy}</li>
                </ul>
              </div>
              
              <div className="comment-section">
                <p className="comment-label">Add Comment:</p>
                <textarea 
                  className="comment-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your comment or reason here..."
                ></textarea>
              </div>
            </div>
            
            <div className="confirmation-footer">
              <button className="blue-button cancel-btn" onClick={closeConfirmationPopup}>
                Cancel
              </button>
              <button 
                className="blue-button confirm-btn" 
                onClick={handleSubmitReview}
              >
                {reviewStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Proposal Popup */}
      {showNewProposalPopup && (
        <div className="popup-overlay">
          <div className="new-proposal-popup">
            <div className="popup-header">
              <button className="back-button" onClick={closeNewProposalPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="popup-title">New Budget Proposal</h2>
            </div>
            
            <div className="popup-content">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" placeholder="Enter proposal subject" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select">
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="Security">Security</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Total Amount</label>
                <div className="amount-input-container">
                  <span className="currency-symbol">₱</span>
                  <input type="text" className="form-input amount-input" placeholder="0.00" />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Enter proposal description"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="cost-items-section">
                <div className="cost-items-header">
                  <h3 className="subsection-title">Cost Items</h3>
                  <button className="blue-button add-item-btn">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                
                <div className="cost-item-form">
                  <div className="cost-item-row">
                    <div className="form-group item-name">
                      <label className="form-label">Item</label>
                      <input type="text" className="form-input" placeholder="Item name" />
                    </div>
                    <div className="form-group item-desc">
                      <label className="form-label">Description</label>
                      <input type="text" className="form-input" placeholder="Item description" />
                    </div>
                    <div className="form-group item-amount">
                      <label className="form-label">Amount</label>
                      <div className="amount-input-container small">
                        <span className="currency-symbol">₱</span>
                        <input type="text" className="form-input amount-input" placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="popup-footer">
              <button className="blue-button cancel-btn" onClick={closeNewProposalPopup}>
                Cancel
              </button>
              <button className="blue-button save-btn">
                Save Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetProposal;