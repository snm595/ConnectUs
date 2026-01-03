import React, { useState } from "react";

function CreateCommunity({ existingCodes, onCodeGenerated }) {
  const [aptName, setAptName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [communityCode, setCommunityCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to generate a random alphanumeric code
  const generateCode = (length = 6) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  // Function to create a unique community code
  const createUniqueCode = () => {
    let newCode = generateCode();
    while (existingCodes && existingCodes.includes(newCode)) {
      newCode = generateCode(); // Regenerate if not unique
    }
    return newCode;
  };

  const handleCreate = async () => {
    if (!aptName || !adminName || !adminPhone) {
      alert("Please fill in all the fields.");
      return;
    }
    setLoading(true);
    const newCode = createUniqueCode();
    try {
      // Get adminId from localStorage (should be set at login/signup)
      const adminId = localStorage.getItem('userId');
      if (!adminId) {
        alert("Admin ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      // Send to backend
      const response = await fetch('http://localhost:5000/api/community/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: aptName, code: newCode, adminId })
      });
      const data = await response.json();
      if (response.ok) {
        setCommunityCode(newCode); // Set the code for display below
        // Store communityId (prefer backend's unique _id, fallback to code)
        if (data.community && data.community._id) {
          localStorage.setItem('communityId', data.community._id);
        } else if (data.community && data.community.code) {
          localStorage.setItem('communityId', data.community.code);
        } else {
          localStorage.setItem('communityId', newCode); // fallback
        }
        // Optionally update user object in localStorage
        if (data.community && data.community._id) {
          let user = localStorage.getItem('user');
          if (user) {
            user = JSON.parse(user);
            user.community = data.community._id;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        alert(`Community Created Successfully!\nYour Community Code is: ${newCode}`);
        if (onCodeGenerated) {
          onCodeGenerated(newCode); // Share the code with the parent or other components
        }
        // Optionally redirect or clear form
      } else {
        alert(data.message || 'Failed to create community.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Community</h2>
      <div>
        <label>Apt Name:</label>
        <input
          type="text"
          value={aptName}
          onChange={(e) => setAptName(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>Admin Name:</label>
        <input
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>Admin Phone No:</label>
        <input
          type="text"
          value={adminPhone}
          onChange={(e) => setAdminPhone(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <button onClick={handleCreate} style={{ marginTop: "20px" }} disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
      {communityCode && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Your Community Code:</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "green" }}>
            {communityCode}
          </p>
        </div>
      )}
    </div>
  );
}

export default CreateCommunity;
