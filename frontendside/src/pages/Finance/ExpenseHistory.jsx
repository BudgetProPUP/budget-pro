import React, { useState } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ExpenseHistory.css'; 

const ExpenseHistory = () => {
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of transactions per page
  const navigate = useNavigate();

  // Sample data
  const [transactions] = useState([
    {
      id: 1,
      date: '04-12-2025',
      description: 'Website Redesign Project',
      category: 'IT Team',
      amount: '₱50,000.00',
      projectSummary: 'This Budget Proposal provides necessary costs associated with the website redesign project (the "Project") which we would like to pursue due to increased mobile traffic and improved conversion rates from modern interfaces.',
      projectDescription: 'Complete redesign of company website with responsive design, improved UI/UX, integration with CRM, and enhanced e-commerce capabilities to boost customer engagement and sales conversion.',
      costElements: [
        { type: 'Hardware', description: 'Workstations, Servers, Testing Devices', cost: '₱25,000.00' },
        { type: 'Software', description: 'Design Tools, Development Platforms, Licenses', cost: '₱25,000.00' }
      ],
      dueDate: 'April 30, 2025'
    },
    {
      id: 2,
      date: '03-20-2025',
      description: 'Software Subscription',
      category: 'Software',
      amount: '₱15,750.00',
      projectSummary: 'Annual subscription for productivity software suite.',
      projectDescription: 'Renewal of organization-wide productivity software licenses including project management tools, communication platforms, and development environments.',
      costElements: [
        { type: 'Software', description: 'Annual Software License', cost: '₱15,750.00' }
      ],
      dueDate: 'March 31, 2025'
    },
    {
      id: 3,
      date: '03-15-2025',
      description: 'Cloud Hosting',
      category: 'DevOps',
      amount: '₱25,500.00',
      projectSummary: 'Monthly cloud infrastructure costs for all company applications.',
      projectDescription: 'Cloud hosting services including compute instances, database services, storage, and networking components to support our application ecosystem.',
      costElements: [
        { type: 'Service', description: 'Cloud Platform Services', cost: '₱25,500.00' }
      ],
      dueDate: 'March 20, 2025'
    },
    {
      id: 4,
      date: '02-25-2025',
      description: 'Company Laptops',
      category: 'Hardware',
      amount: '₱480,000.00',
      projectSummary: 'Purchase of new laptops for the engineering team.',
      projectDescription: 'Replacement of outdated hardware with high-performance laptops for the development and design teams to improve productivity.',
      costElements: [
        { type: 'Hardware', description: 'Development Laptops (15 units)', cost: '₱400,000.00' },
        { type: 'Software', description: 'Required OS and Software Licenses', cost: '₱80,000.00' }
      ],
      dueDate: 'February 28, 2025'
    },
    {
      id: 5,
      date: '01-25-2025',
      description: 'Office Printers',
      category: 'Hardware',
      amount: '₱180,000.00',
      projectSummary: 'Acquisition of networked printers for all departments.',
      projectDescription: 'Purchase of high-capacity networked printers to replace aging equipment and reduce maintenance costs.',
      costElements: [
        { type: 'Hardware', description: 'Networked Printers (6 units)', cost: '₱150,000.00' },
        { type: 'Supplies', description: 'Initial Supply of Consumables', cost: '₱30,000.00' }
      ],
      dueDate: 'January 30, 2025'
    },
    {
      id: 6,
      date: '12-19-2024',
      description: 'AI Workshop Series',
      category: 'IT',
      amount: '₱25,000.00',
      projectSummary: 'Training program for staff on AI technologies and applications.',
      projectDescription: 'Series of workshops designed to upskill technical and non-technical staff on artificial intelligence concepts, tools, and practical applications.',
      costElements: [
        { type: 'Service', description: 'External Trainers', cost: '₱15,000.00' },
        { type: 'Materials', description: 'Training Materials and Resources', cost: '₱10,000.00' }
      ],
      dueDate: 'December 31, 2024'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories for the filter dropdown
  const categories = ['All Categories', ...new Set(transactions.map(t => t.category))];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter transactions based on search query and selected category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setShowCategoryDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
  };

  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
  };

  const handleBackToList = () => {
    setSelectedExpense(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
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
                </div>
              )}
            </div>

            {/* Expense Dropdown */}
            <div className="nav-dropdown">
              <div 
                className={`nav-item ${showExpenseDropdown || !selectedExpense ? 'active' : ''}`} 
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
                    className="dropdown-item active"
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

      <div className="content-container">
        {!selectedExpense ? (
          <>
            <h2 className="page-title">Expense History</h2>

            <div className="controls-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by project or budget"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
                <button className="search-icon-btn">
                  <Search size={18} />
                </button>
              </div>

              <div className="filter-controls">
                <div className="filter-dropdown">
                  <button className="filter-dropdown-btn" onClick={toggleCategoryDropdown}>
                    <span>{selectedCategory}</span>
                    <ChevronDown size={14} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="category-dropdown-menu">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className={`category-dropdown-item ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="transactions-table-wrapper">
  <table className="transactions-table">
    <thead>
      <tr>
        <th style={{ width: '20%' }}>Date</th>
        <th style={{ width: '35%' }}>Description</th>
        <th style={{ width: '25%' }}>Category</th>
        <th style={{ width: '20%', textAlign: 'right' }}>Amount</th>
      </tr>
    </thead>
    <tbody>
      {currentTransactions.map((transaction) => (
        <tr 
          key={transaction.id} 
          onClick={() => handleRowClick(transaction)}
          style={{ cursor: 'pointer' }}
        >
          <td>{transaction.date}</td>
          <td>{transaction.description}</td>
          <td>{transaction.category}</td>
          <td style={{ textAlign: 'right' }}>{transaction.amount}</td>
        </tr>
      ))}
    </tbody>
  </table>
  
  {/* Updated Pagination */}
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
          </>
        ) : (
          <div className="budget-proposal-view">
            <button className="back-button" onClick={handleBackToList}>
              <ArrowLeft size={16} />
              <span>Back to Expenses</span>
            </button>

            <div className="proposal-header">
              <h3 className="proposal-title">{selectedExpense.description}</h3>
              <div className="proposal-date">Due Date: {selectedExpense.dueDate}</div>
            </div>

            <div className="proposal-section">
              <h4 className="section-label">PROJECT SUMMARY</h4>
              <p className="section-content">{selectedExpense.projectSummary}</p>
            </div>

            <div className="proposal-section">
              <h4 className="section-label">PROJECT DESCRIPTION</h4>
              <p className="section-content">{selectedExpense.projectDescription}</p>
            </div>

            <div className="proposal-section">
              <h4 className="section-label">COST ELEMENTS</h4>
              <div className="cost-table">
                <div className="cost-header">
                  <div className="cost-type-header">TYPE</div>
                  <div className="cost-desc-header">DESCRIPTION</div>
                  <div className="cost-amount-header">ESTIMATED COST</div>
                </div>
                {selectedExpense.costElements.map((cost, idx) => (
                  <div className="cost-row" key={idx}>
                    <div className="cost-type">
                      <span className="cost-bullet"></span>
                      {cost.type}
                    </div>
                    <div className="cost-description">{cost.description}</div>
                    <div className="cost-amount">{cost.cost}</div>
                  </div>
                ))}
                <div className="cost-row total">
                  <div className="cost-type"></div>
                  <div className="cost-description">TOTAL</div>
                  <div className="cost-amount">{selectedExpense.amount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistory;