import fs from 'fs/promises';
import path from 'path';
import TeacherUserModel from "../../models/users/TeacherUser.model.js";
import FolderModel from '../../models/File-Folder/Folder.model.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { TeacherFolderDir } from '../../config.js';
import EmailUtils from '../utils/emailUtils.js';

//create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: 3 * 24 * 60 * 60
    })
}

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" })
        }
        const user = await TeacherUserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        const token = createToken(user._id)
        
        // retrieve the root folder of the user
        const rootFolder = await FolderModel.findOne({ owner: user._id, parentFolder: null });

        res.status(200).json({ success: true, user, rootFolder, token, message: "User logged in successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//register user
const verificationBeforeRegister = async (req, res) => {
    const { username, email, password, department } = req.body;
    console.log(req.body);

    const departmentName = department;
    try {
        //check if user already exists
        const exists = await TeacherUserModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (!username || !email || !password || !departmentName) {
            const missingFields = [];
            if (!username) missingFields.push('username');
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');
            if (!departmentName) missingFields.push('departmentName');
            
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        // Then validate the non-empty fields
        if (validator.isEmpty(username.trim()) || 
            validator.isEmpty(email.trim()) || 
            validator.isEmpty(password.trim()) || 
            validator.isEmpty(departmentName.trim())) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email" })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: "Please enter a strong password" })
        }
        
        const userData = { username, email, password, departmentName };
        
        // Verify if the teacher is a faculty member
        // If the teacher is a faculty member, return the faculty and department objects, i.e. TeacherFaculty = {faculty, department}, 2 objects are here.
        const TeacherFaculty = await TeacherUserModel.TeacherFacultyVerify(userData);
        if (!TeacherFaculty) {
            return res.status(400).json({ message: "Teacher is not a faculty member" });
        }
        
        // Generate verification token
        const verificationToken = await EmailUtils.generateVerificationToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const relativeDirPath = path.join(`${email}-${username}`);

        // Saving TeacherUser in database with verification fields
        const newUser = new TeacherUserModel({ 
            username, 
            email, 
            password: hashedPassword, 
            department: TeacherFaculty.department._id,    
            faculty: TeacherFaculty.faculty._id,         
            folderPath: relativeDirPath,
            verificationToken,
            verificationTokenExpires: tokenExpiry,
            isEmailVerified: false
        });

        // Save the new user to the database to ensure the user data is stored before proceeding
        const user = await newUser.save();

        const departmentId = TeacherFaculty.department.departmentID;        

        // Send verification email
        // In the try block, after email sending:
        const emailSent = await EmailUtils.sendVerificationEmail(email, verificationToken, departmentId, username);

        if (!emailSent.success) {
            // If email fails, delete the user and return error
            await TeacherUserModel.findByIdAndDelete(user._id);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send verification email",
                showToast: true,
                toastType: 'error'
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Registration initiated. Please check your email to verify your account.",
            verificationPending: true,
            showToast: true,
            toastType: 'success',
            toastMessage: 'Verification link sent to your email! Please check your inbox.',
            email: email // So frontend can display which email address was used
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const verifyEmail = async (req, res) => {
    try {
        console.log("Bruh");
        const { departmentId, userEmail, emailVerifyToken } = req.query;
        console.log("departmentId: ", departmentId);
        console.log("userEmail: ", userEmail);
        console.log("emailVerifyToken: ", emailVerifyToken);

        console.log("Bruh-1.5")
        const user = await TeacherUserModel.findOne({
            verificationToken: emailVerifyToken,
            verificationTokenExpires: { $gt: Date.now() },
            isEmailVerified: false
        });
        console.log("Bruh2");
        console.log("Bruh2");
        console.log("Bruh2");

        if (!user) {
            const expiredTokenUser = await TeacherUserModel.findByDepartmentAndEmail(departmentId, userEmail);
            
            if (expiredTokenUser) {
                // Delete user with expired token
                await expiredTokenUser.deleteOne();
                
                return res.status(400).json({
                    success: false,
                    message: "Verification link has expired. Please register again.",
                    showToast: true,
                    toastType: 'error'
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid verification link",
                showToast: true,
                toastType: 'error'
            });
        }
        console.log("Bruh3");
        // Update user verification status
        console.log("user:", user);

        user.isEmailVerified = true;
        console.log("Bruh4");
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        // Finalize registration
        const userCopy = user.toObject();
        console.log("userCopy: ", userCopy);

        await user.deleteOne();
        await finalRegistrationAfterVerification(userCopy, res);

    }  catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during verification",
            showToast: true,
            toastType: 'error'
        });
    }
};

const finalRegistrationAfterVerification = async (userObject, res) => {
    
    try {
        await TeacherUserModel.registerTeacherFaculty(userObject);

        // Create root folder structure
        const rootFolderPath = path.join(userObject.folderPath, 'Root').replace(/\\/g, '\\\\');
        const rootFolder = new FolderModel({
            name: 'Root',
            parentFolder: null,
            path: rootFolderPath,
            owner: userObject._id,
            isShared: true
        });
        await rootFolder.save();

        // Create physical directory
        const absoluteRootPath = path.join(TeacherFolderDir, rootFolderPath);
        await fs.mkdir(absoluteRootPath, { recursive: true });

        // Send success email
        await EmailUtils.sendSuccessEmail(userObject.email, userObject.username);

        // Generate auth token
        const token = createToken(userObject._id);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            userObject,
            rootFolder,
            token
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during verification"
        });
    }
};

//get userObject info
const getUser = async (req, res) => {
    const id = req.user.id
    try {
        const user = await TeacherUserModel.find({ _id: id })
        res.status(200).json({ user: user[0] })
    } catch (error) {
        res.status(502).json({ message: error.message })
    }
}
export { loginUser, verificationBeforeRegister, getUser, verifyEmail }
