// src/pages/Finance/BudgetProposal.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ArrowLeft,
  ChevronDown, User, Mail, Briefcase, LogOut
} from 'lucide-react';
import './BudgetProposal.css';

const API_URL = 'https://budget-pro.onrender.com/api/budget-proposals/';

function BudgetProposal() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const itemsPerPage = 5;

  // Budget approval system state
  const totalBudgetLimit = 500000.00;
  const currentBudgetUsed = 420000.00;
  const proposalAmount = selectedProposal ? parseFloat(selectedProposal.amount.replace(/[^0-9.-]+/g, "")) : 0;
  const remainingBudget = totalBudgetLimit - currentBudgetUsed;
  const budgetAfterApproval = remainingBudget - proposalAmount;
  const isBudgetExceeded = budgetAfterApproval < 0;

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Budget summary data
  const [budgetData, setBudgetData] = useState({
    totalProposals: 0,
    pendingApproval: 0,
    budgetTotal: '₱0.00'
  });

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

  // Fetch proposals from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setProposals(response.data);
        setFilteredProposals(response.data);

        const pendingCount = response.data.filter(p => p.status === 'pending').length;
        const totalAmount = response.data.reduce((sum, proposal) => {
          return sum + parseFloat(proposal.amount.replace(/[^0-9.-]+/g, ""));
        }, 0);

        setBudgetData({
          totalProposals: response.data.length,
          pendingApproval: pendingCount,
          budgetTotal: `₱${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        });

      } catch (err) {
        console.error('Error fetching proposals:', err);
        if (err.response?.status === 401) {
          // Token invalid or expired, logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [navigate]);

  // Filter proposals based on search term, category and status
  useEffect(() => {
    const filtered = proposals.filter(proposal => {
      const matchesSearch = proposal.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             proposal.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || proposal.category === selectedCategory;
      
      const matchesStatus = selectedStatus === 'All Status' || proposal.status === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    setFilteredProposals(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [proposals, searchTerm, selectedCategory, selectedStatus]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Navigation functions
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
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
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
    setShowConfirmationPopup(true);
  };

  const closeConfirmationPopup = () => {
    setShowConfirmationPopup(false);
  };

  const handleSubmitReview = async () => {
    if (!selectedProposal) return;

    const token = localStorage.getItem('authToken');
    try {
      await axios.patch(
        `${API_URL}${selectedProposal.id}/`,
        {
          status: reviewStatus,
          comment: reviewComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      const updatedProposals = proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: reviewStatus } : p
      );
      
      setProposals(updatedProposals);
      setShowConfirmationPopup(false);
      setShowReviewPopup(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading proposals...</div>;
  }

  if (error) {
    return <div className="error-container">Failed to load proposals. Please try again later.</div>;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <h1>BUDGET PRO</h1>
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img src={userProfile.avatar} alt="User avatar" className="avatar-img" />
            </div>
            
            {/* Profile Popup */}
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
        {/* Budget Summary Cards */}
        <div className="budget-summary">
          <div className="budget-card">
            <div className="budget-card-label">
              <p>Total Proposals</p>
            </div>
            <div className="budget-card-amount">{budgetData.totalProposals}</div>
          </div>

          <div className="budget-card">
            <div className="budget-card-label">
              <p>Pending Approval</p>
            </div>
            <div className="budget-card-amount">{budgetData.pendingApproval}</div>
          </div>

          <div className="budget-card">
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
              <h2>Budget Proposal</h2>
              
              <div className="header-controls">
                <div className="filter-controls">
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
                  <th>REFERENCE</th>
                  <th>SUBJECT</th>
                  <th>CATEGORY</th>
                  <th>SUBMITTED BY</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentProposals.map((proposal) => (
                  <tr 
                    key={proposal.id} 
                    onClick={() => handleReviewClick(proposal)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{proposal.reference}</td>
                    <td>{proposal.subject}</td>
                    <td>{proposal.category}</td>
                    <td>{proposal.submitted_by}</td>
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
                        {proposal.status === 'pending' ? 'Review' : 'View'}
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
            </div>
            
            {/* Content */}
            <div className="popup-content">
              {/* Budget Overview Section */}
              <div className="budget-overview-container">
                <h3 className="budget-overview-title">Budget Overview</h3>
                
                <div className="budget-row">
                  <span className="budget-label">Total Department Budget:</span>
                  <span className="budget-value">${totalBudgetLimit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <div className="budget-row">
                  <span className="budget-label">Currently Allocated:</span>
                  <span className="budget-value">${currentBudgetUsed.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <div className="budget-row">
                  <span className="budget-label">Available Budget:</span>
                  <span className="budget-value">${remainingBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <hr className="divider" />

                <div className="budget-row">
                  <span className="budget-label">After This Proposal:</span>
                  <span className="negative-value">
                    {budgetAfterApproval < 0 ? '-' : ''}${Math.abs(budgetAfterApproval).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                {/* Budget Exceeded Warning */}
                {budgetAfterApproval < 0 && (
                  <div className="budget-alert">
                    <h4>Budget Exceeded</h4>
                    <p>
                      This proposal exceeds the available budget by ${Math.abs(budgetAfterApproval).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}. 
                      Approval is not possible without additional budget allocation.
                    </p>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="proposal-header">
                <h3 className="proposal-project-title">{selectedProposal.subject}</h3>
              </div>
              
              {/* Project Summary */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT SUMMARY:</h4>
                <p className="section-content">
                  {selectedProposal.description || 'No description provided.'}
                </p>
              </div>
            </div>
            
            {/* Footer with Action Buttons */}
            <div className="popup-footer">
              <div className="action-buttons">
                <button 
                  className={`action-btn reject-btn`}
                  onClick={() => handleStatusChange('rejected')}
                >
                  Reject
                </button>
                <button 
                  className={`action-btn approve-btn ${isBudgetExceeded ? 'disabled-btn' : ''}`}
                  onClick={() => handleStatusChange('approved')}
                  disabled={isBudgetExceeded}
                >
                  Approve
                </button>
              </div>
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
              <h2 className="approval-status-title">Approval Status</h2>
            </div>
            
            <div className="approval-status-content">
              {/* Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className={`status-dot ${reviewStatus === 'approved' ? 'approved' : 'rejected'}`}></div>
                  <span className="status-text">
                    {reviewStatus === 'approved' ? 'APPROVED BY FINANCE DEPARTMENT' : 'REJECTED BY FINANCE DEPARTMENT'}
                  </span>
                </div>
                <div className="status-timestamp">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <hr className="divider" />
              
              {/* Project Title */}
              <h3 className="project-title-section">
                {selectedProposal.subject}
              </h3>
              
              {/* Project Details */}
              <div className="project-info-section">
                <div className="project-detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">{selectedProposal.amount}</span>
                </div>
                <div className="project-detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedProposal.category}</span>
                </div>
                <div className="project-detail-row">
                  <span className="detail-label">Submitted by:</span>
                  <span className="detail-value">{selectedProposal.submitted_by}</span>
                </div>
              </div>
              
              {/* Comment Section */}
              <div className="comment-input-section">
                <label className="comment-input-label">Comment:</label>
                <textarea 
                  className="comment-textarea-input" 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your comment here..."
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            {/* Footer with right-aligned blue button */}
            <div className="approval-status-footer">
              <button 
                className="submit-approval-button" 
                onClick={handleSubmitReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetProposal;