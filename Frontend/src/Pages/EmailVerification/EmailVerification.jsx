import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await apiTeacherInstance.get("/verify-email", {
          params: {
            userEmail: searchParams.get("userEmail"),
            departmentId: searchParams.get("departmentId"),
            emailVerifyToken: searchParams.get("emailVerifyToken"),
          },
        });

        if (response.data.success) {
          setVerificationState("success");
        } else {
          setVerificationState("error");
          setErrorMessage(response.data.message || "Verification failed");
        }
      } catch (error) {
        setVerificationState("error");
        setErrorMessage(
          error.response?.data?.message || "Something went wrong during verification"
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  const stateComponents = {
    verifying: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-16 h-16 text-blue-500"
        >
          <Loader2 className="w-16 h-16" />
        </motion.div>
        <CardTitle className="text-2xl">Verifying your email</CardTitle>
        <CardDescription>Please wait while we verify your email address</CardDescription>
      </motion.div>
    ),

    success: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-green-600" />
        </motion.div>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
          <CardDescription className="text-base">
            Your email has been successfully verified.
          </CardDescription>
        </div>
        <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-center text-blue-600">
            <Mail className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Email Sent</span>
          </div>
          <p className="text-sm text-blue-600">
            We've sent a confirmation email to your registered account.
          </p>
        </div>
        <Button
          onClick={() => navigate("/Teacher/loginSignup")}
          className="bg-green-600 hover:bg-green-700"
        >
          Go to Login
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    ),

    error: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
        >
          <X className="w-8 h-8 text-red-600" />
        </motion.div>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
          <CardDescription className="text-base">
            {errorMessage || "Unable to verify your email. Please try again."}
          </CardDescription>
        </div>
        <Button
          onClick={() => navigate("/")}
          className="bg-red-600 hover:bg-red-700"
        >
          Return to Homepage
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="w-full flex justify-center">
            <motion.img
              src="/logo.svg"
              alt="Logo"
              className="h-12 w-auto"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stateComponents[verificationState]}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;