import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = ({ onAuthenticate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    flatNumber: "",
    trustedContacts: ""
  });
  // Change default role to 'resident' for signup
  const [role, setRole] = useState("resident");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // At least 1 lowercase, 1 uppercase, 1 number, 1 special char, min 6 chars
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(password);
  };

  const validateTrustedContacts = (contacts) => {
    if (!contacts) return false;
    const arr = contacts.split(',').map(c => c.trim());
    if (arr.length === 0) return false;
    return arr.every(phone => /^\d{10}$/.test(phone));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, flatNumber, trustedContacts } = formData;

    if (!name) {
      setErrorMessage("Name is required!");
      return;
    }
    if (!email) {
      setErrorMessage("Email is required!");
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
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    if (role === "resident") {
      if (!flatNumber) {
        setErrorMessage("Flat number is required for residents.");
        return;
      }
      if (!trustedContacts) {
        setErrorMessage("Trusted contacts are required for residents.");
        return;
      }
      if (!validateTrustedContacts(trustedContacts)) {
        setErrorMessage("Each trusted contact must be a 10-digit phone number, comma separated.");
        return;
      }
    }

    try {
      // Send signup data to backend
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            flatNumber,
            trustedContacts: trustedContacts
              ? trustedContacts.split(',').map(c => c.trim())
              : [],
            role: role === 'admin' ? 'admin' : 'resident',
          })
      }
    );

      const data = await response.json();
      if (response.ok) {
        // Store userId from backend response
        if (data.user && data.user._id) {
          localStorage.setItem('userId', data.user._id);
          localStorage.removeItem('communityId');
          // Save the full user object for easy access
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.flatNumber) {
            localStorage.setItem('flatNumber', data.user.flatNumber);
          }
        }
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userRole', role);
        if (role === "resident") {
          localStorage.setItem("flatNumber", flatNumber);
          localStorage.setItem("trustedContacts", trustedContacts);
        } else {
          localStorage.removeItem("flatNumber");
          localStorage.removeItem("trustedContacts");
        }
        onAuthenticate();
        // Redirect to dashboard or home after authentication
        navigate("/home");
      } else {
        setErrorMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title" style={{textAlign: 'center'}}>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-input"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            name="role"
          >
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === "resident" && (
          <>
            <div className="form-group">
              <label className="form-label">Flat Number</label>
              <input
                type="text"
                className="form-input"
                name="flatNumber"
                value={formData.flatNumber}
                onChange={handleChange}
                required={role === "resident"}
                placeholder="Enter your flat number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trusted Contacts (comma separated)</label>
              <input
                type="text"
                className="form-input"
                name="trustedContacts"
                value={formData.trustedContacts}
                onChange={handleChange}
                required={role === "resident"}
                placeholder="Enter trusted contacts (e.g. 9876543210,9123456789)"
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit" className="form-button">
          Sign Up
        </button>
      </form>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#2a34ef' }}>Login</Link>
      </p>
    </div>
  );
};

export default SignupPage;
