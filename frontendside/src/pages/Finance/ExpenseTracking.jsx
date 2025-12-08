import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  FileText,
  User,
  Mail,
  Briefcase,
  LogOut,
  Bell,
  Settings,
  X,
  Paperclip,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LOGOMAP from "../../assets/MAP.jpg";
import "./ExpenseTracking.css";
import { useAuth } from "../../context/AuthContext"; // To get user info
import {
  getExpenseSummary,
  getExpenseTrackingList,
  getExpenseCategories,
  createExpense,
} from "../../API/expenseAPI";

// Import ManageProfile component
import ManageProfile from "./ManageProfile";

const Status = ({ type, name, personName = null, location = null }) => {
  return (
    <div className={`status-${type.split(" ").join("-")}`}>
      <div className="circle"></div>
      {name}
      {(personName != null || location != null) && (
        <span className="status-details">
          <span className="status-to">to</span>
          <div className="icon">
            <div className="icon-placeholder"></div>
          </div>
          <span className="status-target">
            {personName != null ? personName : location}
          </span>
        </span>
      )}
    </div>
  );
};

// Pagination Component (Copied from LedgerView)
const Pagination = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // MODIFICATION START
  const renderPageNumbers = () => {
    const pages = [];
    const pageLimit = 5; // The number of page buttons to show
    const sideButtons = Math.floor(pageLimit / 2);

    if (totalPages <= pageLimit + 2) {
      // If total pages are few, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`pageButton ${i === currentPage ? "active" : ""}`}
            onClick={() => handlePageClick(i)}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              backgroundColor: i === currentPage ? "#007bff" : "white",
              color: i === currentPage ? "white" : "black",
              cursor: "pointer",
              borderRadius: "4px",
              minWidth: "40px",
              outline: "none",
            }}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <button
          key={1}
          className={`pageButton ${1 === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(1)}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: 1 === currentPage ? "#007bff" : "white",
            color: 1 === currentPage ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "40px",
            outline: "none",
          }}
        >
          1
        </button>
      );

      let startPage = Math.max(2, currentPage - sideButtons);
      let endPage = Math.min(totalPages - 1, currentPage + sideButtons);

      if (currentPage - sideButtons > 2) {
        pages.push(
          <span key="start-ellipsis" className="ellipsis">
            ...
          </span>
        );
      }

      if (currentPage + sideButtons > totalPages - 1) {
        startPage = totalPages - pageLimit;
      }
      if (currentPage - sideButtons < 2) {
        endPage = pageLimit + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            className={`pageButton ${i === currentPage ? "active" : ""}`}
            onClick={() => handlePageClick(i)}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              backgroundColor: i === currentPage ? "#007bff" : "white",
              color: i === currentPage ? "white" : "black",
              cursor: "pointer",
              borderRadius: "4px",
              minWidth: "40px",
              outline: "none",
            }}
          >
            {i}
          </button>
        );
      }

      if (currentPage + sideButtons < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="ellipsis">
            ...
          </span>
        );
      }

      // Always show last page
      pages.push(
        <button
          key={totalPages}
          className={`pageButton ${totalPages === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(totalPages)}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: totalPages === currentPage ? "#007bff" : "white",
            color: totalPages === currentPage ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "40px",
            outline: "none",
          }}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div
      className="paginationContainer"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        padding: "10px 0",
      }}
    >
      {/* Left Side: Page Size Selector */}
      <div
        className="pageSizeSelector"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <label htmlFor="pageSize" style={{ fontSize: "14px" }}>
          Show
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: "6px 8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            outline: "none",
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span style={{ fontSize: "14px" }}>items per page</span>
      </div>

      {/* Right Side: Page Navigation */}
      <div
        className="pageNavigation"
        style={{ display: "flex", alignItems: "center", gap: "5px" }}
      >
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: currentPage === 1 ? "#f0f0f0" : "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            backgroundColor: currentPage === totalPages ? "#f0f0f0" : "white",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ExpenseTracking = () => {
  const { user, logout } = useAuth();
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // Default to empty for "All Categories"
  const [selectedDepartment, setSelectedDepartment] = useState(""); // New department filter state
  const [_selectedDate, setSelectedDate] = useState("All Time");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showManageProfile, setShowManageProfile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryData, setSummaryData] = useState({
    budget_remaining: "0.00",
    total_expenses_this_month: "0.00",
  });
  
  // Sample data for UI
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      reference_no: "EXP-2024-001",
      date: "2024-01-15",
      department: "Marketing",
      category: "OpEx",
      vendor: "Tech Training Inc.",
      amount: "₱12,500.00",
      status: "Submitted",
      accomplished: "No",
      attachment: "receipt.pdf",
      sub_category: "Digital Ads"
    },
    {
      id: 2,
      reference_no: "EXP-2024-002",
      date: "2024-01-18",
      department: "Store Operations",
      category: "CapEx",
      vendor: "Software Solutions Ltd.",
      amount: "₱45,000.00",
      status: "Submitted",
      accomplished: "Yes",
      attachment: "invoice.jpg",
      sub_category: "POS Maintenance"
    },
    {
      id: 3,
      reference_no: "EXP-2024-003",
      date: "2024-01-20",
      department: "IT",
      category: "OpEx",
      vendor: "Cloud Hosting Co.",
      amount: "₱8,750.00",
      status: "Submitted",
      accomplished: "No",
      attachment: "contract.pdf",
      sub_category: "Software Licenses"
    },
    {
      id: 4,
      reference_no: "EXP-2024-004",
      date: "2024-01-22",
      department: "Human Resources",
      category: "OpEx",
      vendor: "Office Supplies Pro",
      amount: "₱5,200.00",
      status: "Submitted",
      accomplished: "Yes",
      attachment: "receipt.png",
      sub_category: "Training & Workshops"
    },
    {
      id: 5,
      reference_no: "EXP-2024-005",
      date: "2024-01-25",
      department: "Logistics Management",
      category: "CapEx",
      vendor: "Computer World",
      amount: "₱32,000.00",
      status: "Submitted",
      accomplished: "No",
      attachment: "quote.pdf",
      sub_category: "Warehouse Equipment"
    }
  ]);
  
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    ticketId: `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    department: "",
    category: "",
    sub_category: "",
    vendor: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    attachment: null,
  });
  const navigate = useNavigate();

  // Departments data - UPDATED to match LedgerView department options
  const departments = [
    "Merchandise Planning",
    "Store Operations",
    "Marketing",
    "Operations",
    "IT",
    "Logistics",
    "Human Resources"
  ];

  // Department options matching LedgerView format
  const departmentOptions = [
    { value: "", label: "All Departments" },
    { value: "Merchandise Planning", label: "Merchandise Planning" },
    { value: "Store Operations", label: "Store Operations" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
    { value: "IT", label: "IT" },
    { value: "Logistics", label: "Logistics" },
    { value: "Human Resources", label: "Human Resources" },
  ];

  // Sub-categories data based on department
  const subCategoriesByDepartment = {
    "Merchandise Planning": [
      "Product Range Planning",
      "Buying Costs",
      "Market Research",
      "Inventory Handling Fees",
      "Supplier Coordination",
      "Seasonal Planning Tools",
      "Training",
      "Travel",
      "Software Subscription"
    ],
    "Store Operations": [
      "Store Consumables",
      "POS Maintenance",
      "Store Repairs",
      "Sales Incentives",
      "Uniforms",
      "Store Opening Expenses",
      "Store Supplies",
      "Training",
      "Travel",
      "Utilities"
    ],
    "Marketing": [
      "Campaign Budget",
      "Branding Materials",
      "Digital Ads",
      "Social Media Management",
      "Events Budget",
      "Influencer Fees",
      "Photography/Videography",
      "Software Subscription",
      "Training",
      "Travel"
    ],
    "Operations": [
      "Equipment Maintenance",
      "Fleet/Vehicle Expenses",
      "Operational Supplies",
      "Business Permits",
      "Facility Utilities",
      "Compliance Costs",
      "Training",
      "Office Supplies"
    ],
    "IT": [
      "Server Hosting",
      "Software Licenses",
      "Cloud Subscriptions",
      "Hardware Purchases",
      "Data Tools",
      "Cybersecurity Costs",
      "API Subscription Fees",
      "Domain Renewals",
      "Training",
      "Office Supplies"
    ],
    "Logistics": [
      "Shipping Costs",
      "Warehouse Equipment",
      "Transport & Fuel",
      "Freight Fees",
      "Vendor Delivery Charges",
      "Storage Fees",
      "Packaging Materials",
      "Safety Gear",
      "Training"
    ],
    "Human Resources": [
      "Recruitment Expenses",
      "Job Posting Fees",
      "Employee Engagement Activities",
      "Training & Workshops",
      "Medical & Wellness Programs",
      "Background Checks",
      "HR Systems/Payroll Software",
      "Office Supplies",
      "Travel"
    ]
  };

  // Main categories (only CapEx and OpEx)
  const mainCategories = ["CapEx", "OpEx"];

  // Category options - only CapEx and OpEx (matching LedgerView)
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "CapEx", label: "CapEx" },
    { value: "OpEx", label: "OpEx" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          page_size: pageSize,
          search: searchTerm,
        };

        if (selectedCategory && selectedCategory !== "") {
          params.category__code = selectedCategory;
        }

        const [summaryRes, expensesRes, categoriesRes] = await Promise.all([
          getExpenseSummary(),
          getExpenseTrackingList(params),
          getExpenseCategories(),
        ]);

        setSummaryData(summaryRes.data);
        setExpenses(expensesRes.data.results);
        setPagination({
          count: expensesRes.data.count,
          next: expensesRes.data.next,
          previous: expensesRes.data.previous,
        });
        setCategories([
          { code: "", name: "All Categories" },
          ...categoriesRes.data,
        ]);
      } catch (error) {
        console.error("Failed to fetch expense data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, pageSize, searchTerm, selectedCategory]);

  // User profile data
  const userProfile = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    role: user?.roles?.bms || "User",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update current date/time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Format date and time for display
  const formattedDay = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = currentDate
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".nav-dropdown") &&
        !event.target.closest(".profile-container") &&
        !event.target.closest(".notification-container") &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowBudgetDropdown(false);
        setShowExpenseDropdown(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setShowCategoryDropdown(false);
        setShowDepartmentDropdown(false);
        setShowDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample vendors
  const vendors = [
    "Tech Training Inc.",
    "Software Solutions Ltd.",
    "Cloud Hosting Co.",
    "Computer World",
    "Office Supplies Pro",
    "AI Learning Center",
  ];

  // Date filter options
  const _dateOptions = [
    "All Time",
    "This Month",
    "Last Month",
    "Last 3 Months",
    "This Year",
  ];

  // Navigation functions
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown(!showBudgetDropdown);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown(!showExpenseDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showNotifications) setShowNotifications(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showBudgetDropdown) setShowBudgetDropdown(false);
    if (showExpenseDropdown) setShowExpenseDropdown(false);
    if (showProfileDropdown) setShowProfileDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    if (showDateDropdown) setShowDateDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  const toggleDepartmentDropdown = () => {
    setShowDepartmentDropdown(!showDepartmentDropdown);
    if (showDateDropdown) setShowDateDropdown(false);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
  };

  const _toggleDateDropdown = () => {
    setShowDateDropdown(!showDateDropdown);
    if (showCategoryDropdown) setShowCategoryDropdown(false);
    if (showDepartmentDropdown) setShowDepartmentDropdown(false);
  };

  // Handle Manage Profile
  const handleManageProfile = () => {
    setShowManageProfile(true);
    setShowProfileDropdown(false);
  };

  const handleCloseManageProfile = () => {
    setShowManageProfile(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleDepartmentSelect = (deptValue) => {
    setSelectedDepartment(deptValue);
    setCurrentPage(1);
    setShowDepartmentDropdown(false);
  };

  const _handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    setShowDateDropdown(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };

  // Updated logout function
  const handleLogout = async () => {
    await logout();
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleCloseModal = () => {
    setShowAddExpenseModal(false);
    setNewExpense({
      ticketId: `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      department: "",
      category: "",
      sub_category: "",
      vendor: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      attachment: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      if (value === "") {
        setNewExpense((prev) => ({
          ...prev,
          [name]: "",
        }));
      } else {
        const cleanValue = value.replace("₱", "").replace(/,/g, "");
        const numericValue = cleanValue.replace(/[^\d.]/g, "");
        const formattedValue = `₱${numericValue.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        )}`;

        setNewExpense((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
      }
    } else {
      setNewExpense((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Reset sub_category when department changes
    if (name === "department") {
      setNewExpense((prev) => ({
        ...prev,
        sub_category: "",
      }));
    }
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed.');
        return;
      }
      setNewExpense((prev) => ({
        ...prev,
        attachment: file,
      }));
    }
  };

  // Clear amount function
  const clearAmount = () => {
    setNewExpense((prev) => ({
      ...prev,
      amount: "",
    }));
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    // Clean amount value by removing '₱' and ','
    const cleanAmount = newExpense.amount.replace(/[₱,]/g, "");

    const payload = {
      project_id: 1,
      account_code: "5100",
      department: newExpense.department,
      category: newExpense.category,
      sub_category: newExpense.sub_category,
      amount: cleanAmount,
      date: newExpense.date,
      vendor: newExpense.vendor,
      reference_no: newExpense.ticketId,
      attachment: newExpense.attachment,
    };

    try {
      await createExpense(payload);
      alert("Expense submitted successfully!");
      handleCloseModal();
      // Refetch data
      const summaryRes = await getExpenseSummary();
      setSummaryData(summaryRes.data);
      const expensesRes = await getExpenseTrackingList({
        page: 1,
        page_size: pageSize,
      });
      setExpenses(expensesRes.data.results);
      setPagination({
        count: expensesRes.data.count,
        next: expensesRes.data.next,
        previous: expensesRes.data.previous,
      });
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to submit expense:", error);
      const errorMsg =
        error.response?.data?.amount ||
        error.response?.data?.non_field_errors?.[0] ||
        "An unexpected error occurred.";
      alert(`Error: ${errorMsg}`);
    }
  };

  // Format date as YYYY-MM-DD for input type="date"
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get display label for department filter
  const getDepartmentDisplay = () => {
    const option = departmentOptions.find(opt => opt.value === selectedDepartment);
    return option ? option.label : "All Departments";
  };

  // Get display label for category filter
  const getCategoryDisplay = () => {
    const option = categoryOptions.find(opt => opt.value === selectedCategory);
    return option ? option.label : "All Categories";
  };

  // Filter expenses based on selected department and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesDepartment = !selectedDepartment || expense.department === selectedDepartment;
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        expense.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.sub_category && expense.sub_category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesDepartment && matchesCategory && matchesSearch;
    });
  }, [expenses, selectedDepartment, selectedCategory, searchTerm]);

  // Calculate pagination for filtered expenses
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = filteredExpenses.length;

  return (
    <div
      className="app-container"
      style={{ minWidth: "1200px", overflowY: "auto", height: "100vh" }}
    >
      {/* Navigation Bar (unchanged) */}
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
            {/* Timestamp/Date */}
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
            <div
              className="notification-container"
              style={{ position: "relative" }}
            >
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
                    <h3 style={{ margin: 0, fontSize: "16px" }}>
                      Notifications
                    </h3>
                    <button
                      className="clear-all-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#007bff",
                        cursor: "pointer",
                        outline: "none",
                      }}
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
                          color: "#666",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
                    <div
                      className="notification-item"
                      style={{ display: "flex", padding: "8px 0" }}
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
                          color: "#666",
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
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                  }}
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
                    onClick={handleManageProfile}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                      cursor: "pointer",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <User size={16} style={{ marginRight: "8px" }} />{" "}
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
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Settings size={16} style={{ marginRight: "8px" }} />{" "}
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
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <LogOut size={16} style={{ marginRight: "8px" }} />{" "}
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div
        className="content-container"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Conditionally render either ExpenseTracking content or ManageProfile */}
        {showManageProfile ? (
          <ManageProfile 
            onClose={handleCloseManageProfile} 
          />
        ) : (
          <>
            {/* Budget Summary Cards */}
            <div
              className="budget-summary"
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                className="budget-card"
                style={{
                  flex: "1",
                  minWidth: "200px",
                  maxWidth: "400px",
                  height: "100px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "15px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div className="budget-card-label" style={{ marginBottom: "10px" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    Budget Remaining
                  </p>
                </div>
                <div
                  className="budget-card-amount"
                  style={{ fontSize: "24px", fontWeight: "bold" }}
                >
                  ₱
                  {parseFloat(summaryData.budget_remaining).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>

              <div
                className="budget-card"
                style={{
                  flex: "1",
                  minWidth: "200px",
                  maxWidth: "400px",
                  height: "100px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "15px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div className="budget-card-label" style={{ marginBottom: "10px" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    Total Expenses This Month
                  </p>
                </div>
                <div
                  className="budget-card-amount"
                  style={{ fontSize: "24px", fontWeight: "bold" }}
                >
                  ₱
                  {parseFloat(summaryData.total_expenses_this_month).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div
              className="expense-tracking"
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                padding: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: "calc(80vh - 100px)",
              }}
            >
              {/* Header Section with Title and Controls - UPDATED for better spacing */}
              <div
                className="top"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  className="page-title"
                  style={{
                    margin: 0,
                    fontSize: "29px",
                    fontWeight: "bold",
                    color: "#0C0C0C",
                  }}
                >
                  Expense Tracking
                </h2>

                <div
                  className="controls-container"
                  style={{ 
                    display: "flex", 
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "nowrap",
                  }}
                >
                  {/* Search Bar - REDUCED WIDTH */}
                  <div style={{ position: "relative", width: "180px" }}>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-account-input"
                      style={{
                        width: "90%",
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  {/* Department Filter - UPDATED to match LedgerView UI */}
                  <div className="filter-dropdown" style={{ position: "relative", width: "180px" }}>
                    <button
                      className={`filter-dropdown-btn ${
                        showDepartmentDropdown ? "active" : ""
                      }`}
                      onClick={toggleDepartmentDropdown}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        outline: "none",
                        minWidth: "160px",
                        width: "100%",
                      }}
                    >
                      <span style={{ 
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" 
                      }}>
                        {getDepartmentDisplay()}
                      </span>
                      <ChevronDown size={14} />
                    </button>
                    {showDepartmentDropdown && (
                      <div
                        className="category-dropdown-menu"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          width: "100%",
                          zIndex: 1000,
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        {departmentOptions.map((dept) => (
                          <div
                            key={dept.value}
                            className={`category-dropdown-item ${
                              selectedDepartment === dept.value ? "active" : ""
                            }`}
                            onClick={() => handleDepartmentSelect(dept.value)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              backgroundColor:
                                selectedDepartment === dept.value
                                  ? "#f0f0f0"
                                  : "white",
                              outline: "none",
                            }}
                          >
                            {dept.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Filter - UPDATED to match LedgerView UI */}
                  <div className="filter-dropdown" style={{ position: "relative", width: "150px" }}>
                    <button
                      className={`filter-dropdown-btn ${
                        showCategoryDropdown ? "active" : ""
                      }`}
                      onClick={toggleCategoryDropdown}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        outline: "none",
                        minWidth: "140px",
                        width: "100%",
                      }}
                    >
                      <span style={{ 
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" 
                      }}>
                        {getCategoryDisplay()}
                      </span>
                      <ChevronDown size={14} />
                    </button>
                    {showCategoryDropdown && (
                      <div
                        className="category-dropdown-menu"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          width: "100%",
                          zIndex: 1000,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {categoryOptions.map((category) => (
                          <div
                            key={category.value}
                            className={`category-dropdown-item ${
                              selectedCategory === category.value ? "active" : ""
                            }`}
                            onClick={() => handleCategorySelect(category.value)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              backgroundColor:
                                selectedCategory === category.value
                                  ? "#f0f0f0"
                                  : "white",
                              outline: "none",
                            }}
                          >
                            {category.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Expense Button */}
                  <button
                    className="add-journal-button"
                    onClick={handleAddExpense}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      backgroundColor: "#007bff",
                      color: "white",
                      cursor: "pointer",
                      outline: "none",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Separator line */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e0e0e0",
                  marginBottom: "20px",
                }}
              ></div>

              {/* Expenses Table - UPDATED: Removed Vendor column and adjusted column widths */}
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  height: "424px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <table
                  className="ledger-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8f9fa",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {/* Equal width columns - 12.5% each for 8 columns */}
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        TICKET ID
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        DATE
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        DEPARTMENT
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        CATEGORY
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                          fontSize: "14px",
                        }}
                      >
                        SUB-CATEGORY
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        AMOUNT
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          width: "10%",
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #dee2e6",
                          height: "50px",
                          verticalAlign: "middle",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          fontSize: "14px",
                        }}
                      >
                        ACCOMPLISHED
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExpenses.length > 0 ? (
                      currentExpenses.map((expense, index) => (
                        <tr
                          key={expense.id}
                          className={index % 2 === 1 ? "alternate-row" : ""}
                          style={{
                            backgroundColor:
                              index % 2 === 1 ? "#F8F8F8" : "#FFFFFF",
                            color: "#0C0C0C",
                            height: "50px",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fcfcfc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 1 ? "#F8F8F8" : "#FFFFFF";
                          }}
                        >
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.reference_no}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.date}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.department}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.category}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.sub_category}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.amount}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              <Status
                                type={expense.status.toLowerCase()}
                                name={expense.status}
                              />
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              borderBottom: "1px solid #dee2e6",
                              verticalAlign: "middle",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              fontSize: "13px",
                              color: expense.accomplished === "Yes" ? "#2e7d32" : "#c62828",
                              fontWeight: expense.accomplished === "Yes" ? "bold" : "normal",
                            }}
                          >
                            <div style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {expense.accomplished}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="no-results"
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            height: "50px",
                            verticalAlign: "middle",
                            fontSize: "14px",
                          }}
                        >
                          {searchTerm || selectedDepartment || selectedCategory
                            ? "No expenses match your search criteria."
                            : "No expenses found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Component */}
              {currentExpenses.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              )}
            </div>
          </>
        )}

        {/* UPDATED: Add Expense Modal with smaller buttons */}
        {showAddExpenseModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div
              className="modal-container"
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "550px",
                maxWidth: "90%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="modal-content" style={{ padding: "24px" }}>
                <h3
                  className="modal-title"
                  style={{
                    margin: "0 0 20px 0",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#0C0C0C",
                  }}
                >
                  Add Expense
                </h3>

                <form onSubmit={handleSubmitExpense} className="budget-form">
                  {/* Ticket ID - Disabled (system generated) */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="ticketId"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Ticket ID
                    </label>
                    <input
                      type="text"
                      id="ticketId"
                      name="ticketId"
                      value={newExpense.ticketId}
                      readOnly
                      disabled
                      className="form-control"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                    <span
                      className="helper-text"
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      System generated
                    </span>
                  </div>

                  {/* Date - Auto-generated */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="date"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newExpense.date}
                      readOnly
                      className="form-control"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  {/* Department - REQUIRED */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="department"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Department <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className="select-wrapper"
                      style={{ position: "relative" }}
                    >
                      <select
                        id="department"
                        name="department"
                        value={newExpense.department}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          appearance: "none",
                          outline: "none",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select a department</option>
                        {departments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Category - REQUIRED (only CapEx and OpEx) */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="category"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Category <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className="select-wrapper"
                      style={{ position: "relative" }}
                    >
                      <select
                        id="category"
                        name="category"
                        value={newExpense.category}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          appearance: "none",
                          outline: "none",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select a category</option>
                        {mainCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Sub-Category - REQUIRED (dynamic based on department) */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="sub_category"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Sub-Category <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className="select-wrapper"
                      style={{ position: "relative" }}
                    >
                      <select
                        id="sub_category"
                        name="sub_category"
                        value={newExpense.sub_category}
                        onChange={handleInputChange}
                        required
                        disabled={!newExpense.department}
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: newExpense.department ? "white" : "#f5f5f5",
                          appearance: "none",
                          outline: "none",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">
                          {newExpense.department ? "Select a sub-category" : "Select department first"}
                        </option>
                        {newExpense.department && subCategoriesByDepartment[newExpense.department]?.map((subCat) => (
                          <option key={subCat} value={subCat}>
                            {subCat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Vendor - REQUIRED */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="vendor"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Vendor <span style={{ color: "red" }}>*</span>
                    </label>
                    <div
                      className="select-wrapper"
                      style={{ position: "relative" }}
                    >
                      <select
                        id="vendor"
                        name="vendor"
                        value={newExpense.vendor}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          appearance: "none",
                          outline: "none",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendors.map((vendor, idx) => (
                          <option key={idx} value={vendor}>
                            {vendor}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Amount - REQUIRED */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="amount"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Amount <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        placeholder="₱0.00"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{
                          width: "100%",
                          padding: "8px 40px 8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          outline: "none",
                          fontSize: "14px",
                        }}
                      />
                      {newExpense.amount && (
                        <button
                          type="button"
                          onClick={clearAmount}
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: "none",
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <X size={16} color="#666" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attachment - JPG, PDF, PNG */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="attachment"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Attachment
                    </label>
                    <div
                      style={{
                        border: "2px dashed #ccc",
                        borderRadius: "4px",
                        padding: "20px",
                        textAlign: "center",
                        cursor: "pointer",
                        position: "relative",
                      }}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <input
                        type="file"
                        id="file-input"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{
                          display: "none",
                        }}
                      />
                      {newExpense.attachment ? (
                        <div>
                          <Paperclip size={20} style={{ marginBottom: "8px" }} />
                          <p style={{ margin: "4px 0", fontWeight: "500", fontSize: "14px" }}>
                            {newExpense.attachment.name}
                          </p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                            Click to change file (JPG, PNG, PDF only)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Paperclip size={20} style={{ marginBottom: "8px" }} />
                          <p style={{ margin: "4px 0", fontWeight: "500", fontSize: "14px" }}>
                            Click to upload file
                          </p>
                          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                            Supported formats: JPG, PNG, PDF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Actions with SMALLER BUTTONS */}
                  <div className="modal-actions" style={{ marginTop: "24px" }}>
                    <div
                      className="button-row"
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCloseModal}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          padding: "6px 14px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                          color: "#333",
                          cursor: "pointer",
                          minWidth: "70px",
                          outline: "none",
                          fontSize: "13px",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-submit"
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          padding: "6px 14px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "#007bff",
                          color: "white",
                          cursor: "pointer",
                          minWidth: "70px",
                          outline: "none",
                          fontSize: "13px",
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Status component CSS directly */}
        <style jsx>{`
          .status-active,
          .status-inactive,
          .status-draft,
          .status-submitted,
          .status-approved,
          .status-rejected {
            display: inline-flex;
            height: auto;
            min-height: 4vh;
            width: fit-content;
            flex-direction: row;
            align-items: center;
            padding: 4px 12px;
            border-radius: 40px;
            gap: 5px;
            font-size: 0.75rem;
            overflow: visible;
            white-space: normal;
            max-width: 100%;
          }

          .status-active .circle,
          .status-inactive .circle,
          .status-draft .circle,
          .status-submitted .circle,
          .status-approved .circle,
          .status-rejected .circle {
            height: 6px;
            width: 6px;
            border-radius: 50%;
            margin-right: 3px;
            animation: statusPulse 2s infinite;
          }

          @keyframes statusPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.4);
            }
            70% {
              box-shadow: 0 0 0 6px rgba(var(--pulse-color), 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
            }
          }

          .status-approved,
          .status-active {
            background-color: #e8f5e8;
            color: #2e7d32;
          }

          .status-approved .circle,
          .status-active .circle {
            background-color: #2e7d32;
            --pulse-color: 46, 125, 50;
          }

          .status-rejected,
          .status-inactive {
            background-color: #ffebee;
            color: #c62828;
          }

          .status-rejected .circle,
          .status-inactive .circle {
            background-color: #c62828;
            --pulse-color: 198, 40, 40;
          }

          .status-submitted {
            background-color: #e3f2fd;
            color: #0d47a1;
          }

          .status-submitted .circle {
            background-color: #0d47a1;
            --pulse-color: 13, 71, 161;
          }

          .status-draft {
            background-color: #f5f5f5;
            color: #424242;
          }

          .status-draft .circle {
            background-color: #424242;
            --pulse-color: 66, 66, 66;
          }

          .status-details {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-wrap: nowrap;
            max-width: 100%;
          }

          .status-to {
            margin: 0 2px;
            white-space: nowrap;
          }

          .status-target {
            white-space: normal;
            word-break: break-word;
            max-width: 100%;
          }

          .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .icon-placeholder {
            height: 12px;
            width: 12px;
            flex-shrink: 0;
            background-color: currentColor;
            border-radius: 2px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ExpenseTracking;

  // What was changed:
  // 1.  Summary Cards: Replaced the three old summary cards with two new ones ("Budget Remaining", "Total Expenses This Month") that are connected to the `summaryData` state from the API. Added currency formatting.
  // 2.  Table Structure: Overhauled the table `<thead>` to match the new API response fields: "REF NO.", "DATE", "TYPE", "DESCRIPTION", "STATUS", "ACCOMPLISHED".
  // 3.  Table Data Binding: Changed the `<tbody>` to iterate over the `expenses` state and render the new fields (`expense.reference_no`, `expense.type`, etc.).
  // 4.  Pagination: Updated the `<Pagination>` component's `totalItems` prop to use `pagination.count` from the API response.
  // 5.  Category Filter: Modified the filter dropdown to display category names while using category codes for API requests.
  // 6.  Add Expense Modal: Updated the modal title and form fields. Added a required "Description" field and removed fields not present in the new API (Subcategory, Employee). The category dropdown now populates from the API.
  // 7.  CSS Styles: Added new CSS classes (`.status-draft`, `.status-submitted`, etc.) to the local `<style jsx>` block to support the different status types returned by the API.

// What was changed:
// 1.  State Management: Updated component state to handle API data for expenses, categories, summary cards, and pagination. Removed outdated/unused state variables.
// 2.  API Integration: Implemented a `useEffect` hook to fetch all necessary data from the backend API endpoints when the component mounts or when filters/pagination change.
// 3.  Removed Frontend Logic: Eliminated frontend-based filtering and pagination (`useMemo`, `slice`) to rely on the backend for these operations, improving performance and data consistency.
// 4.  Event Handlers: Modified `handleCategorySelect` to work with category codes.
// 5.  Add Expense Submission: Re-wired the `handleSubmitExpense` function to be asynchronous, build a correct payload, and call the `createExpense` API endpoint, including success/error handling and data refetching.


/* TODO: For the "Type" column, the UI displays the account.accont_type.name for each expense, from the Account model
, which can be Asset, Expense, Liability. The seeder assigns random category to each allocation, create_expense function creates expense using that allocation's
account and its random category. Meaning a BudgetAllocation for an Account of type "Expense". Modify the seeder later.
- Add specific date-picker filter to the UI
*/
