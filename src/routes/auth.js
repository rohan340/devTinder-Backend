const express = require("express");
const { validateSignUpData, validateSigninData } = require("../utils/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const authRoutes = express.Router();

authRoutes.get("/", async(req, res)=>{
    res.send("App Started !!") 
});

authRoutes.post("/signup", async(req, res)=>{

    try{
        // Validate the data
        validateSignUpData(req);

        const { firstName, lastName, emailId, password, age, gender } = req.body;

        // Encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            gender,
            age
        });

        const data = await user.save();
        
        res.status(200).json({
            message: "User Added Succesfully !!",
            data
        })
    }
    catch(error){
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: "Email ID already exists. Please use a different email." });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

authRoutes.post("/login", async(req, res)=>{

    try{
        // validate the data
        validateSigninData(req);
        const { emailId, password } = req.body;

        // Check If Email Id exist
        const user = await User.findOne({ emailId : emailId});
        if(!user) return res.status(400).json({errorMessage: "Email Id does not exist."})

        // Check If Password is correct
        const validatePassword = await user.validatePassword(password)
        if(!validatePassword) return res.status(400).json({errorMessage: "Password is invalid. Please Try Again"})
        
        // Create JWT Token
        const jwtToken = await user.getJWTToken()

        // Set JWT Token in Cookie
        res.cookie("token", jwtToken, {
            expires: new Date(Date.now() + 8 * 3600000)
        })

        res.status(200).json({
            success:"User Login successfull.",
            token: jwtToken
        })
        
    }
    catch(error){
        res.status(400).json({errorMessage: error.message})
    }

});

authRoutes.post("/logout", async(req, res)=>{
    res.cookie("token", null, {
        expires: new Date(Date.now())
    }).send("User Logout Successfully.")
})

module.exports = authRoutes;