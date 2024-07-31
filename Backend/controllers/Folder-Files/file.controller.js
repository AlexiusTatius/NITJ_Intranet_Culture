import FolderModel from '../../models/File-Folder/Folder.model.js';
import FileModel from '../../models/File-Folder/File.model.js';
import { isValidObjectId } from 'mongoose';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { unlink } from 'fs/promises';
import path from 'path';
import { TeacherFolderDir } from '../../config.js';


const uploadFile = async (req, res) => {
  try{
    const { folderId } = req.params;
    const userObject = req.user // Assume user is authenticated and available in req.user 
                            //req.user is an object that contains the user information
    
    const userId = userObject._id;

    if (!isValidObjectId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    const folder = await FolderModel.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (let file of req.files) {
      const filePath = path.join(folder.path, file.filename).replace(/\\/g, '\\\\');
      const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
      
      console.log("nameWithoutExt", nameWithoutExt);
      const newFile = new FileModel({
        name: nameWithoutExt,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        storageLocation: file.path, // Full path where the file is stored
        parentFolder: folderId,
        owner: userId,
        createdBy: userId,
        lastModifiedBy: userId
      });

      try {
        await newFile.save();
        uploadedFiles.push(newFile);
      } catch (saveError) {
        if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.parentFolder && saveError.keyPattern.name) {
          // Duplicate file detected
          // await unlink(file.path); // Delete the uploaded file
          return res.status(409).json({
            error: 'Duplicate file',
            message: `A file with the name "${file.originalname}" already exists in this folder.`
          });
        } else {
          // If it's not a duplicate error, re-throw it to be caught by the outer catch block
          throw saveError;
        }
      }
    }
    
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch(error){
    console.error('Error uploading files:', error);
    // If an error occurs, try to delete any files that were uploaded
    if (req.files) {
      for (let file of req.files) {
        try {
          await unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file after failed upload:', unlinkError);
        }
      }
    }
    res.status(500).json({ error: 'An error occurred while uploading files' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userObject = req.user; // Assume user is authenticated and available in req.user
    const userId = userObject._id;

    console.log("The fileId is: ", fileId);
    console.log("The userId is: ", userId);
    console.log("The userObject is: ", userObject);

    if (!isValidObjectId(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    
    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    console.log("The file is: ", file);
    if (!file) {
      return res.status(404).json({ error: 'File not found, Maybe it doesn\'t exist' });
    }
    // Delete the file from storage
    const absoluteFilePath = path.join(TeacherFolderDir, file.path);

    try {
      await unlink(absoluteFilePath);
    } catch (unlinkError) {
      console.error('Error deleting file from storage:', unlinkError);
      return res.status(500).json({ error: `Error deleting file ${file.name} from storage` });
    }

    // Delete the file document from the database.
    await FileModel.deleteOne({ _id: fileId });

    res.status(200).json({ message: `File ${file.name} deleted successfully` });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'An error occurred while deleting the file' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userObject = req.user; // Assume user is authenticated and available in req.user
    const userId = userObject._id;

    if (!isValidObjectId(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const absoluteFilePath = path.join(TeacherFolderDir, file.path);
    // Get file stats (including size)
    const fileStat = await stat(absoluteFilePath);

    var fileExtension;
    if (file.mimeType === 'application/pdf'){
      fileExtension = ".pdf";
    }else if(file.mimeType === 'application/msword'){
      fileExtension = ".doc"
    } else if(file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      fileExtension = ".docx"
    }

    const fileNameWithExtension = `${file.name}${fileExtension}`;


    // Set headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileNameWithExtension}"`);
    res.setHeader('Content-Length', fileStat.size);

    // Create a read stream and pipe it to the response
    const fileStream = createReadStream(absoluteFilePath);
    fileStream.pipe(res);

    // Handle potential errors during streaming
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });

    // Optional: Update last accessed time
    file.updatedAt = new Date();
    await file.save();

  } catch (error) {
    console.error('Error downloading file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred while downloading the file' });
    }
  }
};

export {uploadFile, deleteFile, downloadFile};