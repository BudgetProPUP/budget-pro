import React, { useState } from 'react';
import './LedgerView.css';

const LedgerView = () => {
  // Sample data for the ledger
  const [transactions] = useState([
    { 
      reference: 'EX-001', 
      date: '05-12-2025', 
      category: 'Expenses', 
      description: 'Internet Bill', 
      amount: '₱8,300' 
    },
    { 
      reference: 'AS-001', 
      date: '05-03-2025', 
      category: 'Assets', 
      description: 'Company Laptops', 
      amount: '₱250,000' 
    },
    { 
      reference: 'AS-002', 
      date: '04-27-2025', 
      category: 'Assets', 
      description: 'Office Printer', 
      amount: '₱12,500' 
    },
    { 
      reference: 'EX-002', 
      date: '04-12-2025', 
      category: 'Expenses', 
      description: 'Internet Bill', 
      amount: '₱9,200' 
    },
    { 
      reference: 'AS-003', 
      date: '03-20-2025', 
      category: 'Assets', 
      description: 'Cloud Hosting', 
      amount: '₱5,800' 
    },
  ]);

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    // Assuming there are more pages
    setCurrentPage(currentPage + 1);
  };

  // Handle export button click
  const handleExport = () => {
    alert('Exporting data...');
    // Implementation for exporting data
  };

  return (
    <div className="ledger-container">
      <div className="search-filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search Transactions" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div className="filter-options">
          <button className="filter-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter by:
          </button>
          
          <div className="category-dropdown">
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Category</option>
              <option value="Expenses">Expenses</option>
              <option value="Assets">Assets</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>
        
        <button className="export-button" onClick={handleExport}>
          Export
        </button>
      </div>
      
      <div className="ledger-view-container">
        <h2>Ledger View</h2>
        
        <div className="ledger-table">
          <div className="ledger-header">
            <div className="header-cell">Reference</div>
            <div className="header-cell">Date</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Description</div>
            <div className="header-cell">Amount</div>
          </div>
          
          {transactions.map((transaction, index) => (
            <div key={index} className={`ledger-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
              <div className="cell">{transaction.reference}</div>
              <div className="cell">{transaction.date}</div>
              <div className="cell">{transaction.category}</div>
              <div className="cell">{transaction.description}</div>
              <div className="cell amount">{transaction.amount}</div>
            </div>
          ))}
        </div>
        
        <div className="pagination">
          <button 
            className="pagination-button prev" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            &lt; Prev
          </button>
          
          <div className="page-number">{currentPage}</div>
          
          <button 
            className="pagination-button next" 
            onClick={handleNextPage}
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default LedgerView;