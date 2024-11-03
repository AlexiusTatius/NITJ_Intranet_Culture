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
    const { username, email, password, departmentName } = req.body;
    console.log(req.body);
    try {
        //check if user already exists
        const exists = await TeacherUserModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (validator.isEmpty(username) || validator.isEmpty(email) || validator.isEmpty(password) || validator.isEmpty(departmentName)) {
            return res.status(400).json({ message: "Please enter all fields" })
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
        const emailSent = await EmailUtils.sendVerificationEmail(email, verificationToken, departmentId, username);
        
        if (!emailSent.success) {
            // If email fails, delete the user and return error
            await TeacherUserModel.findByIdAndDelete(user._id);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send verification email" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Registration initiated. Please check your email to verify your account.",
            verificationPending: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { departmentId, userEmail, emailVerifyToken } = req.query;
        
        const user = await TeacherUserModel.findOne({
            verificationToken: emailVerifyToken,
            verificationTokenExpires: { $gt: Date.now() },
            isEmailVerified: false
        });

        if (!user) {
            const expiredTokenUser = await TeacherUserModel.findByDepartmentAndEmail({ departmentId, email: userEmail });
            // delete the user if verification token is invalid or expired
            if(expiredTokenUser) {
                // delete the user
                await expiredTokenUser.deleteOne();
                console.log('User deleted:', expiredTokenUser);
            }
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        // Update user verification status
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        // Finalize registration
        await user.deleteOne();
        await finalRegistrationAfterVerification(user);

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during verification"
        });
    }
};

const finalRegistrationAfterVerification = async (userObject) => {
    
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

        // Create physical directory
        const absoluteRootPath = path.join(TeacherFolderDir, rootFolderPath);
        await fs.mkdir(absoluteRootPath, { recursive: true });

        // Save everything
        await Promise.all([
            user.save(),
            rootFolder.save()
        ]);

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
