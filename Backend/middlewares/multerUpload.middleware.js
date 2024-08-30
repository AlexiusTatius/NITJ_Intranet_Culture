import FolderModel from '../models/File-Folder/Folder.model.js';
import FileModel from '../models/File-Folder/File.model.js';
import { TeacherFolderDir } from '../config.js';
import multer from 'multer';
import { diskStorage } from 'multer';
import path from 'path';

// Configure multer for file upload
const storage = diskStorage({
  destination: async (req, file, cb) => {
    const { parentFolderId } = req.params;
    try {
      const folder = await FolderModel.findById(parentFolderId)
      if (!folder) {
        return cb(new Error('Folder not found'));
      }
      const folderPath = path.join(TeacherFolderDir, folder.path);
      cb(null, folderPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
    try {
      const fileExists = await FileModel.findOne({ parentFolder: req.params.parentFolderId, name: nameWithoutExt });
      const folder = await FolderModel.findById(req.params.parentFolderId)
      if (fileExists) {
        return cb(new Error(`A file with the name \"${nameWithoutExt}\" exists in the ${folder.name}`), false);
      } else {
        cb(null, file.originalname);
      }

    } catch (error) {
      cb(err, false);
    }
    cb(null, file.originalname);
  }
});

// Configure multer for file upload
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
    console.log("middleware crossed");
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // The file size could be up to 10MB
    files: 2 // The number of files could be up to 2
  }
}).array('files', 2);  // The name of the field in the form data is 'files' and the maximum number of files is 2. // VERY IMPORTANT.

// Error handler for file upload
const fileUploadErrorHandler = (error, req, res, next) => {
  if (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size should not exceed 10MB' });
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Maximum of 2 files can be uploaded at a time' });
      }
    } else {
      console.log("middleware error crossed");
      return res.status(409).json({ error: error.message });
    }
  }
  next();
}

export { uploadMiddleware, fileUploadErrorHandler };
