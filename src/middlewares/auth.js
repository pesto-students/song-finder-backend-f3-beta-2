const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");

function Auth(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res
            .status(200)
            .json({ success: false, message: "You are not Authorized!" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
        return res
            .status(200)
            .json({ success: false, message: "You are not Authorized!" });
    }
    req.user = verified.user;
    return next();
}

async function SaveSearch(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return next();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
        return next();
    }

    req.user = verified.user;
    const user = await User.findOne({ _id: verified.user });
    const previousSearches = user.get("searchHistory", { strict: false });
    const { q } = req.query;
    if (previousSearches && previousSearches[q]) {
        delete previousSearches[q];
    }
    const newSearches = { [q]: true, ...previousSearches };

    await User.updateOne({ _id: user._id }, { searchHistory: newSearches });
    return next();
}

exports.Auth = Auth;
exports.SaveSearch = SaveSearch;
