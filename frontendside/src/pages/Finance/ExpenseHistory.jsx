import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Briefcase,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import api from "../../api"; // Import our configured api instance
import "./ExpenseHistory.css";

const ExpenseHistory = () => {
  // --- STATE MANAGEMENT ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  // UI State
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Filter and Pagination State
  const [selectedCategory, setSelectedCategory] = useState({
    code: "",
    name: "All Categories",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const userProfile = {
    name: "John Doe",
    email: "Johndoe@gmail.com",
    role: "Finance Head",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  // --- API CALLS ---
  const fetchExpenseHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchQuery,
        category__code: selectedCategory.code || "",
      });
      const response = await api.get(`/expenses/history/?${params.toString()}`);
      setTransactions(response.data.results);
      setPaginationInfo({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error("Error fetching expense history:", err);
      setError("Failed to load expense history.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory.code]);

  useEffect(() => {
    fetchExpenseHistory();
  }, [fetchExpenseHistory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/dropdowns/expense-categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // --- HANDLERS ---
  const handleViewExpense = async (expenseId) => {
    setIsModalLoading(true);
    setSelectedExpense({ id: expenseId }); // Set a temporary object to show the modal
    try {
      // Step 1: Get the expense to find its proposal ID
      const expenseRes = await api.get(`/expenses/${expenseId}/`);
      const proposalId = expenseRes.data.proposal_id;

      if (!proposalId) {
        throw new Error("This expense is not linked to a budget proposal.");
      }

      // Step 2: Get the full proposal details for the modal
      const proposalRes = await api.get(`/budget-proposals/${proposalId}/`);
      setSelectedExpense(proposalRes.data);
    } catch (err) {
      console.error("Error fetching expense details:", err);
      alert(
        "Could not load expense details. It may not be linked to a proposal."
      );
      setSelectedExpense(null); // Close modal on error
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  // Other handlers remain the same
  const handleBackToList = () => setSelectedExpense(null);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (paginationInfo.next) setCurrentPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (paginationInfo.previous) setCurrentPage((prev) => prev - 1);
  };
  const toggleBudgetDropdown = () => setShowBudgetDropdown(!showBudgetDropdown);
  const toggleExpenseDropdown = () =>
    setShowExpenseDropdown(!showExpenseDropdown);
  const toggleCategoryDropdown = () =>
    setShowCategoryDropdown(!showCategoryDropdown);
  const toggleProfilePopup = () => setShowProfilePopup(!showProfilePopup);
  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const totalPages = paginationInfo.count
    ? Math.ceil(paginationInfo.count / (paginationInfo.page_size || 5))
    : 1;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img src={LOGOMAP} alt="Logo" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>
            <div className="nav-dropdown">
              <div className="nav-item" onClick={toggleBudgetDropdown}>
                Budget <ChevronDown size={14} />
              </div>
              {showBudgetDropdown && (
                <div className="dropdown-menu">
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
                    onClick={() =>
                      handleNavigate("/finance/budget-variance-report")
                    }
                  >
                    Budget Variance Report
                  </div>
                </div>
              )}
            </div>
            <div className="nav-dropdown">
              <div className="nav-item active" onClick={toggleExpenseDropdown}>
                Expense <ChevronDown size={14} />
              </div>
              {showExpenseDropdown && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => handleNavigate("/finance/expense-tracking")}
                  >
                    Expense Tracking
                  </div>
                  <div
                    className="dropdown-item active"
                    onClick={() => handleNavigate("/finance/expense-history")}
                  >
                    Expense History
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="header-right">
          <div className="profile-container">
            <div className="user-avatar" onClick={toggleProfilePopup}>
              <img
                src={userProfile.avatar}
                alt="User avatar"
                className="avatar-img"
              />
            </div>
            {showProfilePopup && (
              <div className="profile-popup">
                <div className="profile-popup-header">
                  <button
                    className="profile-back-btn"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="profile-popup-title">Profile</h3>
                </div>
                <div className="profile-popup-content">
                  <div className="profile-avatar-large">
                    <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="profile-avatar-img"
                    />
                  </div>
                  <div className="profile-info">
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <User size={16} />
                        <span>Name:</span>
                      </div>
                      <span>{userProfile.name}</span>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Mail size={16} />
                        <span>E-mail:</span>
                      </div>
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="profile-field">
                      <div className="profile-field-header">
                        <Briefcase size={16} />
                        <span>Role:</span>
                      </div>
                      <span>{userProfile.role}</span>
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="page">
        {!selectedExpense ? (
          <div className="container">
            <div className="top">
              <h2 className="expense-title">Expense History</h2>
              <div className="controls-container">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-account-input"
                />
                <div
                  className="category-dropdown-wrapper"
                  style={{ position: "relative" }}
                >
                  <button
                    className="category-dropdown-button oblong-filter"
                    onClick={toggleCategoryDropdown}
                  >
                    <span>{selectedCategory.name}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="category-dropdown-menu">
                      <button
                        className={`category-item ${
                          selectedCategory.code === "" ? "selected" : ""
                        }`}
                        onClick={() =>
                          handleCategorySelect({
                            code: "",
                            name: "All Categories",
                          })
                        }
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.code}
                          className={`category-item ${
                            selectedCategory.code === cat.code ? "selected" : ""
                          }`}
                          onClick={() =>
                            handleCategorySelect({
                              code: cat.code,
                              name: cat.name,
                            })
                          }
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Date</th>
                  <th style={{ width: "35%" }}>Description</th>
                  <th style={{ width: "20%" }}>Category</th>
                  <th style={{ width: "10%" }}>Amount</th>
                  <th style={{ width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5">{error}</td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.category_name}</td>
                      <td style={{ textAlign: "right" }}>
                        ₱
                        {parseFloat(transaction.amount).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="view-btn"
                          onClick={() => handleViewExpense(transaction.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={prevPage}
                  disabled={!paginationInfo.previous}
                >
                  <ChevronLeft size={14} />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={nextPage}
                  disabled={!paginationInfo.next}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="container">
            {isModalLoading ? (
              <p>Loading details...</p>
            ) : (
              <div className="budget-proposal-view">
                <button className="back-button" onClick={handleBackToList}>
                  <ArrowLeft size={16} />
                  <span>Back to Expenses</span>
                </button>
                <div className="proposal-header">
                  <h3 className="proposal-title">{selectedExpense.title}</h3>
                  <div className="proposal-date">
                    Performance Period:{" "}
                    {new Date(
                      selectedExpense.performance_start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      selectedExpense.performance_end_date
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="proposal-section">
                  <h4 className="section-label">PROJECT SUMMARY</h4>
                  <p className="section-content">
                    {selectedExpense.project_summary}
                  </p>
                </div>
                <div className="proposal-section">
                  <h4 className="section-label">PROJECT DESCRIPTION</h4>
                  <p className="section-content">
                    {selectedExpense.project_description}
                  </p>
                </div>
                <div className="proposal-section">
                  <h4 className="section-label">COST ELEMENTS</h4>
                  <div className="cost-table">
                    <div className="cost-header">
                      <div className="cost-type-header">TYPE</div>
                      <div className="cost-desc-header">DESCRIPTION</div>
                      <div className="cost-amount-header">ESTIMATED COST</div>
                    </div>
                    {selectedExpense.items.map((cost, idx) => (
                      <div className="cost-row" key={idx}>
                        <div className="cost-type">
                          <span className="cost-bullet"></span>
                          {cost.account_code}
                        </div>
                        <div className="cost-description">
                          {cost.description}
                        </div>
                        <div className="cost-amount">
                          ₱
                          {parseFloat(cost.estimated_cost).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="cost-row total">
                      <div className="cost-type"></div>
                      <div className="cost-description">TOTAL</div>
                      <div className="cost-amount">
                        ₱
                        {parseFloat(selectedExpense.total_cost).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistory;
