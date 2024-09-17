import cors from 'cors';
import express from 'express';
import dotenv from "dotenv"
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
// import uploadRoutes from './routes/uploads.route.js';
import TeacherUserRoute from './routes/UserRoutes/TeacherUser.route.js'
import StudentUserRoute from './routes/UserRoutes/StudentUser.route.js'
import forgotPasswordRoute from './routes/UserRoutes/forgotPassword.route.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App config
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express()
const port = process.env.PORT || 8000
mongoose.set('strictQuery', true);


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
app.use("/api/user/Teacher", TeacherUserRoute)
app.use("/api/user/Student", StudentUserRoute)
app.use("/api/user/forgotPassword", forgotPasswordRoute)
// app.use("/api/uploads", uploadRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

