import axios from 'axios';
import React, { useState } from "react"; 

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const changePassword = (event) =>{
        setPassword(prevPassword =>{
            prevPassword = event.target.value;
            return prevPassword;
        });
    }

    const changeConfirmPassword = (event) =>{
        setConfirmPassword(prevConfirmPassword =>{
            prevConfirmPassword = event.target.value;
            return prevConfirmPassword;
        });
    }

    const resetPassword = async () => {
        console.log("Reset Password: ", password, confirmPassword);
        if (!password || !confirmPassword) {
          alert('Please enter password and confirm password.');
          return;
        }
        if(password !== confirmPassword){
            alert('Password and confirm password do not match.');
            return;
        }

        try {
          const response = await axios.post('http://localhost:8001/api/user/forgotPassword/resetPassword',{
            password: password,
            confirmPassword: confirmPassword,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          const dataObj = response.data;
          console.log("Reset Password: ", dataObj);
          console.log("Object Success", dataObj.success);


          if (dataObj.success) {
            alert('Password reset successfully.');
            // window.location.replace('/');
          } else {
            alert(dataObj.errors);
          }
        } catch (error) {
          if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Error response:', error.response.data);
            alert(error.response.data.message || 'An error occurred during password reset. Please try again.');
          } else {
            // Something else happened while setting up the request
            console.error('Error resetting password:', error.message);
            alert('An error occurred during password reset. Please try again.');
          }
        }
      }
    return (
        <div>
            <h1>Reset Password, Close this window</h1>
            <input type="password" placeholder="Password" value={password} onChange={changePassword} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={changeConfirmPassword} />
            <button onClick={resetPassword}>Reset Password</button>
        </div>
    )
}

export default ResetPassword;