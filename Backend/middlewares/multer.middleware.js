import util from 'util';
import multer from 'multer';
import User from '../models/user.model.js';
const maxSize = 2 * 1024 * 1024;

const setDestination = async (req, file, cb) => {
  try {
    // Get the username of the logged-in user (e.g., 'Alice')
    const loggedInUsername = req.user.username; // Assuming username is stored in req.user.username

    // Find the user document corresponding to the logged-in username
    const user = await User.findOne({ name: loggedInUsername });

    if (!user) {
      throw new Error('User not found');
    }

    // Use the folderPath from the user document as the destination path
    const destinationPath = __basedir + '/TeacherFolders/' + user.folderPath + '/';

    cb(null, destinationPath);
  } catch (error) {
    cb(error);
  }
};

let storage = multer.diskStorage({
  destination: setDestination,
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

export default uploadFileMiddleware;
