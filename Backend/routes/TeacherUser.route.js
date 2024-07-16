import express from 'express';
import { loginUser, registerUser,getUser } from '../controllers/TeacherUser.controller.js';
import requireAuth from '../middlewares/requireAuth.middleware.js';
const router = express.Router();

router.post("/login",loginUser);
router.post("/register",registerUser);
router.get("/getuser", requireAuth, getUser)

export default router;