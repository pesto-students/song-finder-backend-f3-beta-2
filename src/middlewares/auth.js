const jwt = require("jsonwebtoken");

function Auth(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ msg: "You are not authorized!" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
        return res.status(401).json({ msg: "You are not authorized!" });
    }
    req.user = verified.user;
    next();
}

exports.Auth = Auth;
