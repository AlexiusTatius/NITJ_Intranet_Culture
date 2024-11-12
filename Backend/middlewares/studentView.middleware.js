import TeacherUserModel from '../models/users/TeacherUser.model.js';
import NodeCache from 'node-cache';

const teacherCache = new NodeCache({ stdTTL: 3600, checkperiod: 1200 }); // Cache for 1 hour

const studentPublicViewMiddleware = async (req, res, next) => {
    const { teacherEmailInitials } = req.params;
    const teacherEmail = `${teacherEmailInitials}${process.env.EMAIL_EXTENSION || "@gmail.com"}`;

    try {
        // Check cache first
        let teacher = teacherCache.get(teacherEmail);

        if (!teacher) {
            // If not in cache, fetch from database
            teacher = await TeacherUserModel.findOne({ email: teacherEmail }).select('-password');
            
            if (!teacher) {
                // Teacher not found hence invalid URL because either teacher does not exist or the URL is incorrect
                return res.status(404).json({ message: "Invalid URL, Teacher Not found" });
            }

            // Store in cache
            teacherCache.set(teacherEmail, teacher);
        }

        req.user = teacher;
        next();
    } catch (error) {
        console.log(error.message); 
        return res.status(500).json({ message: error.message });
    }
}

export default studentPublicViewMiddleware;