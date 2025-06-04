import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut } from 'lucide-react';
import LOGOMAP from '../../assets/LOGOMAP.png';
import './ProposalHistory.css';

const ProposalHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // User profile data - copied from Dashboard
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  // Sample data for demonstration - matching the image exactly
  const [proposals] = useState([
    {
      id: 'FP-2025-042',
      title: 'IT Infrastructure Upgrade',
      lastModified: '04-12-2025',
      modifiedBy: 'J.Thompson',
      status: 'approved',
    },
    {
      id: 'FP-2025-942',
      title: 'Facility Expansion Plan',
      lastModified: '04-12-2025',
      modifiedBy: 'A.Williams',
      status: 'approved',
    },
    {
      id: 'FP-2025-128',
      title: 'DevOps Certification',
      lastModified: '03-25-2025',
      modifiedBy: 'L.Chen',
      status: 'rejected',
    },
    {
      id: 'FP-2025-367',
      title: 'IT Budget',
      lastModified: '02-14-2025',
      modifiedBy: 'K.Thomas',
      status: 'approved',
    },
    {
      id: 'FP-2025-002',
      title: 'Server Racks',
      lastModified: '01-25-2025',
      modifiedBy: 'A.Ford',
      status: 'approved',
    },
    {
      id: 'FP-2024-042',
      title: 'Company Laptops',
      lastModified: '12-12-2024',
      modifiedBy: 'A.Ford',
      status: 'approved'
    }
  ]);

  // Filtered proposals based on selected status
  const filteredProposals = selectedStatus === 'All' 
    ? proposals 
    : proposals.filter(proposal => 
        proposal.status.toLowerCase() === selectedStatus.toLowerCase()
      );

  useEffect(() => {
    // Update time at regular intervals
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns when clicking outside - copied from Dashboard
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container') && !event.target.closest('.status-dropdown-container')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfilePopup(false);
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format time with AM/PM
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  // Format date for display
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showProfilePopup) setShowProfilePopup(false);
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  // New function from Dashboard
  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
    setMobileMenuOpen(false);
  };

  // Updated logout function from Dashboard
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

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
        
        {/* Updated header-right section to match Dashboard */}
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

      {/* Main Content */}
      <div className="content-container">
        <h2 className="page-title">Proposal History</h2>
          
        {/* Search and Filter Bar */}
        <div className="controls-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by project or budget" 
              className="search-input"
            />
            <button className="search-icon-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="filter-controls">
            <button className="filter-dropdown-btn">
              <span>Filter by</span>
              <ChevronDown size={14} />
            </button>
            
            {/* Status dropdown with functionality */}
            <div className="status-dropdown-container">
              <button className="filter-dropdown-btn" onClick={toggleStatusDropdown}>
                <span>Status: {selectedStatus}</span>
                <ChevronDown size={14} />
              </button>
              
              {showStatusDropdown && (
                <div className="status-dropdown-menu">
                  <div 
                    className={`status-dropdown-item ${selectedStatus === 'All' ? 'active' : ''}`}
                    onClick={() => handleStatusSelect('All')}
                  >
                    All
                  </div>
                  <div 
                    className={`status-dropdown-item ${selectedStatus === 'Approved' ? 'active' : ''}`}
                    onClick={() => handleStatusSelect('Approved')}
                  >
                    Approved
                  </div>
                  <div 
                    className={`status-dropdown-item ${selectedStatus === 'Rejected' ? 'active' : ''}`}
                    onClick={() => handleStatusSelect('Rejected')}
                  >
                    Rejected
                  </div>
                  <div 
                    className={`status-dropdown-item ${selectedStatus === 'Pending' ? 'active' : ''}`}
                    onClick={() => handleStatusSelect('Pending')}
                  >
                    Pending
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proposal table */}
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>PROPOSAL ID</th>
                <th>PROPOSAL</th>
                <th>LAST MODIFIED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((proposal, index) => (
                <tr key={index}>
                  <td>{proposal.id}</td>
                  <td>{proposal.title}</td>
                  <td className="modified-info">
                    <div>{proposal.lastModified}</div>
                    <div className="modified-by">By {proposal.modifiedBy}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${proposal.status}`}>
                      {proposal.status === 'approved' ? 'Approved' : 
                       proposal.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-results">No proposals match the selected filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          
        {/* Pagination */}
        <div className="pagination-controls">
          <button 
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={14} />
          </button>
          
          <div className="pagination-numbers">
            <button className="pagination-number active">1</button>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={handleNextPage}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalHistory;