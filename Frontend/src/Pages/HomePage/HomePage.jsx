import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, UserPlus } from 'lucide-react';

const HomePage = () => {
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-8 py-6 bg-blue-600">
          <h1 className="text-3xl font-bold text-white text-center">HomePage</h1>
        </div>
        <div className="p-8">
          <p className="text-center text-gray-600 mb-8">Please select your role to continue:</p>
          <div className="space-y-40"> {/* Increased space-y from 6 to 8 */}
            <Link to="/Teacher/loginSignup">
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full flex items-center justify-center bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg font-medium"
              >
                <User className="mr-2" size={24} />
                Teacher
              </motion.button>
            </Link>
            <Link to="/Student/loginSignup">
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 text-lg font-medium"
              >
                <UserPlus className="mr-2" size={24} />
                Student
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;