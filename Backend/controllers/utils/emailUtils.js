import { createTransport } from 'nodemailer';
import crypto from 'crypto';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
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
}

export default new EmailUtils();