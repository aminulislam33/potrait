const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { createTokenForUser } = require('../service/auth');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    }
}, {timestamps: true});

userSchema.pre("save", async function(next){
    const user = this;

    if(!user.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);

    user.salt = salt;
    user.password = await bcrypt.hash(user.password, salt);
    next(); 
});

userSchema.static('matchUserProvidedPassword', async function (email, password) {
    try {
        const user = await this.findOne({ email });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('PasswordNotMatched');
        }

        const token = createTokenForUser(user);
        return token;

    } catch (error) {
        console.error(error);
        throw error;
    }
});

const User = mongoose.model("user", userSchema);

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, expires: 300 , default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = {
    User,
    OTP
}