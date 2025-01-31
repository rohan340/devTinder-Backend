const validator = require("validator");

const validateSignUpData = (req)=>{
    const { firstName, lastName, emailId, password } = req.body;

    if(!firstName || !lastName){
        throw new Error("First Name or Last name is required.")
    }

    if(!validator.isEmail(emailId)){
        throw new Error("Email Id is invalid.")
    }

    if(!validator.isStrongPassword(password)){
        throw new Error("Password is not valid.")
    }
} 

const validateSigninData = (req)=>{
    const { emailId, password } = req.body;

    if(!emailId || !password){
        throw new Error("Please enter emailid or password.")
    }

    else if(!validator.isEmail(emailId)){
        throw new Error("Email Id is invalid.")
    }
}

const validateRequesAllowedFields = (req, allowedFields)=>{
    const isEditAllowed = Object.keys(req.body).every(field => allowedFields.includes(field));
    return isEditAllowed;
}
module.exports = {
    validateSignUpData,
    validateSigninData,
    validateRequesAllowedFields
};