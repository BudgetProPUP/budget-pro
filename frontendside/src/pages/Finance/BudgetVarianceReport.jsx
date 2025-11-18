import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Download,
  User,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./BudgetVarianceReport.css";
import { useAuth } from "../../context/AuthContext";
import {
  getBudgetVarianceReport,
  exportBudgetVarianceReport,
} from "../../API/reportAPI";
import { getFiscalYears } from "../../API/dropdownAPI";

// Import ManageProfile component
import ManageProfile from "./ManageProfile";

// MODIFICATION START:recursive component to render table rows
const ReportRow = ({ item, level }) => {
  const isPositive = item.available >= 0;
  // Only add paddingLeft for main parent categories (level 0)
  const indentStyle = {
    paddingLeft: level === 0 ? "12px" : `${level * 20}px`,
    fontWeight: level === 0 ? "bold" : "normal", // Make level 0 categories bold
  };

  const formatCurrency = (value) => {
    return `₱${parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <tr className={level === 0 ? "level-0-row" : "data-row"}>
      <td style={indentStyle}>{item.category.toUpperCase()}</td>
      <td>{formatCurrency(item.budget)}</td>
      <td>{formatCurrency(item.actual)}</td>
      <td
        style={{
          color: isPositive ? "green" : "red",
          fontWeight: "bold",
        }}
      >
        {formatCurrency(item.available)}
      </td>
    </tr>
  );
};
// MODIFICATION END

const BudgetVarianceReport = () => {
  // MODIFICATION START: Replace state management with API-driven state
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showManageProfile, setShowManageProfile] = useState(false); // Fixed: Added missing state
  const navigate = useNavigate();
  const { user } = useAuth();

  // User profile data
  const userProfile = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    role: user?.roles?.bms || "User",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  // API Data State
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYearId, setSelectedYearId] = useState(""); // Will hold the FiscalYear ID

  // Date/Time State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dropdown options
  const months = [
    { value: "", label: "All Year" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Fetch initial data (Fiscal Years for dropdown)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await getFiscalYears();
        setFiscalYears(res.data);
        // Set the default selected year to the current active one
        const activeYear = res.data.find((fy) => fy.is_active);
        if (activeYear) {
          setSelectedYearId(activeYear.id);
        } else if (res.data.length > 0) {
          setSelectedYearId(res.data[0].id); // Fallback to the first year
        }
      } catch (error) {
        console.error("Failed to fetch fiscal years:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch report data when filters change
  useEffect(() => {
    if (!selectedYearId) return; // Don't fetch if no year is selected

    const fetchReport = async () => {
      setLoading(true);
      try {
        const params = {
          fiscal_year_id: selectedYearId,
          month: selectedMonth || null, // Send month or null if 'All Year' is selected
        };
        const res = await getBudgetVarianceReport(params);
        setReportData(res.data);
      } catch (error) {
        console.error("Failed to fetch budget variance report:", error);
        setReportData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedYearId, selectedMonth]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".nav-dropdown") &&
        !event.target.closest(".profile-container") &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowManageProfile(false); // Fixed: Use correct state variable
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation dropdown handlers - Updated with LedgerView functionality
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showManageProfile) setShowManageProfile(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showManageProfile) setShowManageProfile(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showManageProfile) setShowManageProfile(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showManageProfile) setShowManageProfile(false);
    if (showNotifications) setShowNotifications(false);
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
    setShowManageProfile(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    try {
      setShowManageProfile(false);
      setShowProfileDropdown(false);
      navigate("/login", { replace: true });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/login", { replace: true });
    }
  };

  // Recursive function to flatten the nested data for rendering
  const renderReportRows = (nodes, level = 0) => {
    return nodes.flatMap((node) => [
      <ReportRow key={node.code} item={node} level={level} />,
      ...(node.children && node.children.length > 0
        ? renderReportRows(node.children, level + 1)
        : []),
    ]);
  };

  // MODIFICATION START: Updated export handler to call the API
  const handleExport = async () => {
    if (!selectedYearId) {
      alert("Please select a fiscal year to export.");
      return;
    }
    try {
      const params = {
        fiscal_year_id: selectedYearId,
        month: selectedMonth || null,
      };
      const response = await exportBudgetVarianceReport(params);

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const fiscalYearName =
        fiscalYears.find((fy) => fy.id === selectedYearId)?.name || "report";
      const monthName =
        months.find((m) => m.value === selectedMonth)?.label || "annual";

      link.setAttribute(
        "download",
        `Budget_Variance_${fiscalYearName}_${monthName}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("An error occurred while exporting the report.");
    }
  };
  // MODIFICATION END

  return (
    <div
      className="app-container"
      style={{ minWidth: "1200px", overflowY: "auto", height: "100vh" }}
    >
      {/* Navigation Bar - Updated with LedgerView's exact structure and functionality */}
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
          {/* Logo and System Name - Exact copy from LedgerView */}
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

          {/* Main Navigation Links - Exact copy from LedgerView */}
          <div
            className="navbar-links"
            style={{ display: "flex", gap: "20px" }}
          >
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            {/* Budget Dropdown - Exact copy from LedgerView */}
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

            {/* Expense Dropdown - Exact copy from LedgerView */}
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

          {/* User Controls - Exact copy from LedgerView */}
          <div
            className="navbar-controls"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            {/* Timestamp/Date - Exact copy from LedgerView */}
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

            {/* Notification Icon - Exact copy from LedgerView */}
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

            {/* Profile Dropdown - Exact copy from LedgerView */}
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
                    onClick={handleManageProfile} // Updated to use new function
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
          {/* Header Section */}
          <div
            className="top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 className="page-title">Budget Variance Report</h2>
            <div
              className="controls-container"
              style={{ display: "flex", gap: "15px", alignItems: "center" }}
            >
              <div
                className="date-selection"
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <select
                  className="month-select"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  className="year-select"
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(parseInt(e.target.value))}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Select Year</option>
                  {fiscalYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="export-button"
                onClick={handleExport}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#007bff",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#ffffff" }}>Export Report</span>{" "}
                {/* Fixed: Make export text white */}
                <Download size={16} color="#ffffff" />{" "}
                {/* Fixed: Make download icon white */}
              </button>
            </div>
          </div>

          <div
            style={{
              height: "1px",
              backgroundColor: "#e0e0e0",
              marginBottom: "20px",
            }}
          ></div>

          {/* Report Table Container */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            <table
              className="report-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
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
                      width: "40%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    CATEGORY
                  </th>
                  <th
                    style={{
                      width: "20%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    BUDGET
                  </th>
                  <th
                    style={{
                      width: "20%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    ACTUAL
                  </th>
                  <th
                    style={{
                      width: "20%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    AVAILABLE
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading report...
                    </td>
                  </tr>
                ) : reportData.length > 0 ? (
                  renderReportRows(reportData)
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No data available for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manage Profile Modal */}
      {showManageProfile && (
        <ManageProfile onClose={handleCloseManageProfile} />
      )}
    </div>
  );
  // MODIFICATION END
};
export default BudgetVarianceReport;
