import express from 'express';
import requireAuth from '../../middlewares/requireAuth.middleware.js';
import {uploadMiddleware, fileUploadErrorHandler} from '../../middlewares/multerUpload.middleware.js';
import {createFolder, deleteFolder, renameFolder} from '../../controllers/Folder-Files/folder.controller.js'
import {uploadFile, deleteFile, downloadFile} from '../../controllers/Folder-Files/file.controller.js';
const router = express.Router()

router.post("/createFolder", requireAuth, createFolder);
router.delete("/deleteFolder/:folderId", requireAuth, deleteFolder);
router.put("/renameFolder/:folderId", requireAuth, renameFolder);

router.post("/uploadFile/:folderId", requireAuth, uploadMiddleware, fileUploadErrorHandler, uploadFile);
router.delete("/deleteFile/:fileId", requireAuth, deleteFile);
router.get("/downloadFile/:fileId", requireAuth, downloadFile);

export default router;  