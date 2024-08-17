import express from 'express';
import requireAuth from '../../middlewares/requireAuth.middleware.js';
import {uploadMiddleware, fileUploadErrorHandler} from '../../middlewares/multerUpload.middleware.js';
import {createFolder, deleteFolder, renameFolder, getFolderStructure} from '../../controllers/Folder-Files/folder.controller.js'
import {uploadFile, deleteFile, downloadFile, getPdfFile, renameFile} from '../../controllers/Folder-Files/file.controller.js';
const router = express.Router()

router.post("/createFolder", requireAuth, createFolder); // check
router.delete("/deleteFolder/:folderId", requireAuth, deleteFolder);
router.put("/renameFolder/:folderId", requireAuth, renameFolder); // check
router.get("/folderStructure/:folderId", requireAuth, getFolderStructure); //check


router.post("/uploadFile/:folderId", requireAuth, uploadMiddleware, fileUploadErrorHandler, uploadFile); //check
router.delete("/deleteFile/:fileId", requireAuth, deleteFile); // check
router.get("/downloadFile/:fileId", requireAuth, downloadFile); 
router.get("/getPdfFile/:fileId", requireAuth, getPdfFile); //check
router.put("/renameFile/:fileId", requireAuth, renameFile);

export default router;  
