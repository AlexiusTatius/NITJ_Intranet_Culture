import express from 'express';
import requireAuth from '../../middlewares/requireAuth.middleware.js';
import studentPublicViewMiddleware from '../../middlewares/studentView.middleware.js';
import {uploadMiddleware, fileUploadErrorHandler} from '../../middlewares/multerUpload.middleware.js';
import {createFolder, deleteFolder, renameFolder, getFolderStructure} from '../../controllers/Folder-Files/folder.controller.js'
import {uploadFile, deleteFile, downloadFile, getPdfFile, renameFile} from '../../controllers/Folder-Files/file.controller.js';
import {shareFolderFxn, shareFileFxn, unshareFolderFxn ,unshareFileFxn, getSharedStructure} from '../../controllers/SharedFolderFiles/shareFolderFiles.controller.js';
import {generateUniqueShareableLink, generatePdfLink} from '../../controllers/GenerateURL/generateURL.controller.js';
const router = express.Router()

router.post("/createFolder", requireAuth, createFolder); // check
router.delete("/deleteFolder/:folderId", requireAuth, deleteFolder);
router.put("/renameFolder/:folderId", requireAuth, renameFolder); // check
router.get("/folderStructure/:folderId", requireAuth, getFolderStructure); //check

router.post("/uploadFile/:parentFolderId", requireAuth, uploadMiddleware, fileUploadErrorHandler, uploadFile); //check
router.delete("/deleteFile/:fileId", requireAuth, deleteFile); // check
router.get("/downloadFile/:fileId", requireAuth, downloadFile); 
router.get("/getPdfFile/:fileId", requireAuth, getPdfFile); //check
router.put("/renameFile/:fileId", requireAuth, renameFile);

router.put('/shareFolder/:folderId', requireAuth, shareFolderFxn);
router.put('/shareFile/:fileId', requireAuth, shareFileFxn);
router.put('/unshareFolder/:folderId', requireAuth, unshareFolderFxn);
router.put('/unshareFile/:fileId', requireAuth, unshareFileFxn);
router.get("/sharedStructure/:folderId", requireAuth, getSharedStructure);

router.get("/generateUniqueShareableLink", requireAuth, generateUniqueShareableLink);
router.get("/generatePdfLink/:fileId", requireAuth, generatePdfLink); 


router.get("/sharedStructure/:teacherEmailInitials/:folderId", studentPublicViewMiddleware, getSharedStructure);
router.get("/getPdfFile/:teacherEmailInitials/:fileId", studentPublicViewMiddleware, getPdfFile); //check


export default router;  
