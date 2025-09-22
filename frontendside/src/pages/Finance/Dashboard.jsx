import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { ChevronLeft, ChevronRight, ChevronDown, Search, ArrowLeft, Expand, Minimize, User, Mail, Briefcase, LogOut, Bell, Settings, Eye, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import './Dashboard.css';

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

function BudgetDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showForecasting, setShowForecasting] = useState(false);
  const navigate = useNavigate();

  // User profile data
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
      if (!event.target.closest('.nav-dropdown') && 
          !event.target.closest('.notification-container') && 
          !event.target.closest('.profile-container')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
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

  // Budget data
  const totalBudget = 800025.75;
  const remainingBudget = 50000;
  const planCompletion = 84.4;
  const allocatedPercentage = 47;

  // Monthly data for line chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Budget',
        data: [26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000, 26000],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Expense',
        data: [14000, 5000, 26000, 9500, 24000, 20000, 18000, 22000, 19000, 21000, 23000, 25000],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#28a745',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      // Forecast data - only shown when toggled
      ...(showForecasting ? [{
        label: 'Forecast',
        data: [14000, 18000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 40000],
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff6b35',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }] : []),
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₱${context.raw.toLocaleString()}`;
          }
        }
      }
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
    labels: [
      'Professional Services',
      'Training and Development',
      'Miscellaneous',
      'Equipment and Maintenance',
      'Utilities',
      'Travel'
    ],
    datasets: [
      {
        data: [1200, 800, 1500, 2200, 450, 800],
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const totalPieValue = pieChartData.datasets[0].data.reduce((sum, value) => sum + value, 0);

  // Fixed the duplicate 'plugins' key issue
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '0%', // Remove cutout to make it a complete pie chart
    plugins: {
      legend: {
        display: false, // Remove the legend
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = ((context.raw / totalPieValue) * 100).toFixed(1);
            return `${context.label}: ₱${context.raw.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      // Add center text plugin
      beforeDraw: function(chart) {
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
        
        ctx.fillStyle = '#007bff';
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }
  };

  // Department data
  const departmentData = [
    { name: 'Training & Development', budget: 190000, spent: 171000, percentage: 90, color: '#007bff' },
    { name: 'Professional Services', budget: 190000, spent: 171000, percentage: 90, color: '#007bff' },
    { name: 'Equipment & Maintenance', budget: 1700000, spent: 1224000, percentage: 72, color: '#007bff' },
  ];

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowNotifications(false);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      sessionStorage.clear();
      setShowProfileDropdown(false);
      navigate('/login', { replace: true });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };

  const toggleBudgetDetails = () => {
    setShowBudgetDetails(!showBudgetDetails);
  };

  const toggleForecasting = () => {
    setShowForecasting(!showForecasting);
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
    <div className="app-container" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
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
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showBudgetDropdown ? 'active' : ''}`}
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} className={`dropdown-arrow ${showBudgetDropdown ? 'rotated' : ''}`} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Budget Allocation
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${showExpenseDropdown ? 'active' : ''}`}
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} className={`dropdown-arrow ${showExpenseDropdown ? 'rotated' : ''}`} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
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

          {/* User Controls */}
          <div className="navbar-controls">
            {/* Timestamp/Date */}
            <div className="date-time-badge" style={{
              marginRight: '16px',
              background: '#f3f4f6',
              borderRadius: '16px',
              padding: '4px 14px',
              fontSize: '0.95rem',
              color: '#007bff',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              {formattedDate} | {formattedTime}
            </div>

            {/* Notification Icon */}
            <div className="notification-container">
              <div 
                className="notification-icon"
                onClick={toggleNotifications}
              >
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </div>
              
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="clear-all-btn">Clear All</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-icon-wrapper">
                        <Bell size={16} />
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Budget Approved</div>
                        <div className="notification-message">Your Q3 budget has been approved</div>
                        <div className="notification-time">2 hours ago</div>
                      </div>
                      <button className="notification-delete">&times;</button>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon-wrapper">
                        <Bell size={16} />
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Expense Report</div>
                        <div className="notification-message">New expense report needs review</div>
                        <div className="notification-time">5 hours ago</div>
                      </div>
                      <button className="notification-delete">&times;</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-container">
              <div 
                className="profile-trigger"
                onClick={toggleProfileDropdown}
              >
                <img src={userProfile.avatar} alt="User avatar" className="profile-image" />
                {/* Removed dropdown arrow */}
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-info-section">
                    <img src={userProfile.avatar} alt="Profile" className="profile-dropdown-image" />
                    <div className="profile-details">
                      <div className="profile-name">{userProfile.name}</div>
                      <div className="profile-role-badge">{userProfile.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item">
                    <User size={16} />
                    <span>Manage Profile</span>
                  </div>
                  {userProfile.role === "Admin" && (
                    <div className="dropdown-item">
                      <Settings size={16} />
                      <span>User Management</span>
                    </div>
                  )}
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content-container" style={{ height: 'calc(100vh - 60px)', overflow: 'auto', marginTop: '60px' }}>
        {/* Time period filter */}
        <div className="time-filter">
          <button 
            className={`filter-button ${timeFilter === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('monthly')}
            style={{ backgroundColor: timeFilter === 'monthly' ? '#007bff' : '#007bff', color: 'white' }}
          >
            Monthly
          </button>
          <button 
            className={`filter-button ${timeFilter === 'quarterly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('quarterly')}
            style={{ backgroundColor: timeFilter === 'quarterly' ? '#007bff' : '#007bff', color: 'white' }}
          >
            Quarterly
          </button>
          <button 
            className={`filter-button ${timeFilter === 'yearly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('yearly')}
            style={{ backgroundColor: timeFilter === 'yearly' ? '#007bff' : '#007bff', color: 'white' }}
          >
            Yearly
          </button>
        </div>

        <div className="stats-grid">
          {/* Budget Completion */}
          <div className="card compact-budget-card" style={{ flex: '1 1 33%' }}>
            <h3 className="compact-card-title">Budget Completion</h3>
            <p className="compact-stat-value">{planCompletion}%</p>
            <p className="compact-card-subtext">Overall Status of Budget Plan</p>
            <div className="compact-progress-container">
              <div 
                className="compact-progress-bar" 
                style={{ width: `${planCompletion}%`, backgroundColor: '#007bff' }}
              />
            </div>
          </div>

          {/* Total Budget */}
          <div className="card compact-budget-card" style={{ flex: '1 1 33%' }}>
            <h3 className="compact-card-title">Total Budget</h3>
            <p className="compact-stat-value">₱{totalBudget.toLocaleString()}</p>
            <p className="compact-card-subtext">{allocatedPercentage}% allocated</p>
            <div className="compact-progress-container">
              <div 
                className="compact-progress-bar" 
                style={{ width: `${allocatedPercentage}%`, backgroundColor: '#007bff' }}
              />
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="card compact-budget-card" style={{ flex: '1 1 33%' }}>
            <h3 className="compact-card-title">Remaining Budget</h3>
            <p className="compact-stat-value">₱{remainingBudget.toLocaleString()}</p>
            <p className="compact-card-subtext">56% of Total Budget </p>
            <span className="compact-badge">Available for Allocation</span>
          </div>
        </div>

        {/* Money Flow Chart - Expanded */}
        <div className="card chart-card" style={{ width: '100%', marginBottom: '20px', height: '450px' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Money Flow</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Budget</button>
                <button style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Expense</button>
                {showForecasting && (
                  <button style={{ padding: '4px 8px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Forecast</button>
                )}
                {/* Removed the "All accounts" button as requested */}
              </div>
              <button 
                onClick={toggleForecasting}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: showForecasting ? '#ff6b35' : '#e9ecef', 
                  color: showForecasting ? 'white' : '#6c757d', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={showForecasting ? "Hide Forecast" : "Show Forecast"}
              >
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
          <div className="chart-container-large" style={{ height: '380px' }}>
            <Line data={monthlyData} options={lineChartOptions} />
          </div>
        </div>

        {/* Budget per category with Pie Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title">Budget per category</h3>
            <button 
              className="view-button"
              onClick={toggleBudgetDetails}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <Eye size={16} />
            </button>
          </div>
          
          {/* Updated Pie Chart layout */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', height: '300px' }}>
            <div style={{ width: '50%', height: '100%', position: 'relative' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div style={{ 
              width: '50%', 
              paddingLeft: '10px', 
              height: '100%', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {pieChartData.labels.map((label, index) => {
                const percentage = ((pieChartData.datasets[0].data[index] / totalPieValue) * 100).toFixed(1);
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '14px',
                    padding: '6px 0',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        backgroundColor: pieChartData.datasets[0].backgroundColor[index], 
                        borderRadius: '4px', 
                        marginRight: '10px', 
                        flexShrink: 0 
                      }}></div>
                      <span style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        marginRight: '8px',
                        fontWeight: '500'
                      }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        minWidth: '70px',
                        textAlign: 'right'
                      }}>₱{pieChartData.datasets[0].data[index].toLocaleString()}</span>
                      <span style={{ 
                        color: '#6c757d',
                        fontSize: '12px',
                        minWidth: '40px'
                      }}>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Department list is now hidden by default and shown when clicking the eye icon */}
          {showBudgetDetails && (
            <div className="dept-budget-list">
              {departmentData.map((dept, index) => (
                <div key={index} className={`dept-budget-item ${index < departmentData.length - 1 ? "with-border" : ""}`}>
                  <div className="dept-budget-header">
                    <h4 className="dept-budget-title">{dept.name}</h4>
                    <p className="dept-budget-percentage">{dept.percentage}% of budget used</p>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${dept.percentage}%`, backgroundColor: '#007bff' }}
                    ></div>
                  </div>
                  <div className="dept-budget-details">
                    <p>Budget: ₱{dept.budget.toLocaleString()}</p>
                    <p>Spent: ₱{dept.spent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetDashboard;