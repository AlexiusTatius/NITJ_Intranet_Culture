import axios from 'axios';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const changeEmail = (event) => {
        setEmail(event.target.value);
    }

    const forgotPassword = async () => {
        if (!email) {
            setMessage('Please enter your email address.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8001/api/user/forgotPassword/forgotPassword', {
                email: email,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const dataObj = response.data;
            if (dataObj.success) {
                setMessage(dataObj.message ||'Password reset link sent to your email.');
                setTimeout(() => window.location.replace('/'), 3000);
            } else {
                setMessage(dataObj.errors || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-semibold text-blue-600">Forgot Password</h2>
                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Enter your email to reset your password
                        </p>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={changeEmail}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={forgotPassword}
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            {isLoading ? (
                                <RefreshCw className="animate-spin h-5 w-5 mr-3" />
                            ) : null}
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </motion.button>
                    </div>
                </form>

                {message && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-4 text-center text-sm p-2 rounded ${
                            message.includes('sent') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {message}
                    </motion.div>
                )}

                <div className="mt-6">
                    <span
                        onClick={() => handleNavigation('/')}
                        className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
