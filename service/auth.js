const jwt = require('jsonwebtoken');
const secret = "very_secret"

function createTokenForUser(user){
    if(!user) return res.redirect("/user/login");

    return jwt.sign({email: user.email},secret)
};

function getUser(token){
    if(!token) return null;
    return jwt.verify(token, secret);
};

module.exports = {
    createTokenForUser,
    getUser
};