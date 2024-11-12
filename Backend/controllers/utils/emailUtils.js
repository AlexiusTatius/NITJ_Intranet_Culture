import TeacherUserModel from "../../models/users/TeacherUser.model.js";
import { createTransport } from 'nodemailer';
import bcrypt from "bcrypt"
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// env config
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

class EmailUtils {
  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection established successfully');
    } catch (error) {
      console.error('Email service connection failed:', error);
      throw new Error('Failed to establish email service connection');
    }
  }

  async generateVerificationToken() {
    try {
      const randomBytesAsync = promisify(crypto.randomBytes);
      const buffer = await randomBytesAsync(32);
      return buffer.toString('hex');
    } catch (error) {
      console.error('Error generating verification token:', error);
      throw new Error('Failed to generate verification token');
    }
  }

  async sendVerificationEmail(email, token, departmentId, username) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?userEmail=${email}&departmentId=${departmentId}&emailVerifyToken=${token}`;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_SENDER_NAME || 'Teacher Registration System',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email Address',
      html: this._getVerificationEmailTemplate(verificationUrl, username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendSuccessEmail(email, username) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_SENDER_NAME || 'Teacher Registration System',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome - Email Verified Successfully',
      html: this._getSuccessEmailTemplate(loginUrl, username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Success email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending success email:', error);
      throw new Error('Failed to send success email');
    }
  }
  
  async handleForgotPassword(email) {
    try {
      // Input validation
      if (!email || !email.trim()) {
        return {
          success: false,
          message: "Please provide your email address to reset your password"
        };
      }
  
      // Find user
      const user = await TeacherUserModel.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: "No account found with this email address. Please check and try again."
        };
      }
  
      // Generate reset token
      const resetToken = await this.generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  
      // Update user with reset token
      user.resetToken = resetToken;
      user.resetTokenExpires = tokenExpiry;
      await user.save();
  
      // Generate reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/user/resetPassword?token=${resetToken}`;
  
      try {
        // Send password reset email using new template
        const emailSent = await this.transporter.sendMail({
          from: {
            name: process.env.EMAIL_SENDER_NAME || 'NITJ Faculty Portal',
            address: process.env.EMAIL_USER
          },
          to: email,
          subject: "Reset Your NITJ Faculty Portal Password",
          html: this._getPasswordResetEmailTemplate(resetUrl, user.username)
        });
  
        // Check if email was accepted
        if (emailSent.accepted.length > 0 && emailSent.rejected.length === 0) {
          return {
            success: true,
            message: "Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password."
          };
        } else {
          // If email wasn't accepted
          console.error('Email sending failed:', emailSent);
          return {
            success: false,
            message: "Failed to send password reset email. Please try again later."
          };
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return {
          success: false,
          message: "Failed to send password reset email. Please try again later."
        };
      }
  
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: "An error occurred while processing your password reset request. Please try again later."
      };
    }
  }
  
  async handleResetPassword(token, password, confirmPassword) {
    try {
      // Validate inputs
      if (!token) {
        return {
          success: false,
          message: "Password reset token is missing or invalid"
        };
      }
  
      if (!password || !confirmPassword) {
        return {
          success: false,
          message: "Please provide both password and confirmation password"
        };
      }
  
      if (password !== confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match. Please ensure both passwords are identical."
        };
      }
  
      // Find user with valid token
      const user = await TeacherUserModel.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return {
          success: false,
          message: "Password reset link has expired or is invalid. Please request a new password reset."
        };
      }
  
      // Hash and update new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();
  
      try {
        // Send confirmation email using new template
        const emailSent = await this.transporter.sendMail({
          from: {
            name: process.env.EMAIL_SENDER_NAME || 'NITJ Faculty Portal',
            address: process.env.EMAIL_USER
          },
          to: user.email,
          subject: "Password Reset Successful - NITJ Faculty Portal",
          html: this._getPasswordResetSuccessTemplate(user.username)
        });
  
        // Check if confirmation email was sent successfully
        if (emailSent.accepted.length > 0 && emailSent.rejected.length === 0) {
          console.log('Password reset confirmation email sent successfully');
        } else {
          console.warn('Failed to send password reset confirmation email:', emailSent);
        }
  
        // Return success regardless of confirmation email status
        // since the password has been successfully reset
        return {
          success: true,
          message: "Your password has been successfully reset. You can now login with your new password."
        };
  
      } catch (emailError) {
        // Log email error but still return success since password reset worked
        console.error('Error sending confirmation email:', emailError);
        return {
          success: true,
          message: "Your password has been successfully reset. You can now login with your new password. (Note: Confirmation email could not be sent)"
        };
      }
  
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: "An error occurred while resetting your password. Please try again later."
      };
    }
  }
  

  _getVerificationEmailTemplate(verificationUrl, username) {
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification</h1>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello${username ? ' ' + username : ''},
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for registering with our system. To complete your registration, please verify your email address:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If you're having trouble clicking the button, copy and paste this URL into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #4CAF50; word-break: break-all;">
                ${verificationUrl}
              </a>
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin-bottom: 5px;">
                ⚠️ This link will expire in 24 hours.
              </p>
              <p style="color: #999; font-size: 14px;">
                If you didn't request this verification, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _getSuccessEmailTemplate(loginUrl, username) {
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to Our Platform!</h1>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello ${username},
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Your email has been successfully verified. You can now access your account and start using our platform.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  _getPasswordResetEmailTemplate(resetUrl, username) {
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/nitj-logo.png" alt="NITJ Logo" style="max-width: 150px; height: auto;" />
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
          <h1 style="color: #1a3c6e; text-align: center; margin-bottom: 30px; font-size: 24px;">Password Reset Request</h1>
          
          <p style="color: #444444; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Dear ${username || 'Faculty Member'},
          </p>
          
          <p style="color: #444444; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset the password for your NITJ Faculty Portal account. 
            If you made this request, please click the button below to reset your password:
          </p>
  
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 14px 35px; background-color: #1a3c6e; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 500; font-size: 16px; transition: background-color 0.3s;">
              Reset Password
            </a>
          </div>
  
          <div style="background-color: #f8f9fa; border-left: 4px solid #ffd700; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
              ⚠️ This password reset link will expire in 60 minutes for security reasons.
            </p>
          </div>
  
          <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px;">
            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
              Security Tips:
            </p>
            <ul style="color: #666666; font-size: 14px; line-height: 1.5; padding-left: 20px;">
              <li>Never share your password with anyone</li>
              <li>Create a strong password using a mix of letters, numbers, and symbols</li>
              <li>Use different passwords for different accounts</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
  
          <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 4px;">
            <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
              If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.
            </p>
          </div>
        </div>
  
        <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 14px;">
          <p style="margin-bottom: 10px;">
            This is an automated message, please do not reply to this email.
          </p>
          <p style="margin-bottom: 5px;">
            Dr B R Ambedkar National Institute of Technology Jalandhar
          </p>
          <p style="margin: 0;">
            G.T Road, Amritsar Bypass, Jalandhar, Punjab, India-144027
          </p>
        </div>
      </div>
    `;
  }
  
  _getPasswordResetSuccessTemplate(username) {
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/nitj-logo.png" alt="NITJ Logo" style="max-width: 150px; height: auto;" />
        </div>
  
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #4CAF50; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 style="color: #1a3c6e; font-size: 24px; margin: 0;">Password Reset Successful</h1>
          </div>
  
          <p style="color: #444444; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Dear ${username || 'Faculty Member'},
          </p>
  
          <p style="color: #444444; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your password has been successfully reset. You can now log in to your NITJ Faculty Portal account using your new password.
          </p>
  
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="display: inline-block; padding: 14px 35px; background-color: #1a3c6e; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 500; font-size: 16px; transition: background-color 0.3s;">
              Login to Your Account
            </a>
          </div>
  
          <div style="background-color: #e8f5e9; border-radius: 4px; padding: 20px; margin: 25px 0;">
            <h2 style="color: #2e7d32; font-size: 16px; margin: 0 0 15px 0;">Recent Account Activity</h2>
            <p style="color: #1b5e20; font-size: 14px; line-height: 1.5; margin: 0;">
              Your password was reset on ${new Date().toLocaleString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>
  
          <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px;">
            <h2 style="color: #1a3c6e; font-size: 16px; margin-bottom: 15px;">Keeping Your Account Secure</h2>
            <ul style="color: #666666; font-size: 14px; line-height: 1.5; padding-left: 20px;">
              <li>Set up two-factor authentication for additional security</li>
              <li>Update your password regularly</li>
              <li>Monitor your account activity</li>
              <li>Log out when using shared devices</li>
            </ul>
          </div>
  
          <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 4px;">
            <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
              If you did not make this change or believe an unauthorized person has accessed your account, please contact our IT support team immediately.
            </p>
          </div>
        </div>
  
        <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 14px;">
          <p style="margin-bottom: 10px;">
            For any assistance, please contact IT Support
            <br>
            <a href="mailto:support@nitj.ac.in" style="color: #1a3c6e; text-decoration: none;">support@nitj.ac.in</a>
          </p>
          <p style="margin-bottom: 5px;">
            Dr B R Ambedkar National Institute of Technology Jalandhar
          </p>
          <p style="margin: 0;">
            G.T Road, Amritsar Bypass, Jalandhar, Punjab, India-144027
          </p>
        </div>
      </div>
    `;
  }

}

// Add these methods to EmailUtils class

export default new EmailUtils();