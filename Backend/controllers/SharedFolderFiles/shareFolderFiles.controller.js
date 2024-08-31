import FolderModel from '../../models/File-Folder/Folder.model.js';
import FileModel from '../../models/File-Folder/File.model.js';
import { isValidObjectId } from 'mongoose';

const escapeRegExp = (string) => {
  return string.replace(/[*+?^${}()|[\]\\]/g, '\\$&');
};

// 1. Share Folder Function
const  shareFolderFxn = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userObject = req.user;
    const userId = userObject._id;

    if (!isValidObjectId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    const folder = await FolderModel.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folderPathRegex = escapeRegExp(folder.path);

    // Update the folder and all its subfolders
    await FolderModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${folderPathRegex}(\\\\|$)` }
      },
      { 
        $set: { 
          isShared: true,
          updatedAt: new Date()
        }
      }
    );

    // Update all files within the folder
    await FileModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${folderPathRegex}(\\\\|$)` }
      },
      { 
        $set: { 
          isShared: true,
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({ message: 'Folder and its contents shared successfully' });
  } catch (error) {
    console.error('Error sharing folder:', error);
    res.status(500).json({ error: 'An error occurred while sharing the folder' });
  }
};

// 2. Share File Function
const shareFileFxn = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userObject = req.user;
    const userId = userObject._id;

    if (!isValidObjectId(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.isShared = true;
    file.updatedAt = new Date();
    await file.save();

    res.status(200).json({ message: 'File shared successfully' });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ error: 'An error occurred while sharing the file' });
  }
};

// 3. Unshare Folder Function
const unshareFolderFxn = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userObject = req.user;
    const userId = userObject._id;

    if (!isValidObjectId(folderId)) {
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    const folder = await FolderModel.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folderPathRegex = escapeRegExp(folder.path);

    // Update the folder and all its subfolders
    await FolderModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${folderPathRegex}(\\\\|$)` },
        isShared: true // Only update folders that are currently shared
      },
      { 
        $set: { 
          isShared: false,
          updatedAt: new Date()
        }
      }
    );

    // Update all files within the folder
    await FileModel.updateMany(
      { 
        owner: userId,
        path: { $regex: `^${folderPathRegex}(\\\\|$)` },
        isShared: true // Only update files that are currently shared
      },
      { 
        $set: { 
          isShared: false,
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({ message: 'Folder and its contents unshared successfully' });
  } catch (error) {
    console.error('Error unsharing folder:', error);
    res.status(500).json({ error: 'An error occurred while unsharing the folder' });
  }
};

// 4. Unshare File Function
const unshareFileFxn = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userObject = req.user;
    const userId = userObject._id;

    if (!isValidObjectId(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await FileModel.findOne({ _id: fileId, owner: userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.isShared) {
      file.isShared = false;
      file.updatedAt = new Date();
      await file.save();
    }

    res.status(200).json({ message: 'File unshared successfully' });
  } catch (error) {
    console.error('Error unsharing file:', error);
    res.status(500).json({ error: 'An error occurred while unsharing the file' });
  }
};

const getSharedStructure = async (req, res) => {
  try {
    const userId = req.user._id;
    const { folderId } = req.params;

    let targetFolder; 
    // root folder must be shared by default, else it's inner subfolder could never be fetched.
    
    if (folderId === 'root') {
      targetFolder = await FolderModel.findOne({ isShared: true, owner: userId, parentFolder: null }).lean();
    } else {
      if (!isValidObjectId(folderId)) {
        return res.status(400).json({ error: 'Invalid folder ID' });
      }
      targetFolder = await FolderModel.findOne({ isShared: true, owner: userId, _id: folderId }).lean();
    }

    if (!targetFolder) {
      return res.status(404).json({ error: 'Shared folder not found' });
    }

    // Get all shared subfolders of the target folder
    const subFolders = await FolderModel.find({ 
      isShared: true,
      owner: userId, 
      path: { $regex: `^${escapeRegExp(targetFolder.path)}(\\\\|$)` }
    }).lean();

    // Get all shared files in the target folder
    const files = await FileModel.find({ 
      isShared: true,
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

    res.status(200).json({ sharedStructure: rootFolder });
  } catch (error) {
    console.error('Error fetching shared structure:', error);
    res.status(500).json({ error: 'An error occurred while fetching the shared structure' });
  }
};

export { shareFolderFxn, shareFileFxn, unshareFolderFxn, unshareFileFxn, getSharedStructure };