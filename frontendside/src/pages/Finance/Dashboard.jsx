import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowLeft,
  Expand,
  Minimize,
  User,
  Mail,
  Briefcase,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./Dashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function BudgetDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [timeFilter, setTimeFilter] = useState("monthly");
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".nav-dropdown") &&
        !event.target.closest(".profile-container")
      ) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfilePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format time with AM/PM
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // Format date for display
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Budget data
  const totalBudget = 800025.75;
  const remainingBudget = 50000;
  const planCompletion = 84.4;
  const allocatedPercentage = 47;

  // Monthly data for bar chart
  const monthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Budget",
        data: [26000, 26000, 26000, 26000, 26000, 26000],
        backgroundColor: "#007bff",
        borderRadius: 4,
      },
      {
        label: "Expense", // Changed from 'Actual' to 'Expense'
        data: [14000, 5000, 26000, 9500, 24000, 20000],
        backgroundColor: "#007bff80", // Semi-transparent blue
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₱${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
        },
      },
    },
  };

  // Pie chart data
  const pieChartData = {
    labels: [
      "Professional Services",
      "Training and Development",
      "Miscellaneous",
      "Equipment and Maintenance",
      "Utilities",
      "Travel",
    ],
    datasets: [
      {
        data: [1200, 800, 1500, 2200, 450, 800],
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#fd7e14",
        ],
        borderWidth: 0,
      },
    ],
  };

  const totalPieValue = pieChartData.datasets[0].data.reduce(
    (sum, value) => sum + value,
    0
  );

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: $${context.raw.toLocaleString()}`;
          },
        },
      },
      // Add this plugin to center the total amount
      beforeDraw: function (chart) {
        if (chart.config.options.centerText) {
          const width = chart.width,
            height = chart.height,
            ctx = chart.ctx;

          ctx.restore();
          const fontSize = (height / 100).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle";

          const text = chart.config.options.centerText.text,
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 2;

          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      },
    },
    cutout: "65%",
    // Add this option for the centered text
    centerText: {
      text: `$${totalPieValue.toLocaleString()}`,
      color: "#007bff",
      fontStyle: "bold",
    },
  };

  // Department data
  const departmentData = [
    {
      name: "Training & Development",
      budget: 50000,
      spent: 45000,
      percentage: 90,
      color: "#007bff",
    },
    {
      name: "Professional Services",
      budget: 30000,
      spent: 18000,
      percentage: 90,
      color: "#007bff",
    },
    {
      name: "Equipment & Maintenance",
      budget: 250000,
      spent: 21600,
      percentage: 72,
      color: "#007bff",
    },
  ];

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

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfilePopup(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userSession");
      localStorage.removeItem("userProfile");
      sessionStorage.clear();
      setShowProfilePopup(false);
      navigate("/login", { replace: true });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img src={LOGOMAP} alt="BudgetPro Logo" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>

            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div
                className={`nav-item ${showBudgetDropdown ? "active" : ""}`}
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
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
                    onClick={() => handleNavigate("/finance/journal-entry")}
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
                className={`nav-item ${showExpenseDropdown ? "active" : ""}`}
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
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
          </nav>
        </div>

        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img
                src={userProfile.avatar}
                alt="User avatar"
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
                      alt="Profile"
                      className="profile-avatar-img"
                    />
                  </div>

                  <div className="profile-info">
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <User size={16} className="profile-field-icon" />
                        <span className="profile-field-label">Name:</span>
                      </div>
                      <span className="profile-field-value">
                        {userProfile.name}
                      </span>
                    </div>

                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Mail size={16} className="profile-field-icon" />
                        <span className="profile-field-label">E-mail:</span>
                      </div>
                      <span className="profile-field-value profile-email">
                        {userProfile.email}
                      </span>
                    </div>

                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Briefcase size={16} className="profile-field-icon" />
                        <span className="profile-field-label">Role:</span>
                      </div>
                      <span className="profile-field-value profile-role">
                        {userProfile.role}
                      </span>
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
      <div
        className="content-container"
        style={{ height: "calc(100vh - 70px)", overflow: "auto" }}
      >
        {/* Date display */}
        <div className="date-display">
          <div className="date-time-badge">
            {formattedDate} | {formattedTime}
          </div>
        </div>

        {/* Time period filter */}
        <div className="time-filter">
          <button
            className={`filter-button ${
              timeFilter === "monthly" ? "active" : ""
            }`}
            onClick={() => setTimeFilter("monthly")}
            style={{
              backgroundColor: timeFilter === "monthly" ? "#007bff" : "#007bff",
              color: "white",
            }}
          >
            Monthly
          </button>
          <button
            className={`filter-button ${
              timeFilter === "quarterly" ? "active" : ""
            }`}
            onClick={() => setTimeFilter("quarterly")}
            style={{
              backgroundColor:
                timeFilter === "quarterly" ? "#007bff" : "#007bff",
              color: "white",
            }}
          >
            Quarterly
          </button>
          <button
            className={`filter-button ${
              timeFilter === "yearly" ? "active" : ""
            }`}
            onClick={() => setTimeFilter("yearly")}
            style={{
              backgroundColor: timeFilter === "yearly" ? "#007bff" : "#007bff",
              color: "white",
            }}
          >
            Yearly
          </button>
        </div>

        <div className="stats-grid">
          {/* Budget Completion */}
          <div className="card compact-budget-card" style={{ flex: "1 1 33%" }}>
            <h3 className="compact-card-title">Budget Completion</h3>
            <p className="compact-stat-value">{planCompletion}%</p>
            <p className="compact-card-subtext">
              Overall Status of Budget Plan
            </p>
            <div className="compact-progress-container">
              <div
                className="compact-progress-bar"
                style={{
                  width: `${planCompletion}%`,
                  backgroundColor: "#007bff",
                }}
              />
            </div>
          </div>

          {/* Total Budget */}
          <div className="card compact-budget-card" style={{ flex: "1 1 33%" }}>
            <h3 className="compact-card-title">Total Budget</h3>
            <p className="compact-stat-value">
              P{totalBudget.toLocaleString()}
            </p>
            <p className="compact-card-subtext">
              {allocatedPercentage}% allocated
            </p>
            <div className="compact-progress-container">
              <div
                className="compact-progress-bar"
                style={{
                  width: `${allocatedPercentage}%`,
                  backgroundColor: "#007bff",
                }}
              />
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="card compact-budget-card" style={{ flex: "1 1 33%" }}>
            <h3 className="compact-card-title">Remaining Budget</h3>
            <p className="compact-stat-value">
              P{remainingBudget.toLocaleString()}
            </p>
            <p className="compact-card-subtext">56% of Total Budget </p>
            <span className="compact-badge">Available for Allocation</span>
          </div>
        </div>

        {/* Charts Container */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            height: "400px",
          }}
        >
          {/* Money Flow Chart */}
          <div
            className="card chart-card"
            style={{ width: "50%", minWidth: "600px" }}
          >
            <div className="chart-header">
              <h3 className="card-title">Money Flow</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  Budget
                </button>
                <button
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  Expense
                </button>
                <button
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  All accounts
                </button>
              </div>
            </div>
            <div className="chart-container-large" style={{ height: "320px" }}>
              <Bar data={monthlyData} options={barChartOptions} />
            </div>
          </div>

          {/* Budget Pie Chart */}
          <div
            className="card chart-card"
            style={{ width: "50%", minWidth: "600px" }}
          >
            <div className="chart-header">
              <h3 className="card-title">Budget</h3>
              <button
                className="expand-button"
                onClick={() => setExpandedChart(!expandedChart)}
                aria-label={expandedChart ? "Collapse chart" : "Expand chart"}
                style={{ color: "#007bff" }}
              >
                {expandedChart ? <Minimize size={16} /> : <Expand size={16} />}
              </button>
            </div>
            <div
              className="chart-container-large"
              style={{
                height: "320px",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div style={{ width: "60%", height: "100%" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
              <div
                style={{
                  width: "40%",
                  paddingLeft: "20px",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                {pieChartData.labels.map((label, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          pieChartData.datasets[0].backgroundColor[index],
                        borderRadius: "50%",
                        marginRight: "8px",
                        flexShrink: 0,
                      }}
                    ></div>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Budget vs Actual */}
        <div className="card">
          <h3 className="card-title">Budget per category</h3>
          <div className="dept-budget-list">
            {departmentData.map((dept, index) => (
              <div
                key={index}
                className={`dept-budget-item ${
                  index < departmentData.length - 1 ? "with-border" : ""
                }`}
              >
                <div className="dept-budget-header">
                  <h4 className="dept-budget-title">{dept.name}</h4>
                  <p className="dept-budget-percentage">
                    {dept.percentage}% of budget used
                  </p>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${dept.percentage}%`,
                      backgroundColor: "#007bff",
                    }}
                  ></div>
                </div>
                <div className="dept-budget-details">
                  <p>Budget: ₱{dept.budget.toLocaleString()}</p>
                  <p>Spent: ₱{dept.spent.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetDashboard;
