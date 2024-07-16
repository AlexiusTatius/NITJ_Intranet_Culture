import axios from 'axios';
import React, { useState } from "react";  
import "./LoginSignupStudent.css";

// check your requests on http dump
const LoginSignupStudent = () => {

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({username:"", email:"", password:""});


  const changeHandler = (event) => {
    setFormData(prevFormData => ({
        ...prevFormData,
        [event.target.name]: event.target.value
    }));
}

  const toggleState = () => {
    setState(prevState => prevState === "Login" ? "Sign Up" : "Login");
}


const login = async () => {
  try {
    const response = await axios.post('http://localhost:8001/api/user/Student/login', formData, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });

    const dataObj = response.data;
    console.log("Login: ",dataObj);
    if (dataObj.success) {
      localStorage.setItem('auth-token', dataObj.token);
      window.location.replace('/');
    } else {
      alert(dataObj.errors);
    }
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('Error response:', error.response.data);
      alert(error.response.data.message || 'An error occurred during login. Please try again.');
    } else {
      // Something else happened while setting up the request
      console.error('Error logging in:', error.message);
      alert('An error occurred during login. Please try again.');
    }
  }
};

  const signup = async () => {
    console.log("Signup: ",formData);
    try {
      const response = await axios.post('http://localhost:8001/api/user/Student/register', 
        formData, 
        {
        headers: {
            'Content-Type': 'application/json',
          },
      });
      const dataObj = response.data;
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        window.location.replace('/');
      } else {
        alert(dataObj.errors);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error response:', error.response.data);
        alert(error.response.data.message || 'An error occurred during signup. Please try again.');
      } else {
        // Something else happened while setting up the request
        console.error('Error signing up:', error.message);
        alert('An error occurred during signup. Please try again.');
      } 
    }
  };


  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up"?
          <input type="text" placeholder="Your name" name="username" value={formData.username} onChange={changeHandler}/>
          :<></>}
          <input type="email" placeholder="Email address" name="email" value={formData.email} onChange={changeHandler}/>
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={changeHandler}/>
        </div>

        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>

        {state==="Login"?
        <p className="loginsignup-login">Create an account? <span onClick={toggleState}>SignUp here</span></p>    // Here the state changes so component re-renders
        :<p className="loginsignup-login">Already have an account? <span onClick={toggleState}>LogIn here</span></p>}

      </div>
    </div>
  );
};

export default LoginSignupStudent;


// What is the purpose of formData and setFormData in the above code?