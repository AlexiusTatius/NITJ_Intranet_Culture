/*import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginSignupTeacher = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({username:"", email:"", password:""});
  const navigate = useNavigate();

  const changeHandler = (event) => {
    setFormData(prevFormData => ({
        ...prevFormData,
        [event.target.name]: event.target.value
    }));
  }

  const toggleState = () => {
    setState(prevState => prevState === "Login" ? "Sign Up" : "Login");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = state === "Login" ? 'login' : 'register';
      const response = await apiTeacherInstance.post(`/${endpoint}`, formData);

      const dataObj = response.data;
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        // Handle successful login/signup
      } else {
        alert(dataObj.errors || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error(`Error during ${state.toLowerCase()}:`, error);
      alert(error.response?.data?.message || `An error occurred. Please try again.`);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-16 px-4 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-8 py-6 bg-blue-600">
          <h1 className="text-3xl font-bold text-white text-center">{state}</h1>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {state === "Sign Up" && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                id="username"
                placeholder="Your name" 
                name="username" 
                value={formData.username} 
                onChange={changeHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email"
              placeholder="Email address" 
              name="email" 
              value={formData.email} 
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password"
              placeholder="Password" 
              name="password" 
              value={formData.password} 
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Continue
          </motion.button>
        </form>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          {state === "Login" ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account? <span onClick={toggleState} className="text-blue-600 cursor-pointer hover:underline font-medium">Sign Up here</span>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your Password? <span onClick={() => handleNavigation('/user/ForgotPassword')} className="text-blue-600 cursor-pointer hover:underline font-medium">Reset Password</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account? <span onClick={toggleState} className="text-blue-600 cursor-pointer hover:underline font-medium">Log In here</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignupTeacher;*/

import React, { useState, useEffect, useRef } from "react";  
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginSignupTeacher = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [emailError, setEmailError] = useState(""); // State for email format error
  const passwordInputRef = useRef(null); // Reference for password input
  const navigate = useNavigate();

  useEffect(() => {
    // Check if form is valid whenever formData or state changes
    if (state === "Login") {
      setIsFormValid(formData.email !== "" && formData.password !== "" && !emailError);
    } else {
      setIsFormValid(formData.username !== "" && formData.email !== "" && formData.password !== "" && !emailError);
    }
  }, [formData, state, emailError]);

  const changeHandler = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));

    setErrorMessage(""); // Clear general error message on input change

    // Check email format whenever email is changed
    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic regex for email
      if (!emailPattern.test(value)) {
        setEmailError("Please enter a valid email in the format: name@domain.com");
      } else {
        setEmailError(""); // Clear email error if valid
      }
    }
  };

  const toggleState = () => {
    setState((prevState) => (prevState === "Login" ? "Sign Up" : "Login"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      return; // Prevent submission if email is invalid
    }

    try {
      const endpoint = state === "Login" ? "login" : "register";
      const response = await apiTeacherInstance.post(`/${endpoint}`, formData);

      const dataObj = response.data;
      if (dataObj.success) {
        localStorage.setItem("auth-token", dataObj.token);
        // Handle successful login/signup
      } else if (dataObj.errors) {
        setErrorMessage(dataObj.errors); // Show server error message
      } else if (!dataObj.success && dataObj.message === "Incorrect password") {
        setErrorMessage("Incorrect password"); // Specific error for wrong password
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error(`Error during ${state.toLowerCase()}:`, error);
      setErrorMessage(error.response?.data?.message || `An error occurred. Please try again.`);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the form from submitting
      passwordInputRef.current.focus(); // Move focus to password field
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-8 py-6 bg-blue-600">
          <h1 className="text-3xl font-bold text-white text-center">{state}</h1>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {state === "Sign Up" && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Your name"
                name="username"
                value={formData.username}
                onChange={changeHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email address"
              name="email"
              value={formData.email}
              onChange={changeHandler}
              onKeyDown={handleEmailKeyDown} // Detect Enter key press
              className={`w-full px-4 py-2 border ${emailError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
            />
            {/* Display email format error */}
            {emailError && (
              <div className="text-red-500 text-sm font-medium">
                {emailError}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              name="password"
              ref={passwordInputRef} // Set reference to password field
              value={formData.password}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          {/* Display error message */}
          {errorMessage && (
            <div className="text-red-500 text-sm font-medium">
              {errorMessage}
            </div>
          )}
          <motion.button
            whileHover={isFormValid ? { scale: 1.05 } : {}}
            whileTap={isFormValid ? { scale: 0.95 } : {}}
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              isFormValid ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            Continue
          </motion.button>
        </form>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          {state === "Login" ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account? <span onClick={toggleState} className="text-blue-600 cursor-pointer hover:underline font-medium">Sign Up here</span>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your Password? <span onClick={() => handleNavigation('/user/ForgotPassword')} className="text-blue-600 cursor-pointer hover:underline font-medium">Reset Password</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account? <span onClick={toggleState} className="text-blue-600 cursor-pointer hover:underline font-medium">Log In here</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignupTeacher;




