const express = require('express');
const {handleUserSignupAndOTP, handleUserLogin, handleOTPVerification, handlerUserProfile} = require('../controllers/user');
const router = express.Router();

router.post("/signup", handleUserSignupAndOTP);
router.post("/login", handleUserLogin);
router.post("/verify-otp", handleOTPVerification)
router.get("/signup", (req,res)=>{return res.render("signup")});
router.get("/login", (req,res)=>{return res.render("login")});

module.exports = router;