import express from "express"
import EmailUtils from '../../controllers/utils/emailUtils.js';

const router = express.Router();


router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  const result = await EmailUtils.handleForgotPassword(email);
  
  return res.status(result.success ? 200 : 400).json(result);
});

router.post("/resetPassword", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.query;
  
  const result = await EmailUtils.handleResetPassword(token, password, confirmPassword);
  
  return res.status(result.success ? 200 : 400).json(result);
});


export default router;