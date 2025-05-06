import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [currentDate] = useState(new Date('2025-04-14T10:45:00'));
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Format date and time
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  // Budget data
  const totalBudget = 90000;
  const allocatedBudget = 100000;
  const remainingBudget = 50000;
  const allocatedPercentage = 47;
  const planCompletion = 84.4;

  // Monthly data
  const monthlyData = [
    { name: 'Jan', Budget: 26000, Actual: 24000 },
    { name: 'Feb', Budget: 26000, Actual: 25000 },
    { name: 'Mar', Budget: 26000, Actual: 26000 },
    { name: 'Apr', Budget: 26000, Actual: 21000 },
    { name: 'May', Budget: 26000, Actual: 24000 },
    { name: 'Jun', Budget: 26000, Actual: 25000 },
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

  // Timeline steps
  const timelineSteps = [
    { name: 'Review', status: 'Completed' },
    { name: 'Analysis', status: 'Completed' },
    { name: 'Mid-year Review', status: 'Completed' },
    { name: 'Budget Planning', status: 'Current' },
    { name: 'Annual Report', status: 'Pending' },
  ];

  // Pie chart data
  const pieData = [
    { name: 'Marketing', value: 50, color: '#16a34a' },
    { name: 'Development', value: 20, color: '#22c55e' },
    { name: 'Operations', value: 30, color: '#4ade80' },
  ];

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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item active">Dashboard</Link>
            
            {/* Budget Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  {/* Budget Items */}
                  <h4 className="dropdown-category">Budget</h4>
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

                  {/* Account Items */}
                  <h4 className="dropdown-category">Account</h4>
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
                </div>
              )}
            </div>
            
            {/* Expense Dropdown */}
            <div className="dropdown-container">
              <div className="nav-item dropdown-toggle" onClick={toggleExpenseDropdown}>
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
            
            {/* User Management - Simple Navigation Item */}
            <div 
              className="nav-item"
              onClick={() => handleNavigate('/finance/user-management')}
            >
              User Management
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
      <main className="dashboard-main">
        {/* Timestamp section below header as shown in the UI */}
        <div className="timestamp-section">
          <div className="timestamp-container">
            <p>{formattedDate} | {formattedTime}</p>
          </div>
        </div>
        
        {/* Top Budget Cards Row */}
        <div className="budget-cards-row">
          {/* Total Budget Card */}
          <div className="budget-card">
            <h3>Total Budget</h3>
            <p className="budget-amount">₱{totalBudget.toLocaleString()}</p>
            <p className="budget-label">Allocated</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${allocatedPercentage}%` }}></div>
            </div>
            <p className="percentage-text">{allocatedPercentage}%</p>
          </div>

          {/* Allocated Budget Card */}
          <div className="budget-card">
            <h3>Allocated Budget</h3>
            <p className="budget-amount">₱{allocatedBudget.toLocaleString()}</p>
            <p className="budget-label">47% of Total Budget</p>
            <div className="budget-status on-target">on target</div>
          </div>

          {/* Budget Allocation Chart */}
          <div className="budget-card allocation-card">
            <h3>Budget Allocation by Department</h3>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="allocation-legend">
                {departmentData.map((dept, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: dept.color }}></div>
                    <div className="legend-name">{dept.name}</div>
                    <div className="legend-bar">
                      <div 
                        className="legend-bar-fill" 
                        style={{ backgroundColor: dept.color }}
                      ></div>
                    </div>
                    <div className="legend-value">₱{dept.budget.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remaining Budget Card */}
          <div className="budget-card">
            <h3>Remaining Budget</h3>
            <p className="budget-amount">₱{remainingBudget.toLocaleString()}</p>
            <p className="budget-label">56% of Total Budget</p>
            <div className="budget-status available">available to allocate</div>
          </div>

          {/* Plan Completion Card */}
          <div className="budget-card">
            <h3>Plan Completion</h3>
            <p className="completion-percentage">{planCompletion.toFixed(1)}%</p>
            <div className="progress-bar">
              <div className="progress-fill blue" style={{ width: `${planCompletion}%` }}></div>
            </div>
            <p className="completion-info">Overall Status of Plan</p>
          </div>
        </div>

        {/* Monthly Budget vs Actual Chart */}
        <div className="chart-section">
          <h3>Monthly Budget vs Actual</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={8}
                barSize={20}
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
        <div className="section-card">
          <h3>Project Status</h3>
          <div className="table-container">
            <table className="project-table">
              <thead>
                <tr>
                  <th>PROJECT NAME</th>
                  <th>BUDGET</th>
                  <th>SPENT</th>
                  <th>REMAINING</th>
                  <th>STATUS</th>
                  <th>PROGRESS</th>
                </tr>
              </thead>
              <tbody>
                {projectData.map((project, index) => (
                  <tr key={index}>
                    <td>{project.name}</td>
                    <td>₱{project.budget.toLocaleString()}</td>
                    <td>₱{project.spent.toLocaleString()}</td>
                    <td>₱{project.remaining.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${
                        project.status === 'On Track' ? 'on-track' :
                        project.status === 'At Risk' ? 'at-risk' :
                        'warning'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${
                              project.status === 'On Track' ? 'green' :
                              project.status === 'At Risk' ? 'red' :
                              'yellow'
                            }`} 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn"><ChevronLeft size={16} /></button>
            <button className="pagination-btn"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Project Timeline */}
        <div className="section-card">
          <h3>Project Timeline</h3>
          <div className="timeline-container">
            <div className="timeline-steps">
              {timelineSteps.map((step, index) => (
                <div key={index} className="timeline-step">
                  <div className={`step-circle ${
                    step.status === 'Completed' ? 'completed' :
                    step.status === 'Current' ? 'current' : 'pending'
                  }`}></div>
                  <div className="step-info">
                    <div className="step-name">{step.name}</div>
                    <div className="step-status">{step.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Budget vs Actual */}
        <div className="section-card">
          <h3>Department Budget vs Actual</h3>
          {departmentData.map((dept, index) => (
            <div key={index} className="dept-budget-item">
              <div className="dept-header">
                <h4>{dept.name}</h4>
                <p className="dept-percentage">{dept.percentage}% of budget used</p>
              </div>
              <div className="dept-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill green" 
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="dept-values">
                <p>Budget: ₱{dept.budget.toLocaleString()}</p>
                <p>Spent: ₱{dept.spent.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;