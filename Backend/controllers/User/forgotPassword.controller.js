import TeacherUserModel from "../../models/users/TeacherUser.model.js";
import { createTransport } from "nodemailer"
import crypto from "crypto"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });


// Route to handle "forgot password" request
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try{
    if (!email) {
      return res.status(400).json({ message: "Please enter your email address" })
    }
  }catch(error){
    res.status(500).json({ message: error.message })
  }

  // Check if email exists in the database
  const user = await TeacherUserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetToken = resetToken;
  await user.save();

  //Send email with reset token
  const resetUrl = `${process.env.FRONTEND_URL}/user/resetPassword?token=${resetToken}`;

  var transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, //sender gmail adderss
      pass: process.env.EMAIL_APP_PASSWORD  // app password from gmail account
    }
  });

  var mailOptions = {
    from: {
      name: 'Administator Reset Password',
      address: process.env.EMAIL_USER // sender email address
    },
    to: email,
    subject: "Reset Password",
    html: `<h1>Reset Password</h1><h2>Click on the link to reset your password</h2><h3>${resetUrl}</h3>`
  };


  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ success: true, message: 'A link to reset your password have been sent to your email.' });
};

//  Route to handle password reset request
const resetPassword = async (req, res) => {
  const { password } = req.body;
  const token = req.query.token;
  
  // Verify reset token
  console.log("token: ", token);
  const user = await TeacherUserModel.findOne({ resetToken: token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  // Update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetToken = null;
  await user.save();

  res.status(200).json({success: true, message: 'Password reset successful' });
};

export { forgotPassword, resetPassword }

