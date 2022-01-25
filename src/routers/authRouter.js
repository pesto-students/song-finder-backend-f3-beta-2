const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const { SendEmail } = require("../utils/sendEmail/sendEmail");

router.post("/", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(200).json({
            success: false,
            message: "Please provide all necessary fields.",
            data: {}
        });
    }
    if (password.length < 8) {
        return res.status(200).json({
            success: false,
            message: "Password length has to be atleast of 8 characters",
            data: {}
        });
    }
    if (password !== confirmPassword) {
        return res.status(200).json({
            success: false,
            message: "Password didn't match",
            data: {}
        });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.json({
            success: false,
            message: "User with this email id already exists",
            data: {}
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName,
        lastName,
        email,
        passwordHash
    });
    const savedUser = await newUser.save();

    const token = jwt.sign(
        {
            user: savedUser._id
        },
        process.env.JWT_SECRET
    );

    return res
        .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        .json({
            success: true,
            message: "Successfully Registered",
            data: { firstName, lastName, email }
        });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(200).json({
            success: false,
            message: "Email or Password is missing",
            data: {}
        });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.json({
            success: false,
            message: "Wrong Email Id or Password",
            data: {}
        });
    }

    const matchPassword = await bcrypt.compare(
        password,
        existingUser.passwordHash
    );
    if (!matchPassword) {
        return res.json({
            success: false,
            message: "Wrong Email Id or Password",
            data: {}
        });
    }

    const token = jwt.sign(
        {
            user: existingUser._id
        },
        process.env.JWT_SECRET
    );
    return res
        .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        .json({
            success: true,
            message: "Successfully Logged In",
            data: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            }
        });
});

router.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        expires: new Date(0),
        sameSite: "none"
    }).send();
});

router.get("/loggedin", (req, res) => {
    const { cookies } = req;
    const { token } = cookies;

    if (!token) {
        return res.json(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
        return res.json(false);
    }

    return res.json(true);
});

router.post("/forgot", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({
            succes: false,
            message: "User with this email address doesn't exist"
        });
    }
    const randomBytes = crypto.randomBytes(20);
    const token = randomBytes.toString("hex");
    const expiry = Date.now() + 3600000;

    await User.updateOne({ email }, { resetToken: token, resetExpire: expiry });
    try {
        await SendEmail({ email, token, expiry });
        return res.json({
            success: true,
            message: "Password Reset Email has been sent"
        });
    } catch (err) {
        return res.json({
            success: false,
            message: err.message
        });
    }
});

router.post("/reset/:token", async (req, res) => {
    const { password, confirmPassword } = req.body;
    const user = await User.findOne({
        resetToken: req.params.token,
        resetExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.json({
            success: false,
            message: "Reset link is invalid or expired. Generate a new one."
        });
    }

    if (password.length < 8) {
        return res.status(200).json({
            success: false,
            message: "Password length has to be atleast of 8 characters"
        });
    }

    if (password !== confirmPassword) {
        return res.status(200).json({
            success: false,
            message: "Password didn't match"
        });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetToken = undefined;
    user.resetExpire = undefined;

    try {
        await user.save();
        return res.json({
            success: true,
            message:
                "Password has been successfully reset. Please log in to continue."
        });
    } catch (err) {
        return res.json({
            success: false,
            message: "Couldn't reset password. Please try again."
        });
    }
});

exports.AuthRouter = router;
