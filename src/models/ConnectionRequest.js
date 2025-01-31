const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    status:{
        type: String,
        enum: {
            values: ['interested', 'ignore', 'accepted', 'rejected'],
            message: `{VALUE} is incorrect status`
        },
        require: true
    }
}, 
    { 
        timestamps: true
    }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1})

connectionRequestSchema.methods.validatRequesteStatus = async function(allowedStatus, status){
    return allowedStatus.includes(status);
}

connectionRequestSchema.pre("save", function(next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        return next(new Error("Cannot send connection request to yourself."));
    }
    next();
})

module.exports = new mongoose.model("ConnectRequest", connectionRequestSchema)

