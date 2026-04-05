const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecretKey = "kurofwiu98347uriuy";
const fetchUser = require("../middleware/fetchUser");

// to register user created enpoint '/api/auth/register' : POST : token not required
router.post('/register', [body("name", "enter valid name").isLength(3), body("email", "enter valid email").isEmail(), body("password", "enter password of atleast 5 characters").isLength(5)] , async (req, res) => {
    console.log(req.body);
    
    // if validation not matched then will send error object as response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // if all validation works fine will save to DB and send success response
    // if any error with get catch through catch
    try{
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(req.body.password, salt);

        const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        });

        const token = jwt.sign({ id: user.id }, jwtSecretKey);
        res.json(token);

    } catch(error) {
        console.log(error);
        if(error.errorResponse.code === 11000) {
            return res.status(400).json("Already registered");
        }
        res.status(500).json("Internal Server Error");
    }
})


// to login user created enpoint '/api/auth/login' : POST : token not required
router.post('/login', [body("email", "enter valid email").isEmail(), body("password", "enter valid password").exists()] , async (req, res) => {

    // if validation not matched then will send error object as response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        // checking email present in DB
        const user = await User.findOne({email: req.body.email});
        console.log(user)
        if(!user) {
            return res.status(400).json("Please enter valid credentials");
        }

        // checking entered password is matching with DB password
        const comparePassword = await bcrypt.compare(req.body.password, user.password);
        if(!comparePassword) {
            return res.status(400).json("Please enter valid credentials");
        }

        // after all success generating token for login
        const token = jwt.sign({ id: user.id }, jwtSecretKey);
        res.json(token);

    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})


// to get user created enpoint '/api/auth/getuser' : POST : token required
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        const userId = req.user;
        console.log("fetched user details : ", userId);

        const user = await User.findById(userId).select("-password");
        res.json(user);
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDE0MDJiYmUzYmZhN2YwZmY5MzMyYyIsImlhdCI6MTc3NTMyMTEzMX0.80oD_UnHR34JhVQ0Ew0zB6MKd5o7OkmfSQTbqt2CVt4
module.exports = router