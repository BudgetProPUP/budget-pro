import React, { useState } from 'react';
import { ChevronDown, Search, Filter, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './BudgetProposal.css';
import { useNavigate } from 'react-router-dom';

const proposals = [
  { 
    id: 1, 
    subject: 'Website Redesign Project',
    department: 'IT', 
    amount: '₱50,000.00', 
    submittedBy: 'J.Tompson', 
    status: 'pending', 
    action: 'Review', 
    description: 'Website Redesign Project', 
    date: 'April 30, 2025',
    projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.',
    projectDescription: 'Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and enhanced e-commerce capabilities to boost customer engagement and sales conversion.',
    performancePeriod: 'The budget set forth in this Budget Proposal covers the period of performance for the project or 6 months of effort.',
    costElements: [
      { name: 'Hardware', description: 'Workstations, Servers, Testing Devices', amount: '₱25,000.00', color: 'hardware' },
      { name: 'Software', description: 'Design Tools, Development Platforms, Licenses', amount: '₱25,000.00', color: 'software' },
      { name: 'Transportation', description: 'Travel Expenses for Meetings, Site Visits, Logistics', amount: '₱50,000.00', color: 'transportation' },
      { name: 'Store Operation Support', description: 'Temporary Staffing, Customer Support Continuity', amount: '₱50,000.00', color: 'support' }
    ]
  },
  { id: 2, department: 'IT', amount: '₱60,000.00', submittedBy: 'A. Williams', status: 'approved', action: 'View', description: 'Software licenses renewal', date: '2025-04-15' },
  { id: 3, department: 'Operations', amount: '₱50,000.00', submittedBy: 'L. Chen', status: 'rejected', action: 'Review', description: 'Office equipment replacement', date: '2025-04-20' },
];

// Adding more departments for scrollable demonstration
const departments = ['IT', 'Security', 'DevOps', 'Operations', 'Finance', 'Marketing', 'HR', 'Sales', 'Customer Support', 'Legal'];
const statuses = ['Pending', 'Approved', 'Rejected', 'Under Review', 'On Hold'];

const BudgetProposal = () => {
  const navigate = useNavigate();
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

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
    if (showBudgetDropdown) setShowBudgetDropdown(false);
  };

  const toggleDepartmentFilter = () => {
    setShowDepartmentFilter(!showDepartmentFilter);
    if (showStatusFilter) setShowStatusFilter(false);
  };

  const toggleStatusFilter = () => {
    setShowStatusFilter(!showStatusFilter);
    if (showDepartmentFilter) setShowDepartmentFilter(false);
  };

  const handleNavigate = (path) => {
    // Using React Router's navigate function instead of console.log
    navigate(path);
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
    console.log('Submitting comment:', {
      proposalId: selectedProposal?.id,
      comment: reviewComment
    });
    closeCommentPopup();
    alert(`Comment submitted successfully for ${selectedProposal?.description}`);
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', {
      proposalId: selectedProposal?.id,
      newStatus: reviewStatus,
      comment: reviewComment
    });
    closeConfirmationPopup();
    closeReviewPopup();
    alert(`Review submitted successfully. New status: ${reviewStatus}`);
  };

  // Calculate total budget
  const totalBudget = proposals.reduce((sum, proposal) => {
    const amount = parseFloat(proposal.amount.replace('₱', '').replace(',', ''));
    return sum + amount;
  }, 0);

  // Format budget as PHP with commas
  const formattedTotalBudget = `₱${totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  return (
    <div className="app-container">
      {/* Header/Navigation Bar - Updated to match screenshot */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <div className="nav-item" onClick={() => handleNavigate('/dashboard')}>Dashboard</div>
            
            {/* Budget Dropdown */}
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </button>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  {/* Budget Items */}
                  <h4 className="dropdown-category">Budget</h4>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>

                  {/* Account Items */}
                  <h4 className="dropdown-category">Account</h4>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>
                    Account Setup
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
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
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-tracking')}>
                    Expense Tracking
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>
                    Expense History
                  </Link>
                </div>
              )}
            </div>
            
            {/* User Management - Simple Navigation Item */}
            <div className="nav-item" onClick={() => handleNavigate('/finance/user-management')}>
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
        {/* Search and Filter Section - Updated to match screenshot */}
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

        {/* Summary Cards - Updated to match screenshot */}
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

        {/* Proposal Table */}
        <div className="table-container">
          <h2 className="table-title">Budget Proposal</h2>
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
              {proposals.map((item) => (
                <tr key={item.id}>
                  <td>{item.subject}</td>
                  <td>{item.department}</td>
                  <td>{item.submittedBy}</td>
                  <td>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status === 'pending' ? 'Pending' : 
                       proposal.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`action-button ${item.action === 'Review' ? 'review' : 'view'}`}
                      onClick={() => item.action === "Review" ? handleReviewClick(item) : null}
                    >
                      {proposal.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button className="pagination-button prev">{'< Prev'}</button>
            <div className="pagination-numbers">
              <button className="pagination-number active">1</button>
            </div>
            <button className="pagination-button next">{'Next >'}</button>
          </div>
        </div>
        
        <div className="pagination">
          <button className="pagination-prev">&lt; Prev</button>
          <button className="pagination-number active">1</button>
          <button className="pagination-next">Next &gt;</button>
        </div>
      </main>

      {/* Improved Review Popup */}
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
                  {selectedProposal.projectSummary || "This Budget Proposal provides necessary costs associated with the website redesign project (the \"Project\") which we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces."}
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">PROJECT DESCRIPTION:</h4>
                <p className="section-content">
                  {selectedProposal.projectDescription || "Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and enhanced e-commerce capabilities to boost customer engagement and sales conversion."}
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">PERIOD OF PERFORMANCE:</h4>
                <p className="section-content">
                  {selectedProposal.performancePeriod || "The budget set forth in this Budget Proposal covers the period of performance for the project or 6 months of effort."}
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
                  
                  {(selectedProposal.costElements || [
                    { name: 'Hardware', description: 'Workstations, Servers, Testing Devices', amount: '₱25,000.00', color: 'hardware' },
                    { name: 'Software', description: 'Design Tools, Development Platforms, Licenses', amount: '₱25,000.00', color: 'software' },
                    { name: 'Transportation', description: 'Travel Expenses for Meetings, Site Visits, Logistics', amount: '₱50,000.00', color: 'transportation' },
                    { name: 'Store Operation Support', description: 'Temporary Staffing, Customer Support Continuity', amount: '₱50,000.00', color: 'support' }
                  ]).map((item, index) => (
                    <div className="cost-table-row" key={index}>
                      <div className="cost-item-name">
                        <span className={`cost-bullet ${item.color}`}></span>
                        {item.name}
                      </div>
                      <div className="cost-item-description">{item.description}</div>
                      <div className="cost-item-amount">{item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="popup-footer">
              <div className="action-buttons">
                <button className="action-button comment-button" onClick={handleCommentClick}>Comment</button>
                <button className="action-button reject-button" onClick={() => handleStatusChange('rejected')}>Reject</button>
                <button className="action-button approve-button" onClick={() => handleStatusChange('approved')}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improved Comment Popup */}
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
              
              <h3 className="proposal-name">{selectedProposal.description || 'IT Equipment Purchase'}</h3>
              
              <ul className="proposal-details">
                <li>• {selectedProposal.amount}</li>
                <li>• Requested by: {selectedProposal.department} Department</li>
                <li>• {selectedProposal.date}</li>
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
              <button className="save-button" onClick={handleSubmitComment}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* New Confirmation Popup for Approve/Reject */}
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
                <h4 className="proposal-name">{selectedProposal.description}</h4>
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
              <button className="cancel-button" onClick={closeConfirmationPopup}>Cancel</button>
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