import React, { useState } from 'react';
import { ChevronDown, Search, Filter, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './BudgetProposal.css';

const BudgetProposal = () => {
  // State management
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    }
  ];

  // Navigation functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    setShowBudgetDropdown(false);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  const closeAllDropdowns = () => {
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    // Add actual logout logic here
    console.log('User logged out');
    navigate('/login');
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

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="app-container">
      {/* Header/Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link" onClick={closeAllDropdowns}>
              Dashboard
            </Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </button>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Budget</div>
                  <Link to="/finance/budget-proposal" className="dropdown-item" onClick={closeAllDropdowns}>
                    Budget Proposal
                  </Link>
                  <Link to="/finance/proposal-history" className="dropdown-item" onClick={closeAllDropdowns}>
                    Proposal History
                  </Link>
                  
                  <div className="dropdown-header">Account</div>
                  <Link to="/finance/account-setup" className="dropdown-item" onClick={closeAllDropdowns}>
                    Account Setup
                  </Link>
                  <Link to="/finance/ledger-view" className="dropdown-item" onClick={closeAllDropdowns}>
                    Ledger View
                  </Link>
                  <Link to="/finance/journal-entry" className="dropdown-item" onClick={closeAllDropdowns}>
                    Journal Entries
                  </Link>
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={toggleExpenseDropdown}>
                Expense <ChevronDown size={14} />
              </button>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <Link to="/finance/expense-tracking" className="dropdown-item" onClick={closeAllDropdowns}>
                    Expense Tracking
                  </Link>
                  <Link to="/finance/expense-history" className="dropdown-item" onClick={closeAllDropdowns}>
                    Expense History
                  </Link>
                </div>
              )}
            </div>
            
            <Link to="/finance/user-management" className="nav-link" onClick={closeAllDropdowns}>
              User Management
            </Link>
          </nav>
        </div>
        
        <div className="header-datetime">
          <span className="formatted-date">{formattedDate}</span>
          <span className="formatted-time">{formattedTime}</span>
        </div>
        
        <div className="user-profile dropdown">
          <button className="avatar-button" onClick={toggleProfileDropdown}>
            <img src="/api/placeholder/32/32" alt="User avatar" />
          </button>
          {showProfileDropdown && (
            <div className="dropdown-menu profile-dropdown">
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={14} className="icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Budget Proposal</h1>
        
        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search by project or budget" 
              className="search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">
              <Search size={16} />
            </button>
          </div>
          <button className="filter-btn">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-content">
              <div className="card-title">Total Proposals</div>
              <div className="card-value">{proposals.length}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="card-title">Pending Approval</div>
              <div className="card-value">{pendingCount}</div>
            </div>
          </div>
          <div className="card budget-total">
            <div className="card-content">
              <div className="card-title">Budget Total</div>
              <div className="card-value">₱3,326,025.75</div>
            </div>
          </div>
        </div>

        {/* Proposal Table */}
        <div className="table-container">
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Department</th>
                <th>Submitted By</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>{proposal.subject}</td>
                  <td>{proposal.department}</td>
                  <td>{proposal.submittedBy}</td>
                  <td className="amount-column">{proposal.amount}</td>
                  <td>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status === 'pending' ? 'Pending' : 
                       proposal.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`action-button ${proposal.action.toLowerCase()}`}
                      onClick={() => handleReviewClick(proposal)}
                    >
                      {proposal.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button className="pagination-prev">
              &lt; Prev
            </button>
            <div className="pagination-numbers">
              <button className="pagination-number active">1</button>
              <button className="pagination-number">2</button>
              <button className="pagination-number">3</button>
            </div>
            <button className="pagination-next">
              Next &gt;
            </button>
          </div>
        </div>
      </main>

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
                <h4 className="section-title">PROJECT SUMMARY</h4>
                <p className="section-content">
                  This budget proposal outlines the costs for the {selectedProposal.subject.toLowerCase()}.
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">COST ELEMENTS</h4>
                <div className="cost-table">
                  <div className="cost-table-header">
                    <div>ITEM</div>
                    <div>DESCRIPTION</div>
                    <div>ESTIMATED COST</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet hardware"></span>
                      Hardware
                    </div>
                    <div className="cost-item-description">Required equipment</div>
                    <div className="cost-item-amount">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet software"></span>
                      Software
                    </div>
                    <div className="cost-item-description">Licenses and tools</div>
                    <div className="cost-item-amount">₱25,000.00</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="popup-footer">
              <div className="action-buttons">
                <button className="action-button comment-button" onClick={handleCommentClick}>
                  Comment
                </button>
                <button className="action-button reject-button" onClick={() => handleStatusChange('rejected')}>
                  Reject
                </button>
                <button className="action-button approve-button" onClick={() => handleStatusChange('approved')}>
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
                <div className="approval-date">May 14, 2025 • Finance Department</div>
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
              <button className="save-button" onClick={handleSubmitComment}>
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
              <button className="cancel-button" onClick={closeConfirmationPopup}>
                Cancel
              </button>
              <button 
                className={`confirm-button ${reviewStatus}`} 
                onClick={handleSubmitReview}
              >
                {reviewStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetProposal;