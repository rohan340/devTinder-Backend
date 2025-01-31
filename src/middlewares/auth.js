const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth  = async (req, res, next)=>{
    try{
        const { token } = req.cookies;
        if(!token) return res.status(401).send("Invalid Token, Please Login!");

        const validateToken = await jwt.verify(token, "DevTinder@%hbn9Q2")
        const { _id } = validateToken;

        const user = await User.findById(_id);
        if(!user) throw new Error("User not Found.")
            
        req.user = user;
        next();
    }
    catch(error){
        res.status(400).send("ERROR " + error.message)
    }
}

module.exports = { userAuth }