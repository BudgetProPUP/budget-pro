import { useState } from "react";
import "./ManageProfile.css";

export default function ManageProfile({ onClose }) {
  // Mock user data for UI demonstration
  const [user, setUser] = useState({
    first_name: "John",
    last_name: "Doe",
    middle_name: "Michael",
    company_id: "EMP-123-456",
    department: "Information Technology",
    suffix: "Jr.",
    email: "john.doe@company.com",
    profile_picture: "https://i.pinimg.com/736x/19/de/17/19de17c09737a59c5684e14cbaccdfc1.jpg"
  });

  const [formData, setFormData] = useState({ ...user });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profile_picture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For UI demonstration - in real app, you would call an API here
    console.log("Form data:", formData);
    alert("Profile updated successfully! (This is a UI demonstration)");
    setUser({ ...formData });
  };

  const handleBackClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <main className="manageProfilePage">
        <div className="manageProfileContainer">
          <div className="profileContent">
            <div className="profileLeft">
              <div className="profileHeaderSection">
                <div className="manageProfileHeader">
                  <button className="backButton" onClick={handleBackClick}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <h1>Manage Profile</h1>
                </div>
              </div>
              
              <div className="profileCard">
                <div className="profileImageSection">
                  <div className="profileImageContainer">
                    <img
                      src={formData.profile_picture}
                      alt="Profile"
                      className="profileImage"
                    />
                  </div>
                  <input
                    type="file"
                    id="profile-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="changeImageBtn"
                  >
                    Change Photo
                  </label>
                </div>

                <div className="profileInfo">
                  <h3>
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="profileDetails">
                    <p>
                      <strong>Position:</strong>
                    </p>
                    <p>{user.department}</p>
                    <p>
                      <strong>Department:</strong>
                    </p>
                    <p>{user.department}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="profileRight">
              <form onSubmit={handleSubmit}>
                <div className="profileSettingsCard">
                  <h2>Profile Settings</h2>

                  <div className="formGrid">
                    <div className="formGroup">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Company ID</label>
                      <input
                        type="text"
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleInputChange}
                        placeholder="XXX-XXX-XXX"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleInputChange}
                        placeholder="Enter middle name (if applicable)"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="XXXXXXXXX"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="formGroup">
                      <label>Suffix</label>
                      <input
                        type="text"
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleInputChange}
                        placeholder="Enter suffix (if applicable)"
                      />
                    </div>
                  </div>

                  <button type="submit" className="saveChangesBtn">
                    SAVE CHANGES
                  </button>
                </div>

                <div className="authenticationCard">
                  <h2>Authentication Details</h2>

                  <div className="formGroup">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email@gmail.com"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value="password123" // Demo value
                      readOnly
                    />
                    <small style={{color: '#666', fontSize: '12px', marginTop: '5px'}}>
                      Password cannot be changed from this page
                    </small>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}