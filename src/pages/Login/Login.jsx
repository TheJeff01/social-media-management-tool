import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const [signState, setSignState] = useState("Sign In");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSignState = () => {
    setSignState((prevState) =>
      prevState === "Sign In" ? "Sign Up" : "Sign In"
    );
    setErrors({});
    setFormData({ name: "", email: "", password: "" });
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

    // Name validation for sign up
    if (signState === "Sign Up") {
      if (!formData.name) {
        newErrors.name = "Name is required";
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
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

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (signState === "Sign Up") {
        // Handle Sign Up
        const existingUsers = JSON.parse(sessionStorage.getItem('registeredUsers') || '[]');
        
        // Check if user already exists
        const userExists = existingUsers.find(user => user.email === formData.email);
        if (userExists) {
          setErrors({ email: "User with this email already exists" });
          setIsLoading(false);
          return;
        }

        // Register new user
        const newUser = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          password: formData.password, // In real app, this would be hashed
          createdAt: new Date().toISOString()
        };

        existingUsers.push(newUser);
        sessionStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // Auto login after successful registration
        onLogin({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        });

        navigate("/");

      } else {
        // Handle Sign In
        const existingUsers = JSON.parse(sessionStorage.getItem('registeredUsers') || '[]');
        
        // Find user with matching email and password
        const user = existingUsers.find(
          user => user.email === formData.email && user.password === formData.password
        );

        if (user) {
          // Successful login
          onLogin({
            id: user.id,
            name: user.name,
            email: user.email
          });
          navigate("/");
        } else {
          // Check if email exists but password is wrong
          const emailExists = existingUsers.find(user => user.email === formData.email);
          if (emailExists) {
            setErrors({ password: "Incorrect password" });
          } else {
            setErrors({ email: "No account found with this email" });
          }
        }
      }

    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: "Something went wrong. Please try again." });
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
            <div>
              <input 
                type="text" 
                name="name"
                placeholder="Your full name" 
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  borderColor: errors.name ? '#ef4444' : undefined
                }}
              />
              {errors.name && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '14px', 
                  marginTop: '5px',
                  marginLeft: '5px' 
                }}>
                  {errors.name}
                </div>
              )}
            </div>
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
                New to JeffApp? <span onClick={toggleSignState}>Sign Up</span>
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