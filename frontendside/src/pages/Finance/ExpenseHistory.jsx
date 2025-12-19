import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  User,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./ExpenseHistory.css";
import { useAuth } from "../../context/AuthContext";
import {
  getExpenseHistoryList,
  getExpenseCategories,
  getExpenseDetailsForModal,
  getProposalDetails,
} from "../../API/expenseAPI";

// Import ManageProfile component
import ManageProfile from "./ManageProfile";

// Department and Subcategory data structure
const DEPARTMENT_DATA = {
  "Merchandise Planning": {
    subcategories: [
      "Product Range Planning",
      "Buying Costs",
      "Market Research",
      "Inventory Handling Fees",
      "Supplier Coordination",
      "Seasonal Planning Tools",
      "Training",
      "Travel",
      "Software Subscription"
    ]
  },
  "Store Operations": {
    subcategories: [
      "Store Consumables",
      "POS Maintenance",
      "Store Repairs",
      "Sales Incentives",
      "Uniforms",
      "Store Opening Expenses",
      "Store Supplies",
      "Training",
      "Travel",
      "Utilities"
    ]
  },
  "Marketing": {
    subcategories: [
      "Campaign Budget",
      "Branding Materials",
      "Digital Ads",
      "Social Media Management",
      "Events Budget",
      "Influencer Fees",
      "Photography/Videography",
      "Software Subscription",
      "Training",
      "Travel"
    ]
  },
  "Operations": {
    subcategories: [
      "Equipment Maintenance",
      "Fleet/Vehicle Expenses",
      "Operational Supplies",
      "Business Permits",
      "Facility Utilities",
      "Compliance Costs",
      "Training",
      "Office Supplies"
    ]
  },
  "IT": {
    subcategories: [
      "Server Hosting",
      "Software Licenses",
      "Cloud Subscriptions",
      "Hardware Purchases",
      "Data Tools",
      "Cybersecurity Costs",
      "API Subscription Fees",
      "Domain Renewals",
      "Training",
      "Office Supplies"
    ]
  },
  "Logistics Management": {
    subcategories: [
      "Shipping Costs",
      "Warehouse Equipment",
      "Transport & Fuel",
      "Freight Fees",
      "Vendor Delivery Charges",
      "Storage Fees",
      "Packaging Materials",
      "Safety Gear",
      "Training"
    ]
  },
  "Human Resources": {
    subcategories: [
      "Recruitment Expenses",
      "Job Posting Fees",
      "Employee Engagement Activities",
      "Training & Workshops",
      "Medical & Wellness Programs",
      "Background Checks",
      "HR Systems/Payroll Software",
      "Office Supplies",
      "Travel"
    ]
  }
};

// Sample expense data with CapEx and OpEx categories only
const SAMPLE_EXPENSES = [
  {
    id: 1,
    date: "2024-01-15",
    description: "Store Equipment Purchase - POS Systems",
    category_name: "CapEx",
    amount: "250000.00",
    department: "Store Operations",
    subcategory: "POS Maintenance",
    status: "Approved"
  },
  {
    id: 2,
    date: "2024-01-14",
    description: "Q1 Marketing Campaign - Digital Ads",
    category_name: "OpEx",
    amount: "150000.00",
    department: "Marketing",
    subcategory: "Digital Ads",
    status: "Approved"
  },
  {
    id: 3,
    date: "2024-01-10",
    description: "Server Upgrade - IT Infrastructure",
    category_name: "CapEx",
    amount: "500000.00",
    department: "IT",
    subcategory: "Hardware Purchases",
    status: "Pending"
  },
  {
    id: 4,
    date: "2024-01-08",
    description: "Employee Training Workshop - HR",
    category_name: "OpEx",
    amount: "75000.00",
    department: "Human Resources",
    subcategory: "Training & Workshops",
    status: "Approved"
  },
  {
    id: 5,
    date: "2024-01-05",
    description: "Warehouse Equipment - Logistics",
    category_name: "CapEx",
    amount: "300000.00",
    department: "Logistics Management",
    subcategory: "Warehouse Equipment",
    status: "Approved"
  },
  {
    id: 6,
    date: "2024-01-03",
    description: "Office Supplies Purchase - Operations",
    category_name: "OpEx",
    amount: "45000.00",
    department: "Operations",
    subcategory: "Office Supplies",
    status: "Approved"
  },
  {
    id: 7,
    date: "2024-01-02",
    description: "Software Licenses Renewal - IT",
    category_name: "OpEx",
    amount: "120000.00",
    department: "IT",
    subcategory: "Software Licenses",
    status: "Approved"
  },
  {
    id: 8,
    date: "2023-12-28",
    description: "Marketing Campaign Materials",
    category_name: "OpEx",
    amount: "85000.00",
    department: "Marketing",
    subcategory: "Branding Materials",
    status: "Approved"
  },
  {
    id: 9,
    date: "2023-12-25",
    description: "New Store Opening Equipment",
    category_name: "CapEx",
    amount: "600000.00",
    department: "Store Operations",
    subcategory: "Store Opening Expenses",
    status: "Approved"
  },
  {
    id: 10,
    date: "2023-12-20",
    description: "Employee Engagement Activities",
    category_name: "OpEx",
    amount: "55000.00",
    department: "Human Resources",
    subcategory: "Employee Engagement Activities",
    status: "Approved"
  }
];

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
    const pageLimit = 5; // Max number of page buttons to show
    const sideButtons = Math.floor(pageLimit / 2);

    if (totalPages <= pageLimit + 2) {
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
    } else {
      // Always show first page
      pages.push(
        <button
          key={1}
          className={`pageButton ${1 === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(1)}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: 1 === currentPage ? "#007bff" : "white",
            color: 1 === currentPage ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "40px",
            outline: "none",
          }}
        >
          1
        </button>
      );

      let startPage = Math.max(2, currentPage - sideButtons);
      let endPage = Math.min(totalPages - 1, currentPage + sideButtons);

      if (currentPage - sideButtons > 2) {
        pages.push(
          <span
            key="start-ellipsis"
            style={{ padding: "8px", userSelect: "none" }}
          >
            ...
          </span>
        );
      }

      if (currentPage + sideButtons >= totalPages - 1) {
        startPage = totalPages - pageLimit;
      }
      if (currentPage - sideButtons <= 2) {
        endPage = pageLimit;
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
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
      }

      if (currentPage + sideButtons < totalPages - 2) {
        pages.push(
          <span
            key="end-ellipsis"
            style={{ padding: "8px", userSelect: "none" }}
          >
            ...
          </span>
        );
      }

      // Always show last page
      pages.push(
        <button
          key={totalPages}
          className={`pageButton ${totalPages === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(totalPages)}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: totalPages === currentPage ? "#007bff" : "white",
            color: totalPages === currentPage ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "40px",
            outline: "none",
          }}
        >
          {totalPages}
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

const ExpenseHistory = () => {
  const { user, logout } = useAuth(); // MODIFICATION: Get user and logout from context
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  // MODIFICATION START: Updated state management
  const [selectedCategory, setSelectedCategory] = useState(""); // Use empty string for 'All'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showManageProfile, setShowManageProfile] = useState(false); // NEW: State for ManageProfile
  const navigate = useNavigate();

  // New state variables for API data
  const [expenses, setExpenses] = useState(SAMPLE_EXPENSES);
  const [categories, setCategories] = useState([
    { code: "", name: "All Categories" },
    { code: "capex", name: "CapEx" },
    { code: "opex", name: "OpEx" }
  ]);
  const [pagination, setPagination] = useState({
    count: SAMPLE_EXPENSES.length,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedProposalDetails, setSelectedProposalDetails] = useState(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  
  // MODIFICATION START: Add a state for the debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  // MODIFICATION END

  const getUserRole = () => {
  if (!user) return "User";
  
  // Check for role in different possible locations
  if (user.roles?.bms) return user.roles.bms;
  if (user.role_display) return user.role_display;
  if (user.role) return user.role;
  
  // Default role names based on user type
  if (user.is_superuser) return "ADMIN";
  if (user.is_staff) return "STAFF";
  
  return "User";
};

const userRole = getUserRole();

const userProfile = {
  name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || "User" : "User",
  role: userRole,
  avatar: user?.profile_picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

// MODIFICATION START: Added new useEffect hook to handle debouncing
  useEffect(() => {
    // Set a timer to update the debounced search term after 500ms
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search term changes 
    }, 500);

    // Cleanup function to clear the timer if the user keeps typing
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  // MODIFICATION END

  // Filter and paginate sample data
  useEffect(() => {
    const filterExpenses = () => {
      const filtered = SAMPLE_EXPENSES.filter(expense => {
        const matchesSearch = !searchTerm || 
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || 
          expense.category_name.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      });

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedExpenses = filtered.slice(startIndex, endIndex);

      setExpenses(paginatedExpenses);
      setPagination({
        count: filtered.length,
        next: null,
        previous: null,
      });
    };

    filterExpenses();
  }, [currentPage, pageSize, searchTerm, selectedCategory]);

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
        setShowCategoryDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Navigation functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };


  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  // NEW: Function to handle Manage Profile click
  const handleManageProfile = () => {
    setShowManageProfile(true);
    setShowProfileDropdown(false);
  };

  // NEW: Function to close Manage Profile
  const handleCloseManageProfile = () => {
    setShowManageProfile(false);
  };

  const handleCategorySelect = (categoryCode) => {
    setSelectedCategory(categoryCode);
    setCurrentPage(1); // Reset to page 1 when filter changes
    setShowCategoryDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowCategoryDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewExpense = async (expense) => {
    setViewModalLoading(true);
    setSelectedExpense(expense); // Set this to trigger the view change
    
    // Create sample proposal details for the expense
    const sampleProposalDetails = {
      title: `${expense.description} - Proposal Details`,
      performance_end_date: "2024-12-31",
      project_summary: `This proposal outlines the budget allocation for ${expense.description} under the ${expense.department} department.`,
      project_description: `Detailed project description for ${expense.description}. This includes all necessary components, timelines, and expected outcomes for the project implementation.`,
      items: [
        {
          cost_element: expense.category_name,
          description: expense.description,
          estimated_cost: expense.amount
        },
        {
          cost_element: "Additional Expenses",
          description: "Miscellaneous and contingency costs",
          estimated_cost: (parseFloat(expense.amount) * 0.1).toFixed(2)
        }
      ]
    };

    setTimeout(() => {
      setSelectedProposalDetails(sampleProposalDetails);
      setViewModalLoading(false);
    }, 1000);
  };

  const handleBackToList = () => {
    setSelectedExpense(null);
    setSelectedProposalDetails(null); // Clear details on back
  };
  // MODIFICATION END'

  // Date and time for Navbar
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
                    onClick={handleManageProfile} // UPDATED: Now calls handleManageProfile
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

      {/* Main Content */}
      <div
        className="content-container"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Conditionally render either ExpenseHistory content or ManageProfile */}
        {showManageProfile ? (
          <ManageProfile 
            onClose={handleCloseManageProfile} 
          />
        ) : (
          /* Page Container for everything */
          <div
            className="ledger-container"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              padding: "20px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: "calc(80vh - 100px)",
            }}
          >
            {!selectedExpense ? (
              <>
                {/* Header Section with Title and Controls */}
                <div
                  className="top"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 className="page-title">Expense History</h2>

                  <div
                    className="controls-container"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    {/* Search Bar - Width reduced to 400px */}
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
                          width: "400px", // Reduced width to 400px
                        }}
                      />
                    </div>

                    {/* Category Filter */}
                    <div
                      className="filter-dropdown"
                      style={{ position: "relative" }}
                    >
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
                        {/* MODIFICATION START */}
                        <span>
                          {selectedCategory
                            ? categories.find((c) => c.code === selectedCategory)
                                ?.name
                            : "All Categories"}
                        </span>
                        {/* MODIFICATION END */}
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
                          {/* MODIFICATION START */}
                          {categories.map((category) => (
                            <div
                              key={category.code}
                              className={`category-dropdown-item ${
                                selectedCategory === category.code ? "active" : ""
                              }`}
                              onClick={() => handleCategorySelect(category.code)}
                              onMouseDown={(e) => e.preventDefault()}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                backgroundColor:
                                  selectedCategory === category.code
                                    ? "#f0f0f0"
                                    : "white",
                                outline: "none",
                              }}
                            >
                              {category.name}
                            </div>
                          ))}
                          {/* MODIFICATION END */}
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

                {/* Expenses Table - KEEPING ORIGINAL SIZING */}
                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    position: "relative",
                    marginLeft: "20px",
                    marginRight: "20px",
                  }}
                >
                  {/* Custom scrollbar styling */}
                  <style>
                    {`
                      div::-webkit-scrollbar {
                        width: 8px;
                      }
                      div::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                      }
                      div::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                      }
                      div::-webkit-scrollbar-thumb:hover {
                        background: #a8a8a8;
                      }
                    `}
                  </style>
                  <div
                    className="table-scroll-container"
                    style={{
                      height: "100%",
                      overflow: "auto",
                    }}
                  >
                    <table
                      className="ledger-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                        minWidth: "800px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#f8f9fa",
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                          }}
                        >
                          <th
                            style={{
                              width: "20%",
                              padding: "0.75rem",
                              textAlign: "center",
                              borderBottom: "2px solid #dee2e6",
                              height: "50px",
                              verticalAlign: "middle",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            DATE
                          </th>
                          <th
                            style={{
                              width: "35%",
                              padding: "0.75rem",
                              textAlign: "center",
                              borderBottom: "2px solid #dee2e6",
                              height: "50px",
                              verticalAlign: "middle",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            DESCRIPTION
                          </th>
                          <th
                            style={{
                              width: "20%",
                              padding: "0.75rem",
                              textAlign: "center",
                              borderBottom: "2px solid #dee2e6",
                              height: "50px",
                              verticalAlign: "middle",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            CATEGORY
                          </th>
                          <th
                            style={{
                              width: "15%",
                              padding: "0.75rem",
                              textAlign: "center",
                              borderBottom: "2px solid #dee2e6",
                              height: "50px",
                              verticalAlign: "middle",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            AMOUNT
                          </th>
                          <th
                            style={{
                              width: "10%",
                              padding: "0.75rem",
                              textAlign: "center",
                              borderBottom: "2px solid #dee2e6",
                              height: "50px",
                              verticalAlign: "middle",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      {/* MODIFICATION START */}
                      <tbody>
                        {expenses.length > 0 ? (
                          expenses.map((expense, index) => (
                            <tr
                              key={expense.id}
                              className={index % 2 === 1 ? "alternate-row" : ""}
                              style={{
                                backgroundColor:
                                  index % 2 === 1 ? "#F8F8F8" : "#FFFFFF",
                                color: "#0C0C0C",
                                height: "50px",
                                transition: "background-color 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#fcfcfc";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  index % 2 === 1 ? "#F8F8F8" : "#FFFFFF";
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.75rem",
                                  borderBottom: "1px solid #dee2e6",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                {expense.date}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  borderBottom: "1px solid #dee2e6",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                {expense.description}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  borderBottom: "1px solid #dee2e6",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                {expense.category_name}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  borderBottom: "1px solid #dee2e6",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                ₱
                                {parseFloat(expense.amount).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  borderBottom: "1px solid #dee2e6",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                }}
                              >
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewExpense(expense)}
                                  onMouseDown={(e) => e.preventDefault()}
                                  style={{
                                    padding: "5px 15px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    outline: "none",
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="no-results"
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                height: "50px",
                                verticalAlign: "middle",
                              }}
                            >
                              {searchTerm || selectedCategory !== ""
                                ? "No expenses match your search criteria."
                                : "No expenses found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {/* MODIFICATION END */}
                    </table>
                  </div>
                </div>

                {/* MODIFICATION START */}
                {pagination.count > 0 && (
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
                {/* MODIFICATION END */}
              </>
            ) : (
              <div
                className="budget-proposal-view"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <button
                  className="back-button"
                  onClick={handleBackToList}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "8px 12px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "20px",
                    alignSelf: "flex-start",
                    outline: "none",
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Expenses</span>
                </button>

                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    paddingRight: "10px",
                  }}
                >
                  {viewModalLoading ? (
                    <div>Loading details...</div>
                  ) : selectedProposalDetails ? (
                    <>
                      <div
                        className="proposal-header"
                        style={{ marginBottom: "20px" }}
                      >
                        <h3
                          className="proposal-title"
                          style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}
                        >
                          {selectedProposalDetails.title}
                        </h3>
                        <div
                          className="proposal-date"
                          style={{ color: "#6c757d" }}
                        >
                          Performance End Date:{" "}
                          {selectedProposalDetails.performance_end_date}
                        </div>
                      </div>

                      <div
                        className="proposal-section"
                        style={{ marginBottom: "20px" }}
                      >
                        <h4
                          className="section-label"
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            textTransform: "uppercase",
                            fontWeight: "600",
                          }}
                        >
                          PROJECT SUMMARY
                        </h4>
                        <p
                          className="section-content"
                          style={{ margin: 0, lineHeight: "1.5" }}
                        >
                          {selectedProposalDetails.project_summary}
                        </p>
                      </div>

                      <div
                        className="proposal-section"
                        style={{ marginBottom: "20px" }}
                      >
                        <h4
                          className="section-label"
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            textTransform: "uppercase",
                            fontWeight: "600",
                          }}
                        >
                          PROJECT DESCRIPTION
                        </h4>
                        <p
                          className="section-content"
                          style={{ margin: 0, lineHeight: "1.5" }}
                        >
                          {selectedProposalDetails.project_description}
                        </p>
                      </div>

                      <div className="proposal-section">
                        <h4
                          className="section-label"
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            textTransform: "uppercase",
                            fontWeight: "600",
                          }}
                        >
                          COST ELEMENTS
                        </h4>
                        <div
                          className="cost-table"
                          style={{
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="cost-header"
                            style={{
                              display: "flex",
                              backgroundColor: "#f8f9fa",
                              padding: "10px 15px",
                              fontWeight: "600",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <div
                              className="cost-type-header"
                              style={{ flex: "1" }}
                            >
                              TYPE
                            </div>
                            <div
                              className="cost-desc-header"
                              style={{ flex: "2" }}
                            >
                              DESCRIPTION
                            </div>
                            <div
                              className="cost-amount-header"
                              style={{ flex: "1", textAlign: "right" }}
                            >
                              ESTIMATED COST
                            </div>
                          </div>
                          {selectedProposalDetails.items.map((item, idx) => (
                            <div
                              className="cost-row"
                              key={idx}
                              style={{
                                display: "flex",
                                padding: "10px 15px",
                                borderBottom:
                                  idx < selectedProposalDetails.items.length - 1
                                    ? "1px solid #dee2e6"
                                    : "none",
                              }}
                            >
                              <div
                                className="cost-type"
                                style={{
                                  flex: "1",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className="cost-bullet"
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    backgroundColor: "#007bff",
                                    borderRadius: "50%",
                                    marginRight: "10px",
                                  }}
                                ></span>
                                {item.cost_element}
                              </div>
                              <div
                                className="cost-description"
                                style={{ flex: "2" }}
                              >
                                {item.description}
                              </div>
                              <div
                                className="cost-amount"
                                style={{ flex: "1", textAlign: "right" }}
                              >
                                ₱
                                {parseFloat(item.estimated_cost).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </div>
                            </div>
                          ))}
                          <div
                            className="cost-row total"
                            style={{
                              display: "flex",
                              padding: "10px 15px",
                              backgroundColor: "#f8f9fa",
                              fontWeight: "600",
                            }}
                          >
                            <div
                              className="cost-type"
                              style={{ flex: "1" }}
                            ></div>
                            <div
                              className="cost-description"
                              style={{ flex: "2", fontWeight: "bold" }}
                            >
                              TOTAL
                            </div>
                            <div
                              className="cost-amount"
                              style={{
                                flex: "1",
                                textAlign: "right",
                                fontWeight: "bold",
                              }}
                            >
                              ₱
                              {selectedProposalDetails.items
                                .reduce(
                                  (acc, item) =>
                                    acc + parseFloat(item.estimated_cost),
                                  0
                                )
                                .toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>No proposal details found for this expense.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistory;