import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
    index: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  path: {
    type: String,
    required: true,
    unique: true
  },
  storageLocation: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherUser',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
FileSchema.index({ parentFolder: 1, name: 1 }, { unique: true });

const FileModel = mongoose.model('File', FileSchema);

export default FileModel;


















////////// Below is the outdated method /////////



// import mongoose from "mongoose";

// const FileSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     path: {
//         type: String,
//         required: true
//     },
//     folder: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Folder",
//         required: true
//     },
//     owner: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "TeacherUser",
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// const FileModel = mongoose.model("File", FileSchema);
// export default FileModel;
