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
  getForecastAccuracy,
  // --- MODIFICATION START ---
  getTopCategoryAllocations, // Correct API function for the pie chart
  getDepartmentBudgetData, // API for the "View Details" section
  // --- MODIFICATION END ---
} from "../../API/dashboardAPI";
import { useAuth } from "../../context/AuthContext";
// Import ManageProfile component
import ManageProfile from "./ManageProfile";
// Import SheetJS for Excel export
import * as XLSX from 'xlsx';

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

// Export to Excel function - UPDATED WITH SHEETJS
const exportToExcel = (summaryData, moneyFlowData, pieChartData, departmentData, timeFilter) => {
  // Create a timestamp for the filename
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const fileName = `dashboard_summary_${dateStr}_${timeStr}.xlsx`;
  
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // ===== 1. SUMMARY SHEET =====
    const summarySheetData = [];
    
    // Header
    summarySheetData.push(['BudgetPro Dashboard Summary', '', '', '']);
    summarySheetData.push(['Generated on:', now.toLocaleString(), '', '']);
    summarySheetData.push(['Time Filter:', timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1), '', '']);
    summarySheetData.push([]);
    
    // Summary stats
    summarySheetData.push(['Summary Statistics']);
    summarySheetData.push(['Metric', 'Value', 'Percentage', 'Status']);
    summarySheetData.push([
      'Total Budget',
      `₱${Number(summaryData?.total_budget || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      '100%',
      'Total'
    ]);
    summarySheetData.push([
      'Budget Used',
      `₱${Number(summaryData?.budget_used || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${summaryData?.percentage_used || 0}%`,
      'Used'
    ]);
    summarySheetData.push([
      'Remaining Budget',
      `₱${Number(summaryData?.remaining_budget || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${(100 - (summaryData?.percentage_used || 0)).toFixed(1)}%`,
      'Available'
    ]);
    
    // ===== 2. MONEY FLOW SHEET =====
    const moneyFlowSheetData = [];
    
    // Header
    moneyFlowSheetData.push(['Monthly Money Flow Analysis', '', '', '', '']);
    moneyFlowSheetData.push(['Report Period:', timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1), '', '', '']);
    moneyFlowSheetData.push([]);
    
    // Column headers
    moneyFlowSheetData.push(['Month', 'Budget Amount', 'Actual Expense', 'Variance', 'Status']);
    
    // Add money flow data with ACCURATE formatting matching the dashboard
    if (moneyFlowData && Array.isArray(moneyFlowData)) {
      moneyFlowData.forEach(item => {
        const budget = Number(item.budget) || 0;
        const actual = Number(item.actual) || 0;
        const variance = budget - actual;
        const variancePercentage = budget > 0 ? ((variance / budget) * 100).toFixed(1) : 0;
        
        // Format exactly as shown in dashboard
        const formattedBudget = `₱${budget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedActual = `₱${actual.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedVariance = `₱${Math.abs(variance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        let status = '';
        if (variance > 0) {
          status = `Under Budget by ${variancePercentage}%`;
        } else if (variance < 0) {
          status = `Over Budget by ${Math.abs(variancePercentage)}%`;
        } else {
          status = 'On Budget';
        }
        
        moneyFlowSheetData.push([
          item.month_name,
          formattedBudget,
          formattedActual,
          formattedVariance,
          status
        ]);
      });
      
      // Add totals row
      const totalBudget = moneyFlowData.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
      const totalActual = moneyFlowData.reduce((sum, item) => sum + (Number(item.actual) || 0), 0);
      const totalVariance = totalBudget - totalActual;
      const totalVariancePercentage = totalBudget > 0 ? ((totalVariance / totalBudget) * 100).toFixed(1) : 0;
      
      moneyFlowSheetData.push([]);
      moneyFlowSheetData.push([
        'TOTAL',
        `₱${totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `₱${totalActual.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `₱${Math.abs(totalVariance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalVariance > 0 ? `Under Budget by ${totalVariancePercentage}%` : 
        totalVariance < 0 ? `Over Budget by ${Math.abs(totalVariancePercentage)}%` : 'Exactly On Budget'
      ]);
    }
    
    // ===== 3. DEPARTMENT BUDGET SHEET =====
    const departmentSheetData = [];
    
    // Header
    departmentSheetData.push(['Department Budget Allocation', '', '', '', '', '']);
    departmentSheetData.push([]);
    
    // Column headers
    departmentSheetData.push(['Department', 'Budget', 'Spent', 'Remaining', 'Percentage Used', 'Status']);
    
    if (departmentData && Array.isArray(departmentData)) {
      departmentData.forEach(dept => {
        const budget = Number(dept.budget) || 0;
        const spent = Number(dept.spent) || 0;
        const remaining = budget - spent;
        const percentageUsed = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;
        
        // Format exactly as shown in dashboard
        const formattedBudget = `₱${budget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedSpent = `₱${spent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedRemaining = `₱${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        let status = '';
        if (percentageUsed >= 90) {
          status = 'Critical';
        } else if (percentageUsed >= 75) {
          status = 'High Usage';
        } else if (percentageUsed >= 50) {
          status = 'Moderate Usage';
        } else {
          status = 'Low Usage';
        }
        
        departmentSheetData.push([
          dept.department_name,
          formattedBudget,
          formattedSpent,
          formattedRemaining,
          `${percentageUsed}%`,
          status
        ]);
      });
      
      // Add totals
      const totalDeptBudget = departmentData.reduce((sum, dept) => sum + (Number(dept.budget) || 0), 0);
      const totalDeptSpent = departmentData.reduce((sum, dept) => sum + (Number(dept.spent) || 0), 0);
      const totalDeptRemaining = totalDeptBudget - totalDeptSpent;
      const totalDeptPercentageUsed = totalDeptBudget > 0 ? ((totalDeptSpent / totalDeptBudget) * 100).toFixed(1) : 0;
      
      departmentSheetData.push([]);
      departmentSheetData.push([
        'TOTAL',
        `₱${totalDeptBudget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `₱${totalDeptSpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `₱${totalDeptRemaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${totalDeptPercentageUsed}%`,
        'Overall'
      ]);
    }
    
    // ===== 4. PIE CHART SUMMARY SHEET =====
    const pieChartSheetData = [];
    
    // Header
    pieChartSheetData.push(['Department Budget Distribution (Pie Chart Data)', '', '', '']);
    pieChartSheetData.push(['Total Value:', `₱${Number(pieChartData?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '', '']);
    pieChartSheetData.push([]);
    
    pieChartSheetData.push(['Department', 'Amount', 'Percentage', 'Color Code']);
    
    if (pieChartData && pieChartData.labels && pieChartData.datasets[0].data) {
      const totalPieValue = pieChartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
      
      pieChartData.labels.forEach((label, index) => {
        const amount = pieChartData.datasets[0].data[index];
        const percentage = totalPieValue > 0 ? ((amount / totalPieValue) * 100).toFixed(1) : 0;
        const color = pieChartData.datasets[0].backgroundColor[index] || '#007bff';
        
        pieChartSheetData.push([
          label,
          `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${percentage}%`,
          color
        ]);
      });
    }
    
    // Convert data to worksheets
    const ws1 = XLSX.utils.aoa_to_sheet(summarySheetData);
    const ws2 = XLSX.utils.aoa_to_sheet(moneyFlowSheetData);
    const ws3 = XLSX.utils.aoa_to_sheet(departmentSheetData);
    const ws4 = XLSX.utils.aoa_to_sheet(pieChartSheetData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");
    XLSX.utils.book_append_sheet(wb, ws2, "Money Flow");
    XLSX.utils.book_append_sheet(wb, ws3, "Departments");
    XLSX.utils.book_append_sheet(wb, ws4, "Distribution");
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Column A width
      { wch: 20 }, // Column B width
      { wch: 20 }, // Column C width
      { wch: 20 }, // Column D width
      { wch: 25 }, // Column E width
      { wch: 15 }, // Column F width
    ];
    
    ws1['!cols'] = colWidths;
    ws2['!cols'] = colWidths;
    ws3['!cols'] = colWidths;
    ws4['!cols'] = colWidths;
    
    // Generate Excel file
    XLSX.writeFile(wb, fileName);
    
    console.log(`Exported successfully as ${fileName}`);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export Excel file. Please try again.');
  }
};

// Forecast Accuracy Report Export
const exportAccuracyReport = (forecastAccuracyData, moneyFlowData, forecastData) => {
  // Create filename with required format: dashboard_summary_YYYYMMDD_TTTTTTT.xlsx
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const fileName = `forecast_accuracy_report_${dateStr}_${timeStr}.xlsx`;
  
  // Guard clause to prevent exporting if data isn't ready
  if (!forecastAccuracyData || !moneyFlowData || !forecastData) {
    alert("Accuracy data is not available to export.");
    return;
  }

  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // ===== 1. FORECAST ACCURACY SUMMARY SHEET =====
    const summarySheetData = [];
    
    // Header
    summarySheetData.push(['Forecast Accuracy Report', '', '', '', '']);
    summarySheetData.push(['Generated on:', now.toLocaleString(), '', '', '']);
    summarySheetData.push(['Filename:', fileName, '', '', '']);
    summarySheetData.push([]);
    
    // Summary Metrics
    summarySheetData.push(['Summary Metrics']);
    summarySheetData.push(['Metric', 'Value', 'Details', '', '']);
    summarySheetData.push([
      'Analyzed Month',
      `${forecastAccuracyData.month_name} ${forecastAccuracyData.year}`,
      'Last completed month',
      '',
      ''
    ]);
    summarySheetData.push([
      'Accuracy Percentage',
      `${forecastAccuracyData.accuracy_percentage}%`,
      forecastAccuracyData.accuracy_percentage >= 90 ? 'Excellent' : 
      forecastAccuracyData.accuracy_percentage >= 75 ? 'Good' : 
      forecastAccuracyData.accuracy_percentage >= 50 ? 'Fair' : 'Poor',
      '',
      ''
    ]);
    summarySheetData.push([
      'Variance',
      `₱${Math.abs(Number(forecastAccuracyData.variance)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      Number(forecastAccuracyData.variance) >= 0 ? 'Over Forecast' : 'Under Forecast',
      '',
      ''
    ]);
    summarySheetData.push([
      'Actual Spend',
      `₱${Number(forecastAccuracyData.actual_spend).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'Actual amount spent',
      '',
      ''
    ]);
    summarySheetData.push([
      'Forecasted Spend',
      `₱${Number(forecastAccuracyData.forecasted_spend).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'Predicted amount',
      '',
      ''
    ]);
    
    // ===== 2. MONTHLY COMPARISON SHEET =====
    const comparisonSheetData = [];
    
    // Header
    comparisonSheetData.push(['Monthly Forecast vs Actual Comparison', '', '', '', '', '']);
    comparisonSheetData.push([]);
    
    // Column headers
    comparisonSheetData.push(['Month', 'Actual', 'Forecast', 'Variance Amount', 'Variance Status', 'Accuracy']);
    
    // Build the detailed monthly comparison data
    if (moneyFlowData && Array.isArray(moneyFlowData) && forecastData && Array.isArray(forecastData)) {
      moneyFlowData.forEach((month) => {
        const actualValue = Number(month.actual) || 0;
        const forecastPoint = forecastData.find(f => f.month_name === month.month_name);
        const forecastValue = forecastPoint ? Number(forecastPoint.forecast) : 0;
        const variance = actualValue - forecastValue;
        
        let accuracy = 'N/A';
        if (actualValue > 0) {
          accuracy = (100 * (1 - Math.abs(variance) / actualValue)).toFixed(1) + '%';
        } else if (forecastValue === 0) {
          accuracy = '100.0%';
        } else {
          accuracy = '0.0%';
        }

        comparisonSheetData.push([
          month.month_name,
          `₱${actualValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `₱${forecastValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `₱${Math.abs(variance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          variance > 0 ? 'Actual > Forecast' : variance < 0 ? 'Actual < Forecast' : 'Exact Match',
          accuracy
        ]);
      });
    }
    
    // Convert data to worksheets
    const ws1 = XLSX.utils.aoa_to_sheet(summarySheetData);
    const ws2 = XLSX.utils.aoa_to_sheet(comparisonSheetData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, "Accuracy Summary");
    XLSX.utils.book_append_sheet(wb, ws2, "Monthly Comparison");
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Column A width
      { wch: 20 }, // Column B width
      { wch: 20 }, // Column C width
      { wch: 20 }, // Column D width
      { wch: 25 }, // Column E width
      { wch: 15 }, // Column F width
    ];
    
    ws1['!cols'] = colWidths;
    ws2['!cols'] = colWidths;
    
    // Generate Excel file
    XLSX.writeFile(wb, fileName);
    
    console.log(`Accuracy report exported successfully as ${fileName}`);
    
  } catch (error) {
    console.error('Error exporting accuracy report:', error);
    alert('Failed to export accuracy report. Please try again.');
  }
};

// Your department list for the pie chart
const DEPARTMENTS = [
  'Merchandise Planning',
  'Store Operations',
  'Marketing',
  'Operations',
  'IT',
  'Logistics',
  'Human Resources'
];

// Helper function to format peso amounts
const formatPeso = (amount) => {
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const [pieChartApiData, setPieChartApiData] = useState(null); // For Pie Chart
  const [departmentDetailsData, setDepartmentDetailsData] = useState(null); // For "View Details"

  // MODIFICATION START
  // New state for the forecast accuracy data from the API
  const [forecastAccuracyData, setForecastAccuracyData] = useState(null);
  // MODIFICATION END

  // New state for forecast analysis
  const [performanceTrend, setPerformanceTrend] = useState('stable');
  const [accuracyHistory, setAccuracyHistory] = useState([85, 82, 88, 90, 87]); // This remains placeholder for now

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

  // This useEffect fetches data that does NOT change with the time filter. It runs once.
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setLoading(true); // This controls the main page loader
        const fiscalYearId = 2; // This should ideally be dynamic

        const [moneyFlowRes, pieChartRes, departmentDetailsRes] =
          await Promise.all([
            getMoneyFlowData(fiscalYearId),
            getTopCategoryAllocations(),
            getDepartmentBudgetData(),
          ]);

        setMoneyFlowData(moneyFlowRes.data);
        setPieChartApiData(pieChartRes.data);
        setDepartmentDetailsData(departmentDetailsRes.data);
      } catch (error) {
        console.error("Failed to fetch static dashboard data:", error);
      } finally {
        setLoading(false); // Hide main page loader once static data is loaded
      }
    };

    fetchStaticData();

    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // This new useEffect ONLY fetches the summary data and re-runs when `timeFilter` changes.
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const summaryRes = await getBudgetSummary(timeFilter);
        setSummaryData(summaryRes.data);
      } catch (error) {
        console.error("Failed to fetch budget summary data:", error);
      }
    };

    fetchSummaryData();
  }, [timeFilter]); // Dependency array ensures this runs when the filter button is clicked

  // This new useEffect fetches forecast and accuracy data when the comparison view is toggled
  useEffect(() => {
    const fetchAnalysisData = async () => {
      // Only fetch if the comparison view is active and we don't have the data yet
      if (showForecastComparison && !forecastAccuracyData) {
        try {
          const [forecastRes, accuracyRes] = await Promise.all([
            getForecastData(2), // Assuming fiscal year 2 for now
            getForecastAccuracy(),
          ]);

          // Handle forecast data
          if (Array.isArray(forecastRes.data)) {
            setForecastData(forecastRes.data);
          } else {
            console.log("No forecast data available from API:", forecastRes.data.detail);
            setForecastData([]);
          }

          // Handle accuracy data
          setForecastAccuracyData(accuracyRes.data);

        } catch (error) {
          console.error("Failed to fetch forecast analysis data:", error);
          setForecastData([]);
          setForecastAccuracyData(null);
        }
      }
    };

    fetchAnalysisData();
  }, [showForecastComparison]);

  // MODIFICATION START
  // Update the dependency for calculating performance trend
  useEffect(() => {
    // This is still using placeholder history, but now triggers with real data
    if (forecastAccuracyData) {
      const trend = calculatePerformanceTrend(accuracyHistory);
      setPerformanceTrend(trend);
    }
  }, [forecastAccuracyData, accuracyHistory]);
  // MODIFICATION END

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

  // REVISION 3: Pie chart data changed to PER DEPARTMENT
  // We'll use the department list and map it to the department data
  const getDepartmentPieData = () => {
    // If we have department data from API, use it
    if (departmentDetailsData && departmentDetailsData.length > 0) {
      // Filter to only include departments from our list
      const filteredDepartments = departmentDetailsData.filter(dept => 
        DEPARTMENTS.includes(dept.department_name)
      );
      
      // If we have matching data, use it
      if (filteredDepartments.length > 0) {
        return {
          labels: filteredDepartments.map((dept) => dept.department_name),
          datasets: [
            {
              data: filteredDepartments.map((dept) => dept.budget),
              backgroundColor: [
                "#007bff", "#28a745", "#ffc107", "#dc3545", 
                "#6f42c1", "#fd7e14", "#20c997", "#17a2b8"
              ],
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: 15,
            },
          ],
        };
      }
    }
    
    // Fallback: Use the categories data but relabel as departments
    if (pieChartApiData && pieChartApiData.length > 0) {
      const limitedData = pieChartApiData.slice(0, Math.min(pieChartApiData.length, DEPARTMENTS.length));
      return {
        labels: limitedData.map((_, index) => DEPARTMENTS[index] || `Department ${index + 1}`),
        datasets: [
          {
            data: limitedData.map((c) => c.total_allocated),
            backgroundColor: [
              "#007bff", "#28a745", "#ffc107", "#dc3545", 
              "#6f42c1", "#fd7e14", "#20c997", "#17a2b8"
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 15,
          },
        ],
      };
    }
    
    // Ultimate fallback: Use sample department data
    return {
      labels: DEPARTMENTS,
      datasets: [
        {
          data: [1854420, 2618842, 2273144, 1895670, 1543200, 1367890, 1089450],
          backgroundColor: [
            "#007bff", "#28a745", "#ffc107", "#dc3545", 
            "#6f42c1", "#fd7e14", "#20c997"
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  };

  const pieChartData = getDepartmentPieData();
  const totalPieValue = pieChartData.datasets[0].data.reduce((sum, value) => sum + value, 0);

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
            }: ${formatPeso(context.raw)} (${percentage}%)`;
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

        const text = formatPeso(totalPieValue),
          textX = width / 2,
          textY = height / 2;

        ctx.fillStyle = "#007bff";
        ctx.fillText(text, textX, textY);
        ctx.save();
      },
    },
  };

  // Generate new example data
  const generateNewExampleData = () => {
    if (moneyFlowData) {
      const newExampleData = generateExampleForecastData(moneyFlowData);
      setExampleForecastData(newExampleData);
      
      const actualValues = moneyFlowData.map(d => d.actual);
      const forecastValues = newExampleData.map(d => d.forecast);
      const metrics = calculateAccuracyMetrics(actualValues, forecastValues);
      
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

              {/* REVISION 2: Total Budget with Peso format and dash amount */}
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
                  {formatPeso(summaryData?.total_budget || 0)}
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

              {/* REVISION 2: Remaining Budget with Peso format and dash amount */}
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
                  {formatPeso(summaryData?.remaining_budget || 0)}
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

            {/* --- MODIFICATION START --- */}
            {/* Replace the entire "Forecast Analysis Section" with this connected version */}
            {showForecastComparison && (
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
                  {/* MOVED: Export Report Button from Money Flow to here */}
                  <button
                    onClick={() => exportToExcel(summaryData, moneyFlowData, pieChartData, departmentDetailsData, timeFilter)}
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

                {/* Check if data has been loaded */}
                {!forecastAccuracyData ? (
                  <div>Loading accuracy data...</div>
                ) : (
                  <>
                    <div className="stats-grid" style={{ marginBottom: "20px" }}>
                      {/* Accuracy Score Card */}
                      <div
                        className="card compact-budget-card"
                        style={{ flex: "1 1 25%", textAlign: "center" }}
                      >
                        <Target size={24} style={{ margin: '0 auto 10px', color: '#007bff' }} />
                        <h3 className="compact-card-title">Accuracy Score</h3>
                        <p className="compact-stat-value" style={{ 
                          color: forecastAccuracyData.accuracy_percentage >= 90 ? '#28a745' :
                                 forecastAccuracyData.accuracy_percentage >= 75 ? '#007bff' :
                                 forecastAccuracyData.accuracy_percentage >= 50 ? '#ffc107' : '#dc3545'
                        }}>
                          {forecastAccuracyData.accuracy_percentage}%
                        </p>
                        <span className="compact-badge" style={{ 
                          backgroundColor: forecastAccuracyData.accuracy_percentage >= 90 ? '#28a745' :
                                           forecastAccuracyData.accuracy_percentage >= 75 ? '#007bff' :
                                           forecastAccuracyData.accuracy_percentage >= 50 ? '#ffc107' : '#dc3545',
                          color: 'white'
                        }}>
                          {forecastAccuracyData.accuracy_percentage >= 90 ? 'Excellent' : 
                           forecastAccuracyData.accuracy_percentage >= 75 ? 'Good' : 
                           forecastAccuracyData.accuracy_percentage >= 50 ? 'Fair' : 'Poor'}
                        </span>
                      </div>

                      {/* REVISION 2: Variance Card with Peso format */}
                      <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                        <h3 className="compact-card-title">Variance</h3>
                        <p className="compact-stat-value" style={{ color: Number(forecastAccuracyData.variance) >= 0 ? '#dc3545' : '#28a745' }}>
                          {formatPeso(Math.abs(Number(forecastAccuracyData.variance)))}
                        </p>
                        <p className="compact-card-subtext">
                          {Number(forecastAccuracyData.variance) >= 0 ? 'Over Forecast' : 'Under Forecast'}
                        </p>
                      </div>

                      {/* Actual Spend Card with Peso format */}
                      <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                        <h3 className="compact-card-title">Actual Spend ({forecastAccuracyData.month_name})</h3>
                        <p className="compact-stat-value" style={{ color: '#28a745' }}>
                          {formatPeso(Number(forecastAccuracyData.actual_spend))}
                        </p>
                        <p className="compact-card-subtext">Last Completed Month</p>
                      </div>

                      {/* Forecasted Spend Card with Peso format */}
                      <div className="card compact-budget-card" style={{ flex: "1 1 25%" }}>
                        <h3 className="compact-card-title">Forecasted Spend ({forecastAccuracyData.month_name})</h3>
                        <p className="compact-stat-value" style={{ color: '#ff6b35' }}>
                          {formatPeso(Number(forecastAccuracyData.forecasted_spend))}
                        </p>
                        <p className="compact-card-subtext">Last Completed Month</p>
                      </div>
                    </div>

                    {/* Detailed Metrics Table (This still uses example data from moneyFlowData as a placeholder) */}
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
                              const forecastPoint = forecastData.find(f => f.month_name === month.month_name);
                              const forecastValue = forecastPoint ? Number(forecastPoint.forecast) : 0;
                              const actualValue = Number(month.actual);
                              const variance = actualValue - forecastValue;
                              const accuracy = actualValue > 0 ? (100 - Math.abs((variance / actualValue) * 100)).toFixed(1) : (forecastValue === 0 ? '100.0' : '0.0');
                              
                              return (
                                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                                  <td style={{ padding: '12px' }}>{month.month_name}</td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>
                                    {formatPeso(actualValue)}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>
                                    {forecastPoint ? formatPeso(forecastValue) : 'N/A'}
                                  </td>
                                  <td style={{ 
                                    padding: '12px', 
                                    textAlign: "right",
                                    color: variance > 0 ? '#28a745' : '#dc3545'
                                  }}>
                                    {variance !== 0 ? 
                                      `${formatPeso(Math.abs(variance))} ${variance > 0 ? 'Under' : 'Over'}` : 
                                      'Exact'
                                    }
                                  </td>
                                  <td style={{ 
                                    padding: '12px', 
                                    textAlign: "right",
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
                  </>
                )}
              </div>
            )}
            {/* --- MODIFICATION END --- */}

            {/* FIXED: Budget per Department with proper peso formatting */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 className="card-title">Budget per Department</h3>
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
                    const amount = pieChartData.datasets[0].data[index];
                    const percentage = (
                      (amount / totalPieValue) *
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
                          {/* FIXED: Proper peso format with commas and two decimal places */}
                          <span
                            style={{
                              fontWeight: "bold",
                              flexShrink: 0,
                              minWidth: "120px",
                              textAlign: "right",
                            }}
                          >
                            {formatPeso(amount)}
                          </span>
                          <span
                            style={{
                              color: "#6c757d",
                              fontSize: "12px",
                              minWidth: "45px",
                              textAlign: "right",
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

              {/* FIXED: Department list with proper peso formatting */}
              {showBudgetDetails && (
                <div className="dept-budget-list">
                  {/* Use the 'departmentDetailsData' from the API call, not 'categoryData' */}
                  {departmentDetailsData &&
                    departmentDetailsData.filter(dept => DEPARTMENTS.includes(dept.department_name)).map((dept, index, filteredArray) => (
                      <div
                        key={dept.department_id} // Use a stable key like the ID
                        className={`dept-budget-item ${
                          index < filteredArray.length - 1 ? "with-border" : ""
                        }`}
                      >
                        <div className="dept-budget-header">
                          {/* Use the correct property name: department_name */}
                          <h4 className="dept-budget-title">{dept.department_name}</h4>
                          <p className="dept-budget-percentage">
                            {dept.percentage_used}% of budget used
                          </p>
                        </div>
                        <div className="progress-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${dept.percentage_used}%`,
                              backgroundColor: "#007bff",
                            }}
                          ></div>
                        </div>
                        <div className="dept-budget-details">
                          {/* FIXED: Proper peso format with commas and two decimal places */}
                          <p>Budget: {formatPeso(dept.budget)}</p>
                          <p>Spent: {formatPeso(dept.spent)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {/* --- MODIFICATION END --- */}
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetDashboard;