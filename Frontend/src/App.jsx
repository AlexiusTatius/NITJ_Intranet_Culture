import { Route, Routes } from "react-router-dom"
import './App.css'
import LoginSignupTeacher from './Pages/Login-Signup-Teacher/LoginSignupTeacher'
import LoginSignupStudent from './Pages/Login-Signup-Student/LoginSignupStudent'
import HomePage from './Pages/HomePage/HomePage'
import ForgotPassword from './Pages/Forgot-Password/ForgotPassword'
import ResetPassword from './Pages/Reset-Password/ResetPassword'
import TeacherHomepage from "./Pages/Teacher-Homepage/TeacherHomepage"
import PdfViewerPage from "./Pages/PdfViewerPage/PdfViewerPage"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/Teacher/loginSignup" element={<LoginSignupTeacher />} />
        <Route path="/user/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Student/loginSignup" element={<LoginSignupStudent />} />
        <Route path="/user/ResetPassword" element={<ResetPassword/>} />
        <Route path="/Teacher/HomePage" element={<TeacherHomepage/>} />
        <Route path="/pdf-viewer/:fileId" element={<PdfViewerPage />} />
      </Routes>
    </>
  ) 

}

export default App
