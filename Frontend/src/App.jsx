import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginSignupTeacher from "./Pages/Login-Signup-Teacher/LoginSignupTeacher";
import LoginSignupStudent from "./Pages/Login-Signup-Student/LoginSignupStudent";
import HomePage from "./Pages/HomePage/HomePage";
import ForgotPassword from "./Pages/Forgot-Password/ForgotPassword";
import ResetPassword from "./Pages/Reset-Password/ResetPassword";
import PdfViewerPage from "./Pages/PdfViewerPage/PdfViewerPage";
import TeacherHomepageAllFiles from "./Pages/Teacher-Homepage/TeacherHomepage-AllFiles";
import TeacherHomepageSharedFiles from "./Pages/Teacher-Homepage/TeacherHomepage-SharedFiles";
import StudentViewHomepageSharedFiles from "./Pages/Teacher-Homepage/TeacherHomepage-StudentVisible";
import { Toaster } from "react-hot-toast";
import { Fragment } from "react";
import SearchPortal from "./Pages/SearchPortal/SearchPortal";
import EmailVerification from "./Pages/EmailVerification/EmailVerification.jsx";

function App() {
  return (
    <Fragment>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Teacher/loginSignup" element={<LoginSignupTeacher />} />
        <Route path="/user/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Student/loginSignup" element={<LoginSignupStudent />} />
        <Route path="/user/ResetPassword" element={<ResetPassword />} />
        <Route
          path="/Teacher/HomePage/AllFiles"
          element={<TeacherHomepageAllFiles />}
        />
        <Route
          path="/Teacher/HomePage/SharedFiles"
          element={<TeacherHomepageSharedFiles />}
        />
        <Route path="/pdf-viewer/:fileId" element={<PdfViewerPage />} />
        <Route
          path="/:teacherEmailInitials/Sharedfiles"
          element={<StudentViewHomepageSharedFiles />}
        />
        <Route
          path="/:teacherEmailInitials/pdf-viewer/:fileId"
          element={<PdfViewerPage />}
        />
        <Route path="/searchportal" element={<SearchPortal />} />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Routes>
    </Fragment>
  );
}

export default App;
