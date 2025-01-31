const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/ConnectionRequest");
const userRoutes = express.Router();
const User = require("../models/User")

// Get All pending connections
userRoutes.get("/user/requests", userAuth, async(req, res)=>{
    try{
        const data = await ConnectionRequest.find({
            toUserId: req.user._id,
            status: "interested"
        }).populate(
            "fromUserId",
            "firstName lastName photoUrl age gender"
        );

        res.json({
            message: "User Requests List.",
            data
        });
    }
    catch(error){
        throw new Error(error.message)
    }
});

// Get all accepted connections
userRoutes.get("/user/connections", userAuth, async(req, res)=>{
    try{
        const userId = req.user._id;
        const acceptedConnections = await ConnectionRequest.find({
            $or:[
                { fromUserId: userId, status: 'accepted'},
                { toUserId: userId, status: 'accepted'}
            ]
        }).populate("fromUserId", "firstName lastName age gender skills")
        .populate("toUserId", "firstName lastName age gender skills");

        const data = acceptedConnections.map((row) =>{
            if(row.fromUserId._id.toString() === userId.toString()){
                return row.toUserId
            }
            return row.fromUserId
        });

        res.json({ 
            message: "Accepted Connections of " + req.user.firstName +" "+ req.user.lastName,
            data
        })

    }
    catch(error){
        res.status(400).json({
            message: error.message
        })
    }
});

//Get all User profiles
userRoutes.get("/user/feed", userAuth, async(req, res)=>{
    try{
        const uid = req.user._id;
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = ( page -1 ) * limit;

        // Find connection requests where the user is either the sender or receiver
        const conectionRequests = await ConnectionRequest.find({
            $or:[
                { fromUserId: uid,},{toUserId: uid}
            ]
        }).select("fromUserId toUserId");

        // Extract IDs of the connected users
        const connectedUserIds = conectionRequests.reduce((ids, row) => {
            const otherUserId = row.fromUserId.toString() === uid.toString() ? row.toUserId : row.fromUserId;
            ids.push(otherUserId);
            return ids;
        }, [uid]);

        // Find users not in the connectedUserIds array
        const users = await User.find({
            _id:{ $nin: connectedUserIds}
        }).select("firstName lastName emailId age gender about").skip(skip).limit(limit);
    
        res.json({ users })
    }
    catch(error){
        res.status(400).json({ errorMessage: error.message})
    }
})


module.exports = userRoutes;