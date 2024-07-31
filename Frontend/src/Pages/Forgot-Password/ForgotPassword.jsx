import axios from 'axios';
import React, { useState } from "react"; 

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const changeEmail = (event) =>{
        setEmail(prevEmail =>{
            prevEmail = event.target.value;
            return prevEmail;
        });
    }

    const forgotPassword = async () => {
        console.log("Forgot Password: ", email);
        try {
          const response = await axios.post('http://localhost:8001/api/user/forgotPassword/forgotPassword',{
            email: email,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          const dataObj = response.data;
          console.log("Forgot Password: ", dataObj);
          console.log("Object Success", dataObj.success);

          if (dataObj.success) {
            alert('Password reset link sent to your email.');
            window.location.replace('/');
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
            <input type="text" placeholder="Email" value={email} onChange={changeEmail} />
            <button onClick={forgotPassword}>Forgot Password</button>
        </div>
    )
};

export default ForgotPassword;
// const forgotPasswordFxn = async () => {
//     try {
//       const response = await axios.post('http://localhost:8001/api/user/Teacher/forgotPassword/forgotPassword', {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const dataObj = response.data;
//       console.log("Forgot Password: ",dataObj);
//       if (dataObj.success) {
//         alert('Password reset link sent to your email.');
//       } else {
//         alert(dataObj.errors);
//       }
//     } catch (error) {
//       if (error.response) {
//         // Server responded with a status other than 2xx
//         console.error('Error response:', error.response.data);
//         alert(error.response.data.message || 'An error occurred during password reset. Please try again.');
//       } else {
//         // Something else happened while setting up the request
//         console.error('Error resetting password:', error.message);
//         alert('An error occurred during password reset. Please try again.');
//       }
//     }
//   }