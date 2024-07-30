const { User } = require('../models/user');
const { getUser } = require('../service/auth');

async function restrictToLoggedInUserOnly(req, res, next) {
    const userUid = req.cookies.uid;

    if (!userUid) return res.redirect("/user/login");

    const TokenUser = getUser(userUid);
    
    if (!TokenUser) return res.redirect("/user/login")

    const user = await User.findOne({ email: TokenUser.email });
    
    req.user = user;
    next();
};

module.exports = {
    restrictToLoggedInUserOnly,
}