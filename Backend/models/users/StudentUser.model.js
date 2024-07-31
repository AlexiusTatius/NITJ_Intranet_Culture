import mongoose from "mongoose"

const StudentUserSchema = new mongoose.Schema({
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
})


const StudentUserModel = mongoose.model("StudentUser", StudentUserSchema);
export default StudentUserModel;