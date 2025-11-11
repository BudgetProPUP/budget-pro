import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./BudgetProposal.css";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import {
  getProposals,
  getProposalSummary,
  getProposalDetail,
  reviewProposal,
} from "../../API/proposalAPI";
import { getAccountTypes } from "../../API/dropdownAPI"; // Assuming you create this
// Status Component - Copied from ProposalHistory
const Status = ({ type, name, personName = null, location = null }) => {
  return (
    <div className={`status-${type.split(" ").join("-")}`}>
      <div className="circle"></div>
      {name}
      {(personName != null || location != null) && (
        <span className="status-details">
          <span className="status-to">to</span>
          <div className="icon">
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
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: i === currentPage ? "#007bff" : "white",
            color: i === currentPage ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "40px",
            outline: "none",
          }}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div
      className="paginationContainer"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        padding: "10px 0",
      }}
    >
      {/* Left Side: Page Size Selector */}
      <div
        className="pageSizeSelector"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <label htmlFor="pageSize" style={{ fontSize: "14px" }}>
          Show
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: "6px 8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            outline: "none",
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span style={{ fontSize: "14px" }}>items per page</span>
      </div>

      {/* Right Side: Page Navigation */}
      <div
        className="pageNavigation"
        style={{ display: "flex", alignItems: "center", gap: "5px" }}
      >
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: currentPage === 1 ? "#f0f0f0" : "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
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
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: currentPage === totalPages ? "#f0f0f0" : "white",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

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
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // --- MODIFICATION START: API Data State Management ---
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_proposals: 0,
    pending_approvals: 0,
    total_budget: "0.00",
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ count: 0 });

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(""); // Stores category ID
  const [selectedStatus, setSelectedStatus] = useState(""); // Stores status value e.g., 'SUBMITTED'
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // User profile data
  const userProfile = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    role: user?.roles?.bms || "User",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update current date/time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearchTerm,
          status: selectedStatus,
          items__account__account_type__id: selectedCategory,
        };
        // Remove empty params
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null) {
            delete params[key];
          }
        });

        const res = await getProposals(params);
        setProposals(res.data.results);
        setPagination(res.data);
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedStatus,
    selectedCategory,
  ]);
  // --- MODIFICATION END ---

  // Format date and time for display
  const formattedDay = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = currentDate
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  // --- MODIFICATION START: Fetch initial dropdown and summary data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [summaryRes, categoriesRes] = await Promise.all([
          getProposalSummary(),
          getAccountTypes(), // Use the API for account types as categories
        ]);
        setSummaryData(summaryRes.data);
        setCategories([
          { id: "", name: "All Categories" },
          ...categoriesRes.data,
        ]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // --- MODIFICATION END -

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".nav-dropdown") &&
        !event.target.closest(".profile-container") &&
        !event.target.closest(".notification-container") &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setShowStatusDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Status options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "SUBMITTED", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  // Rejection reasons
  const rejectionReasons = [
    "Budget Constraints",
    "Insufficient Justification",
    "Does Not Align with Strategy",
    "Incomplete Information",
    "Other (Please specify in comments)",
  ];

  // Navigation functions - Updated with LedgerView functionality
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showStatusDropdown) setShowStatusDropdown(false);
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

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    setCurrentPage(1);
  };

  const handleStatusSelect = (statusValue) => {
    setSelectedStatus(statusValue);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setShowCategoryDropdown(false);
    setShowStatusDropdown(false);
  };

  // Updated logout function
  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userSession");
      localStorage.removeItem("userProfile");
      sessionStorage.clear();
      setShowProfileDropdown(false);
      navigate("/login", { replace: true });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/login", { replace: true });
    }
  };

  // Proposal review functions
  const handleReviewClick = async (proposal) => {
    try {
      const res = await getProposalDetail(proposal.id);
      setSelectedProposal(res.data);
      // Determine if view is read-only
      const isReadOnly =
        res.data.status === "APPROVED" || res.data.status === "REJECTED";
      setShowReviewPopup({ visible: true, readOnly: isReadOnly });
    } catch (error) {
      console.error("Failed to fetch proposal details:", error);
    }
  };

  const closeReviewPopup = () => {
    setShowReviewPopup({ visible: false, readOnly: false });
    setSelectedProposal(null);
    setReviewComment("");
    setRejectionReason("");
  };

  const handleStatusChange = (status) => {
    setReviewStatus(status); // 'APPROVED' or 'REJECTED'
    setShowConfirmationPopup(true);
  };

  const closeCommentPopup = () => {
    setShowCommentPopup(false);
  };

  const closeConfirmationPopup = () => {
    setShowConfirmationPopup(false);
  };

  const handleSubmitComment = () => {
    console.log("Comment submitted:", reviewComment);
    closeCommentPopup();
  };

  const handleSubmitReview = async () => {
    if (!selectedProposal) return;

    let finalComment = reviewComment;
    if (reviewStatus === "REJECTED" && rejectionReason) {
      finalComment = `Reason: ${rejectionReason}. \n${reviewComment}`;
    }

    try {
      await reviewProposal(selectedProposal.id, {
        status: reviewStatus,
        comment: finalComment,
      });

      // Success, close popups and refetch data to show update
      closeConfirmationPopup();
      closeReviewPopup();
      // Refetch by slightly changing a dependency of the main useEffect
      setCurrentPage(1); // Resetting page is a good way to trigger refetch
      // A more robust way would be a dedicated "refetch" state trigger
    } catch (error) {
      console.error("Failed to submit review:", error);
      // You could show an error message to the user here
    }
  };

  return (
    <div
      className="app-container"
      style={{ minWidth: "1200px", overflowY: "auto", height: "100vh" }}
    >
      {/* Navigation Bar */}
      <nav
        className="navbar"
        style={{ position: "static", marginBottom: "20px" }}
      >
        <div
          className="navbar-content"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            height: "60px",
          }}
        >
          {/* Logo and System Name */}
          <div
            className="navbar-brand"
            style={{
              display: "flex",
              alignItems: "center",
              height: "60px",
              overflow: "hidden",
              gap: "12px",
            }}
          >
            <div
              style={{
                height: "45px",
                width: "45px",
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
              }}
            >
              <img
                src={LOGOMAP}
                alt="System Logo"
                className="navbar-logo"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <span
              className="system-name"
              style={{
                fontWeight: 700,
                fontSize: "1.3rem",
                color: "var(--primary-color, #007bff)",
              }}
            >
              BudgetPro
            </span>
          </div>

          {/* Main Navigation Links */}
          <div
            className="navbar-links"
            style={{ display: "flex", gap: "20px" }}
          >
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div
                className={`nav-link ${showBudgetDropdown ? "active" : ""}`}
                onClick={toggleBudgetDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: "none" }}
              >
                Budget{" "}
                <ChevronDown
                  size={14}
                  className={`dropdown-arrow ${
                    showBudgetDropdown ? "rotated" : ""
                  }`}
                />
              </div>
              {showBudgetDropdown && (
                <div
                  className="dropdown-menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 1000,
                  }}
                >
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/budget-proposal")}
                  >
                    Budget Proposal
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/proposal-history")}
                  >
                    Proposal History
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/ledger-view")}
                  >
                    Ledger View
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/budget-allocation")}
                  >
                    Budget Allocation
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() =>
                      handleNavigate("/finance/budget-variance-report")
                    }
                  >
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div
                className={`nav-link ${showExpenseDropdown ? "active" : ""}`}
                onClick={toggleExpenseDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{ outline: "none" }}
              >
                Expense{" "}
                <ChevronDown
                  size={14}
                  className={`dropdown-arrow ${
                    showExpenseDropdown ? "rotated" : ""
                  }`}
                />
              </div>
              {showExpenseDropdown && (
                <div
                  className="dropdown-menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 1000,
                  }}
                >
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/expense-tracking")}
                  >
                    Expense Tracking
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/expense-history")}
                  >
                    Expense History
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div
            className="navbar-controls"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            {/* Timestamp/Date */}
            <div
              className="date-time-badge"
              style={{
                background: "#f3f4f6",
                borderRadius: "16px",
                padding: "4px 14px",
                fontSize: "0.95rem",
                color: "#007bff",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
              }}
            >
              {formattedDay}, {formattedDate} | {formattedTime}
            </div>

            {/* Notification Icon */}
            <div className="notification-container">
              <div
                className="notification-icon"
                onClick={toggleNotifications}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <Bell size={20} />
                <span
                  className="notification-badge"
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  3
                </span>
              </div>

              {showNotifications && (
                <div
                  className="notification-panel"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    width: "300px",
                    zIndex: 1000,
                  }}
                >
                  <div
                    className="notification-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h3>Notifications</h3>
                    <button
                      className="clear-all-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ outline: "none" }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="notification-list">
                    <div
                      className="notification-item"
                      style={{
                        display: "flex",
                        padding: "8px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div
                        className="notification-icon-wrapper"
                        style={{ marginRight: "10px" }}
                      >
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div
                          className="notification-title"
                          style={{ fontWeight: "bold" }}
                        >
                          Budget Approved
                        </div>
                        <div className="notification-message">
                          Your Q3 budget has been approved
                        </div>
                        <div
                          className="notification-time"
                          style={{ fontSize: "12px", color: "#666" }}
                        >
                          2 hours ago
                        </div>
                      </div>
                      <button
                        className="notification-delete"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                    <div
                      className="notification-item"
                      style={{
                        display: "flex",
                        padding: "8px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div
                        className="notification-icon-wrapper"
                        style={{ marginRight: "10px" }}
                      >
                        <Bell size={16} />
                      </div>
                      <div className="notification-content" style={{ flex: 1 }}>
                        <div
                          className="notification-title"
                          style={{ fontWeight: "bold" }}
                        >
                          Expense Report
                        </div>
                        <div className="notification-message">
                          New expense report needs review
                        </div>
                        <div
                          className="notification-time"
                          style={{ fontSize: "12px", color: "#666" }}
                        >
                          5 hours ago
                        </div>
                      </div>
                      <button
                        className="notification-delete"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container" style={{ position: "relative" }}>
              <div
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <img
                  src={userProfile.avatar}
                  alt="User avatar"
                  className="profile-image"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
              </div>

              {showProfileDropdown && (
                <div
                  className="profile-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    width: "250px",
                    zIndex: 1000,
                  }}
                >
                  <div
                    className="profile-info-section"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="profile-dropdown-image"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <div className="profile-details">
                      <div
                        className="profile-name"
                        style={{ fontWeight: "bold" }}
                      >
                        {userProfile.name}
                      </div>
                      <div
                        className="profile-role-badge"
                        style={{
                          backgroundColor: "#e9ecef",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          display: "inline-block",
                        }}
                      >
                        {userProfile.role}
                      </div>
                    </div>
                  </div>
                  <div
                    className="dropdown-divider"
                    style={{
                      height: "1px",
                      backgroundColor: "#eee",
                      margin: "10px 0",
                    }}
                  ></div>
                  <div
                    className="dropdown-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <User size={16} style={{ marginRight: "8px" }} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div
                      className="dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 0",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Settings size={16} style={{ marginRight: "8px" }} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div
                    className="dropdown-divider"
                    style={{
                      height: "1px",
                      backgroundColor: "#eee",
                      margin: "10px 0",
                    }}
                  ></div>
                  <div
                    className="dropdown-item"
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <LogOut size={16} style={{ marginRight: "8px" }} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div
        className="content-container"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Budget Summary Cards - Updated with new totals */}
        <div
          className="budget-summary"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div
            className="budget-card"
            style={{
              flex: "1",
              minWidth: "200px",
              maxWidth: "300px",
              height: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px",
              boxSizing: "border-box",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="budget-card-label" style={{ marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Total Proposals
              </p>
            </div>
            <div
              className="budget-card-amount"
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              {summaryData.total_proposals}
            </div>
          </div>

          <div
            className="budget-card"
            style={{
              flex: "1",
              minWidth: "200px",
              maxWidth: "300px",
              height: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px",
              boxSizing: "border-box",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="budget-card-label" style={{ marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Pending Approval
              </p>
            </div>
            <div
              className="budget-card-amount"
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              {summaryData.pending_approvals}
            </div>
          </div>

          <div
            className="budget-card"
            style={{
              flex: "1",
              minWidth: "200px",
              maxWidth: "300px",
              height: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px",
              boxSizing: "border-box",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="budget-card-label" style={{ marginBottom: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Budget Total
              </p>
            </div>
            <div
              className="budget-card-amount"
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >{`₱${parseFloat(summaryData.total_budget).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}</div>
          </div>
        </div>

        {/* Main Content - Updated with LedgerView Layout */}
        <div
          className="proposal-history"
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            padding: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 240px)",
          }}
        >
          {/* Header Section with Title and Controls - Updated with LedgerView styling */}
          <div
            className="top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              className="page-title"
              style={{
                margin: 0,
                fontSize: "29px",
                fontWeight: "bold",
                color: "#0C0C0C",
              }}
            >
              Budget Proposal
            </h2>

            <div
              className="controls-container"
              style={{ display: "flex", gap: "10px" }}
            >
              {/* Search Bar - Updated with LedgerView styling */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-account-input"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Category Filter - Updated with LedgerView styling */}
              <div className="filter-dropdown" style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-btn ${
                    showCategoryDropdown ? "active" : ""
                  }`}
                  onClick={toggleCategoryDropdown}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    outline: "none",
                  }}
                >
                  <span>
                    {
                      (
                        categories.find((c) => c.id === selectedCategory) || {
                          name: "All Categories",
                        }
                      ).name
                    }
                  </span>
                  <ChevronDown size={14} />
                </button>
                {showCategoryDropdown && (
                  <div
                    className="category-dropdown-menu"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      width: "100%",
                      zIndex: 1000,
                    }}
                  >
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`category-dropdown-item ${
                          selectedCategory === category.id ? "active" : ""
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedCategory === category ? "#f0f0f0" : "white",
                          outline: "none",
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter - Updated with LedgerView styling */}
              <div className="filter-dropdown" style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-btn ${
                    showStatusDropdown ? "active" : ""
                  }`}
                  onClick={toggleStatusDropdown}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    outline: "none",
                  }}
                >
                  <span>
                    Status:{" "}
                    {
                      (
                        statusOptions.find(
                          (s) => s.value === selectedStatus
                        ) || { label: "All Status" }
                      ).label
                    }
                  </span>
                  <ChevronDown size={14} />
                </button>
                {showStatusDropdown && (
                  <div
                    className="category-dropdown-menu"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      width: "100%",
                      zIndex: 1000,
                    }}
                  >
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className={`category-dropdown-item ${
                          selectedStatus === status.value ? "active" : ""
                        }`}
                        onClick={() => handleStatusSelect(status.value)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedStatus === status.value
                              ? "#f0f0f0"
                              : "white",
                          outline: "none",
                        }}
                      >
                        {/* MODIFICATION: Use the label property from the object */}
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Separator line between title and table */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#e0e0e0",
              marginBottom: "20px",
            }}
          ></div>

          {/* Proposals Table - Updated with LedgerView table layout */}
          <div
            style={{
              flex: "0 0 auto",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <table
              className="ledger-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      width: "14%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    TICKET ID
                  </th>
                  <th
                    style={{
                      width: "22%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    DESCRIPTION
                  </th>
                  <th
                    style={{
                      width: "20%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    CATEGORY
                  </th>
                  <th
                    style={{
                      width: "14%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    SUBMITTED BY
                  </th>
                  <th
                    style={{
                      width: "12%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    AMOUNT
                  </th>
                  <th
                    style={{
                      width: "14%",
                      padding: "0.75rem",
                      textAlign: "middle",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    STATUS
                  </th>
                  <th
                    style={{
                      width: "12%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      height: "50px",
                      verticalAlign: "middle",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* MODIFICATION: Render proposals from API state */}
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : proposals.length > 0 ? (
                  proposals.map((proposal, index) => (
                    <tr
                      key={proposal.id}
                      className={index % 2 === 1 ? "alternate-row" : ""}
                      style={{
                        backgroundColor:
                          index % 2 === 1 ? "#F8F8F8" : "#FFFFFF",
                        color: "#0C0C0C",
                        height: "50px",
                        transition: "background-color 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fcfcfc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          index % 2 === 1 ? "#F8F8F8" : "#FFFFFF";
                      }}
                      onClick={() => handleReviewClick(proposal)}
                    >
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {proposal.reference}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {proposal.subject}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {proposal.category}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {proposal.submitted_by}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {`₱${parseFloat(proposal.amount).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}`}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <Status
                          type={
                            proposal.status ? proposal.status.toLowerCase() : ""
                          }
                          name={
                            proposal.status
                              ? proposal.status.charAt(0) +
                                proposal.status.slice(1).toLowerCase()
                              : ""
                          }
                        />
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <button
                          className="blue-button action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewClick(proposal);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            minWidth: "70px",
                            outline: "none",
                          }}
                        >
                          {proposal.status === "APPROVED" ||
                          proposal.status === "REJECTED"
                            ? "View"
                            : "Review"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="no-results"
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        height: "50px",
                        verticalAlign: "middle",
                      }}
                    >
                      No proposals match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MODIFICATION: Use pagination info from API */}
          {pagination.count > 0 && !loading && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={pagination.count}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </div>
      </div>

      {/* All popup components remain unchanged */}
      {/* Review Popup */}
      {showReviewPopup && selectedProposal && (
        <div
          className="popup-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="review-popup"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div
              className="popup-header"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                paddingBottom: "5px",
                height: "60px",
                minHeight: "60px",
              }}
            >
              <button
                className="back-button"
                onClick={closeReviewPopup}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#007bff",
                  fontSize: "16px",
                  padding: "0",
                  margin: "0",
                  height: "100%",
                  alignSelf: "flex-start",
                  outline: "none",
                }}
              >
                <ArrowLeft size={20} style={{ marginTop: "2px" }} />
              </button>
              <h2
                className="proposal-title"
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                Budget Proposal
              </h2>
              <div className="print-section" style={{ width: "100px" }}>
                <a
                  href="#"
                  className="print-link"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Print File
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="popup-content">
              {/* Title and Date */}
              <div className="proposal-header">
                <h3 className="proposal-project-title">
                  {selectedProposal.description}
                </h3>
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
                  <strong>Budget Amount:</strong>{" "}
                  {selectedProposal.budgetAmount}
                </div>
                <div className="detail-item">
                  <strong>Submitted by:</strong> {selectedProposal.submittedBy}
                </div>
              </div>

              {/* Project Summary */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT SUMMARY:</h4>
                <p className="section-content">
                  A complete redesign initiative aimed at improving mobile user
                  engagement and operational efficiency. This project aims to
                  achieve a 35% increase in mobile conversion rates and ensure
                  seamless integration with existing CRM systems, thereby
                  enhancing customer lifecycle management. This aligns with
                  organizational goals to optimize digital experiences and
                  streamline sales workflows.
                </p>
              </div>

              {/* Project Description */}
              <div className="proposal-section">
                <h4 className="section-label">PROJECT DESCRIPTION:</h4>
                <p className="section-content">
                  ● Responsive Design Implementation: Rebuild front-end
                  interfaces to ensure full compatibility across all mobile and
                  desktop devices. UX Optimization: Conduct A/B testing, heatmap
                  analysis, and apply best practices in user journey flow to
                  boost engagement.
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
                    <div className="cost-cell">
                      Purchase of workstations, servers, and mobile testing
                      devices
                    </div>
                    <div className="cost-cell">₱25,000.00</div>
                  </div>

                  <div className="cost-table-row">
                    <div className="cost-cell">
                      <span className="cost-bullet green"></span>
                      Software
                    </div>
                    <div className="cost-cell">
                      Licenses for Figma, Adobe CC, browser testing tools, and
                      CRM APIs
                    </div>
                    <div className="cost-cell">₱25,000.00</div>
                  </div>

                  <div className="cost-table-total">
                    <div className="cost-cell"></div>
                    <div className="cost-cell"></div>
                    <div
                      className="cost-cell total-amount"
                      style={{ textAlign: "right" }}
                    >
                      ₽50,000.00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons - Hide Approve/Reject if already approved */}
            <div
              className="popup-footer"
              style={{ marginTop: "20px", paddingTop: "15px" }}
            >
              <div
                className="action-buttons"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                {selectedProposal.status !== "approved" && (
                  <>
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleStatusChange("approved")}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        minWidth: "80px",
                        outline: "none",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleStatusChange("rejected")}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        minWidth: "80px",
                        outline: "none",
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedProposal.status === "approved" && (
                  <button
                    className="action-btn view-btn"
                    style={{
                      padding: "8px 16px",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      minWidth: "80px",
                      outline: "none",
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Status Popup */}
      {showConfirmationPopup && selectedProposal && (
        <div
          className="popup-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="approval-status-popup"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div
              className="approval-status-header"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                paddingBottom: "10px",
                height: "60px",
                minHeight: "60px",
              }}
            >
              <button
                className="back-button"
                onClick={closeConfirmationPopup}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#007bff",
                  fontSize: "16px",
                  padding: "0",
                  margin: "0",
                  height: "100%",
                  alignSelf: "flex-start",
                  outline: "none",
                }}
              >
                <ArrowLeft size={20} style={{ marginTop: "2px" }} />
              </button>
              <h2
                className="approval-status-title"
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                {reviewStatus === "approved"
                  ? "Approval Status"
                  : "Rejected Status"}
              </h2>
              <div style={{ width: "100px" }}></div>
            </div>

            <div className="approval-status-content">
              {/* Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className={`status-dot ${reviewStatus}`}></div>
                  <span className="status-text">
                    {reviewStatus === "approved"
                      ? "Approved by Finance Department"
                      : "Rejected by Finance Department"}
                  </span>
                </div>
                <div className="status-timestamp">
                  {/* Updated timestamp format - removed seconds */}
                  {new Date().toLocaleString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    // Removed seconds
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
                  <strong>Budget Amount:</strong>{" "}
                  {selectedProposal.budgetAmount}
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
              {reviewStatus === "rejected" && (
                <div className="rejection-reason-section">
                  <label className="comment-input-label">
                    Rejection Reason:
                  </label>
                  <select
                    className="rejection-reason-select"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      outline: "none",
                    }}
                  >
                    <option value="">Select a reason</option>
                    {rejectionReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comment Section - Only show for rejected status */}
              {reviewStatus === "rejected" && (
                <div className="comment-input-section">
                  <label className="comment-input-label">Comment:</label>
                  <textarea
                    className="comment-textarea-input"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add your comments here"
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      outline: "none",
                      resize: "vertical",
                    }}
                  ></textarea>
                </div>
              )}

              {/* Approval Metadata */}
              <div
                className="approval-metadata"
                style={{
                  backgroundColor:
                    reviewStatus === "approved" ? "#d4edda" : "#f8d7da",
                  padding: "15px",
                  borderRadius: "8px",
                  marginTop: "20px",
                }}
              >
                <div className="metadata-item">
                  <strong>
                    {reviewStatus === "approved"
                      ? "Approved By:"
                      : "Rejected By:"}
                  </strong>{" "}
                  {userProfile.name} ({userProfile.role})
                </div>
                <div className="metadata-item">
                  <strong>Timestamp:</strong>
                  {/* Updated timestamp format - removed seconds */}
                  {new Date().toLocaleString("en-PH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    // Removed seconds
                  })}
                </div>
                {reviewComment && (
                  <div className="metadata-item">
                    <strong>Comment:</strong> {reviewComment}
                  </div>
                )}
                {reviewStatus === "rejected" && rejectionReason && (
                  <div className="metadata-item">
                    <strong>Rejection Reason:</strong> {rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="approval-status-footer"
              style={{ marginTop: "20px", paddingTop: "15px" }}
            >
              <button
                className="submit-comment-button"
                onClick={handleSubmitReview}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  minWidth: "80px",
                  outline: "none",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Popup */}
      {showCommentPopup && selectedProposal && (
        <div
          className="popup-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="approval-status-popup"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div
              className="approval-status-header"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                paddingBottom: "10px",
                height: "40px",
                minHeight: "40px",
              }}
            >
              <button
                className="back-button"
                onClick={closeCommentPopup}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#007bff",
                  fontSize: "16px",
                  padding: "0",
                  margin: "0",
                  height: "100%",
                  alignSelf: "flex-start",
                  outline: "none",
                }}
              >
                <ArrowLeft size={20} style={{ marginTop: "2px" }} />
                Back
              </button>
              <h2
                className="approval-status-title"
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                Approval Status
              </h2>
              <div style={{ width: "100px" }}></div>
            </div>

            <div className="approval-status-content">
              {/* Approval Status Indicator */}
              <div className="status-section">
                <div className="status-indicator">
                  <div className="status-dot approved"></div>
                  <span className="status-text">
                    Approved by Finance Department
                  </span>
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
                  <strong>Budget Amount:</strong>{" "}
                  {selectedProposal.budgetAmount}
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
            </div>

            {/* Footer */}
            <div
              className="approval-status-footer"
              style={{ marginTop: "20px", paddingTop: "15px" }}
            >
              <button
                className="submit-comment-button"
                onClick={handleSubmitComment}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  minWidth: "80px",
                  outline: "none",
                }}
              >
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
