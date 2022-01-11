const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");

router.post("/", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res
            .status(400)
            .json({ msg: "Please provide all necessary fields." });
    }
    if (password.length < 8) {
        return res.status(400).json({
            msg: "Password length has to be atleast of 8 characters"
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ msg: "Password didn't match" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res
            .status(400)
            .json({ msg: "User with this email id already exists" });
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
            // secure: true,
            sameSite: "lax"
        })
        .json({ firstName, lastName, email });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Email or Password is missing" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.status(404).json({ msg: "Wrong Email Id or Password" });
    }

    const matchPassword = await bcrypt.compare(
        password,
        existingUser.passwordHash
    );
    if (!matchPassword) {
        return res.status(404).json({ msg: "Wrong Email Id or Password" });
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
            // secure: true,
            sameSite: "lax"
        })
        .json({
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email
        });
});

router.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        // secure: true,
        expires: new Date(0),
        sameSite: "lax"
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

exports.AuthRouter = router;
