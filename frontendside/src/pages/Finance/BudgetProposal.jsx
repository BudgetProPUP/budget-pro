import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Bell, User, Settings, LogOut, ChevronLeft, ChevronRight, ArrowLeft, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './BudgetProposal.css';

const BudgetProposal = () => {
  // State management
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
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
      if (!event.target.closest('.nav-dropdown') && 
          !event.target.closest('.profile-container') &&
          !event.target.closest('.notification-container') &&
          !event.target.closest('.filter-dropdown')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setShowStatusDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample data with updated categories and reference numbers
  const proposals = useMemo(() => [
    { 
      id: 1, 
      ticketId: 'BP-2023-001',
      category: 'Training & Development', 
      subCategory: 'Employee Training',
      amount: '₱50,000.00', 
      submittedBy: 'J.Tompson', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '100,000.00',
      requestedBy: 'IT Department',
      vendor: 'TechTrain Inc.',
      description: 'Website Redesign Project',
      approvalMetadata: {
        approvedBy: '',
        rejectedBy: '',
        timestamp: '',
        comments: ''
      }
    },
    { 
      id: 2, 
      ticketId: 'BP-2023-002',
      category: 'Professional Services', 
      subCategory: 'Consulting',
      amount: '₱23,040.00', 
      submittedBy: 'A.Williams', 
      status: 'approved', 
      action: 'View',
      budgetAmount: '23,040.00',
      requestedBy: 'Security Department',
      vendor: 'SecureTech Solutions',
      description: 'Cybersecurity Upgrade',
      approvalMetadata: {
        approvedBy: 'Jane Smith',
        rejectedBy: '',
        timestamp: '2023-05-15 14:30:25',
        comments: 'Approved as budgeted'
      }
    },
    { 
      id: 3, 
      ticketId: 'BP-2023-003',
      category: 'Professional Service', 
      subCategory: 'Software Licensing',
      amount: '₱30,000.00', 
      submittedBy: 'L.Chen', 
      status: 'approved', 
      action: 'View',
      budgetAmount: '30,000.00',
      requestedBy: 'Infrastructure Team',
      vendor: 'CloudServe Ltd.',
      description: 'Cloud Storage Expansion',
      approvalMetadata: {
        approvedBy: 'Robert Johnson',
        rejectedBy: '',
        timestamp: '2023-06-20 10:15:42',
        comments: 'Necessary infrastructure upgrade'
      }
    },
    { 
      id: 4, 
      ticketId: 'BP-2023-004',
      category: 'Professional Service', 
      subCategory: 'Software Development',
      amount: '₱47,079.00', 
      submittedBy: 'K.Thomas', 
      status: 'rejected', 
      action: 'Review',
      budgetAmount: '47,079.00',
      requestedBy: 'Retail Department',
      vendor: 'RetailTech Solutions',
      description: 'AR Retail Solution',
      approvalMetadata: {
        approvedBy: '',
        rejectedBy: 'Sarah Wilson',
        timestamp: '2023-07-05 16:45:18',
        comments: 'Exceeds department budget allocation',
        rejectionReason: 'Budget Constraints'
      }
    },
    { 
      id: 5, 
      ticketId: 'BP-2023-005',
      category: 'Training & Development', 
      subCategory: 'Leadership Program',
      amount: '₱35,600.00', 
      submittedBy: 'M.Johnson', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '35,600.00',
      requestedBy: 'HR Department',
      vendor: 'LeadWell Institute',
      description: 'Training Program Development',
      approvalMetadata: {
        approvedBy: '',
        rejectedBy: '',
        timestamp: '',
        comments: ''
      }
    },
    { 
      id: 6, 
      ticketId: 'BP-2023-006',
      category: 'Professional Service', 
      subCategory: 'Facility Management',
      amount: '₱125,400.00', 
      submittedBy: 'R.Garcia', 
      status: 'pending', 
      action: 'Review',
      budgetAmount: '125,400.00',
      requestedBy: 'Facilities Department',
      vendor: 'BuildRight Contractors',
      description: 'Office Renovation',
      approvalMetadata: {
        approvedBy: '',
        rejectedBy: '',
        timestamp: '',
        comments: ''
      }
    }
  ], []);

  // Define all available categories
  const categories = [
    'All Categories',
    'Travel',
    'Office Supplies',
    'Utilities',
    'Marketing',
    'Professional Services',
    'Training & Development',
    'Maintenance',
    'Miscellaneous'
  ];

  // Status options
  const statusOptions = ['All Status', 'pending', 'approved', 'rejected'];

  // Rejection reasons
  const rejectionReasons = [
    'Budget Constraints',
    'Insufficient Justification',
    'Does Not Align with Strategy',
    'Incomplete Information',
    'Other (Please specify in comments)'
  ];

  // Filter proposals based on search term, category and status
  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const matchesSearch = proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || proposal.category === selectedCategory;
      
      const matchesStatus = selectedStatus === 'All Status' || proposal.status === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus, proposals]);

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
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
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
    setShowProfileDropdown(false);
    setShowNotifications(false);
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
      setShowProfileDropdown(false);
      
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
    setReviewComment(proposal.approvalMetadata?.comments || '');
    setRejectionReason(proposal.approvalMetadata?.rejectionReason || '');
    setShowReviewPopup(true);
  };

  const closeReviewPopup = () => {
    setShowReviewPopup(false);
    setSelectedProposal(null);
    setRejectionReason('');
  };

  const handleStatusChange = (status) => {
    setReviewStatus(status);
    if (status === 'approved' || status === 'rejected') {
      setShowConfirmationPopup(true);
    }
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
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log('Review submitted:', {
      proposalId: selectedProposal?.id,
      newStatus: reviewStatus,
      comment: reviewComment,
      rejectionReason: reviewStatus === 'rejected' ? rejectionReason : '',
      approvedBy: reviewStatus === 'approved' ? userProfile.name : '',
      rejectedBy: reviewStatus === 'rejected' ? userProfile.name : '',
      timestamp: timestamp
    });
    
    closeConfirmationPopup();
    closeReviewPopup();
  };

  // Get current date and time for header
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-PH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = now.toLocaleTimeString('en-PH', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });

  return (
    <div className="app-container" style={{ minWidth: '1200px', overflowY: 'auto', height: '100vh' }}>
      {/* Navigation Bar */}
      <nav className="navbar" style={{ position: 'static', marginBottom: '20px' }}>
        <div className="navbar-content" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 20px',
          height: '60px'
        }}>
          {/* Logo and System Name */}
          <div className="navbar-brand" style={{
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            overflow: 'hidden',
            gap: '12px'
          }}>
            <div style={{
              height: '45px',
              width: '45px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff'
            }}>
              <img
                src={LOGOMAP}
                alt="System Logo"
                className="navbar-logo"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <span className="system-name" style={{
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--primary-color, #007bff)'
            }}>BudgetPro</span>
          </div>

          {/* Main Navigation Links */}
          <div className="navbar-links" style={{ display: 'flex', gap: '20px' }}>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showBudgetDropdown ? 'active' : ''}`}
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} className={`dropdown-arrow ${showBudgetDropdown ? 'rotated' : ''}`} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Budget Allocation
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showExpenseDropdown ? 'active' : ''}`}
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} className={`dropdown-arrow ${showExpenseDropdown ? 'rotated' : ''}`} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-tracking')}>
                    Expense Tracking
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>
                    Expense History
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Timestamp/Date */}
            <div className="date-time-badge" style={{
              background: '#f3f4f6',
              borderRadius: '16px',
              padding: '4px 14px',
              fontSize: '0.95rem',
              color: '#007bff',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              {formattedDate} | {formattedTime}
            </div>

            {/* Notification Icon */}
            <div className="notification-container">
              <div 
                className="notification-icon"
                onClick={toggleNotifications}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <Bell size={20} />
                <span className="notification-badge" style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>3</span>
              </div>
              
              {showNotifications && (
                <div className="notification-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '300px',
                  zIndex: 1000
                }}>
                  <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3>Notifications</h3>
                    <button className="clear-all-btn">Clear All</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item" style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div className="notification-icon-wrapper" style={{ marginRight: '10px' }}>
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div className="notification-title" style={{ fontWeight: 'bold' }}>Budget Approved</div>
                        <div className="notification-message">Your Q3 budget has been approved</div>
                        <div className="notification-time" style={{ fontSize: '12px', color: '#666' }}>2 hours ago</div>
                      </div>
                      <button className="notification-delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div className="notification-item" style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div className="notification-icon-wrapper" style={{ marginRight: '10px' }}>
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div className="notification-title" style={{ fontWeight: 'bold' }}>Expense Report</div>
                        <div className="notification-message">New expense report needs review</div>
                        <div className="notification-time" style={{ fontSize: '12px', color: '666' }}>5 hours ago</div>
                      </div>
                      <button className="notification-delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <img src={userProfile.avatar} alt="User avatar" className="profile-image" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '250px',
                  zIndex: 1000
                }}>
                  <div className="profile-info-section" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img src={userProfile.avatar} alt="Profile" className="profile-dropdown-image" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                    <div className="profile-details">
                      <div className="profile-name" style={{ fontWeight: 'bold' }}>{userProfile.name}</div>
                      <div className="profile-role-badge" style={{ backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', display: 'inline-block' }}>{userProfile.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                    <User size={16} style={{ marginRight: '8px' }} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                      <Settings size={16} style={{ marginRight: '8px' }} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div className="dropdown-item" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Budget Summary Cards - Updated to match the image */}
        <div className="budget-summary" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Proposals</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.totalProposals}</div>
          </div>

          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Pending Approval</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.pendingApproval}</div>
          </div>

          <div className="budget-card" style={{ 
            flex: '1', 
            minWidth: '200px', 
            maxWidth: '300px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <div className="budget-card-label" style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '666' }}>Budget Total</p>
            </div>
            <div className="budget-card-amount" style={{ fontSize: '24px', fontWeight: 'bold' }}>{budgetData.budgetTotal}</div>
          </div>
        </div>

        {/* Main Content - LedgerView Style Layout */}
        <div className="ledger-container" style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 240px)'
        }}>
          {/* Header Section with Title and Controls */}
          <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title">
              Budget Proposal 
            </h2>
            
            <div className="controls-container" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-account-input"
                style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              
              {/* Category Filter */}
              <div className="filter-dropdown" style={{ position: 'relative' }}>
                <button 
                  className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                  onClick={toggleCategoryDropdown}
                  style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown size={14} />
                </button>
                {showCategoryDropdown && (
                  <div className="category-dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    zIndex: 1000
                  }}>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(category)}
                        style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white' }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Status Filter */}
              <div className="filter-dropdown" style={{ position: 'relative' }}>
                <button 
                  className={`filter-dropdown-btn ${showStatusDropdown ? 'active' : ''}`} 
                  onClick={toggleStatusDropdown}
                  style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>Status: {selectedStatus}</span>
                  <ChevronDown size={14} />
                </button>
                {showStatusDropdown && (
                  <div className="category-dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    zIndex: 1000
                  }}>
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className={`category-dropdown-item ${selectedStatus === status ? 'active' : ''}`}
                        onClick={() => handleStatusSelect(status)}
                        style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: selectedStatus === status ? '#f0f0f0' : 'white' }}
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

          {/* Separator line between title and table */}
          <div style={{
            height: '1px',
            backgroundColor: '#e0e0e0',
            marginBottom: '20px'
          }}></div>

          {/* Proposals Table - Made scrollable */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '4px'
          }}>
            <table className="ledger-table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>TICKET ID</th>
                  <th style={{ 
                    width: '24%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>DESCRIPTION</th>
                  <th style={{ 
                    width: '18%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>CATEGORY</th>
                  <th style={{ 
                    width: '16%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>SUBMITTED BY</th>
                  <th style={{ 
                    width: '15%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>AMOUNT</th>
                  <th style={{ 
                    width: '12%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>STATUS</th>
                  <th style={{ 
                    width: '10%', 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #dee2e6',
                    height: '50px',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                  }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentProposals.length > 0 ? (
                  currentProposals.map((proposal, index) => (
                    <tr 
                      key={proposal.id} 
                      className={index % 2 === 1 ? 'alternate-row' : ''} 
                      style={{ 
                        backgroundColor: index % 2 === 1 ? '#F8F8F8' : '#FFFFFF', 
                        color: '#0C0C0C',
                        height: '50px',
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D1D5DB'; // Gray 300
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 1 ? '#F8F8F8' : '#FFFFFF';
                      }}
                      onClick={() => handleReviewClick(proposal)}
                    >
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{proposal.ticketId}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{proposal.description}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{proposal.category} {proposal.subCategory && `- ${proposal.subCategory}`}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{proposal.submittedBy}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>{proposal.amount}</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>
                        <span 
                          className={`status-badge ${
                            proposal.status === 'approved' ? 'active' : 
                            proposal.status === 'pending' ? 'pending' : 'inactive'
                          }`}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'inline-block',
                            textAlign: 'center',
                            minWidth: '70px'
                          }}
                        >
                          {proposal.status === 'pending' ? 'Pending' : 
                           proposal.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #dee2e6',
                        verticalAlign: 'middle'
                      }}>
                        <button 
                          className="blue-button action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewClick(proposal);
                          }}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                          }}
                        >
                          {proposal.action}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results" style={{ 
                      padding: '20px', 
                      textAlign: 'center',
                      height: '50px',
                      verticalAlign: 'middle'
                    }}>
                      No proposals match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '5px',
              marginTop: '20px',
              padding: '10px 0'
            }}>
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
                style={{ padding: '8px 12px', border: '1px solid #ccc', backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
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
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #ccc', 
                    backgroundColor: currentPage === index + 1 ? '#007bff' : 'white',
                    color: currentPage === index + 1 ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
                  style={{ padding: '8px 12px', border: '1px solid #ccc', backgroundColor: currentPage === totalPages ? '#f0f0f0' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Popup */}
      {showReviewPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="review-popup" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
                <h3 className="proposal-project-title">{selectedProposal.description}</h3>
                <span className="proposal-date">April 30, 2025</span>
              </div>
              
              {/* Project Details */}
              <div className="proposal-details-grid">
                <div className="detail-item">
                  <strong>Category:</strong> {selectedProposal.category}
                </div>
                <div className="detail-item">
                  <strong>Sub-Category:</strong> {selectedProposal.subCategory}
                </div>
                <div className="detail-item">
                  <strong>Vendor:</strong> {selectedProposal.vendor}
                </div>
                <div className="detail-item">
                  <strong>Requested by:</strong> {selectedProposal.requestedBy}
                </div>
                <div className="detail-item">
                  <strong>Budget Amount:</strong> {selectedProposal.budgetAmount}
                </div>
                <div className="detail-item">
                  <strong>Submitted by:</strong> {selectedProposal.submittedBy}
                </div>
              </div>
              
              {/* Project Summary */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT SUMMARY:</h4>
                <p className="section-content">
                 A complete redesign initiative aimed at improving mobile user engagement and operational efficiency. This project aims to achieve a 35% increase in mobile conversion rates and ensure seamless integration with existing CRM systems, thereby enhancing customer lifecycle management. This aligns with organizational goals to optimize digital experiences and streamline sales workflows.
                </p>
              </div>
              
              {/* Project Description */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT DESCRIPTION:</h4>
                <p className="section-content">
                  ●	Responsive Design Implementation: Rebuild front-end interfaces to ensure full compatibility across all mobile and desktop devices.
                  ●	CRM Integration: Connect website with Salesforce/HubSpot CRM to centralize lead capture and customer data.
                  ●	E-commerce Functionality Upgrade: Improve checkout speed, payment gateways, and shopping cart UX to reduce abandonment rate.
                  ●	UX Optimization: Conduct A/B testing, heatmap analysis, and apply best practices in user journey flow to boost engagement.
                </p>
              </div>
              
              {/* Period of Performance */}
              <div className="proposal-section">
                <h4 className="section-label">PERIOD OF PERFORMANCE:</h4>
                <p className="section-content">
                 6 months – From June 2025 to November 2025
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
                    <div className="cost-cell">Purchase of workstations, servers, and mobile testing devices</div>
                    <div className="cost-cell">₱25,000.00</div>
                  </div>
                  
                  <div className="cost-table-row">
                    <div className="cost-cell">
                      <span className="cost-bullet green"></span>
                      Software
                    </div>
                    <div className="cost-cell">Licenses for Figma, Adobe CC, browser testing tools, and CRM APIs</div>
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

      {/* Approval/Rejection Status Popup */}
      {showConfirmationPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="approval-status-popup" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
                  {new Date().toLocaleString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
              
              {/* Project Title */}
              <h3 className="project-title-section">
                {selectedProposal.description}
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
                  <strong>Sub-Category:</strong> {selectedProposal.subCategory}
                </div>
                <div className="project-detail-inline">
                  <strong>Vendor:</strong> {selectedProposal.vendor}
                </div>
                <div className="project-detail-inline">
                  <strong>Requested by:</strong> {selectedProposal.requestedBy}
                </div>
              </div>
              
              {/* Rejection Reason (if rejected) */}
              {reviewStatus === 'rejected' && (
                <div className="rejection-reason-section">
                  <label className="comment-input-label">Rejection Reason:</label>
                  <select 
                    className="rejection-reason-select"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    {rejectionReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Comment Section */}
              <div className="comment-input-section">
                <label className="comment-input-label">Comment:</label>
                <textarea 
                  className="comment-textarea-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your comments here"
                  rows="4"
                ></textarea>
              </div>

              {/* Approval Metadata */}
              <div className="approval-metadata">
                <div className="metadata-item">
                  <strong>{reviewStatus === 'approved' ? 'Approved By:' : 'Rejected By:'}</strong> {userProfile.name} ({userProfile.role})
                </div>
                <div className="metadata-item">
                  <strong>Timestamp:</strong> {new Date().toLocaleString('en-PH', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
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
                {selectedProposal.description}
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
                  <strong>Sub-Category:</strong> {selectedProposal.subCategory}
                </div>
                <div className="project-detail-inline">
                  <strong>Vendor:</strong> {selectedProposal.vendor}
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