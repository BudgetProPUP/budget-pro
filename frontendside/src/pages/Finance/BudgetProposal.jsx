import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './BudgetProposal.css';

const BudgetProposal = () => {
  // State management
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showPendingStatusPopup, setShowPendingStatusPopup] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const itemsPerPage = 5; // Number of proposals per page
  const navigate = useNavigate();

  // User profile data - copied from Dashboard
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Budget summary data - Updated to match the image
  const budgetData = {
    totalProposals: 6,
    pendingApproval: 3,
    budgetTotal: '₱3,326,025.75'
  };

  // Close dropdowns when clicking outside - updated to include profile
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

  // Sample data with updated categories
  const proposals = [
    { 
      id: 1, 
      subject: 'Website Redesign Project',
      category: 'Training & Development', 
      amount: '₱50,000.00', 
      submittedBy: 'J.Tompson', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '100,000.00',
      requestedBy: 'IT Department'
    },
    { 
      id: 2, 
      subject: 'Cybersecurity Upgrade',
      category: 'Professional Services', 
      amount: '₱23,040.00', 
      submittedBy: 'A.Williams', 
      status: 'approved', 
      action: 'View',
      budgetAmount: '23,040.00',
      requestedBy: 'Security Department'
    },
    { 
      id: 3, 
      subject: 'Cloud Storage Expansion',
      category: 'Professional Service', 
      amount: '₱30,000.00', 
      submittedBy: 'L.Chen', 
      status: 'approved', 
      action: 'View',
      budgetAmount: '30,000.00',
      requestedBy: 'Infrastructure Team'
    },
    { 
      id: 4, 
      subject: 'AR Retail Solution',
      category: 'Professional Service', 
      amount: '₱47,079.00', 
      submittedBy: 'K.Thomas', 
      status: 'rejected', 
      action: 'Review',
      budgetAmount: '47,079.00',
      requestedBy: 'Retail Department'
    },
    { 
      id: 5, 
      subject: 'Training Program Development',
      category: 'Training & Development', 
      amount: '₱35,600.00', 
      submittedBy: 'M.Johnson', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '35,600.00',
      requestedBy: 'HR Department'
    },
    { 
      id: 6, 
      subject: 'Office Renovation',
      category: 'Professional Service', 
      amount: '₱125,400.00', 
      submittedBy: 'R.Garcia', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '125,400.00',
      requestedBy: 'Facilities Department'
    }
  ];

  // Define all available categories
  const categories = [
    'All Categories',
    'Travel',
    'Office Supplies',
    'Utilities',
    'Marketing & Advertising',
    'Professional Services',
    'Training & Development',
    'Equipment & Maintenance',
    'Miscellaneous'
  ];
  
  // Status options
  const statusOptions = ['All Status', 'pending', 'approved', 'rejected'];

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  // Filter proposals based on search term, category and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           proposal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || proposal.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'All Status' || proposal.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Navigation functions - updated to include profile popup
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
    if (showStatusDropdown) setShowStatusDropdown(false);
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
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
    setShowProfilePopup(false);
  };

  // Updated logout function with navigation to login screen - copied from Dashboard
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

  // Updated pending button handler
  const handlePendingClick = () => {
    setShowPendingStatusPopup(true);
  };

  const closePendingStatusPopup = () => {
    setShowPendingStatusPopup(false);
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

  const handleSubmitPendingStatus = () => {
    console.log('Pending status comment submitted:', reviewComment);
    closePendingStatusPopup();
  };

  return (
    <div className="app-container">
      {/* Header - Updated to match Dashboard exactly */}
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
            
            {/* Profile Popup - copied from Dashboard */}
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
        {/* Budget Summary Cards - Updated to match the image */}
        <div className="budget-summary" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <div className="budget-card" style={{ flex: '1', minWidth: '200px' }}>
            <div className="budget-card-label">
              <p>Total Proposals</p>
            </div>
            <div className="budget-card-amount">{budgetData.totalProposals}</div>
          </div>

          <div className="budget-card" style={{ flex: '1', minWidth: '200px' }}>
            <div className="budget-card-label">
              <p>Pending Approval</p>
            </div>
            <div className="budget-card-amount">{budgetData.pendingApproval}</div>
          </div>

          <div className="budget-card" style={{ flex: '1', minWidth: '200px' }}>
            <div className="budget-card-label">
              <p>Budget Total</p>
            </div>
            <div className="budget-card-amount">{budgetData.budgetTotal}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="page">
          <div className="container">
            {/* Header Section with Title and Controls */}
            <div className="top">
              <h2 
                style={{ 
                  margin: 0, 
                  fontSize: '29px', 
                  fontWeight: 'bold', 
                   color:'#242424',
                }}
              >
                Budget Proposal 
              </h2>
              
              <div className="header-controls">
                <div className="filter-controls" style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%'
                }}>
                  <input
                    type="text"
                    placeholder="Search proposals"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-account-input"
                  />
                  
                  {/* Category Filter */}
                  <div className="filter-dropdown">
                    <button 
                      className="filter-dropdown-btn" 
                      onClick={toggleCategoryDropdown}
                    >
                      <span>{selectedCategory}</span>
                      <ChevronDown size={19} />
                    </button>
                    {showCategoryDropdown && (
                      <div className="category-dropdown-menu">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className={`category-dropdown-item ${
                              selectedCategory === category ? 'active' : ''
                            }`}
                            onClick={() => handleCategorySelect(category)}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Status Filter */}
                  <div className="filter-dropdown">
                    <button 
                      className="filter-dropdown-btn" 
                      onClick={toggleStatusDropdown}
                    >
                      <span>Status: {selectedStatus}</span>
                      <ChevronDown size={15} />
                    </button>
                    {showStatusDropdown && (
                      <div className="category-dropdown-menu">
                        {statusOptions.map((status) => (
                          <div
                            key={status}
                            className={`category-dropdown-item ${
                              selectedStatus === status ? 'active' : ''
                            }`}
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
                </div>
              </div>
            </div>

            {/* Proposals Table */}
            <table>
              <thead>
                <tr>
                 <th style={{ width: '24%' }}>SUBJECT</th>
                <th style={{ width: '21%' }}>CATEGORY</th>
                 <th style={{ width: '19%' }}>SUBMITTED BY</th>
                 <th style={{ width: '15%' }}>AMOUNT</th>
                <th style={{ width: '15%' }}>STATUS</th>
                <th style={{ width: '10%' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentProposals.map((proposal) => (
                  <tr 
                    key={proposal.id} 
                    onClick={() => handleReviewClick(proposal)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: '#3b82f6', fontWeight: '500' }}>
                      {proposal.subject}
                    </td>
                    <td>{proposal.category}</td>
                    <td>{proposal.submittedBy}</td>
                    <td>{proposal.amount}</td>
                    <td>
                      <span 
                        className={`status-badge ${
                          proposal.status === 'approved' ? 'active' : 
                          proposal.status === 'pending' ? 'pending' : 'inactive'
                        }`}
                      >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-btn ${
                      currentPage === index + 1 ? 'active' : ''
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Popup */}
      {showReviewPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="review-popup">
            {/* Header */}
            <div className="popup-header">
              <button className="back-button" onClick={closeReviewPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="proposal-title">Budget Proposal</h2>
              <div className="print-section">
                <a href="#" className="print-link">Print File</a>
              </div>
            </div>
            
            {/* Content */}
            <div className="popup-content">
              {/* Title and Date */}
              <div className="proposal-header">
                <h3 className="proposal-project-title">{selectedProposal.subject}</h3>
                <span className="proposal-date">April 30, 2025</span>
              </div>
              
              {/* Project Summary */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT SUMMARY:</h4>
                <p className="section-content">
                  This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which 
                  we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.
                </p>
              </div>
              
              {/* Project Description */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT DESCRIPTION:</h4>
                <p className="section-content">
                  Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and 
                  enhanced e-commerce capabilities to boost customer engagement and sales conversion.
                </p>
              </div>
              
              {/* Period of Performance */}
              <div className="proposal-section">
                <h4 className="section-label">PERIOD OF PERFORMANCE:</h4>
                <p className="section-content">
                  The budget set forth in this Budget Proposal covers the period of performance for the project or 6 months of effort.
                </p>
              </div>
              
              {/* Cost Elements Table */}
              <div className="proposal-section">
                <div className="cost-table">
                  <div className="cost-table-header">
                    <div className="cost-header-cell">COST ELEMENTS</div>
                    <div className="cost-header-cell">DESCRIPTION</div>
                    <div className="cost-header-cell">ESTIMATED COST</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-cell">
                      <span className="cost-bullet green"></span>
                      Hardware
                    </div>
                    <div className="cost-cell">Workstations, Servers, Testing Devices</div>
                    <div className="cost-cell">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-cell">
                      <span className="cost-bullet green"></span>
                      Software
                    </div>
                    <div className="cost-cell">Design Tools, Development Platforms, Licenses</div>
                    <div className="cost-cell">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-table-total">
                    <div className="cost-cell"></div>
                    <div className="cost-cell"></div>
                    <div className="cost-cell total-amount" style={{ textAlign: 'right' }}>
                      ₽50,000.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with Action Buttons */}
            <div className="popup-footer">
              <div className="action-buttons">
                <button className="action-btn approve-btn" onClick={() => handleStatusChange('approved')}>
                  Approve
                </button>
                <button className="action-btn reject-btn" onClick={() => handleStatusChange('rejected')}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Status Popup */}
      {showPendingStatusPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="pending-status-popup">
            {/* Header */}
            <div className="pending-status-header">
              <button className="back-button" onClick={closePendingStatusPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="pending-status-title">Pending Status</h2>
            </div>
            
            <div className="pending-status-content">
              {/* Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className="status-dot pending"></div>
                  <span className="status-text">Review by Finance Department</span>
                </div>
                <div className="status-timestamp">
                  Apr 01, 2025 at 16:00 - Alex Smith
                </div>
              </div>
              
              {/* Project Title */}
              <h3 className="project-title-section">
                {selectedProposal.subject}
              </h3>
              
              {/* Project Details */}
              <div className="project-info-section">
                <div className="project-detail-inline">
                  <strong>Budget Amount:</strong> {selectedProposal.budgetAmount}
                </div>
                <div className="project-detail-inline">
                  <strong>Category:</strong> {selectedProposal.category}
                </div>
                <div className="project-detail-inline">
                  <strong>Requested by:</strong> {selectedProposal.requestedBy}
                </div>
              </div>
              
              {/* Comment Section */}
              <div className="comment-input-section">
                <label className="comment-input-label">Comment:</label>
                <textarea 
                  className="comment-textarea-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder=""
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pending-status-footer">
              <button className="submit-pending-button" onClick={handleSubmitPendingStatus}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Status Popup */}
      {showConfirmationPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="approval-status-popup">
            {/* Header */}
            <div className="approval-status-header">
              <button className="back-button" onClick={closeConfirmationPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="approval-status-title">
                {reviewStatus === 'approved' ? 'Approval Status' : 'Rejected Status'}
              </h2>
            </div>
            
            <div className="approval-status-content">
              {/* Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className={`status-dot ${reviewStatus}`}></div>
                  <span className="status-text">
                    {reviewStatus === 'approved' 
                      ? 'Approved by Finance Department' 
                      : 'Rejected by Finance Department'}
                  </span>
                </div>
                <div className="status-timestamp">
                  Apr 01, 2025 at 16:00 - Alex Smith
                </div>
              </div>
              
              {/* Project Title */}
              <h3 className="project-title-section">
                {selectedProposal.subject}
              </h3>
              
              {/* Project Details */}
              <div className="project-info-section">
                <div className="project-detail-inline">
                  <strong>Budget Amount:</strong> {selectedProposal.budgetAmount}
                </div>
                <div className="project-detail-inline">
                  <strong>Category:</strong> {selectedProposal.category}
                </div>
                <div className="project-detail-inline">
                  <strong>Requested by:</strong> {selectedProposal.requestedBy}
                </div>
              </div>
              
              {/* Comment Section */}
              <div className="comment-input-section">
                <label className="comment-input-label">Comment:</label>
                <textarea 
                  className="comment-textarea-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder=""
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            {/* Footer */}
            <div className="approval-status-footer">
              <button className="submit-comment-button" onClick={handleSubmitReview}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Popup */}
      {showCommentPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="approval-status-popup">
            {/* Header */}
            <div className="approval-status-header">
              <button className="back-button" onClick={closeCommentPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="approval-status-title">Approval Status</h2>
            </div>
            
            <div className="approval-status-content">
              {/* Approval Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className="status-dot approved"></div>
                  <span className="status-text">Approved by Finance Department</span>
                </div>
                <div className="status-timestamp">
                  Apr 01, 2025 at 16:00 - Alex Smith
                </div>
              </div>
              
              {/* Project Title */}
              <h3 className="project-title-section">
                {selectedProposal.subject}
              </h3>
              
              {/* Project Details */}
              <div className="project-info-section">
                <div className="project-detail-inline">
                  <strong>Budget Amount:</strong> {selectedProposal.budgetAmount}
                </div>
                <div className="project-detail-inline">
                  <strong>Category:</strong> {selectedProposal.category}
                </div>
                <div className="project-detail-inline">
                  <strong>Requested by:</strong> {selectedProposal.requestedBy}
                </div>
              </div>
              
              {/* Comment Section */}
              <div className="comment-input-section">
                <label className="comment-input-label">Comment:</label>
                <textarea 
                  className="comment-textarea-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder=""
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            {/* Footer */}
            <div className="approval-status-footer">
              <button className="submit-comment-button" onClick={handleSubmitComment}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetProposal;