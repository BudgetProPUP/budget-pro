import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './BudgetProposal.css';

const proposals = [
  { 
    id: 1, 
    department: 'IT', 
    amount: '₱200,000.00', 
    submittedBy: 'J. Thompson', 
    status: 'pending', 
    action: 'Review', 
    description: 'Website Redesign Project', 
    date: 'April 30, 2025',
    projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.',
    projectDescription: 'Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and enhanced e-commerce capabilities to boost customer engagement and sales conversion.',
    performancePeriod: 'The budget set forth in this Budget Proposal covers the period of performance for the project or 6 months of effort.',
    costElements: [
      { name: 'Hardware', description: 'Workstations, Servers, Testing Devices', amount: '₱50,000.00', color: 'hardware' },
      { name: 'Software', description: 'Design Tools, Development Platforms, Licenses', amount: '₱50,000.00', color: 'software' },
      { name: 'Transportation', description: 'Travel Expenses for Meetings, Site Visits, Logistics', amount: '₱50,000.00', color: 'transportation' },
      { name: 'Store Operation Support', description: 'Temporary Staffing, Customer Support Continuity', amount: '₱50,000.00', color: 'support' }
    ]
  },
  { id: 2, department: 'IT', amount: '₱60,000.00', submittedBy: 'A. Williams', status: 'approved', action: 'View', description: 'Software licenses renewal', date: '2025-04-15' },
  { id: 3, department: 'Operations', amount: '₱50,000.00', submittedBy: 'L. Chen', status: 'rejected', action: 'Review', description: 'Office equipment replacement', date: '2025-04-20' },
];

const BudgetProposal = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const navigate = useNavigate();

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
  };

  const handleCommentClick = () => {
    setShowCommentPopup(true);
  };

  const closeCommentPopup = () => {
    setShowCommentPopup(false);
  };

  const handleSubmitComment = () => {
    // Here you would typically send the comment data to your backend
    console.log('Submitting comment:', {
      proposalId: selectedProposal.id,
      comment: reviewComment
    });
    
    // Close the popup
    closeCommentPopup();
    
    // In a real application, you'd update the proposal after API response
    // For now, we'll just show a simple alert
    alert(`Comment submitted successfully for ${selectedProposal.description}`);
  };

  const handleSubmitReview = () => {
    // Here you would typically send the review data to your backend
    console.log('Submitting review:', {
      proposalId: selectedProposal.id,
      newStatus: reviewStatus,
      comment: reviewComment
    });
    
    // Close the popup
    closeReviewPopup();
    
    // In a real application, you'd update the proposal status after API response
    // For now, we'll just show a simple alert
    alert(`Review submitted successfully. New status: ${reviewStatus}`);
  };

  return (
    <div className="app-container">
      {/* Header/Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle active" onClick={toggleBudgetDropdown}>
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
        <h1 className="page-title">Budget Proposal</h1>
        
        <div className="search-filter-section">
          <div className="search-container">
            <input type="text" placeholder="Search by project or budget" className="search-input" />
            <button className="search-button">
              <i className="search-icon">🔍</i>
            </button>
          </div>
          <button className="filter-btn">Filter by Status <span className="arrow">›</span></button>
        </div>

        <div className="summary-cards">
          <div className="card">
            <div className="card-content">
              <div className="card-title">Total Proposals</div>
              <div className="card-value">5</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="card-title">Pending Approval</div>
              <div className="card-value">3</div>
            </div>
          </div>
          <div className="card budget-total">
            <div className="card-content">
              <div className="card-title">Budget Total</div>
              <div className="card-value">₱50,000</div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Amount</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((item) => (
                <tr key={item.id}>
                  <td>{item.department}</td>
                  <td>{item.amount}</td>
                  <td>{item.submittedBy}</td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => item.action === "Review" ? handleReviewClick(item) : null}
                    >
                      {item.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Review Popup */}
      {showReviewPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="review-popup">
            <div className="popup-header">
              <button className="back-button" onClick={closeReviewPopup}>
                <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <h2 className="proposal-title">Budget Proposal</h2>
              <div className="print-section">
                <a href="#" className="print-link">Print File</a>
              </div>
            </div>
            
            <div className="popup-content">
              <div className="proposal-project-title">
                <h3>{selectedProposal.description || 'Website Redesign Project'}</h3>
                <span className="proposal-date">{selectedProposal.date || 'April 30, 2025'}</span>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">PROJECT SUMMARY:</h4>
                <p className="section-content">
                  This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which 
                  we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">PROJECT DESCRIPTION:</h4>
                <p className="section-content">
                  Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and 
                  enhanced e-commerce capabilities to boost customer engagement and sales conversion.
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">PERIOD OF PERFORMANCE:</h4>
                <p className="section-content">
                  The budget set forth in this Budget Proposal covers the period of performance for the project or 6 months of effort.
                </p>
              </div>
              
              <div className="proposal-section">
                <h4 className="section-title">COST ELEMENTS</h4>
                <div className="cost-table">
                  <div className="cost-table-header">
                    <div className="cost-item-name"></div>
                    <div className="cost-item-description">DESCRIPTION</div>
                    <div className="cost-item-amount">ESTIMATED COST</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet hardware"></span>
                      Hardware
                    </div>
                    <div className="cost-item-description">Workstations, Servers, Testing Devices</div>
                    <div className="cost-item-amount">₱50,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet software"></span>
                      Software
                    </div>
                    <div className="cost-item-description">Design Tools, Development Platforms, Licenses</div>
                    <div className="cost-item-amount">₱50,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet transportation"></span>
                      Transportation
                    </div>
                    <div className="cost-item-description">Travel Expenses for Meetings, Site Visits, Logistics</div>
                    <div className="cost-item-amount">₱50,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-item-name">
                      <span className="cost-bullet support"></span>
                      Store Operation Support
                    </div>
                    <div className="cost-item-description">Temporary Staffing, Customer Support Continuity</div>
                    <div className="cost-item-amount">₱50,000.00</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="popup-footer">
              <div className="action-buttons">
                <button className="action-button comment-button" onClick={handleCommentClick}>Comment</button>
                <button className="action-button reject-button" onClick={() => handleStatusChange('rejected')}>Reject</button>
                <button className="action-button approve-button" onClick={() => {
                  handleStatusChange('approved');
                  handleSubmitReview();
                }}>Approve</button>
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
                <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <h2 className="approval-status-title">Approval Status</h2>
            </div>
            
            <div className="comment-popup-content">
              <div className="approval-info">
                <div className="status-indicator">
                  <span className="status-dot approved"></span>
                  <span className="status-text">Approved by Finance Department</span>
                </div>
                <div className="approval-date">Apr 01, 2025 at 16:00 • Alex Smith</div>
              </div>
              
              <h3 className="proposal-name">IT Equipment Purchase</h3>
              
              <ul className="proposal-details">
                <li>• ₱50,000.00</li>
                <li>• Requested by: IT Department</li>
                <li>• April 10, 2025</li>
              </ul>
              
              <div className="comment-section">
                <p className="comment-label">Comment:</p>
                <textarea 
                  id="comment-input" 
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
    </div>
  );
};

export default BudgetProposal;