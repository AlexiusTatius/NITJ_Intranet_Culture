import { useState } from 'react'
import { Route, Routes } from "react-router-dom"
import './App.css'
import LoginSignupTeacher from './Pages/Login-Signup-Teacher/LoginSignupTeacher'
import LoginSignupStudent from './Pages/Login-Signup-Student/LoginSignupStudent'
import HomePage_TS from './Pages/Teacher-Student-HomePage/HomePage_TS'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage_TS />} />
        <Route path="/Teacher/loginSignup" element={<LoginSignupTeacher />} />
        <Route path="/Student/loginSignup" element={<LoginSignupStudent />} />
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
