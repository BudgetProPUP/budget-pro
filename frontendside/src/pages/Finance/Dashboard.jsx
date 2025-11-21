// TODO: Important, need massive changes and additional logic for new modals
// TODO: Add logic to monthly, quarterly, and yearly filters if possible
// TODO: Call generate_forecasts in page, currently uses manual in cmd
import React, { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
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
  Bell,
  Settings,
  Eye,
  TrendingUp,
  Maximize2,
  Download,
  BarChart3,
  Target,
  TrendingDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./Dashboard.css";
import {
  getBudgetSummary,
  getMoneyFlowData,
  getForecastData,
  // --- MODIFICATION START ---
  getTopCategoryAllocations, // Correct API function for the pie chart
  getDepartmentBudgetData, // API for the "View Details" section
  // --- MODIFICATION END ---
} from "../../API/dashboardAPI";
import { useAuth } from "../../context/AuthContext";
// Import ManageProfile component
import ManageProfile from "./ManageProfile";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// Forecast Accuracy Algorithms
const calculateAccuracyMetrics = (actualData, forecastData) => {
  if (!actualData || !forecastData || actualData.length === 0 || forecastData.length === 0) {
    return null;
  }

  const pairs = actualData.filter((_, index) => 
    forecastData[index] !== null && forecastData[index] !== undefined && forecastData[index] !== 0
  ).map((actual, index) => ({
    actual,
    forecast: forecastData[index]
  }));

  if (pairs.length === 0) return null;

  // Mean Absolute Percentage Error (MAPE)
  const mape = pairs.reduce((sum, pair) => {
    if (pair.actual === 0) return sum;
    return sum + Math.abs((pair.actual - pair.forecast) / pair.actual);
  }, 0) / pairs.length * 100;

  // Root Mean Square Error (RMSE)
  const rmse = Math.sqrt(
    pairs.reduce((sum, pair) => sum + Math.pow(pair.actual - pair.forecast, 2), 0) / pairs.length
  );

  // Mean Absolute Error (MAE)
  const mae = pairs.reduce((sum, pair) => sum + Math.abs(pair.actual - pair.forecast), 0) / pairs.length;

  // Accuracy Score (100 - MAPE)
  const accuracyScore = Math.max(0, 100 - mape);

  return {
    mape: mape.toFixed(2),
    rmse: rmse.toFixed(2),
    mae: mae.toFixed(2),
    accuracyScore: accuracyScore.toFixed(1),
    grade: accuracyScore >= 90 ? 'Excellent' : 
           accuracyScore >= 80 ? 'Good' : 
           accuracyScore >= 70 ? 'Fair' : 'Poor'
  };
};

// Performance Trend Analysis
const calculatePerformanceTrend = (accuracyHistory) => {
  if (!accuracyHistory || accuracyHistory.length < 2) return 'stable';
  
  const recent = accuracyHistory.slice(-3);
  const trend = recent[recent.length - 1] - recent[0];
  
  if (trend > 2) return 'improving';
  if (trend < -2) return 'declining';
  return 'stable';
};

// Generate Example Forecast Data
const generateExampleForecastData = (moneyFlowData) => {
  if (!moneyFlowData) return [];
  
  return moneyFlowData.map((month, index) => {
    const baseAmount = month.actual;
    // Add some realistic variance to create example forecast data
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    const forecastAmount = baseAmount * (1 + variance);
    
    return {
      month_name: month.month_name,
      forecast: Math.round(forecastAmount),
      confidence: Math.random() * 20 + 80 // 80-100% confidence
    };
  });
};

// Generate Example Accuracy History
const generateExampleAccuracyHistory = () => {
  return Array.from({ length: 6 }, () => Math.random() * 15 + 75); // 75-90% accuracy history
};

function BudgetDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showForecasting, setShowForecasting] = useState(false);
  const [showForecastComparison, setShowForecastComparison] = useState(false);
  const [usingExampleData, setUsingExampleData] = useState(false);
  const [exampleForecastData, setExampleForecastData] = useState([]);
  const [exampleAccuracyHistory, setExampleAccuracyHistory] = useState([]);
  const navigate = useNavigate();

  const [showManageProfile, setShowManageProfile] = useState(false);

  // --- NEW STATE FOR API DATA ---
  const [summaryData, setSummaryData] = useState(null);
  const [moneyFlowData, setMoneyFlowData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  // --- MODIFICATION START ---
  const [pieChartApiData, setPieChartApiData] = useState(null); // For Pie Chart
  const [departmentDetailsData, setDepartmentDetailsData] = useState(null); // For "View Details"
  // --- MODIFICATION END ---

  // New state for forecast analysis
  const [accuracyMetrics, setAccuracyMetrics] = useState(null);
  const [performanceTrend, setPerformanceTrend] = useState('stable');
  const [accuracyHistory, setAccuracyHistory] = useState([85, 82, 88, 90, 87]);

  const { user, logout } = useAuth(); // Get user and logout function from context

// MODIFICATION START
  // User profile data is now dynamic from the authentication context
  const userProfile = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    role: user?.roles?.bms || "User",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };
  // MODIFICATION END

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const fiscalYearId = 2;

        // --- MODIFICATION START ---
        // Updated to fetch all necessary data points for the dashboard
        const [summaryRes, moneyFlowRes, pieChartRes, departmentDetailsRes] =
          await Promise.all([
            getBudgetSummary(),
            getMoneyFlowData(fiscalYearId),
            getTopCategoryAllocations(), // Fetches data for the pie chart
            getDepartmentBudgetData(), // Fetches data for the "View Details" section
          ]);

        setSummaryData(summaryRes.data);
        setMoneyFlowData(moneyFlowRes.data);
        setPieChartApiData(pieChartRes.data);
        setDepartmentDetailsData(departmentDetailsRes.data);
        // --- MODIFICATION END ---
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch forecast data only when the button is clicked
  useEffect(() => {
    const fetchForecast = async () => {
      if (showForecasting || showForecastComparison) {
        try {
          const fiscalYearId = 2;
          const res = await getForecastData(fiscalYearId);
          setForecastData(res.data);
          
          // If no real forecast data exists, generate example data
          if ((!res.data || res.data.length === 0) && moneyFlowData) {
            const exampleData = generateExampleForecastData(moneyFlowData);
            setExampleForecastData(exampleData);
            setUsingExampleData(true);
            
            // Calculate accuracy metrics with example data
            const actualValues = moneyFlowData.map(d => d.actual);
            const forecastValues = exampleData.map(d => d.forecast);
            const metrics = calculateAccuracyMetrics(actualValues, forecastValues);
            setAccuracyMetrics(metrics);
            
            // Generate example accuracy history
            const history = generateExampleAccuracyHistory();
            setExampleAccuracyHistory(history);
            setAccuracyHistory(history);
          } else if (moneyFlowData && res.data) {
            // Use real data
            const actualValues = moneyFlowData.map(d => d.actual);
            const forecastValues = moneyFlowData.map((d, index) => {
              const forecastPoint = res.data.find(f => f.month_name === d.month_name);
              return forecastPoint ? forecastPoint.forecast : null;
            }).filter(val => val !== null);
            
            const metrics = calculateAccuracyMetrics(actualValues, forecastValues);
            setAccuracyMetrics(metrics);
            setUsingExampleData(false);
          }
          // MODIFICATION START: Check if the response data is an array
          if (Array.isArray(res.data)) {
            setForecastData(res.data);
          } else {
            // If it's not an array (e.g., it's the 'detail' object), keep it as an empty array
            console.log(
              "No forecast data available from API:",
              res.data.detail
            );
            setForecastData([]);
          }
          // MODIFICATION END
        } catch (error) {
          console.error("Failed to fetch forecast data:", error);
          // If API fails, generate example data
          if (moneyFlowData) {
            const exampleData = generateExampleForecastData(moneyFlowData);
            setExampleForecastData(exampleData);
            setUsingExampleData(true);
            
            const actualValues = moneyFlowData.map(d => d.actual);
            const forecastValues = exampleData.map(d => d.forecast);
            const metrics = calculateAccuracyMetrics(actualValues, forecastValues);
            setAccuracyMetrics(metrics);
            
            const history = generateExampleAccuracyHistory();
            setExampleAccuracyHistory(history);
            setAccuracyHistory(history);
          }
          setForecastData([]); // Also reset on error
        }
      }
    };
    fetchForecast();
  }, [showForecasting, showForecastComparison, moneyFlowData]);

  // Calculate performance trend when accuracy metrics change
  useEffect(() => {
    if (accuracyMetrics) {
      const trend = calculatePerformanceTrend(accuracyHistory);
      setPerformanceTrend(trend);
    }
  }, [accuracyMetrics, accuracyHistory]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".nav-dropdown") &&
        !event.target.closest(".notification-container") &&
        !event.target.closest(".profile-container") &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowCategoryDropdown(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
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
  const formattedDay = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get current month and year for the budget card
  const currentMonth = currentDate.toLocaleDateString("en-US", {
    month: "long",
  });
  const currentYear = currentDate.getFullYear();

  // Monthly data for line chart
  const monthlyData = {
    labels: moneyFlowData?.map((d) => d.month_name) || [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Budget",
        data: moneyFlowData?.map((d) => d.budget) || [],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#007bff",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        order: 2,
      },
      {
        label: "Expense",
        data: moneyFlowData?.map((d) => d.actual) || [],
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#28a745",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        order: 1,
      },
      // Forecast data - only shown when toggled
      ...(showForecasting && moneyFlowData && forecastData.length > 0
        ? [
            {
              label: "Forecast",
              data: (() => {
                const combinedData = [];
                const allMonths = moneyFlowData.map((d) => d.month_name);
                const lastActualExpenseIndex = moneyFlowData
                  .map((d) => d.actual)
                  .findLastIndex((d) => d > 0);

                allMonths.forEach((monthName, index) => {
                  const forecastPoint = usingExampleData
                    ? exampleForecastData.find(f => f.month_name === monthName)
                    : forecastData.find(f => f.month_name === monthName);

                  if (index < lastActualExpenseIndex) {
                    // For months before the last expense, don't draw anything
                    combinedData.push(null);
                  } else if (index === lastActualExpenseIndex) {
                    // Start the forecast line from the last known expense point
                    combinedData.push(moneyFlowData[index].actual);
                  } else if (forecastPoint) {
                    // For future months, use the forecast data
                    combinedData.push(forecastPoint.forecast);
                  } else {
                    // If there's no forecast for a future month, don't draw anything
                    combinedData.push(null);
                  }
                });
                return combinedData;
              })(),
              borderColor: "#ff6b35",
              backgroundColor: "rgba(255, 107, 53, 0.1)",
              borderDash: [5, 5],
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#ff6b35",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              order: 0,
            },
          ]
        : []),
    ],
  };

  // Forecast vs Actual Comparison Data
  const forecastComparisonData = {
    labels: moneyFlowData?.map((d) => d.month_name) || [],
    datasets: [
      {
        label: "Actual",
        data: moneyFlowData?.map((d) => d.actual) || [],
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#28a745",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Forecast",
        data: moneyFlowData?.map((d) => {
          const forecastPoint = usingExampleData 
            ? exampleForecastData.find(f => f.month_name === d.month_name)
            : forecastData.find(f => f.month_name === d.month_name);
          return forecastPoint ? forecastPoint.forecast : null;
        }) || [],
        borderColor: "#ff6b35",
        backgroundColor: "rgba(255, 107, 53, 0.1)",
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#ff6b35",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₱${context.raw?.toLocaleString() || '0'}`;
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
        beginAtZero: true,
      },
    },
  };

  // Pie chart data - updated with more vibrant colors
  const pieChartData = {
    labels: pieChartApiData?.map((c) => c.name) || [],
    datasets: [
      {
        data: pieChartApiData?.map((c) => c.total_allocated) || [],
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#fd7e14",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const totalPieValue =
    pieChartApiData?.reduce(
      (sum, item) => sum + parseFloat(item.total_allocated),
      0
    ) || 0;

  // Fixed the duplicate 'plugins' key issue
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "0%", // Remove cutout to make it a complete pie chart
    plugins: {
      legend: {
        display: false, // Remove the legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const percentage = ((context.raw / totalPieValue) * 100).toFixed(1);
            return `${
              context.label
            }: ₱${context.raw.toLocaleString()} (${percentage}%)`;
          },
        },
      },
      // Add center text plugin
      beforeDraw: function (chart) {
        const width = chart.width,
          height = chart.height,
          ctx = chart.ctx;

        ctx.restore();
        const fontSize = (height / 100).toFixed(2);
        ctx.font = `bold ${fontSize}em sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        const text = `₱${totalPieValue.toLocaleString()}`,
          textX = width / 2,
          textY = height / 2;

        ctx.fillStyle = "#007bff";
        ctx.fillText(text, textX, textY);
        ctx.save();
      },
    },
  };

  // Export Accuracy Report
  const exportAccuracyReport = () => {
    const reportData = {
      title: "Forecast Accuracy Report",
      generatedAt: new Date().toLocaleString(),
      dataSource: usingExampleData ? "Example Data" : "Real Data",
      accuracyMetrics,
      performanceTrend,
      monthlyData: moneyFlowData?.map((month, index) => {
        const forecastPoint = usingExampleData 
          ? exampleForecastData.find(f => f.month_name === month.month_name)
          : forecastData.find(f => f.month_name === month.month_name);
        const forecastValue = forecastPoint?.forecast || 0;
        const variance = month.actual - forecastValue;
        
        return {
          month: month.month_name,
          actual: month.actual,
          forecast: forecastValue,
          variance: variance,
          accuracy: forecastPoint ? (100 - Math.abs((variance / month.actual) * 100)).toFixed(1) : 'N/A'
        };
      })
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accuracy-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate new example data
  const generateNewExampleData = () => {
    if (moneyFlowData) {
      const newExampleData = generateExampleForecastData(moneyFlowData);
      setExampleForecastData(newExampleData);
      
      const actualValues = moneyFlowData.map(d => d.actual);
      const forecastValues = newExampleData.map(d => d.forecast);
      const metrics = calculateAccuracyMetrics(actualValues, forecastValues);
      setAccuracyMetrics(metrics);
      
      const newHistory = generateExampleAccuracyHistory();
      setExampleAccuracyHistory(newHistory);
      setAccuracyHistory(newHistory);
    }
  };

  // Navigation dropdown handlers
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
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

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowCategoryDropdown(false);
    setShowNotifications(false);
    setShowProfileDropdown(false);
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

  const handleLogout = async () => {
    await logout();
  };

  const toggleBudgetDetails = () => {
    setShowBudgetDetails(!showBudgetDetails);
  };

  const toggleForecasting = () => {
    setShowForecasting(!showForecasting);
    if (!showForecasting && moneyFlowData && (!forecastData || forecastData.length === 0)) {
      // Generate example data when first enabling forecasting
      const exampleData = generateExampleForecastData(moneyFlowData);
      setExampleForecastData(exampleData);
      setUsingExampleData(true);
    }
  };

  const toggleForecastComparison = () => {
    setShowForecastComparison(!showForecastComparison);
    if (!showForecastComparison && moneyFlowData && (!forecastData || forecastData.length === 0)) {
      // Generate example data when first enabling comparison
      const exampleData = generateExampleForecastData(moneyFlowData);
      setExampleForecastData(exampleData);
      setUsingExampleData(true);
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
      style={{ minWidth: "1200px", overflowY: "auto", height: "100vh" }}
    >
      {/* Navigation Bar - Updated with LedgerView navbar */}
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
            {/* Timestamp/Date - Updated with LedgerView format */}
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

      {/* Main Content - Updated with requested revisions */}
      <div
        className="content-container"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Conditionally render either Dashboard content or ManageProfile */}
        {showManageProfile ? (
          <ManageProfile 
            onClose={handleCloseManageProfile} 
          />
          // MODIFICATION END
        ) : (
          <>
            {/* Time period filter - Updated with blue focus border */}
            <div className="time-filter" style={{ marginBottom: "25px" }}>
              <button
                className={`filter-button ${
                  timeFilter === "monthly" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("monthly")}
                style={{
                  backgroundColor: timeFilter === "monthly" ? "#007bff" : "white",
                  color: timeFilter === "monthly" ? "white" : "#007bff",
                  border: "1px solid #007bff",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = "0 0 0 2px rgba(0, 123, 255, 0.25)")
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              >
                Monthly
              </button>
              <button
                className={`filter-button ${
                  timeFilter === "quarterly" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("quarterly")}
                style={{
                  backgroundColor: timeFilter === "quarterly" ? "#007bff" : "white",
                  color: timeFilter === "quarterly" ? "white" : "#007bff",
                  border: "1px solid #007bff",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = "0 0 0 2px rgba(0, 123, 255, 0.25)")
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              >
                Quarterly
              </button>
              <button
                className={`filter-button ${
                  timeFilter === "yearly" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("yearly")}
                style={{
                  backgroundColor: timeFilter === "yearly" ? "#007bff" : "white",
                  color: timeFilter === "yearly" ? "white" : "#007bff",
                  border: "1px solid #007bff",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = "0 0 0 2px rgba(0, 123, 255, 0.25)")
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              >
                Yearly
              </button>
            </div>

            {/* Stats Grid - Updated with blue hover effect */}
<div className="stats-grid" style={{ marginBottom: "30px" }}>
  {/* Budget Completion */}
  <div
    className="card compact-budget-card"
    style={{
      flex: "1 1 33%",
      transition: "all 0.2s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow =
        "0 4px 8px rgba(0, 123, 255, 0.3)";
      e.currentTarget.style.border = "1px solid #007bff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "";
      e.currentTarget.style.border = "1px solid #e0e0e0";
    }}
  >
    <h3 className="compact-card-title">Budget Completion</h3>
    <p className="compact-stat-value">
      {summaryData?.percentage_used || 0}%
    </p>
    <p className="compact-card-subtext">
      Overall Status of Budget Plan
    </p>
    <div className="compact-progress-container">
      <div
        className="compact-progress-bar"
        style={{
          width: `${summaryData?.percentage_used || 0}%`,
          backgroundColor: "#007bff",
        }}
      />
    </div>
  </div>

  {/* Total Budget */}
  <div
    className="card compact-budget-card"
    style={{
      flex: "1 1 33%",
      transition: "all 0.2s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow =
        "0 4px 8px rgba(0, 123, 255, 0.3)";
      e.currentTarget.style.border = "1px solid #007bff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "";
      e.currentTarget.style.border = "1px solid #e0e0e0";
    }}
  >
    <h3 className="compact-card-title">Total Budget</h3>
    <div
      style={{
        fontSize: "12px",
        color: "#007bff",
        marginBottom: "8px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      As of {currentMonth} {currentYear}
    </div>
    <p className="compact-stat-value">
      ₱{Number(summaryData?.total_budget || 0).toLocaleString()}
    </p>
    <p className="compact-card-subtext">
      {summaryData?.percentage_used || 0}% allocated
    </p>
    <div className="compact-progress-container">
      <div
        className="compact-progress-bar"
        style={{
          width: `${summaryData?.allocated_percentage || summaryData?.percentage_used || 0}%`,
          backgroundColor: "#007bff",
        }}
      />
    </div>
  </div>

  {/* Remaining Budget */}
  <div
    className="card compact-budget-card"
    style={{
      flex: "1 1 33%",
      transition: "all 0.2s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow =
        "0 4px 8px rgba(0, 123, 255, 0.3)";
      e.currentTarget.style.border = "1px solid #007bff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "";
      e.currentTarget.style.border = "1px solid #e0e0e0";
    }}
  >
    <h3 className="compact-card-title">Remaining Budget</h3>
    <p className="compact-stat-value">
      ₱{Number(summaryData?.remaining_budget || 0).toLocaleString()}
    </p>
    <p className="compact-card-subtext">
      {(100 - (summaryData?.percentage_used || 0)).toFixed(1)}% of Total Budget
    </p>
    <span className="compact-badge">Available for Allocation</span>
  </div>
</div>

            {/* Money Flow Chart - Expanded with improved month spacing */}
            <div
              className="card chart-card"
              style={{
                width: "100%",
                marginBottom: "35px",
                height: "500px", // Increased height for better month spacing
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="chart-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 className="card-title">Money Flow</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
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
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      Expense
                    </button>
                    {showForecasting && (
                      <button
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#ff6b35",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Forecast
                      </button>
                    )}
                  </div>
                  <button
                    onClick={toggleForecasting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      backgroundColor: showForecasting ? "#ff6b35" : "#e9ecef",
                      color: showForecasting ? "white" : "#1b1d1fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      outline: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                    title={showForecasting ? "Hide Forecast" : "Show Forecast"}
                  >
                    <TrendingUp size={16} />
                    Forecasting
                  </button>
                  <button
                    onClick={toggleForecastComparison}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      backgroundColor: showForecastComparison ? "#6f42c1" : "#e9ecef",
                      color: showForecastComparison ? "white" : "#1b1d1fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      outline: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                    title={showForecastComparison ? "Hide Comparison" : "Show Forecast vs Actual"}
                  >
                    <BarChart3 size={16} />
                    Compare
                  </button>
                </div>
              </div>
              <div
                className="chart-container-large"
                style={{
                  height: "420px", // Increased height for better month spacing
                  paddingBottom: "20px", // Added padding to separate months from container
                }}
              >
                {showForecastComparison ? (
                  <Line data={forecastComparisonData} options={lineChartOptions} />
                ) : (
                  <Line data={monthlyData} options={lineChartOptions} />
                )}
              </div>
            </div>

            {/* Forecast Analysis Section - NEW */}
            {showForecastComparison && accuracyMetrics && (
              <div className="card" style={{ marginBottom: "30px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3 className="card-title">Forecast Accuracy Analysis</h3>
                  <button
                    onClick={exportAccuracyReport}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <Download size={16} />
                    Export Report
                  </button>
                </div>

                <div className="stats-grid" style={{ marginBottom: "20px" }}>
                  {/* Accuracy Score */}
                  <div
                    className="card compact-budget-card"
                    style={{
                      flex: "1 1 25%",
                      textAlign: "center",
                      background: accuracyMetrics.grade === 'Excellent' ? '#e7f6ec' : 
                                 accuracyMetrics.grade === 'Good' ? '#e7f3ff' : 
                                 accuracyMetrics.grade === 'Fair' ? '#fff3cd' : '#f8d7da'
                    }}
                  >
                    <Target size={24} style={{ margin: '0 auto 10px', color: '#007bff' }} />
                    <h3 className="compact-card-title">Accuracy Score</h3>
                    <p className="compact-stat-value" style={{ 
                      color: accuracyMetrics.grade === 'Excellent' ? '#28a745' : 
                            accuracyMetrics.grade === 'Good' ? '#007bff' : 
                            accuracyMetrics.grade === 'Fair' ? '#ffc107' : '#dc3545'
                    }}>
                      {accuracyMetrics.accuracyScore}%
                    </p>
                    <span className="compact-badge" style={{ 
                      backgroundColor: accuracyMetrics.grade === 'Excellent' ? '#28a745' : 
                                     accuracyMetrics.grade === 'Good' ? '#007bff' : 
                                     accuracyMetrics.grade === 'Fair' ? '#ffc107' : '#dc3545',
                      color: 'white'
                    }}>
                      {accuracyMetrics.grade}
                    </span>
                  </div>

                  {/* MAPE */}
                  <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                    <h3 className="compact-card-title">MAPE</h3>
                    <p className="compact-stat-value" style={{ color: '#dc3545' }}>
                      {accuracyMetrics.mape}%
                    </p>
                    <p className="compact-card-subtext">Mean Absolute Percentage Error</p>
                  </div>

                  {/* RMSE */}
                  <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                    <h3 className="compact-card-title">RMSE</h3>
                    <p className="compact-stat-value" style={{ color: '#ff6b35' }}>
                      ₱{accuracyMetrics.rmse}
                    </p>
                    <p className="compact-card-subtext">Root Mean Square Error</p>
                  </div>

                  {/* Performance Trend */}
                  <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                    <h3 className="compact-card-title">Performance Trend</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {performanceTrend === 'improving' ? (
                        <TrendingUp size={24} color="#28a745" />
                      ) : performanceTrend === 'declining' ? (
                        <TrendingDown size={24} color="#dc3545" />
                      ) : (
                        <BarChart3 size={24} color="#ffc107" />
                      )}
                      <p className="compact-stat-value" style={{ 
                        color: performanceTrend === 'improving' ? '#28a745' : 
                              performanceTrend === 'declining' ? '#dc3545' : '#ffc107'
                      }}>
                        {performanceTrend.charAt(0).toUpperCase() + performanceTrend.slice(1)}
                      </p>
                    </div>
                    <p className="compact-card-subtext">Forecast Performance</p>
                  </div>
                </div>

                {/* Detailed Metrics Table */}
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#374151' }}>Monthly Forecast vs Actual</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef' }}>Month</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e9ecef' }}>Actual</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e9ecef' }}>Forecast</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e9ecef' }}>Variance</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e9ecef' }}>Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moneyFlowData?.map((month, index) => {
                          const forecastPoint = usingExampleData 
                            ? exampleForecastData.find(f => f.month_name === month.month_name)
                            : forecastData.find(f => f.month_name === month.month_name);
                          const forecastValue = forecastPoint?.forecast || 0;
                          const variance = month.actual - forecastValue;
                          const accuracy = forecastPoint ? (100 - Math.abs((variance / month.actual) * 100)).toFixed(1) : 'N/A';
                          
                          return (
                            <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                              <td style={{ padding: '12px' }}>{month.month_name}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>₱{month.actual.toLocaleString()}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                {forecastPoint ? `₱${forecastValue.toLocaleString()}` : 'N/A'}
                              </td>
                              <td style={{ 
                                padding: '12px', 
                                textAlign: 'right',
                                color: variance >= 0 ? '#28a745' : '#dc3545'
                              }}>
                                {variance !== 0 ? `₱${Math.abs(variance).toLocaleString()} ${variance >= 0 ? 'Over' : 'Under'}` : 'Exact'}
                              </td>
                              <td style={{ 
                                padding: '12px', 
                                textAlign: 'right',
                                color: accuracy !== 'N/A' && accuracy >= 90 ? '#28a745' : 
                                      accuracy !== 'N/A' && accuracy >= 80 ? '#007bff' : 
                                      accuracy !== 'N/A' && accuracy >= 70 ? '#ffc107' : '#dc3545'
                              }}>
                                {accuracy !== 'N/A' ? `${accuracy}%` : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Budget per category with Pie Chart - Updated with single "View Details" button */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 className="card-title">Budget per category</h3>
                <button
                  className="view-button"
                  onClick={toggleBudgetDetails}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <Eye size={16} style={{ color: "white" }} />
                  View Details
                </button>
              </div>

              {/* Updated Pie Chart layout */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                  height: "300px",
                }}
              >
                <div style={{ width: "50%", height: "100%", position: "relative" }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
                <div
                  style={{
                    width: "50%",
                    paddingLeft: "10px",
                    height: "100%",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {pieChartData.labels.map((label, index) => {
                    const percentage = (
                      (pieChartData.datasets[0].data[index] / totalPieValue) *
                      100
                    ).toFixed(1);
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          fontSize: "14px",
                          padding: "6px 0",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{ display: "flex", alignItems: "center", flex: 1 }}
                        >
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              backgroundColor:
                                pieChartData.datasets[0].backgroundColor[index],
                              borderRadius: "4px",
                              marginRight: "10px",
                              flexShrink: 0,
                            }}
                          ></div>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginRight: "8px",
                              fontWeight: "500",
                            }}
                          >
                            {label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              flexShrink: 0,
                              minWidth: "70px",
                              textAlign: "right",
                            }}
                          >
                            ₱{pieChartData.datasets[0].data[index].toLocaleString()}
                          </span>
                          <span
                            style={{
                              color: "#6c757d",
                              fontSize: "12px",
                              minWidth: "40px",
                            }}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department list is now DYNAMIC and shown when clicking the eye icon */}
              {showBudgetDetails && (
                <div className="dept-budget-list">
                  {/* Use the 'categoryData' from the API call */}
                  {categoryData &&
                    categoryData.map((cat, index) => (
                      <div
                        key={index}
                        className={`dept-budget-item ${
                          index < categoryData.length - 1 ? "with-border" : ""
                        }`}
                      >
                        <div className="dept-budget-header">
                          <h4 className="dept-budget-title">{cat.category_name}</h4>
                          <p className="dept-budget-percentage">
                            {cat.percentage_used}% of budget used
                          </p>
                        </div>
                        <div className="progress-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${cat.percentage_used}%`,
                              backgroundColor: "#007bff",
                            }}
                          ></div>
                        </div>
                        <div className="dept-budget-details">
                          <p>Budget: ₱{Number(cat.budget).toLocaleString()}</p>
                          <p>Spent: ₱{Number(cat.spent).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetDashboard;