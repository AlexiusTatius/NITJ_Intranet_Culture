import fs from 'fs/promises';
import path from 'path';
import TeacherUserModel from "../../models/users/TeacherUser.model.js";
import FolderModel from '../../models/File-Folder/Folder.model.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { TeacherFolderDir } from '../../config.js';

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
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        //check if user already exists
        const exists = await TeacherUserModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (validator.isEmpty(username) || validator.isEmpty(email) || validator.isEmpty(password)) {
            return res.status(400).json({ message: "Please enter all fields" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email" })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: "Please enter a strong password" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const relativeDirPath = path.join(`${email}-${username}`);
        
        // Saving TeacherUser in database 
        const newUser = new TeacherUserModel({ username, email, password: hashedPassword, folderPath: relativeDirPath });
        const user = await newUser.save();
        const token = createToken(user._id);

        // Saving Folder in database
        const rootFolderPath = path.join(relativeDirPath, 'Root').replace(/\\/g, '\\\\');
        // root folder should always be shared by default, else none of the inner subfolders could be fetched.
        const rootFolder = new FolderModel({
            name: 'Root',
            parentFolder: null,
            path: rootFolderPath,
            owner: user._id,
            isShared: true
        });
        await rootFolder.save();

        // Creating directory for user
        const absoluteRootPath = path.join(TeacherFolderDir, rootFolderPath);
        try {
            await fs.mkdir(absoluteRootPath, { recursive: true });
        } catch (error) {
            throw new Error(`Could not create directory for user: ${error.message}`);
        }
        res.status(200).json({ success: true, user, rootFolder ,token, message: "User registered successfully"})

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//get user info
const getUser = async (req, res) => {
    const id = req.user.id
    try {
        const user = await TeacherUserModel.find({ _id: id })
        res.status(200).json({ user: user[0] })
    } catch (error) {
        res.status(502).json({ message: error.message })
    }
}
export { loginUser, registerUser, getUser }
