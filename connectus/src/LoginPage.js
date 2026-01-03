import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = ({ onAuthenticate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // At least 1 lowercase, 1 uppercase, 1 number, 1 special char, min 6 chars
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setErrorMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 6 characters long.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      if (response.ok) {
        // Store userId from backend response
        if (data.user && data.user._id) {
          localStorage.setItem('userId', data.user._id);
          // Restore communityId if present in user object
          if (data.user.community) {
            localStorage.setItem('communityId', data.user.community);
          } else {
            localStorage.removeItem('communityId');
          }
          // Save the full user object for easy access
          localStorage.setItem('user', JSON.stringify(data.user));
          // Optionally, for backward compatibility:
          if (data.user.flatNumber) {
            localStorage.setItem('flatNumber', data.user.flatNumber);
          }
          // Store token for authenticated requests (for chat)
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
        }
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);
        localStorage.setItem("userRole", role);
        onAuthenticate();
        navigate("/home");
      } else {
        setErrorMessage(data.message || "Invalid email, password, or role. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title" style={{textAlign: 'center'}}>Welcome Back</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          {/* Update role selection options to match backend: resident/admin */}
          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            name="role"
          >
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="form-button">
          Login
        </button>
      </form>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#2a34ef' }}>Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
