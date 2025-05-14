import React, { useState, useEffect } from 'react';
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell}
from 'recharts';
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function BudgetDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentDate(new Date());
  }, 1000);

  return () => clearInterval(interval); // cleanup
}, []);

  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

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
    { name: 'Marketing', budget: 50000, spent: 45000, percentage: 90, color: '#16a34a' },
    { name: 'Development', budget: 20000, spent: 18000, percentage: 90, color: '#22c55e' },
    { name: 'Operations', budget: 30000, spent: 21600, percentage: 72, color: '#4ade80' },
  ];

  // Project data
  const projectData = [
    { name: 'ERP Implementation', budget: 50000, spent: 25000, remaining: 25000, status: 'On Track', progress: 50 },
    { name: 'Digital Marketing', budget: 50000, spent: 30000, remaining: 20000, status: 'At Risk', progress: 60 },
    { name: 'Product Launch', budget: 50000, spent: 40000, remaining: 10000, status: 'Warning', progress: 80 },
  ];

  // Pie chart data for department allocation
  const pieData = [
    { name: 'Marketing', value: 50, color: '#16a34a' },
    { name: 'Development', value: 20, color: '#22c55e' },
    { name: 'Operations', value: 30, color: '#4ade80' },
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
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    // Navigate to login screen
    navigate('/login');
  };

  const handleExport = () => {
    // Implement actual export functionality here
    console.log("Exporting report...");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown">
              <button 
                className="dropdown-toggle"
                onClick={toggleBudgetDropdown}
              >
                Budget <ChevronDown size={14} />
              </button>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Budget</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>
                    Budget Proposal
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>
                    Proposal History
                  </div>
                  
                  <div className="dropdown-header">Account</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/account-setup')}>
                    Account Setup
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>
                    Ledger View
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/journal-entry')}>
                    Journal Entries
                  </div>
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown">
              <button 
                className="dropdown-toggle"
                onClick={toggleExpenseDropdown}
              >
                Expense <ChevronDown size={14} />
              </button>
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
            
            {/* User Management */}
            <div className="nav-link" onClick={() => handleNavigate('/finance/user-management')}>
              User Management
            </div>
          </nav>
        </div>
        {/* Time and Date Display */}
<div className="header-datetime">
  <span className="formatted-date">{formattedDate}</span>
  <span className="formatted-time">{formattedTime}</span>
</div>
        {/* User Profile */}
        <div className="user-profile dropdown">
          <button 
            className="avatar-button"
            onClick={toggleProfileDropdown}
          >
            <img src="/api/placeholder/32/32" alt="User avatar" />
          </button>
          {showProfileDropdown && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={11} className="icon" /> Logout
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Date display */}
        <div className="date-display">
          <div className="date-time-badge">
            {formattedDate} | {formattedTime}
          </div>
          <button className="export-button" onClick={handleExport}>
            Export Report
          </button>
        </div>

        {/* Top Cards */}
        <div className="stats-grid">
          {/* Department Allocation */}
          <div className="card">
            <h3 className="card-title">Budget Allocation by Department</h3>
            <div className="allocation-chart-container">
              <div className="pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
          </div>

          {/* Plan Completion */}
          <div className="card">
            <h3 className="card-title">Plan Completion</h3>
            <p className="stat-value">{planCompletion}%</p>
            <p className="stat-label">Overall Status of Plan</p>
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
          <h3 className="card-title">Monthly Budget vs Actual</h3>
          <div className="chart-container-large">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={12}
              >
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="#16a34a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Actual" fill="#86efac" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status */}
        <div className="card">
          <h3 className="card-title">Project Status</h3>
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
            <button className="page-button">
              <ChevronLeft size={16} />
            </button>
            <button className="page-button">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Department Budget vs Actual */}
        <div className="card">
          <h3 className="card-title">Department Budget vs Actual</h3>
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
      </main>
    </div>
  );
}

export default BudgetDashboard;