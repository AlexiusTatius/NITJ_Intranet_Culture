import cors from 'cors';
import express from 'express';
import dotenv from "dotenv"
import mongoose from 'mongoose';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// import uploadRoutes from './routes/uploads.route.js';
import TeacherUser from './routes/TeacherUser.route.js'
import StudentUser from './routes/StudentUser.route.js'
import forgotPasswordRouter from './routes/forgotPassword.route.js'

// App config
dotenv.config()
const app = express()
const port = process.env.PORT || 8000
mongoose.set('strictQuery', true);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
global.__basedir = __dirname;

//db config
mongoose.connect(process.env.MONGO_URI)  // Here I don't have to specify the database name, it will be created automatically
                                         // I want to keep the password safe.


// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.urlencoded({ extended: true }));



// API Endpoints
app.use("/api/user/Teacher", TeacherUser)
app.use("/api/user/Student", StudentUser)
app.use("/api/forgotPassword", forgotPasswordRouter)
// app.use("/api/uploads", uploadRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

