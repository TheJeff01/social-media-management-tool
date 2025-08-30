import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const [signState, setSignState] = useState("Sign In");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSignState = () => {
    setSignState((prevState) =>
      prevState === "Sign In" ? "Sign Up" : "Sign In"
    );
    setErrors({});
    setFormData({ username: "", email: "", password: "", firstName: "", lastName: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Additional validation for sign up
    if (signState === "Sign Up") {
      if (!formData.username) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }

      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (signState === "Sign Up") {
        // Handle Sign Up - Call backend API
        const response = await fetch('http://localhost:3001/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'User already exists') {
            setErrors({ email: "User with this email already exists" });
          } else if (data.error === 'Username already taken') {
            setErrors({ username: "Username is already taken" });
          } else {
            setErrors({ general: data.message || "Registration failed. Please try again." });
          }
          return;
        }

        // Auto login after successful registration
        onLogin({
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          token: data.token
        });

        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate("/");

      } else {
        // Handle Sign In - Call backend API
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'Invalid credentials') {
            setErrors({ password: "Incorrect password" });
          } else if (data.error === 'User not found') {
            setErrors({ email: "No account found with this email" });
          } else {
            setErrors({ general: data.message || "Login failed. Please try again." });
          }
          return;
        }

        // Successful login
        onLogin({
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          token: data.token
        });

        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate("/");
      }

    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-form">
        <h1>{signState}</h1>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{ 
              color: '#ef4444', 
              textAlign: 'center', 
              marginBottom: '15px',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {errors.general}
            </div>
          )}

          {signState === "Sign Up" && (
            <>
              <div>
                <input 
                  type="text" 
                  name="username"
                  placeholder="Username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                    borderColor: errors.username ? '#ef4444' : undefined
                  }}
                />
                {errors.username && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    marginTop: '5px',
                    marginLeft: '5px' 
                  }}>
                    {errors.username}
                  </div>
                )}
              </div>

              <div>
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={{
                    borderColor: errors.firstName ? '#ef4444' : undefined
                  }}
                />
                {errors.firstName && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    marginTop: '5px',
                    marginLeft: '5px' 
                  }}>
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={{
                    borderColor: errors.lastName ? '#ef4444' : undefined
                  }}
                />
                {errors.lastName && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    marginTop: '5px',
                    marginLeft: '5px' 
                  }}>
                    {errors.lastName}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <input 
              type="email" 
              name="email"
              placeholder="Enter Email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
              style={{
                borderColor: errors.email ? '#ef4444' : undefined
              }}
            />
            {errors.email && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '14px', 
                marginTop: '5px',
                marginLeft: '5px' 
              }}>
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
              style={{
                borderColor: errors.password ? '#ef4444' : undefined
              }}
            />
            {errors.password && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '14px', 
                marginTop: '5px',
                marginLeft: '5px' 
              }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-switch">
            {signState === "Sign In" ? (
              <p>
                New to PostBridge? <span onClick={toggleSignState}>Sign Up</span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={toggleSignState}>Sign in Now</span>
              </p>
            )}
          </div>

          <button 
            className={`login-btn ${isLoading ? 'loading' : ''}`} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : signState}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;