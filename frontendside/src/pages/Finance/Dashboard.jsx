import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, ChevronDown, Search, ArrowLeft, Expand, Minimize } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function BudgetDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const navigate = useNavigate();

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

  // Monthly data
  const monthlyData = [
    { name: 'Jan', Budget: 26000, Actual: 14000 },
    { name: 'Feb', Budget: 26000, Actual: 5000 },
    { name: 'Mar', Budget: 26000, Actual: 26000 },
    { name: 'Apr', Budget: 26000, Actual: 9500 },
    { name: 'May', Budget: 26000, Actual: 24000 },
    { name: 'Jun', Budget: 26000, Actual: 20000 },
    { name: 'Jul', Budget: 26000, Actual: 20000 },
    { name: 'Aug', Budget: 26000, Actual: 24500 },
    { name: 'Sep', Budget: 26000, Actual: 25200 },
    { name: 'Oct', Budget: 26000, Actual: 24800 },
    { name: 'Nov', Budget: 26000, Actual: 25500 },
    { name: 'Dec', Budget: 26000, Actual: 24200 },
  ];

  // Department data
  const departmentData = [
    { name: 'Training & Development', budget: 50000, spent: 45000, percentage: 90, color: '#0047AB' },
    { name: 'Professional Services', budget: 30000, spent: 18000, percentage: 90, color: '#0096FF' },
    { name: 'Equipment & Maintenance', budget: 250000, spent: 21600, percentage: 72, color: '#89CFF0' },
  ];

  // Project data
  const projectData = [
    { name: 'Website Redesign Project', budget: 50000, spent: 25000, remaining: 25000, status: 'On Track', progress: 50 },
    { name: 'Cybersecurity Upgrade', budget: 50000, spent: 30000, remaining: 20000, status: 'At Risk', progress: 60 },
    { name: 'AR Retail Solution', budget: 50000, spent: 40000, remaining: 10000, status: 'Warning', progress: 80 },
  ];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="data-item" style={{ color: item.color }}>
              {item.name}: ₱{item.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header - Using ExpenseHistory Nav Structure */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-logo">BUDGETPRO</h1>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>

            {/* Budget Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-item ${showBudgetDropdown ? 'active' : ''}`} 
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/budget-proposal')}
                  >
                    Budget Proposal
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/proposal-history')}
                  >
                    Proposal History
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/account-setup')}
                  >
                    Account Setup
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/ledger-view')}
                  >
                    Ledger View
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/journal-entry')}
                  >
                    Journal Entries
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/budget-variance-report')}
                  >
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-item ${showExpenseDropdown ? 'active' : ''}`} 
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/expense-tracking')}
                  >
                    Expense Tracking
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate('/finance/expense-history')}
                  >
                    Expense History
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-avatar">
            <img src="/api/placeholder/36/36" alt="User avatar" className="avatar-img" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="content-container">
        {/* Date display - Modified to show only timestamp */}
        <div className="date-display">
          <div className="date-time-badge">
            {formattedDate} | {formattedTime}
          </div>
        </div>

        {/* Time period filter - UPDATED TO BLUE */}
        <div className="time-filter">
          <button 
            className={`filter-button ${timeFilter === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('monthly')}
            style={{ backgroundColor: timeFilter === 'monthly' ? '#2563eb' : '#3b82f6', color: 'white' }}
          >
            Monthly
          </button>
          <button 
            className={`filter-button ${timeFilter === 'quarterly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('quarterly')}
            style={{ backgroundColor: timeFilter === 'quarterly' ? '#2563eb' : '#3b82f6', color: 'white' }}
          >
            Quarterly
          </button>
          <button 
            className={`filter-button ${timeFilter === 'yearly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('yearly')}
            style={{ backgroundColor: timeFilter === 'yearly' ? '#2563eb' : '#3b82f6', color: 'white' }}
          >
            Yearly
          </button>
        </div>

        {/* Top Cards */}
        <div className="stats-grid">
          {/* Department Allocation - Pie Chart Removed */}
          <div className="card">
            <h3 className="card-title">Budget Allocation by Categories</h3>
            <div className="dept-list">
              {departmentData.map((dept, index) => (
                <div key={index} className="dept-item">
                  <div className="color-indicator" style={{ backgroundColor: dept.color }}></div>
                  <span className="dept-name">{dept.name}</span>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${dept.percentage}%`, backgroundColor: dept.color }}
                    ></div>
                  </div>
                  <span className="dept-budget">₱{dept.budget.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Completion */}
          <div className="card">
            <h3 className="card-title">Budget Completion</h3>
            <p className="stat-value">{planCompletion}%</p>
            <p className="stat-label">Overall Status of Budget Plan</p>
            <div className="progress-container">
              <div 
                className="progress-bar blue" 
                style={{ width: `${planCompletion}%` }}
              ></div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="card">
            <h3 className="card-title">Total Budget</h3>
            <p className="stat-value">₱{totalBudget.toLocaleString()}</p>
            <p className="stat-label">Allocated</p>
            <div className="progress-container">
              <div 
                className="progress-bar green" 
                style={{ width: `${allocatedPercentage}%` }}
              ></div>
            </div>
            <p className="percentage">{allocatedPercentage}%</p>
          </div>

          {/* Remaining Budget */}
          <div className="card">
            <h3 className="card-title">Remaining Budget</h3>
            <p className="stat-value">₱{remainingBudget.toLocaleString()}</p>
            <p className="stat-label">56% of Total Budget</p>
            <span className="badge badge-success">
              Available for Allocation
            </span>
          </div>
        </div>

        {/* Monthly Budget vs Actual */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="card-title">Monthly Budget vs Actual</h3>
            <button 
              className="expand-button"
              onClick={() => setExpandedChart(!expandedChart)}
              aria-label={expandedChart ? 'Collapse chart' : 'Expand chart'}
              style={{ color: '#3b82f6' }}
            >
              {expandedChart ? <Minimize size={16} /> : <Expand size={16} />}
            </button>
          </div>
          <div className="chart-container-large" style={{ height: expandedChart ? '500px' : '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={12}
              >
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Budget" fill="#0047AB" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Actual" fill="#6495ED" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status */}
        <div className="card">
          <h3 className="card-title">Proposal Timeline</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {projectData.map((project, index) => (
                  <tr key={index}>
                    <td className="project-name">{project.name}</td>
                    <td>₱{project.budget.toLocaleString()}</td>
                    <td>₱{project.spent.toLocaleString()}</td>
                    <td>₱{project.remaining.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        project.status === 'On Track' ? 'badge-success' :
                        project.status === 'At Risk' ? 'badge-danger' :
                        'badge-warning'
                      }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-with-label">
                        <div className="progress-container">
                          <div 
                            className={`progress-bar ${
                              project.status === 'On Track' ? 'green' :
                              project.status === 'At Risk' ? 'red' :
                              'yellow'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-label">{project.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="page-button" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              <ChevronLeft size={16} />
            </button>
            <button className="page-button" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Department Budget vs Actual */}
        <div className="card">
          <h3 className="card-title">Categories Budget vs Actual</h3>
          <div className="dept-budget-list">
            {departmentData.map((dept, index) => (
              <div key={index} className={`dept-budget-item ${index < departmentData.length - 1 ? "with-border" : ""}`}>
                <div className="dept-budget-header">
                  <h4 className="dept-budget-title">{dept.name}</h4>
                  <p className="dept-budget-percentage">{dept.percentage}% of budget used</p>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar green" 
                    style={{ width: `${dept.percentage}%` }}
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