import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const LoginSignupTeacher = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    department: "", // Department field added for both login and sign-up
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

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrorMessage("");

    if (name === "email") {
      const emailPattern = /^[^\s@]+@nitj\.ac\.in$/;
      if (!emailPattern.test(value)) {
        setEmailError(
          "Please enter a valid email in the format: name@nitj.ac.in"
        );
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

        // Use replace: true to prevent going back to login page
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
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
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
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="department"
              className="text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <div className="relative">
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={changeHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                style={{ maxHeight: "200px", overflowY: "scroll" }}
              >
                <option value="">Select Department</option>
                <option value="Biotechnology (BT)">Biotechnology (BT)</option>
                <option value="Chemical Engineering (CHE)">
                  Chemical Engineering (CHE)
                </option>
                <option value="Civil Engineering (CE)">
                  Civil Engineering (CE)
                </option>
                <option value="Computer Science and Engineering (CSE)">
                  Computer Science and Engineering (CSE)
                </option>
                <option value="Data Science and Engineering (DSE)">
                  Data Science and Engineering (DSE)
                </option>
                <option value="Electrical Engineering (EE)">
                  Electrical Engineering (EE)
                </option>
                <option value="Electronics and Communication Engineering (ECE)">
                  Electronics and Communication Engineering (ECE)
                </option>
                <option value="Electronics and VLSI">
                  Electronics and VLSI
                </option>
                <option value="Mathematics and Computing (MNC)">
                  Mathematics and Computing (MNC)
                </option>
                <option value="Mechanical Engineering (ME)">
                  Mechanical Engineering (ME)
                </option>
                <option value="Industrial and Production Engineering (IPE)">
                  Industrial and Production Engineering (IPE)
                </option>
                <option value="Information Technology (IT)">
                  Information Technology (IT)
                </option>
                <option value="Instrumentation and Control Engineering (ICE)">
                  Instrumentation and Control Engineering (ICE)
                </option>
                <option value="Textile Technology (TT)">
                  Textile Technology (TT)
                </option>
                <option value="Department of Physics">
                  Department of Physics
                </option>
                <option value="Department of Mathematics">
                  Department of Mathematics
                </option>
                <option value="Department of Chemistry">
                  Department of Chemistry
                </option>
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



