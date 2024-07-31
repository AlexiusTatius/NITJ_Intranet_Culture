import { Route, Routes } from "react-router-dom"
import './App.css'
import LoginSignupTeacher from './Pages/Login-Signup-Teacher/LoginSignupTeacher'
import LoginSignupStudent from './Pages/Login-Signup-Student/LoginSignupStudent'
import HomePage_TS from './Pages/Teacher-Student-HomePage/HomePage_TS'
import ForgotPassword from './Pages/Forgot-Password/ForgotPassword'
import ResetPassword from './Pages/Reset-Password/ResetPassword'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage_TS />} />
        <Route path="/Teacher/loginSignup" element={<LoginSignupTeacher />} />
        <Route path="/user/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Student/loginSignup" element={<LoginSignupStudent />} />
        <Route path="/user/ResetPassword" element={<ResetPassword/>} />
      </Routes>
    </>
  ) 
  // return (
  //   <>
  //     {/* <LoginSignup /> */}
  //     <HomePage_TS />
  //   </>
  // )
}

export default App
