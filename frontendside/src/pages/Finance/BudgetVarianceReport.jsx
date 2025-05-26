import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './BudgetVarianceReport.css';

const BudgetVarianceReport = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 5; // Number of items per page

  const budgetData = [
    {
      id: 1,
      category: 'INCOME',
      budget: '₱3,326,025.75',
      actual: '₱2,500,025.75',
      available: '₱500,000.00',
      isPositive: true,
      isHeader: true
    },
    {
      id: 2,
      category: 'PRIMARY INCOME',
      budget: '₱3,326,025.75',
      actual: '₱2,500,025.75',
      available: '₱500,000.00',
      isPositive: true,
      isSubcategory: true
    },
    {
      id: 3,
      category: 'Utilities',
      budget: '₱90,000',
      actual: '₱100,000',
      available: '₱10,000',
      isPositive: true,
      isSubcategory: true,
      indent: true
    },
    {
      id: 4,
      category: 'EXPENSE',
      budget: '₱2,326,025.75',
      actual: '₱1,500,025.75',
      available: '₱826,000',
      isPositive: true,
      isHeader: true
    },
    {
      id: 5,
      category: 'BILLS',
      budget: '₱250,000',
      actual: '₱0.00',
      available: '₱250,000',
      isPositive: true,
      percentage: '4% of budget',
      isSubcategory: true
    },
    {
      id: 6,
      category: 'Utilities',
      budget: '₱250,000',
      actual: '₱0.00',
      available: '₱250,000',
      isPositive: true,
      isSubcategory: true,
      indent: true
    },
    {
      id: 7,
      category: 'DISCRETIONARY',
      budget: '₱650,000',
      actual: '₱700,000',
      available: '₱50,000',
      isPositive: true,
      percentage: '15% of budget',
      isSubcategory: true
    },
    {
      id: 8,
      category: 'Cloud Hosting',
      budget: '₱100,000',
      actual: '₱150,000',
      available: '-₱50,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    },
    {
      id: 9,
      category: 'Software Subscription',
      budget: '₱250,000',
      actual: '₱550,000',
      available: '-₱250,000',
      isPositive: false,
      isSubcategory: true,
      indent: true
    }
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = budgetData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(budgetData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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
    <div className="app-container">
      {/* Header - Copied from Dashboard */}
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
                    className="dropdown-item active"
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
        <h2 className="page-title">Budget Variance Report</h2>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Category</th>
                <th style={{ width: '25%' }}>Budget</th>
                <th style={{ width: '25%' }}>Actual</th>
                <th style={{ width: '25%', textAlign: 'right' }}>Available</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className={`${item.isHeader ? 'header-row' : ''} ${item.isSubcategory ? 'subcategory-row' : ''} ${item.indent ? 'indent-row' : ''}`}>
                  <td>
                    <span className="category-name">{item.category}</span>
                    {item.percentage && (
                      <span className="percentage-badge">{item.percentage}</span>
                    )}
                  </td>
                  <td>{item.budget}</td>
                  <td>{item.actual}</td>
                  <td style={{ textAlign: 'right' }} className={item.isPositive ? 'positive' : 'negative'}>
                    {item.available}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* Pagination */}
          <div className="pagination-controls">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetVarianceReport;