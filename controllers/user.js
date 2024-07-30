const { User, OTP } = require('../models/user');
const otpGenerator = require('otp-generator');
const handleSendEmail = require('../utils/sendMail');
const jwt = require('jsonwebtoken');

async function handleUserSignupAndOTP(req, res) {
    const { name, email, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).render("signup", { message: "User email already exists" });
        } else {

            const otp = otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false
            });

            await OTP.create({ email, otp });

            const subject = 'Your One-Time Password (OTP)'
            const text = `OTP: ${otp}` 

            handleSendEmail(email, subject, text)

            const payload = {
                email, name, password
            }

            const token = jwt.sign(payload, process.env.SECRET)

            req.session.token = token;

            return res.status(200).render("verify-otp");
        }

    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).render("signup", { error: "Email already exists. Please use a different email." });
        }

        console.error('Error creating user:', error);
    }
};

async function handleResendOTP(req, res) {
    const { email } = req.session;
    try {
        const existingOTP = await OTP.findOne({ email });

        if (!existingOTP) {
            return res.status(404).render("verify-otp", { error: "No OTP found. Please sign up again." });
        }

        const otpExpirationTime = 5 * 60 * 1000;
        const currentTimestamp = Date.now();

        if (currentTimestamp - existingOTP.createdAt.getTime() > otpExpirationTime) {
            const newOTP = otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false
            });

            existingOTP.otp = newOTP;
            existingOTP.createdAt = new Date();
            await existingOTP.save();

            const subject = 'Resent OTP Verification'
            const text = `Your new OTP for verification is: ${newOTP}`

            handleSendEmail(email, subject, text);

            return res.status(200).render("verify-otp", {
                message: "New OTP has been sent. Please check your email."
            });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
    }
};

async function handleOTPVerification(req, res) {
    const { otp } = req.body;
    const token = req.session.token;

    const decoded = jwt.verify(token, process.env.SECRET);

    const { email, name, password } = decoded;

    try {
        const otpRecord = await OTP.findOne({ email, otp }).exec();

        if (otpRecord) {
            res.status(200).render('otp-success', { message: 'OTP verified successfully. Redirecting to login page...' });

        } else {
            res.status(400).send("Invalid OTP. Please try again.");
        }

        await User.create({
            name,
            email,
            password,
        });

        req.session.token = null;

    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying OTP');
    }
};

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    console.log(`${email} is trying to login | ${new Date(Date.now()).toLocaleString()}`);

    try {
        const token = await User.matchUserProvidedPassword(email, password);

        console.log(`${email} is logged in | ${new Date(Date.now()).toLocaleString()}`);

        res.cookie("uid", token);
        return res.redirect("/");
    } catch (error) {
        console.error('Error: logging in user:', error);
        if (error.message === 'Invalid email or password') {
            return res.status(401).render('login', { message: "Invalid email or password" });
        } else if (error.message === 'PasswordNotMatched') {
            return res.status(400).render('login', { message: "Incorrect Password" });
        } else {
            return res.status(500).render('login', { message: "Internal Server Error. Please try again later." });
        }
    }
};

async function handlerUserProfile(req, res) {
    const { newName } = req.body;

    try {
        const { email } = req.user;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found");
        }

        user.name = newName;

        await user.save();
        return res.render("userProfile", {
            message: "Profile updated",
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred while updating the profile");
    }
};

module.exports = {
    handleUserSignupAndOTP,
    handleResendOTP,
    handleOTPVerification,
    handleUserLogin,
    handlerUserProfile
}