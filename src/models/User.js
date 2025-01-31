const mongoose = require("mongoose");
const validator  = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: 4,
        maxLength:12
    },
    lastName:{
        type: String,
        required: true,
        minLength: 4,
        maxLength:12
    },
    emailId:{
        type: String,
        required: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid !" + value)
            }
        }
    },
    password:{
        type:String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Please enter Strong Password.")
            }
        }
    },
    age:{
        type: Number,
        required: true,
        min: 18
    },
    gender:{
        type: String,
        required: true,
    },
    about:{
        type: String,
        default: "This default Value of User."
    },
    photoUrl:{
        type: String,
        default: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo URL." + value)
            }
        }
    },
    skills:{
        type: [String],
    }
},{
    timestamps: true
});

userSchema.index({ emailId: 1 });

userSchema.methods.validatePassword = async function(password){
    const user  = this;
    const isPasswordValid = await bcrypt.compare( password, user.password )
    return isPasswordValid;
}

userSchema.methods.getJWTToken = async function(){
    const user  = this;
    const jwtToken = jwt.sign({ _id: user._id}, "DevTinder@%hbn9Q2", {
        expiresIn: "7d"
    });
    return jwtToken;
}

module.exports = mongoose.model("User", userSchema);