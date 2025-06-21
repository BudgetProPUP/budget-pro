import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ArrowLeft, ChevronLeft, ChevronRight, User, Mail, Briefcase, LogOut } from 'lucide-react';
import LOGOMAP from '../../assets/MAP.jpg';
import './ProposalHistory.css';

const ProposalHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtered proposals based on selected status and search term
  const filteredProposals = proposals.filter(proposal => {
    const matchesStatus = selectedStatus === 'All Status' || 
      proposal.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div className="page">
        <div className="container">
          {/* Header Section with Title and Controls - Updated to match Account Setup */}
          <div className="top">
            <h2 
              style={{ 
                margin: 0, 
                fontSize: '29px', 
                fontWeight: 'bold', 
                color: '#242424',
              }}
            >
              Proposal History 
            </h2>
            
            <div>
              <div className="filter-controls" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', // This pushes everything to the right
                alignItems: 'center',
                gap: '1rem',
                width: '100%'
              }}></div>
              <input
                type="text"
                placeholder="Search by proposal ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-account-input"
              />
              
              {/* Updated Status Filter with Oblong Shape */}
              <div 
                className="status-dropdown-container" 
                style={{ 
                  display: 'inline-block', 
                  position: 'relative' 
                }}
              >
                <button 
                  className="oblong-filter-btn" 
                  onClick={toggleStatusDropdown}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '140px',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  <span>{selectedStatus}</span>
                  <ChevronDown size={14} />
                </button>
                {showStatusDropdown && (
                  <div 
                    className="oblong-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      right: '0',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      marginTop: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      className={`oblong-dropdown-item ${
                        selectedStatus === 'All Status' ? 'active' : ''
                      }`}
                      onClick={() => handleStatusSelect('All Status')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        color: selectedStatus === 'All Status' ? '#3b82f6' : '#64748b',
                        backgroundColor: selectedStatus === 'All Status' ? '#f0f9ff' : 'white'
                      }}
                      onMouseOver={(e) => {
                        if (selectedStatus !== 'All Status') {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedStatus !== 'All Status') {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      All Status
                    </div>
                    <div
                      className={`oblong-dropdown-item ${
                        selectedStatus === 'Approved' ? 'active' : ''
                      }`}
                      onClick={() => handleStatusSelect('Approved')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        color: selectedStatus === 'Approved' ? '#3b82f6' : '#64748b',
                        backgroundColor: selectedStatus === 'Approved' ? '#f0f9ff' : 'white'
                      }}
                      onMouseOver={(e) => {
                        if (selectedStatus !== 'Approved') {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedStatus !== 'Approved') {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      Approved
                    </div>
                    <div
                      className={`oblong-dropdown-item ${
                        selectedStatus === 'Rejected' ? 'active' : ''
                      }`}
                      onClick={() => handleStatusSelect('Rejected')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        color: selectedStatus === 'Rejected' ? '#3b82f6' : '#64748b',
                        backgroundColor: selectedStatus === 'Rejected' ? '#f0f9ff' : 'white'
                      }}
                      onMouseOver={(e) => {
                        if (selectedStatus !== 'Rejected') {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedStatus !== 'Rejected') {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      Rejected
                    </div>
                    <div
                      className={`oblong-dropdown-item ${
                        selectedStatus === 'Pending' ? 'active' : ''
                      }`}
                      onClick={() => handleStatusSelect('Pending')}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        color: selectedStatus === 'Pending' ? '#3b82f6' : '#64748b',
                        backgroundColor: selectedStatus === 'Pending' ? '#f0f9ff' : 'white'
                      }}
                      onMouseOver={(e) => {
                        if (selectedStatus !== 'Pending') {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedStatus !== 'Pending') {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      Pending
                    </div>
                  </div>
                )}
              </div>             
            </div>
          </div>

          {/* Proposal table with new styling */}
          <table>
            <thead>
              <tr>
                 <th style={{ width: '5%' }}>PROPOSAL ID</th>
                    <th style={{ width: '19%' }}>PROPOSAL</th>
                    <th style={{ width: '13%' }}>LAST MODIFIED</th>
                    <th style={{ width: '8%' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((proposal, index) => (
                <tr key={index}>
                  <td>{proposal.id}</td>
                  <td>{proposal.title}</td>
                  <td>
                    <div>{proposal.lastModified}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>By {proposal.modifiedBy}</div>
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
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '2rem' }}>
                    No proposals match the selected filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <button className="pagination-btn active">1</button>
            
            <button 
              className="pagination-btn"
              onClick={handleNextPage}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalHistory;