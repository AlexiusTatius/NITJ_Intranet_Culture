import React, { useState } from "react";  
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

export default LoginSignupTeacher;
