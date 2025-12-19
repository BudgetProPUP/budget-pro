import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  User,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";
import LOGOMAP from "../../assets/MAP.jpg";
import "./ProposalHistory.css";
import { useAuth } from "../../context/AuthContext";
import { getProposalHistory } from "../../API/proposalAPI";

// Import ManageProfile component
import ManageProfile from "./ManageProfile";

// Updated Status Component with softer colors
const Status = ({ type, name, personName = null, location = null }) => {
  // Define softer color scheme
  const getStatusStyle = () => {
    switch(type.toLowerCase()) {
      case 'approved':
        return {
          backgroundColor: '#e6f4ea',
          color: '#0d6832',
          borderColor: '#a3d9b1'
        };
      case 'rejected':
        return {
          backgroundColor: '#fde8e8',
          color: '#9b1c1c',
          borderColor: '#f5b7b1'
        };
      case 'submitted':
        return {
          backgroundColor: '#e8f4fd',
          color: '#1a56db',
          borderColor: '#a4cafe'
        };
      case 'updated':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          borderColor: '#fcd34d'
        };
      case 'reviewed':
        return {
          backgroundColor: '#f0f9ff',
          color: '#0369a1',
          borderColor: '#bae6fd'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          borderColor: '#d1d5db'
        };
    }
  };

  const style = getStatusStyle();

  return (
    <div 
      className={`status-${type.split(" ").join("-")}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        ...style
      }}
    >
      <div 
        className="circle" 
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          marginRight: '6px',
          backgroundColor: style.color
        }}
      ></div>
      {name}
    </div>
  );
};

// Pagination Component with updated pageSizeOptions
const Pagination = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const pageLimit = 5;
    const sideButtons = Math.floor(pageLimit / 2);

    if (totalPages <= pageLimit + 2) {
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
          <span
            key="start-ellipsis"
            className="ellipsis"
            style={{ padding: "8px 4px" }}
          >
            ...
          </span>
        );
      }

      if (currentPage + sideButtons >= totalPages - 1) {
        startPage = totalPages - pageLimit;
      }
      if (currentPage - sideButtons <= 2) {
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
          <span
            key="end-ellipsis"
            className="ellipsis"
            style={{ padding: "8px 4px" }}
          >
            ...
          </span>
        );
      }

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

// Sample data based on your provided structure
const sampleData = {
  "Merchandise Planning": [
    { subcategory: "Product Range Planning", category: "OpEx" },
    { subcategory: "Buying Costs", category: "CapEx" },
    { subcategory: "Market Research", category: "OpEx" },
    { subcategory: "Inventory Handling Fees", category: "OpEx" },
    { subcategory: "Supplier Coordination", category: "OpEx" },
    { subcategory: "Seasonal Planning Tools", category: "CapEx" },
    { subcategory: "Training", category: "OpEx" },
    { subcategory: "Travel", category: "OpEx" },
    { subcategory: "Software Subscription", category: "OpEx" }
  ],
  "Store Operations": [
    { subcategory: "Store Consumables", category: "OpEx" },
    { subcategory: "POS Maintenance", category: "OpEx" },
    { subcategory: "Store Repairs", category: "CapEx" },
    { subcategory: "Sales Incentives", category: "OpEx" },
    { subcategory: "Uniforms", category: "CapEx" },
    { subcategory: "Store Opening Expenses", category: "CapEx" },
    { subcategory: "Store Supplies", category: "OpEx" },
    { subcategory: "Training", category: "OpEx" },
    { subcategory: "Travel", category: "OpEx" },
    { subcategory: "Utilities", category: "OpEx" }
  ],
  "Marketing": [
    { subcategory: "Campaign Budget", category: "OpEx" },
    { subcategory: "Branding Materials", category: "CapEx" },
    { subcategory: "Digital Ads", category: "OpEx" },
    { subcategory: "Social Media Management", category: "OpEx" },
    { subcategory: "Events Budget", category: "OpEx" },
    { subcategory: "Influencer Fees", category: "OpEx" },
    { subcategory: "Photography/Videography", category: "CapEx" },
    { subcategory: "Software Subscription", category: "OpEx" },
    { subcategory: "Training", category: "OpEx" },
    { subcategory: "Travel", category: "OpEx" }
  ],
  "Operations": [
    { subcategory: "Equipment Maintenance", category: "OpEx" },
    { subcategory: "Fleet/Vehicle Expenses", category: "CapEx" },
    { subcategory: "Operational Supplies", category: "OpEx" },
    { subcategory: "Business Permits", category: "OpEx" },
    { subcategory: "Facility Utilities", category: "OpEx" },
    { subcategory: "Compliance Costs", category: "OpEx" },
    { subcategory: "Training", category: "OpEx" },
    { subcategory: "Office Supplies", category: "OpEx" }
  ],
  "IT": [
    { subcategory: "Server Hosting", category: "OpEx" },
    { subcategory: "Software Licenses", category: "CapEx" },
    { subcategory: "Cloud Subscriptions", category: "OpEx" },
    { subcategory: "Hardware Purchases", category: "CapEx" },
    { subcategory: "Data Tools", category: "CapEx" },
    { subcategory: "Cybersecurity Costs", category: "OpEx" },
    { subcategory: "API Subscription Fees", category: "OpEx" },
    { subcategory: "Domain Renewals", category: "OpEx" },
    { subcategory: "Training", category: "OpEx" },
    { subcategory: "Office Supplies", category: "OpEx" }
  ],
  "Logistics": [
    { subcategory: "Shipping Costs", category: "OpEx" },
    { subcategory: "Warehouse Equipment", category: "CapEx" },
    { subcategory: "Transport & Fuel", category: "OpEx" },
    { subcategory: "Freight Fees", category: "OpEx" },
    { subcategory: "Vendor Delivery Charges", category: "OpEx" },
    { subcategory: "Storage Fees", category: "OpEx" },
    { subcategory: "Packaging Materials", category: "OpEx" },
    { subcategory: "Safety Gear", category: "CapEx" },
    { subcategory: "Training", category: "OpEx" }
  ],
  "Human Resources": [
    { subcategory: "Recruitment Expenses", category: "OpEx" },
    { subcategory: "Job Posting Fees", category: "OpEx" },
    { subcategory: "Employee Engagement Activities", category: "OpEx" },
    { subcategory: "Training & Workshops", category: "OpEx" },
    { subcategory: "Medical & Wellness Programs", category: "OpEx" },
    { subcategory: "Background Checks", category: "OpEx" },
    { subcategory: "HR Systems/Payroll Software", category: "CapEx" },
    { subcategory: "Office Supplies", category: "OpEx" },
    { subcategory: "Travel", category: "OpEx" }
  ]
};

const ProposalHistory = () => {
  // Navigation and UI State
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showManageProfile, setShowManageProfile] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleManageProfile = () => {
    setShowManageProfile(true);
    setShowProfileDropdown(false);
  };

  const handleCloseManageProfile = () => {
    setShowManageProfile(false);
  };

const getUserRole = () => {
  if (!user) return "User";
  
  // Check for role in different possible locations
  if (user.roles?.bms) return user.roles.bms;
  if (user.role_display) return user.role_display;
  if (user.role) return user.role;
  
  // Default role names based on user type
  if (user.is_superuser) return "ADMIN";
  if (user.is_staff) return "STAFF";
  
  return "User";
};

const userRole = getUserRole();

const userProfile = {
  name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || "User" : "User",
  role: userRole,
  avatar: user?.profile_picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
  // API Data State
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ count: 0 });
  const [loading, setLoading] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Filter and Pagination State
  const [selectedStatus, setSelectedStatus] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Date/Time State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Department options
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

  // Category options - only CapEx and OpEx
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "CapEx", label: "CapEx" },
    { value: "OpEx", label: "OpEx" },
  ];

  // Status options - only Approved and Rejected
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  // Helper function to get random item from array
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Helper function to enrich API data with sample data
  const enrichHistoryData = (apiData) => {
    return apiData.map((item, index) => {
      // If department is specified in filter, use it; otherwise get random
      let department = selectedDepartment || getRandomItem(Object.keys(sampleData));
      
      // If we have a department filter, ensure data matches that department
      if (selectedDepartment) {
        department = selectedDepartment;
      }
      
      // Get subcategory and category from the selected department
      const deptItems = sampleData[department] || sampleData["Merchandise Planning"];
      const deptItem = getRandomItem(deptItems);
      
      // Determine category from subcategory if not already set
      let category = item.category;
      if (!category || !["CapEx", "OpEx"].includes(category)) {
        category = deptItem.category;
      }
      
      // Ensure category is only CapEx or OpEx
      category = category === "CapEx" || category === "CAPEX" ? "CapEx" : "OpEx";
      
      // Generate ticket ID based on department
      const deptCode = department.substring(0, 3).toUpperCase();
      const ticketId = `BGT-${deptCode}-${String(index + 1).padStart(3, '0')}`;
      
      return {
        ...item,
        proposal_id: item.proposal_id || ticketId,
        department: department,
        subcategory: item.subcategory || deptItem.subcategory,
        category: category,
        // Ensure status is only Approved or Rejected
        status: item.status === "APPROVED" || item.status === "REJECTED" 
          ? item.status 
          : (index % 2 === 0 ? "APPROVED" : "REJECTED"),
        // Ensure modified by is FINANCE MANAGER or DEPARTMENT HEAD
        last_modified_by: getModifiedByRole(item.last_modified_by)
      };
    });
  };

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch Proposal History Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearchTerm,
          action: selectedStatus,
          category: selectedCategory,
          department: selectedDepartment,
        };
        
        // Clean up empty params
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });

        const historyRes = await getProposalHistory(params);
        
        // Enrich the API data with sample data
        const enrichedData = enrichHistoryData(historyRes.data.results);
        setHistory(enrichedData);
        setPagination(historyRes.data);
        
        // Apply client-side filtering for department-specific data
        applyFilters(enrichedData);
      } catch (error) {
        console.error("Failed to fetch proposal history:", error);
        // Create sample data if API fails
        generateSampleData();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedStatus,
    selectedCategory,
    selectedDepartment,
  ]);

  // Apply filters to data
  const applyFilters = (data) => {
    let filtered = [...data];
    
    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(item => 
        item.department === selectedDepartment
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.category === selectedCategory
      );
    }
    
    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => 
        item.status === selectedStatus
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.proposal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredHistory(filtered);
  };

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const sampleHistory = [];
    const departments = selectedDepartment ? [selectedDepartment] : Object.keys(sampleData);
    let recordCount = 0;
    
    // Create sample records for each department
    departments.forEach((dept, deptIndex) => {
      const deptItems = sampleData[dept];
      
      // Create 5-10 records per department
      const recordsPerDept = selectedDepartment ? 20 : Math.floor(Math.random() * 6) + 5;
      
      for (let i = 1; i <= recordsPerDept; i++) {
        recordCount++;
        const item = getRandomItem(deptItems);
        const deptCode = dept.substring(0, 3).toUpperCase();
        
        sampleHistory.push({
          id: recordCount,
          proposal_id: `BGT-${deptCode}-${String(recordCount).padStart(3, '0')}`,
          department: dept,
          category: item.category,
          subcategory: item.subcategory,
          last_modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_modified_by: recordCount % 2 === 0 ? "FINANCE MANAGER" : "DEPARTMENT HEAD",
          status: recordCount % 3 === 0 ? "REJECTED" : "APPROVED",
          title: `${dept} Budget Proposal ${recordCount}`
        });
      }
    });
    
    const enrichedData = sampleHistory;
    setHistory(enrichedData);
    setPagination({ count: enrichedData.length });
    applyFilters(enrichedData);
  };

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
        setShowStatusDropdown(false);
        setShowCategoryDropdown(false);
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update current date/time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Navigation dropdown handlers
  const toggleBudgetDropdown = () => {
    setShowBudgetDropdown((prev) => !prev);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleExpenseDropdown = () => {
    setShowExpenseDropdown((prev) => !prev);
    setShowBudgetDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowNotifications(false);
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowBudgetDropdown(false);
    setShowExpenseDropdown(false);
    setShowProfileDropdown(false);
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown((prev) => !prev);
    setShowStatusDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleStatusDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
    setShowCategoryDropdown(false);
    setShowDepartmentDropdown(false);
  };
  const toggleDepartmentDropdown = () => {
    setShowDepartmentDropdown((prev) => !prev);
    setShowCategoryDropdown(false);
    setShowStatusDropdown(false);
  };

  // Filter handlers
  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowCategoryDropdown(false);
    setCurrentPage(1);
  };

  const handleStatusSelect = (statusValue) => {
    setSelectedStatus(statusValue);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  const handleDepartmentSelect = (deptValue) => {
    setSelectedDepartment(deptValue);
    setShowDepartmentDropdown(false);
    setCurrentPage(1);
  };

  // Navigation and Logout
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Updated logout function
  const handleLogout = async () => {
    await logout();
  };

  // Format date/time for display (removed seconds)
  const formattedDay = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get display label for filters
  const getCategoryDisplay = () => {
    const option = categoryOptions.find(opt => opt.value === selectedCategory);
    return option ? option.label : "All Categories";
  };

  const getStatusDisplay = () => {
    const option = statusOptions.find(opt => opt.value === selectedStatus);
    return option ? option.label : "All Status";
  };

  const getDepartmentDisplay = () => {
    const option = departmentOptions.find(opt => opt.value === selectedDepartment);
    return option ? option.label : "All Departments";
  };

  // Helper function to get Modified By role
  const getModifiedByRole = (userRole) => {
    if (!userRole) return "DEPARTMENT HEAD";
    if (userRole.includes("Finance") || userRole.includes("FINANCE")) {
      return "FINANCE MANAGER";
    } else if (userRole.includes("Department") || userRole.includes("DEPARTMENT")) {
      return "DEPARTMENT HEAD";
    }
    return userRole;
  };

  // Get data to display based on current page
  const getDisplayData = () => {
    const dataToUse = filteredHistory.length > 0 ? filteredHistory : history;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return dataToUse.slice(startIndex, endIndex);
  };

  // Get total items for pagination
  const getTotalItems = () => {
    return filteredHistory.length > 0 ? filteredHistory.length : pagination.count;
  };

  return (
    <div
      className="app-container"
      style={{ minWidth: "1200px", overflowY: "auto", height: "100vh" }}
    >
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

          <div
            className="navbar-links"
            style={{ display: "flex", gap: "20px" }}
          >
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

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

          <div
            className="navbar-controls"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
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

            <div className="notification-container">
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
                    <h3>Notifications</h3>
                    <button
                      className="clear-all-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ outline: "none" }}
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
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        &times;
                      </button>
                    </div>
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
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
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
                      outline: "none",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <User size={16} style={{ marginRight: "8px" }} />
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
                        outline: "none",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Settings size={16} style={{ marginRight: "8px" }} />
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
                      outline: "none",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <LogOut size={16} style={{ marginRight: "8px" }} />
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
        <div
          className="proposal-history"
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
          <div
            className="top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 className="page-title">Proposal History</h2>
            <div
              className="controls-container"
              style={{ display: "flex", gap: "10px" }}
            >
              <div style={{ position: "relative" }}>
                <label
                  htmlFor="history-search"
                  style={{
                    border: "0",
                    clip: "rect(0 0 0 0)",
                    height: "1px",
                    margin: "-1px",
                    overflow: "hidden",
                    padding: "0",
                    position: "absolute",
                    width: "1px",
                  }}
                >
                  Search by Ticket ID or Title
                </label>
                <input
                  type="text"
                  id="history-search"
                  name="search"
                  autoComplete="off"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-account-input"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    outline: "none",
                    width: "200px",
                  }}
                />
              </div>

              {/* Department Filter Button */}
              <div className="filter-dropdown" style={{ position: "relative" }}>
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
                  }}
                >
                  <span>{getDepartmentDisplay()}</span>
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

              {/* Category Filter Button */}
              <div className="filter-dropdown" style={{ position: "relative" }}>
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
                  }}
                >
                  <span>{getCategoryDisplay()}</span>
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

              {/* Status Filter Button */}
              <div className="filter-dropdown" style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-btn ${
                    showStatusDropdown ? "active" : ""
                  }`}
                  onClick={toggleStatusDropdown}
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
                  }}
                >
                  <span>Status: {getStatusDisplay()}</span>
                  <ChevronDown size={14} />
                </button>
                {showStatusDropdown && (
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
                    }}
                  >
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className={`category-dropdown-item ${
                          selectedStatus === status.value ? "active" : ""
                        }`}
                        onClick={() => handleStatusSelect(status.value)}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedStatus === status.value
                              ? "#f0f0f0"
                              : "white",
                          outline: "none",
                        }}
                      >
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              height: "1px",
              backgroundColor: "#e0e0e0",
              marginBottom: "20px",
            }}
          ></div>

          <div
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
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
                  <th
                    style={{
                      width: "12%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    TICKET ID
                  </th>
                  <th
                    style={{
                      width: "18%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    DEPARTMENT
                  </th>
                  <th
                    style={{
                      width: "13%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    CATEGORY
                  </th>
                  <th
                    style={{
                      width: "18%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    SUB-CATEGORY
                  </th>
                  <th
                    style={{
                      width: "15%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    LAST MODIFIED
                  </th>
                  <th
                    style={{
                      width: "15%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    MODIFIED BY
                  </th>
                  <th
                    style={{
                      width: "14%",
                      padding: "0.75rem",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                    }}
                  >
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : getDisplayData().length > 0 ? (
                  getDisplayData().map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 1 ? "alternate-row" : ""}
                      style={{
                        backgroundColor:
                          index % 2 === 1 ? "#F8F8F8" : "#FFFFFF",
                        height: "60px",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#212529",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.proposal_id}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.department || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          fontWeight: item.category === "CapEx" ? "400" : "400",
                          color: item.category === "CapEx" ? "#212529" : "#212529",
                          textAlign: "center",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.category || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.subcategory || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          color: "#666",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {new Date(item.last_modified).toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {getModifiedByRole(item.last_modified_by)}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <Status
                          type={item.status ? item.status.toLowerCase() : ""}
                          name={
                            item.status
                              ? item.status.charAt(0).toUpperCase() +
                                item.status.slice(1).toLowerCase()
                              : "N/A"
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="no-results"
                      style={{ padding: "20px", textAlign: "center" }}
                    >
                      No proposal history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {getTotalItems() > 0 && !loading && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={getTotalItems()}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </div>
      </div>
      {showManageProfile && (
        <ManageProfile onClose={handleCloseManageProfile} />
      )}
    </div>
  );
};

export default ProposalHistory;