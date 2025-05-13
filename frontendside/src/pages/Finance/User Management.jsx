import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './User Management.css';

const UserManagement = () => {
  const [currentDate] = useState(new Date('2025-05-06T10:45:00'));
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active', lastActive: '2025-05-05', department: 'Finance', username: 'john_doe' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Finance Manager', status: 'Active', lastActive: '2025-05-04', department: 'Finance', username: 'jane_smith' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'Accountant', status: 'Active', lastActive: '2025-05-03', department: 'Accounting', username: 'robert_j' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'Viewer', status: 'Inactive', lastActive: '2025-04-20', department: 'IT', username: 'emily_d' },
    { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', role: 'Accountant', status: 'Active', lastActive: '2025-05-02', department: 'Accounting', username: 'michael_w' }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    department: 'IT',
    username: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditUserModal) {
      setCurrentUser({
        ...currentUser,
        [name]: value
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value
      });
    }
  };

  const handleAddUser = () => {
    const id = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    setUsers([
      ...users,
      {
        id,
        ...newUser,
        lastActive: today
      }
    ]);
    
    setNewUser({
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
      department: 'IT',
      username: ''
    });
    
    setShowAddUserModal(false);
  };

  const handleEditUser = () => {
    setUsers(users.map(user => 
      user.id === currentUser.id ? currentUser : user
    ));
    setShowEditUserModal(false);
    setCurrentUser(null);
  };

  const openEditUserModal = (user) => {
    setCurrentUser({...user});
    setShowEditUserModal(true);
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return user;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="user-management-container">
      {/* Header - Copied from Dashboard.jsx */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">BUDGETPRO</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            
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
              className="nav-item active"
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

      {/* Timestamp */}
      <div className="dashboard-timestamp">
        <div className="timestamp-container">
          <p>{formattedDate} | {formattedTime}</p>
        </div>
      </div>

      {/* Main User Management Content */}
      <header className="page-header">
        <h1>User Management</h1>
        <p className="page-description">
          Manage user accounts and permissions for the financial system
        </p>
      </header>

      <div className="controls-container">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-filter"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Finance Manager">Finance Manager</option>
            <option value="Accountant">Accountant</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        
        <button className="add-user-btn" onClick={() => setShowAddUserModal(true)}>
          Add New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastActive}</td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => openEditUserModal(user)}>Edit</button>
                  <button 
                    className={`toggle-btn ${user.status === 'Active' ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="pagination-btn">Previous</button>
        <span className="page-indicator">Page 1 of 1</span>
        <button className="pagination-btn">Next</button>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <h2><i className="info-icon">i</i> Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Active:</label>
                  <span className="readonly-field">N/A (New User)</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date Added:</label>
                  <span className="readonly-field">{formatDate(new Date())}</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department:</label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                  >
                    <option value="Finance">Finance</option>
                    <option value="Accounting">Accounting</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="form-group status-toggle">
                  <label>Account Active</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status-toggle-add"
                      checked={newUser.status === 'Active'}
                      onChange={(e) => setNewUser({
                        ...newUser,
                        status: e.target.checked ? 'Active' : 'Inactive'
                      })}
                    />
                    <label htmlFor="status-toggle-add"></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleAddUser}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && currentUser && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <h2><i className="info-icon">i</i> Edit User Info</h2>
              <button className="close-btn" onClick={() => setShowEditUserModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={currentUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Active:</label>
                  <span className="readonly-field">{formatDate(currentUser.lastActive)}</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={currentUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    name="role"
                    value={currentUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={currentUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date Added:</label>
                  <span className="readonly-field">January 1, 2024</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department:</label>
                  <select
                    name="department"
                    value={currentUser.department}
                    onChange={handleInputChange}
                  >
                    <option value="Finance">Finance</option>
                    <option value="Accounting">Accounting</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="form-group status-toggle">
                  <label>Account Active</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status-toggle-edit"
                      checked={currentUser.status === 'Active'}
                      onChange={(e) => setCurrentUser({
                        ...currentUser,
                        status: e.target.checked ? 'Active' : 'Inactive'
                      })}
                    />
                    <label htmlFor="status-toggle-edit"></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditUserModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleEditUser}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;