import express from 'express';
import { loginUser, registerUser, getUser } from '../../controllers/User/TeacherUser.controller.js';
import TeacherFolderRoute from '../FolderRoutes/TeacherFolder.route.js'
import requireAuth from '../../middlewares/requireAuth.middleware.js';
const router = express.Router();


router.post("/login",loginUser);
router.post("/register",registerUser);
router.get("/getuser", requireAuth, getUser)   // don't know about this one might have to delete

router.use("/file-folder",TeacherFolderRoute);
export default router;

    