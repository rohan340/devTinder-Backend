const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User")
const profileRoutes = express.Router();
const {userAuth} = require("../middlewares/auth");
const { validateRequesAllowedFields } = require("../utils/validation");

profileRoutes.get("/profile", userAuth, async(req, res)=>{
    try{
        const user = req.user;
        res.json({
            message:"User Profile",
            data: user,
        })
    }
    catch(error){
        res.status(400).send("ERROR " + error.message )
    }
    
});

profileRoutes.patch("/profile/edit", userAuth, async(req, res)=>{
    try{
        // Check Profile Edit Request Fields 
        const allowedFields = ["firstName", "lastName", "age", "gender"];
        if(!validateRequesAllowedFields(req, allowedFields)) throw new Error("Invalid Request");

        const { firstName, lastName, age, gender} = req.body;
        const loggedInUser = req.user;

        Object.keys(req.body).forEach(key=>loggedInUser[key] = req.body[key]);
        await loggedInUser.save();
        
        res.status(400).json({
            success: "User updated Successfully.",
            data: loggedInUser
        })
    }
    catch(error){
        res.status(400).json({"ErrorMessage: ": error.message})
    }
})

module.exports = profileRoutes;