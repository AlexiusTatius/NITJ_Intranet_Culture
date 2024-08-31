import FolderModel from '../../models/File-Folder/Folder.model.js';
import FileModel from '../../models/File-Folder/File.model.js';
import { isValidObjectId } from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { TeacherFolderDir } from '../../config.js';

// There will always be a parent folder ( root folder ) for each user, in this case the root folder
// will be Root_All_Files folder inside the Teacher's email address folder.

// Function to create a new folder
const createFolder = async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;
    const userObject = req.user; // Assume user is authenticated and available in req.user

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    let parentFolder = null;
    let folderPath = name;
    let folderShared = false;
    // Since all the folders will always be created inside the root folder of the user, the parentFolderId
    // can never be null for the rest of the folder except for the root folder.
    if (parentFolderId) {
      if (!isValidObjectId(parentFolderId)) {
        return res.status(400).json({ error: 'Invalid parent folder ID' });
      }
      // This prevents one user to create folder in other user's folder.
      parentFolder = await FolderModel.findOne({ _id: parentFolderId, owner: userObject._id });
      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
      folderPath = path.join(parentFolder.path, name).replace(/\\/g, '\\\\');
    } else{
      return res.status(400).json({ error: 'Folder created outside the root folder is not allowed' });
    }
    parentFolder.isShared === true ? folderShared = true : folderShared = false;
    
    const newFolder = new FolderModel({
      name,
      parentFolder: parentFolderId,
      path: folderPath,
      owner: userObject._id,
      isShared: folderShared
    });

    // Save the folder to the database
    await newFolder.save();

    // Create the actual folder in the backend filesystem using TeacherFolderDir
    const absolutePath = path.join(TeacherFolderDir, folderPath);

    await fs.mkdir(absolutePath, {recursive: true});
    res.status(201).json(newFolder);  

  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(409).json({ error: 'A folder with this name already exists in the specified location' });
    } else {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'An error occurred while creating the folder' });
    }
  }
}

// Function to delete a folder
/*
  There could be Giant Ass error about folders and Folders and FolderModel.
*/
const escapeRegExp = (string) => {
  return string.replace(/[*+?^${}()|[\]\\]/g, '\\$&');
};

const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { confirmDelete } = req.body;
    const userObject = req.user; // Assume user is authenticated and available in req.user
    const userId = userObject._id;

    if (!isValidObjectId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    const folder = await FolderModel.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    const folderPathRegex = escapeRegExp(folder.path);

      // Check if folder is empty
      const subfolderCount = await FolderModel.countDocuments({ 
        path: { $regex: `^${folderPathRegex}(\\\\|$)` }, 
        owner: userId 
      });
      const fileCount = await FileModel.countDocuments({ 
        path: { $regex: `^${folderPathRegex}(\\\\|$)` }, 
        owner: userId 
      });
  
      const isEmpty = subfolderCount === 0 && fileCount === 0;
  
      if (!isEmpty && !confirmDelete) {
        // Folder is not empty and confirmation not received
        return res.status(409).json({
          error: 'Confirmation required',
          message: 'This folder contains subfolders or files. Confirmation required to delete.',
          subfolderCount,
          fileCount,
          requiresConfirmation: true
        });
      }
      
      const folderPath = path.join(TeacherFolderDir, folder.path);
      await fs.rm(folderPath, { recursive: true, force: true });

      // If we reach here, either the folder is empty or the user has confirmed deletion
      // Delete all subfolders
      await FolderModel.deleteMany({ path: { $regex: `^${folderPathRegex}(\\\\|$)` }, owner: userId });
      await FileModel.deleteMany({ path: { $regex: `^${folderPathRegex}(\\\\|$)` }, owner: userId });
  
  
      // Delete the folder itself
      await FolderModel.findByIdAndDelete(folderId);
  
      res.status(200).json({ message: 'Folder and its contents deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'An error occurred while deleting the folder' });
    }
}

const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newName } = req.body;
    const userObject = req.user;
    const userId = userObject._id;

    if (!isValidObjectId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'New folder name is required' });
    }

    const folder = await FolderModel.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const oldPath = folder.path;
    const parentPath = path.dirname(oldPath);
    const newPath = path.join(parentPath, newName);

    // Check if a folder with the new name already exists in the same parent folder
    const existingFolder = await FolderModel.findOne({
      owner: userId,
      parentFolder: folder.parentFolder,
      name: newName
    });

    if (existingFolder) {
      return res.status(409).json({ error: 'A folder with this name already exists in the same location' });
    }

    // Rename the physical folder
    const oldAbsolutePath = path.join(TeacherFolderDir, oldPath);
    const newAbsolutePath = path.join(TeacherFolderDir, newPath);
    console.log('Old Path:', oldAbsolutePath);
    console.log('New Path:', newAbsolutePath);

    const newFolderExists = await fs.access(newAbsolutePath).then(() => true).catch(() => false);
    if (newFolderExists) {
      return res.status(409).json({ error: 'A folder with this name already exists in the same location' });
    }
    
    const moveContents = async (src, dest) => {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });

      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await moveContents(srcPath, destPath);
        } else {
          await fs.rename(srcPath, destPath);
        }
      }
    };

    try {
      await moveContents(oldAbsolutePath, newAbsolutePath);
      await fs.rm(oldAbsolutePath, { recursive: true, force: true });
    } catch (moveError) {
      console.error('Error moving folder contents:', moveError);
      return res.status(500).json({ error: 'Unable to rename folder. An error occurred while moving contents.' });
    }

    const oldPathRegex = escapeRegExp(oldPath);
    const newPathEscaped = escapeRegExp(newPath);

    const folderObjectId = folder._id;
    // Update the folder and all its subfolders


    // Change the name of the folder.
    folder.name = newName;
    folder.updatedAt = new Date();
    await folder.save();

    await FolderModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${oldPathRegex}(\\\\|$)` }
        
      },
      [
        { 
          $set: { 
            path: {
              $concat: [
                newPathEscaped,
                { 
                  $cond: {
                    if: { $eq: ["$_id", folderId] },
                    then: "",
                    else: { $substr: ["$path", { $strLenCP: oldPath }, { $subtract: [{ $strLenCP: "$path" }, { $strLenCP: oldPath }] }] }
                  }
                }
              ]
            },
            updatedAt: new Date()
          }
        }
      ]
    );

    // Update all files within the folder
    await FileModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${oldPathRegex}(\\\\|$)` }
      },
      [
        { 
          $set: { 
            path: {
              $concat: [
                newPathEscaped,
                { $substr: ["$path", { $strLenCP: oldPath }, { $subtract: [{ $strLenCP: "$path" }, { $strLenCP: oldPath }] }] }
              ]
            },
            updatedAt: new Date()
          }
        }
      ]
    );

    res.status(200).json({ message: 'Folder renamed successfully', newPath });

  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({ error: 'An error occurred while renaming the folder' });
  }
};


const getFolderStructure = async (req, res) => {
  try {
      const userId = req.user._id;
      const { folderId } = req.params; // Assuming the folder ID is passed as a route parameter

      let targetFolder;
      if (folderId === 'root') {
          // If 'root' is specified, find the root folder for the user
          targetFolder = await FolderModel.findOne({ owner: userId, parentFolder: null }).lean();
      } else {
          // Otherwise, find the specified folder
          targetFolder = await FolderModel.findOne({ _id: folderId, owner: userId }).lean();
      }

      if (!targetFolder) {
          return res.status(404).json({ error: 'Folder not found' });
      }

      // Get all subfolders of the target folder
      const subFolders = await FolderModel.find({ 
          owner: userId, 
          path: { $regex: `^${escapeRegExp(targetFolder.path)}(\\\\|$)` }
      }).lean();

      // Get all files in the target folder
      const files = await FileModel.find({ 
          owner: userId, 
          parentFolder: targetFolder._id
      }).lean();

      // Create a map of folders by their ID for easy access
      const folderMap = new Map(subFolders.map(folder => [folder._id.toString(), { ...folder, children: [], files: [] }]));

      // Organize folders into a tree structure
      const rootFolder = folderMap.get(targetFolder._id.toString()) || { ...targetFolder, children: [], files: [] };
      subFolders.forEach(folder => {
          if (folder._id.toString() !== targetFolder._id.toString()) {
              const parentFolder = folderMap.get(folder.parentFolder.toString());
              if (parentFolder) {
                  parentFolder.children.push(folderMap.get(folder._id.toString()));
              }
          }
      });

      // Add files to the target folder
      rootFolder.files = files;

      res.status(200).json({ folderStructure: rootFolder });
  } catch (error) {
      console.error('Error fetching folder structure:', error);
      res.status(500).json({ error: 'An error occurred while fetching the folder structure' });
  }
};



export { createFolder, deleteFolder, renameFolder, getFolderStructure};
