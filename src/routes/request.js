const express = require("express");
const requestRoutes = express.Router();
const {userAuth} = require("../middlewares/auth");
const { validateRequesAllowedFields } = require("../utils/validation")
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const mongoose = require("mongoose")

requestRoutes.post("/request/send/:status/:userId", userAuth, async(req, res)=>{
    try{
        const allowedStatus = ["interested", "ignore"];
        // Check Request Allowed Fields
        const allowedFields = ["fromUserId", "toUserId", "status"];
        if(!validateRequesAllowedFields(req, allowedFields)) throw new Error("Invalid Request Data");

        const fromUserId = req.user._id;
        const status = req.params.status;
        const toUserId = req.params.userId;
        
        // Check If UserId is valid 
        if(!mongoose.Types.ObjectId.isValid(toUserId)) return res.status(400).json({
            message: "User Id is invalid."
        });

        // Check User exist 
        const userExist = await User.findById(new mongoose.Types.ObjectId(toUserId));
        if(!userExist) return res.status(400).json({
            message: "User does not exist."
        });

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        // Check Request Status
        const validatRequesteStatus = await connectionRequest.validatRequesteStatus(allowedStatus,status);
        if(!validatRequesteStatus) return res.status(400).json({
            message: "Invalid Status type: " + status
        });

        // Check If there is already Connection Request
        const users = await ConnectionRequest.findOne({ 
            $or:[
                { fromUserId, toUserId},
                { fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if(users) return res.status(400).json({
            message:"Connection Request Already Sent."
        });

        // Create Connection Request
        const data = await connectionRequest.save();
        res.json({
            message: "Connection Request Send succesfully.",
            data
        })

    }
    catch(error){
        res.status(400).send("ERROR " + error.message)
    }
});

requestRoutes.post("/request/review/:status/:requestId", userAuth, async(req, res)=>{
    try{
        const allowedStatus = ["accepted", "rejected"];
        const { status, requestId} = req.params;
        const user = req.user;

        // Create a new instance
        const connectionRequest = new ConnectionRequest(); 
        const isValidStatus = await connectionRequest.validatRequesteStatus(allowedStatus, status);
        if(!isValidStatus) return res.status(400).json({message:"Invalid status: " + status})
        
        const request = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: user._id,
            status: "interested"
        });

        if(request){
            request.status = status;
            const data = await request.save();
            return res.json({message: user.firstName + " accepted your request.", data})
        }
        else{
            return res.json({errorMesage: "Connection request not found"})
        }
    }
    catch(error){
        res.status(400).json({ errorMesage: error.message})
    }
})

module.exports = requestRoutes;