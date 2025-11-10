import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ArrowLeft, ChevronLeft, ChevronRight, User, LogOut, Bell, Settings } from 'lucide-react';
import LOGOMAP from '../../assets/MAP.jpg';
import './ProposalHistory.css';

// Import ManageProfile component
import ManageProfile from './ManageProfile';

// Status Component - Integrated directly
const Status = ({
  type,
  name,
  personName = null,
  location = null,
}) => {
  return (
    <div className={`status-${type.split(" ").join("-")}`}>
      <div className="circle"></div>
      {name}
      {(personName != null || location != null) && (
        <span className="status-details">
          <span className="status-to">to</span>
          <div className="icon">
            {/* Since we don't have the icons, we'll use a simple div instead */}
            <div className="icon-placeholder"></div>
          </div>
          <span className="status-target">
            {personName != null ? personName : location}
          </span>
        </span>
      )}
    </div>
  );
};

// Pagination Component - Copied from LedgerView
const Pagination = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pageButton ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(i)}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: i === currentPage ? '#007bff' : 'white',
            color: i === currentPage ? 'white' : 'black',
            cursor: 'pointer',
            borderRadius: '4px',
            minWidth: '40px',
            outline: 'none'
          }}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="paginationContainer" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginTop: '20px',
      padding: '10px 0'
    }}>
      {/* Left Side: Page Size Selector */}
      <div className="pageSizeSelector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="pageSize" style={{ fontSize: '14px' }}>Show</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ 
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            outline: 'none'
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '14px' }}>items per page</span>
      </div>

      {/* Right Side: Page Navigation */}
      <div className="pageNavigation" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white', 
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          onMouseDown={(e) => e.preventDefault()}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ccc', 
            backgroundColor: currentPage === totalPages ? '#f0f0f0' : 'white', 
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ProposalHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Added pageSize state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showManageProfile, setShowManageProfile] = useState(false); // New state for ManageProfile
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Sample data for demonstration
  const proposals = useMemo(() => [
    {
      id: 'FP-2025-042',
      title: 'IT Infrastructure Upgrade',
      lastModified: '04-12-2025',
      modifiedBy: 'J.Thompson',
      status: 'approved',
      category: 'Technology',
      subcategory: 'Hardware'
    },
    {
      id: 'FP-2025-942',
      title: 'Facility Expansion Plan',
      lastModified: '04-12-2025',
      modifiedBy: 'A.Williams',
      status: 'approved',
      category: 'Operations',
      subcategory: 'Facilities'
    },
    {
      id: 'FP-2025-128',
      title: 'DevOps Certification',
      lastModified: '03-25-2025',
      modifiedBy: 'L.Chen',
      status: 'rejected',
      category: 'Human Resources',
      subcategory: 'Training'
    },
    {
      id: 'FP-2025-367',
      title: 'IT Budget',
      lastModified: '02-14-2025',
      modifiedBy: 'K.Thomas',
      status: 'approved',
      category: 'Technology',
      subcategory: 'Software'
    },
    {
      id: 'FP-2025-002',
      title: 'Server Racks',
      lastModified: '01-25-2025',
      modifiedBy: 'A.Ford',
      status: 'approved',
      category: 'Technology',
      subcategory: 'Infrastructure'
    },
    {
      id: 'FP-2024-042',
      title: 'Company Laptops',
      lastModified: '12-12-2024',
      modifiedBy: 'A.Ford',
      status: 'approved',
      category: 'Technology',
      subcategory: 'Hardware'
    },
    {
      id: 'FP-2024-043',
      title: 'Office Renovation',
      lastModified: '11-10-2024',
      modifiedBy: 'M.Johnson',
      status: 'pending',
      category: 'Operations',
      subcategory: 'Facilities'
    },
    {
      id: 'FP-2024-044',
      title: 'Marketing Campaign',
      lastModified: '10-05-2024',
      modifiedBy: 'S.Williams',
      status: 'approved',
      category: 'Marketing',
      subcategory: 'Advertising'
    },
    {
      id: 'FP-2024-045',
      title: 'Employee Training',
      lastModified: '09-15-2024',
      modifiedBy: 'R.Davis',
      status: 'rejected',
      category: 'Human Resources',
      subcategory: 'Training'
    },
    {
      id: 'FP-2024-046',
      title: 'Software Licenses',
      lastModified: '08-20-2024',
      modifiedBy: 'T.Miller',
      status: 'approved',
      category: 'Technology',
      subcategory: 'Software'
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

  // Filter proposals based on search term, category and status
  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.modifiedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || proposal.category === selectedCategory;
      
      const matchesStatus = selectedStatus === 'All Status' || proposal.status === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus, proposals]);

  // Updated pagination logic to use pageSize state
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);

  // Format date and time for display - Updated to include day of week (same as LedgerView)
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).toUpperCase();

  // Close dropdowns when clicking outside
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

  // Update current date/time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Navigation dropdown handlers - Updated with LedgerView functionality
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showStatusDropdown) setShowStatusDropdown(false);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    setCurrentPage(1);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  // New function to handle Manage Profile click
  const handleManageProfile = () => {
    setShowManageProfile(true);
    setShowProfileDropdown(false);
  };

  // New function to close Manage Profile
  const handleCloseManageProfile = () => {
    setShowManageProfile(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      setShowProfileDropdown(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="app-container" style={{ minWidth: '1200px', overflowY: 'auto', height: '100vh' }}>
      {/* Navigation Bar - Updated with LedgerView's exact navbar */}
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
            
            {/* Budget Dropdown - Updated with LedgerView functionality */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showBudgetDropdown ? 'active' : ''}`}
                onClick={toggleBudgetDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: 'none' }}
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
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-allocation')}>
                    Budget Allocation
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown - Updated with LedgerView functionality */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showExpenseDropdown ? 'active' : ''}`}
                onClick={toggleExpenseDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: 'none' }}
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

          {/* User Controls - Updated with LedgerView's exact controls */}
          <div className="navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Timestamp/Date - Updated to match LedgerView format */}
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
              {formattedDay}, {formattedDate} | {formattedTime}
            </div>

            {/* Notification Icon - Updated with LedgerView functionality */}
            <div className="notification-container">
              <div 
                className="notification-icon"
                onClick={toggleNotifications}
                onMouseDown={(e) => e.preventDefault()}
                style={{ position: 'relative', cursor: 'pointer', outline: 'none' }}
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
                    <button 
                      className="clear-all-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ outline: 'none' }}
                    >
                      Clear All
                    </button>
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
                      <button 
                        className="notification-delete" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="notification-item" style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <div className="notification-icon-wrapper" style={{ marginRight: '10px' }}>
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div className="notification-title" style={{ fontWeight: 'bold' }}>Expense Report</div>
                        <div className="notification-message">New expense report needs review</div>
                        <div className="notification-time" style={{ fontSize: '12px', color: '#666' }}>5 hours ago</div>
                      </div>
                      <button 
                        className="notification-delete" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown - Updated with LedgerView functionality */}
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', outline: 'none' }}
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
                  <div 
                    className="dropdown-item" 
                    onClick={handleManageProfile} // Updated to use new function
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <User size={16} style={{ marginRight: '8px' }} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div 
                      className="dropdown-item" 
                      style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Settings size={16} style={{ marginRight: '8px' }} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eee', margin: '10px 0' }}></div>
                  <div 
                    className="dropdown-item" 
                    onClick={handleLogout} 
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer', outline: 'none' }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Updated with LedgerView's layout and functionality */}
      <div className="content-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Conditionally render either ProposalHistory content or ManageProfile */}
        {showManageProfile ? (
          <ManageProfile 
            onClose={handleCloseManageProfile} 
            userProfile={userProfile}
          />
        ) : (
          /* Page Container for everything - Updated with LedgerView styling */
          <div className="proposal-history" style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(80vh - 100px)'
          }}>
            {/* Header Section with Title and Controls - Updated with LedgerView layout */}
            <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="page-title">
                Proposal History 
              </h2>
              
              <div className="controls-container" style={{ display: 'flex', gap: '10px' }}>
                {/* Search Bar - Updated with LedgerView functionality */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-account-input"
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                {/* Category Filter - Updated with LedgerView styling */}
                <div className="filter-dropdown" style={{ position: 'relative' }}>
                  <button 
                    className={`filter-dropdown-btn ${showCategoryDropdown ? 'active' : ''}`} 
                    onClick={toggleCategoryDropdown}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      backgroundColor: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      outline: 'none'
                    }}
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
                          onMouseDown={(e) => e.preventDefault()}
                          style={{ 
                            padding: '8px 12px', 
                            cursor: 'pointer', 
                            backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white',
                            outline: 'none'
                          }}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Status Filter - Updated with LedgerView styling */}
                <div className="filter-dropdown" style={{ position: 'relative' }}>
                  <button 
                    className={`filter-dropdown-btn ${showStatusDropdown ? 'active' : ''}`} 
                    onClick={toggleStatusDropdown}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      backgroundColor: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      outline: 'none'
                    }}
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
                          onMouseDown={(e) => e.preventDefault()}
                          style={{ 
                            padding: '8px 12px', 
                            cursor: 'pointer', 
                            backgroundColor: selectedStatus === status ? '#f0f0f0' : 'white',
                            outline: 'none'
                          }}
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

            {/* Separator line between title and table - Added from LedgerView */}
            <div style={{
              height: '1px',
              backgroundColor: '#e0e0e0',
              marginBottom: '20px'
            }}></div>

            {/* Updated Table Layout - Using LedgerView's steady table design */}
            <div style={{ 
              flex: '0 0 auto',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <table className="ledger-table" style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      width: '15%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>TICKET ID</th>
                    <th style={{ 
                      width: '20%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>CATEGORY</th>
                    <th style={{ 
                      width: '20%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>SUBCATEGORY</th>
                    <th style={{ 
                      width: '15%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>LAST MODIFIED</th>
                    <th style={{ 
                      width: '15%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>MODIFIED BY</th>
                    <th style={{ 
                      width: '15%', 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      height: '50px',
                      verticalAlign: 'middle',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>STATUS</th>
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
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fcfcfc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 1 ? '#F8F8F8' : '#FFFFFF';
                        }}
                      >
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{proposal.id}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{proposal.category}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{proposal.subcategory}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{proposal.lastModified}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>{proposal.modifiedBy}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'middle',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          <Status 
                            type={proposal.status} 
                            name={
                              proposal.status === 'pending' ? 'Pending' : 
                              proposal.status === 'approved' ? 'Approved' : 'Rejected'
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results" style={{ 
                        padding: '20px', 
                        textAlign: 'center',
                        height: '50px',
                        verticalAlign: 'middle'
                      }}>
                        {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                          ? 'No proposals match your search criteria.' 
                          : 'No proposals found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* New Pagination Component from LedgerView */}
            {filteredProposals.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredProposals.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1); // Reset to first page when page size changes
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </div>
        )}
      </div>

      {/* Add Status component CSS directly */}
      <style jsx>{`
        .status-approved,
        .status-rejected,
        .status-pending {
          display: inline-flex;
          height: auto;
          min-height: 4vh;
          width: fit-content;
          flex-direction: row;
          align-items: center;
          padding: 4px 12px;
          border-radius: 40px;
          gap: 5px;
          font-size: 0.75rem;
          overflow: visible;
          white-space: normal;
          max-width: 100%;
        }

        .status-approved .circle,
        .status-rejected .circle,
        .status-pending .circle {
          height: 6px;
          width: 6px;
          border-radius: 50%;
          margin-right: 3px;
          animation: statusPulse 2s infinite;
        }

        @keyframes statusPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(var(--pulse-color), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
          }
        }

        .status-approved {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        .status-approved .circle {
          background-color: #2e7d32;
          --pulse-color: 46, 125, 50;
        }

        .status-rejected {
          background-color: #ffebee;
          color: #c62828;
        }

        .status-rejected .circle {
          background-color: #c62828;
          --pulse-color: 198, 40, 40;
        }

        .status-pending {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        .status-pending .circle {
          background-color: #ef6c00;
          --pulse-color: 239, 108, 0;
        }

        .status-details {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: nowrap;
          max-width: 100%;
        }

        .status-to {
          margin: 0 2px;
          white-space: nowrap;
        }

        .status-target {
          white-space: normal;
          word-break: break-word;
          max-width: 100%;
        }

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-placeholder {
          height: 12px;
          width: '12px';
          flex-shrink: 0;
          background-color: currentColor;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default ProposalHistory;