const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// @desc Register a new user
// @route GET /api/v1/users/register
// @access Public

const registerUser = asyncHandler( async(req, res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("Please fill all the fields they are mandatory");
    }
    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already exists");
    }
    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    
    if(user){
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: null
        })
    }else{
        res.status(400);
        throw new Error("Invalid user data");
    }
    res.json({message: "Register the user"});
})

// @desc Login a user
// @route GET /api/v1/users/login
// @access Public

const loginUser = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill all the fields they are mandatory");
    }

    const user = await User.findOne({email});
    // compare password with hashed password
    if(user && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user._id
            },
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15M'})
        res.status(200).json({accessToken})
    } else{
        res.status(401);
        throw new Error("Invalid email or password");
    }
})

// @desc current user information
// @route GET /api/v1/users/current
// @access Private

const currentUser = asyncHandler( async(req, res) => {
    res.json(req.user);
})

module.exports = {registerUser, loginUser, currentUser};