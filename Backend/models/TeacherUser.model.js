import mongoose from "mongoose"

const TeacherUserSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true 
    },
    email: {
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    resetToken:{
        type:String,
        required:false
    },
    folderPath: {
        type: String,
        required: true
    }

})


const TeacherUserModel = mongoose.model("TeacherUser", TeacherUserSchema);
export default TeacherUserModel;