import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const LoginSignupTeacher = () => {
  const departments = [
    {
      display: "Computer Science and Engineering (CSE)",
      value: "Computer Science and Engineering"
    },
    {
      display: "Information Technology (IT)",
      value: "Information Technology"
    },
    {
      display: "Electrical Engineering (EE)",
      value: "Electrical Engineering"
    },
    {
      display: "Electronics and Communication Engineering (ECE)",
      value: "Electronics and Communication Engineering"
    },
    {
      display: "Mechanical Engineering (ME)",
      value: "Mechanical Engineering"
    },
    {
      display: "Instrumentation and Control Engineering (ICE)",
      value: "Instrumentation and Control Engineering"
    },
    {
      display: "Civil Engineering (CE)",
      value: "Civil Engineering"
    },
    {
      display: "Chemical Engineering (CHE)",
      value: "Chemical Engineering"
    },
    {
      display: "Industrial and Production Engineering (IPE)",
      value: "Industrial and Production Engineering"
    },
    {
      display: "Biotechnology (BT)",
      value: "Biotechnology"
    },
    {
      display: "Textile Technology (TT)",
      value: "Textile Technology"
    },
    {
      display: "Physics (PHY)",
      value: "Physics"
    },
    {
      display: "Mathematics (MATH)",
      value: "Mathematics"
    },
    {
      display: "Chemistry (CHEM)",
      value: "Chemistry"
    },
    {
      display: "Humanities and Management (HM)",
      value: "Humanities and Management"
    }
  ];

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    department: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsFormValid(
      formData.email !== "" &&
        formData.password !== "" &&
        formData.department !== "" &&
        (state === "Login" || formData.username !== "") &&
        !emailError
    );
  }, [formData, state, emailError]);

  const changeHandler = (event) => {
    const { name, value } = event.target;

    if (name === "department") {
      // Find the department object that matches the selected display value
      const selectedDept = departments.find(dept => dept.display === value);
      // Set the backend value in formData
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: selectedDept ? selectedDept.value : ""
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    setErrorMessage("");

    if (name === "email") {
      const emailPattern = /^[^\s@]+@nitj\.ac\.in$/;
      if (!emailPattern.test(value)) {
        setEmailError("Please enter a valid email in the format: name@nitj.ac.in");
      } else {
        setEmailError("");
      }
    }
  };

  const toggleState = () => {
    setState((prevState) => (prevState === "Login" ? "Sign Up" : "Login"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      return;
    }

    try {
      const endpoint = state === "Login" ? "login" : "register";
      const response = await axios.post(
        `http://localhost:8001/api/user/Teacher/${endpoint}`,
        formData
      );

      const dataObj = response.data;
      if (dataObj.success) {
        localStorage.setItem("auth-token", dataObj.token);
        navigate("/Teacher/Homepage/allfiles", { replace: true });
      } else if (dataObj.errors) {
        setErrorMessage(dataObj.errors);
      } else if (!dataObj.success && dataObj.message === "Incorrect password") {
        setErrorMessage("Incorrect password");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error(`Error during ${state.toLowerCase()}:`, error);
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInputRef.current.focus();
    }
  };

  const token = localStorage.getItem("auth-token");

  return token ? null : (
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
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
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
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email address"
              name="email"
              value={formData.email}
              onChange={changeHandler}
              onKeyDown={handleEmailKeyDown}
              className={`w-full px-4 py-2 border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
            />
            {emailError && (
              <div className="text-red-500 text-sm font-medium">
                {emailError}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              name="password"
              ref={passwordInputRef}
              value={formData.password}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="space-y-2 w-full sm:max-w-md">
            <label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department
            </label>
            <div className="relative">
              <select
                id="department"
                name="department"
                value={departments.find(dept => dept.value === formData.department)?.display || ""}
                onChange={changeHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                style={{ maxHeight: "200px", overflowY: "scroll" }}
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept.display}>
                    {dept.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              isFormValid
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            Continue
          </motion.button>
        </form>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          {state === "Login" ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <span
                  onClick={toggleState}
                  className="text-blue-600 cursor-pointer hover:underline font-medium"
                >
                  Sign Up here
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your Password?{" "}
                <span
                  onClick={() => handleNavigation("/user/ForgotPassword")}
                  className="text-blue-600 cursor-pointer hover:underline font-medium"
                >
                  Reset Password
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={toggleState}
                className="text-blue-600 cursor-pointer hover:underline font-medium"
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignupTeacher;