import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar, FileText, User, Mail, Briefcase, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LOGOMAP from '../../assets/MAP.jpg';
import api from '../../api'; // ADDED: Import the configured Axios instance

// CSS Imports
import '../../components/Styles/Layout.css';
import '../../components/Header.css';
import '../../components/Tables.css';
import './ExpenseTracking.css';

const ExpenseTracking = () => {
  // --- STATE MANAGEMENT ---
  // MODIFIED: State for API data, loading, and errors
  const [summaryData, setSummaryData] = useState({ budget_remaining: 0, total_expenses_this_month: 0 });
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({ count: 0, next: null, previous: null });

  // State for UI controls
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  
  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ code: '', name: 'All Categories' });
  const [selectedDate, setSelectedDate] = useState({ value: 'all_time', name: 'All Time' });

  // State for the "Add Expense" modal form
  const [newExpense, setNewExpense] = useState({
    project_id: '',
    account_code: '',
    category_code: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
  });

  const navigate = useNavigate();

  // User profile data (can be replaced with context/global state later)
  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  // --- API DATA FETCHING ---

  // MODIFIED: Removed /api prefix
  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await api.get('/expenses/tracking/summary/');
      setSummaryData(response.data);
    } catch (err) {
      console.error("Error fetching summary data:", err);
      setError("Could not load summary data.");
    }
  }, []);

  // MODIFIED: Removed /api prefix
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchQuery,
        category__code: selectedCategory.code,
        date_filter: selectedDate.value,
      });
      const response = await api.get(`/expenses/tracking/?${params.toString()}`);
      setExpenses(response.data.results);
      setPaginationInfo({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to fetch expenses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory.code, selectedDate.value]);

  // MODIFIED: Removed /api prefixes
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, projRes, accRes] = await Promise.all([
          api.get('/dropdowns/expense-categories/'),
          api.get('/projects/all/'),
          api.get('/dropdowns/accounts/')
        ]);
        setCategories(catRes.data);
        setProjects(projRes.data);
        setAccounts(accRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Could not load form options.");
      }
    };
    fetchSummaryData();
    fetchDropdownData();
  }, [fetchSummaryData]);
  
  // ADDED: Refetch expenses when filters change
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // --- UI HANDLERS ---

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-dropdown') && !event.target.closest('.profile-container')) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfilePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    setShowDateDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };
  
  // MODIFIED: Removed /api prefix
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses/submit/', newExpense);
      handleCloseModal();
      fetchExpenses(); // Refetch to show the new expense
      fetchSummaryData(); // Also refetch summary cards
    } catch (err) {
      console.error("Error submitting expense:", err.response?.data || err);
      alert(`Failed to add expense: ${JSON.stringify(err.response?.data)}`);
    }
  };

  const handleCloseModal = () => {
    setShowAddExpenseModal(false);
    setNewExpense({
      project_id: '', account_code: '', category_code: '',
      amount: '', date: new Date().toISOString().split('T')[0],
      description: '', vendor: '',
    });
  };
  
  const totalPages = Math.ceil(paginationInfo.count / 5);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => { if (paginationInfo.next) setCurrentPage(prev => prev + 1); };
  const prevPage = () => { if (paginationInfo.previous) setCurrentPage(prev => prev - 1); };
  const toggleBudgetDropdown = () => setShowBudgetDropdown(!showBudgetDropdown);
  const toggleExpenseDropdown = () => setShowExpenseDropdown(!showExpenseDropdown);
  const toggleProfilePopup = () => setShowProfilePopup(!showProfilePopup);
  const toggleCategoryDropdown = () => setShowCategoryDropdown(!showCategoryDropdown);
  const toggleDateDropdown = () => setShowDateDropdown(!showDateDropdown);
  const handleNavigate = (path) => navigate(path);
  const handleAddExpense = () => setShowAddExpenseModal(true);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };
  
  const dateOptions = [
    { value: 'all_time', name: 'All Time' },
    { value: 'this_month', name: 'This Month' },
    { value: 'last_month', name: 'Last Month' },
    { value: 'last_3_months', name: 'Last 3 Months' },
    { value: 'this_year', name: 'This Year' }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        {/* Header navigation remains the same */}
        <div className="header-left">
          <div className="app-logo">
            <img src={LOGOMAP} alt="Logo" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <div className="nav-dropdown">
              <div className="nav-item" onClick={toggleBudgetDropdown}>Budget <ChevronDown size={14} /></div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-proposal')}>Budget Proposal</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/proposal-history')}>Proposal History</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/ledger-view')}>Ledger View</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/budget-variance-report')}>Budget Variance Report</div>
                </div>
              )}
            </div>
            <div className="nav-dropdown">
              <div className="nav-item active" onClick={toggleExpenseDropdown}>Expense <ChevronDown size={14} /></div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item active" onClick={() => handleNavigate('/finance/expense-tracking')}>Expense Tracking</div>
                  <div className="dropdown-item" onClick={() => handleNavigate('/finance/expense-history')}>Expense History</div>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img src={userProfile.avatar} alt="User avatar" className="avatar-img" />
            </div>
            {showProfilePopup && (
              <div className="profile-popup">
                <div className="profile-popup-header">
                  <button className="profile-back-btn" onClick={() => setShowProfilePopup(false)}><ArrowLeft size={20} /></button>
                  <h3 className="profile-popup-title">Profile</h3>
                </div>
                <div className="profile-popup-content">
                  <div className="profile-avatar-large"><img src={userProfile.avatar} alt="Profile" className="profile-avatar-img" /></div>
                  <div className="profile-info">
                    <div className="profile-field"><div className="profile-field-header"><User size={16} /><span>Name:</span></div><span>{userProfile.name}</span></div>
                    <div className="profile-field"><div className="profile-field-header"><Mail size={16} /><span>E-mail:</span></div><span>{userProfile.email}</span></div>
                    <div className="profile-field"><div className="profile-field-header"><Briefcase size={16} /><span>Role:</span></div><span>{userProfile.role}</span></div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}><LogOut size={16} />Log Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="content-container">
        {/* MODIFIED: Summary cards now use API data */}
        <div className="budget-summary">
          <div className="budget-card">
            <div className="budget-card-label"><p>As of now: {new Date().toLocaleString()}</p></div>
            <div className="budget-card-amount">₱{parseFloat(summaryData.budget_remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="budget-card-footer">Budget Remaining</div>
          </div>
          <div className="budget-card">
            <div className="budget-card-label"><p>This month</p></div>
            <div className="budget-card-amount">₱{parseFloat(summaryData.total_expenses_this_month).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="budget-card-footer">Total Expenses</div>
          </div>
        </div>
        
        <div className="page">
          <div className="container">
            <div className="top">
              <h2 style={{ margin: 0, fontSize: '29px', fontWeight: 'bold', color: '#242424' }}>Expense Tracking</h2>
              <div className="header-controls">
                <div className="filter-controls" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <input type="text" placeholder="Search expenses" value={searchQuery} onChange={handleSearch} className="search-account-input" />
                  <div className="filter-dropdown">
                    <button className="filter-dropdown-btn" onClick={toggleCategoryDropdown}><span>{selectedCategory.name}</span><ChevronDown size={19} /></button>
                    {showCategoryDropdown && (
                      <div className="category-dropdown-menu">
                        <div className={`category-dropdown-item ${selectedCategory.code === '' ? 'active' : ''}`} onClick={() => handleCategorySelect({ code: '', name: 'All Categories' })}>All Categories</div>
                        {categories.map((cat) => (<div key={cat.code} className={`category-dropdown-item ${selectedCategory.code === cat.code ? 'active' : ''}`} onClick={() => handleCategorySelect(cat)}>{cat.name}</div>))}
                      </div>
                    )}
                  </div>
                  <div className="filter-dropdown">
                    <button className="filter-dropdown-btn" onClick={toggleDateDropdown}><span>{selectedDate.name}</span><ChevronDown size={15} /></button>
                    {showDateDropdown && (
                      <div className="category-dropdown-menu">
                        {dateOptions.map((date) => (<div key={date.value} className={`category-dropdown-item ${selectedDate.value === date.value ? 'active' : ''}`} onClick={() => handleDateSelect(date)}>{date.name}</div>))}
                      </div>
                    )}
                  </div>
                  {/* MODIFIED: Changed button text for clarity */}
                  <button className="add-expense-btn" onClick={handleAddExpense}><Plus size={16} />Add Expense</button>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>REF NO.</th>
                  <th style={{ width: '20%' }}>TYPE</th>
                  <th style={{ width: '25%' }}>DESCRIPTION</th>
                  <th style={{ width: '15%' }}>STATUS</th>
                  <th style={{ width: '15%' }}>ACCOMPLISHED</th>
                  <th style={{ width: '10%' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (<tr><td colSpan="6">Loading...</td></tr>) : error ? (<tr><td colSpan="6">{error}</td></tr>) : (
                  expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.reference_no}</td>
                      <td>{expense.type}</td>
                      <td>{expense.description}</td>
                      <td><span className={`status-badge status-${expense.status.toLowerCase()}`}>{expense.status}</span></td>
                      <td><span className={`accomplished-badge ${expense.accomplished === 'Yes' ? 'accomplished' : 'pending'}`}>{expense.accomplished}</span></td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={prevPage} disabled={!paginationInfo.previous} className="pagination-btn"><ChevronLeft size={16} /></button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={nextPage} disabled={!paginationInfo.next} className="pagination-btn"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* MODIFIED: Add Expense Modal - now connects to backend */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Expense</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmitExpense} className="budget-form">
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="project_id">Project</label>
                    <select id="project_id" name="project_id" value={newExpense.project_id} onChange={handleInputChange} required>
                      <option value="">Select a project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input type="text" id="description" name="description" value={newExpense.description} onChange={handleInputChange} placeholder="Enter expense description" required/>
                  </div>
                   <div className="form-group">
                    <label htmlFor="vendor">Vendor</label>
                    <input type="text" id="vendor" name="vendor" value={newExpense.vendor} onChange={handleInputChange} placeholder="Enter vendor name" required/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category_code">Category</label>
                      <select id="category_code" name="category_code" value={newExpense.category_code} onChange={handleInputChange} required>
                        <option value="">Select a category</option>
                        {categories.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="account_code">Account</label>
                      <select id="account_code" name="account_code" value={newExpense.account_code} onChange={handleInputChange} required>
                        <option value="">Select an account</option>
                        {accounts.map(a => <option key={a.id} value={a.code}>{a.code} - {a.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="amount">Amount (₱)</label>
                      <input type="number" id="amount" name="amount" value={newExpense.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" required/>
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input type="date" id="date" name="date" value={newExpense.date} onChange={handleInputChange} required/>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="submit-btn">Add Expense</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracking;