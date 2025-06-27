import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  User,
  Mail,
  Briefcase,
  LogOut,
  Search,
} from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import "./BudgetProposal.css";
import LOGOMAP from "../../assets/MAP.jpg";

function BudgetProposal() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const userProfile = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Finance Manager",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  const [proposals, setProposals] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_proposals: 0, // Corrected key
    pending_approvals: 0, // Corrected key
    total_budget: 0,
  });
  const [overviewData, setOverviewData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [selectedCategory, setSelectedCategory] = useState({
    name: "All Categories",
    value: "",
  });
  const [selectedStatus, setSelectedStatus] = useState({
    name: "All Status",
    value: "",
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const itemsPerPage = 5;

  const statusOptions = [
    { name: "All Status", value: "" },
    { name: "Pending", value: "SUBMITTED" },
    { name: "Approved", value: "APPROVED" },
    { name: "Rejected", value: "REJECTED" },
  ];

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        status: selectedStatus.value,
        category: selectedCategory.value,
      });
      const response = await api.get(`/budget-proposals/?${params.toString()}`);
      setProposals(response.data.results);
      setPaginationInfo(response.data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus.value, selectedCategory.value]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [summaryRes, catRes] = await Promise.all([
        api.get("/budget-proposals/summary/"),
        api.get("/dropdowns/account-types/"), // Fetching account types for categories
      ]);
      setSummaryData(summaryRes.data);
      const categoryOptions = [
        { name: "All Categories", value: "" },
        ...catRes.data.map((c) => ({ name: c.name, value: c.name })),
      ];
      setCategories(categoryOptions);
    } catch (err) {
      console.error("Error fetching initial page data:", err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleReviewClick = async (proposal) => {
    setSelectedProposal(proposal);
    setIsModalLoading(true);
    setShowReviewPopup(true);
    try {
      const [overviewRes, detailRes] = await Promise.all([
        api.get(`/budget-proposals/${proposal.id}/review-overview/`),
        api.get(`/budget-proposals/${proposal.id}/`),
      ]);
      setOverviewData(overviewRes.data);
      setSelectedProposal(detailRes.data);
    } catch (err) {
      console.error("Error fetching review data:", err);
      alert("Could not load proposal details.");
      closeReviewPopup();
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeReviewPopup = () => {
    setShowReviewPopup(false);
    setSelectedProposal(null);
    setOverviewData(null);
  };

  const handleStatusChange = (status) => {
    setReviewStatus(status);
    setShowConfirmationPopup(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProposal) return;
    try {
      await api.post(
        `/external-budget-proposals/${selectedProposal.id}/review/`,
        {
          status: reviewStatus.toUpperCase(),
          comment: reviewComment,
        }
      );
      setShowConfirmationPopup(false);
      closeReviewPopup();
      fetchProposals();
      fetchInitialData(); // Refetch summary data as well
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        `Failed to submit review: ${
          error.response?.data?.detail || "Server error"
        }`
      );
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Correctly calculate totalPages from the API response's 'count'
  const totalPages = Math.ceil(paginationInfo.count / itemsPerPage);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img src={LOGOMAP} alt="BudgetPro Logo" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>
            <div className="nav-dropdown">
              <div
                className="nav-item active"
                onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              >
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item active"
                    onClick={() => navigate("/finance/budget-proposal")}
                  >
                    Budget Proposal
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/finance/proposal-history")}
                  >
                    Proposal History
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/finance/ledger-view")}
                  >
                    Ledger View
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/finance/budget-variance-report")}
                  >
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>
            <div className="nav-dropdown">
              <div
                className="nav-item"
                onClick={() => setShowExpenseDropdown(!showExpenseDropdown)}
              >
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/finance/expense-tracking")}
                  >
                    Expense Tracking
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => navigate("/finance/expense-history")}
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
            <div
              className="user-avatar"
              onClick={() => setShowProfilePopup(!showProfilePopup)}
            >
              <img
                src={userProfile.avatar}
                alt="User Avatar"
                className="avatar-img"
              />
            </div>
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
                    <img
                      src={userProfile.avatar}
                      alt="User Avatar"
                      className="profile-avatar-img"
                    />
                  </div>
                  <div className="profile-info">
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <User size={16} />
                        <span className="profile-field-label">Name:</span>
                      </div>
                      <div className="profile-field-value">
                        {userProfile.name}
                      </div>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Mail size={16} />
                        <span className="profile-field-label">E-mail:</span>
                      </div>
                      <div className="profile-field-value profile-email">
                        {userProfile.email}
                      </div>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Briefcase size={16} />
                        <span className="profile-field-label">Role:</span>
                      </div>
                      <div className="profile-field-value profile-role">
                        {userProfile.role}
                      </div>
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
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-content">
              <div className="card-title">Total Proposals</div>
              <div className="card-value">{summaryData.total_proposals}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-content">
              <div className="card-title">Pending Approval</div>
              <div className="card-value">{summaryData.pending_approvals}</div>
            </div>
          </div>
          <div className="summary-card budget-total">
            <div className="card-content">
              <div className="card-title">Budget Total</div>
              <div className="card-value">
                ₱
                {parseFloat(summaryData.total_budget).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          <div className="controls-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-icon-btn" type="button">
                <Search size={16} />
              </button>
            </div>
            <div className="filter-controls">
              <div className="filter-dropdown">
                <button
                  className="filter-dropdown-btn"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {selectedCategory.name} <ChevronDown size={16} />
                </button>
                {showCategoryDropdown && (
                  <div className="category-dropdown-menu">
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        className="category-dropdown-item"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="filter-dropdown">
                <button
                  className="filter-dropdown-btn"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  {selectedStatus.name} <ChevronDown size={16} />
                </button>
                {showStatusDropdown && (
                  <div className="category-dropdown-menu">
                    {statusOptions.map((opt) => (
                      <div
                        key={opt.value}
                        className="category-dropdown-item"
                        onClick={() => {
                          setSelectedStatus(opt);
                          setShowStatusDropdown(false);
                        }}
                      >
                        {opt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <table className="transactions-table">
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
              {isLoading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : (
                proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>{proposal.reference}</td>
                    <td>{proposal.title}</td>
                    <td>{proposal.category}</td>
                    <td>{proposal.submitted_by}</td>
                    <td>
                      ₱
                      {parseFloat(proposal.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${proposal.status.toLowerCase()}`}
                      >
                        {proposal.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="blue-button action-btn"
                        onClick={() => handleReviewClick(proposal)}
                      >
                        {proposal.status === "SUBMITTED" ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!paginationInfo.previous}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!paginationInfo.next}
                className="pagination-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showReviewPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="review-popup">
            <div className="popup-header">
              <button className="back-button" onClick={closeReviewPopup}>
                <ArrowLeft size={20} />
              </button>
              <h2 className="proposal-title">Budget Proposal Review</h2>
            </div>
            {isModalLoading ? (
              <div className="popup-content">
                <p>Loading details...</p>
              </div>
            ) : (
              <>
                <div className="popup-content">
                  {overviewData && (
                    <div className="budget-overview-container">
                      <h3 className="budget-overview-title">Budget Overview</h3>
                      <div className="budget-row">
                        <span className="budget-label">
                          Total Department Budget:
                        </span>
                        <span className="budget-value">
                          ₱
                          {parseFloat(
                            overviewData.total_department_budget
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="budget-row">
                        <span className="budget-label">
                          Currently Allocated (Spent):
                        </span>
                        <span className="budget-value">
                          ₱
                          {parseFloat(
                            overviewData.currently_allocated
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="budget-row">
                        <span className="budget-label">Available Budget:</span>
                        <span className="budget-value">
                          ₱
                          {parseFloat(
                            overviewData.available_budget
                          ).toLocaleString()}
                        </span>
                      </div>
                      <hr className="divider" />
                      <div className="budget-row">
                        <span className="budget-label">
                          Budget After This Proposal:
                        </span>
                        <span
                          className={`budget-value ${
                            overviewData.budget_after_proposal < 0
                              ? "negative-value"
                              : ""
                          }`}
                        >
                          ₱
                          {parseFloat(
                            overviewData.budget_after_proposal
                          ).toLocaleString()}
                        </span>
                      </div>
                      {overviewData.budget_after_proposal < 0 && (
                        <div className="budget-alert">
                          <h4 className="budget-alert-title">
                            Budget Exceeded
                          </h4>
                          <p className="budget-alert-message">
                            This proposal exceeds the available budget.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="proposal-header">
                    <h3 className="proposal-project-title">
                      {selectedProposal.title}
                    </h3>
                  </div>
                  <div className="proposal-section">
                    <h4 className="section-label">PROJECT SUMMARY:</h4>
                    <p className="section-content">
                      {selectedProposal.project_summary}
                    </p>
                  </div>
                </div>
                <div className="popup-footer">
                  <div className="action-buttons">
                    <button
                      className="reject-btn"
                      onClick={() => handleStatusChange("rejected")}
                    >
                      Reject
                    </button>
                    <button
                      className="approve-btn"
                      onClick={() => handleStatusChange("approved")}
                      disabled={
                        overviewData && overviewData.budget_after_proposal < 0
                      }
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showConfirmationPopup && selectedProposal && (
        <div className="popup-overlay">
          <div className="approval-status-popup">
            <div className="approval-status-header">
              <button
                className="back-button"
                onClick={() => setShowConfirmationPopup(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="approval-status-title">
                Confirm {reviewStatus === "approved" ? "Approval" : "Rejection"}
              </h2>
            </div>
            <div className="approval-status-content">
              <h3 className="project-title-section">
                {selectedProposal.title}
              </h3>
              <div className="project-details-section">
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">
                    ₱
                    {parseFloat(
                      selectedProposal.items?.reduce(
                        (sum, item) => sum + parseFloat(item.estimated_cost),
                        0
                      ) || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">
                    {selectedProposal.items?.[0]?.account_code || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Submitted by:</span>
                  <span className="detail-value">
                    {selectedProposal.submitted_by_name}
                  </span>
                </div>
              </div>
              <div className="comment-section">
                <label className="comment-label">Comment:</label>
                <textarea
                  className="comment-textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your comment here..."
                ></textarea>
              </div>
            </div>
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
